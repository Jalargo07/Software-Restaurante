import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { Venta, DetalleVenta, Producto, DeliveryConfig, Tenant, DeliveryOrder } from '../models';
import { parseRappiWebhook, parseUberEatsWebhook, crearDeliveryOrder } from '../services/deliveryWebhookParser';

export const webhookDelivery = async (req: Request, res: Response) => {
  try {
    const app = req.params.app as string;
    if (!['rappi', 'uber', 'pedidosya'].includes(app)) {
      return res.status(400).json({ error: 'App no soportada' });
    }

    const config: any = await DeliveryConfig.findOne({
      where: { app, activo: true },
      include: [{ model: Tenant, attributes: ['id'] }],
    });
    if (!config) return res.status(404).json({ error: 'Configuración no encontrada' });

    const signature = req.headers['x-signature'] as string;
    if (config.webhookSecret && signature) {
      const body = JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', config.webhookSecret).update(body).digest('hex');
      if (signature !== expected) return res.status(401).json({ error: 'Firma inválida' });
    }

    let normalized: any;
    if (app === 'rappi') {
      normalized = await parseRappiWebhook(req.body);
    } else if (app === 'uber') {
      normalized = await parseUberEatsWebhook(req.body);
    }

    const { pedidoId, cliente, productos, direccion, telefono, total } = req.body;

    // Crear DeliveryOrder si tenemos parsing normalizado
    let deliveryOrder: any = null;
    if (normalized) {
      deliveryOrder = await crearDeliveryOrder(config.tenant_id, normalized);
    }

    // Validar stock antes de crear
    const itemsToValidate = productos || (normalized?.items?.map((i: any) => ({ nombre: i.name, cantidad: i.quantity })) || []);
    if (itemsToValidate.length > 0) {
      for (const item of itemsToValidate) {
        const prod: any = await Producto.findOne({
          where: { tenant_id: config.tenant_id, nombre: { [Op.iLike]: item.nombre } },
        });
        if (prod) {
          const cantidad = item.cantidad || 1;
          if (cantidad <= 0) {
            return res.status(400).json({ message: `Cantidad inválida para ${item.nombre}` });
          }
          if (Number(prod.stock) < cantidad) {
            return res.status(400).json({
              message: `Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}`,
            });
          }
        }
      }
    }

    // Emitir Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`tenant:${config.tenant_id}`).emit('nuevo-pedido-delivery', { deliveryOrderId: deliveryOrder?.id, app });
    }

    res.status(201).json({ message: 'Pedido recibido', deliveryOrderId: deliveryOrder?.id });
  } catch (error: any) {
    console.error('Error en webhookDelivery:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

export const simularPedido = async (req: Request, res: Response) => {
  try {
    const { app, productos } = req.body;
    if (!app || !productos || !Array.isArray(productos)) {
      return res.status(400).json({ error: 'app y productos requeridos' });
    }

    for (const p of productos) {
      if (!p.cantidad || p.cantidad <= 0) {
        return res.status(400).json({ message: `Cantidad inválida para ${p.nombre || 'producto desconocido'}` });
      }
    }

    const mockBody = {
      pedidoId: `sim-${Date.now()}`,
      cliente: { nombre: 'Cliente de prueba' },
      productos: productos.map((p: any) => ({ nombre: p.nombre, cantidad: p.cantidad, precio: p.precio })),
      direccion: 'Dirección de prueba 123',
      telefono: '+56912345678',
      total: productos.reduce((sum: number, p: any) => sum + (p.precio || 0) * (p.cantidad || 1), 0),
    };

    req.params = { app };
    req.body = mockBody;
    return webhookDelivery(req, res);
  } catch (error: any) {
    console.error('Error en simularPedido:', error);
    res.status(500).json({ error: 'Error al simular pedido' });
  }
};

export async function actualizarEstadoDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order: any = await DeliveryOrder.findByPk(orderId as string);
    if (!order) {
      return res.status(404).json({ error: 'Orden de delivery no encontrada' });
    }

    order.status = status;
    await order.save();

    if (order.ventaId) {
      await Venta.update(
        { estado: status === 'delivered' ? 'cerrada' : 'abierta' },
        { where: { id: order.ventaId } }
      );
    }

    res.json({ ok: true, order });
  } catch (error) {
    next(error);
  }
}

export async function listarDeliveryOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId } = req as any;
    const { status, partner } = req.query;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (partner) where.partner = partner;

    const orders = await DeliveryOrder.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}
