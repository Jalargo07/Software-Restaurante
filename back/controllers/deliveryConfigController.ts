import { Request, Response } from 'express';
import { DeliveryConfig } from '../models';

export const getConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await DeliveryConfig.findAll({ where: { tenant_id: req.tenantId } });
    res.json(configs);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { app, activo, webhookSecret, apiKey } = req.body;
    if (!app) return res.status(400).json({ error: 'app requerido' });

    let config: any = await DeliveryConfig.findOne({ where: { tenant_id: req.tenantId, app } });
    if (config) {
      if (activo !== undefined) config.activo = activo;
      if (webhookSecret !== undefined) config.webhookSecret = webhookSecret;
      if (apiKey !== undefined) config.apiKey = apiKey;
      await config.save();
    } else {
      config = await DeliveryConfig.create({ tenant_id: req.tenantId, app, activo, webhookSecret, apiKey });
    }
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};
