'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useQuranApp } from '@/context/QuranAppContext';
import {
  Settings,
  User,
  Clock,
  Heart,
  Download,
  Trash2,
  Check,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateDisplayName, updatePassword, signOut } = useAuth();
  const { settings, updateSettings, exportData, resetAllUserData } = useQuranApp();

  const [name, setName] = useState(user?.display_name || '');
  const [nameSaved, setNameSaved] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [dailyGoalEnabled, setDailyGoalEnabled] = useState(settings.daily_goal_enabled);
  const [dailyGoalValue, setDailyGoalValue] = useState(settings.daily_goal_value || 5);
  const [reminderTime, setReminderTime] = useState(settings.reminder_time || '20:00');
  const [encouragementStyle, setEncouragementStyle] = useState(settings.encouragement_style);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await updateDisplayName(name.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const handleSavePreferences = () => {
    updateSettings({
      daily_goal_enabled: dailyGoalEnabled,
      daily_goal_value: dailyGoalEnabled ? dailyGoalValue : null,
      reminder_time: reminderTime,
      encouragement_style: encouragementStyle
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
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
    const { error } = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        '⚠️ هل أنت متأكد من تصفير كافة سجلات الحفظ والتسميع؟ لا يمكن التراجع عن هذا الإجراء.'
      )
    ) {
      resetAllUserData();
      alert('تم تصفير السجلات بنجاح.');
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#C7A75B] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
            <span>الإعدادات والتخصيص</span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 font-medium">
            إدارة بيانات الحساب، مواعيد التذكير، وتصدير رحلتك القرآنية بالكامل.
          </p>
        </div>

        {/* 1. Personal Profile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#152F26] border border-[#E6E4DC] dark:border-[#24483B] shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#F4F7F5] font-bold text-sm">
            <User className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>الملف الشخصي</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block mb-1.5">
                  الاسم المعروض
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'حساب زائر محلي'}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#24483B] bg-stone-100 dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-700 dark:text-[#D1DDD7] font-medium cursor-not-allowed opacity-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all shadow-sm"
              >
                {nameSaved ? 'تم حفظ الاسم ✅' : 'حفظ التعديل'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Security & Password */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#152F26] border border-[#E6E4DC] dark:border-[#24483B] shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#F4F7F5] font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>الأمان وكلمة المرور</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-white font-medium placeholder:text-stone-400 dark:placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#145A45] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-[#E2DFD6] block mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2.5 text-xs text-stone-900 dark:text-white font-medium placeholder:text-stone-400 dark:placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#145A45] transition-all"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 font-medium">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 font-medium">
                تم تحديث كلمة المرور بنجاح ✅
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
              >
                {passwordLoading ? 'جارٍ التحديث...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Memorization & Reminders Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#152F26] border border-[#E6E4DC] dark:border-[#24483B] shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
            <Clock className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>تفضيلات الحفظ والتذكير</span>
          </div>

          <div className="space-y-4">
            {/* Daily Goal */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E6E4DC] dark:border-[#24483B]">
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-[#F4F7F5] block">
                  تفعيل هدف الحفظ اليومي (اختياري)
                </span>
                <span className="text-[11px] text-stone-600 dark:text-[#B8C7C0]">
                  تذكيرك بعدد آيات محددة يومياً بدون ضغط أو إلزام.
                </span>
              </div>
              <input
                type="checkbox"
                checked={dailyGoalEnabled}
                onChange={(e) => setDailyGoalEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-[#145A45] focus:ring-[#145A45] cursor-pointer"
              />
            </div>

            {dailyGoalEnabled && (
              <div className="flex items-center gap-2 text-xs px-2">
                <span className="text-stone-700 dark:text-[#E2DFD6] font-semibold">الهدف اليومي:</span>
                <input
                  type="number"
                  min={1}
                  value={dailyGoalValue}
                  onChange={(e) => setDailyGoalValue(parseInt(e.target.value || '5', 10))}
                  className="w-20 rounded-xl border border-[#E6E4DC] dark:border-[#24483B] bg-white dark:bg-[#0E201A] text-stone-900 dark:text-white px-3 py-1.5 text-xs font-bold"
                />
                <span className="text-stone-500 dark:text-[#B8C7C0] font-medium">آيات</span>
              </div>
            )}

            {/* Reminder Time */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E6E4DC] dark:border-[#24483B]">
              <span className="text-xs font-bold text-stone-900 dark:text-[#F4F7F5]">
                وقت التذكير اليومي:
              </span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-xl border border-[#E6E4DC] dark:border-[#24483B] bg-white dark:bg-[#0E201A] text-stone-900 dark:text-white px-3 py-1.5 text-xs font-bold"
              />
            </div>

            {/* Encouragement Style */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-stone-800 dark:text-[#E2DFD6] block">
                أسلوب تشجيع الرفيق القرآني:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'balanced', label: 'متوازن وودود' },
                  { id: 'friendly_egyptian', label: 'عامية مصرية أخوية' },
                  { id: 'religious', label: 'تأصيل شرعي فقط' },
                  { id: 'minimal', label: 'هادئ ومختصر' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setEncouragementStyle(s.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      encouragementStyle === s.id
                        ? 'border-[#145A45] dark:border-[#C7A75B] bg-[#145A45] dark:bg-[#1E745A] text-white shadow-xs'
                        : 'border-[#E6E4DC] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] text-stone-700 dark:text-[#E2DFD6] hover:bg-stone-100 dark:hover:bg-[#16382c]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all shadow-sm"
              >
                {settingsSaved ? 'تم حفظ التفضيلات ✅' : 'حفظ التفضيلات'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Data Export & Backup */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#152F26] border border-[#E6E4DC] dark:border-[#24483B] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
            <Download className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>تصدير البيانات والنسخ الاحتياطي</span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
            بياناتك ملكك بالكامل. يمكنك تنزيل نسخة احتياطية من جميع جلسات الشيخ، المراجعات، وسجلات
            الحفظ بصيغة JSON أو كملف جدول بيانات CSV.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => exportData('json')}
              className="px-4 py-2.5 rounded-xl border border-[#145A45] dark:border-[#C7A75B] bg-[#145A45]/5 dark:bg-[#C7A75B]/10 text-[#145A45] dark:text-[#E0C37B] text-xs font-bold flex items-center gap-2 hover:bg-[#145A45]/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير نسخة JSON كاملة</span>
            </button>

            <button
              onClick={() => exportData('csv')}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#24483B] bg-white dark:bg-[#0E201A] text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-[#16382c] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير جدول الجلسات CSV</span>
            </button>
          </div>
        </div>

        {/* 5. Danger Zone */}
        <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
            منطقة الإجراءات الحساسة
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                تصفير كافة السجلات والبدء من جديد
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                حذف جميع التكليفات وجلسات الشيخ والمراجعات المسجلة في هذا الجهاز.
              </p>
            </div>

            <button
              onClick={handleResetData}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
            >
              تصفير السجلات
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
