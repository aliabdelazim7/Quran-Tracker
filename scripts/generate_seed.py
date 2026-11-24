import re
import json

with open('quran-app/src/data/quranData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract SURAHS json
match = re.search(r'export const SURAHS: SurahMeta\[\] = (\[.*?\]);', text, re.DOTALL)
surahs = json.loads(match.group(1))

sql = ['-- Canonical Quran Surahs Seed Data']
sql.append('INSERT INTO public.quran_surahs (surah_number, name_arabic, name_transliteration, ayah_count, revelation_type, start_juz) VALUES')
values = []
for s in surahs:
    num = s['number']
    ar = s['nameArabic'].replace("'", "''")
    tr = s['nameTransliteration'].replace("'", "''")
    cnt = s['ayahCount']
    rev = s['revelationType']
    juz = s['startJuz']
    values.append(f"({num}, '{ar}', '{tr}', {cnt}, '{rev}', {juz})")

sql.append(',\n'.join(values) + ' ON CONFLICT (surah_number) DO NOTHING;\n')

# Motivational Messages Seed
sql.append('-- Verified Motivational Messages Seed Data')
quotes = [
    ('religious', 'إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ وَأَنفَقُوا مِمَّا رَزَقْنَاهُمْ سِرًّا وَعَلَانِيَةً يَرْجُونَ تِجَارَةً لَّن تَبُورَ', 'quran', 'سورة فاطر: 29', 'قرآن كريم'),
    ('religious', 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ', 'quran', 'سورة القمر: 17', 'قرآن كريم'),
    ('religious', 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'hadith', 'صحيح البخاري (5027)', 'صحيح البخاري'),
    ('religious', 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ، وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ', 'hadith', 'صحيح مسلم (798)', 'صحيح مسلم'),
    ('hasanat_virtue', 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا، لَا أَقُولُ ألم حَرْفٌ، وَلَكِنْ أَلِفٌ حَرْفٌ وَلَامٌ حَرْفٌ وَمِيمٌ حَرْفٌ', 'hadith', 'سنن الترمذي (2910)', 'صحيح الترمذي'),
    ('personal_egyptian', 'يا صاحبي، افتح المصحف حتى لو عشر دقايق بس.. متستناش اليوم اللي تكون فيه فاضي تمامًا، البركة بتيجي مع البداية.', 'egyptian_companion', 'رفيقك القرآني', 'verified'),
    ('personal_egyptian', 'بص أنت قطعت شوط قد إيه! فاكر أول ما بدأت تحفظ؟ كمل، أنت بتغرس نور ثابت في قلبك وعقلك.', 'egyptian_companion', 'رفيقك القرآني', 'verified'),
    ('welcome_back', 'حمدًا لله على رجوعك يا صاحبي ❤️ نورت مصحفك من تاني.. مفيش أي زعل ولا لوم، المهم إنك رجعت.', 'egyptian_companion', 'رفيقك القرآني', 'verified')
]

sql.append('INSERT INTO public.motivational_messages (category, message, source_type, source_reference, authenticity_status, active) VALUES')
q_vals = []
for q in quotes:
    msg = q[1].replace("'", "''")
    ref = q[3].replace("'", "''")
    q_vals.append(f"('{q[0]}', '{msg}', '{q[2]}', '{ref}', '{q[4]}', true)")

sql.append(',\n'.join(q_vals) + ';')

with open('quran-app/supabase/seed.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql))

print('Seed file generated at quran-app/supabase/seed.sql successfully!')
