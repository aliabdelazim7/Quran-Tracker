'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, GraduationCap, RotateCcw } from 'lucide-react';
import { SURAHS } from '@/data/quranData';
import { useQuranApp } from '@/context/QuranAppContext';

interface GlobalSearchModalProps {
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const { lessons, assignments, revisionSessions } = useQuranApp();

  const trimmed = query.trim().toLowerCase();

  // Search Surahs
  const filteredSurahs = useMemo(() => {
    if (!trimmed) return [];
    return SURAHS.filter(
      (s) =>
        s.nameArabic.includes(trimmed) ||
        s.nameTransliteration.toLowerCase().includes(trimmed) ||
        s.number.toString() === trimmed
    ).slice(0, 5);
  }, [trimmed]);

  // Search Lessons
  const filteredLessons = useMemo(() => {
    if (!trimmed) return [];
    return lessons.filter(
      (l) =>
        l.sheikh_name.toLowerCase().includes(trimmed) ||
        (l.overall_notes && l.overall_notes.toLowerCase().includes(trimmed))
    ).slice(0, 4);
  }, [trimmed, lessons]);

  // Search Assignments
  const filteredAssignments = useMemo(() => {
    if (!trimmed) return [];
    return assignments.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(trimmed)) ||
        (a.notes && a.notes.toLowerCase().includes(trimmed))
    ).slice(0, 4);
  }, [trimmed, assignments]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#11251E] rounded-2xl shadow-xl border border-[#E6E4DC] dark:border-[#1F3B32] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E6E4DC] dark:border-[#1F3B32]">
          <Search className="w-5 h-5 text-[#145A45] dark:text-[#C7A75B]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن سورة، شيخ، واجب، أو ملاحظة..."
            className="flex-1 bg-transparent text-sm text-[#252B27] dark:text-[#EDF3EF] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
          >
            إغلاق
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {!trimmed ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              اكتب اسم السورة، رقمها، أو أي كلمة في سجلات الحفظ والدروس...
            </div>
          ) : (
            <>
              {/* Surahs */}
              {filteredSurahs.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#145A45]" />
                    <span>السور القرآنية:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredSurahs.map((s) => (
                      <Link
                        key={s.number}
                        href="/quran"
                        onClick={onClose}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F8F7F2] dark:bg-[#0B1914] hover:bg-[#145A45]/10 text-xs transition-colors"
                      >
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {s.number}. سورة {s.nameArabic}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {s.ayahCount} آية ({s.revelationType})
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons */}
              {filteredLessons.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#145A45]" />
                    <span>جلسات التسميع مع الشيخ:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredLessons.map((l) => (
                      <Link
                        key={l.id}
                        href={`/lessons/${l.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F8F7F2] dark:bg-[#0B1914] hover:bg-[#145A45]/10 text-xs transition-colors"
                      >
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {l.sheikh_name} - {l.lesson_date}
                        </span>
                        <span className="text-[11px] text-stone-500 truncate max-w-[150px]">
                          {l.overall_notes || l.lesson_type}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignments */}
              {filteredAssignments.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-[#145A45]" />
                    <span>الواجبات والتكليفات:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredAssignments.map((a) => (
                      <Link
                        key={a.id}
                        href={`/memorization/${a.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F8F7F2] dark:bg-[#0B1914] hover:bg-[#145A45]/10 text-xs transition-colors"
                      >
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {a.title || 'واجب قرآني'}
                        </span>
                        <span className="text-[11px] text-[#145A45] font-medium">
                          {a.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredSurahs.length === 0 &&
                filteredLessons.length === 0 &&
                filteredAssignments.length === 0 && (
                  <div className="text-center py-6 text-stone-400 text-xs">
                    لم يتم العثور على نتائج مطابقة لـ &quot;{query}&quot;
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
