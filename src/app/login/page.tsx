'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, GraduationCap, BookOpen } from 'lucide-react';
import { getPortalHome } from '@/lib/authorization/guards';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInAsDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      const destination = getPortalHome(res.role);
      router.push(destination);
    }
  };

  const handleDemoLogin = (role: 'student' | 'sheikh') => {
    signInAsDemo(role === 'sheikh' ? 'فضيلة الشيخ' : 'علي أحمد', role);
    router.push(role === 'sheikh' ? '/sheikh/dashboard' : '/student/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2] dark:bg-[#0A1612]">
      <div className="w-full max-w-md bg-white dark:bg-[#122820] rounded-3xl border border-[#E2DFD6] dark:border-[#24483B] shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#145A45] text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            📖
          </div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B]">
            تسجيل الدخول
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            أهلاً بك مجدداً في &ldquo;رحلتي مع القرآن&rdquo;
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                كلمة المرور
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#145A45] dark:text-[#E0C37B] font-bold hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-2 border-t border-[#E2DFD6] dark:border-[#24483B] space-y-2">
          <p className="text-center text-[11px] text-stone-500 dark:text-stone-400">
            أو سجّل الدخول كحساب تجريبي مباشرة:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="py-2 px-3 rounded-xl border border-[#145A45] text-[#145A45] dark:text-[#E0C37B] hover:bg-[#145A45]/5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>دخول كطالب</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('sheikh')}
              className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>دخول كشيخ</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-1 text-xs text-stone-600 dark:text-stone-300">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-[#145A45] dark:text-[#E0C37B] font-bold hover:underline">
            أنشئ حسابك الجديد
          </Link>
        </div>
      </div>
    </div>
  );
}
