const { getRedis } = require('../config/redis');

let io = null;

function setSocketIO(socketIO) {
  io = socketIO;
}

async function invalidarCache(tenantId, patrones = []) {
  const redis = getRedis();
  if (!redis) return;

  let keysBorradas = 0;

  try {
    const prefix = `tenant:${tenantId}:cache:`;
    const keys = await redis.keys(`${prefix}*`);

    for (const key of keys) {
      const shouldDelete = patrones.length === 0 ||
        patrones.some(p => key.includes(p));
      if (shouldDelete) {
        await redis.del(key);
        keysBorradas++;
      }
    }
  } catch (err) {
    // Silencioso - si Redis falla, no afecta la operación
  }

  if (io && keysBorradas > 0) {
    io.to(`tenant:${tenantId}`).emit('cache-invalidado', { patrones });
  }
}

module.exports = { invalidarCache, setSocketIO };
