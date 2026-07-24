const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { Tenant, TenantConfig, Producto, Proveedor, Mesa, Receta, DetalleReceta, Usuario } = require('../models');

async function seed() {
  console.log('🔄 Sincronizando modelos...');
  await sequelize.sync();

  console.log('🏢 Creando tenant por defecto...');
  const [tenant] = await Tenant.findOrCreate({
    where: { id: 1 },
    defaults: {
      nombre: 'Restaurante Principal',
      slug: 'restaurante-principal',
      activo: true
    }
  });

  console.log('⚙️ Creando configuración del tenant...');
  await TenantConfig.findOrCreate({
    where: { tenant_id: tenant.id },
    defaults: {
      nombreCompleto: 'Restaurante Principal',
      colorPrimario: '#0d6efd',
      colorSecundario: '#6c757d',
      colorAcento: '#ffc107',
      fontPrincipal: 'Inter'
    }
  });

  console.log('👤 Creando admin...');
  const [admin] = await Usuario.findOrCreate({
    where: { email: 'admin@restaurant.com' },
    defaults: {
      nombre: 'Admin',
      email: 'admin@restaurant.com',
      password: 'admin123',
      rol: 'admin',
      activo: true,
      tenant_id: tenant.id
    }
  });
  const passwordValido = await bcrypt.compare('admin123', admin.password);
  if (!passwordValido) {
    await Usuario.update({ password: await bcrypt.hash('admin123', 10) }, { where: { id: admin.id }, individualHooks: false });
    console.log('🔧 Password admin corregido');
  }

  const productoCount = await Producto.count();
  if (productoCount === 0) {
    console.log('🍔 Creando productos...');
    const insumos = await Producto.bulkCreate([
      { nombre: 'Pan de hamburguesa', categoria: 'insumo', precioCompra: 30, precioVenta: 0, stock: 100, unidad: 'unidad', tipo: 'insumo', merma: 2, tenant_id: tenant.id },
      { nombre: 'Carne molida', categoria: 'insumo', precioCompra: 80, precioVenta: 0, stock: 50, unidad: 'kg', tipo: 'insumo', merma: 10, tenant_id: tenant.id },
      { nombre: 'Lechuga', categoria: 'insumo', precioCompra: 20, precioVenta: 0, stock: 30, unidad: 'kg', tipo: 'insumo', merma: 5, tenant_id: tenant.id },
      { nombre: 'Tomate', categoria: 'insumo', precioCompra: 25, precioVenta: 0, stock: 40, unidad: 'kg', tipo: 'insumo', merma: 5, tenant_id: tenant.id },
      { nombre: 'Queso cheddar', categoria: 'insumo', precioCompra: 120, precioVenta: 0, stock: 20, unidad: 'kg', tipo: 'insumo', merma: 3, tenant_id: tenant.id },
      { nombre: 'Coca Cola 500ml', categoria: 'bebida', precioCompra: 80, precioVenta: 250, stock: 48, unidad: 'unidad', tipo: 'insumo', tenant_id: tenant.id },
      { nombre: 'Papas fritas congeladas', categoria: 'insumo', precioCompra: 60, precioVenta: 0, stock: 25, unidad: 'kg', tipo: 'insumo', merma: 5, tenant_id: tenant.id },
      { nombre: 'Salsa de tomate', categoria: 'insumo', precioCompra: 35, precioVenta: 0, stock: 15, unidad: 'litro', tipo: 'insumo', tenant_id: tenant.id }
    ]);

    const directos = await Producto.bulkCreate([
      { nombre: 'Agua mineral 500ml', categoria: 'bebida', precioCompra: 25, precioVenta: 150, stock: 60, unidad: 'unidad', tipo: 'directo', tenant_id: tenant.id },
      { nombre: 'Cerveza artesanal', categoria: 'bebida', precioCompra: 150, precioVenta: 450, stock: 30, unidad: 'unidad', tipo: 'directo', tenant_id: tenant.id },
      { nombre: 'Gaseosa 1L', categoria: 'bebida', precioCompra: 90, precioVenta: 350, stock: 40, unidad: 'unidad', tipo: 'directo', tenant_id: tenant.id },
      { nombre: 'Snack variado', categoria: 'insumo', precioCompra: 40, precioVenta: 180, stock: 25, unidad: 'unidad', tipo: 'directo', tenant_id: tenant.id }
    ]);

    const compuestos = await Producto.bulkCreate([
      { nombre: 'Hamburguesa clásica', categoria: 'comida', precioCompra: 0, precioVenta: 850, stock: 0, unidad: 'unidad', tipo: 'compuesto', tenant_id: tenant.id },
      { nombre: 'Hamburguesa especial', categoria: 'comida', precioCompra: 0, precioVenta: 1200, stock: 0, unidad: 'unidad', tipo: 'compuesto', tenant_id: tenant.id },
      { nombre: 'Papas con cheddar', categoria: 'comida', precioCompra: 0, precioVenta: 650, stock: 0, unidad: 'unidad', tipo: 'compuesto', tenant_id: tenant.id },
      { nombre: 'Ensalada mixta', categoria: 'comida', precioCompra: 0, precioVenta: 500, stock: 0, unidad: 'unidad', tipo: 'compuesto', tenant_id: tenant.id }
    ]);

    const pan = insumos.find(p => p.nombre === 'Pan de hamburguesa');
    const carne = insumos.find(p => p.nombre === 'Carne molida');
    const lechuga = insumos.find(p => p.nombre === 'Lechuga');
    const tomate = insumos.find(p => p.nombre === 'Tomate');
    const queso = insumos.find(p => p.nombre === 'Queso cheddar');
    const papas = insumos.find(p => p.nombre === 'Papas fritas congeladas');

    console.log('📖 Creando recetas...');
    const receta1 = await Receta.create({ nombre: 'Receta Hamburguesa Clásica', porciones: 1, productoId: compuestos[0].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 1, unidad: 'unidad', merma: 2, recetaId: receta1.id, insumoId: pan.id, tenant_id: tenant.id },
      { cantidad: 0.2, unidad: 'kg', merma: 10, recetaId: receta1.id, insumoId: carne.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta1.id, insumoId: lechuga.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta1.id, insumoId: tomate.id, tenant_id: tenant.id },
      { cantidad: 0.03, unidad: 'kg', merma: 3, recetaId: receta1.id, insumoId: queso.id, tenant_id: tenant.id }
    ]);

    const receta2 = await Receta.create({ nombre: 'Receta Hamburguesa Especial', porciones: 1, productoId: compuestos[1].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 1, unidad: 'unidad', merma: 2, recetaId: receta2.id, insumoId: pan.id, tenant_id: tenant.id },
      { cantidad: 0.3, unidad: 'kg', merma: 10, recetaId: receta2.id, insumoId: carne.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta2.id, insumoId: lechuga.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta2.id, insumoId: tomate.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 3, recetaId: receta2.id, insumoId: queso.id, tenant_id: tenant.id }
    ]);

    const receta3 = await Receta.create({ nombre: 'Receta Papas con Cheddar', porciones: 1, productoId: compuestos[2].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 0.3, unidad: 'kg', merma: 5, recetaId: receta3.id, insumoId: papas.id, tenant_id: tenant.id },
      { cantidad: 0.1, unidad: 'kg', merma: 3, recetaId: receta3.id, insumoId: queso.id, tenant_id: tenant.id }
    ]);

    const receta4 = await Receta.create({ nombre: 'Receta Ensalada Mixta', porciones: 1, productoId: compuestos[3].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 0.15, unidad: 'kg', merma: 5, recetaId: receta4.id, insumoId: lechuga.id, tenant_id: tenant.id },
      { cantidad: 0.1, unidad: 'kg', merma: 5, recetaId: receta4.id, insumoId: tomate.id, tenant_id: tenant.id }
    ]);
  }

  const proveedorCount = await Proveedor.count();
  if (proveedorCount === 0) {
    console.log('🏭 Creando proveedores...');
    await Proveedor.bulkCreate([
      { nombre: 'Distribuidora ABC', contacto: 'Juan Pérez', telefono: '11-5555-1234', email: 'ventas@abc.com', activo: true, tenant_id: tenant.id },
      { nombre: 'Carnes del Norte', contacto: 'María García', telefono: '11-5555-5678', email: 'pedidos@carnesnorte.com', activo: true, tenant_id: tenant.id },
      { nombre: 'Verdulería Mayorista', contacto: 'Carlos López', telefono: '11-5555-9012', email: 'info@verduleria.com', activo: true, tenant_id: tenant.id },
      { nombre: 'Bebidas Express', contacto: 'Ana Martínez', telefono: '11-5555-3456', email: 'contacto@bebidas.com', activo: true, tenant_id: tenant.id }
    ]);
  }

  const mesaCount = await Mesa.count();
  if (mesaCount === 0) {
    console.log('🪑 Creando mesas...');
    await Mesa.bulkCreate([
      { numero: 1, capacidad: 2, estado: 'disponible', tenant_id: tenant.id },
      { numero: 2, capacidad: 2, estado: 'disponible', tenant_id: tenant.id },
      { numero: 3, capacidad: 4, estado: 'disponible', tenant_id: tenant.id },
      { numero: 4, capacidad: 4, estado: 'disponible', tenant_id: tenant.id },
      { numero: 5, capacidad: 6, estado: 'disponible', tenant_id: tenant.id },
      { numero: 6, capacidad: 8, estado: 'disponible', tenant_id: tenant.id }
    ]);
  }

  const recetaCount = await Receta.count();
  if (recetaCount === 0) {
    console.log('📖 Creando recetas...');
    const compuestos = await Producto.findAll({ where: { tipo: 'compuesto', tenant_id: tenant.id } });
    const insumos = await Producto.findAll({ where: { tipo: 'insumo', tenant_id: tenant.id } });
    const pan = insumos.find(p => p.nombre === 'Pan de hamburguesa');
    const carne = insumos.find(p => p.nombre === 'Carne molida');
    const lechuga = insumos.find(p => p.nombre === 'Lechuga');
    const tomate = insumos.find(p => p.nombre === 'Tomate');
    const queso = insumos.find(p => p.nombre === 'Queso cheddar');
    const papas = insumos.find(p => p.nombre === 'Papas fritas congeladas');

    const receta1 = await Receta.create({ nombre: 'Receta Hamburguesa Clásica', porciones: 1, productoId: compuestos[0].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 1, unidad: 'unidad', merma: 2, recetaId: receta1.id, insumoId: pan.id, tenant_id: tenant.id },
      { cantidad: 0.2, unidad: 'kg', merma: 10, recetaId: receta1.id, insumoId: carne.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta1.id, insumoId: lechuga.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta1.id, insumoId: tomate.id, tenant_id: tenant.id },
      { cantidad: 0.03, unidad: 'kg', merma: 3, recetaId: receta1.id, insumoId: queso.id, tenant_id: tenant.id }
    ]);

    const receta2 = await Receta.create({ nombre: 'Receta Hamburguesa Especial', porciones: 1, productoId: compuestos[1].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 1, unidad: 'unidad', merma: 2, recetaId: receta2.id, insumoId: pan.id, tenant_id: tenant.id },
      { cantidad: 0.3, unidad: 'kg', merma: 10, recetaId: receta2.id, insumoId: carne.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta2.id, insumoId: lechuga.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 5, recetaId: receta2.id, insumoId: tomate.id, tenant_id: tenant.id },
      { cantidad: 0.05, unidad: 'kg', merma: 3, recetaId: receta2.id, insumoId: queso.id, tenant_id: tenant.id }
    ]);

    const receta3 = await Receta.create({ nombre: 'Receta Papas con Cheddar', porciones: 1, productoId: compuestos[2].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 0.3, unidad: 'kg', merma: 5, recetaId: receta3.id, insumoId: papas.id, tenant_id: tenant.id },
      { cantidad: 0.1, unidad: 'kg', merma: 3, recetaId: receta3.id, insumoId: queso.id, tenant_id: tenant.id }
    ]);

    const receta4 = await Receta.create({ nombre: 'Receta Ensalada Mixta', porciones: 1, productoId: compuestos[3].id, tenant_id: tenant.id });
    await DetalleReceta.bulkCreate([
      { cantidad: 0.15, unidad: 'kg', merma: 5, recetaId: receta4.id, insumoId: lechuga.id, tenant_id: tenant.id },
      { cantidad: 0.1, unidad: 'kg', merma: 5, recetaId: receta4.id, insumoId: tomate.id, tenant_id: tenant.id }
    ]);
  }

  console.log('✅ Seed completado!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
