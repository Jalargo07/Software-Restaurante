import { Request, Response } from 'express';
import { Proveedor, Compra, DetalleCompra, Producto } from '../models';
import { Op } from 'sequelize';
import registrarAuditoria from '../utils/auditoria';
import { scopeTenant, withTenant, belongsToTenant } from '../utils/tenantScope';

export const obtenerTodos = async (req: Request, res: Response) => {
  try {
    const { pagina = 1, limite = 10, buscar } = req.query;
    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;

    const where: any = { activo: true };
    if (buscar) {
      where.nombre = { [Op.like]: `%${buscar}%` };
    }

    const scopedWhere = scopeTenant(where, req.tenantId!);

    const { count, rows } = await Proveedor.findAndCountAll({
      where: scopedWhere,
      limit,
      offset,
      order: [['nombre', 'ASC']],
    });

    return res.json({
      data: rows,
      total: count,
      pagina: Number(pagina),
      paginas: Math.ceil(count / limit) || 1,
      limite: limit,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const proveedor: any = await Proveedor.findByPk(req.params.id);
    if (!proveedor || !belongsToTenant(proveedor, req.tenantId!)) return res.status(404).json({ error: 'Proveedor no encontrado' });
    return res.json(proveedor);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const proveedor: any = await Proveedor.create(withTenant(req.body, req.tenantId!));

    await registrarAuditoria({
      req,
      accion: 'crear',
      entidad: 'Proveedor',
      entidadId: proveedor.id,
      detalles: { nombre: proveedor.nombre },
    });

    return res.status(201).json(proveedor);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const proveedor: any = await Proveedor.findByPk(req.params.id);
    if (!proveedor || !belongsToTenant(proveedor, req.tenantId!)) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.update(req.body);

    await registrarAuditoria({
      req,
      accion: 'actualizar',
      entidad: 'Proveedor',
      entidadId: proveedor.id,
      detalles: { nombre: proveedor.nombre, cambios: Object.keys(req.body) },
    });

    return res.json(proveedor);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

export const desactivar = async (req: Request, res: Response) => {
  try {
    const proveedor: any = await Proveedor.findByPk(req.params.id);
    if (!proveedor || !belongsToTenant(proveedor, req.tenantId!)) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.update({ activo: false });

    await registrarAuditoria({
      req,
      accion: 'desactivar',
      entidad: 'Proveedor',
      entidadId: proveedor.id,
      detalles: { nombre: proveedor.nombre },
    });

    return res.json({ message: 'Proveedor desactivado' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al desactivar proveedor' });
  }
};

export const historialCompras = async (req: Request, res: Response) => {
  try {
    const proveedor: any = await Proveedor.findByPk(req.params.id);
    if (!proveedor || !belongsToTenant(proveedor, req.tenantId!)) return res.status(404).json({ error: 'Proveedor no encontrado' });

    const compras: any = await Compra.findAll({
      where: scopeTenant({ proveedorId: req.params.id }, req.tenantId!),
      include: [{ model: DetalleCompra, include: [Producto] }],
      order: [['fecha', 'DESC']],
    });

    const totalCompras = compras.reduce((sum: number, c: any) => sum + Number(c.total), 0);
    const comprasRecibidas = compras.filter((c: any) => c.estado === 'recibida').length;
    const comprasPendientes = compras.filter((c: any) => c.estado === 'pendiente').length;

    return res.json({
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        email: proveedor.email,
        telefono: proveedor.telefono,
      },
      resumen: {
        totalCompras: compras.length,
        comprasRecibidas,
        comprasPendientes,
        montoTotal: totalCompras,
      },
      compras,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener historial de compras' });
  }
};
