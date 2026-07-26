import { Request, Response } from 'express';
import { Sucursal } from '../models';

export const listar = async (req: Request, res: Response) => {
  try {
    const sucursales = await Sucursal.findAll({ where: { tenant_id: req.tenantId } });
    res.json(sucursales);
  } catch (error: any) { res.status(500).json({ error: 'Error al listar sucursales' }); }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { nombre, direccion, telefono } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const sucursal = await Sucursal.create({ tenant_id: req.tenantId, nombre, direccion, telefono });
    res.status(201).json(sucursal);
  } catch (error: any) { res.status(500).json({ error: 'Error al crear sucursal' }); }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const suc: any = await Sucursal.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!suc) return res.status(404).json({ error: 'Sucursal no encontrada' });
    const { nombre, direccion, telefono, activo } = req.body;
    if (nombre !== undefined) suc.nombre = nombre;
    if (direccion !== undefined) suc.direccion = direccion;
    if (telefono !== undefined) suc.telefono = telefono;
    if (activo !== undefined) suc.activo = activo;
    await suc.save();
    res.json(suc);
  } catch (error: any) { res.status(500).json({ error: 'Error al actualizar sucursal' }); }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const suc: any = await Sucursal.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!suc) return res.status(404).json({ error: 'Sucursal no encontrada' });
    await suc.update({ activo: false });
    res.json({ message: 'Sucursal desactivada' });
  } catch (error: any) { res.status(500).json({ error: 'Error al eliminar sucursal' }); }
};
