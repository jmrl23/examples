import redisStore from '@jmrl23/redis-store';
import { type Cache, caching, memoryStore } from 'cache-manager';
import { REDIS_URL } from './constants';

type CacheType = 'memory' | 'redis';
/**
 * check stores at https://github.com/jaredwray/cache-manager?tab=readme-ov-file#store-engines
 * or implement your own
 */
export async function cacheFactory(cache: CacheType): Promise<Cache> {
  switch (cache) {
    case 'memory':
      return await caching(memoryStore({ ttl: 0 }));
    case 'redis':
      return await caching(
        redisStore({
          url: REDIS_URL,
          prefix: 'TokenBasedAuthentication',
        }),
      );
  }
}
