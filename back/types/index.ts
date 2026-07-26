import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  rol: 'admin' | 'mesero' | 'cajero' | 'cocinero' | 'super-admin';
  tenantId?: number;
  sucursalId?: number;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: number;
      tenant?: any;
      sucursalId?: number;
    }
  }
}
