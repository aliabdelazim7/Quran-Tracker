import type {
  RecitationFinding,
  RecitationPosition,
  MemorizationErrorClass,
  CheckerState,
  TrackerState,
} from '../types/recitation.ts';
import { translateErrorClass } from './error-translator.ts';

// Minimal interface definitions matching Tilawa v1 events safely
export interface RawTilawaWordRef {
  surah: number;
  ayah: number;
  word: number;
}

export interface RawPositionCandidate {
  word: RawTilawaWordRef;
  confidence: number;
}

export interface RawPositionEvent {
  type: 'position';
  timeMs: number;
  expected: RawTilawaWordRef | null;
  observed: RawPositionCandidate[];
  state: TrackerState;
}

export interface RawCheckerEvent {
  type: 'checker';
  id: string;
  timeMs: number;
  state: CheckerState;
  errorClass: string;
  location: RawTilawaWordRef;
  expected?: string;
  observed?: string;
  confidence: number;
}

export interface RawCapabilityEvent {
  type: 'capabilities';
  modelVersion?: string;
  referenceVersion?: string;
  supported?: string[];
  unsupported?: string[];
}

export type RawEngineEvent = RawPositionEvent | RawCheckerEvent | RawCapabilityEvent;

export function mapPositionEvent(event: RawPositionEvent): RecitationPosition | null {
  if (!event.observed || event.observed.length === 0) {
    return null;
  }

  const top = event.observed[0];
  return {
    surah: top.word.surah,
    ayah: top.word.ayah,
    word: top.word.word,
    state: event.state,
    confidence: top.confidence || 0,
    expected: event.expected
      ? {
          surah: event.expected.surah,
          ayah: event.expected.ayah,
          word: event.expected.word,
        }
      : undefined,
  };
}

export function mapCheckerEvent(event: RawCheckerEvent): RecitationFinding {
  const normalizedClass: MemorizationErrorClass = [
    'wrong_word',
    'omitted_word',
    'added_word',
    'skipped_passage',
  ].includes(event.errorClass)
    ? (event.errorClass as MemorizationErrorClass)
    : 'other';

  const translated = translateErrorClass(normalizedClass);

  return {
    id: event.id,
    errorClass: normalizedClass,
    state: event.state,
    location: {
      surah: event.location.surah,
      ayah: event.location.ayah,
      word: event.location.word,
    },
    expected: event.expected,
    observed: event.observed,
    confidence: event.confidence || 0,
    timeMs: event.timeMs || 0,
    translatedLabel: translated.label,
    translatedExplanation: translated.explanation,
  };
}
