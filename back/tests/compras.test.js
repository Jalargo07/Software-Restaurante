const request = require('supertest');
const { app, setup, teardown, getAdminToken } = require('./setup');

let token;
let productoId;
let proveedorId;
let compraId;

beforeAll(async () => {
  await setup();
  token = await getAdminToken();

  const prodRes = await request(app)
    .post('/api/productos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Pan para hamburguesa',
      categoria: 'insumo',
      precioCompra: 50,
      precioVenta: 80,
      stock: 10,
      tipo: 'insumo',
    });
  productoId = prodRes.body.id;

  const provRes = await request(app)
    .post('/api/proveedores')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Proveedor Pan',
      telefono: '1234567890',
      email: 'pan@proveedor.com',
    });
  proveedorId = provRes.body.id;
});

afterAll(async () => {
  await teardown();
});

describe('Compras - Crear y recibir', () => {
  test('Crear compra → 201, estado pendiente', async () => {
    const res = await request(app)
      .post('/api/compras')
      .set('Authorization', `Bearer ${token}`)
      .send({
        proveedorId,
        observaciones: 'Compra de prueba',
        detalles: [{ productoId, cantidad: 20, precioUnitario: 50 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('pendiente');
    expect(res.body).toHaveProperty('id');
    expect(Number(res.body.total)).toBe(1000);
    compraId = res.body.id;
  });

  test('Recibir compra → 200, estado recibida', async () => {
    const res = await request(app)
      .put(`/api/compras/${compraId}/recibir`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('recibida');
  });

  test('Verificar stock incrementado → 200, stock += cantidad', async () => {
    const res = await request(app)
      .get(`/api/productos/${productoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(30);
  });

  test('Compra no encontrada → 404', async () => {
    const res = await request(app)
      .get('/api/compras/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Cancelar compra → 200', async () => {
    const createRes = await request(app)
      .post('/api/compras')
      .set('Authorization', `Bearer ${token}`)
      .send({
        proveedorId,
        observaciones: 'Compra para cancelar',
        detalles: [{ productoId, cantidad: 5, precioUnitario: 50 }],
      });

    const res = await request(app)
      .delete(`/api/compras/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
