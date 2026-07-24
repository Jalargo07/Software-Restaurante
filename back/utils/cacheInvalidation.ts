import { getRedis } from '../config/redis';

let io: any = null;

export function setSocketIO(socketIO: any) {
  io = socketIO;
}

export async function invalidarCache(tenantId: number, patrones: string[] = []) {
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
