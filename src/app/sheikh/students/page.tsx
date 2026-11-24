'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { useAuth } from '@/context/AuthContext';
import { getTeacherRelationships } from '@/services/relationship.service';
import { TeacherStudentRelationship } from '@/types/database';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function SheikhStudentsPage() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<TeacherStudentRelationship[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'needs_revision' | 'pending_assignment'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const rels = await getTeacherRelationships(user.id);
        setRelationships(rels);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const filtered = relationships.filter((r) => {
    const studentName = r.student?.display_name || 'طالب';
    const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'active') return r.status === 'active';
    return true;
  });

  return (
    <SheikhAppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#145A45] dark:text-[#E0C37B]" />
              <span>إدارة تلاميذ الحلقة والتسميع</span>
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              متابعة الطلاب المعتمدين، تسجيل الجلسات، وإسناد واجبات الحفظ والمراجعة.
            </p>
          </div>

          <Link
            href="/sheikh/invitations"
            className="px-4 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>دعوة طالب جديد للحلقة</span>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B]">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطالب..."
              className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] px-3.5 py-2 pl-9 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#145A45]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            {[
              { id: 'all', label: `الكل (${relationships.length})` },
              { id: 'active', label: 'النشطون' },
              { id: 'needs_revision', label: 'بحاجة لمراجعة' },
              { id: 'pending_assignment', label: 'لديهم واجبات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? 'bg-[#145A45] text-white shadow-xs'
                    : 'bg-[#F8F7F2] dark:bg-[#0E201A] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Students Cards Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-3">
            <Users className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              لا توجد نتائج مطابقة
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              تأكد من كتابة اسم الطالب بشكل صحيح، أو شارك رمز الدعوة مع تلميذك للانضمام للحلقة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((rel) => {
              const student = rel.student;
              return (
                <div
                  key={rel.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4 hover:border-[#145A45]/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#145A45] dark:bg-emerald-950/60 dark:text-[#E0C37B] flex items-center justify-center font-bold text-base shadow-xs">
                        {student?.display_name?.charAt(0) || 'ط'}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {student?.display_name || 'طالب الحلقة'}
                        </h2>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          تاريخ الانضمام: {new Date(rel.connected_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                      متصل ونشط ✅
                    </span>
                  </div>

                  {/* Summary progress bar */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600 dark:text-stone-300 font-semibold">
                        المحفوظ التقريبي:
                      </span>
                      <span className="font-bold text-[#145A45] dark:text-[#E0C37B]">
                        سورة النبأ (40 آية)
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#145A45] dark:bg-[#E0C37B] h-full rounded-full"
                        style={{ width: '4%' }}
                      />
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E2DFD6] dark:border-[#24483B]">
                    <Link
                      href={`/sheikh/students/${rel.student_id}`}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-[#152F26] text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors"
                    >
                      عرض السجل والتكليفات
                    </Link>
                    <Link
                      href={`/sheikh/students/${rel.student_id}/lessons/new`}
                      className="px-4 py-2 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>رصد جلسة تسميع</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SheikhAppShell>
  );
}
