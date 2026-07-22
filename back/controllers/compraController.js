const { Compra, DetalleCompra, Producto } = require('../models');
const sequelize = require('../config/database');

const obtenerTodas = async (req, res) => {
  try {
    const compras = await Compra.findAll({
      include: [{ model: DetalleCompra, include: [Producto] }],
      order: [['fecha', 'DESC']],
    });
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id, {
      include: [{ model: DetalleCompra, include: [Producto] }],
    });
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compra' });
  }
};

const crear = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { proveedor, observaciones, detalles } = req.body;

    const total = detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);

    const compra = await Compra.create(
      { proveedor, total, observaciones },
      { transaction: t }
    );

    for (const detalle of detalles) {
      await DetalleCompra.create(
        {
          CompraId: compra.id,
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
          { stock: producto.stock + detalle.cantidad },
          { transaction: t }
        );
      }
    }

    await t.commit();

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [{ model: DetalleCompra, include: [Producto] }],
    });

    res.status(201).json(compraCompleta);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear compra' });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
};
