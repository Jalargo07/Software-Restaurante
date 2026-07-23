const { Router } = require('express');
const proveedorController = require('../controllers/proveedorController');
const validarProveedor = require('../middleware/validarProveedor');
const validar = require('../middleware/validar');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, proveedorController.obtenerTodos);
router.get('/:id/historial', authenticateToken, proveedorController.historialCompras);
router.get('/:id', authenticateToken, proveedorController.obtenerPorId);
router.post('/', authenticateToken, authorizeRole('admin'), validarProveedor, validar, proveedorController.crear);
router.put('/:id', authenticateToken, authorizeRole('admin'), validarProveedor, validar, proveedorController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), proveedorController.desactivar);

module.exports = router;
