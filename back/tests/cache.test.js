const store = {};

const mockRedisInstance = {
  get: vi.fn((key) => Promise.resolve(store[key] || null)),
  setex: vi.fn((key, ttl, val) => { store[key] = val; return Promise.resolve('OK'); }),
  del: vi.fn((key) => { delete store[key]; return Promise.resolve(1); }),
  keys: vi.fn((pattern) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Promise.resolve(Object.keys(store).filter(k => regex.test(k)));
  }),
  quit: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  connect: vi.fn(() => Promise.resolve()),
};

const redisPath = require.resolve('../config/redis');
const cachePath = require.resolve('../middleware/cache');
const invalidationPath = require.resolve('../utils/cacheInvalidation');

const savedModules = {
  redis: require.cache[redisPath],
  cache: require.cache[cachePath],
  invalidation: require.cache[invalidationPath],
};

require.cache[redisPath] = {
  id: redisPath,
  filename: redisPath,
  loaded: true,
  exports: {
    connectRedis: vi.fn(),
    getRedis: vi.fn(() => mockRedisInstance),
    disconnectRedis: vi.fn(async () => {}),
  },
};
delete require.cache[cachePath];
delete require.cache[invalidationPath];

const cacheMiddleware = require('../middleware/cache');
const { invalidarCache } = require('../utils/cacheInvalidation');
const redisExports = require('../config/redis');

afterAll(() => {
  Object.keys(savedModules).forEach((key) => {
    const mod = savedModules[key];
    const path = key === 'redis' ? redisPath : key === 'cache' ? cachePath : invalidationPath;
    if (mod) {
      require.cache[path] = mod;
    } else {
      delete require.cache[path];
    }
  });
});

function mockReq(url = '/api/test', method = 'GET', tenantId = 1, headers = {}) {
  return { method, originalUrl: url, tenantId, headers };
}

function mockRes() {
  let _statusCode = 200;
  const _headers = {};
  const res = {
    get statusCode() { return _statusCode; },
    set statusCode(v) { _statusCode = v; },
    setHeader: vi.fn((name, value) => { _headers[name] = value; }),
    getHeader: (name) => _headers[name],
    json: vi.fn(function (body) {
      res.setHeader('X-Cache', res.getHeader('X-Cache') || 'MISS');
      return res;
    }),
  };
  return res;
}

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  redisExports.getRedis.mockReturnValue(mockRedisInstance);
  redisExports.getRedis.mockClear();
  redisExports.connectRedis.mockClear();
  redisExports.disconnectRedis.mockClear();
  mockRedisInstance.get.mockReset();
  mockRedisInstance.get.mockImplementation((key) => Promise.resolve(store[key] || null));
  mockRedisInstance.setex.mockReset();
  mockRedisInstance.setex.mockImplementation((key, ttl, val) => { store[key] = val; return Promise.resolve('OK'); });
  mockRedisInstance.del.mockReset();
  mockRedisInstance.del.mockImplementation((key) => { delete store[key]; return Promise.resolve(1); });
  mockRedisInstance.keys.mockReset();
  mockRedisInstance.keys.mockImplementation((pattern) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Promise.resolve(Object.keys(store).filter(k => regex.test(k)));
  });
});

describe('Cache Middleware', () => {
  test('MISS en primera request, HIT en segunda', async () => {
    const req1 = mockReq('/api/productos');
    const res1 = mockRes();
    const next1 = vi.fn();

    await cacheMiddleware(60)(req1, res1, next1);
    expect(next1).toHaveBeenCalled();

    res1.json({ productos: [1, 2, 3] });

    expect(store['tenant:1:cache:/api/productos']).toBe(
      JSON.stringify({ productos: [1, 2, 3] })
    );

    const req2 = mockReq('/api/productos');
    const res2 = mockRes();
    const next2 = vi.fn();

    await cacheMiddleware(60)(req2, res2, next2);
    expect(res2.getHeader('X-Cache')).toBe('HIT');
    expect(next2).not.toHaveBeenCalled();
  });

  test('Bypass con header X-No-Cache', async () => {
    store['tenant:1:cache:/api/productos'] = JSON.stringify({ cached: true });

    const req = mockReq('/api/productos', 'GET', 1, { 'x-no-cache': 'true' });
    const res = mockRes();
    const next = vi.fn();

    await cacheMiddleware(60)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('No cachea errores (status != 200)', async () => {
    const req = mockReq('/api/error');
    const res = mockRes();
    const next = vi.fn();

    await cacheMiddleware(60)(req, res, next);
    res.statusCode = 500;
    res.json({ error: 'fail' });

    expect(store['tenant:1:cache:/api/error']).toBeUndefined();
  });

  test('No cachea requests que no sean GET', async () => {
    const req = mockReq('/api/productos', 'POST');
    const res = mockRes();
    const next = vi.fn();

    await cacheMiddleware(60)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(mockRedisInstance.get).not.toHaveBeenCalled();
  });

  test('Sin Redis disponible, sigue sin caché', async () => {
    redisExports.getRedis.mockReturnValue(null);

    const req = mockReq('/api/sin-redis');
    const res = mockRes();
    const next = vi.fn();

    await cacheMiddleware(60)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('Cachea con TTL correcto', async () => {
    const req = mockReq('/api/ttl');
    const res = mockRes();
    const next = vi.fn();

    await cacheMiddleware(30)(req, res, next);
    res.json({ data: 123 });

    expect(mockRedisInstance.setex).toHaveBeenCalledWith(
      'tenant:1:cache:/api/ttl', 30, JSON.stringify({ data: 123 })
    );
  });
});

describe('Invalidación de Caché', () => {
  test('Borra keys por patrón', async () => {
    store['tenant:1:cache:/api/productos'] = 'p1';
    store['tenant:1:cache:/api/ventas'] = 'v1';
    store['tenant:1:cache:/api/compras'] = 'c1';

    await invalidarCache(1, ['productos']);

    expect(store['tenant:1:cache:/api/productos']).toBeUndefined();
    expect(store['tenant:1:cache:/api/ventas']).toBe('v1');
    expect(store['tenant:1:cache:/api/compras']).toBe('c1');
  });

  test('Borra todas las keys con patrón vacío', async () => {
    store['tenant:1:cache:/api/a'] = 'a';
    store['tenant:1:cache:/api/b'] = 'b';
    store['tenant:1:cache:/api/c'] = 'c';

    await invalidarCache(1, []);

    expect(Object.keys(store)).toHaveLength(0);
  });

  test('No falla si Redis no disponible', async () => {
    redisExports.getRedis.mockReturnValue(null);
    await expect(invalidarCache(1, ['productos'])).resolves.toBeUndefined();
  });

  test('Aislamiento entre tenants', async () => {
    store['tenant:1:cache:/api/productos'] = 't1';
    store['tenant:2:cache:/api/productos'] = 't2';

    await invalidarCache(1, ['productos']);

    expect(store['tenant:1:cache:/api/productos']).toBeUndefined();
    expect(store['tenant:2:cache:/api/productos']).toBe('t2');
  });
});
