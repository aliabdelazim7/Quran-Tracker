'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

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
      router.push('/dashboard');
    }
  };

  const handleDemoLogin = () => {
    signInAsDemo('علي');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2] dark:bg-[#0B1914]">
      <div className="w-full max-w-md bg-white dark:bg-[#11251E] rounded-3xl border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#145A45] text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            📖
          </div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D]">
            رحلتي مع القرآن
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            أهلاً بك مجدداً.. سجّل دخولك لمتابعة وردك وحفظك
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-400 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-4 py-3 pl-10 text-sm text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                كلمة المرور
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#145A45] dark:text-[#C7A75B] hover:underline"
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
                className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-4 py-3 pl-10 text-sm text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E6E4DC] dark:border-[#1F3B32] w-full" />
          <span className="bg-white dark:bg-[#11251E] px-3 text-xs text-stone-400 font-medium absolute">
            أو
          </span>
        </div>

        {/* Demo Fast Track Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-3 rounded-xl border-2 border-dashed border-[#C7A75B] bg-[#C7A75B]/5 hover:bg-[#C7A75B]/10 text-[#145A45] dark:text-[#C7A75B] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>تجربة التطبيق السريعة كزائر (بدون حساب)</span>
        </button>

        <div className="text-center text-xs text-stone-500">
          ليس لديك حساب بعد؟{' '}
          <Link href="/register" className="font-bold text-[#145A45] dark:text-[#C7A75B] hover:underline">
            أنشئ حساباً جديداً
          </Link>
        </div>
      </div>
    </div>
  );
}
