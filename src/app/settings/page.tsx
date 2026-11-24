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
  Moon,
  Sun,
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
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
            <span>الإعدادات والتخصيص</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            إدارة بيانات الحساب، مواعيد التذكير، وتصدير رحلتك القرآنية بالكامل.
          </p>
        </div>

        {/* 1. Personal Profile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-bold text-sm">
            <User className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>الملف الشخصي</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 block mb-1">الاسم المعروض</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 block mb-1">البريد الإلكتروني</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'حساب زائر محلي'}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-stone-100 dark:bg-stone-800/50 px-3 py-2 text-xs text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all"
              >
                {nameSaved ? 'تم حفظ الاسم ✅' : 'حفظ التعديل'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Security & Password */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>الأمان وكلمة المرور</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 dark:text-stone-300 block mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 dark:text-stone-300 block mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 font-medium">
                تم تحديث كلمة المرور بنجاح ✅
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
              >
                {passwordLoading ? 'جارٍ التحديث...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Memorization & Reminders Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-bold text-sm">
            <Clock className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>تفضيلات الحفظ والتذكير</span>
          </div>

          <div className="space-y-4">
            {/* Daily Goal */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914]">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  تفعيل هدف الحفظ اليومي (اختياري)
                </span>
                <span className="text-[11px] text-stone-500">
                  تذكيرك بعدد آيات محددة يومياً بدون ضغط أو إلزام.
                </span>
              </div>
              <input
                type="checkbox"
                checked={dailyGoalEnabled}
                onChange={(e) => setDailyGoalEnabled(e.target.checked)}
                className="rounded border-stone-300 text-[#145A45]"
              />
            </div>

            {dailyGoalEnabled && (
              <div className="flex items-center gap-2 text-xs px-2">
                <span className="text-stone-600">الهدف اليومي:</span>
                <input
                  type="number"
                  min={1}
                  value={dailyGoalValue}
                  onChange={(e) => setDailyGoalValue(parseInt(e.target.value || '5', 10))}
                  className="w-16 rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1 text-xs"
                />
                <span className="text-stone-400">آيات</span>
              </div>
            )}

            {/* Reminder Time */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914]">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                وقت التذكير اليومي:
              </span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2.5 py-1 text-xs"
              />
            </div>

            {/* Encouragement Style */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
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
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      encouragementStyle === s.id
                        ? 'border-[#145A45] bg-[#145A45] text-white'
                        : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] text-stone-700 dark:text-stone-300'
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
                className="px-5 py-2 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all"
              >
                {settingsSaved ? 'تم حفظ التفضيلات ✅' : 'حفظ التفضيلات'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Data Export & Backup */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-bold text-sm">
            <Download className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
            <span>تصدير البيانات والنسخ الاحتياطي</span>
          </div>

          <p className="text-xs text-stone-500">
            بياناتك ملكك بالكامل. يمكنك تنزيل نسخة احتياطية من جميع جلسات الشيخ، المراجعات، وسجلات
            الحفظ بصيغة JSON أو كملف جدول بيانات CSV.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => exportData('json')}
              className="px-4 py-2.5 rounded-xl border border-[#145A45] bg-[#145A45]/5 text-[#145A45] dark:text-[#C7A75B] text-xs font-bold flex items-center gap-2 hover:bg-[#145A45]/10"
            >
              <Download className="w-4 h-4" />
              <span>تصدير نسخة JSON كاملة</span>
            </button>

            <button
              onClick={() => exportData('csv')}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-2 hover:bg-stone-50"
            >
              <Download className="w-4 h-4" />
              <span>تصدير جدول الجلسات CSV</span>
            </button>
          </div>
        </div>

        {/* 4. Danger Zone */}
        <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 space-y-3">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
            منطقة الإجراءات الحساسة
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                تصفير كافة السجلات والبدء من جديد
              </p>
              <p className="text-[11px] text-stone-500">
                حذف جميع التكليفات وجلسات الشيخ والمراجعات المسجلة في هذا الجهاز.
              </p>
            </div>

            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0"
            >
              تصفير السجلات
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
