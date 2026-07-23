const { Router } = require('express');
const ventaController = require('../controllers/ventaController');
const { body } = require('express-validator');
const validar = require('../middleware/validar');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

const rolesVenta = ['admin', 'mesero', 'cajero'];

const validarVenta = [
  body('mesaId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID de la mesa debe ser un entero positivo'),
];

const validarProductos = [
  body('productos').isArray({ min: 1 }).withMessage('Debe haber al menos un producto'),
  body('productos.*.productoId').isInt({ min: 1 }).withMessage('El ID del producto es obligatorio'),
  body('productos.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('productos.*.precioUnitario').optional().isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número positivo'),
];

const validarCobro = [
  body('metodoPago').isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
];

const validarRapida = [
  body('mesaId').optional({ nullable: true }).isInt({ min: 1 }),
  body('productos').isArray({ min: 1 }).withMessage('Debe haber al menos un producto'),
  body('productos.*.productoId').isInt({ min: 1 }),
  body('productos.*.cantidad').isInt({ min: 1 }),
  body('productos.*.precioUnitario').optional().isFloat({ min: 0 }),
  body('metodoPago').isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
];

const validarDetalle = [
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

module.exports = router;
