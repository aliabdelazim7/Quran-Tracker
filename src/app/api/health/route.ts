import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  // Use request to ensure route is evaluated dynamically per request
  const url = request.url;
  const startTime = Date.now();
  let dbStatus: 'pass' | 'fail' = 'pass';
  let latencyMs = 0;
  let overallHealthy = true;

  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const dbCheckPromise = supabase
        .from('quran_surahs')
        .select('surah_number', { head: true, count: 'exact' });

      // 5-second timeout for health check
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 5000)
      );

      const result = (await Promise.race([dbCheckPromise, timeoutPromise])) as {
        error?: { message?: string } | null;
      };

      if (result && result.error) {
        dbStatus = 'fail';
        overallHealthy = false;
      }
    } else {
      // In offline/demo mode, DB check passes conditionally
      dbStatus = 'pass';
    }
  } catch {
    dbStatus = 'fail';
    overallHealthy = false;
  }

  latencyMs = Date.now() - startTime;

  const payload = {
    status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    checks: {
      liveness: 'pass',
      readiness: overallHealthy ? 'pass' : 'fail',
      database: dbStatus,
      latencyMs,
    },
    version: '0.1.0',
    service: 'quran-tracker-api',
  };

  return NextResponse.json(payload, {
    status: overallHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

export async function HEAD(request: NextRequest) {
  const res = await GET(request);
  return new NextResponse(null, {
    status: res.status,
    headers: res.headers,
  });
}
