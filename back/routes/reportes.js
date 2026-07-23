const { Router } = require('express');
const reporteController = require('../controllers/reporteController');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

router.get('/ventas-hoy', authenticateToken, reporteController.ventasHoy);
router.get('/ventas-por-dia', authenticateToken, reporteController.ventasPorDia);
router.get('/productos-mas-vendidos', authenticateToken, reporteController.productosMasVendidos);
router.get('/compras-mes', authenticateToken, reporteController.comprasMes);

module.exports = router;
