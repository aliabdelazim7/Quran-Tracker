// Curated and verified motivational, religious, and personal encouragement data
// All religious quotes are strictly authenticated from canonical Quran and Sahih Sunnah collections.

export interface MotivationalQuote {
  id: string;
  category: 'religious' | 'personal_egyptian' | 'progress_milestone' | 'hasanat_virtue' | 'welcome_back';
  text: string;
  sourceType: 'quran' | 'hadith' | 'egyptian_companion' | 'virtue';
  sourceReference: string;
  authenticityStatus?: string;
  contextTag?: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  // 1. Authenticated Religious Quotes (Quran & Sahih Hadith)
  {
    id: 'rel-1',
    category: 'religious',
    text: 'إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ وَأَنفَقُوا مِمَّا رَزَقْنَاهُمْ سِرًّا وَعَلَانِيَةً يَرْجُونَ تِجَارَةً لَّن تَبُورَ * لِيُوَفِّيَهُمْ أُجُورَهُمْ وَيَزِيدَهُم مِّن فَضْلِهِ ۚ إِنَّهُ غَفُورٌ شَكُورٌ',
    sourceType: 'quran',
    sourceReference: 'سورة فاطر: 29-30',
    authenticityStatus: 'قرآن كريم',
    contextTag: 'فضل التلاوة'
  },
  {
    id: 'rel-2',
    category: 'religious',
    text: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
    sourceType: 'quran',
    sourceReference: 'سورة القمر: 17',
    authenticityStatus: 'قرآن كريم',
    contextTag: 'تيسير القرآن'
  },
  {
    id: 'rel-3',
    category: 'religious',
    text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    sourceType: 'hadith',
    sourceReference: 'صحيح البخاري (رقم 5027) عن عثمان بن عفان رضي الله عنه',
    authenticityStatus: 'صحيح البخاري',
    contextTag: 'فضل المتعلم'
  },
  {
    id: 'rel-4',
    category: 'religious',
    text: 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ، وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ',
    sourceType: 'hadith',
    sourceReference: 'صحيح مسلم (رقم 798) عن عائشة أم المؤمنين رضي الله عنها',
    authenticityStatus: 'صحيح مسلم',
    contextTag: 'أجر المشقة والتعتعة'
  },
  {
    id: 'rel-5',
    category: 'religious',
    text: 'يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تَرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَتَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَأُ بِهَا',
    sourceType: 'hadith',
    sourceReference: 'سنن أبي داود (1464) والترمذي (2914) وقال: حسن صحيح، عن عبد الله بن عمرو',
    authenticityStatus: 'حسن صحيح',
    contextTag: 'درجات الجنة'
  },
  {
    id: 'rel-6',
    category: 'religious',
    text: 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
    sourceType: 'hadith',
    sourceReference: 'صحيح مسلم (رقم 804) عن أبي أمامة الباهلي رضي الله عنه',
    authenticityStatus: 'صحيح مسلم',
    contextTag: 'شفاعة القرآن'
  },
  {
    id: 'rel-7',
    category: 'religious',
    text: 'تَعَاهَدُوا هَذَا الْقُرْآنَ، فَوَالَّذِي نَفْسِي بِيَدِهِ لَهُوَ أَشَدُّ تَفَلُّتًا مِنَ الْإِبِلِ فِي عُقُلِهَا',
    sourceType: 'hadith',
    sourceReference: 'صحيح البخاري (5033) ومسلم (791) عن أبي موسى الأشعري رضي الله عنه',
    authenticityStatus: 'متفق عليه',
    contextTag: 'أهمية المراجعة المستمرة'
  },
  {
    id: 'rel-8',
    category: 'religious',
    text: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    sourceType: 'hadith',
    sourceReference: 'صحيح البخاري (6464) ومسلم (783) عن عائشة رضي الله عنها',
    authenticityStatus: 'متفق عليه',
    contextTag: 'المداومة والثبات'
  },

  // 2. Authentic Quran Virtue (Hasanat / Tenfold Reward principle)
  {
    id: 'has-1',
    category: 'hasanat_virtue',
    text: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا، لَا أَقُولُ ألم حَرْفٌ، وَلَكِنْ أَلِفٌ حَرْفٌ وَلَامٌ حَرْفٌ وَمِيمٌ حَرْفٌ',
    sourceType: 'hadith',
    sourceReference: 'سنن الترمذي (رقم 2910) وقال: حسن صحيح غريب، عن عبد الله بن مسعود رضي الله عنه',
    authenticityStatus: 'صحيح - سنن الترمذي',
    contextTag: 'مضاعفة الحسنات'
  },

  // 3. Warm Egyptian Arabic Personal Encouragement
  {
    id: 'egy-1',
    category: 'personal_egyptian',
    text: 'يا صاحبي، افتح المصحف حتى لو عشر دقايق بس.. متستناش اليوم اللي تكون فيه فاضي تمامًا، البركة بتيجي مع البداية.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'بداية اليوم'
  },
  {
    id: 'egy-2',
    category: 'personal_egyptian',
    text: 'بص أنت قطعت شوط قد إيه! فاكر أول ما بدأت تحفظ؟ كمل، أنت بتغرس نور ثابت في قلبك وعقلك.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'التحفيز المستمر'
  },
  {
    id: 'egy-3',
    category: 'personal_egyptian',
    text: 'مفيش مشكلة إن الأسبوع ده كان زحمة ودوشة.. عادي، نقفل كل التشتيت ونبدأ من جديد سوا خطوة بخطوة.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'تخفيف الضغط'
  },
  {
    id: 'egy-4',
    category: 'personal_egyptian',
    text: 'متسيبش ورد النهارده يفوتك؛ حتى لو خمس آيات مركزين أحسن ألف مرة من إنك تأجل كل حاجة لبكرة.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'الاستمرارية'
  },
  {
    id: 'egy-5',
    category: 'personal_egyptian',
    text: 'النهارده مش مطلوب منك تخلص جزء كامل.. مطلوب بس تقعد مع كتاب ربنا بقلب حاضر وتبدأ.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'التركيز'
  },
  {
    id: 'egy-6',
    category: 'personal_egyptian',
    text: 'تخيل فرحتك وفرحة الشيخ في الحلقة الجاية وإنت متمكن من التسميع.. ربع ساعة مراجعة دلوقتي هتفرق معاك جدا!',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'الاستعداد للشيخ'
  },

  // 4. Return After Absence (Non-judgmental, Welcoming)
  {
    id: 'wb-1',
    category: 'welcome_back',
    text: 'حمدًا لله على رجوعك يا صاحبي ❤️ نورت مصحفك من تاني.. مفيش أي زعل ولا لوم، المهم إنك رجعت.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'عودة بعد غياب'
  },
  {
    id: 'wb-2',
    category: 'welcome_back',
    text: 'القرآن بيستناك دايمًا ومش بيقفل بابه.. مش هنضغط على نفسنا بجديد النهارده، هنطمن بس على القديم بهدوء.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'استئناف هادئ'
  },
  {
    id: 'wb-3',
    category: 'welcome_back',
    text: 'كل الحفاظ الكبار كان بيعدي عليهم فترات انقطاع.. البطل مش اللي مابيغيبش، البطل اللي أول ما يفوق يرجع لمكانه.',
    sourceType: 'egyptian_companion',
    sourceReference: 'رفيقك القرآني',
    contextTag: 'تثبيت العزيمة'
  }
];

export function getRandomQuote(category?: MotivationalQuote['category']): MotivationalQuote {
  const filtered = category ? MOTIVATIONAL_QUOTES.filter((q) => q.category === category) : MOTIVATIONAL_QUOTES;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index] || MOTIVATIONAL_QUOTES[0];
}

export function getWelcomeBackMessage(): MotivationalQuote {
  const welcomeQuotes = MOTIVATIONAL_QUOTES.filter((q) => q.category === 'welcome_back');
  return welcomeQuotes[Math.floor(Math.random() * welcomeQuotes.length)];
}
