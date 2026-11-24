'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  getStudentRelationships,
  updateRelationshipPermissions,
  revokeRelationship,
} from '@/services/relationship.service';
import {
  verifyInvitationCode,
  acceptTeacherInvitation,
} from '@/services/invitation.service';
import { TeacherStudentRelationship, RelationshipPermissions } from '@/types/database';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  Sliders,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import {
  PERMISSION_DEFINITIONS,
  PermissionKey,
} from '@/lib/authorization/permissions';

export default function StudentTeacherPage() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<TeacherStudentRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  // Connection Flow State
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    teacherName?: string;
    verificationStatus?: string;
    error?: string;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  // Permissions updating state
  const [permissionUpdating, setPermissionUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const rels = await getStudentRelationships(user.id);
        setRelationships(rels);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const activeRelationship = relationships.find((r) => r.status === 'active');

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyResult(null);

    const res = await verifyInvitationCode(inviteCodeInput);
    setVerifying(false);
    setVerifyResult(res);
  };

  const handleConfirmAccept = async () => {
    if (!user?.id || !verifyResult?.valid) return;
    setConnecting(true);

    const res = await acceptTeacherInvitation(
      inviteCodeInput,
      user.id,
      user.display_name || 'الطالب'
    );
    setConnecting(false);

    if (res.success) {
      setConnectSuccess(true);
      setVerifyResult(null);
      setInviteCodeInput('');
      const rels = await getStudentRelationships(user.id);
      setRelationships(rels);
      setTimeout(() => setConnectSuccess(false), 3000);
    } else {
      setVerifyResult({ valid: false, error: res.error || 'فشل إتمام الربط' });
    }
  };

  const handleTogglePermission = async (key: PermissionKey, currentValue: boolean) => {
    if (!activeRelationship || !user?.id) return;
    setPermissionUpdating(key);

    const updated = !currentValue;
    const res = await updateRelationshipPermissions(
      activeRelationship.id,
      user.id,
      { [key]: updated }
    );

    setPermissionUpdating(null);

    if (res.success) {
      setRelationships((prev) =>
        prev.map((r) =>
          r.id === activeRelationship.id && r.permissions
            ? { ...r, permissions: { ...r.permissions, [key]: updated } }
            : r
        )
      );
    }
  };

  const handleRevokeConnection = async () => {
    if (!activeRelationship || !user?.id) return;
    if (
      confirm(
        '⚠️ هل أنت متأكد من إلغاء الربط مع الشيخ؟ سيتوقف وصول الشيخ لسجلاتك فوراً مع بقاء كافة دروسك وتقييماتك السابقة محفوظة بحسابك.'
      )
    ) {
      await revokeRelationship(activeRelationship.id, user.id, 'student');
      setRelationships((prev) =>
        prev.map((r) =>
          r.id === activeRelationship.id ? { ...r, status: 'revoked' as const } : r
        )
      );
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            <span>الشيخ المتابع وإدارة صلاحيات الحلقة</span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            ربط حسابك بشيخك المعالج، التحكم الكامل في خصوصية بياناتك، وضبط صلاحيات رصد التسميع.
          </p>
        </div>

        {connectSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center animate-in fade-in">
            تم ربط حسابك بفضيلة الشيخ بنجاح! يمكن لشيخك الآن متابعة تسميعك وإسناد الواجبات لك ✅
          </div>
        )}

        {/* State 1: Active Connected Sheikh */}
        {activeRelationship ? (
          <div className="space-y-6">
            {/* Connected Sheikh Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-[#E0C37B] flex items-center justify-center font-black text-2xl shadow-xs">
                  🕌
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                      {activeRelationship.teacher?.display_name || 'فضيلة الشيخ المتابع'}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>شيخ معتمد وموثق</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    تاريخ بدء المتابعة:{' '}
                    {new Date(activeRelationship.connected_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRevokeConnection}
                className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>إلغاء الربط مع الشيخ</span>
              </button>
            </div>

            {/* Granular Permissions Controls */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
                    <span>صلاحيات الشيخ الممنوحة (تحكم فوري ودقيق)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    أنت المالك الوحيد لبياناتك. يمكنك تفعيل أو تعطيل أي صلاحية ويسري التعديل على قاعدة البيانات لحظياً.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {PERMISSION_DEFINITIONS.map((perm) => {
                  const isEnabled = activeRelationship.permissions
                    ? activeRelationship.permissions[perm.key] === true
                    : true;
                  const isBusy = permissionUpdating === perm.key;

                  return (
                    <div
                      key={perm.key}
                      className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {perm.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              perm.category === 'write'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}
                          >
                            {perm.category === 'write' ? 'إسناد ورصد' : 'عرض'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                          {perm.description}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          disabled={isBusy}
                          onChange={() => handleTogglePermission(perm.key, isEnabled)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-300 dark:bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#145A45] dark:peer-checked:bg-[#229470]" />
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Strict Privacy Guarantee Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-[#152F26] border border-emerald-200/80 dark:border-[#24483B] flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    ضمان الخصوصية التامة:
                  </strong>
                  ملاحظاتك الشخصية الخاصة، وردك القرآني للتلاوة، وكلمات مرورك محجوبة بالكامل عن الشيخ ولا يمكن الوصول إليها تحت أي صلاحية.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Not Connected Yet -> Enter Invitation Code */
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-6">
              <div className="text-center space-y-2 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#E0C37B] flex items-center justify-center text-2xl mx-auto shadow-xs">
                  <LinkIcon className="w-7 h-7" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  اربط حسابك بحلقة الشيخ
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  ادخل رمز الدعوة الذي أعطاه لك فضيلة الشيخ لربط حسابك وتوثيق تسميعك وجلساتك معه.
                </p>
              </div>

              {/* Code Entry Form */}
              <form onSubmit={handleVerifyCode} className="max-w-md mx-auto space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-200 block">
                    رمز الدعوة (Invite Code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: QRN-7X8K-9M"
                    value={inviteCodeInput}
                    onChange={(e) => {
                      setInviteCodeInput(e.target.value.toUpperCase());
                      setVerifyResult(null);
                    }}
                    className="w-full text-center font-mono text-base font-bold tracking-widest rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying || !inviteCodeInput.trim()}
                  className="w-full py-3 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {verifying ? 'جارٍ التحقق من الرمز...' : 'التحقق من رمز الدعوة'}
                </button>
              </form>

              {/* Verification Result Confirmation Box */}
              {verifyResult && (
                <div className="max-w-md mx-auto">
                  {verifyResult.valid ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-[#152F26] border border-emerald-200 dark:border-[#24483B] space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                          🕌
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">دعوة من:</span>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                            {verifyResult.teacherName}
                          </h4>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                            حساب شيخ معتمد وموثق ✅
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-600 dark:text-stone-300 space-y-1 border-t border-emerald-200/50 dark:border-stone-700 pt-2 leading-relaxed">
                        <p className="font-bold text-stone-800 dark:text-stone-200">
                          بالموافقة، تسمح للشيخ بالآتي:
                        </p>
                        <p>• رصد جلسات التسميع وتقييم مقاطع الحفظ.</p>
                        <p>• إسناد وتكليف مقاطع حفظ ومراجعة جديدة.</p>
                        <p>• متابعة نسبة تقدمك الإجمالية في المصحف.</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAccept}
                        disabled={connecting}
                        className="w-full py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                      >
                        {connecting ? 'جارٍ إتمام الربط...' : 'تأكيد وقبول الربط بحلقة الشيخ'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                      {verifyResult.error || 'رمز الدعوة غير صالح أو منتهي الصلاحية.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Standalone Freedom Banner */}
            <div className="p-5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] text-xs text-stone-600 dark:text-stone-400 space-y-1 text-center">
              <strong className="text-stone-800 dark:text-stone-200 block">
                الحفظ المستقل متاح دائماً بدون إلزام:
              </strong>
              يمكنك استخدام التطبيق ومتابعة حفظك ومراجعتك بمفردك بحرية كاملة دون الحاجة للربط بشيخ إذا كنت تفضل الدراسة الفردية.
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
