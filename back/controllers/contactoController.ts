import { Request, Response } from 'express';
import { ContactoMensaje } from '../models';

export const crearMensaje = async (req: Request, res: Response) => {
  try {
    const { nombre, email, mensaje } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ error: 'El mensaje es obligatorio' });
    }

    const nuevo = await ContactoMensaje.create({
      nombre: nombre.trim(),
      email: email.trim(),
      mensaje: mensaje.trim(),
    });

    return res.status(201).json(nuevo);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};

export const listarMensajes = async (req: Request, res: Response) => {
  try {
    const pagina = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const offset = (pagina - 1) * limit;
    const where: any = {};

    if (req.query.leido === 'true' || req.query.leido === 'false') {
      where.leido = req.query.leido === 'true';
    }

    const { count, rows } = await ContactoMensaje.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      data: rows,
      total: count,
      pagina,
      paginas: Math.ceil(count / limit) || 1,
      limite: limit,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al listar mensajes' });
  }
};

export const marcarLeido = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const mensaje: any = await ContactoMensaje.findByPk(id);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    await mensaje.update({ leido: true });
    return res.json(mensaje);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al marcar mensaje como leído' });
  }
};
