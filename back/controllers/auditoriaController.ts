import { Request, Response } from 'express';
import { Auditoria } from '../models';
import { Op } from 'sequelize';
import { scopeTenant } from '../utils/tenantScope';

export const obtenerLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (req.query.usuario) {
      where[Op.or] = [
        { usuarioEmail: { [Op.like]: `%${req.query.usuario}%` } },
      ];
    }
    if (req.query.entidad) {
      where.entidad = req.query.entidad;
    }
    if (req.query.desde || req.query.hasta) {
      where.createdAt = {};
      if (req.query.desde) where.createdAt[Op.gte] = new Date(req.query.desde as string);
      if (req.query.hasta) {
        const hasta = new Date(req.query.hasta as string);
        hasta.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = hasta;
      }
    }

    const { count, rows } = await Auditoria.findAndCountAll({
      where: scopeTenant(where, req.tenantId!),
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.json({
      logs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    console.error('Error al obtener logs de auditoría:', error);
    return res.status(500).json({ error: 'Error al obtener logs de auditoría' });
  }
};
