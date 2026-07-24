const { Router } = require('express');
const reporteController = require('../controllers/reporteController');
const excelController = require('../controllers/excelController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');

const router = Router();

router.get('/ventas-hoy', authenticateToken, cacheMiddleware(30), reporteController.ventasHoy);
router.get('/ventas-por-dia', authenticateToken, cacheMiddleware(300), reporteController.ventasPorDia);
router.get('/productos-mas-vendidos', authenticateToken, cacheMiddleware(300), reporteController.productosMasVendidos);
router.get('/compras-mes', authenticateToken, cacheMiddleware(600), reporteController.comprasMes);

router.get('/exportar/ventas', authenticateToken, authorizeRole('admin'), excelController.reporteVentasExcel);
router.get('/exportar/compras', authenticateToken, authorizeRole('admin'), excelController.reporteComprasExcel);
router.get('/exportar/auditoria', authenticateToken, authorizeRole('admin'), excelController.reporteAuditoriaExcel);

module.exports = router;
