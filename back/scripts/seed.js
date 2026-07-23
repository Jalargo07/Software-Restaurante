const sequelize = require('../config/database');
const { Producto, Proveedor, Mesa, Receta, DetalleReceta, Usuario } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Limpiando base de datos...');
  await sequelize.sync({ force: true });

  console.log('👤 Creando admin...');
  await Usuario.create({
    nombre: 'Admin',
    email: 'admin@restaurant.com',
    password: await bcrypt.hash('admin123', 10),
    rol: 'admin',
    activo: true
  });

  console.log('🍔 Creando productos...');
  const insumos = await Producto.bulkCreate([
    { nombre: 'Pan de hamburguesa', categoria: 'insumo', precioCompra: 30, precioVenta: 0, stock: 100, unidad: 'unidad', tipo: 'insumo' },
    { nombre: 'Carne molida', categoria: 'insumo', precioCompra: 80, precioVenta: 0, stock: 50, unidad: 'kg', tipo: 'insumo' },
    { nombre: 'Lechuga', categoria: 'insumo', precioCompra: 20, precioVenta: 0, stock: 30, unidad: 'kg', tipo: 'insumo' },
    { nombre: 'Tomate', categoria: 'insumo', precioCompra: 25, precioVenta: 0, stock: 40, unidad: 'kg', tipo: 'insumo' },
    { nombre: 'Queso cheddar', categoria: 'insumo', precioCompra: 120, precioVenta: 0, stock: 20, unidad: 'kg', tipo: 'insumo' },
    { nombre: 'Coca Cola 500ml', categoria: 'bebida', precioCompra: 80, precioVenta: 250, stock: 48, unidad: 'unidad', tipo: 'insumo' },
    { nombre: 'Papas fritas congeladas', categoria: 'insumo', precioCompra: 60, precioVenta: 0, stock: 25, unidad: 'kg', tipo: 'insumo' },
    { nombre: 'Salsa de tomate', categoria: 'insumo', precioCompra: 35, precioVenta: 0, stock: 15, unidad: 'litro', tipo: 'insumo' }
  ]);

  const directos = await Producto.bulkCreate([
    { nombre: 'Agua mineral 500ml', categoria: 'bebida', precioCompra: 25, precioVenta: 150, stock: 60, unidad: 'unidad', tipo: 'directo' },
    { nombre: 'Cerveza artesanal', categoria: 'bebida', precioCompra: 150, precioVenta: 450, stock: 30, unidad: 'unidad', tipo: 'directo' },
    { nombre: 'Gaseosa 1L', categoria: 'bebida', precioCompra: 90, precioVenta: 350, stock: 40, unidad: 'unidad', tipo: 'directo' },
    { nombre: 'Snack variado', categoria: 'insumo', precioCompra: 40, precioVenta: 180, stock: 25, unidad: 'unidad', tipo: 'directo' }
  ]);

  const compuestos = await Producto.bulkCreate([
    { nombre: 'Hamburguesa clásica', categoria: 'comida', precioCompra: 0, precioVenta: 850, stock: 0, unidad: 'unidad', tipo: 'compuesto' },
    { nombre: 'Hamburguesa especial', categoria: 'comida', precioCompra: 0, precioVenta: 1200, stock: 0, unidad: 'unidad', tipo: 'compuesto' },
    { nombre: 'Papas con cheddar', categoria: 'comida', precioCompra: 0, precioVenta: 650, stock: 0, unidad: 'unidad', tipo: 'compuesto' },
    { nombre: 'Ensalada mixta', categoria: 'comida', precioCompra: 0, precioVenta: 500, stock: 0, unidad: 'unidad', tipo: 'compuesto' }
  ]);

  console.log('🏭 Creando proveedores...');
  await Proveedor.bulkCreate([
    { nombre: 'Distribuidora ABC', contacto: 'Juan Pérez', telefono: '11-5555-1234', email: 'ventas@abc.com', activo: true },
    { nombre: 'Carnes del Norte', contacto: 'María García', telefono: '11-5555-5678', email: 'pedidos@carnesnorte.com', activo: true },
    { nombre: 'Verdulería Mayorista', contacto: 'Carlos López', telefono: '11-5555-9012', email: 'info@verduleria.com', activo: true },
    { nombre: 'Bebidas Express', contacto: 'Ana Martínez', telefono: '11-5555-3456', email: 'contacto@bebidas.com', activo: true }
  ]);

  console.log('🪑 Creando mesas...');
  await Mesa.bulkCreate([
    { numero: 1, capacidad: 2, estado: 'disponible' },
    { numero: 2, capacidad: 2, estado: 'disponible' },
    { numero: 3, capacidad: 4, estado: 'disponible' },
    { numero: 4, capacidad: 4, estado: 'disponible' },
    { numero: 5, capacidad: 6, estado: 'disponible' },
    { numero: 6, capacidad: 8, estado: 'disponible' }
  ]);

  console.log('📖 Creando recetas...');

  const pan = insumos.find(p => p.nombre === 'Pan de hamburguesa');
  const carne = insumos.find(p => p.nombre === 'Carne molida');
  const lechuga = insumos.find(p => p.nombre === 'Lechuga');
  const tomate = insumos.find(p => p.nombre === 'Tomate');
  const queso = insumos.find(p => p.nombre === 'Queso cheddar');
  const papas = insumos.find(p => p.nombre === 'Papas fritas congeladas');

  const receta1 = await Receta.create({ nombre: 'Receta Hamburguesa Clásica', porciones: 1, productoId: compuestos[0].id });
  await DetalleReceta.bulkCreate([
    { cantidad: 1, unidad: 'unidad', merma: 2, recetaId: receta1.id, insumoId: pan.id },
    { cantidad: 0.2, unidad: 'kg', merma: 10, recetaId: receta1.id, insumoId: carne.id },
    { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta1.id, insumoId: lechuga.id },
    { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta1.id, insumoId: tomate.id },
    { cantidad: 0.03, unidad: 'kg', merma: 3, recetaId: receta1.id, insumoId: queso.id }
  ]);

  const receta2 = await Receta.create({ nombre: 'Receta Hamburguesa Especial', porciones: 1, productoId: compuestos[1].id });
  await DetalleReceta.bulkCreate([
    { cantidad: 1, unidad: 'unidad', merma: 2, recetaId: receta2.id, insumoId: pan.id },
    { cantidad: 0.3, unidad: 'kg', merma: 10, recetaId: receta2.id, insumoId: carne.id },
    { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta2.id, insumoId: lechuga.id },
    { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta2.id, insumoId: tomate.id },
    { cantidad: 0.05, unidad: 'kg', merma: 3, recetaId: receta2.id, insumoId: queso.id }
  ]);

  const receta3 = await Receta.create({ nombre: 'Receta Papas con Cheddar', porciones: 1, productoId: compuestos[2].id });
  await DetalleReceta.bulkCreate([
    { cantidad: 0.3, unidad: 'kg', merma: 5, recetaId: receta3.id, insumoId: papas.id },
    { cantidad: 0.1, unidad: 'kg', merma: 3, recetaId: receta3.id, insumoId: queso.id }
  ]);

  const receta4 = await Receta.create({ nombre: 'Receta Ensalada Mixta', porciones: 1, productoId: compuestos[3].id });
  await DetalleReceta.bulkCreate([
    { cantidad: 0.15, unidad: 'kg', merma: 5, recetaId: receta4.id, insumoId: lechuga.id },
    { cantidad: 0.1, unidad: 'kg', merma: 5, recetaId: receta4.id, insumoId: tomate.id }
  ]);

  console.log('✅ Seed completado!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
