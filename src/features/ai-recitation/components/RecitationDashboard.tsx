import React, { useState, useEffect } from 'react';
import { useTilawa } from '../hooks/useTilawa';
import { useRecitationSession } from '../hooks/useRecitationSession';
import { RecitationMode, DeclaredPassageConfig, RecitationSessionSummary, RecitationReportPermission } from '../types/recitation';
import { RecitationSetup } from './RecitationSetup';
import { RecitationSession } from './RecitationSession';
import { RecitationSummary } from './RecitationSummary';
import { ModelDownloadProgress } from './ModelDownloadProgress';
import { MicrophonePermissionDialog } from './MicrophonePermissionDialog';
import {
  getStudentRecitationSessions,
  getReportSharingPermissions,
  toggleReportSharingPermission,
  deleteRecitationSession,
} from '../services/recitation.service';
import { SURAHS } from '@/data/quranData';
import {
  Sparkles,
  History,
  Shield,
  AlertTriangle,
  Mic,
  Clock,
  Trash2,
  Share2,
  Check,
  X,
  Volume2,
} from 'lucide-react';

interface Props {
  initialAssignment?: {
    id?: string;
    surah: number;
    fromAyah: number;
    toAyah: number;
  };
}

export const RecitationDashboard: React.FC<Props> = ({ initialAssignment }) => {
  const [activeTab, setActiveTab] = useState<'new_session' | 'history' | 'privacy'>('new_session');
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pendingStartParams, setPendingStartParams] = useState<{
    mode: RecitationMode;
    passage?: DeclaredPassageConfig;
  } | null>(null);

  // History and Permissions state
  const [historyList, setHistoryList] = useState<RecitationSessionSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [permissionsList, setPermissionsList] = useState<RecitationReportPermission[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Tilawa Engine hook
  const {
    engine,
    downloadState,
    browserSupport,
    isLoading: isEngineLoading,
    isReady,
    initEngine,
    prepareMicrophoneHandler,
    preparedMic,
  } = useTilawa();

  // Recitation Session hook
  const {
    status,
    mode,
    passageConfig,
    currentPosition,
    confirmedFindings,
    suspectedFindings,
    resolvedFindings,
    audioLevel,
    elapsedSeconds,
    wordsRecitedCount,
    errorMessage,
    summary,
    startSession,
    stopSession,
    cancelSession,
  } = useRecitationSession(engine);

  // Load history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history') {
      setIsLoadingHistory(true);
      getStudentRecitationSessions().then((data) => {
        setHistoryList(data);
        setIsLoadingHistory(false);
      });
    } else if (activeTab === 'privacy') {
      setIsLoadingPermissions(true);
      getReportSharingPermissions().then((data) => {
        setPermissionsList(data);
        setIsLoadingPermissions(false);
      });
    }
  }, [activeTab]);

  const handleStartSetup = (selectedMode: RecitationMode, passage?: DeclaredPassageConfig) => {
    setPendingStartParams({ mode: selectedMode, passage });
    setShowPermissionDialog(true);
  };

  const handleConfirmPermission = async () => {
    setShowPermissionDialog(false);
    if (!pendingStartParams) return;

    try {
      // 1. Prepare microphone synchronously on user tap
      const micHandle = await prepareMicrophoneHandler();

      // 2. Initialize engine if not ready
      const inst = await initEngine();

      // 3. Start recitation session
      await startSession(pendingStartParams.mode, pendingStartParams.passage, micHandle);
    } catch (err) {
      console.error('Error starting recitation flow:', err);
    }
  };

  const handleTogglePermission = async (relId: string, currentVal: boolean) => {
    const success = await toggleReportSharingPermission(relId, !currentVal);
    if (success) {
      setPermissionsList((prev) =>
        prev.map((p) => (p.relationshipId === relId ? { ...p, canViewReports: !currentVal } : p))
      );
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقرير من سجلك؟')) return;
    const ok = await deleteRecitationSession(id);
    if (ok) {
      setHistoryList((prev) => prev.filter((h) => h.id !== id));
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Feature Banner & Disclaimer */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100">التسميع الذكي</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ميزة تجريبية 1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مساعد صوتي ذكي يستمع لتلاوتك ويتابع الكلمات كلمة بكلمة لمساعدتك في تثبيت ومراجعة الحفظ.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>النتائج للاسترشاد والمراجعة الذاتية، ولا تقدم حكماً فقهياً أو تقييماً لأحكام التجويد ومخارج الحروف.</span>
          </div>
        </div>
      </div>

      {/* Browser Incompatibility Alert */}
      {!browserSupport.supported && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-xs text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-1">المتصفح الحالي غير متوافق مع متطلبات التسميع الذكي:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-rose-200">
              {browserSupport.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Session Flow Screens */}
      {status === 'active' || status === 'preparing' || status === 'requesting_mic' ? (
        <RecitationSession
          mode={mode}
          passageConfig={passageConfig}
          currentPosition={currentPosition}
          confirmedFindings={confirmedFindings}
          suspectedFindings={suspectedFindings}
          resolvedFindings={resolvedFindings}
          elapsedSeconds={elapsedSeconds}
          wordsCount={wordsRecitedCount}
          audioLevel={audioLevel}
          onFinish={stopSession}
          onCancel={cancelSession}
        />
      ) : status === 'completed' && summary ? (
        <RecitationSummary
          summary={summary}
          onRestart={cancelSession}
          onReturnDashboard={() => {
            cancelSession();
            setActiveTab('new_session');
          }}
        />
      ) : isEngineLoading && downloadState.stage !== 'ready' ? (
        <ModelDownloadProgress
          state={downloadState}
          onCancel={cancelSession}
          onRetry={initEngine}
        />
      ) : (
        /* Setup and Dashboard Tabs */
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('new_session')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition ${
                activeTab === 'new_session'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>جلسة تسميع جديدة</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>سجل جلساتي السابقة</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition ${
                activeTab === 'privacy'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>الخصوصية ومشاركة المشايخ</span>
            </button>
          </div>

          {/* Tab 1: New Recitation Session */}
          {activeTab === 'new_session' && (
            <div className="space-y-4">
              <RecitationSetup
                onStart={handleStartSetup}
                isLoading={isEngineLoading}
              />
            </div>
          )}

          {/* Tab 2: Recitation History */}
          {activeTab === 'history' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl text-right">
              <h2 className="text-base font-bold text-slate-100 mb-4">تقارير التسميع الذكي السابقة</h2>
              {isLoadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                  جاري تحميل السجل...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  لا توجد جلسات تسميع مسجلة بعد. ابدأ جلسة جديدة وجرّب التسميع!
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((h) => {
                    const sMeta = h.surahNumber ? SURAHS.find((s) => s.number === h.surahNumber) : null;
                    const dateFormatted = new Date(h.startedAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={h.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 font-bold text-slate-100 mb-1">
                            <span>
                              {sMeta
                                ? `سورة ${sMeta.nameArabic} ${h.startAyah && h.endAyah ? `(${h.startAyah} - ${h.endAyah})` : ''}`
                                : 'تسميع حر'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                              {h.sessionMode === 'memorization' ? 'مقطع محدد' : 'تسميع حر'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span>{dateFormatted}</span>
                            <span>المدة: {Math.round(h.durationSeconds / 60)} دقيقة</span>
                            <span>الكلمات: {h.totalWordsRecited}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              h.totalConfirmedMistakes === 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {h.totalConfirmedMistakes === 0
                              ? 'إتقان تام ✨'
                              : `${h.totalConfirmedMistakes} مواضع للمراجعة`}
                          </span>

                          <button
                            onClick={() => handleDeleteHistory(h.id)}
                            title="حذف من السجل"
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Privacy & Sheikh Permissions */}
          {activeTab === 'privacy' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl text-right">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-100">إدارة خصوصية تقارير التسميع الذكي</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    التقارير خاصة بك وحدك افتراضياً. يمكنك السماح لشيخك بالاطلاع على تقارير مراجعتك لمساعدتك في التحضير.
                  </p>
                </div>
              </div>

              {isLoadingPermissions ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                  جاري تحميل صلاحيات المشايخ...
                </div>
              ) : permissionsList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60 p-6">
                  <p className="font-semibold text-slate-300 mb-1">لا يوجد شيوخ مرتبطون بحسابك حالياً.</p>
                  <p className="text-slate-500">
                    عند قبول دعوة من شيخك عبر كود الدعوة، ستتمكن من التحكم في صلاحية مشاركة نتائج التسميع الذكي معه من هنا.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {permissionsList.map((p) => (
                    <div
                      key={p.relationshipId}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <strong className="block text-sm text-slate-100 mb-0.5">{p.teacherName}</strong>
                        <span className="text-[11px] text-slate-400">
                          {p.canViewReports
                            ? 'مُصرَّح له بالاطلاع على تقارير التسميع الذكي'
                            : 'التقارير محجوبة ومخفية عن الشيخ'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTogglePermission(p.relationshipId, p.canViewReports)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                          p.canViewReports
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {p.canViewReports ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>مُفعَّلة المشاركة</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>مخفية (تفعيل المشاركة)</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Microphone Permission Modal */}
      <MicrophonePermissionDialog
        isOpen={showPermissionDialog}
        onConfirm={handleConfirmPermission}
        onCancel={() => {
          setShowPermissionDialog(false);
          setPendingStartParams(null);
        }}
        isIosSafari={browserSupport.isIosSafari}
      />
    </div>
  );
};
