const { getRedis } = require('../config/redis');

function cacheMiddleware(ttlSeconds = 60) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const redis = getRedis();
    if (!redis) return next();

    if (req.headers['x-no-cache'] === 'true') return next();

    const tenantId = req.tenantId || 1;
    const key = `tenant:${tenantId}:cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      // Si Redis falla, seguir sin caché
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

module.exports = cacheMiddleware;
