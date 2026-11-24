'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { getSheikhDashboardData, SheikhDashboardData } from '@/services/sheikh.service';
import { getTeacherRelationships } from '@/services/relationship.service';
import { TeacherStudentRelationship } from '@/types/database';

export default function SheikhDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<SheikhDashboardData | null>(null);
  const [students, setStudents] = useState<TeacherStudentRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const [dashData, rels] = await Promise.all([
          getSheikhDashboardData(user.id),
          getTeacherRelationships(user.id),
        ]);
        setData(dashData);
        setStudents(rels);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  return (
    <SheikhAppShell>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#145A45] to-[#1F7A5F] text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#E0C37B] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>حلقة فضيلة الشيخ القرآنية</span>
              </span>
              <h1 className="text-xl sm:text-2xl font-black">
                السلام عليكم ورحمة الله، فضيلة الشيخ {user?.display_name?.split(' ')[0] || ''} 🌸
              </h1>
              <p className="text-xs sm:text-sm text-stone-200 max-w-xl leading-relaxed">
                قال رسول الله ﷺ: &ldquo;خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ&rdquo;. مرحباً بك في متابعة
                تسميع تلاميذك وتوثيق مسيرتهم القرآنية.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-r border-white/20 pt-3 sm:pt-0 sm:pr-6 shrink-0">
              <span className="text-xs text-stone-200">الطلاب النشطون</span>
              <span className="text-2xl sm:text-3xl font-black text-[#E0C37B]">
                {data?.activeStudents || 0}
              </span>
              <span className="text-[11px] text-stone-300">طالباً في الحلقة</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/sheikh/invitations"
            className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] hover:border-[#145A45] shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#E0C37B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  دعوة طالب جديد
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  توليد كود ربط فوري آمن
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#145A45]" />
          </Link>

          <Link
            href="/sheikh/students"
            className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] hover:border-[#145A45] shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#145A45] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  رصد جلسة تسميع
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  تسجيل وتقييم مقاطع الحفظ
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#145A45]" />
          </Link>

          <Link
            href="/sheikh/statistics"
            className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] hover:border-[#145A45] shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  تقرير أداء الحلقة
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  إحصائيات الإتقان والغياب
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#145A45]" />
          </Link>
        </div>

        {/* 4 Core Measurement Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">
              إجمالي الطلاب المرتبطين
            </span>
            <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {data?.totalStudents || 0}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              طلاب معتمدون في الحلقة
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">
              لديهم تكليفات قيد الحفظ
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {data?.studentsWithPendingAssignments || 0}
            </p>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
              بانتظار التسميع بالحلقة
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">
              يحتاجون مراجعة وتثبيت
            </span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {data?.studentsNeedingRevision || 0}
            </p>
            <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">
              تأخر موعد مراجعتهم
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">
              جلسات تم رصدها هذا الشهر
            </span>
            <p className="text-2xl font-black text-[#145A45] dark:text-[#E0C37B]">
              {data?.lessonsThisMonth || 0}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
              جلسة تسميع موثقة
            </p>
          </div>
        </div>

        {/* Connected Students Table & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Students List Card */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
                  <span>تلاميذ الحلقة المسجلون</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  الطلاب الذين وافقوا على ربط حساباتهم وصرحوا لك بمتابعة حفظهم.
                </p>
              </div>
              <Link
                href="/sheikh/students"
                className="text-xs font-bold text-[#145A45] dark:text-[#E0C37B] hover:underline"
              >
                عرض الكل ({students.length})
              </Link>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] space-y-3">
                <Users className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                  لم ينضم أي طالب لحلقتك بعد.
                </p>
                <Link
                  href="/sheikh/invitations"
                  className="inline-block px-4 py-2 rounded-xl bg-[#145A45] text-white text-xs font-bold"
                >
                  توليد كود دعوة ومشاركته مع الطلاب
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((rel) => {
                  const student = rel.student;
                  return (
                    <div
                      key={rel.id}
                      className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#145A45]/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#145A45] dark:bg-emerald-950/50 dark:text-[#E0C37B] flex items-center justify-center font-bold text-sm">
                          {student?.display_name?.charAt(0) || 'ط'}
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            {student?.display_name || 'طالب الحلقة'}
                          </h3>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            انضم للحلقة: {new Date(rel.connected_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sheikh/students/${rel.student_id}/lessons/new`}
                          className="px-3 py-1.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-colors"
                        >
                          رصد جلسة
                        </Link>
                        <Link
                          href={`/sheikh/students/${rel.student_id}`}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-[#152F26] text-xs font-semibold text-stone-700 dark:text-stone-200"
                        >
                          تفاصيل الحفظ
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
              <span>آخر مستجدات الحلقة</span>
            </h2>

            <div className="space-y-3">
              {data?.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#145A45] dark:text-[#E0C37B]">
                      {act.studentName}
                    </span>
                    <span className="text-[10px] text-stone-400">{act.date}</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                    {act.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SheikhAppShell>
  );
}
