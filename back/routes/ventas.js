const { Router } = require('express');
const ventaController = require('../controllers/ventaController');
const { body } = require('express-validator');
const validar = require('../middleware/validar');

const router = Router();

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

router.get('/', ventaController.obtenerTodas);
router.get('/:id', ventaController.obtenerPorId);
router.post('/rapida', validarRapida, validar, ventaController.crearRapida);
router.post('/', validarVenta, validar, ventaController.crear);
router.post('/:id/productos', validarProductos, validar, ventaController.agregarProductos);
router.put('/:id/cobrar', validarCobro, validar, ventaController.cobrar);

module.exports = router;
