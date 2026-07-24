const request = require('supertest');
const { app, setup, teardown } = require('./setup');
const { Tenant } = require('../models');

beforeAll(async () => {
  await setup();
  // Create an inactive tenant and another tenant for testing
  await Tenant.create({
    id: 99,
    nombre: 'Tenant Inactivo',
    slug: 'tenant-inactivo',
    activo: false
  });
  await Tenant.create({
    id: 2,
    nombre: 'Segundo Restaurante',
    slug: 'segundo-restaurante',
    activo: true
  });
});

afterAll(async () => {
  await teardown();
});

describe('Tenant Context Middleware', () => {
  test('Fallback al tenant por defecto (id: 1) si no se provee cabecera ni token', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('Acceso exitoso con header x-tenant-id', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('x-tenant-id', '2');
    expect(res.status).toBe(200);
  });

  test('Acceso exitoso con header x-tenant-slug', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('x-tenant-slug', 'segundo-restaurante');
    expect(res.status).toBe(200);
  });

  test('Error 404 si el tenant no existe', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('x-tenant-id', '9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tenant (Restaurante) no encontrado');
  });

  test('Error 403 si el tenant está inactivo o suspendido', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('x-tenant-id', '99');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'El restaurante se encuentra inactivo o suspendido');
  });
});
