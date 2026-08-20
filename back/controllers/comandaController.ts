import { Request, Response } from 'express';
import { Venta, DetalleVenta, Producto, Mesa } from '../models';
import { Op } from 'sequelize';
import { scopeTenant, belongsToTenant } from '../utils/tenantScope';

export const obtenerComandas = async (req: Request, res: Response) => {
  try {
    const ventas = await Venta.findAll({
      where: scopeTenant({ estado: 'abierta' }, req.tenantId!),
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

    return res.json(ventas);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener comandas' });
  }
};

export const actualizarEstado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estadoComanda } = req.body;

    if (!['pendiente', 'en_preparacion', 'listo'].includes(estadoComanda)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const detalle: any = await DetalleVenta.findByPk(id as string);
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' });

    await detalle.update({ estadoComanda });

    const venta: any = await Venta.findByPk(detalle.VentaId, {
      include: [
        { model: DetalleVenta, include: [Producto] },
        Mesa,
      ],
    });

    if (!belongsToTenant(venta, req.tenantId!)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json(venta);

    const io = req.app.get('io');
    if (io) io.to(`tenant:${req.tenantId}`).emit('comanda-actualizada', venta);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar comanda' });
  }
};
