const request = require('supertest');
const { app, setup, teardown, getAdminToken } = require('./setup');

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe('Branding - GET /api/branding', () => {
  test('GET autenticado → 200 con config', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .get('/api/branding')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tenant_id');
    expect(res.body).toHaveProperty('colorPrimario');
    expect(res.body).toHaveProperty('nombreCompleto');
  });

  test('GET sin token → 401', async () => {
    const res = await request(app).get('/api/branding');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Branding - PUT /api/branding', () => {
  test('PUT actualizar colores → 200', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .put('/api/branding')
      .set('Authorization', `Bearer ${token}`)
      .send({ colorPrimario: '#ff0000', colorSecundario: '#00ff00', colorAcento: '#0000ff' });

    expect(res.status).toBe(200);
    expect(res.body.colorPrimario).toBe('#ff0000');
    expect(res.body.colorSecundario).toBe('#00ff00');
    expect(res.body.colorAcento).toBe('#0000ff');
  });

  test('PUT actualizar nombre → 200', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .put('/api/branding')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombreCompleto: 'Mi Restaurante Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nombreCompleto).toBe('Mi Restaurante Actualizado');
  });

  test('PUT color hex inválido → 400', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .put('/api/branding')
      .set('Authorization', `Bearer ${token}`)
      .send({ colorPrimario: 'not-a-color' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT sin campos → 400', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .put('/api/branding')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT sin token → 401', async () => {
    const res = await request(app)
      .put('/api/branding')
      .send({ colorPrimario: '#123456' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Verificar persistencia en GET posterior', async () => {
    const token = await getAdminToken();

    await request(app)
      .put('/api/branding')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombreCompleto: 'Persistencia Test' });

    const res = await request(app)
      .get('/api/branding')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.nombreCompleto).toBe('Persistencia Test');
  });
});
