'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'sheikh') {
          router.replace('/sheikh/dashboard');
        } else {
          router.replace('/student/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0B1914]">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl animate-bounce">📖</span>
        <p className="text-xs font-semibold text-[#145A45] dark:text-[#C7A75B]">
          رحلتي مع القرآن...
        </p>
      </div>
    </div>
  );
}
