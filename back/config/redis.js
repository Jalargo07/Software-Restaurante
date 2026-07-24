const Redis = require('ioredis');

let client = null;

function connectRedis() {
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

function getRedis() {
  return client;
}

async function disconnectRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
}

module.exports = { connectRedis, getRedis, disconnectRedis };
