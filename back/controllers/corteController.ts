import { Request, Response } from 'express';
import { CorteCaja, Venta, DetalleVenta, Producto, Mesa, Usuario } from '../models';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import registrarAuditoria from '../utils/auditoria';
import { scopeTenant, withTenant, belongsToTenant } from '../utils/tenantScope';
import { invalidarCache } from '../utils/cacheInvalidation';

export const obtenerResumen = async (req: Request, res: Response) => {
  try {
    const hoy = (req.query.fecha as string) || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

    const ventas: any = await Venta.findAll({
      where: scopeTenant({
        estado: 'cerrada',
        createdAt: {
          [Op.gte]: new Date(`${hoy}T00:00:00`),
          [Op.lte]: new Date(`${hoy}T23:59:59`),
        },
      }, req.tenantId!),
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    const canceladas: any = await Venta.findAll({
      where: scopeTenant({
        estado: 'cancelada',
        createdAt: {
          [Op.gte]: new Date(`${hoy}T00:00:00`),
          [Op.lte]: new Date(`${hoy}T23:59:59`),
        },
      }, req.tenantId!),
    });

    const resumen: any = {
      fecha: hoy,
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalTransferencia: 0,
      totalGeneral: 0,
      cantidadVentas: ventas.length,
      ventasCanceladas: canceladas.length,
      montoCanceladas: canceladas.reduce((sum: number, v: any) => sum + Number(v.total), 0),
      ventas: [],
    };

    for (const venta of ventas) {
      const monto = Number(venta.total);
      const metodo = venta.metodoPago || 'efectivo';

      if (metodo === 'efectivo') resumen.totalEfectivo += monto;
      else if (metodo === 'tarjeta') resumen.totalTarjeta += monto;
      else if (metodo === 'transferencia') resumen.totalTransferencia += monto;

      resumen.totalGeneral += monto;
      resumen.ventas.push(venta);
    }

    return res.json(resumen);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener resumen de caja' });
  }
};

export const cerrarCaja = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const hoy = (req.query.fecha as string) || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

    const corteExistente = await CorteCaja.findOne({
      where: scopeTenant({ fecha: hoy }, req.tenantId!),
      transaction: t,
    });

    if (corteExistente) {
      await t.rollback();
      return res.status(400).json({ error: 'Ya existe un corte de caja para este día' });
    }

    const ventas: any = await Venta.findAll({
      where: scopeTenant({
        estado: 'cerrada',
        createdAt: {
          [Op.gte]: new Date(`${hoy}T00:00:00`),
          [Op.lte]: new Date(`${hoy}T23:59:59`),
        },
      }, req.tenantId!),
      transaction: t,
    });

    const canceladas: any = await Venta.findAll({
      where: scopeTenant({
        estado: 'cancelada',
        createdAt: {
          [Op.gte]: new Date(`${hoy}T00:00:00`),
          [Op.lte]: new Date(`${hoy}T23:59:59`),
        },
      }, req.tenantId!),
      transaction: t,
    });

    let totalEfectivo = 0;
    let totalTarjeta = 0;
    let totalTransferencia = 0;
    let totalGeneral = 0;

    const ventasInfo = ventas.map((v: any) => {
      const monto = Number(v.total);
      const metodo = v.metodoPago || 'efectivo';

      if (metodo === 'efectivo') totalEfectivo += monto;
      else if (metodo === 'tarjeta') totalTarjeta += monto;
      else if (metodo === 'transferencia') totalTransferencia += monto;

      totalGeneral += monto;

      return {
        id: v.id,
        total: monto,
        metodoPago: metodo,
        fecha: v.createdAt,
      };
    });

    const montoCanceladas = canceladas.reduce((sum: number, v: any) => sum + Number(v.total), 0);

    const corte: any = await CorteCaja.create(withTenant({
      fecha: hoy,
      totalEfectivo,
      totalTarjeta,
      totalTransferencia,
      totalGeneral,
      cantidadVentas: ventas.length,
      ventasCanceladas: canceladas.length,
      montoCanceladas,
      ventasCerradas: ventasInfo,
      usuarioId: req.user?.id || null,
      cerradoEn: new Date(),
    }, req.tenantId!), { transaction: t });

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'cerrar_caja',
      entidad: 'CorteCaja',
      entidadId: corte.id,
      detalles: {
        fecha: hoy,
        totalGeneral,
        cantidadVentas: ventas.length,
        ventasCanceladas: canceladas.length,
      },
    });

    res.status(201).json(corte);

    invalidarCache(req.tenantId!, ['corte', 'reportes']);
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: 'Error al cerrar caja' });
  }
};

export const obtenerCortes = async (req: Request, res: Response) => {
  try {
    const cortes = await CorteCaja.findAll({
      where: scopeTenant(null, req.tenantId!),
      order: [['fecha', 'DESC']],
      include: [{ model: Usuario, attributes: ['id', 'nombre', 'email'] }],
    });
    return res.json(cortes);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener cortes de caja' });
  }
};

export const obtenerCortePorId = async (req: Request, res: Response) => {
  try {
    const corte: any = await CorteCaja.findByPk(req.params.id as string, {
      include: [{ model: Usuario, attributes: ['id', 'nombre', 'email'] }],
    });
    if (!corte) return res.status(404).json({ error: 'Corte de caja no encontrado' });
    if (!belongsToTenant(corte, req.tenantId!)) return res.status(404).json({ error: 'Corte de caja no encontrado' });
    return res.json(corte);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener corte de caja' });
  }
};
