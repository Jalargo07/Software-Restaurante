import rateLimit from 'express-rate-limit';
import { getRedis } from '../config/redis';

const redisClient = getRedis();

const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

const createRedisStore = () => {
  if (!redisClient) {
    console.warn('⚠️ Redis no disponible, usando MemoryStore para rate limit');
    return undefined;
  }

  return {
    increment: async (key: string): Promise<{ totalHits: number; resetTime: Date }> => {
      const fullKey = `rl:${key}`;
      const exists = await redisClient!.exists(fullKey);
      if (!exists) {
        await redisClient!.setex(fullKey, Math.ceil(windowMs / 1000), '1');
        return { totalHits: 1, resetTime: new Date(Date.now() + windowMs) };
      }
      const total = await redisClient!.incr(fullKey);
      const ttl = await redisClient!.ttl(fullKey);
      return {
        totalHits: total,
        resetTime: new Date(Date.now() + ttl * 1000)
      };
    },
    decrement: async (key: string): Promise<void> => {
      const fullKey = `rl:${key}`;
      await redisClient!.decr(fullKey);
    },
    resetKey: async (key: string): Promise<void> => {
      const fullKey = `rl:${key}`;
      await redisClient!.del(fullKey);
    },
    expiry: Math.ceil(windowMs / 1000)
  };
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { ok: false, error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),
});

export const loginLimiter = rateLimit({
  windowMs,
  max: maxAttempts,
  message: { ok: false, error: 'Demasiados intentos de login, intenta en 15 minutos', code: 'LOGIN_LOCKOUT' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: createRedisStore(),
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Demasiados intentos de login. Intenta en 15 minutos.',
      code: 'LOGIN_LOCKOUT'
    });
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { ok: false, error: 'Demasiados uploads, intenta de nuevo en 1 hora', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),
});
