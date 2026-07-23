const { Router } = require('express');
const corteController = require('../controllers/corteController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

const rolesCaja = ['admin', 'cajero'];

router.get('/resumen', authenticateToken, authorizeRole(...rolesCaja), corteController.obtenerResumen);
router.get('/', authenticateToken, authorizeRole(...rolesCaja), corteController.obtenerCortes);
router.get('/:id', authenticateToken, authorizeRole(...rolesCaja), corteController.obtenerCortePorId);
router.post('/cerrar', authenticateToken, authorizeRole(...rolesCaja), corteController.cerrarCaja);

module.exports = router;
