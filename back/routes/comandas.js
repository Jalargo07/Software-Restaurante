const { Router } = require('express');
const comandaController = require('../controllers/comandaController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, comandaController.obtenerComandas);
router.put('/:id/estado', authenticateToken, authorizeRole('cocinero', 'admin'), comandaController.actualizarEstado);

module.exports = router;
