import { Request, Response } from 'express';
import { Producto, DetalleReceta } from '../models';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import registrarAuditoria from '../utils/auditoria';
import { scopeTenant, withTenant, belongsToTenant } from '../utils/tenantScope';
import { invalidarCache } from '../utils/cacheInvalidation';
import { checkLicense } from '../utils/licenseGuard';

export const obtenerTodos = async (req: Request, res: Response) => {
  try {
    const { categoria, buscar, activo, tipo } = req.query;
    const where: any = {};
    if (activo !== undefined) where.activo = activo === 'true';
    else where.activo = true;
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;
    if (buscar) where.nombre = { [Op.like]: `%${buscar}%` };
    const scopedWhere = scopeTenant(where, req.tenantId!);

    const productos = await Producto.findAll({
      where: scopedWhere,
      include: [{
        model: DetalleReceta,
        as: 'detallesReceta',
        include: [{
          model: Producto,
          as: 'insumo',
        }],
      }],
    });
    return res.json(productos);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const producto: any = await Producto.findByPk(req.params.id as string, {
      include: [{
        model: DetalleReceta,
        as: 'detallesReceta',
        include: [{
          model: Producto,
          as: 'insumo',
        }],
      }],
    });
    if (!producto || !belongsToTenant(producto, req.tenantId!)) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(producto);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener producto' });
  }
};

export const crear = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    if (!checkLicense().ok) {
      await t.rollback();
      return res.status(403).json({ error: 'Licencia inválida' });
    }

    const { detallesReceta, ...productoDatos } = req.body;
    const datos = withTenant(productoDatos, req.tenantId!);

    const producto: any = await Producto.create(datos, { transaction: t });

    if (producto.tipo === 'compuesto' && detallesReceta && Array.isArray(detallesReceta)) {
      const detallesData = detallesReceta.map((d: any) => withTenant({
        productoId: producto.id,
        insumoId: d.insumoId,
        cantidad: d.cantidad,
        unidad: d.unidad || 'unidad',
      }, req.tenantId!));
      await DetalleReceta.bulkCreate(detallesData, { transaction: t });
    }

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'crear',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre, categoria: producto.categoria },
    });

    const productoCompleto = await Producto.findByPk(producto.id, {
      include: [{
        model: DetalleReceta,
        as: 'detallesReceta',
        include: [{ model: Producto, as: 'insumo' }],
      }],
    });

    res.status(201).json(productoCompleto);

    invalidarCache(req.tenantId!, ['productos', 'reportes']);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    if (!checkLicense().ok) {
      await t.rollback();
      return res.status(403).json({ error: 'Licencia inválida' });
    }

    const producto: any = await Producto.findByPk(req.params.id as string, { transaction: t });
    if (!producto || !belongsToTenant(producto, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { detallesReceta, ...productoDatos } = req.body;
    const datos = { ...productoDatos };

    await producto.update(datos, { transaction: t });

    if (producto.tipo === 'compuesto' && detallesReceta && Array.isArray(detallesReceta)) {
      await DetalleReceta.destroy({
        where: scopeTenant({ productoId: producto.id }, req.tenantId!),
        transaction: t,
      });
      const detallesData = detallesReceta.map((d: any) => withTenant({
        productoId: producto.id,
        insumoId: d.insumoId,
        cantidad: d.cantidad,
        unidad: d.unidad || 'unidad',
      }, req.tenantId!));
      await DetalleReceta.bulkCreate(detallesData, { transaction: t });
    } else if (producto.tipo !== 'compuesto') {
      await DetalleReceta.destroy({
        where: scopeTenant({ productoId: producto.id }, req.tenantId!),
        transaction: t,
      });
    }

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'actualizar',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre, cambios: Object.keys(datos) },
    });

    const productoCompleto = await Producto.findByPk(producto.id, {
      include: [{
        model: DetalleReceta,
        as: 'detallesReceta',
        include: [{ model: Producto, as: 'insumo' }],
      }],
    });

    res.json(productoCompleto);

    invalidarCache(req.tenantId!, ['productos', 'reportes']);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const desactivar = async (req: Request, res: Response) => {
  try {
    const producto: any = await Producto.findByPk(req.params.id as string);
    if (!producto || !belongsToTenant(producto, req.tenantId!)) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false });

    await registrarAuditoria({
      req,
      accion: 'desactivar',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre },
    });

    res.json({ message: 'Producto desactivado' });

    invalidarCache(req.tenantId!, ['productos', 'reportes']);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al desactivar producto' });
  }
};
