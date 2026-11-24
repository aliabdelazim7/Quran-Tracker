
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
