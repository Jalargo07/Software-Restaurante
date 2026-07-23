const { Router } = require('express');
const comandaController = require('../controllers/comandaController');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, comandaController.obtenerComandas);
router.put('/:id/estado', authenticateToken, comandaController.actualizarEstado);

module.exports = router;
