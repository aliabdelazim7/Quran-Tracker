import React from 'react';
import { MemorizationStatus } from '@/types/database';

interface StatusBadgeProps {
  status: MemorizationStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const statusConfig: Record<
  MemorizationStatus,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  not_started: {
    label: 'لم يبدأ',
    bg: 'bg-stone-100 dark:bg-stone-800',
    text: 'text-stone-600 dark:text-stone-400',
    border: 'border-stone-200 dark:border-stone-700',
    icon: '⏳'
  },
  in_progress: {
    label: 'قيد الحفظ',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '🌱'
  },
  ready_for_recitation: {
    label: 'جاهز للتسميع',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    icon: '📢'
  },
  recited: {
    label: 'تم التسميع',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    icon: '✅'
  },
  mastered: {
    label: 'متقَن ومثبَّت',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    icon: '⭐'
  },
  needs_repetition: {
    label: 'يحتاج إعادة',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    icon: '🔄'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const conf = statusConfig[status] || statusConfig.not_started;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${conf.bg} ${conf.text} ${conf.border} ${sizeClasses[size]} ${className}`}
    >
      <span className="text-xs">{conf.icon}</span>
      <span>{conf.label}</span>
    </span>
  );
};
