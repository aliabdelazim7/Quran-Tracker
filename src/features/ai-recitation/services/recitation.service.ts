import { createClient } from '@/lib/supabase/client';
import {
  RecitationSessionSummary,
  RecitationFinding,
  RecitationReportPermission,
} from '../types/recitation';

export async function saveRecitationSession(
  summary: RecitationSessionSummary
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول لحفظ جلسة التسميع.' };
    }

    // 1. Insert session record
    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_recitation_sessions')
      .insert({
        student_id: user.id,
        assignment_id: summary.assignmentId || null,
        session_mode: summary.sessionMode,
        surah_number: summary.surahNumber || null,
        start_ayah: summary.startAyah || null,
        end_ayah: summary.endAyah || null,
        started_at: summary.startedAt,
        completed_at: summary.completedAt || new Date().toISOString(),
        duration_seconds: summary.durationSeconds,
        session_status: summary.sessionStatus,
        sdk_version: summary.sdkVersion || '1.0.0-rc.1',
        model_id: summary.modelId || null,
        model_version: summary.modelVersion || null,
        model_sha256: summary.modelSha256 || null,
        model_tier: summary.modelTier || null,
        execution_backend: summary.executionBackend || null,
        total_words_recited: summary.totalWordsRecited,
        total_confirmed_mistakes: summary.totalConfirmedMistakes,
        total_self_corrections: summary.totalSelfCorrections,
        total_uncertain: summary.totalUncertain,
        verified_report_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error('Failed to save AI recitation session:', sessionError);
      return { success: false, error: sessionError.message };
    }

    const sessionId = sessionData.id;

    // 2. Insert findings if any
    if (summary.findings && summary.findings.length > 0) {
      const findingsPayload = summary.findings.map((f) => ({
        session_id: sessionId,
        student_id: user.id,
        finding_uid: f.id,
        error_class: f.errorClass,
        event_status: f.state,
        surah_number: f.location.surah,
        ayah_number: f.location.ayah,
        word_index: f.location.word,
        expected_text: f.expected || null,
        observed_text: f.observed || null,
        confidence: f.confidence,
        audio_time_ms: f.timeMs,
      }));

      const { error: findingsError } = await supabase
        .from('ai_recitation_findings')
        .insert(findingsPayload);

      if (findingsError) {
        console.warn('Warning: Saved session but failed to insert findings:', findingsError);
      }
    }

    return { success: true, id: sessionId };
  } catch (err: any) {
    console.error('Unexpected error saving recitation session:', err);
    return { success: false, error: err?.message || 'خطأ غير متوقع أثناء الحفظ' };
  }
}

export async function getStudentRecitationSessions(studentId?: string): Promise<RecitationSessionSummary[]> {
  try {
    const supabase = createClient();
    let targetStudentId = studentId;

    if (!targetStudentId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      targetStudentId = user.id;
    }

    const { data, error } = await supabase
      .from('ai_recitation_sessions')
      .select(`
        *,
        findings:ai_recitation_findings(*)
      `)
      .eq('student_id', targetStudentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student recitation sessions:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      assignmentId: row.assignment_id,
      sessionMode: row.session_mode,
      surahNumber: row.surah_number,
      startAyah: row.start_ayah,
      endAyah: row.end_ayah,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationSeconds: row.duration_seconds || 0,
      sessionStatus: row.session_status,
      sdkVersion: row.sdk_version,
      modelId: row.model_id,
      modelVersion: row.model_version,
      modelSha256: row.model_sha256,
      modelTier: row.model_tier,
      executionBackend: row.execution_backend,
      totalWordsRecited: row.total_words_recited || 0,
      totalConfirmedMistakes: row.total_confirmed_mistakes || 0,
      totalSelfCorrections: row.total_self_corrections || 0,
      totalUncertain: row.total_uncertain || 0,
      findings: (row.findings || []).map((f: any) => ({
        id: f.finding_uid || f.id,
        errorClass: f.error_class,
        state: f.event_status,
        location: {
          surah: f.surah_number,
          ayah: f.ayah_number,
          word: f.word_index,
        },
        expected: f.expected_text,
        observed: f.observed_text,
        confidence: Number(f.confidence) || 0,
        timeMs: f.audio_time_ms || 0,
        translatedLabel: '',
        translatedExplanation: '',
      })),
    }));
  } catch (err) {
    console.error('Failed to get recitation sessions:', err);
    return [];
  }
}

export async function getReportSharingPermissions(): Promise<RecitationReportPermission[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('teacher_student_relationships')
      .select(`
        id,
        teacher_id,
        teacher:profiles!teacher_student_relationships_teacher_id_fkey(display_name),
        permissions:relationship_permissions(*)
      `)
      .eq('student_id', user.id)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching report permissions:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      const perm = Array.isArray(row.permissions) ? row.permissions[0] : row.permissions;
      return {
        relationshipId: row.id,
        teacherId: row.teacher_id,
        teacherName: row.teacher?.display_name || 'الشيخ المُعلِّم',
        canViewReports: Boolean(perm?.can_view_ai_recitation_reports),
      };
    });
  } catch (err) {
    console.error('Failed to query report permissions:', err);
    return [];
  }
}

export async function toggleReportSharingPermission(
  relationshipId: string,
  canView: boolean
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('relationship_permissions')
      .update({ can_view_ai_recitation_reports: canView })
      .eq('relationship_id', relationshipId);

    if (error) {
      console.error('Failed to update report sharing permission:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error updating report sharing permission:', err);
    return false;
  }
}

export async function deleteRecitationSession(sessionId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('ai_recitation_sessions')
      .delete()
      .eq('id', sessionId);

    return !error;
  } catch (err) {
    console.error('Error deleting recitation session:', err);
    return false;
  }
}
