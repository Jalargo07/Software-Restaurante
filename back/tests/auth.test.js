const request = require('supertest');
const { app, setup, teardown, getAdminToken } = require('./setup');

let adminToken;

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe('Auth - Login', () => {
  test('Login exitoso → 200, token y usuario', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'admin@restaurant.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.email).toBe('admin@restaurant.com');
    expect(res.body.usuario.rol).toBe('admin');
  });

  test('Login email incorrecto → 401', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'noexiste@test.com', password: 'admin123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Login password incorrecto → 401', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'admin@restaurant.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Auth - Protección de rutas', () => {
  test('Obtener usuarios sin token → 401', async () => {
    const res = await request(app).get('/api/usuarios');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Obtener usuarios con token admin → 200, array', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
