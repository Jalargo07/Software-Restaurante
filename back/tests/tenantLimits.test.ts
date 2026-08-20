import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

vi.mock('../models', () => ({
  Tenant: {
    findByPk: vi.fn()
  },
  Producto: {
    count: vi.fn()
  },
  Usuario: {
    count: vi.fn()
  },
  Venta: {
    count: vi.fn()
  },
  Auditoria: {
    count: vi.fn()
  }
}));

import { Tenant, Producto, Usuario, Venta, Auditoria } from '../models';
import { checkTenantLimit } from '../middleware/tenantLimits';

describe('tenantLimits middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      path: '/api/productos',
      tenantId: 1,
      user: { id: 1, tenantId: 1, rol: 'admin', email: 'admin@test.com' }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('checkTenantLimit producto', () => {
    it('should allow request when under limits (Plan Pro)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'pro' });
      (Producto.count as any).mockResolvedValue(100);

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block when exceeding maxProductos (Plan Basico)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'basico' });
      (Producto.count as any).mockResolvedValue(51);

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('productos')
        })
      );
    });

    it('should block when at exact limit (Plan Basico) - cannot add more', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'basico' });
      (Producto.count as any).mockResolvedValue(50);

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('productos')
        })
      );
    });

    it('should allow unlimited for Enterprise plan', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'enterprise' });

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(Producto.count).not.toHaveBeenCalled();
    });

    it('should process GET requests but allow when under limit', async () => {
      mockReq.method = 'GET';
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'basico' });
      (Producto.count as any).mockResolvedValue(10);

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(Tenant.findByPk).toHaveBeenCalled();
    });

    it('should return 400 when no tenantId', async () => {
      mockReq.tenantId = undefined;
      (mockReq.user as any) = undefined;

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tenant no especificado' });
    });

    it('should return 404 when tenant not found', async () => {
      (Tenant.findByPk as any).mockResolvedValue(null);

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tenant no encontrado' });
    });
  });

  describe('checkTenantLimit usuario', () => {
    it('should block when exceeding maxUsuarios (Plan Basico)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'basico' });
      (Usuario.count as any).mockResolvedValue(3);

      const middleware = checkTenantLimit('usuario');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('usuarios')
        })
      );
    });

    it('should allow when under limit (Plan Pro)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'pro' });
      (Usuario.count as any).mockResolvedValue(5);

      const middleware = checkTenantLimit('usuario');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('checkTenantLimit venta', () => {
    it('should block when exceeding maxVentasDiarias (Plan Basico)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'basico' });
      (Venta.count as any).mockResolvedValue(21);

      const middleware = checkTenantLimit('venta');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('ventas diarias')
        })
      );
    });

    it('should allow when under limit (Plan Pro)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'pro' });
      (Venta.count as any).mockResolvedValue(150);

      const middleware = checkTenantLimit('venta');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('checkTenantLimit upload', () => {
    it('should block when exceeding maxUploads (Plan Basico)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'basico' });
      (Auditoria.count as any).mockResolvedValue(21);

      const middleware = checkTenantLimit('upload');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('uploads')
        })
      );
    });

    it('should allow when under limit (Plan Pro)', async () => {
      (Tenant.findByPk as any).mockResolvedValue({ id: 1, plan: 'pro' });
      (Auditoria.count as any).mockResolvedValue(50);

      const middleware = checkTenantLimit('upload');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 500 on database error', async () => {
      (Tenant.findByPk as any).mockRejectedValue(new Error('DB error'));

      const middleware = checkTenantLimit('producto');
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error al verificar límites del plan' });
    });
  });
});
