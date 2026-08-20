import Redis from 'ioredis';

let client: Redis | null = null;
let connectionFailed = false;

export function connectRedis(): Redis | null {
  if (connectionFailed) return null;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const token = process.env.REDIS_TOKEN;

  // Si no hay REDIS_URL o es localhost (no disponible en producción), saltar
  if (!process.env.REDIS_URL || (process.env.NODE_ENV === 'production' && url.includes('localhost'))) {
    console.warn('⚠️ REDIS_URL no configurada, funcionando sin caché');
    connectionFailed = true;
    return null;
  }

  try {
    const config: any = {
      maxRetriesPerRequest: 2,
      retryStrategy(times: number) {
        if (times > 2) {
          connectionFailed = true;
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 10000,
    };

    let redisUrl: string;

    if (url.startsWith('https://')) {
      // Upstash REST URL → construir TCP URL
      const urlObj = new URL(url);
      const upstashToken = token || urlObj.password || '';
      if (!upstashToken) {
        console.warn('⚠️ REDIS_URL es HTTPS pero falta REDIS_TOKEN, funcionando sin caché');
        connectionFailed = true;
        return null;
      }
      redisUrl = `rediss://default:${upstashToken}@${urlObj.hostname}:6380`;
      config.tls = { rejectUnauthorized: false };
    } else if (url.startsWith('rediss://')) {
      redisUrl = url;
      config.tls = { rejectUnauthorized: false };
    } else {
      redisUrl = url;
      if (token) config.password = token;
    }

    client = new Redis(redisUrl, config);

    client.on('connect', () => {
      console.log('✅ Redis conectado');
      connectionFailed = false;
    });

    let errorLogged = false;
    client.on('error', (err) => {
      if (!errorLogged) {
        console.warn('⚠️ Redis no disponible:', err.message);
        errorLogged = true;
        connectionFailed = true;
      }
    });

    client.connect().catch(() => {
      if (!connectionFailed) {
        console.warn('⚠️ Redis no disponible, funcionando sin caché');
        connectionFailed = true;
      }
    });

    return client;
  } catch (err: any) {
    console.warn('⚠️ Redis no disponible:', err?.message || 'error desconocido');
    connectionFailed = true;
    return null;
  }
}

export function getRedis(): Redis | null {
  return client;
}

export async function disconnectRedis() {
  if (client) {
    try {
      await client.quit();
    } catch {
      client.disconnect();
    }
    client = null;
  }
}
