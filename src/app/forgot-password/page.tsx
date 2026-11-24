'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await resetPassword(email);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2] dark:bg-[#0B1914]">
      <div className="w-full max-w-md bg-white dark:bg-[#11251E] rounded-3xl border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#145A45] text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D]">
            استعادة كلمة المرور
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة الوصول لحسابك
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              تم إرسال رابط الاستعادة إلى بريدك بنجاح!
            </p>
            <p className="text-xs text-stone-500">
              يرجى فحص صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها).
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 text-xs font-bold text-[#145A45] dark:text-[#C7A75B] underline"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium text-center">
                {error}
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لصفحة تسجيل الدخول</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
