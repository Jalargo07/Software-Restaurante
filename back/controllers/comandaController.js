const { Venta, DetalleVenta, Producto, Mesa } = require('../models');
const { Op } = require('sequelize');

const obtenerComandas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      where: { estado: 'abierta' },
      include: [
        {
          model: DetalleVenta,
          where: { estadoComanda: { [Op.ne]: 'listo' } },
          include: [Producto],
        },
        Mesa,
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comandas' });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoComanda } = req.body;

    if (!['pendiente', 'en_preparacion', 'listo'].includes(estadoComanda)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const detalle = await DetalleVenta.findByPk(id);
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' });

    await detalle.update({ estadoComanda });

    const venta = await Venta.findByPk(detalle.VentaId, {
      include: [
        { model: DetalleVenta, include: [Producto] },
        Mesa,
      ],
    });

    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar comanda' });
  }
};

module.exports = { obtenerComandas, actualizarEstado };
