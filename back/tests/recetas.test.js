const request = require('supertest');
const { app, setup, teardown, getAdminToken } = require('./setup');

let token;
let compuestoId;
let insumoId;
let recetaId;

beforeAll(async () => {
  await setup();
  token = await getAdminToken();

  const compRes = await request(app)
    .post('/api/productos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Pizza',
      categoria: 'comida',
      precioCompra: 300,
      precioVenta: 800,
      stock: 0,
      tipo: 'compuesto',
    });
  compuestoId = compRes.body.id;

  const insRes = await request(app)
    .post('/api/productos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Masa de pizza',
      categoria: 'insumo',
      precioCompra: 50,
      precioVenta: 50,
      stock: 200,
      tipo: 'insumo',
    });
  insumoId = insRes.body.id;
});

afterAll(async () => {
  await teardown();
});

describe('Recetas - CRUD', () => {
  test('Crear receta → 201', async () => {
    const res = await request(app)
      .post('/api/recetas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Receta Pizza',
        porciones: 4,
        productoId: compuestoId,
        detalles: [{ insumoId, cantidad: 1, unidad: 'unidad', merma: 5 }],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe('Receta Pizza');
    expect(res.body.productoId).toBe(compuestoId);
    recetaId = res.body.id;
  });

  test('Listar recetas → 200, array', async () => {
    const res = await request(app)
      .get('/api/recetas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('Obtener receta por ID → 200', async () => {
    const res = await request(app)
      .get(`/api/recetas/${recetaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(recetaId);
    expect(res.body.nombre).toBe('Receta Pizza');
  });

  test('Receta no encontrada → 404', async () => {
    const res = await request(app)
      .get('/api/recetas/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Crear receta sin ingredientes → 400', async () => {
    const otroCompRes = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Lasaña',
        categoria: 'comida',
        precioCompra: 400,
        precioVenta: 900,
        stock: 0,
        tipo: 'compuesto',
      });

    const res = await request(app)
      .post('/api/recetas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Receta Lasaña sin detalle',
        productoId: otroCompRes.body.id,
        detalles: [],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Crear receta con insumo inexistente → 400', async () => {
    const otroCompRes = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Sándwich',
        categoria: 'comida',
        precioCompra: 200,
        precioVenta: 500,
        stock: 0,
        tipo: 'compuesto',
      });

    const res = await request(app)
      .post('/api/recetas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Receta Sándwich',
        productoId: otroCompRes.body.id,
        detalles: [{ insumoId: 99999, cantidad: 2, unidad: 'unidad' }],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Eliminar receta → 200', async () => {
    const res = await request(app)
      .delete(`/api/recetas/${recetaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');

    const getRes = await request(app)
      .get(`/api/recetas/${recetaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});
