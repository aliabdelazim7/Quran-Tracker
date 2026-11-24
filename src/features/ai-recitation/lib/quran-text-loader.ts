import { AyahDisplayItem } from '../types/recitation';

const cache = new Map<string, AyahDisplayItem[]>();

export async function loadPassageText(
  surah: number,
  fromAyah: number,
  toAyah: number
): Promise<AyahDisplayItem[]> {
  const cacheKey = `${surah}:${fromAyah}:${toAyah}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/quran/passage?surah=${surah}&from=${fromAyah}&to=${toAyah}`);
    if (!res.ok) {
      throw new Error(`Failed to load passage: ${res.statusText}`);
    }
    const data = await res.json();
    const ayahs: AyahDisplayItem[] = data.ayahs || [];
    cache.set(cacheKey, ayahs);
    return ayahs;
  } catch (err) {
    console.error('Error fetching passage text:', err);
    return [];
  }
}
