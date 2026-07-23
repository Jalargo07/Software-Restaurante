const { Router } = require('express');
const reporteController = require('../controllers/reporteController');
const excelController = require('../controllers/excelController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/ventas-hoy', authenticateToken, reporteController.ventasHoy);
router.get('/ventas-por-dia', authenticateToken, reporteController.ventasPorDia);
router.get('/productos-mas-vendidos', authenticateToken, reporteController.productosMasVendidos);
router.get('/compras-mes', authenticateToken, reporteController.comprasMes);

router.get('/exportar/ventas', authenticateToken, authorizeRole('admin'), excelController.reporteVentasExcel);
router.get('/exportar/compras', authenticateToken, authorizeRole('admin'), excelController.reporteComprasExcel);
router.get('/exportar/auditoria', authenticateToken, authorizeRole('admin'), excelController.reporteAuditoriaExcel);

module.exports = router;
