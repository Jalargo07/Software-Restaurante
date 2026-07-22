const { Router } = require('express');
const ventaController = require('../controllers/ventaController');
const validarVenta = require('../middleware/validarVenta');
const validar = require('../middleware/validar');

const router = Router();

router.get('/', ventaController.obtenerTodas);
router.get('/:id', ventaController.obtenerPorId);
router.post('/', validarVenta, validar, ventaController.crear);

module.exports = router;
