import { Router } from 'express';
import * as reporteController from '../controllers/reporteController';
import * as excelController from '../controllers/excelController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import cacheMiddleware from '../middleware/cache';

const router = Router();

router.get('/ventas-hoy', authenticateToken, reporteController.ventasHoy);
router.get('/ventas-por-dia', authenticateToken, cacheMiddleware(10), reporteController.ventasPorDia);
router.get('/productos-mas-vendidos', authenticateToken, cacheMiddleware(30), reporteController.productosMasVendidos);
router.get('/compras-mes', authenticateToken, cacheMiddleware(60), reporteController.comprasMes);
router.get('/ganancia-bruta', authenticateToken, cacheMiddleware(30), reporteController.gananciaBruta);
router.get('/cogs', authenticateToken, reporteController.obtenerCOGS);
router.get('/forecast', authenticateToken, reporteController.obtenerForecastHandler);
router.get('/heatmap', authenticateToken, reporteController.obtenerHeatmap);

router.get('/exportar/ventas', authenticateToken, authorizeRole('admin'), excelController.reporteVentasExcel);
router.get('/exportar/compras', authenticateToken, authorizeRole('admin'), excelController.reporteComprasExcel);
router.get('/exportar/auditoria', authenticateToken, authorizeRole('admin'), excelController.reporteAuditoriaExcel);

export default router;
