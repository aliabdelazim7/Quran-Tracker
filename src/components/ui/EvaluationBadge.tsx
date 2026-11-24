import React from 'react';
import { SheikhEvaluation, RevisionEvaluation } from '@/types/database';

interface EvaluationBadgeProps {
  evaluation: SheikhEvaluation | RevisionEvaluation;
  type?: 'sheikh' | 'revision';
  size?: 'sm' | 'md';
}

export const EvaluationBadge: React.FC<EvaluationBadgeProps> = ({
  evaluation,
  type = 'sheikh',
  size = 'md'
}) => {
  let label = '';
  let colorClass = '';
  let icon = '';

  switch (evaluation) {
    case 'excellent':
      label = 'ممتاز (إتقان تام)';
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300';
      icon = '🌟';
      break;
    case 'very_good':
      label = 'جيد جداً (أخطاء يسيرة)';
      colorClass = 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300';
      icon = '✨';
      break;
    case 'good':
      label = 'جيد (يحتاج ضبط)';
      colorClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
      icon = '👌';
      break;
    case 'needs_improvement':
      label = 'يحتاج تمكين';
      colorClass = 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300';
      icon = '⚠️';
      break;
    case 'repeat_required':
    case 'must_repeat':
      label = 'إعادة التسميع';
      colorClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300';
      icon = '🔄';
      break;
    default:
      label = evaluation;
      colorClass = 'bg-stone-100 text-stone-700 border-stone-200';
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs sm:text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClass} ${sizeClass}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};
