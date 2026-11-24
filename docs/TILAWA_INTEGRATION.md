# Tilawa AI Quran Recitation Integration (التسميع الذكي)

## 1. Feature Overview
"التسميع الذكي" (AI-Assisted Quran Recitation) provides automated recitation tracking for students practicing memorization and revision. It streams audio locally inside the user's browser, follows progress word-by-word against verified Quran data, and highlights potential memorization mistakes.

### Scope & Important Limitations:
- Detects memorization omissions, additions, wrong words, and skipped passages.
- **Does NOT evaluate Tajweed rules**, articulation points (Makharij), short vowel precision, or Madd rules.
- Results are advisory review aids, never formal religious or academic judgments.
- Formal evaluation remains the exclusive responsibility of certified human Sheikhs.

---

## 2. Dependencies & Runtime Architecture
- **`@tilawa/core`**: `1.0.0-rc.1` (pinned exact version, ESM-only)
- **`onnxruntime-web`**: `1.30.0` (pinned exact version)
- **Execution Context**: 100% client-side in the browser. Zero server-side inference or audio streaming.
- **Dynamic Loading**: ONNX Runtime and model weights are imported dynamically only when the user opens the recitation module.

---

## 3. Local Audio Processing & Privacy Guarantees
- **Zero Raw Audio Upload**: Recitation audio is processed strictly in-memory using Web Audio API and WebAssembly. No microphone recordings are uploaded to Vercel or Supabase.
- **iOS Safari Support**: Microphone handles are prepared synchronously during user tap gestures via `prepareMicrophone()` before awaiting model initialization.
- **Auto-stop**: Microphone tracks terminate immediately upon pausing, stopping, cancelling, or navigating away.

---

## 4. Event Mapping & Mistake Detection
The integration subscribes to Tilawa versioned engine events:
- **`capabilities`**: Inspects supported and unsupported error classes dynamically.
- **`position`**: Tracks current Surah, Ayah, Word index, and locking state (`acquiring`, `locked`, `ambiguous`, `lost`). Word highlighting occurs only when the position lock is confirmed.
- **`checker`**:
  - `suspected`: Temporary warning signal during live speech.
  - `confirmed`: Verified memorization error (`wrong_word`, `omitted_word`, `added_word`, `skipped_passage`).
  - `resolved`: Self-correction by the student, automatically clearing the warning.
  - `uncertain`: Disregarded and excluded from final mistake tallies.

---

## 5. Database Schema & RLS Policies
The feature uses two dedicated tables in Supabase PostgreSQL:
- **`ai_recitation_sessions`**: Session metadata, duration, mode, model details, and summary statistics.
- **`ai_recitation_findings`**: Itemized mistake records linked to Ayah and word position.
- **Privacy Enforcement**:
  - Students have full CRUD access over their own records.
  - Sheikhs can only view reports if the student has explicitly granted `can_view_ai_recitation_reports` in `relationship_permissions`.
  - Anonymous users are completely blocked.

---

## 6. Rollback & Disable Procedure
If the feature needs to be disabled, set the environment variable:
```env
NEXT_PUBLIC_ENABLE_AI_RECITATION=false
```
The application will continue operating normally with all traditional Quran tracking, memorization, and Sheikh portal features intact.
