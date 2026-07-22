const { Venta, DetalleVenta, Producto, Mesa } = require('../models');
const sequelize = require('../config/database');

const obtenerTodas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
      order: [['fecha', 'DESC']],
    });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener venta' });
  }
};

const crear = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { mesaId, metodoPago, cliente, detalles } = req.body;

    const total = detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);

    const venta = await Venta.create(
      { mesaId, total, metodoPago, cliente, estado: 'cerrada' },
      { transaction: t }
    );

    for (const detalle of detalles) {
      await DetalleVenta.create(
        {
          VentaId: venta.id,
          ProductoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.cantidad * detalle.precioUnitario,
        },
        { transaction: t }
      );

      const producto = await Producto.findByPk(detalle.productoId, { transaction: t });
      if (producto) {
        await producto.update(
          { stock: producto.stock - detalle.cantidad },
          { transaction: t }
        );
      }
    }

    await Mesa.update(
      { estado: 'disponible' },
      { where: { id: mesaId }, transaction: t }
    );

    await t.commit();

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.status(201).json(ventaCompleta);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear venta' });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
};
