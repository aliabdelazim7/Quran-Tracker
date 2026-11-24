import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RecitationMode,
  RecitationStatus,
  RecitationPosition,
  RecitationFinding,
  DeclaredPassageConfig,
  RecitationSessionSummary,
} from '../types/recitation';
import { TilawaEngineHandle, PreparedMicHandle, ActiveMicrophoneHandle, ActiveSessionHandle } from '../lib/tilawa-client';
import { mapPositionEvent, mapCheckerEvent, RawPositionEvent, RawCheckerEvent } from '../lib/event-mapper';

export function useRecitationSession(engine: TilawaEngineHandle | null) {
  const engineRef = useRef<TilawaEngineHandle | null>(engine);
  const [status, setStatus] = useState<RecitationStatus>('idle');
  const [mode, setMode] = useState<RecitationMode>('memorization');
  const [passageConfig, setPassageConfig] = useState<DeclaredPassageConfig | null>(null);
  const [currentPosition, setCurrentPosition] = useState<RecitationPosition | null>(null);

  // Sync ref with prop changes
  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  // Findings categorised by lifecycle
  const [confirmedFindings, setConfirmedFindings] = useState<RecitationFinding[]>([]);
  const [suspectedFindings, setSuspectedFindings] = useState<RecitationFinding[]>([]);
  const [resolvedFindings, setResolvedFindings] = useState<RecitationFinding[]>([]);
  const [uncertainCount, setUncertainCount] = useState(0);

  // Metrics
  const [audioLevel, setAudioLevel] = useState<number>(-60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wordsRecitedSet, setWordsRecitedSet] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<RecitationSessionSummary | null>(null);

  // References
  const sessionRef = useRef<ActiveSessionHandle | null>(null);
  const micRef = useRef<ActiveMicrophoneHandle | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string | null>(null);
  const unsubscribeEventsRef = useRef<(() => void) | null>(null);

  // Timer updater
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  /**
   * Starts an AI recitation session.
   */
  const startSession = useCallback(
    async (
      selectedMode: RecitationMode,
      passage?: DeclaredPassageConfig,
      preparedMic?: PreparedMicHandle | null,
      passedEngine?: TilawaEngineHandle | null
    ) => {
      const activeEngine = passedEngine || engineRef.current || engine;
      if (!activeEngine) {
        setErrorMessage('محرك التسميع الذكي غير مهيأ بعد. يرجى المحاولة مرة أخرى.');
        setStatus('error');
        return;
      }

      try {
        setStatus('preparing');
        setErrorMessage(null);
        setMode(selectedMode);
        setPassageConfig(passage || null);
        setConfirmedFindings([]);
        setSuspectedFindings([]);
        setResolvedFindings([]);
        setUncertainCount(0);
        setWordsRecitedSet(new Set());
        setElapsedSeconds(0);
        setSummary(null);

        // 1. Create Tilawa session
        let session: ActiveSessionHandle;
        if (selectedMode === 'memorization' && passage) {
          session = activeEngine.startMemorization(
            {
              surah: passage.surah,
              fromAyah: passage.fromAyah,
              toAyah: passage.toAyah,
            },
            {
              confirm: { after: 'next-word' },
            }
          );
        } else {
          session = activeEngine.startFreeRecitation({
            confirm: { after: 'next-word' },
          });
        }

        sessionRef.current = session;
        startTimeRef.current = new Date().toISOString();

        // 2. Subscribe to events
        const unsub = session.subscribe((event: any) => {
          if (event.type === 'position') {
            const pos = mapPositionEvent(event as RawPositionEvent);
            if (pos) {
              setCurrentPosition(pos);
              // Track recited word key
              const wordKey = `${pos.surah}:${pos.ayah}:${pos.word}`;
              setWordsRecitedSet((prev) => new Set(prev).add(wordKey));
            }
          } else if (event.type === 'checker') {
            const finding = mapCheckerEvent(event as RawCheckerEvent);

            if (finding.state === 'suspected') {
              setSuspectedFindings((prev) => {
                const filtered = prev.filter((f) => f.id !== finding.id);
                return [...filtered, finding];
              });
            } else if (finding.state === 'confirmed') {
              // Remove from suspected and add to confirmed
              setSuspectedFindings((prev) => prev.filter((f) => f.id !== finding.id));
              setConfirmedFindings((prev) => {
                const filtered = prev.filter((f) => f.id !== finding.id);
                return [...filtered, finding];
              });
            } else if (finding.state === 'resolved') {
              // Self-corrected: remove from suspected and add to resolved
              setSuspectedFindings((prev) => prev.filter((f) => f.id !== finding.id));
              setResolvedFindings((prev) => {
                const filtered = prev.filter((f) => f.id !== finding.id);
                return [...filtered, finding];
              });
            } else if (finding.state === 'uncertain') {
              setSuspectedFindings((prev) => prev.filter((f) => f.id !== finding.id));
              setUncertainCount((prev) => prev + 1);
            }
          }
        });

        unsubscribeEventsRef.current = unsub;

        // 3. Connect microphone
        // Resume AudioContext if browser suspended it during async setup
        if (preparedMic?.context && preparedMic.context.state === 'suspended') {
          try {
            await preparedMic.context.resume();
          } catch (e) {
            console.warn('Could not resume suspended AudioContext:', e);
          }
        }

        setStatus('requesting_mic');
        const mic = await activeEngine.listen(session, {
          prepared: preparedMic || undefined,
          onLevel: (db: number) => {
            setAudioLevel(db);
          },
          onError: (err: unknown) => {
            console.error('Microphone/Inference stream error:', err);
          },
        });

        micRef.current = mic;
        setStatus('active');
      } catch (err: any) {
        console.error('Failed to start recitation session:', err);
        setStatus('error');
        setErrorMessage(
          err?.message || 'تعذر تشغيل الميكروفون أو بدء جلسة التسميع. يرجى مراجعة الصلاحيات.'
        );
      }
    },
    [engine]
  );

  /**
   * Finalizes the current session, stops the microphone, and produces the final summary.
   */
  const stopSession = useCallback(async () => {
    if (status !== 'active') return;

    setStatus('completing');

    try {
      // 1. Stop microphone tracks
      if (micRef.current) {
        await micRef.current.stop();
        micRef.current = null;
      }

      // 2. End session and gather final events
      let finalFindings = [...confirmedFindings];
      if (sessionRef.current) {
        try {
          await sessionRef.current.end();
          const engineMistakes = sessionRef.current.mistakes() || [];
          if (engineMistakes.length > 0) {
            const mapped = engineMistakes.map((e) => mapCheckerEvent(e as RawCheckerEvent));
            finalFindings = mapped;
          }
        } catch (e) {
          console.warn('Error during session end:', e);
        }
      }

      // 3. Construct session summary
      const sessionSummary: RecitationSessionSummary = {
        id: sessionRef.current?.id || crypto.randomUUID(),
        studentId: '',
        assignmentId: passageConfig?.assignmentId || null,
        sessionMode: mode,
        surahNumber: passageConfig?.surah || currentPosition?.surah || null,
        startAyah: passageConfig?.fromAyah || null,
        endAyah: passageConfig?.toAyah || null,
        startedAt: startTimeRef.current || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: elapsedSeconds,
        sessionStatus: 'completed',
        sdkVersion: '1.0.0-rc.1',
        modelId: engine?.model?.id || 'tilawa-v1',
        modelVersion: engine?.model?.version || undefined,
        modelSha256: engine?.model?.sha256 || undefined,
        modelTier: engine?.model?.tier || undefined,
        executionBackend: engine?.model?.backend || undefined,
        totalWordsRecited: wordsRecitedSet.size,
        totalConfirmedMistakes: finalFindings.length,
        totalSelfCorrections: resolvedFindings.length,
        totalUncertain: uncertainCount,
        findings: finalFindings,
      };

      setSummary(sessionSummary);
      setStatus('completed');
    } catch (err: any) {
      console.error('Error stopping recitation session:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'حدث خطأ أثناء إنهاء الجلسة.');
    } finally {
      // Clean up session resources
      if (unsubscribeEventsRef.current) {
        unsubscribeEventsRef.current();
        unsubscribeEventsRef.current = null;
      }
      if (sessionRef.current) {
        try {
          sessionRef.current.dispose();
        } catch (e) {}
        sessionRef.current = null;
      }
    }
  }, [
    status,
    confirmedFindings,
    resolvedFindings,
    uncertainCount,
    passageConfig,
    mode,
    currentPosition,
    elapsedSeconds,
    wordsRecitedSet,
    engine,
  ]);

  /**
   * Cancels the active session without saving a report.
   */
  const cancelSession = useCallback(async () => {
    try {
      if (micRef.current) {
        await micRef.current.stop();
        micRef.current = null;
      }
      if (sessionRef.current) {
        sessionRef.current.dispose();
        sessionRef.current = null;
      }
    } catch (e) {
      console.warn('Error during session cancellation:', e);
    } finally {
      if (unsubscribeEventsRef.current) {
        unsubscribeEventsRef.current();
        unsubscribeEventsRef.current = null;
      }
      setStatus('idle');
      setCurrentPosition(null);
      setConfirmedFindings([]);
      setSuspectedFindings([]);
      setSummary(null);
    }
  }, []);

  // Cleanup on hook unmount
  useEffect(() => {
    return () => {
      if (micRef.current) {
        micRef.current.stop().catch(() => {});
      }
      if (sessionRef.current) {
        sessionRef.current.dispose();
      }
      if (unsubscribeEventsRef.current) {
        unsubscribeEventsRef.current();
      }
    };
  }, []);

  return {
    status,
    mode,
    passageConfig,
    currentPosition,
    confirmedFindings,
    suspectedFindings,
    resolvedFindings,
    uncertainCount,
    audioLevel,
    elapsedSeconds,
    wordsRecitedCount: wordsRecitedSet.size,
    errorMessage,
    summary,
    startSession,
    stopSession,
    cancelSession,
  };
}
