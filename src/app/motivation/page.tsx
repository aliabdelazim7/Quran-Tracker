'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MOTIVATIONAL_QUOTES, MotivationalQuote } from '@/data/motivationalData';
import { HeartHandshake, BookOpen, Sparkles, Heart, Copy, Check, ShieldCheck } from 'lucide-react';

export default function MotivationPage() {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'religious' | 'personal_egyptian' | 'hasanat_virtue' | 'welcome_back'
  >('all');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = MOTIVATIONAL_QUOTES.filter((q) =>
    activeCategory === 'all' ? true : q.category === activeCategory
  );

  const copyText = (id: string, text: string, ref: string) => {
    const full = `"${text}"\n— ${ref}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
            <span>زاد الروح والرفيق القرآني</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            مكتبة موثقة من الآيات القرآنية والأحاديث النبوية الصحيحة والتشجيع الأخوي الدافئ.
          </p>
        </div>

        {/* Virtues & Hasanat Educational Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <span>فقه فضائل تلاوة القرآن ومضاعفة الحسنات:</span>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-quran text-base">
            عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ:
            &ldquo;مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ
            أَمْثَالِهَا، لَا أَقُولُ ألم حَرْفٌ، وَلَكِنْ أَلِفٌ حَرْفٌ وَلَامٌ حَرْفٌ وَمِيمٌ
            حَرْفٌ&rdquo;
          </p>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
            <span>رواه الترمذي (رقم 2910) وقال: حديث حسن صحيح غريب.</span>
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              * التطبيق لا يحسب رصيد حسنات افتراضي لأن القبول بيد الله وحده سبحانه.
            </span>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'جميع الرسائل' },
            { id: 'religious', label: 'آيات وأحاديث صحيحة 📜' },
            { id: 'personal_egyptian', label: 'تشجيع مصري أخوي ☕' },
            { id: 'welcome_back', label: 'رسائل العودة بعد غياب 🌿' },
            { id: 'hasanat_virtue', label: 'فضائل وثواب التلاوة 🌟' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-bold transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#145A45] text-white shadow-xs'
                  : 'bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] text-stone-600 dark:text-stone-300 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((quote) => (
            <div
              key={quote.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold ${
                      quote.sourceType === 'quran'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : quote.sourceType === 'hadith'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}
                  >
                    {quote.authenticityStatus || (quote.sourceType === 'quran' ? 'قرآن كريم' : 'تشجيع')}
                  </span>

                  {quote.contextTag && (
                    <span className="text-stone-400 font-medium">{quote.contextTag}</span>
                  )}
                </div>

                <p
                  className={`text-stone-800 dark:text-stone-100 leading-relaxed ${
                    quote.sourceType === 'quran' || quote.sourceType === 'hadith'
                      ? 'font-quran text-base'
                      : 'text-sm font-medium'
                  }`}
                >
                  &ldquo;{quote.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E6E4DC] dark:border-[#1F3B32] text-xs">
                <span className="text-stone-500 text-[11px] font-semibold truncate max-w-[220px]">
                  {quote.sourceReference}
                </span>

                <button
                  onClick={() => copyText(quote.id, quote.text, quote.sourceReference)}
                  className="flex items-center gap-1 text-[11px] text-[#145A45] dark:text-[#C7A75B] hover:underline"
                >
                  {copiedId === quote.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
