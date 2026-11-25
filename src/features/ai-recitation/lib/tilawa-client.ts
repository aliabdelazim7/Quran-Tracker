import { ModelDownloadState } from '../types/recitation';

// Types representing browser-only Tilawa objects dynamically
export interface PreparedMicHandle {
  context: AudioContext;
  stream: Promise<MediaStream>;
  release: () => void;
}

export interface ActiveMicrophoneHandle {
  sampleRate: number;
  speaking: boolean;
  stop: () => Promise<unknown[]>;
}

export interface ActiveSessionHandle {
  id: string;
  mode: 'memorization' | 'free';
  startedAt: string | null;
  now: () => number;
  subscribe: (listener: (event: any) => void) => () => void;
  end: () => Promise<any[]>;
  dispose: () => void;
  mistakes: () => any[];
}

export interface TilawaEngineHandle {
  startFreeRecitation: (policy?: any) => ActiveSessionHandle;
  startMemorization: (passage: { surah: number; fromAyah: number; toAyah: number }, policy?: any) => ActiveSessionHandle;
  listen: (session: ActiveSessionHandle, options?: any) => Promise<ActiveMicrophoneHandle>;
  capabilities: any;
  model: {
    id: string;
    version: string | null;
    sha256: string | null;
    tier: string | null;
    backend: string;
    fallbacks: string[];
  };
  dispose: () => Promise<void>;
}

let tilawaInstance: TilawaEngineHandle | null = null;
let isInitializing = false;

/**
 * Prepares the microphone synchronously inside the user's click/tap handler.
 * Essential for iOS Safari audio policies.
 */
export async function prepareMic(): Promise<PreparedMicHandle | null> {
  if (typeof window === 'undefined') return null;
  try {
    const { prepareMicrophone } = await import('@tilawa/core/web');
    return prepareMicrophone();
  } catch (err) {
    console.warn('Microphone preparation failed (not in user gesture or unsupported):', err);
    return null;
  }
}

/**
 * Initializes the Tilawa engine on-demand.
 * Downloads model assets using Cache API and reports authentic progress.
 */
export async function getOrInitTilawa(
  onProgress?: (state: ModelDownloadState) => void
): Promise<TilawaEngineHandle> {
  if (typeof window === 'undefined') {
    throw new Error('Tilawa AI Recitation engine can only run in the browser.');
  }

  if (tilawaInstance) {
    return tilawaInstance;
  }

  if (isInitializing) {
    // Wait until current initialization completes
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (tilawaInstance) return tilawaInstance;
  }

  isInitializing = true;

  try {
    onProgress?.({
      stage: 'model',
      fraction: 0,
      loaded: 0,
      total: 0,
      fromCache: false,
    });

    const { createTilawa } = await import('@tilawa/core/web');

    // Configure wasmPaths to point to our local static directory with CDN fallback
    const wasmDir = typeof window !== 'undefined' && window.location ? '/ort/' : 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';

    let engine: any;
    try {
      engine = await createTilawa({
        tier: 'auto',
        providers: ['wasm'],
        wasmPaths: wasmDir,
        onProgress: (p) => {
          onProgress?.({
            stage: p.stage as any,
            fraction: p.fraction,
            loaded: p.loaded,
            total: p.total,
            fromCache: p.fromCache,
          });
        },
      });
    } catch (primaryErr) {
      console.warn('Tilawa init with primary wasm path failed, retrying with CDN fallback:', primaryErr);
      engine = await createTilawa({
        tier: 'auto',
        providers: ['wasm'],
        wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/',
        onProgress: (p) => {
          onProgress?.({
            stage: p.stage as any,
            fraction: p.fraction,
            loaded: p.loaded,
            total: p.total,
            fromCache: p.fromCache,
          });
        },
      });
    }

    tilawaInstance = engine as unknown as TilawaEngineHandle;

    onProgress?.({
      stage: 'ready',
      fraction: 1,
      loaded: 100,
      total: 100,
      fromCache: true,
      tier: engine.model?.tier || 'auto',
      backend: engine.model?.backend || 'wasm',
      modelId: engine.model?.id,
      modelVersion: engine.model?.version || undefined,
    });

    return tilawaInstance;
  } catch (err: any) {
    onProgress?.({
      stage: 'error',
      fraction: 0,
      loaded: 0,
      total: 0,
      fromCache: false,
      error: err?.message || 'فشل تحميل نموذج التسميع الذكي. تحقق من الاتصال بالإنترنت.',
    });
    throw err;
  } finally {
    isInitializing = false;
  }
}

/**
 * Releases the Tilawa instance and frees WebAssembly/ONNX session resources.
 */
export async function disposeTilawa(): Promise<void> {
  if (tilawaInstance) {
    try {
      await tilawaInstance.dispose();
    } catch (e) {
      console.warn('Error during Tilawa disposal:', e);
    }
    tilawaInstance = null;
  }
}
