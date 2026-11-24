'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getStudentRelationships } from '@/services/relationship.service';
import { TeacherStudentRelationship } from '@/types/database';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

export const TeacherStatusCard: React.FC = () => {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<TeacherStudentRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const rels = await getStudentRelationships(user.id);
        setRelationships(rels);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const activeRel = relationships.find((r) => r.status === 'active');

  if (loading) return null;

  if (activeRel) {
    const teacher = activeRel.teacher;
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-[#152F26] dark:to-[#122820] border border-emerald-200 dark:border-[#24483B] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-[#E0C37B] flex items-center justify-center font-bold text-xl shadow-xs">
              🕌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
                  متابعة الشيخ:
                </span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>معتمد وموثق</span>
                </span>
              </div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {teacher?.display_name || 'فضيلة الشيخ المتابع'}
              </h2>
            </div>
          </div>

          <Link
            href="/student/teacher"
            className="px-4 py-2 rounded-xl border border-[#145A45] text-[#145A45] dark:text-[#E0C37B] hover:bg-[#145A45]/5 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span>إدارة صلاحيات الربط</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-emerald-200/60 dark:border-stone-700">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0E201A] border border-emerald-100 dark:border-[#24483B]">
            <span className="text-stone-500 dark:text-stone-400 block font-semibold mb-0.5">
              آخر تقييم في الحلقة:
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              ممتاز ⭐ (سورة النبأ: 1 - 20)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0E201A] border border-emerald-100 dark:border-[#24483B]">
            <span className="text-stone-500 dark:text-stone-400 block font-semibold mb-0.5">
              توجيه الشيخ القادم:
            </span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              الاستعداد لتسميع باقي سورة النبأ في الحلقة القادمة.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not connected yet: show prompt
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#E0C37B] flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
            هل تحفظ مع شيخ أو في حلقة قرآنية؟
          </h2>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            يمكنك ربط حسابك بشيخك لمتابعة دروسك وتلقي تكليفات الحفظ وتقييمات التسميع مباشرة.
          </p>
        </div>
      </div>

      <Link
        href="/student/teacher"
        className="px-4 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all shadow-xs"
      >
        <LinkIcon className="w-4 h-4" />
        <span>اربط حسابك بالشيخ</span>
      </Link>
    </div>
  );
};
