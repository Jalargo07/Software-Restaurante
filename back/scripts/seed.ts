import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import '../models/index';
import { Tenant, TenantConfig, Producto, Proveedor, Mesa, DetalleReceta, Compra, DetalleCompra, Kardex, Venta, DetalleVenta } from '../models';
import Usuario from '../models/Usuario';

function fechaHace(dias: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dias);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

async function seed() {
  // Solo crear datos si las tablas están vacías
  const tenantCount = await Tenant.count();
  if (tenantCount > 0) {
    console.log('Seed ya existe, omitiendo...');
    return;
  }

  // Sincronizar modelos sin destruir datos existentes
  await sequelize.sync({ alter: true });

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

  const harina = (await Producto.create({ tenant_id: tenant.id, nombre: 'Harina 000', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.50, precioVenta: 0, stock: 0, stockMinimo: 20, unidad: 'kg', merma: 0 })) as any;
  const queso = (await Producto.create({ tenant_id: tenant.id, nombre: 'Queso Muzzarella', tipo: 'insumo', categoria: 'insumo', precioCompra: 8.00, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 0 })) as any;
  const salsaTomate = (await Producto.create({ tenant_id: tenant.id, nombre: 'Salsa de Tomate', tipo: 'insumo', categoria: 'insumo', precioCompra: 3.00, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'litro', merma: 0 })) as any;
  const carneMolida = (await Producto.create({ tenant_id: tenant.id, nombre: 'Carne Molida', tipo: 'insumo', categoria: 'insumo', precioCompra: 12.00, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 2 })) as any;
  const pan = (await Producto.create({ tenant_id: tenant.id, nombre: 'Pan de Hamburguesa', tipo: 'insumo', categoria: 'insumo', precioCompra: 0.80, precioVenta: 0, stock: 0, stockMinimo: 50, unidad: 'unidad', merma: 0 })) as any;
  const lechuga = (await Producto.create({ tenant_id: tenant.id, nombre: 'Lechuga', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.20, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 8 })) as any;
  const tomate = (await Producto.create({ tenant_id: tenant.id, nombre: 'Tomate', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.50, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 3 })) as any;
  const papasCongeladas = (await Producto.create({ tenant_id: tenant.id, nombre: 'Papas Fritas Congeladas', tipo: 'insumo', categoria: 'insumo', precioCompra: 4.00, precioVenta: 0, stock: 0, stockMinimo: 15, unidad: 'kg', merma: 5 })) as any;
  const milanesa = (await Producto.create({ tenant_id: tenant.id, nombre: 'Milanesa de Pollo', tipo: 'insumo', categoria: 'insumo', precioCompra: 10.00, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 3 })) as any;

  const cocaCola = (await Producto.create({ tenant_id: tenant.id, nombre: 'Coca-Cola 500ml', tipo: 'directo', categoria: 'bebida', precioCompra: 1.20, precioVenta: 3.00, stock: 0, stockMinimo: 20, unidad: 'unidad', merma: 0 })) as any;
  const agua = (await Producto.create({ tenant_id: tenant.id, nombre: 'Agua Mineral 500ml', tipo: 'directo', categoria: 'bebida', precioCompra: 0.80, precioVenta: 2.00, stock: 0, stockMinimo: 20, unidad: 'unidad', merma: 0 })) as any;
  const heladoChocolate = (await Producto.create({ tenant_id: tenant.id, nombre: 'Helado de Chocolate', tipo: 'directo', categoria: 'postre', precioCompra: 2.50, precioVenta: 5.00, stock: 0, stockMinimo: 10, unidad: 'unidad', merma: 0 })) as any;
  const papasPorcion = (await Producto.create({ tenant_id: tenant.id, nombre: 'Papas Fritas (porción)', tipo: 'directo', categoria: 'comida', precioCompra: 1.50, precioVenta: 4.00, stock: 0, stockMinimo: 10, unidad: 'unidad', merma: 0 })) as any;

  const aceiteOliva = (await Producto.create({ tenant_id: tenant.id, nombre: 'Aceite de Oliva', tipo: 'insumo', categoria: 'insumo', precioCompra: 5.00, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'litro', merma: 0 })) as any;
  const cebolla = (await Producto.create({ tenant_id: tenant.id, nombre: 'Cebolla', tipo: 'insumo', categoria: 'insumo', precioCompra: 0.80, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 3 })) as any;
  const pimientoRojo = (await Producto.create({ tenant_id: tenant.id, nombre: 'Pimiento Rojo', tipo: 'insumo', categoria: 'insumo', precioCompra: 2.00, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'kg', merma: 5 })) as any;
  const leche = (await Producto.create({ tenant_id: tenant.id, nombre: 'Leche', tipo: 'insumo', categoria: 'insumo', precioCompra: 1.00, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'litro', merma: 0 })) as any;
  const azucar = (await Producto.create({ tenant_id: tenant.id, nombre: 'Azúcar', tipo: 'insumo', categoria: 'insumo', precioCompra: 0.60, precioVenta: 0, stock: 0, stockMinimo: 10, unidad: 'kg', merma: 0 })) as any;
  const huevo = (await Producto.create({ tenant_id: tenant.id, nombre: 'Huevo', tipo: 'insumo', categoria: 'insumo', precioCompra: 0.15, precioVenta: 0, stock: 0, stockMinimo: 50, unidad: 'unidad', merma: 2 })) as any;

  const cerveza = (await Producto.create({ tenant_id: tenant.id, nombre: 'Cerveza Artesanal', tipo: 'directo', categoria: 'bebida', precioCompra: 2.50, precioVenta: 6.00, stock: 0, stockMinimo: 20, unidad: 'unidad', merma: 0 })) as any;
  const vinoTinto = (await Producto.create({ tenant_id: tenant.id, nombre: 'Vino Tinto', tipo: 'directo', categoria: 'bebida', precioCompra: 4.00, precioVenta: 12.00, stock: 0, stockMinimo: 10, unidad: 'unidad', merma: 0 })) as any;
  const jugoNaranja = (await Producto.create({ tenant_id: tenant.id, nombre: 'Jugo de Naranja', tipo: 'directo', categoria: 'bebida', precioCompra: 1.00, precioVenta: 3.50, stock: 0, stockMinimo: 15, unidad: 'unidad', merma: 0 })) as any;

  const empanadaCarne = (await Producto.create({ tenant_id: tenant.id, nombre: 'Empanada de Carne', tipo: 'directo', categoria: 'comida', precioCompra: 0.80, precioVenta: 2.50, stock: 0, stockMinimo: 30, unidad: 'unidad', merma: 0 })) as any;
  const sandwichMilanesa = (await Producto.create({ tenant_id: tenant.id, nombre: 'Sándwich de Milanesa', tipo: 'compuesto', categoria: 'comida', precioCompra: 3.50, precioVenta: 9.00, stock: 0, stockMinimo: 0, unidad: 'unidad', merma: 0 })) as any;

  const tiramisu = (await Producto.create({ tenant_id: tenant.id, nombre: 'Tiramisú', tipo: 'directo', categoria: 'postre', precioCompra: 3.00, precioVenta: 7.00, stock: 0, stockMinimo: 10, unidad: 'unidad', merma: 0 })) as any;
  const brownie = (await Producto.create({ tenant_id: tenant.id, nombre: 'Brownie', tipo: 'directo', categoria: 'postre', precioCompra: 1.50, precioVenta: 4.50, stock: 0, stockMinimo: 15, unidad: 'unidad', merma: 0 })) as any;
  const flan = (await Producto.create({ tenant_id: tenant.id, nombre: 'Flan', tipo: 'directo', categoria: 'postre', precioCompra: 1.00, precioVenta: 3.50, stock: 0, stockMinimo: 15, unidad: 'unidad', merma: 0 })) as any;

  const pizza = (await Producto.create({ tenant_id: tenant.id, nombre: 'Pizza Muzzarella', tipo: 'compuesto', categoria: 'comida', precioCompra: 3.50, precioVenta: 10.00, stock: 0, stockMinimo: 0, unidad: 'unidad', merma: 0 })) as any;
  const hamburguesa = (await Producto.create({ tenant_id: tenant.id, nombre: 'Hamburguesa Clásica', tipo: 'compuesto', categoria: 'comida', precioCompra: 4.50, precioVenta: 12.00, stock: 0, stockMinimo: 0, unidad: 'unidad', merma: 0 })) as any;
  const milanesaPapas = (await Producto.create({ tenant_id: tenant.id, nombre: 'Milanesa con Papas', tipo: 'compuesto', categoria: 'comida', precioCompra: 5.00, precioVenta: 14.00, stock: 0, stockMinimo: 0, unidad: 'unidad', merma: 0 })) as any;

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: pizza.id, insumoId: harina.id, cantidad: 0.25, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: pizza.id, insumoId: queso.id, cantidad: 0.20, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: pizza.id, insumoId: salsaTomate.id, cantidad: 0.10, unidad: 'litro' });

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: carneMolida.id, cantidad: 0.15, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: pan.id, cantidad: 1, unidad: 'unidad' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: lechuga.id, cantidad: 0.02, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: hamburguesa.id, insumoId: tomate.id, cantidad: 0.03, unidad: 'kg' });

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: milanesaPapas.id, insumoId: milanesa.id, cantidad: 0.20, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: milanesaPapas.id, insumoId: papasCongeladas.id, cantidad: 0.25, unidad: 'kg' });

  await DetalleReceta.create({ tenant_id: tenant.id, productoId: sandwichMilanesa.id, insumoId: milanesa.id, cantidad: 0.20, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: sandwichMilanesa.id, insumoId: pan.id, cantidad: 2, unidad: 'unidad' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: sandwichMilanesa.id, insumoId: lechuga.id, cantidad: 0.03, unidad: 'kg' });
  await DetalleReceta.create({ tenant_id: tenant.id, productoId: sandwichMilanesa.id, insumoId: tomate.id, cantidad: 0.04, unidad: 'kg' });

  const proveedorDistribuidora = (await Proveedor.create({ tenant_id: tenant.id, nombre: 'Distribuidora ABC', contacto: 'Juan Pérez', telefono: '555-0100', email: 'abc@example.com', direccion: 'Av. Siempre Viva 123', activo: true })) as any;
  const proveedorCarnes = (await Proveedor.create({ tenant_id: tenant.id, nombre: 'Carnes del Sur', contacto: 'María García', telefono: '555-0200', email: 'carnes@example.com', direccion: 'Calle Principal 456', activo: true })) as any;
  const proveedorBebidas = (await Proveedor.create({ tenant_id: tenant.id, nombre: 'Bebidas SA', contacto: 'Carlos López', telefono: '555-0300', email: 'bebidas@example.com', direccion: 'Ruta 9 Km 50', activo: true })) as any;
  const proveedorDulces = (await Proveedor.create({ tenant_id: tenant.id, nombre: 'Dulces del Valle', contacto: 'Laura Martínez', telefono: '555-0400', email: 'dulces@example.com', direccion: 'Calle Dulce 789', activo: true })) as any;

  for (let i = 1; i <= 6; i++) {
    await Mesa.create({
      tenant_id: tenant.id,
      numero: i,
      capacidad: i <= 2 ? 2 : i <= 4 ? 4 : 6,
      estado: 'disponible',
      ubicacion: i <= 3 ? 'Terraza' : 'Interior',
    });
  }

  const compras = [
    {
      fecha: fechaHace(10),
      proveedor: proveedorDistribuidora,
      total: 50 * 1.50 + 20 * 8.00 + 15 * 3.00 + 100 * 0.80,
      detalles: [
        { producto: harina, cantidad: 50, precio: 1.50 },
        { producto: queso, cantidad: 20, precio: 8.00 },
        { producto: salsaTomate, cantidad: 15, precio: 3.00 },
        { producto: pan, cantidad: 100, precio: 0.80 },
      ],
    },
    {
      fecha: fechaHace(8),
      proveedor: proveedorDistribuidora,
      total: 10 * 5.00 + 15 * 0.80 + 10 * 1.20 + 10 * 1.50,
      detalles: [
        { producto: aceiteOliva, cantidad: 10, precio: 5.00 },
        { producto: cebolla, cantidad: 15, precio: 0.80 },
        { producto: lechuga, cantidad: 10, precio: 1.20 },
        { producto: tomate, cantidad: 10, precio: 1.50 },
      ],
    },
    {
      fecha: fechaHace(7),
      proveedor: proveedorCarnes,
      total: 25 * 12.00 + 20 * 10.00,
      detalles: [
        { producto: carneMolida, cantidad: 25, precio: 12.00 },
        { producto: milanesa, cantidad: 20, precio: 10.00 },
      ],
    },
    {
      fecha: fechaHace(5),
      proveedor: proveedorBebidas,
      total: 80 * 1.20 + 80 * 0.80 + 40 * 2.50 + 20 * 4.00,
      detalles: [
        { producto: cocaCola, cantidad: 80, precio: 1.20 },
        { producto: agua, cantidad: 80, precio: 0.80 },
        { producto: cerveza, cantidad: 40, precio: 2.50 },
        { producto: vinoTinto, cantidad: 20, precio: 4.00 },
      ],
    },
    {
      fecha: fechaHace(3),
      proveedor: proveedorBebidas,
      total: 30 * 1.00,
      detalles: [
        { producto: jugoNaranja, cantidad: 30, precio: 1.00 },
      ],
    },
    {
      fecha: fechaHace(2),
      proveedor: proveedorDulces,
      total: 20 * 1.00 + 15 * 0.60 + 100 * 0.15,
      detalles: [
        { producto: leche, cantidad: 20, precio: 1.00 },
        { producto: azucar, cantidad: 15, precio: 0.60 },
        { producto: huevo, cantidad: 100, precio: 0.15 },
      ],
    },
    {
      fecha: fechaHace(1),
      proveedor: proveedorDistribuidora,
      total: 30 * 4.00 + 10 * 2.00,
      detalles: [
        { producto: papasCongeladas, cantidad: 30, precio: 4.00 },
        { producto: pimientoRojo, cantidad: 10, precio: 2.00 },
      ],
    },
    {
      fecha: fechaHace(0),
      proveedor: proveedorDulces,
      total: 20 * 2.50,
      detalles: [
        { producto: heladoChocolate, cantidad: 20, precio: 2.50 },
      ],
    },
  ];

  for (const compraData of compras) {
    const compra = (await Compra.create({
      tenant_id: tenant.id,
      proveedorId: compraData.proveedor.id,
      total: compraData.total,
      estado: 'recibida',
      fecha: compraData.fecha,
    })) as any;

    for (const det of compraData.detalles) {
      await DetalleCompra.create({
        tenant_id: tenant.id,
        CompraId: compra.id,
        ProductoId: det.producto.id,
        cantidad: det.cantidad,
        precioUnitario: det.precio,
        subtotal: det.cantidad * det.precio,
      });

      await det.producto.update({ stock: det.producto.stock + det.cantidad });

      await Kardex.create({
        tenant_id: tenant.id,
        productoId: det.producto.id,
        tipo: 'entrada',
        cantidad: det.cantidad,
        precioUnitario: det.precio,
        compraId: compra.id,
        fecha: compraData.fecha,
      });
    }
  }

  // === VENTAS DE PRUEBA ===
  console.log('Creando ventas de prueba...');

  const adminUser = (await Usuario.findOne({ where: { tenant_id: tenant.id, rol: 'admin' } })) as any;

  const productosArray = await Producto.findAll({ where: { tenant_id: tenant.id } });
  const prodMap: Record<string, any> = {};
  for (const p of productosArray) prodMap[(p as any).nombre] = p;

  const ventasData = [
    { dias: 0, metodo: 'efectivo', items: [{ nombre: 'Pizza Muzzarella', cant: 2 }, { nombre: 'Coca-Cola 500ml', cant: 2 }] },
    { dias: 0, metodo: 'tarjeta', items: [{ nombre: 'Hamburguesa Clásica', cant: 1 }, { nombre: 'Cerveza Artesanal', cant: 1 }, { nombre: 'Papas Fritas (porción)', cant: 1 }] },
    { dias: 0, metodo: 'transferencia', items: [{ nombre: 'Milanesa con Papas', cant: 1 }, { nombre: 'Vino Tinto', cant: 1 }] },
    { dias: 1, metodo: 'efectivo', items: [{ nombre: 'Sándwich de Milanesa', cant: 1 }, { nombre: 'Agua Mineral 500ml', cant: 1 }, { nombre: 'Brownie', cant: 1 }] },
    { dias: 1, metodo: 'tarjeta', items: [{ nombre: 'Pizza Muzzarella', cant: 1 }, { nombre: 'Empanada de Carne', cant: 4 }, { nombre: 'Cerveza Artesanal', cant: 2 }] },
    { dias: 2, metodo: 'efectivo', items: [{ nombre: 'Hamburguesa Clásica', cant: 2 }, { nombre: 'Papas Fritas (porción)', cant: 2 }, { nombre: 'Coca-Cola 500ml', cant: 2 }] },
    { dias: 3, metodo: 'transferencia', items: [{ nombre: 'Milanesa con Papas', cant: 2 }, { nombre: 'Jugo de Naranja', cant: 2 }, { nombre: 'Flan', cant: 2 }] },
    { dias: 4, metodo: 'tarjeta', items: [{ nombre: 'Pizza Muzzarella', cant: 3 }, { nombre: 'Vino Tinto', cant: 2 }, { nombre: 'Tiramisú', cant: 1 }] },
    { dias: 5, metodo: 'efectivo', items: [{ nombre: 'Hamburguesa Clásica', cant: 1 }, { nombre: 'Sándwich de Milanesa', cant: 1 }, { nombre: 'Helado de Chocolate', cant: 2 }] },
    { dias: 6, metodo: 'efectivo', items: [{ nombre: 'Empanada de Carne', cant: 6 }, { nombre: 'Cerveza Artesanal', cant: 3 }, { nombre: 'Brownie', cant: 3 }] },
  ];

  for (const v of ventasData) {
    let total = 0;
    const detalles = [];
    for (const item of v.items) {
      const prod = prodMap[item.nombre];
      if (!prod) continue;
      const sub = Number(prod.precioVenta) * item.cant;
      total += sub;
      detalles.push({ ProductoId: prod.id, cantidad: item.cant, precioUnitario: prod.precioVenta, subtotal: sub });
    }
    if (detalles.length === 0) continue;

    const venta = (await Venta.create({
      tenant_id: tenant.id,
      estado: 'cerrada',
      metodoPago: v.metodo,
      total,
      usuarioId: adminUser.id,
      createdAt: fechaHace(v.dias),
      updatedAt: fechaHace(v.dias),
    })) as any;

    for (const d of detalles) {
      const detalle = (await DetalleVenta.create({
        tenant_id: tenant.id,
        VentaId: venta.id,
        ProductoId: d.ProductoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
        estadoComanda: 'listo',
        createdAt: fechaHace(v.dias),
        updatedAt: fechaHace(v.dias),
      })) as any;

      const producto = prodMap[Object.keys(prodMap).find(k => prodMap[k].id === d.ProductoId) || ''];
      if (!producto) continue;

      // Kardex salida para directos y compuestos
      if (producto.tipo === 'directo') {
        const entradaAnterior = await Kardex.findOne({
          where: { productoId: d.ProductoId, tipo: 'entrada', tenant_id: tenant.id },
          order: [['createdAt', 'ASC'], ['id', 'ASC']],
        });
        await Kardex.create({
          tenant_id: tenant.id,
          productoId: d.ProductoId,
          tipo: 'salida',
          cantidad: d.cantidad,
          precioUnitario: (entradaAnterior as any)?.precioUnitario || Number(producto.precioCompra),
          ventaId: venta.id,
          fecha: fechaHace(v.dias),
          createdAt: fechaHace(v.dias),
          updatedAt: fechaHace(v.dias),
        });
      }

      if (producto.tipo === 'compuesto') {
        const recetas = await DetalleReceta.findAll({ where: { productoId: d.ProductoId, tenant_id: tenant.id } });
        for (const receta of recetas) {
          const insumo: any = await Producto.findByPk((receta as any).insumoId);
          if (!insumo) continue;
          const entradaAnterior = await Kardex.findOne({
            where: { productoId: insumo.id, tipo: 'entrada', tenant_id: tenant.id },
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
          });
          const cantReceta = Number((receta as any).cantidad) * d.cantidad;
          const totalRequerido = cantReceta;
          await Kardex.create({
            tenant_id: tenant.id,
            productoId: insumo.id,
            tipo: 'salida',
            cantidad: totalRequerido,
            precioUnitario: (entradaAnterior as any)?.precioUnitario || Number(insumo.precioCompra),
            ventaId: venta.id,
            fecha: fechaHace(v.dias),
            createdAt: fechaHace(v.dias),
            updatedAt: fechaHace(v.dias),
          });
        }
      }
    }
  }
  console.log(`${ventasData.length} ventas de prueba creadas`);
}

seed()
  .then(() => {
    console.log('Seed completado exitosamente.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  });
