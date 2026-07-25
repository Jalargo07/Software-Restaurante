import Redis from 'ioredis';

let client: Redis | null = null;

export function connectRedis(): Redis | null {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const token = process.env.REDIS_TOKEN;

  try {
    // Upstash usa URL HTTPS + token, ioredis necesita formato especial
    const config: any = {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    };

    // Si hay token, es Upstash (URL HTTPS)
    if (token && url.startsWith('https://')) {
      // Upstash requiere configuración TLS especial
      config.tls = { rejectUnauthorized: false };
      config.password = token;
      // Upstash usa un formato de URL diferente, extraemos el host
      const urlObj = new URL(url);
      const redisUrl = `rediss://default:${token}@${urlObj.hostname}`;
      client = new Redis(redisUrl, config);
    } else if (token) {
      // Formato rediss:// con token
      config.password = token;
      client = new Redis(url, config);
    } else {
      client = new Redis(url, config);
    }

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
