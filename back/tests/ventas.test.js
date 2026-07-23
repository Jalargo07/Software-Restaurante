const request = require('supertest');
const { app, setup, teardown, getAdminToken } = require('./setup');

let token;
let productoId;
let ventaId;

beforeAll(async () => {
  await setup();
  token = await getAdminToken();

  const prodRes = await request(app)
    .post('/api/productos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Empanada',
      categoria: 'comida',
      precioCompra: 100,
      precioVenta: 250,
      stock: 100,
      tipo: 'directo',
    });
  productoId = prodRes.body.id;
});

afterAll(async () => {
  await teardown();
});

describe('Ventas - Crear y cobrar', () => {
  test('Crear venta abierta → 201, estado abierta', async () => {
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('abierta');
    expect(res.body).toHaveProperty('id');
    expect(Number(res.body.total)).toBe(0);
    ventaId = res.body.id;
  });

  test('Agregar productos a venta → 200, total actualizado', async () => {
    const res = await request(app)
      .post(`/api/ventas/${ventaId}/productos`)
      .set('Authorization', `Bearer ${token}`)
      .send({ productos: [{ productoId, cantidad: 2 }] });

    expect(res.status).toBe(200);
    expect(Number(res.body.total)).toBe(500);

    const detalles = res.body.DetalleVentas || res.body.DetalleVenta || [];
    expect(detalles.length).toBe(1);
    expect(detalles[0].cantidad).toBe(2);
  });

  test('Cobrar venta → 200, estado cerrada', async () => {
    const res = await request(app)
      .put(`/api/ventas/${ventaId}/cobrar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ metodoPago: 'efectivo' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cerrada');
    expect(res.body.metodoPago).toBe('efectivo');
  });

  test('Venta no encontrada → 404', async () => {
    const res = await request(app)
      .get('/api/ventas/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Cobrar venta ya cerrada → 400', async () => {
    const res = await request(app)
      .put(`/api/ventas/${ventaId}/cobrar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ metodoPago: 'efectivo' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Crear venta rápida → 201, estado cerrada', async () => {
    const res = await request(app)
      .post('/api/ventas/rapida')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productos: [{ productoId, cantidad: 1 }],
        metodoPago: 'tarjeta',
      });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('cerrada');
    expect(res.body.metodoPago).toBe('tarjeta');
    expect(Number(res.body.total)).toBe(250);
  });
});
