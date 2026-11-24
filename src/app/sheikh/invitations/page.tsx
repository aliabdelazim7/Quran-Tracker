'use client';

import React, { useState, useEffect } from 'react';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { useAuth } from '@/context/AuthContext';
import {
  createTeacherInvitation,
  getTeacherInvitations,
  revokeTeacherInvitation,
} from '@/services/invitation.service';
import { TeacherInvitation } from '@/types/database';
import {
  UserPlus,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Trash2,
  AlertCircle,
  Share2,
} from 'lucide-react';

export default function SheikhInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newlyCreatedCode, setNewlyCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const list = await getTeacherInvitations(user.id);
        setInvitations(list);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!user?.id) return;
    setGenerating(true);
    setError(null);

    const res = await createTeacherInvitation(user.id, user.display_name || 'فضيلة الشيخ');
    setGenerating(false);

    if (res.error) {
      setError(res.error);
    } else if (res.rawCode && res.invitation) {
      setNewlyCreatedCode(res.rawCode);
      setInvitations((prev) => [res.invitation!, ...prev]);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRevoke = async (id: string) => {
    if (!user?.id) return;
    if (confirm('هل أنت متأكد من إلغاء رمز الدعوة هذا؟ لن يتمكن أي طالب من استخدامه بعد الآن.')) {
      await revokeTeacherInvitation(id, user.id);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, revoked_at: new Date().toISOString() } : inv
        )
      );
    }
  };

  return (
    <SheikhAppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-[#145A45] dark:text-[#E0C37B]" />
              <span>رموز دعوة الطلاب للحلقة</span>
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              قم بتوليد رمز آمن أحادي الاستخدام لمشاركته مع تلميذك لربط حسابه بحلقتك بعد موافقته الصريحة.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm transition-all disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{generating ? 'جارٍ التوليد...' : 'توليد رمز دعوة جديد'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Newly Created Code Highlight Card */}
        {newlyCreatedCode && (
          <div className="p-6 rounded-3xl bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-[#152F26] dark:to-[#122820] border-2 border-[#145A45] dark:border-[#E0C37B] space-y-3 shadow-md animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>تم توليد رمز الدعوة بنجاح!</span>
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                صالح لمدة 7 أيام - استخدام مرة واحدة
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B]">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#145A45] dark:text-[#E0C37B]">
                {newlyCreatedCode}
              </span>

              <button
                onClick={() => handleCopy(newlyCreatedCode)}
                className="px-4 py-2.5 rounded-xl bg-[#145A45] text-white hover:bg-[#1b6f57] text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                {copiedCode === newlyCreatedCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ ✅</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرمز للتلميذ</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
              شارك هذا الرمز مع الطالب؛ يدخل الطالب على حسابه ثم يختار &ldquo;اربط حسابك بالشيخ&rdquo;،
              وسيرى بياناتك وصلاحيات التسميع ليوافق عليها قبل إتمام الربط.
            </p>
          </div>
        )}

        {/* Existing Invitations Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
            <span>سجل الدعوات المصدرة</span>
          </h2>

          {invitations.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              لم تقم بتوليد أي رمز دعوة بعد. انقر على &ldquo;توليد رمز دعوة جديد&rdquo; بالأعلى.
            </p>
          ) : (
            <div className="space-y-2.5">
              {invitations.map((inv) => {
                const isAccepted = !!inv.accepted_at;
                const isRevoked = !!inv.revoked_at;
                const isExpired = new Date(inv.expires_at) < new Date();
                const isActive = !isAccepted && !isRevoked && !isExpired;

                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-stone-900 dark:text-stone-100">
                          {inv.invite_code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAccepted
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : isRevoked
                              ? 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                              : isExpired
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {isAccepted
                            ? 'تم القبول والربط ✅'
                            : isRevoked
                            ? 'ملغاة ❌'
                            : isExpired
                            ? 'منتهية الصلاحية ⌛'
                            : 'نشطة بانتظار الطالب 🟢'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                        <span>تاريخ الإنشاء: {new Date(inv.created_at).toLocaleDateString('ar-EG')}</span>
                        <span>•</span>
                        <span>
                          صالح حتى: {new Date(inv.expires_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <>
                          <button
                            onClick={() => handleCopy(inv.invite_code)}
                            className="px-3 py-1.5 rounded-xl border border-[#145A45] text-[#145A45] dark:text-[#E0C37B] hover:bg-[#145A45]/5 font-bold transition-colors"
                          >
                            {copiedCode === inv.invite_code ? 'تم النسخ' : 'نسخ الرمز'}
                          </button>
                          <button
                            onClick={() => handleRevoke(inv.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="إلغاء الرمز"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SheikhAppShell>
  );
}
