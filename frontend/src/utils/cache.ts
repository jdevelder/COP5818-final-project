// Simple in-memory cache for eBay API responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 3600000;

export function getCached(key: string): any | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if cache is still valid
  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  console.log(`✅ Cache HIT for: ${key}`);
  return entry.data;
}

export function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`💾 Cached: ${key}`);
}

export function clearCache(): void {
  cache.clear();
  console.log('🗑️ Cache cleared');
}

// Clean up old cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
  }
}, 600000);
