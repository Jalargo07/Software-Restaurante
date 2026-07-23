const { Router } = require('express');
const controller = require('../controllers/recetaController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/',    authenticateToken, controller.obtenerTodas);
router.get('/:id', authenticateToken, controller.obtenerPorId);
router.post('/',   authenticateToken, authorizeRole('admin'), controller.crear);
router.put('/:id', authenticateToken, authorizeRole('admin'), controller.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), controller.eliminar);

module.exports = router;
