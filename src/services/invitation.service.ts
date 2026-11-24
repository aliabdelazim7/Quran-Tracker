import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { TeacherInvitation } from '@/types/database';
import { logAuditEvent } from './audit.service';

const INVITATIONS_STORAGE_KEY = 'rehlaty_teacher_invitations';

// Simple SHA-256 helper for browser & Node
async function sha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Node fallback
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(text).digest('hex');
  } catch {
    return 'hash-' + text;
  }
}

// Generate human-friendly code: e.g. QRN-8492
function generateHumanCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 3; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `QRN-${part1}-${part2}`;
}

export async function createTeacherInvitation(
  teacherId: string,
  teacherName: string = 'الشيخ'
): Promise<{ invitation?: TeacherInvitation; rawCode?: string; error?: string }> {
  try {
    const rawToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
    const rawCode = generateHumanCode();
    const tokenHash = await sha256(rawToken + rawCode);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      const list: TeacherInvitation[] = stored ? JSON.parse(stored) : [];
      const newInv: TeacherInvitation = {
        id: 'inv-' + Math.random().toString(36).substring(2, 9),
        teacher_id: teacherId,
        invite_code: rawCode,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        teacher: {
          id: teacherId,
          display_name: teacherName,
          role: 'sheikh',
          verification_status: 'verified',
          language: 'ar',
          timezone: 'Africa/Cairo',
          preferred_theme: 'light',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      list.unshift(newInv);
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(list));

      await logAuditEvent({
        actor_id: teacherId,
        actor_role: 'sheikh',
        action: 'invitation_created',
        resource_type: 'teacher_invitations',
        resource_id: newInv.id,
        teacher_id: teacherId,
        metadata: { invite_code: rawCode },
      });

      return { invitation: newInv, rawCode };
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('teacher_invitations')
      .insert({
        teacher_id: teacherId,
        invite_code: rawCode,
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select('*, teacher:profiles(*)')
      .single();

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      actor_id: teacherId,
      actor_role: 'sheikh',
      action: 'invitation_created',
      resource_type: 'teacher_invitations',
      resource_id: data.id,
      teacher_id: teacherId,
      metadata: { invite_code: rawCode },
    });

    return { invitation: data as TeacherInvitation, rawCode };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'فشل إنشاء كود الدعوة' };
  }
}

export async function verifyInvitationCode(code: string): Promise<{
  valid: boolean;
  invitationId?: string;
  teacherId?: string;
  teacherName?: string;
  verificationStatus?: string;
  expiresAt?: string;
  error?: string;
}> {
  const normalized = code.trim().toUpperCase();
  if (!normalized || normalized.length < 5) {
    return { valid: false, error: 'رمز الدعوة غير صالح أو غير مكتمل.' };
  }

  try {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      const list: TeacherInvitation[] = stored ? JSON.parse(stored) : [];
      const found = list.find(
        (inv) =>
          inv.invite_code.toUpperCase() === normalized &&
          !inv.revoked_at &&
          !inv.accepted_at
      );

      if (!found) {
        return { valid: false, error: 'رمز الدعوة غير موجود أو تم استخدامه مسبقاً.' };
      }

      if (new Date(found.expires_at) < new Date()) {
        return { valid: false, error: 'انتهت صلاحية رمز الدعوة (تتجاوز 7 أيام).' };
      }

      return {
        valid: true,
        invitationId: found.id,
        teacherId: found.teacher_id,
        teacherName: found.teacher?.display_name || 'فضيلة الشيخ',
        verificationStatus: found.teacher?.verification_status || 'verified',
        expiresAt: found.expires_at,
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc('verify_invitation_code', {
      p_code: normalized,
    });

    if (error || !data || data.length === 0 || !data[0].is_valid) {
      return { valid: false, error: 'رمز الدعوة غير صالح أو منتهي الصلاحية.' };
    }

    const item = data[0];
    return {
      valid: true,
      invitationId: item.invitation_id,
      teacherId: item.teacher_id,
      teacherName: item.teacher_name,
      verificationStatus: item.teacher_verification_status,
      expiresAt: item.expires_at,
    };
  } catch (err: unknown) {
    return { valid: false, error: err instanceof Error ? err.message : 'فشل التحقق من الدعوة' };
  }
}

export async function acceptTeacherInvitation(
  code: string,
  studentId: string,
  studentName: string = 'الطالب'
): Promise<{ success: boolean; relationshipId?: string; error?: string }> {
  const normalized = code.trim().toUpperCase();

  try {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      const list: TeacherInvitation[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(
        (inv) =>
          inv.invite_code.toUpperCase() === normalized &&
          !inv.revoked_at &&
          !inv.accepted_at
      );

      if (idx === -1) {
        return { success: false, error: 'رمز الدعوة غير صالح أو مستخدم بالفعل.' };
      }

      const inv = list[idx];
      if (inv.teacher_id === studentId) {
        return { success: false, error: 'لا يمكن للشيخ قبول دعوة خاصة بحسابه نفسه.' };
      }

      // Mark invitation accepted
      inv.accepted_at = new Date().toISOString();
      inv.accepted_by = studentId;
      list[idx] = inv;
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(list));

      // Create relationship in LocalStorage
      const relKey = 'rehlaty_teacher_student_relationships';
      const rels = localStorage.getItem(relKey) ? JSON.parse(localStorage.getItem(relKey)!) : [];
      const relId = 'rel-' + Math.random().toString(36).substring(2, 9);
      rels.push({
        id: relId,
        teacher_id: inv.teacher_id,
        student_id: studentId,
        status: 'active',
        connected_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        teacher: inv.teacher,
        student: {
          id: studentId,
          display_name: studentName,
          role: 'student',
          verification_status: 'unverified',
        },
        permissions: {
          id: 'perm-' + Math.random().toString(36).substring(2, 9),
          relationship_id: relId,
          can_view_profile: true,
          can_view_memorization: true,
          can_view_progress: true,
          can_view_lessons: true,
          can_view_assignments: true,
          can_view_revision_history: true,
          can_create_lessons: true,
          can_record_evaluations: true,
          can_create_assignments: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
      localStorage.setItem(relKey, JSON.stringify(rels));

      await logAuditEvent({
        actor_id: studentId,
        actor_role: 'student',
        action: 'invitation_accepted',
        resource_type: 'teacher_student_relationships',
        resource_id: relId,
        student_id: studentId,
        teacher_id: inv.teacher_id,
        metadata: { invite_code: normalized },
      });

      return { success: true, relationshipId: relId };
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc('accept_teacher_invitation', {
      p_code: normalized,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, relationshipId: data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'فشل ربط الحساب بالشيخ' };
  }
}

export async function revokeTeacherInvitation(
  invitationId: string,
  teacherId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      if (stored) {
        const list: TeacherInvitation[] = JSON.parse(stored);
        const updated = list.map((inv) =>
          inv.id === invitationId && inv.teacher_id === teacherId
            ? { ...inv, revoked_at: new Date().toISOString() }
            : inv
        );
        localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updated));
      }
      return { success: true };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('teacher_invitations')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', invitationId)
      .eq('teacher_id', teacherId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'فشل إلغاء الدعوة' };
  }
}

export async function getTeacherInvitations(teacherId: string): Promise<TeacherInvitation[]> {
  try {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      if (!stored) return [];
      const list: TeacherInvitation[] = JSON.parse(stored);
      return list.filter((inv) => inv.teacher_id === teacherId);
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('teacher_invitations')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    return (data as TeacherInvitation[]) || [];
  } catch {
    return [];
  }
}
