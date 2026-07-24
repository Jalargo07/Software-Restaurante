import Redis from 'ioredis';

let client: Redis | null = null;

export function connectRedis(): Redis | null {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });
    client.on('connect', () => console.log('✅ Redis conectado'));
    client.on('error', (err) => console.error('❌ Redis error:', err.message));
    client.connect().catch(() => {});
    return client;
  } catch (err) {
    console.warn('⚠️ Redis no disponible, funcionando sin caché');
    return null;
  }
}

export function getRedis(): Redis | null {
  return client;
}

export async function disconnectRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
}
