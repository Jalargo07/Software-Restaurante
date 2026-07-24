const { Router } = require('express');
const corteController = require('../controllers/corteController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');

const router = Router();

const rolesCaja = ['admin', 'cajero'];

router.get('/resumen', authenticateToken, authorizeRole(...rolesCaja), cacheMiddleware(30), corteController.obtenerResumen);
router.get('/', authenticateToken, authorizeRole(...rolesCaja), cacheMiddleware(60), corteController.obtenerCortes);
router.get('/:id', authenticateToken, authorizeRole(...rolesCaja), corteController.obtenerCortePorId);
router.post('/cerrar', authenticateToken, authorizeRole(...rolesCaja), corteController.cerrarCaja);

module.exports = router;
