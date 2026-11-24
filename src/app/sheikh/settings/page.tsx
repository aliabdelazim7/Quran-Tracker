'use client';

import React, { useState } from 'react';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  User,
  ShieldCheck,
  Lock,
  Award,
  Phone,
  FileText,
  Check,
} from 'lucide-react';

export default function SheikhSettingsPage() {
  const { user, profile, updateDisplayName, updatePassword } = useAuth();

  const [name, setName] = useState(user?.display_name || '');
  const [bio, setBio] = useState('مُجاز بالقراءات العشر الصغرى وخبرة 15 عاماً في تحفيظ القرآن الكريم.');
  const [phone, setPhone] = useState('+20 100 123 4567');
  const [nameSaved, setNameSaved] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await updateDisplayName(name.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setPasswordLoading(true);
    const res = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (res.error) {
      setPasswordError(res.error);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 2500);
    }
  };

  return (
    <SheikhAppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
            <Settings className="w-6 h-6" />
            <span>بيانات فضيلة الشيخ والتوثيق</span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            إدارة بيانات الحساب التعريفي، حالة التوثيق الشرعي، وكلمة المرور.
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-[#152F26] dark:to-[#122820] border border-emerald-200 dark:border-[#24483B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  حالة الاعتماد والتوثيق
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  معتمد وموثق ✅
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                تظهر علامة التوثيق لتلاميذك عند مسح كود الدعوة وقبل تأكيد الربط.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-[11px] text-stone-500">
            <span>نوع الحساب: </span>
            <strong className="text-[#145A45] dark:text-[#E0C37B]">شيخ ومُعلّم (غير قابل للتغيير)</strong>
          </div>
        </div>

        {/* 1. Sheikh Profile Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
            <User className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
            <span>البيانات الشخصية والإجازات القرآنية</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block">
                  الاسم المعروض للتلاميذ
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block">
                  البريد الإلكتروني
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'sheikh@example.com'}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-stone-100 dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-700 dark:text-[#D1DDD7] font-medium cursor-not-allowed opacity-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block">
                  رقم الهاتف والتواصل للحلقة
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block">
                  دور الحساب بالنظام
                </label>
                <input
                  type="text"
                  disabled
                  value="شيخ ومحفّظ معتمد (Role: sheikh)"
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-stone-100 dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-700 dark:text-[#D1DDD7] font-medium cursor-not-allowed opacity-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block">
                نبذة تعريفية والإجازة القرآنية
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-3 text-xs text-stone-900 dark:text-stone-100 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all shadow-xs"
              >
                {nameSaved ? 'تم حفظ التعديل ✅' : 'حفظ التعديل'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Password Security */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
            <Lock className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
            <span>تغيير كلمة المرور</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-200 block">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-200 block">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 font-medium">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 font-medium">
                تم تحديث كلمة المرور بنجاح ✅
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {passwordLoading ? 'جارٍ التحديث...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SheikhAppShell>
  );
}
