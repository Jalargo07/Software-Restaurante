import { Router } from 'express';
import * as ventaController from '../controllers/ventaController';
import { body, ValidationChain } from 'express-validator';
import validar from '../middleware/validar';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

const rolesVenta = ['admin', 'mesero', 'cajero'];

const validarVenta: ValidationChain[] = [
  body('mesaId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID de la mesa debe ser un entero positivo'),
];

const validarProductos: ValidationChain[] = [
  body('productos').isArray({ min: 1 }).withMessage('Debe haber al menos un producto'),
  body('productos.*.productoId').isInt({ min: 1 }).withMessage('El ID del producto es obligatorio'),
  body('productos.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('productos.*.precioUnitario').optional().isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número positivo'),
];

const validarCobro: ValidationChain[] = [
  body('metodoPago').optional().isIn(['efectivo', 'tarjeta', 'transferencia', 'mixto']).withMessage('Método de pago inválido'),
  body('pagos').optional().isArray().withMessage('Pagos debe ser un arreglo'),
  body('pagos.*.metodo').optional().isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
  body('pagos.*.monto').optional().isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body().custom((value, { req }) => {
    if (!req.body.metodoPago && (!req.body.pagos || !Array.isArray(req.body.pagos) || req.body.pagos.length === 0)) {
      throw new Error('Debe especificar un método de pago o un arreglo de pagos');
    }
    return true;
  }),
];

const validarRapida: ValidationChain[] = [
  body('mesaId').optional({ nullable: true }).isInt({ min: 1 }),
  body('productos').isArray({ min: 1 }).withMessage('Debe haber al menos un producto'),
  body('productos.*.productoId').isInt({ min: 1 }),
  body('productos.*.cantidad').isInt({ min: 1 }),
  body('productos.*.precioUnitario').optional().isFloat({ min: 0 }),
  body('metodoPago').isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
];

const validarDetalle: ValidationChain[] = [
  body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
];

router.get('/', authenticateToken, ventaController.obtenerTodas);
router.get('/:id', authenticateToken, ventaController.obtenerPorId);
router.post('/rapida', authenticateToken, authorizeRole(...rolesVenta), validarRapida, validar, ventaController.crearRapida);
router.post('/', authenticateToken, authorizeRole(...rolesVenta), validarVenta, validar, ventaController.crear);
router.post('/:id/productos', authenticateToken, authorizeRole(...rolesVenta), validarProductos, validar, ventaController.agregarProductos);
router.put('/:id/cobrar', authenticateToken, authorizeRole(...rolesVenta), validarCobro, validar, ventaController.cobrar);
router.put('/:id', authenticateToken, authorizeRole(...rolesVenta), ventaController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole(...rolesVenta), ventaController.cancelar);
router.put('/:id/detalle/:detalleId', authenticateToken, authorizeRole(...rolesVenta), validarDetalle, ventaController.actualizarDetalle);
router.delete('/:id/detalle/:detalleId', authenticateToken, authorizeRole(...rolesVenta), ventaController.eliminarDetalle);

export default router;
