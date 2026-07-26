import { Request, Response } from 'express';
import { Venta, DetalleVenta, Producto, Mesa, DetalleReceta, Kardex, DocumentoFiscal, TenantConfig } from '../models';
import sequelize from '../config/database';
import registrarAuditoria from '../utils/auditoria';
import { scopeTenant, withTenant, belongsToTenant } from '../utils/tenantScope';
import { invalidarCache } from '../utils/cacheInvalidation';
import { checkLicense } from '../utils/licenseGuard';

export const obtenerTodas = async (req: Request, res: Response) => {
  try {
    const { pagina = 1, limite = 10 } = req.query;
    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;

    const where: any = {};
    if (req.query.estado) where.estado = req.query.estado;

    const scopedWhere = scopeTenant(where, req.tenantId!);

    const { count, rows } = await Venta.findAndCountAll({
      where: scopedWhere,
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
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
    return res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const venta: any = await Venta.findByPk(req.params.id as string, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (!belongsToTenant(venta, req.tenantId!)) return res.status(404).json({ error: 'Venta no encontrada' });
    return res.json(venta);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener venta' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { mesaId } = req.body;

    const venta: any = await Venta.create(withTenant({
      mesaId: mesaId || null,
      total: 0,
      estado: 'abierta',
    }, req.tenantId!));

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.status(201).json(ventaCompleta);

    invalidarCache(req.tenantId!, ['reportes', 'corte']);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al crear venta' });
  }
};

export const agregarProductos = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const venta: any = await Venta.findByPk(req.params.id as string, { transaction: t });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (!belongsToTenant(venta, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (venta.estado !== 'abierta') {
      await t.rollback();
      return res.status(400).json({ error: 'La venta ya esta cerrada' });
    }

    const { productos } = req.body;

    let totalAgregado = 0;

    for (const item of productos) {
      const producto: any = await Producto.findByPk(item.productoId, { transaction: t });
      if (!producto || !belongsToTenant(producto, req.tenantId!)) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
      }

      if (producto.tipo === 'compuesto') {
        const ingredientes: any = await DetalleReceta.findAll({
          where: scopeTenant({ productoId: producto.id }, req.tenantId!),
          transaction: t,
        });

        if (!ingredientes || ingredientes.length === 0) {
          await t.rollback();
          return res.status(400).json({ error: `El producto compuesto "${producto.nombre}" no tiene receta definida` });
        }

        for (const ingrediente of ingredientes) {
          const insumo: any = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
          if (!insumo || !belongsToTenant(insumo, req.tenantId!)) {
            await t.rollback();
            return res.status(400).json({ error: `Insumo id ${ingrediente.insumoId} no encontrado en receta` });
          }

          const totalRequerido = Number(ingrediente.cantidad) * Number(item.cantidad);

          if (insumo.stock < totalRequerido) {
            await t.rollback();
            return res.status(400).json({
              message: `Stock insuficiente para ${insumo.nombre}. Disponible: ${insumo.stock}`,
            });
          }
        }
      } else {
        if (Number(producto.stock) < Number(item.cantidad)) {
          await t.rollback();
          return res.status(400).json({
            message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          });
        }
      }

      const precio = item.precioUnitario || Number(producto.precioVenta);
      const cantidad = item.cantidad;

      const detalleExistente: any = await DetalleVenta.findOne({
        where: { VentaId: venta.id, ProductoId: item.productoId, tenant_id: req.tenantId! },
        transaction: t,
      });

      if (detalleExistente) {
        const nuevaCantidad = Number(detalleExistente.cantidad) + cantidad;
        detalleExistente.cantidad = nuevaCantidad;
        detalleExistente.subtotal = nuevaCantidad * Number(detalleExistente.precioUnitario);
        await detalleExistente.save({ transaction: t });
        totalAgregado += cantidad * Number(detalleExistente.precioUnitario);
      } else {
        const subtotal = cantidad * precio;
        totalAgregado += subtotal;
        await DetalleVenta.create(withTenant({
          VentaId: venta.id,
          ProductoId: item.productoId,
          cantidad,
          precioUnitario: precio,
          subtotal,
        }, req.tenantId!), { transaction: t });
      }
    }

    if (totalAgregado <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'No se pudieron agregar productos a la venta. Verifique stock y cantidades.' });
    }

    await venta.update({ total: Number(venta.total) + totalAgregado }, { transaction: t });

    await t.commit();

    if (venta.mesaId) {
      await Mesa.update({ estado: 'ocupada' }, {
        where: scopeTenant({ id: venta.mesaId, estado: 'disponible' }, req.tenantId!)
      });
    }

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);

    const io = req.app.get('io');
    if (io) io.emit('nueva-comanda', ventaCompleta);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al agregar productos' });
  }
};

export const crearConProductos = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { mesaId, productos } = req.body;

    for (const item of productos) {
      const producto: any = await Producto.findByPk(item.productoId, { transaction: t });
      if (!producto || !belongsToTenant(producto, req.tenantId!)) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
      }

      if (producto.tipo === 'compuesto') {
        const ingredientes: any = await DetalleReceta.findAll({
          where: scopeTenant({ productoId: producto.id }, req.tenantId!),
          transaction: t,
        });

        if (!ingredientes || ingredientes.length === 0) {
          await t.rollback();
          return res.status(400).json({ error: `El producto compuesto "${producto.nombre}" no tiene receta definida` });
        }

        for (const ingrediente of ingredientes) {
          const insumo: any = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
          if (!insumo || !belongsToTenant(insumo, req.tenantId!)) {
            await t.rollback();
            return res.status(400).json({ error: `Insumo id ${ingrediente.insumoId} no encontrado en receta` });
          }

          const totalRequerido = Number(ingrediente.cantidad) * Number(item.cantidad);

          if (insumo.stock < totalRequerido) {
            await t.rollback();
            return res.status(400).json({
              message: `Stock insuficiente para ${insumo.nombre}. Disponible: ${insumo.stock}`,
            });
          }
        }
      } else {
        if (Number(producto.stock) < Number(item.cantidad)) {
          await t.rollback();
          return res.status(400).json({
            message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          });
        }
      }
    }

    let total = 0;
    for (const item of productos) {
      const producto: any = await Producto.findByPk(item.productoId, { transaction: t });
      const precio = item.precioUnitario || Number(producto.precioVenta);
      total += item.cantidad * precio;
    }

    const venta: any = await Venta.create(withTenant({
      mesaId: mesaId || null,
      total: 0,
      estado: 'abierta',
    }, req.tenantId!), { transaction: t });

    for (const item of productos) {
      const producto: any = await Producto.findByPk(item.productoId, { transaction: t });
      const precio = item.precioUnitario || Number(producto.precioVenta);
      const subtotal = item.cantidad * precio;
      await DetalleVenta.create(withTenant({
        VentaId: venta.id,
        ProductoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: precio,
        subtotal,
      }, req.tenantId!), { transaction: t });
    }

    await venta.update({ total }, { transaction: t });

    if (mesaId) {
      await Mesa.update({ estado: 'ocupada' }, { where: scopeTenant({ id: mesaId }, req.tenantId!), transaction: t });
    }

    await t.commit();

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.status(201).json(ventaCompleta);

    const io = req.app.get('io');
    if (io) io.emit('nueva-comanda', ventaCompleta);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al crear venta con productos' });
  }
};

export const cobrar = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    if (!checkLicense().ok) {
      await t.rollback();
      return res.status(403).json({ error: 'Licencia inválida' });
    }

    const venta: any = await Venta.findByPk(req.params.id as string, { transaction: t });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (!belongsToTenant(venta, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (venta.estado !== 'abierta') {
      await t.rollback();
      return res.status(400).json({ error: 'La venta ya esta cerrada o cancelada' });
    }

    const { metodoPago, pagos } = req.body;

    let metodoPagoToSave: string | null = null;
    const metodosPermitidos = ['efectivo', 'tarjeta', 'transferencia'];
    let desglosePagos: any = null;

    if (pagos && Array.isArray(pagos)) {
      if (pagos.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'El arreglo de pagos no puede estar vacío' });
      }

      let sumaMontos = 0;
      for (const pago of pagos) {
        if (!metodosPermitidos.includes(pago.metodo)) {
          await t.rollback();
          return res.status(400).json({ error: `Método de pago inválido: ${pago.metodo}` });
        }
        const monto = Number(pago.monto);
        if (isNaN(monto) || monto < 0) {
          await t.rollback();
          return res.status(400).json({ error: 'Monto de pago inválido' });
        }
        sumaMontos += monto;
      }

      if (Math.abs(sumaMontos - Number(venta.total)) > 0.05) {
        await t.rollback();
        return res.status(400).json({ error: 'La suma de los pagos no coincide con el total de la venta' });
      }

      desglosePagos = pagos;

      if (pagos.length === 1) {
        metodoPagoToSave = pagos[0].metodo;
      } else {
        const metodosUnicos = [...new Set(pagos.map((p: any) => p.metodo))];
        if (metodosUnicos.length === 1) {
          metodoPagoToSave = metodosUnicos[0] as string;
        } else {
          metodoPagoToSave = 'mixto';
        }
      }
    } else if (metodoPago) {
      if (!metodosPermitidos.includes(metodoPago)) {
        await t.rollback();
        return res.status(400).json({ error: 'Método de pago inválido' });
      }
      metodoPagoToSave = metodoPago;
      desglosePagos = [{ metodo: metodoPago, monto: Number(venta.total) }];
    } else {
      await t.rollback();
      return res.status(400).json({ error: 'Debe especificar un método de pago o pagos' });
    }

    const detalles: any = await DetalleVenta.findAll({
      where: { VentaId: venta.id },
      include: [Producto],
      transaction: t,
    });

    if (!detalles || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'La venta no tiene productos para cobrar' });
    }

    for (const detalle of detalles) {
      if (detalle.Producto) {
        const producto: any = detalle.Producto;

        if (producto.tipo === 'compuesto') {
          const ingredientes: any = await DetalleReceta.findAll({
              where: scopeTenant({ productoId: producto.id }, req.tenantId!),
              transaction: t,
            });

            if (!ingredientes || ingredientes.length === 0) {
              await t.rollback();
              return res.status(400).json({ error: `El producto compuesto "${producto.nombre}" no tiene receta definida` });
            }

            for (const ingrediente of ingredientes) {
            const insumo: any = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
            if (!insumo || !belongsToTenant(insumo, req.tenantId!)) {
              await t.rollback();
              return res.status(400).json({ error: `Insumo id ${ingrediente.insumoId} no encontrado en receta` });
            }

            const totalRequerido = Number(ingrediente.cantidad) * Number(detalle.cantidad);

            if (insumo.stock < totalRequerido) {
              await t.rollback();
              return res.status(400).json({
                message: `Stock insuficiente para ${insumo.nombre}. Disponible: ${insumo.stock}`,
              });
            }

            await insumo.update({ stock: Math.floor(insumo.stock - totalRequerido) }, { transaction: t });
          }
        } else {
          if (Number(producto.stock) < Number(detalle.cantidad)) {
            await t.rollback();
            return res.status(400).json({
              message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
            });
          }
          const nuevoStock = Math.floor(producto.stock - detalle.cantidad);
          await producto.update({ stock: nuevoStock }, { transaction: t });
        }
      }
    }

    for (const detalle of detalles) {
      if (detalle.Producto) {
        const producto: any = detalle.Producto;

        if (producto.tipo === 'compuesto') {
          const ingredientes: any = await DetalleReceta.findAll({
            where: scopeTenant({ productoId: producto.id }, req.tenantId!),
            transaction: t,
          });

          for (const ingrediente of ingredientes) {
            const insumo: any = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
            const totalDescontado = Number(ingrediente.cantidad) * Number(detalle.cantidad);

            const entradas = await Kardex.findAll({
              where: scopeTenant({
                productoId: ingrediente.insumoId,
                tipo: 'entrada',
              }, req.tenantId!),
              order: [['fecha', 'ASC']],
              transaction: t,
            });

            let costoUnitario = Number(insumo.precioCompra);
            if (entradas.length > 0) {
              costoUnitario = Number((entradas[0] as any).precioUnitario);
            }

            await Kardex.create(withTenant({
              productoId: ingrediente.insumoId,
              tipo: 'salida',
              cantidad: totalDescontado,
              precioUnitario: costoUnitario,
              ventaId: venta.id,
            }, req.tenantId!), { transaction: t });
          }
        } else {
          const entradas = await Kardex.findAll({
            where: scopeTenant({
              productoId: producto.id,
              tipo: 'entrada',
            }, req.tenantId!),
            order: [['fecha', 'ASC']],
            transaction: t,
          });

          let costoUnitario = Number(producto.precioCompra);
          if (entradas.length > 0) {
            costoUnitario = Number((entradas[0] as any).precioUnitario);
          }

          await Kardex.create(withTenant({
            productoId: producto.id,
            tipo: 'salida',
            cantidad: Number(detalle.cantidad),
            precioUnitario: costoUnitario,
            ventaId: venta.id,
          }, req.tenantId!), { transaction: t });
        }
      }
    }

    await venta.update({
      estado: 'cerrada',
      metodoPago: metodoPagoToSave,
      total: Number(venta.total),
    }, { transaction: t });

    if (venta.mesaId) {
      await Mesa.update({ estado: 'disponible' }, {
        where: scopeTenant({ id: venta.mesaId }, req.tenantId!),
        transaction: t,
      });
    }

    await t.commit();

    // Auto-generar documento fiscal si tenant tiene config
    try {
      const configFiscal: any = await TenantConfig.findOne({ where: { tenant_id: req.tenantId } });
      if (configFiscal?.rut && configFiscal?.razonSocial) {
        await DocumentoFiscal.create({
          tenant_id: req.tenantId,
          ventaId: venta.id,
          tipo: 'boleta',
          estado: 'pendiente',
          montoNeto: Number((venta.total / 1.19).toFixed(2)),
          iva: Number(((venta.total * 0.19) / 1.19).toFixed(2)),
          montoTotal: venta.total,
        });
      }
    } catch (e: any) {
      console.error('Error al crear documento fiscal automático:', e);
    }

    await registrarAuditoria({
      req,
      accion: 'cobrar',
      entidad: 'Venta',
      entidadId: venta.id,
      detalles: { total: Number(venta.total), metodoPago: metodoPagoToSave, pagos: desglosePagos },
    });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);

    invalidarCache(req.tenantId!, ['reportes', 'corte']);

    const io = req.app.get('io');
    if (io) io.emit('venta-cerrada', { id: venta.id, total: Number(venta.total) });
  } catch (error: any) {
    console.error('Error en cobrar:', error.message || error);
    await t.rollback();
    return res.status(500).json({ error: 'Error al cobrar venta' });
  }
};

export const crearRapida = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { mesaId, metodoPago, productos, cliente } = req.body;

    let total = 0;
    for (const item of productos) {
      const prod: any = await Producto.findByPk(item.productoId, { transaction: t });
      if (!prod || !belongsToTenant(prod, req.tenantId!)) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
      }
      const precio = item.precioUnitario || Number(prod.precioVenta);
      total += item.cantidad * precio;
    }

    const venta: any = await Venta.create(withTenant({
      mesaId: mesaId || null,
      total,
      metodoPago,
      cliente,
      estado: 'cerrada',
    }, req.tenantId!), { transaction: t });

    for (const item of productos) {
      const producto: any = await Producto.findByPk(item.productoId, { transaction: t });
      if (!producto || !belongsToTenant(producto, req.tenantId!)) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
      }

      const precio = item.precioUnitario || Number(producto.precioVenta);
      const subtotal = item.cantidad * precio;

      await DetalleVenta.create(withTenant({
        VentaId: venta.id,
        ProductoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: precio,
        subtotal,
      }, req.tenantId!), { transaction: t });

      if (producto.tipo === 'compuesto') {
        const ingredientes: any = await DetalleReceta.findAll({
          where: scopeTenant({ productoId: producto.id }, req.tenantId!),
          transaction: t,
        });

        if (!ingredientes || ingredientes.length === 0) {
          await t.rollback();
          return res.status(400).json({ error: `El producto compuesto "${producto.nombre}" no tiene receta definida` });
        }

        for (const ingrediente of ingredientes) {
          const insumo: any = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
          if (!insumo || !belongsToTenant(insumo, req.tenantId!)) {
            await t.rollback();
            return res.status(400).json({ error: `Insumo id ${ingrediente.insumoId} no encontrado en receta` });
          }

          const totalRequerido = Number(ingrediente.cantidad) * Number(item.cantidad);

          if (insumo.stock < totalRequerido) {
            await t.rollback();
            return res.status(400).json({
              message: `Stock insuficiente para ${insumo.nombre}. Disponible: ${insumo.stock}`,
            });
          }

          await insumo.update({ stock: Math.floor(insumo.stock - totalRequerido) }, { transaction: t });
        }
      } else {
        if (Number(producto.stock) < Number(item.cantidad)) {
          await t.rollback();
          return res.status(400).json({
            message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          });
        }
        await producto.update({ stock: Math.floor(producto.stock - item.cantidad) }, { transaction: t });
      }
    }

    for (const item of productos) {
      const producto: any = await Producto.findByPk(item.productoId, { transaction: t });
      if (producto) {
        if (producto.tipo === 'compuesto') {
          const ingredientes: any = await DetalleReceta.findAll({
            where: scopeTenant({ productoId: producto.id }, req.tenantId!),
            transaction: t,
          });

          for (const ingrediente of ingredientes) {
            const insumo: any = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
            const totalDescontado = Number(ingrediente.cantidad) * Number(item.cantidad);

            const entradas = await Kardex.findAll({
              where: scopeTenant({
                productoId: ingrediente.insumoId,
                tipo: 'entrada',
              }, req.tenantId!),
              order: [['fecha', 'ASC']],
              transaction: t,
            });

            let costoUnitario = Number(insumo.precioCompra);
            if (entradas.length > 0) {
              costoUnitario = Number((entradas[0] as any).precioUnitario);
            }

            await Kardex.create(withTenant({
              productoId: ingrediente.insumoId,
              tipo: 'salida',
              cantidad: totalDescontado,
              precioUnitario: costoUnitario,
              ventaId: venta.id,
            }, req.tenantId!), { transaction: t });
          }
        } else {
          const entradas = await Kardex.findAll({
            where: scopeTenant({
              productoId: producto.id,
              tipo: 'entrada',
            }, req.tenantId!),
            order: [['fecha', 'ASC']],
            transaction: t,
          });

          let costoUnitario = Number(producto.precioCompra);
          if (entradas.length > 0) {
            costoUnitario = Number((entradas[0] as any).precioUnitario);
          }

          await Kardex.create(withTenant({
            productoId: producto.id,
            tipo: 'salida',
            cantidad: Number(item.cantidad),
            precioUnitario: costoUnitario,
            ventaId: venta.id,
          }, req.tenantId!), { transaction: t });
        }
      }
    }

    if (mesaId) {
      await Mesa.update({ estado: 'disponible' }, { where: scopeTenant({ id: mesaId }, req.tenantId!), transaction: t });
    }

    await t.commit();

    // Auto-generar documento fiscal si tenant tiene config
    try {
      const configFiscal: any = await TenantConfig.findOne({ where: { tenant_id: req.tenantId } });
      if (configFiscal?.rut && configFiscal?.razonSocial) {
        await DocumentoFiscal.create({
          tenant_id: req.tenantId,
          ventaId: venta.id,
          tipo: 'boleta',
          estado: 'pendiente',
          montoNeto: Number((total / 1.19).toFixed(2)),
          iva: Number(((total * 0.19) / 1.19).toFixed(2)),
          montoTotal: total,
        });
      }
    } catch (e: any) {
      console.error('Error al crear documento fiscal automático:', e);
    }

    await registrarAuditoria({
      req,
      accion: 'crear_rapida',
      entidad: 'Venta',
      entidadId: venta.id,
      detalles: { total, metodoPago, cantidadProductos: productos.length },
    });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.status(201).json(ventaCompleta);

    invalidarCache(req.tenantId!, ['reportes', 'corte']);

    const io = req.app.get('io');
    if (io) io.emit('venta-cerrada', { id: venta.id, total: Number(venta.total) });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al crear venta rapida' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const venta: any = await Venta.findByPk(req.params.id as string);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (!belongsToTenant(venta, req.tenantId!)) return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado !== 'abierta') return res.status(400).json({ error: 'Solo se puede modificar una venta abierta' });

    const { cliente, mesaId } = req.body;
    const datos: any = {};
    if (cliente !== undefined) datos.cliente = cliente;
    if (mesaId !== undefined) datos.mesaId = mesaId;

    await venta.update(datos);

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    return res.json(ventaCompleta);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar venta' });
  }
};

export const cancelar = async (req: Request, res: Response) => {
  try {
    const venta: any = await Venta.findByPk(req.params.id as string);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (!belongsToTenant(venta, req.tenantId!)) return res.status(404).json({ error: 'Venta no encontrada' });

    await venta.update({ estado: 'cancelada' });

    if (venta.mesaId) {
      await Mesa.update({ estado: 'disponible' }, { where: scopeTenant({ id: venta.mesaId }, req.tenantId!) });
    }

    await registrarAuditoria({
      req,
      accion: 'cancelar',
      entidad: 'Venta',
      entidadId: venta.id,
      detalles: { total: Number(venta.total) },
    });

    res.json({ message: 'Venta cancelada' });

    invalidarCache(req.tenantId!, ['reportes', 'corte']);

    const io = req.app.get('io');
    if (io) io.emit('venta-cancelada', { id: venta.id });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al cancelar venta' });
  }
};

export const actualizarDetalle = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const venta: any = await Venta.findByPk(req.params.id as string, { transaction: t });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (!belongsToTenant(venta, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (venta.estado !== 'abierta') {
      await t.rollback();
      return res.status(400).json({ error: 'Solo se puede modificar una venta abierta' });
    }

    const detalle: any = await DetalleVenta.findByPk(req.params.detalleId as string, { transaction: t });
    if (!detalle) {
      await t.rollback();
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    if (!belongsToTenant(detalle, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    if (detalle.VentaId !== venta.id) {
      await t.rollback();
      return res.status(400).json({ error: 'El detalle no pertenece a esta venta' });
    }

    const { cantidad } = req.body;
    const subtotal = cantidad * Number(detalle.precioUnitario);

    await detalle.update({ cantidad, subtotal }, { transaction: t });

    const detalles: any = await DetalleVenta.findAll({ where: { VentaId: venta.id }, transaction: t });
    const nuevoTotal = detalles.reduce((sum: number, d: any) => sum + Number(d.subtotal), 0);
    await venta.update({ total: nuevoTotal }, { transaction: t });

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'actualizar_detalle',
      entidad: 'DetalleVenta',
      entidadId: detalle.id,
      detalles: { cantidad, subtotal, ventaId: venta.id },
    });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    return res.json(ventaCompleta);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al actualizar detalle' });
  }
};

export const eliminarDetalle = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const venta: any = await Venta.findByPk(req.params.id as string, { transaction: t });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (!belongsToTenant(venta, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (venta.estado !== 'abierta') {
      await t.rollback();
      return res.status(400).json({ error: 'Solo se puede modificar una venta abierta' });
    }

    const detalle: any = await DetalleVenta.findByPk(req.params.detalleId as string, { transaction: t });
    if (!detalle) {
      await t.rollback();
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    if (!belongsToTenant(detalle, req.tenantId!)) {
      await t.rollback();
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    if (detalle.VentaId !== venta.id) {
      await t.rollback();
      return res.status(400).json({ error: 'El detalle no pertenece a esta venta' });
    }

    const count = await DetalleVenta.count({ where: { VentaId: venta.id }, transaction: t });
    if (count <= 1) {
      await t.rollback();
      return res.status(400).json({ error: 'No se puede eliminar el último detalle de la venta' });
    }

    const datosAnteriores = { cantidad: detalle.cantidad, subtotal: Number(detalle.subtotal), ProductoId: detalle.ProductoId };

    await detalle.destroy({ transaction: t });

    const detalles: any = await DetalleVenta.findAll({ where: { VentaId: venta.id }, transaction: t });
    const nuevoTotal = detalles.reduce((sum: number, d: any) => sum + Number(d.subtotal), 0);
    await venta.update({ total: nuevoTotal }, { transaction: t });

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'eliminar_detalle',
      entidad: 'DetalleVenta',
      entidadId: detalle.id,
      detalles: { ...datosAnteriores, ventaId: venta.id },
    });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    return res.json(ventaCompleta);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al eliminar detalle' });
  }
};
