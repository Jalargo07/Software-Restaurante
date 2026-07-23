const { Router } = require('express');
const compraController = require('../controllers/compraController');
const validarCompra = require('../middleware/validarCompra');
const validar = require('../middleware/validar');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, compraController.obtenerTodas);
router.get('/:id', authenticateToken, compraController.obtenerPorId);
router.post('/', authenticateToken, authorizeRole('admin'), validarCompra, validar, compraController.crear);
router.put('/:id/recibir', authenticateToken, authorizeRole('admin'), compraController.recibir);
router.put('/:id', authenticateToken, authorizeRole('admin'), compraController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), compraController.cancelar);

module.exports = router;
