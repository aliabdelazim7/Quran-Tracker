'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { RecitationDashboard } from '@/features/ai-recitation/components/RecitationDashboard';

function RecitationContent() {
  const searchParams = useSearchParams();
  const surahParam = searchParams.get('surah');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const assignmentId = searchParams.get('assignmentId') || undefined;

  const initialAssignment = surahParam
    ? {
        id: assignmentId,
        surah: parseInt(surahParam, 10),
        fromAyah: fromParam ? parseInt(fromParam, 10) : 1,
        toAyah: toParam ? parseInt(toParam, 10) : 7,
      }
    : undefined;

  return <RecitationDashboard initialAssignment={initialAssignment} />;
}

export default function StudentRecitationPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-slate-400">جاري تحميل المساعد الذكي...</div>}>
        <RecitationContent />
      </Suspense>
    </AppShell>
  );
}
