const { Producto, DetalleReceta } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../utils/auditoria');
const { scopeTenant, withTenant, belongsToTenant } = require('../utils/tenantScope');
const { invalidarCache } = require('../utils/cacheInvalidation');

const obtenerTodos = async (req, res) => {
  try {
    const { categoria, buscar, activo, tipo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    else where.activo = true;
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;
    if (buscar) where.nombre = { [Op.like]: `%${buscar}%` };
    const scopedWhere = scopeTenant(where, req.tenantId);

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
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [{
        model: DetalleReceta,
        as: 'detallesReceta',
        include: [{
          model: Producto,
          as: 'insumo',
        }],
      }],
    });
    if (!producto || !belongsToTenant(producto, req.tenantId)) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const crear = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { detallesReceta, ...productoDatos } = req.body;
    const datos = withTenant(productoDatos, req.tenantId);

    const producto = await Producto.create(datos, { transaction: t });

    if (producto.tipo === 'compuesto' && detallesReceta && Array.isArray(detallesReceta)) {
      const detallesData = detallesReceta.map(d => withTenant({
        productoId: producto.id,
        insumoId: d.insumoId,
        cantidad: d.cantidad,
        unidad: d.unidad || 'unidad',
        merma: d.merma || 0,
      }, req.tenantId));
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

    invalidarCache(req.tenantId, ['productos', 'reportes']);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const producto = await Producto.findByPk(req.params.id, { transaction: t });
    if (!producto || !belongsToTenant(producto, req.tenantId)) {
      await t.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { detallesReceta, ...productoDatos } = req.body;
    const datos = { ...productoDatos };

    await producto.update(datos, { transaction: t });

    if (producto.tipo === 'compuesto' && detallesReceta && Array.isArray(detallesReceta)) {
      await DetalleReceta.destroy({
        where: scopeTenant({ productoId: producto.id }, req.tenantId),
        transaction: t,
      });
      const detallesData = detallesReceta.map(d => withTenant({
        productoId: producto.id,
        insumoId: d.insumoId,
        cantidad: d.cantidad,
        unidad: d.unidad || 'unidad',
        merma: d.merma || 0,
      }, req.tenantId));
      await DetalleReceta.bulkCreate(detallesData, { transaction: t });
    } else if (producto.tipo !== 'compuesto') {
      await DetalleReceta.destroy({
        where: scopeTenant({ productoId: producto.id }, req.tenantId),
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

    invalidarCache(req.tenantId, ['productos', 'reportes']);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const desactivar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto || !belongsToTenant(producto, req.tenantId)) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false });

    await registrarAuditoria({
      req,
      accion: 'desactivar',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre },
    });

    res.json({ message: 'Producto desactivado' });

    invalidarCache(req.tenantId, ['productos', 'reportes']);
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar producto' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  desactivar,
};
