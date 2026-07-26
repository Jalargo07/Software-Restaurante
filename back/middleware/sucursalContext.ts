import { Request, Response, NextFunction } from 'express';

export const sucursalContext = (req: Request, _res: Response, next: NextFunction) => {
  const sucursalId = req.headers['x-sucursal-id'] || req.query.sucursal_id || req.user?.sucursalId;
  if (sucursalId) {
    req.sucursalId = Number(sucursalId);
  }
  next();
};

export default sucursalContext;
