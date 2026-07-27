import { Request, Response } from 'express';
import { Compra, DetalleCompra, Producto, Proveedor, Kardex } from '../models';
import sequelize from '../config/database';
import registrarAuditoria from '../utils/auditoria';
import { scopeTenant, withTenant, belongsToTenant } from '../utils/tenantScope';
import { invalidarCache } from '../utils/cacheInvalidation';
import { checkLicense } from '../utils/licenseGuard';
import { escanearOCR } from '../utils/ocrScanner';
import { parsearFactura } from '../utils/parserIA';

export const obtenerTodas = async (req: Request, res: Response) => {
  try {
    const { pagina = 1, limite = 10 } = req.query;
    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;

    const { count, rows } = await Compra.findAndCountAll({
      where: scopeTenant(null, req.tenantId!),
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      data: rows,
      total: count,
      pagina: Number(pagina),
      paginas: Math.ceil(count / limit) || 1,
      limite: limit,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener compras' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const compra: any = await Compra.findByPk(req.params.id as string, {
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
    });
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (!belongsToTenant(compra, req.tenantId!)) return res.status(403).json({ error: 'Acceso denegado' });
    return res.json(compra);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener compra' });
  }
};

export const crear = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { proveedorId, observaciones, detalles } = req.body;

    const total = detalles.reduce((sum: number, d: any) => sum + d.cantidad * d.precioUnitario, 0);

    const compra: any = await Compra.create(
      withTenant({ proveedorId, total, observaciones }, req.tenantId!),
      { transaction: t }
    );

    for (const detalle of detalles) {
      await DetalleCompra.create(
        withTenant({
          CompraId: compra.id,
          ProductoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.cantidad * detalle.precioUnitario,
        }, req.tenantId!),
        { transaction: t }
      );
    }

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'crear',
      entidad: 'Compra',
      entidadId: compra.id,
      detalles: { total, proveedorId, cantidadDetalles: detalles.length },
    });

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
    });

    res.status(201).json(compraCompleta);

    invalidarCache(req.tenantId!, ['reportes', 'compras']);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al crear compra' });
  }
};

export const recibir = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    if (!checkLicense().ok) {
      await t.rollback();
      return res.status(403).json({ error: 'Licencia inválida' });
    }

    const compra: any = await Compra.findByPk(req.params.id as string, {
      include: [{ model: DetalleCompra }],
      transaction: t,
    });
    if (!compra) {
      await t.rollback();
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    if (!belongsToTenant(compra, req.tenantId!)) {
      await t.rollback();
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (compra.estado !== 'pendiente') {
      await t.rollback();
      return res.status(400).json({ error: 'Solo se pueden recibir compras pendientes' });
    }

    await compra.update({ estado: 'recibida' }, { transaction: t });

    for (const detalle of compra.DetalleCompras) {
      const producto: any = await Producto.findByPk(detalle.ProductoId, { transaction: t });
      if (!producto || !belongsToTenant(producto, req.tenantId!)) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${detalle.ProductoId} no encontrado o no pertenece al tenant` });
      }

      const cantidadComprada = Number(detalle.cantidad);

      if (producto.tipo === 'insumo' && Number(producto.merma) > 0) {
        const mermaPorcentaje = Number(producto.merma);
        const stockASumar = Math.floor(cantidadComprada * (1 - mermaPorcentaje / 100));
        const cantidadMerma = cantidadComprada - stockASumar;

        await producto.update(
          { stock: producto.stock + stockASumar },
          { transaction: t }
        );

        await Kardex.create(withTenant({
          productoId: detalle.ProductoId,
          tipo: 'entrada',
          cantidad: stockASumar,
          precioUnitario: detalle.precioUnitario,
          compraId: compra.id,
        }, req.tenantId!), { transaction: t });

        if (cantidadMerma > 0) {
          await Kardex.create(withTenant({
            productoId: detalle.ProductoId,
            tipo: 'merma',
            cantidad: cantidadMerma,
            precioUnitario: detalle.precioUnitario,
            compraId: compra.id,
          }, req.tenantId!), { transaction: t });
        }
      } else {
        await producto.update(
          { stock: producto.stock + cantidadComprada },
          { transaction: t }
        );

        await Kardex.create(withTenant({
          productoId: detalle.ProductoId,
          tipo: 'entrada',
          cantidad: cantidadComprada,
          precioUnitario: detalle.precioUnitario,
          compraId: compra.id,
        }, req.tenantId!), { transaction: t });
      }
    }

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'recibir',
      entidad: 'Compra',
      entidadId: compra.id,
      detalles: { total: Number(compra.total) },
    });

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
    });

    res.json(compraCompleta);

    invalidarCache(req.tenantId!, ['reportes', 'compras']);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al recibir compra' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const compra: any = await Compra.findByPk(req.params.id as string, {
      include: [{ model: DetalleCompra }],
      transaction: t,
    });
    if (!compra) {
      await t.rollback();
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    if (!belongsToTenant(compra, req.tenantId!)) {
      await t.rollback();
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (compra.estado !== 'pendiente') {
      await t.rollback();
      return res.status(400).json({ error: 'Solo se pueden editar compras pendientes' });
    }

    const { proveedorId, observaciones, detalles } = req.body;

    if (proveedorId) compra.proveedorId = proveedorId;
    if (observaciones !== undefined) compra.observaciones = observaciones;

    if (detalles && detalles.length > 0) {
      await DetalleCompra.destroy({ where: scopeTenant({ CompraId: compra.id }, req.tenantId!), transaction: t });

      for (const detalle of detalles) {
        await DetalleCompra.create(
          withTenant({
            CompraId: compra.id,
            ProductoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.cantidad * detalle.precioUnitario,
          }, req.tenantId!),
          { transaction: t }
        );
      }

      compra.total = detalles.reduce((sum: number, d: any) => sum + d.cantidad * d.precioUnitario, 0);
    }

    await compra.save({ transaction: t });
    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'actualizar',
      entidad: 'Compra',
      entidadId: compra.id,
      detalles: { total: Number(compra.total), proveedorId: compra.proveedorId },
    });

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
    });

    res.json(compraCompleta);

    invalidarCache(req.tenantId!, ['reportes', 'compras']);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al actualizar compra' });
  }
};

export const escanearFactura = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const textoOCR = await escanearOCR(req.file.buffer, req.file.mimetype);
    if (!textoOCR.trim()) {
      return res.status(422).json({ error: 'No se pudo extraer texto de la factura' });
    }

    const proveedores = await Proveedor.findAll({ where: { activo: true } });
    const productos = await Producto.findAll({ where: { activo: true } });

    const resultado = await parsearFactura(textoOCR, proveedores as any, productos as any);

    return res.json(resultado);
  } catch (error: any) {
    console.error('Error escaneando factura:', error);
    return res.status(500).json({ error: error.message || 'Error al escanear factura' });
  }
};

export const cancelar = async (req: Request, res: Response) => {
  try {
    const compra: any = await Compra.findByPk(req.params.id as string);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (!belongsToTenant(compra, req.tenantId!)) return res.status(403).json({ error: 'Acceso denegado' });
    if (compra.estado === 'cancelada') return res.status(400).json({ error: 'La compra ya está cancelada' });
    if (compra.estado === 'recibida') return res.status(400).json({ error: 'No se puede cancelar una compra recibida' });

    await compra.update({ estado: 'cancelada' });

    await registrarAuditoria({
      req,
      accion: 'cancelar',
      entidad: 'Compra',
      entidadId: compra.id,
      detalles: { total: Number(compra.total) },
    });

    res.json({ message: 'Compra cancelada' });

    invalidarCache(req.tenantId!, ['reportes', 'compras']);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al cancelar compra' });
  }
};
