const { Router } = require('express');
const productoController = require('../controllers/productoController');
const validarProducto = require('../middleware/validarProducto');
const validar = require('../middleware/validar');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, productoController.obtenerTodos);
router.get('/:id', authenticateToken, productoController.obtenerPorId);
router.post('/', authenticateToken, authorizeRole('admin'), validarProducto, validar, productoController.crear);
router.put('/:id', authenticateToken, authorizeRole('admin'), validarProducto, validar, productoController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), productoController.desactivar);

module.exports = router;
