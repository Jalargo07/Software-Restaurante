import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validar = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
};

export default validar;
