import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import '../models/index';
import { Tenant, TenantConfig, Producto, Proveedor, Mesa, DetalleReceta } from '../models';
import Usuario from '../models/Usuario';

async function seed() {
  const dialect = sequelize.getDialect();

  if (dialect === 'postgres') {
    await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await sequelize.sync();
  } else {
    await sequelize.sync({ force: true });
  }

  const tenant = (await Tenant.create({
    id: 1,
    nombre: 'Restaurante Principal',
    slug: 'restaurante-principal',
    activo: true,
  })) as any;

  await TenantConfig.create({
    tenant_id: tenant.id,
    nombreCompleto: 'Restaurante Principal S.A.',
    colorPrimario: '#0d6efd',
    colorSecundario: '#6c757d',
    colorAcento: '#198754',
    fontPrincipal: 'Inter',
  });

  await Usuario.create({
    tenant_id: tenant.id,
    nombre: 'Admin',
    email: 'admin@restaurant.com',
    password: 'admin123',
    rol: 'admin',
    activo: true,
  });

  const harina = (await Producto.create({ tenant_id: tenant.id, nombre: 'Harina 000', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.50, precioVenta: 0, stock: 200, stockMinimo: 20, unidad: 'kg' })) as any;
  const queso = (await Producto.create({ tenant_id: tenant.id, nombre: 'Queso Muzzarella', tipo: 'insumo', categoria: 'insumo', precioCompra: 8.00, precioVenta: 0, stock: 50, stockMinimo: 10, unidad: 'kg' })) as any;
  const salsaTomate = (await Producto.create({ tenant_id: tenant.id, nombre: 'Salsa de Tomate', tipo: 'insumo', categoria: 'insumo', precioCompra: 3.00, precioVenta: 0, stock: 30, stockMinimo: 10, unidad: 'litro' })) as any;
  const carneMolida = (await Producto.create({ tenant_id: tenant.id, nombre: 'Carne Molida', tipo: 'insumo', categoria: 'insumo', precioCompra: 12.00, precioVenta: 0, stock: 40, stockMinimo: 10, unidad: 'kg' })) as any;
  const pan = (await Producto.create({ tenant_id: tenant.id, nombre: 'Pan de Hamburguesa', tipo: 'insumo', categoria: 'insumo', precioCompra: 0.80, precioVenta: 0, stock: 200, stockMinimo: 50, unidad: 'unidad' })) as any;
  const lechuga = (await Producto.create({ tenant_id: tenant.id, nombre: 'Lechuga', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.20, precioVenta: 0, stock: 30, stockMinimo: 10, unidad: 'kg' })) as any;
  const tomate = (await Producto.create({ tenant_id: tenant.id, nombre: 'Tomate', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.50, precioVenta: 0, stock: 25, stockMinimo: 10, unidad: 'kg' })) as any;
  const papasCongeladas = (await Producto.create({ tenant_id: tenant.id, nombre: 'Papas Fritas Congeladas', tipo: 'insumo', categoria: 'insumo', precioCompra: 4.00, precioVenta: 0, stock: 60, stockMinimo: 15, unidad: 'kg' })) as any;
  const milanesa = (await Producto.create({ tenant_id: tenant.id, nombre: 'Milanesa de Pollo', tipo: 'insumo', categoria: 'insumo', precioCompra: 10.00, precioVenta: 0, stock: 40, stockMinimo: 10, unidad: 'kg' })) as any;

  (await Producto.create({ tenant_id: tenant.id, nombre: 'Coca-Cola 500ml', tipo: 'directo', categoria: 'bebida', precioCompra: 1.20, precioVenta: 3.00, stock: 100, stockMinimo: 20, unidad: 'unidad' })) as any;
  (await Producto.create({ tenant_id: tenant.id, nombre: 'Agua Mineral 500ml', tipo: 'directo', categoria: 'bebida', precioCompra: 0.80, precioVenta: 2.00, stock: 100, stockMinimo: 20, unidad: 'unidad' })) as any;
  (await Producto.create({ tenant_id: tenant.id, nombre: 'Helado de Chocolate', tipo: 'directo', categoria: 'postre', precioCompra: 2.50, precioVenta: 5.00, stock: 30, stockMinimo: 10, unidad: 'unidad' })) as any;
  (await Producto.create({ tenant_id: tenant.id, nombre: 'Papas Fritas (porción)', tipo: 'directo', categoria: 'comida', precioCompra: 1.50, precioVenta: 4.00, stock: 50, stockMinimo: 10, unidad: 'unidad' })) as any;

  const pizza = (await Producto.create({ tenant_id: tenant.id, nombre: 'Pizza Muzzarella', tipo: 'compuesto', categoria: 'comida', precioCompra: 3.50, precioVenta: 10.00, stock: 0, stockMinimo: 0, unidad: 'unidad' })) as any;
  const hamburguesa = (await Producto.create({ tenant_id: tenant.id, nombre: 'Hamburguesa Clásica', tipo: 'compuesto', categoria: 'comida', precioCompra: 4.50, precioVenta: 12.00, stock: 0, stockMinimo: 0, unidad: 'unidad' })) as any;
  const milanesaPapas = (await Producto.create({ tenant_id: tenant.id, nombre: 'Milanesa con Papas', tipo: 'compuesto', categoria: 'comida', precioCompra: 5.00, precioVenta: 14.00, stock: 0, stockMinimo: 0, unidad: 'unidad' })) as any;

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: pizza.id, insumoId: harina.id, cantidad: 0.25, unidad: 'kg', merma: 5 });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: pizza.id, insumoId: queso.id, cantidad: 0.20, unidad: 'kg', merma: 2 });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: pizza.id, insumoId: salsaTomate.id, cantidad: 0.10, unidad: 'litro', merma: 3 });

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: carneMolida.id, cantidad: 0.15, unidad: 'kg', merma: 2 });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: pan.id, cantidad: 1, unidad: 'unidad', merma: 0 });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: lechuga.id, cantidad: 0.02, unidad: 'kg', merma: 5 });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: tomate.id, cantidad: 0.03, unidad: 'kg', merma: 3 });

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: milanesaPapas.id, insumoId: milanesa.id, cantidad: 0.20, unidad: 'kg', merma: 2 });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: milanesaPapas.id, insumoId: papasCongeladas.id, cantidad: 0.25, unidad: 'kg', merma: 5 });

  await Proveedor.create({ tenant_id: tenant.id, nombre: 'Distribuidora ABC', contacto: 'Juan Pérez', telefono: '555-0100', email: 'abc@example.com', direccion: 'Av. Siempre Viva 123', activo: true });
  await Proveedor.create({ tenant_id: tenant.id, nombre: 'Carnes del Sur', contacto: 'María García', telefono: '555-0200', email: 'carnes@example.com', direccion: 'Calle Principal 456', activo: true });
  await Proveedor.create({ tenant_id: tenant.id, nombre: 'Bebidas SA', contacto: 'Carlos López', telefono: '555-0300', email: 'bebidas@example.com', direccion: 'Ruta 9 Km 50', activo: true });

  for (let i = 1; i <= 6; i++) {
    await Mesa.create({
      tenant_id: tenant.id,
      numero: i,
      capacidad: i <= 2 ? 2 : i <= 4 ? 4 : 6,
      estado: 'disponible',
      ubicacion: i <= 3 ? 'Terraza' : 'Interior',
    });
  }

  console.log('Seed completado exitosamente.');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
