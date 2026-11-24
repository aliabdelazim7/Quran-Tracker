import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AyahRef {
  s: number;
  a: number;
  w: string[];
}

let cachedRef: AyahRef[] | null = null;

function getAyahsIndex(): AyahRef[] {
  if (cachedRef) return cachedRef;
  try {
    const filePath = path.join(process.cwd(), 'node_modules', '@tilawa', 'core', 'assets', 'ref-v2.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      cachedRef = data.ayahs || [];
      return cachedRef!;
    }
  } catch (err) {
    console.error('Failed to load ref-v2.json in API route:', err);
  }
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const surahStr = searchParams.get('surah');
  const fromStr = searchParams.get('from');
  const toStr = searchParams.get('to');

  if (!surahStr) {
    return NextResponse.json({ error: 'Missing surah parameter' }, { status: 400 });
  }

  const surah = parseInt(surahStr, 10);
  const from = fromStr ? parseInt(fromStr, 10) : 1;
  const to = toStr ? parseInt(toStr, 10) : 286;

  if (isNaN(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: 'Invalid surah number' }, { status: 400 });
  }

  const allAyahs = getAyahsIndex();
  const matched = allAyahs
    .filter((ay) => ay.s === surah && ay.a >= from && ay.a <= to)
    .map((ay) => ({
      surah: ay.s,
      ayah: ay.a,
      text: ay.w.join(' '),
      words: ay.w.map((w, idx) => ({
        surah: ay.s,
        ayah: ay.a,
        wordIndex: idx,
        text: w,
      })),
    }));

  return NextResponse.json({
    surah,
    from,
    to,
    count: matched.length,
    ayahs: matched,
  });
}
