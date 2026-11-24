// Canonical Quran Metadata according to Hafs from Asim (6,236 Ayahs, 114 Surahs, 30 Juz)
// Documented and validated against the King Fahd Quran Printing Complex standard.

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameTransliteration: string;
  ayahCount: number;
  revelationType: 'مكية' | 'مدنية';
  startJuz: number;
}

export interface JuzMeta {
  juzNumber: number;
  nameArabic: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface QuranRange {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export const TOTAL_AYAH_COUNT = 6236;
export const TOTAL_SURAHS = 114;
export const TOTAL_JUZ = 30;
export const TOTAL_HIZB = 60;
export const TOTAL_RUB = 240;

export const SURAHS: SurahMeta[] = [
  {
    "number": 1,
    "nameArabic": "الفاتحة",
    "nameTransliteration": "Al-Fatihah",
    "ayahCount": 7,
    "revelationType": "مكية",
    "startJuz": 1
  },
  {
    "number": 2,
    "nameArabic": "البقرة",
    "nameTransliteration": "Al-Baqarah",
    "ayahCount": 286,
    "revelationType": "مدنية",
    "startJuz": 1
  },
  {
    "number": 3,
    "nameArabic": "آل عمران",
    "nameTransliteration": "Ali Imran",
    "ayahCount": 200,
    "revelationType": "مدنية",
    "startJuz": 3
  },
  {
    "number": 4,
    "nameArabic": "النساء",
    "nameTransliteration": "An-Nisa",
    "ayahCount": 176,
    "revelationType": "مدنية",
    "startJuz": 4
  },
  {
    "number": 5,
    "nameArabic": "المائدة",
    "nameTransliteration": "Al-Maidah",
    "ayahCount": 120,
    "revelationType": "مدنية",
    "startJuz": 6
  },
  {
    "number": 6,
    "nameArabic": "الأنعام",
    "nameTransliteration": "Al-Anam",
    "ayahCount": 165,
    "revelationType": "مكية",
    "startJuz": 7
  },
  {
    "number": 7,
    "nameArabic": "الأعراف",
    "nameTransliteration": "Al-Araf",
    "ayahCount": 206,
    "revelationType": "مكية",
    "startJuz": 8
  },
  {
    "number": 8,
    "nameArabic": "الأنفال",
    "nameTransliteration": "Al-Anfal",
    "ayahCount": 75,
    "revelationType": "مدنية",
    "startJuz": 9
  },
  {
    "number": 9,
    "nameArabic": "التوبة",
    "nameTransliteration": "At-Tawbah",
    "ayahCount": 129,
    "revelationType": "مدنية",
    "startJuz": 10
  },
  {
    "number": 10,
    "nameArabic": "يونس",
    "nameTransliteration": "Yunus",
    "ayahCount": 109,
    "revelationType": "مكية",
    "startJuz": 11
  },
  {
    "number": 11,
    "nameArabic": "هود",
    "nameTransliteration": "Hud",
    "ayahCount": 123,
    "revelationType": "مكية",
    "startJuz": 11
  },
  {
    "number": 12,
    "nameArabic": "يوسف",
    "nameTransliteration": "Yusuf",
    "ayahCount": 111,
    "revelationType": "مكية",
    "startJuz": 12
  },
  {
    "number": 13,
    "nameArabic": "الرعد",
    "nameTransliteration": "Ar-Rad",
    "ayahCount": 43,
    "revelationType": "مدنية",
    "startJuz": 13
  },
  {
    "number": 14,
    "nameArabic": "إبراهيم",
    "nameTransliteration": "Ibrahim",
    "ayahCount": 52,
    "revelationType": "مكية",
    "startJuz": 13
  },
  {
    "number": 15,
    "nameArabic": "الحجر",
    "nameTransliteration": "Al-Hijr",
    "ayahCount": 99,
    "revelationType": "مكية",
    "startJuz": 14
  },
  {
    "number": 16,
    "nameArabic": "النحل",
    "nameTransliteration": "An-Nahl",
    "ayahCount": 128,
    "revelationType": "مكية",
    "startJuz": 14
  },
  {
    "number": 17,
    "nameArabic": "الإسراء",
    "nameTransliteration": "Al-Isra",
    "ayahCount": 111,
    "revelationType": "مكية",
    "startJuz": 15
  },
  {
    "number": 18,
    "nameArabic": "الكهف",
    "nameTransliteration": "Al-Kahf",
    "ayahCount": 110,
    "revelationType": "مكية",
    "startJuz": 15
  },
  {
    "number": 19,
    "nameArabic": "مريم",
    "nameTransliteration": "Maryam",
    "ayahCount": 98,
    "revelationType": "مكية",
    "startJuz": 16
  },
  {
    "number": 20,
    "nameArabic": "طه",
    "nameTransliteration": "Taha",
    "ayahCount": 135,
    "revelationType": "مكية",
    "startJuz": 16
  },
  {
    "number": 21,
    "nameArabic": "الأنبياء",
    "nameTransliteration": "Al-Anbiya",
    "ayahCount": 112,
    "revelationType": "مكية",
    "startJuz": 17
  },
  {
    "number": 22,
    "nameArabic": "الحج",
    "nameTransliteration": "Al-Hajj",
    "ayahCount": 78,
    "revelationType": "مدنية",
    "startJuz": 17
  },
  {
    "number": 23,
    "nameArabic": "المؤمنون",
    "nameTransliteration": "Al-Muminun",
    "ayahCount": 118,
    "revelationType": "مكية",
    "startJuz": 18
  },
  {
    "number": 24,
    "nameArabic": "النور",
    "nameTransliteration": "An-Nur",
    "ayahCount": 64,
    "revelationType": "مدنية",
    "startJuz": 18
  },
  {
    "number": 25,
    "nameArabic": "الفرقان",
    "nameTransliteration": "Al-Furqan",
    "ayahCount": 77,
    "revelationType": "مكية",
    "startJuz": 18
  },
  {
    "number": 26,
    "nameArabic": "الشعراء",
    "nameTransliteration": "Ash-Shuara",
    "ayahCount": 227,
    "revelationType": "مكية",
    "startJuz": 19
  },
  {
    "number": 27,
    "nameArabic": "النمل",
    "nameTransliteration": "An-Naml",
    "ayahCount": 93,
    "revelationType": "مكية",
    "startJuz": 19
  },
  {
    "number": 28,
    "nameArabic": "القصص",
    "nameTransliteration": "Al-Qasas",
    "ayahCount": 88,
    "revelationType": "مكية",
    "startJuz": 20
  },
  {
    "number": 29,
    "nameArabic": "العنكبوت",
    "nameTransliteration": "Al-Ankabut",
    "ayahCount": 69,
    "revelationType": "مكية",
    "startJuz": 20
  },
  {
    "number": 30,
    "nameArabic": "الروم",
    "nameTransliteration": "Ar-Rum",
    "ayahCount": 60,
    "revelationType": "مكية",
    "startJuz": 21
  },
  {
    "number": 31,
    "nameArabic": "لقمان",
    "nameTransliteration": "Luqman",
    "ayahCount": 34,
    "revelationType": "مكية",
    "startJuz": 21
  },
  {
    "number": 32,
    "nameArabic": "السجدة",
    "nameTransliteration": "As-Sajdah",
    "ayahCount": 30,
    "revelationType": "مكية",
    "startJuz": 21
  },
  {
    "number": 33,
    "nameArabic": "الأحزاب",
    "nameTransliteration": "Al-Ahzab",
    "ayahCount": 73,
    "revelationType": "مدنية",
    "startJuz": 21
  },
  {
    "number": 34,
    "nameArabic": "سبأ",
    "nameTransliteration": "Saba",
    "ayahCount": 54,
    "revelationType": "مكية",
    "startJuz": 22
  },
  {
    "number": 35,
    "nameArabic": "فاطر",
    "nameTransliteration": "Fatir",
    "ayahCount": 45,
    "revelationType": "مكية",
    "startJuz": 22
  },
  {
    "number": 36,
    "nameArabic": "يس",
    "nameTransliteration": "Ya-Sin",
    "ayahCount": 83,
    "revelationType": "مكية",
    "startJuz": 22
  },
  {
    "number": 37,
    "nameArabic": "الصافات",
    "nameTransliteration": "As-Saffat",
    "ayahCount": 182,
    "revelationType": "مكية",
    "startJuz": 23
  },
  {
    "number": 38,
    "nameArabic": "ص",
    "nameTransliteration": "Sad",
    "ayahCount": 88,
    "revelationType": "مكية",
    "startJuz": 23
  },
  {
    "number": 39,
    "nameArabic": "الزمر",
    "nameTransliteration": "Az-Zumar",
    "ayahCount": 75,
    "revelationType": "مكية",
    "startJuz": 23
  },
  {
    "number": 40,
    "nameArabic": "غافر",
    "nameTransliteration": "Ghafir",
    "ayahCount": 85,
    "revelationType": "مكية",
    "startJuz": 24
  },
  {
    "number": 41,
    "nameArabic": "فصلت",
    "nameTransliteration": "Fussilat",
    "ayahCount": 54,
    "revelationType": "مكية",
    "startJuz": 24
  },
  {
    "number": 42,
    "nameArabic": "الشورى",
    "nameTransliteration": "Ash-Shura",
    "ayahCount": 53,
    "revelationType": "مكية",
    "startJuz": 25
  },
  {
    "number": 43,
    "nameArabic": "الزخرف",
    "nameTransliteration": "Az-Zukhruf",
    "ayahCount": 89,
    "revelationType": "مكية",
    "startJuz": 25
  },
  {
    "number": 44,
    "nameArabic": "الدخان",
    "nameTransliteration": "Ad-Dukhan",
    "ayahCount": 59,
    "revelationType": "مكية",
    "startJuz": 25
  },
  {
    "number": 45,
    "nameArabic": "الجاثية",
    "nameTransliteration": "Al-Jathiyah",
    "ayahCount": 37,
    "revelationType": "مكية",
    "startJuz": 25
  },
  {
    "number": 46,
    "nameArabic": "الأحقاف",
    "nameTransliteration": "Al-Ahqaf",
    "ayahCount": 35,
    "revelationType": "مكية",
    "startJuz": 26
  },
  {
    "number": 47,
    "nameArabic": "محمد",
    "nameTransliteration": "Muhammad",
    "ayahCount": 38,
    "revelationType": "مدنية",
    "startJuz": 26
  },
  {
    "number": 48,
    "nameArabic": "الفتح",
    "nameTransliteration": "Al-Fath",
    "ayahCount": 29,
    "revelationType": "مدنية",
    "startJuz": 26
  },
  {
    "number": 49,
    "nameArabic": "الحجرات",
    "nameTransliteration": "Al-Hujurat",
    "ayahCount": 18,
    "revelationType": "مدنية",
    "startJuz": 26
  },
  {
    "number": 50,
    "nameArabic": "ق",
    "nameTransliteration": "Qaf",
    "ayahCount": 45,
    "revelationType": "مكية",
    "startJuz": 26
  },
  {
    "number": 51,
    "nameArabic": "الذاريات",
    "nameTransliteration": "Adh-Dhariyat",
    "ayahCount": 60,
    "revelationType": "مكية",
    "startJuz": 26
  },
  {
    "number": 52,
    "nameArabic": "الطور",
    "nameTransliteration": "At-Tur",
    "ayahCount": 49,
    "revelationType": "مكية",
    "startJuz": 27
  },
  {
    "number": 53,
    "nameArabic": "النجم",
    "nameTransliteration": "An-Najm",
    "ayahCount": 62,
    "revelationType": "مكية",
    "startJuz": 27
  },
  {
    "number": 54,
    "nameArabic": "القمر",
    "nameTransliteration": "Al-Qamar",
    "ayahCount": 55,
    "revelationType": "مكية",
    "startJuz": 27
  },
  {
    "number": 55,
    "nameArabic": "الرحمن",
    "nameTransliteration": "Ar-Rahman",
    "ayahCount": 78,
    "revelationType": "مدنية",
    "startJuz": 27
  },
  {
    "number": 56,
    "nameArabic": "الواقعة",
    "nameTransliteration": "Al-Waqiah",
    "ayahCount": 96,
    "revelationType": "مكية",
    "startJuz": 27
  },
  {
    "number": 57,
    "nameArabic": "الحديد",
    "nameTransliteration": "Al-Hadid",
    "ayahCount": 29,
    "revelationType": "مدنية",
    "startJuz": 27
  },
  {
    "number": 58,
    "nameArabic": "المجادلة",
    "nameTransliteration": "Al-Mujadila",
    "ayahCount": 22,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 59,
    "nameArabic": "الحشر",
    "nameTransliteration": "Al-Hashr",
    "ayahCount": 24,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 60,
    "nameArabic": "الممتحنة",
    "nameTransliteration": "Al-Mumtahanah",
    "ayahCount": 13,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 61,
    "nameArabic": "الصف",
    "nameTransliteration": "As-Saff",
    "ayahCount": 14,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 62,
    "nameArabic": "الجمعة",
    "nameTransliteration": "Al-Jumuah",
    "ayahCount": 11,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 63,
    "nameArabic": "المنافقون",
    "nameTransliteration": "Al-Munafiqun",
    "ayahCount": 11,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 64,
    "nameArabic": "التغابن",
    "nameTransliteration": "At-Taghabun",
    "ayahCount": 18,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 65,
    "nameArabic": "الطلاق",
    "nameTransliteration": "At-Talaq",
    "ayahCount": 12,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 66,
    "nameArabic": "التحريم",
    "nameTransliteration": "At-Tahrim",
    "ayahCount": 12,
    "revelationType": "مدنية",
    "startJuz": 28
  },
  {
    "number": 67,
    "nameArabic": "الملك",
    "nameTransliteration": "Al-Mulk",
    "ayahCount": 30,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 68,
    "nameArabic": "القلم",
    "nameTransliteration": "Al-Qalam",
    "ayahCount": 52,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 69,
    "nameArabic": "الحاقة",
    "nameTransliteration": "Al-Haqqah",
    "ayahCount": 52,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 70,
    "nameArabic": "المعارج",
    "nameTransliteration": "Al-Maarij",
    "ayahCount": 44,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 71,
    "nameArabic": "نوح",
    "nameTransliteration": "Nuh",
    "ayahCount": 28,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 72,
    "nameArabic": "الجن",
    "nameTransliteration": "Al-Jinn",
    "ayahCount": 28,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 73,
    "nameArabic": "المزمل",
    "nameTransliteration": "Al-Muzzammil",
    "ayahCount": 20,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 74,
    "nameArabic": "المدثر",
    "nameTransliteration": "Al-Muddaththir",
    "ayahCount": 56,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 75,
    "nameArabic": "القيامة",
    "nameTransliteration": "Al-Qiyamah",
    "ayahCount": 40,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 76,
    "nameArabic": "الإنسان",
    "nameTransliteration": "Al-Insan",
    "ayahCount": 31,
    "revelationType": "مدنية",
    "startJuz": 29
  },
  {
    "number": 77,
    "nameArabic": "المرسلات",
    "nameTransliteration": "Al-Mursalat",
    "ayahCount": 50,
    "revelationType": "مكية",
    "startJuz": 29
  },
  {
    "number": 78,
    "nameArabic": "النبأ",
    "nameTransliteration": "An-Naba",
    "ayahCount": 40,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 79,
    "nameArabic": "النازعات",
    "nameTransliteration": "An-Naziat",
    "ayahCount": 46,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 80,
    "nameArabic": "عبس",
    "nameTransliteration": "Abasa",
    "ayahCount": 42,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 81,
    "nameArabic": "التكوير",
    "nameTransliteration": "At-Takwir",
    "ayahCount": 29,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 82,
    "nameArabic": "الانفطار",
    "nameTransliteration": "Al-Infitar",
    "ayahCount": 19,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 83,
    "nameArabic": "المطففين",
    "nameTransliteration": "Al-Mutaffifin",
    "ayahCount": 36,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 84,
    "nameArabic": "الانشقاق",
    "nameTransliteration": "Al-Inshiqaq",
    "ayahCount": 25,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 85,
    "nameArabic": "البروج",
    "nameTransliteration": "Al-Buruj",
    "ayahCount": 22,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 86,
    "nameArabic": "الطارق",
    "nameTransliteration": "At-Tariq",
    "ayahCount": 17,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 87,
    "nameArabic": "الأعلى",
    "nameTransliteration": "Al-Ala",
    "ayahCount": 19,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 88,
    "nameArabic": "الغاشية",
    "nameTransliteration": "Al-Ghashiyah",
    "ayahCount": 26,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 89,
    "nameArabic": "الفجر",
    "nameTransliteration": "Al-Fajr",
    "ayahCount": 30,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 90,
    "nameArabic": "البلد",
    "nameTransliteration": "Al-Balad",
    "ayahCount": 20,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 91,
    "nameArabic": "الشمس",
    "nameTransliteration": "Ash-Shams",
    "ayahCount": 15,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 92,
    "nameArabic": "الليل",
    "nameTransliteration": "Al-Layl",
    "ayahCount": 21,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 93,
    "nameArabic": "الضحى",
    "nameTransliteration": "Ad-Duha",
    "ayahCount": 11,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 94,
    "nameArabic": "الشرح",
    "nameTransliteration": "Ash-Sharh",
    "ayahCount": 8,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 95,
    "nameArabic": "التين",
    "nameTransliteration": "At-Tin",
    "ayahCount": 8,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 96,
    "nameArabic": "العلق",
    "nameTransliteration": "Al-Alaq",
    "ayahCount": 19,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 97,
    "nameArabic": "القدر",
    "nameTransliteration": "Al-Qadr",
    "ayahCount": 5,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 98,
    "nameArabic": "البينة",
    "nameTransliteration": "Al-Bayyinah",
    "ayahCount": 8,
    "revelationType": "مدنية",
    "startJuz": 30
  },
  {
    "number": 99,
    "nameArabic": "الزلزلة",
    "nameTransliteration": "Az-Zalzalah",
    "ayahCount": 8,
    "revelationType": "مدنية",
    "startJuz": 30
  },
  {
    "number": 100,
    "nameArabic": "العاديات",
    "nameTransliteration": "Al-Adiyat",
    "ayahCount": 11,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 101,
    "nameArabic": "القارعة",
    "nameTransliteration": "Al-Qariah",
    "ayahCount": 11,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 102,
    "nameArabic": "التكاثر",
    "nameTransliteration": "At-Takathur",
    "ayahCount": 8,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 103,
    "nameArabic": "العصر",
    "nameTransliteration": "Al-Asr",
    "ayahCount": 3,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 104,
    "nameArabic": "الهمزة",
    "nameTransliteration": "Al-Humazah",
    "ayahCount": 9,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 105,
    "nameArabic": "الفيل",
    "nameTransliteration": "Al-Fil",
    "ayahCount": 5,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 106,
    "nameArabic": "قريش",
    "nameTransliteration": "Quraysh",
    "ayahCount": 4,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 107,
    "nameArabic": "الماعون",
    "nameTransliteration": "Al-Maun",
    "ayahCount": 7,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 108,
    "nameArabic": "الكوثر",
    "nameTransliteration": "Al-Kawthar",
    "ayahCount": 3,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 109,
    "nameArabic": "الكافرون",
    "nameTransliteration": "Al-Kafirun",
    "ayahCount": 6,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 110,
    "nameArabic": "النصر",
    "nameTransliteration": "An-Nasr",
    "ayahCount": 3,
    "revelationType": "مدنية",
    "startJuz": 30
  },
  {
    "number": 111,
    "nameArabic": "المسد",
    "nameTransliteration": "Al-Masad",
    "ayahCount": 5,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 112,
    "nameArabic": "الإخلاص",
    "nameTransliteration": "Al-Ikhlas",
    "ayahCount": 4,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 113,
    "nameArabic": "الفلق",
    "nameTransliteration": "Al-Falaq",
    "ayahCount": 5,
    "revelationType": "مكية",
    "startJuz": 30
  },
  {
    "number": 114,
    "nameArabic": "الناس",
    "nameTransliteration": "An-Nas",
    "ayahCount": 6,
    "revelationType": "مكية",
    "startJuz": 30
  }
];

export const JUZS: JuzMeta[] = [
  {
    "juzNumber": 1,
    "nameArabic": "الجزء الأول",
    "startSurah": 1,
    "startAyah": 1,
    "endSurah": 2,
    "endAyah": 141
  },
  {
    "juzNumber": 2,
    "nameArabic": "الجزء الثاني (سيقول)",
    "startSurah": 2,
    "startAyah": 142,
    "endSurah": 2,
    "endAyah": 252
  },
  {
    "juzNumber": 3,
    "nameArabic": "الجزء الثالث (تلك الرسل)",
    "startSurah": 2,
    "startAyah": 253,
    "endSurah": 3,
    "endAyah": 92
  },
  {
    "juzNumber": 4,
    "nameArabic": "الجزء الرابع (لن تنالوا)",
    "startSurah": 3,
    "startAyah": 93,
    "endSurah": 4,
    "endAyah": 23
  },
  {
    "juzNumber": 5,
    "nameArabic": "الجزء الخامس (والمحصنات)",
    "startSurah": 4,
    "startAyah": 24,
    "endSurah": 4,
    "endAyah": 147
  },
  {
    "juzNumber": 6,
    "nameArabic": "الجزء السادس (لا يحب الله)",
    "startSurah": 4,
    "startAyah": 148,
    "endSurah": 5,
    "endAyah": 81
  },
  {
    "juzNumber": 7,
    "nameArabic": "الجزء السابع (وإذا سمعوا)",
    "startSurah": 5,
    "startAyah": 82,
    "endSurah": 6,
    "endAyah": 110
  },
  {
    "juzNumber": 8,
    "nameArabic": "الجزء الثامن (ولو أننا)",
    "startSurah": 6,
    "startAyah": 111,
    "endSurah": 7,
    "endAyah": 87
  },
  {
    "juzNumber": 9,
    "nameArabic": "الجزء التاسع (قال الملأ)",
    "startSurah": 7,
    "startAyah": 88,
    "endSurah": 8,
    "endAyah": 40
  },
  {
    "juzNumber": 10,
    "nameArabic": "الجزء العاشر (واعلموا)",
    "startSurah": 8,
    "startAyah": 41,
    "endSurah": 9,
    "endAyah": 92
  },
  {
    "juzNumber": 11,
    "nameArabic": "الجزء الحادي عشر (يعتذرون)",
    "startSurah": 9,
    "startAyah": 93,
    "endSurah": 11,
    "endAyah": 5
  },
  {
    "juzNumber": 12,
    "nameArabic": "الجزء الثاني عشر (وما من دابة)",
    "startSurah": 11,
    "startAyah": 6,
    "endSurah": 12,
    "endAyah": 52
  },
  {
    "juzNumber": 13,
    "nameArabic": "الجزء الثالث عشر (وما أبرئ)",
    "startSurah": 12,
    "startAyah": 53,
    "endSurah": 14,
    "endAyah": 52
  },
  {
    "juzNumber": 14,
    "nameArabic": "الجزء الرابع عشر (ربما)",
    "startSurah": 15,
    "startAyah": 1,
    "endSurah": 16,
    "endAyah": 128
  },
  {
    "juzNumber": 15,
    "nameArabic": "الجزء الخامس عشر (سبحان)",
    "startSurah": 17,
    "startAyah": 1,
    "endSurah": 18,
    "endAyah": 74
  },
  {
    "juzNumber": 16,
    "nameArabic": "الجزء السادس عشر (قال ألم)",
    "startSurah": 18,
    "startAyah": 75,
    "endSurah": 20,
    "endAyah": 135
  },
  {
    "juzNumber": 17,
    "nameArabic": "الجزء السابع عشر (اقترب)",
    "startSurah": 21,
    "startAyah": 1,
    "endSurah": 22,
    "endAyah": 78
  },
  {
    "juzNumber": 18,
    "nameArabic": "الجزء الثامن عشر (قد أفلح)",
    "startSurah": 23,
    "startAyah": 1,
    "endSurah": 25,
    "endAyah": 20
  },
  {
    "juzNumber": 19,
    "nameArabic": "الجزء التاسع عشر (وقال الذين)",
    "startSurah": 25,
    "startAyah": 21,
    "endSurah": 27,
    "endAyah": 55
  },
  {
    "juzNumber": 20,
    "nameArabic": "الجزء العشرون (أمن خلق)",
    "startSurah": 27,
    "startAyah": 56,
    "endSurah": 29,
    "endAyah": 45
  },
  {
    "juzNumber": 21,
    "nameArabic": "الجزء الحادي والعشرون (اتل ما أوحي)",
    "startSurah": 29,
    "startAyah": 46,
    "endSurah": 33,
    "endAyah": 30
  },
  {
    "juzNumber": 22,
    "nameArabic": "الجزء الثاني والعشرون (ومن يقنت)",
    "startSurah": 33,
    "startAyah": 31,
    "endSurah": 36,
    "endAyah": 27
  },
  {
    "juzNumber": 23,
    "nameArabic": "الجزء الثالث والعشرون (وما أنزلنا)",
    "startSurah": 36,
    "startAyah": 28,
    "endSurah": 39,
    "endAyah": 31
  },
  {
    "juzNumber": 24,
    "nameArabic": "الجزء الرابع والعشرون (فمن أظلم)",
    "startSurah": 39,
    "startAyah": 32,
    "endSurah": 41,
    "endAyah": 46
  },
  {
    "juzNumber": 25,
    "nameArabic": "الجزء الخامس والعشرون (إليه يرد)",
    "startSurah": 41,
    "startAyah": 47,
    "endSurah": 45,
    "endAyah": 37
  },
  {
    "juzNumber": 26,
    "nameArabic": "الجزء السادس والعشرون (حم)",
    "startSurah": 46,
    "startAyah": 1,
    "endSurah": 51,
    "endAyah": 30
  },
  {
    "juzNumber": 27,
    "nameArabic": "الجزء السابع والعشرون (قال فما خطبكم)",
    "startSurah": 51,
    "startAyah": 31,
    "endSurah": 57,
    "endAyah": 29
  },
  {
    "juzNumber": 28,
    "nameArabic": "الجزء الثامن والعشرون (قد سمع)",
    "startSurah": 58,
    "startAyah": 1,
    "endSurah": 66,
    "endAyah": 12
  },
  {
    "juzNumber": 29,
    "nameArabic": "الجزء التاسع والعشرون (تبارك)",
    "startSurah": 67,
    "startAyah": 1,
    "endSurah": 77,
    "endAyah": 50
  },
  {
    "juzNumber": 30,
    "nameArabic": "الجزء الثلاثون (عم)",
    "startSurah": 78,
    "startAyah": 1,
    "endSurah": 114,
    "endAyah": 6
  }
];

// Map for O(1) lookups
const surahMap = new Map<number, SurahMeta>(SURAHS.map((s) => [s.number, s]));

export function getSurah(number: number): SurahMeta | undefined {
  return surahMap.get(number);
}

export function getAyahCount(surahNumber: number): number {
  return surahMap.get(surahNumber)?.ayahCount ?? 0;
}

export function isValidAyah(surahNumber: number, ayahNumber: number): boolean {
  const surah = surahMap.get(surahNumber);
  if (!surah) return false;
  return ayahNumber >= 1 && ayahNumber <= surah.ayahCount;
}

/**
 * Compare two Quran positions: returns -1 if A < B, 0 if A == B, 1 if A > B
 */
export function compareQuranPositions(
  surahA: number,
  ayahA: number,
  surahB: number,
  ayahB: number
): number {
  if (surahA < surahB) return -1;
  if (surahA > surahB) return 1;
  if (ayahA < ayahB) return -1;
  if (ayahA > ayahB) return 1;
  return 0;
}

/**
 * Validates whether a range (startSurah:startAyah -> endSurah:endAyah) is valid and forward.
 */
export function isValidRange(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): boolean {
  if (!isValidAyah(startSurah, startAyah)) return false;
  if (!isValidAyah(endSurah, endAyah)) return false;
  return compareQuranPositions(startSurah, startAyah, endSurah, endAyah) <= 0;
}

/**
 * Calculates the exact canonical Ayah count within a range, correctly handling cross-Surah spans.
 */
export function getRangeAyahCount(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): number {
  if (!isValidRange(startSurah, startAyah, endSurah, endAyah)) return 0;

  if (startSurah === endSurah) {
    return endAyah - startAyah + 1;
  }

  let count = 0;
  // First surah partial
  const firstSurah = surahMap.get(startSurah)!;
  count += firstSurah.ayahCount - startAyah + 1;

  // Intermediate surahs
  for (let s = startSurah + 1; s < endSurah; s++) {
    count += surahMap.get(s)?.ayahCount ?? 0;
  }

  // Final surah partial
  count += endAyah;
  return count;
}

/**
 * Converts a range into a unique set of string keys 'surah:ayah'
 */
export function getAyahKeysForRange(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): string[] {
  if (!isValidRange(startSurah, startAyah, endSurah, endAyah)) return [];
  const keys: string[] = [];

  for (let s = startSurah; s <= endSurah; s++) {
    const sMeta = surahMap.get(s);
    if (!sMeta) continue;

    const fromAyah = s === startSurah ? startAyah : 1;
    const toAyah = s === endSurah ? endAyah : sMeta.ayahCount;

    for (let a = fromAyah; a <= toAyah; a++) {
      keys.push(`${s}:${a}`);
    }
  }

  return keys;
}

/**
 * Merges multiple ranges and returns the count of unique memorized ayahs (never double-counting).
 */
export function getUniqueAyahCount(ranges: QuranRange[]): number {
  const set = new Set<string>();
  for (const r of ranges) {
    const keys = getAyahKeysForRange(r.startSurah, r.startAyah, r.endSurah, r.endAyah);
    for (const k of keys) {
      set.add(k);
    }
  }
  return set.size;
}

/**
 * Pretty formats a Quran range in Arabic
 */
export function formatQuranRange(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): string {
  const sStart = surahMap.get(startSurah)?.nameArabic ?? `${startSurah}`;
  const sEnd = surahMap.get(endSurah)?.nameArabic ?? `${endSurah}`;

  if (startSurah === endSurah) {
    if (startAyah === endAyah) {
      return `سورة ${sStart}: الآية ${startAyah}`;
    }
    const maxAyahs = surahMap.get(startSurah)?.ayahCount ?? 0;
    if (startAyah === 1 && endAyah === maxAyahs) {
      return `سورة ${sStart} (كاملة)`;
    }
    return `سورة ${sStart}: الآيات (${startAyah} - ${endAyah})`;
  }

  return `من سورة ${sStart}: [${startAyah}] إلى سورة ${sEnd}: [${endAyah}]`;
}

/**
 * Returns canonical Juz for a given surah & ayah position
 */
export function getJuzForPosition(surah: number, ayah: number): number {
  for (const j of JUZS) {
    const afterStart = compareQuranPositions(surah, ayah, j.startSurah, j.startAyah) >= 0;
    const beforeEnd = compareQuranPositions(surah, ayah, j.endSurah, j.endAyah) <= 0;
    if (afterStart && beforeEnd) return j.juzNumber;
  }
  return 1;
}
