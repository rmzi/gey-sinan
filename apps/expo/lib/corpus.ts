import { Platform } from 'react-native';
import { Corpus } from './types';

let cache: Corpus | null = null;
let inflight: Promise<Corpus> | null = null;

/**
 * Loads the full dictionary corpus (curated vocabulary + bulk Leslau
 * dictionary + phrases). On web this fetches /data/corpus.json at runtime so
 * the ~2MB file isn't bundled into the JS chunk. On native (and as a web
 * fallback if the fetch fails) it falls back to the bundled JSON.
 *
 * Cached in memory after first successful load.
 */
export async function loadCorpus(): Promise<Corpus> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    if (Platform.OS === 'web') {
      try {
        const response = await fetch('/data/corpus.json');
        if (!response.ok) throw new Error(`corpus fetch failed: ${response.status}`);
        const data = (await response.json()) as Corpus;
        cache = data;
        return data;
      } catch {
        // fall through to bundled fallback
      }
    }

    const bundled = require('../public/data/corpus.json') as Corpus;
    cache = bundled;
    return bundled;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Clears the in-memory cache. Exposed for tests. */
export function clearCorpusCache(): void {
  cache = null;
}
