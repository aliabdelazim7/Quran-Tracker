import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getOrInitTilawa,
  disposeTilawa,
  prepareMic,
  TilawaEngineHandle,
  PreparedMicHandle,
} from '../lib/tilawa-client';
import { ModelDownloadState } from '../types/recitation';
import { checkBrowserCapabilities, BrowserSupportResult } from '../lib/recitation-validator';

export function useTilawa() {
  const [engine, setEngine] = useState<TilawaEngineHandle | null>(null);
  const engineRef = useRef<TilawaEngineHandle | null>(null);
  const [downloadState, setDownloadState] = useState<ModelDownloadState>({
    stage: 'idle',
    fraction: 0,
    loaded: 0,
    total: 0,
    fromCache: false,
  });
  const [browserSupport, setBrowserSupport] = useState<BrowserSupportResult>({
    supported: true,
    reasons: [],
    isIosSafari: false,
    isSecureContext: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preparedMic, setPreparedMic] = useState<PreparedMicHandle | null>(null);

  // Sync ref
  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  // Check browser support on mount
  useEffect(() => {
    const support = checkBrowserCapabilities();
    setBrowserSupport(support);
  }, []);

  /**
   * Must be called synchronously within a click/tap event handler
   * to satisfy iOS Safari microphone permissions before awaiting async tasks.
   */
  const prepareMicrophoneHandler = useCallback(async () => {
    try {
      const handle = await prepareMic();
      setPreparedMic(handle);
      return handle;
    } catch (err) {
      console.warn('Microphone prepare warning:', err);
      return null;
    }
  }, []);

  /**
   * Initializes the Tilawa engine and downloads/caches required model files.
   */
  const initEngine = useCallback(async (): Promise<TilawaEngineHandle> => {
    if (engineRef.current) return engineRef.current;
    if (engine) return engine;

    setIsLoading(true);
    try {
      const inst = await getOrInitTilawa((p) => {
        setDownloadState(p);
      });
      engineRef.current = inst;
      setEngine(inst);
      return inst;
    } catch (err: any) {
      setDownloadState((prev) => ({
        ...prev,
        stage: 'error',
        error: err?.message || 'فشل تحميل النموذج الذكي.',
      }));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [engine]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (preparedMic) {
        preparedMic.release();
      }
    };
  }, [preparedMic]);

  return {
    engine,
    downloadState,
    browserSupport,
    isLoading,
    isReady: Boolean(engine && downloadState.stage === 'ready'),
    initEngine,
    prepareMicrophoneHandler,
    preparedMic,
    disposeEngine: disposeTilawa,
  };
}
