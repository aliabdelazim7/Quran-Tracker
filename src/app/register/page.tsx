'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { Lock, Mail, User, GraduationCap, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInAsDemo } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'student' | 'sheikh' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('يرجى اختيار نوع الحساب للمتابعة.');
      return;
    }

    if (password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, displayName, selectedRole);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      if (selectedRole === 'sheikh') {
        router.push('/sheikh/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  };

  const handleDemoSignIn = (role: 'student' | 'sheikh') => {
    signInAsDemo(role === 'sheikh' ? 'فضيلة الشيخ' : displayName || 'علي أحمد', role);
    if (role === 'sheikh') {
      router.push('/sheikh/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2] dark:bg-[#0A1612]">
      <div className="w-full max-w-xl bg-white dark:bg-[#122820] rounded-3xl border border-[#E2DFD6] dark:border-[#24483B] shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#145A45] text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            📖
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#145A45] dark:text-[#E0C37B]">
            ابدأ رحلتك مع القرآن
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            اختار نوع حسابك علشان نجهزلك التجربة المناسبة.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium text-center">
            {error}
          </div>
        )}

        {/* Step 1: Role Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
            نوع الحساب:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Option 1: Student */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative group ${
                selectedRole === 'student'
                  ? 'border-[#145A45] dark:border-[#E0C37B] bg-[#145A45]/5 dark:bg-[#152F26] ring-2 ring-[#145A45] dark:ring-[#E0C37B] shadow-sm'
                  : 'border-[#E2DFD6] dark:border-[#24483B] bg-white dark:bg-[#0E201A] hover:border-[#145A45]/50'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    selectedRole === 'student'
                      ? 'bg-[#145A45] text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#145A45] dark:text-[#E0C37B]'
                  }`}
                >
                  <GraduationCap className="w-6 h-6" />
                </div>
                {selectedRole === 'student' && (
                  <CheckCircle2 className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1">
                  أنا طالب
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  عايز أتابع حفظي ومراجعتي وأتابع دروسي مع الشيخ.
                </p>
              </div>
            </button>

            {/* Option 2: Sheikh */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('sheikh');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative group ${
                selectedRole === 'sheikh'
                  ? 'border-[#145A45] dark:border-[#E0C37B] bg-[#145A45]/5 dark:bg-[#152F26] ring-2 ring-[#145A45] dark:ring-[#E0C37B] shadow-sm'
                  : 'border-[#E2DFD6] dark:border-[#24483B] bg-white dark:bg-[#0E201A] hover:border-[#145A45]/50'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    selectedRole === 'sheikh'
                      ? 'bg-[#145A45] text-white shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#E0C37B]'
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
                {selectedRole === 'sheikh' && (
                  <CheckCircle2 className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1">
                  أنا شيخ
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  عايز أتابع حفظ تلاميذي وأسجل دروسهم وتسميعهم.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Registration Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
              الاسم الكامل
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={selectedRole === 'sheikh' ? 'الشيخ أحمد محمود' : 'علي أحمد'}
                className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-4 py-3 pl-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-4 py-3 pl-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-4 py-3 pl-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-4 py-3 pl-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#145A45]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب والبدء'}
          </button>
        </form>

        {/* Demo Fast Tracks */}
        <div className="pt-2 border-t border-[#E2DFD6] dark:border-[#24483B]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-stone-500 dark:text-stone-400">تجربة سريعة بدون تسجيل:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('student')}
                className="px-3 py-1.5 rounded-lg border border-[#145A45] text-[#145A45] dark:text-[#E0C37B] font-bold hover:bg-[#145A45]/5"
              >
                دخول كطالب تجريبي
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('sheikh')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
              >
                دخول كشيخ تجريبي
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-1 text-xs text-stone-600 dark:text-stone-300">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-[#145A45] dark:text-[#E0C37B] font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
