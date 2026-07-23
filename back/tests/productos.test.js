const request = require('supertest');
const { app, setup, teardown, getAdminToken } = require('./setup');

let token;
let productoId;

beforeAll(async () => {
  await setup();
  token = await getAdminToken();
});

afterAll(async () => {
  await teardown();
});

const productoData = {
  nombre: 'Hamburguesa',
  categoria: 'comida',
  precioCompra: 200,
  precioVenta: 500,
  stock: 50,
  tipo: 'directo',
};

describe('Productos - CRUD', () => {
  test('Listar productos vacío → 200, array []', async () => {
    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('Crear producto → 201, objeto con id', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send(productoData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe('Hamburguesa');
    expect(res.body.categoria).toBe('comida');
    productoId = res.body.id;
  });

  test('Listar productos (1 item) → 200, array length 1', async () => {
    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].nombre).toBe('Hamburguesa');
  });

  test('Obtener producto por ID → 200', async () => {
    const res = await request(app)
      .get(`/api/productos/${productoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productoId);
    expect(res.body.nombre).toBe('Hamburguesa');
  });

  test('Actualizar producto → 200, nombre cambiado', async () => {
    const res = await request(app)
      .put(`/api/productos/${productoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Hamburguesa Premium',
        categoria: 'comida',
        precioCompra: 200,
        precioVenta: 500,
      });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Hamburguesa Premium');
  });

  test('Producto no encontrado → 404', async () => {
    const res = await request(app)
      .get('/api/productos/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Desactivar producto → 200', async () => {
    const res = await request(app)
      .delete(`/api/productos/${productoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
