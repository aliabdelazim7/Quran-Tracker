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

/**
 * Normalizes Tilawa raw internal phoneme strings into clean, readable Arabic words.
 * Handles doubled consonants (shaddah), prolonged vowels (aa, uu, ii), and Quranic phonetic markers.
 */
export function normalizePhonemes(str?: string): string | undefined {
  if (!str) return undefined;

  let s = str.trim();

  // Normalize phonetic representations from Tilawa v1
  // 1. Long vowels
  s = s.replace(/اا/g, 'ا');
  s = s.replace(/وو/g, 'و');
  s = s.replace(/[ۦي]{2,}/g, 'ي');
  s = s.replace(/ۦ/g, 'ي');

  // 2. Doubled letters representing shaddah (e.g. ررَ -> رَّ, ببِ -> بِّ)
  s = s.replace(/([ء-ي])\1([ًٌٍَُِّْ]?)/g, '$1ّ$2');

  // 3. Clean any non-Arabic characters
  s = s.replace(/[^\u0600-\u06FF\s]/g, '');

  return s.trim() || str;
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
    expected: normalizePhonemes(event.expected),
    observed: normalizePhonemes(event.observed),
    confidence: event.confidence || 0,
    timeMs: event.timeMs || 0,
    translatedLabel: translated.label,
    translatedExplanation: translated.explanation,
  };
}
