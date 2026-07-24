const { Compra, DetalleCompra, Producto, Proveedor } = require('../models');
const sequelize = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { scopeTenant, withTenant, belongsToTenant } = require('../utils/tenantScope');

const obtenerTodas = async (req, res) => {
  try {
    const { pagina = 1, limite = 10 } = req.query;
    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;

    const { count, rows } = await Compra.findAndCountAll({
      where: scopeTenant(null, req.tenantId),
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
      total: count,
      pagina: Number(pagina),
      paginas: Math.ceil(count / limit) || 1,
      limite: limit,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id, {
      include: [{ model: DetalleCompra, include: [Producto] }, { model: Proveedor }],
    });
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (!belongsToTenant(compra, req.tenantId)) return res.status(403).json({ error: 'Acceso denegado' });
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compra' });
  }
};

const crear = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { proveedorId, observaciones, detalles } = req.body;

    const total = detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);

    const compra = await Compra.create(
      withTenant({ proveedorId, total, observaciones }, req.tenantId),
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
        }, req.tenantId),
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
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear compra' });
  }
};

const recibir = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const compra = await Compra.findByPk(req.params.id, {
      include: [{ model: DetalleCompra }],
      transaction: t,
    });
    if (!compra) {
      await t.rollback();
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    if (!belongsToTenant(compra, req.tenantId)) {
      await t.rollback();
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (compra.estado !== 'pendiente') {
      await t.rollback();
      return res.status(400).json({ error: 'Solo se pueden recibir compras pendientes' });
    }

    await compra.update({ estado: 'recibida' }, { transaction: t });

    for (const detalle of compra.DetalleCompras) {
      const producto = await Producto.findByPk(detalle.ProductoId, { transaction: t });
      if (!producto || !belongsToTenant(producto, req.tenantId)) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${detalle.ProductoId} no encontrado o no pertenece al tenant` });
      }
      await producto.update(
        { stock: producto.stock + detalle.cantidad },
        { transaction: t }
      );
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
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al recibir compra' });
  }
};

const actualizar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const compra = await Compra.findByPk(req.params.id, {
      include: [{ model: DetalleCompra }],
      transaction: t,
    });
    if (!compra) {
      await t.rollback();
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    if (!belongsToTenant(compra, req.tenantId)) {
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
      await DetalleCompra.destroy({ where: scopeTenant({ CompraId: compra.id }, req.tenantId), transaction: t });

      for (const detalle of detalles) {
        await DetalleCompra.create(
          withTenant({
            CompraId: compra.id,
            ProductoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.cantidad * detalle.precioUnitario,
          }, req.tenantId),
          { transaction: t }
        );
      }

      compra.total = detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);
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
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al actualizar compra' });
  }
};

const cancelar = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (!belongsToTenant(compra, req.tenantId)) return res.status(403).json({ error: 'Acceso denegado' });
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
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar compra' });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  recibir,
  actualizar,
  cancelar,
};
