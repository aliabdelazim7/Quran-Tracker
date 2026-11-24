import json
import re

with open('quran-app/src/data/quranData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

match_surahs = re.search(r'export const SURAHS: SurahMeta\[\] = (\[.*?\]);', text, re.DOTALL)
surahs = json.loads(match_surahs.group(1))

match_juz = re.search(r'export const JUZS: JuzMeta\[\] = (\[.*?\]);', text, re.DOTALL)
juzs = json.loads(match_juz.group(1))

# Let's map each of the 6236 ayahs to its global ayah number, juz, hizb, rub
ayahs_list = []
global_idx = 1

# Map juz boundaries
def get_juz(s, a):
    for j in juzs:
        # compare
        start_ok = (s > j['startSurah']) or (s == j['startSurah'] and a >= j['startAyah'])
        end_ok = (s < j['endSurah']) or (s == j['endSurah'] and a <= j['endAyah'])
        if start_ok and end_ok:
            return j['juzNumber']
    return 1

for s in surahs:
    s_num = s['number']
    cnt = s['ayahCount']
    for a in range(1, cnt + 1):
        j_num = get_juz(s_num, a)
        h_num = min(60, (j_num - 1) * 2 + (1 if a <= cnt / 2 else 2)) # approximation or canonical
        ayahs_list.append({
            'global_ayah_number': global_idx,
            'surah_number': s_num,
            'ayah_number': a,
            'juz_number': j_num
        })
        global_idx += 1

print(f'Total Ayahs mapped: {len(ayahs_list)}')
assert len(ayahs_list) == 6236

# Generate SQL procedure for Supabase
sql_proc = '''
-- Procedural population of all 6,236 canonical Quran ayahs
CREATE OR REPLACE FUNCTION public.populate_canonical_quran_ayahs()
RETURNS VOID AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.quran_ayahs;
  IF v_count >= 6236 THEN
    RETURN;
  END IF;

  -- Insert all canonical ayahs from 1 to 6236 based on Hafs narration
  INSERT INTO public.quran_ayahs (surah_number, ayah_number, global_ayah_number, juz_number, hizb_number, rub_number)
  SELECT 
    s.surah_number,
    a.ayah_seq,
    ROW_NUMBER() OVER (ORDER BY s.surah_number, a.ayah_seq) AS global_ayah_num,
    s.start_juz,
    ((s.start_juz - 1) * 2 + 1) AS hizb_num,
    ((s.start_juz - 1) * 8 + 1) AS rub_num
  FROM public.quran_surahs s
  CROSS JOIN LATERAL generate_series(1, s.ayah_count) AS a(ayah_seq)
  ON CONFLICT (surah_number, ayah_number) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute population
SELECT public.populate_canonical_quran_ayahs();
'''

with open('quran-app/supabase/migrations/20261124_ayahs_population.sql', 'w', encoding='utf-8') as f:
    f.write(sql_proc)

print('Generated 20261124_ayahs_population.sql')
