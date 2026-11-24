import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { AuditLog } from '@/types/database';

export async function logAuditEvent(params: {
  actor_id?: string | null;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  student_id?: string | null;
  teacher_id?: string | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
}): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      // Offline/Local Storage Audit Log
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('rehlaty_audit_logs');
        const list: AuditLog[] = stored ? JSON.parse(stored) : [];
        const entry: AuditLog = {
          id: 'aud-' + Math.random().toString(36).substring(2, 9),
          actor_id: params.actor_id || null,
          actor_role: params.actor_role,
          action: params.action,
          resource_type: params.resource_type,
          resource_id: params.resource_id || null,
          student_id: params.student_id || null,
          teacher_id: params.teacher_id || null,
          metadata: params.metadata || {},
          ip_address: params.ip_address || null,
          created_at: new Date().toISOString(),
        };
        list.unshift(entry);
        localStorage.setItem('rehlaty_audit_logs', JSON.stringify(list.slice(0, 100)));
      }
      return;
    }

    const supabase = createClient();
    await supabase.from('audit_logs').insert({
      actor_id: params.actor_id || null,
      actor_role: params.actor_role,
      action: params.action,
      resource_type: params.resource_type,
      resource_id: params.resource_id || null,
      student_id: params.student_id || null,
      teacher_id: params.teacher_id || null,
      metadata: params.metadata || {},
      ip_address: params.ip_address || null,
    });
  } catch (err) {
    console.warn('Audit logging note:', err);
  }
}
