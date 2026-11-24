export type RecitationMode = 'memorization' | 'free';

export type RecitationStatus =
  | 'idle'
  | 'preparing'
  | 'downloading_model'
  | 'requesting_mic'
  | 'ready'
  | 'active'
  | 'completing'
  | 'completed'
  | 'cancelled'
  | 'error';

export type TrackerState = 'acquiring' | 'locked' | 'ambiguous' | 'lost';

export type MemorizationErrorClass =
  | 'wrong_word'
  | 'omitted_word'
  | 'added_word'
  | 'skipped_passage'
  | 'other';

export type CheckerState = 'suspected' | 'confirmed' | 'resolved' | 'uncertain';

export interface WordPosition {
  surah: number;
  ayah: number;
  word: number; // 0-based word index within the ayah
}

export interface RecitationFinding {
  id: string; // Preserves SDK event ID throughout lifecycle
  errorClass: MemorizationErrorClass;
  state: CheckerState;
  location: WordPosition;
  expected?: string;
  observed?: string;
  confidence: number;
  timeMs: number;
  translatedLabel: string;
  translatedExplanation: string;
}

export interface RecitationPosition {
  surah: number;
  ayah: number;
  word: number;
  state: TrackerState;
  confidence: number;
  expected?: WordPosition;
}

export interface ModelDownloadState {
  stage: 'idle' | 'model' | 'reference' | 'warmup' | 'ready' | 'error';
  fraction: number; // 0 to 1
  loaded: number;
  total: number;
  fromCache: boolean;
  tier?: string;
  backend?: string;
  modelId?: string;
  modelVersion?: string;
  error?: string;
}

export interface DeclaredPassageConfig {
  surah: number;
  fromAyah: number;
  toAyah: number;
  assignmentId?: string;
}

export interface AyahWordItem {
  surah: number;
  ayah: number;
  wordIndex: number;
  text: string;
}

export interface AyahDisplayItem {
  surah: number;
  ayah: number;
  text: string;
  words: AyahWordItem[];
}

export interface RecitationSessionSummary {
  id: string;
  studentId: string;
  assignmentId?: string | null;
  sessionMode: RecitationMode;
  surahNumber?: number | null;
  startAyah?: number | null;
  endAyah?: number | null;
  startedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  sessionStatus: 'completed' | 'cancelled' | 'in_progress';
  sdkVersion?: string;
  modelId?: string;
  modelVersion?: string;
  modelSha256?: string;
  modelTier?: string;
  executionBackend?: string;
  totalWordsRecited: number;
  totalConfirmedMistakes: number;
  totalSelfCorrections: number;
  totalUncertain: number;
  findings: RecitationFinding[];
}

export interface RecitationReportPermission {
  relationshipId: string;
  teacherId: string;
  teacherName: string;
  canViewReports: boolean;
}
