import { Request, Response } from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { Venta, DetalleVenta, Producto, DeliveryConfig, Tenant } from '../models';

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

    const { pedidoId, cliente, productos, direccion, telefono, total } = req.body;

    // Validar stock antes de crear
    if (productos && Array.isArray(productos)) {
      for (const item of productos) {
        const prod: any = await Producto.findOne({
          where: { tenant_id: config.tenant_id, nombre: { [Op.iLike]: item.nombre } },
        });
        if (prod) {
          const cantidad = item.cantidad || 1;
          if (Number(prod.stock) < cantidad) {
            return res.status(400).json({
              message: `Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}`,
            });
          }
        }
      }
    }

    // Crear venta
    const venta: any = await Venta.create({
      tenant_id: config.tenant_id,
      tipo: 'delivery',
      deliveryApp: app,
      deliveryPedidoId: pedidoId || null,
      direccionEntrega: direccion || null,
      clienteTelefono: telefono || null,
      estado: 'abierta',
      total: total || 0,
    });

    // Crear DetalleVenta y calcular total
    if (productos && Array.isArray(productos)) {
      let totalCalculado = 0;
      for (const item of productos) {
        const producto: any = await Producto.findOne({
          where: { tenant_id: config.tenant_id, nombre: { [Op.iLike]: item.nombre } },
        });
        if (producto) {
          const cantidad = item.cantidad || 1;
          const precio = Number(item.precio || producto.precioVenta);
          await DetalleVenta.create({
            tenant_id: config.tenant_id,
            VentaId: venta.id,
            ProductoId: producto.id,
            cantidad,
            precioUnitario: precio,
            subtotal: cantidad * precio,
            estadoComanda: 'pendiente',
          });
          totalCalculado += cantidad * precio;
        }
      }
      if (totalCalculado > 0) {
        venta.total = totalCalculado;
        await venta.save();
      }
    }

    // Emitir Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('nuevo-pedido-delivery', { ventaId: venta.id, app });
      const ventaCompleta = await Venta.findByPk(venta.id, {
        include: [{ model: DetalleVenta, include: [Producto] }],
      });
      if (ventaCompleta) io.emit('nueva-comanda', ventaCompleta);
    }

    res.status(201).json({ message: 'Pedido recibido', ventaId: venta.id });
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
