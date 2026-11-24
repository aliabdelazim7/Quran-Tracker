/**
 * Staging Load Testing & Benchmarking Harness
 * Simulates realistic Student & Sheikh user journeys against local/staging server.
 * Measures throughput, error rate, and p50, p90, p95, p99 latencies.
 */

interface RequestMetrics {
  durationMs: number;
  statusCode: number;
  success: boolean;
  endpoint: string;
}

interface StageResult {
  virtualUsers: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRatePercent: number;
  throughputRps: number;
  minMs: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
}

const BASE_URL = process.env.STAGING_URL || 'http://localhost:3000';

const ENDPOINTS = [
  '/api/health',
  '/',
  '/login',
  '/register',
  '/student/dashboard',
  '/student/memorization',
  '/student/revision',
  '/student/reading',
  '/sheikh/dashboard',
  '/sheikh/students',
  '/sheikh/invitations',
  '/quran',
];

async function executeRequest(endpoint: string): Promise<RequestMetrics> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'text/html,application/json',
        'User-Agent': 'QuranTrackerLoadTester/1.0',
      },
    });
    const durationMs = performance.now() - start;
    return {
      durationMs,
      statusCode: res.status,
      success: res.status >= 200 && res.status < 400,
      endpoint,
    };
  } catch (err) {
    const durationMs = performance.now() - start;
    return {
      durationMs,
      statusCode: 0,
      success: false,
      endpoint,
    };
  }
}

function calculatePercentile(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function runVirtualUser(iterations: number): Promise<RequestMetrics[]> {
  const metrics: RequestMetrics[] = [];
  for (let i = 0; i < iterations; i++) {
    const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    const result = await executeRequest(endpoint);
    metrics.push(result);
    // Slight jitter to simulate human reading/clicking time (10ms - 50ms)
    await new Promise((r) => setTimeout(r, 10 + Math.random() * 40));
  }
  return metrics;
}

async function runStage(vuCount: number, requestsPerVu: number): Promise<StageResult> {
  console.log(`\n▶ Starting Load Test Stage: ${vuCount} Virtual Users (${requestsPerVu} reqs/user)...`);
  const stageStart = performance.now();

  const vuPromises: Promise<RequestMetrics[]>[] = [];
  for (let i = 0; i < vuCount; i++) {
    vuPromises.push(runVirtualUser(requestsPerVu));
  }

  const results = await Promise.all(vuPromises);
  const allMetrics = results.flat();
  const totalDurationSeconds = (performance.now() - stageStart) / 1000;

  const durations = allMetrics.map((m) => m.durationMs).sort((a, b) => a - b);
  const successful = allMetrics.filter((m) => m.success).length;
  const failed = allMetrics.length - successful;

  const stageResult: StageResult = {
    virtualUsers: vuCount,
    totalRequests: allMetrics.length,
    successfulRequests: successful,
    failedRequests: failed,
    errorRatePercent: (failed / allMetrics.length) * 100,
    throughputRps: Number((allMetrics.length / totalDurationSeconds).toFixed(2)),
    minMs: Number(durations[0]?.toFixed(2) || '0'),
    p50Ms: Number(calculatePercentile(durations, 50).toFixed(2)),
    p90Ms: Number(calculatePercentile(durations, 90).toFixed(2)),
    p95Ms: Number(calculatePercentile(durations, 95).toFixed(2)),
    p99Ms: Number(calculatePercentile(durations, 99).toFixed(2)),
    maxMs: Number(durations[durations.length - 1]?.toFixed(2) || '0'),
  };

  console.log(`  ✓ Total Requests: ${stageResult.totalRequests}`);
  console.log(`  ✓ Success Rate: ${(100 - stageResult.errorRatePercent).toFixed(1)}%`);
  console.log(`  ✓ Throughput: ${stageResult.throughputRps} req/s`);
  console.log(`  ✓ Latencies: p50=${stageResult.p50Ms}ms | p90=${stageResult.p90Ms}ms | p95=${stageResult.p95Ms}ms | p99=${stageResult.p99Ms}ms | max=${stageResult.maxMs}ms`);

  return stageResult;
}

async function main() {
  console.log(`=======================================================`);
  console.log(` Quran Tracker — Staging Load Testing & Capacity Benchmark`);
  console.log(` Target: ${BASE_URL}`);
  console.log(` Date: ${new Date().toISOString()}`);
  console.log(`=======================================================`);

  // Verify server is reachable
  const health = await executeRequest('/api/health');
  if (!health.success) {
    console.error(`Error: Server at ${BASE_URL} is not responding (status ${health.statusCode}). Aborting.`);
    process.exit(1);
  }

  const stageConfigs = [
    { vus: 5, reqsPerVu: 15 },
    { vus: 10, reqsPerVu: 15 },
    { vus: 25, reqsPerVu: 12 },
    { vus: 50, reqsPerVu: 10 },
  ];

  const stageResults: StageResult[] = [];

  for (const config of stageConfigs) {
    const result = await runStage(config.vus, config.reqsPerVu);
    stageResults.push(result);
  }

  const fs = await import('fs');
  const path = await import('path');
  const outPath = path.resolve(process.cwd(), 'tests', 'load_test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(stageResults, null, 2), 'utf-8');

  console.log(`\n=======================================================`);
  console.log(` Benchmark complete. Results written to ${outPath}`);
  console.log(`=======================================================`);
}

main().catch((err) => {
  console.error('Fatal load testing error:', err);
  process.exit(1);
});
