# PLAN MAESTRO 2026 — BiteOps Visionario

## Resumen
Plan de 24 tareas divididas en 5 fases para modernizar y preparar BiteOps para competir en 2026.
**Última actualización:** 19/08/2026
**Estado general:** EN PROGRESO (12/24 completadas)

---

## FASE 1: FIXES CRÍTICOS (Arquitectura, Seguridad, Performance)

### Tarea 1: Socket.IO con Rooms por Tenant
**Tipo:** fix | **Prioridad:** critical | **Dependencias:** ninguna

**Archivos a modificar:**
- back/server.ts
- back/utils/cacheInvalidation.ts
- back/services/socketHandler.ts (nuevo)
- back/middleware/socketAuth.ts (nuevo)

**Descripción:** Implementar rooms basados en `tenant_id` para que los eventos de Socket.IO no se filtren entre tenants. Actualmente el handler solo registra conexiones sin hacer join a rooms específicos.

**Pasos:**
1. Crear `socketHandler.ts` con lógica de autenticación y join a rooms
2. Extraer auth JWT del handshake en Socket.IO
3. Emitir `socket.join(\`tenant:${tenantId}\`)` tras autenticación exitosa
4. Refactorizar `cacheInvalidation.ts` para usar el handler
5. Refactorizar todos los eventos de cocina/comandas por tenant room
6. Agregar timeout de autenticación (30s) antes de desconectar

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 2: Índices Compuestos en Base de Datos
**Tipo:** fix | **Prioridad:** critical | **Dependencias:** ninguna

**Archivos a modificar:**
- back/models/Kardex.ts
- back/models/DetalleVenta.ts
- back/models/Auditoria.ts
- back/models/Venta.ts
- back/models/Producto.ts
- back/models/Compra.ts
- back/models/DetalleCompra.ts

**Descripción:** Agregar índices compuestos para queries frecuentes que hacen full scan.

**Índices a agregar:**
- Kardex: `(tenant_id, productoId, fecha DESC)` para reportes FIFO
- DetalleVenta: `(tenant_id, createdAt)` para reportes por día
- Auditoria: `(tenant_id, createdAt DESC, accion)` para logs recientes
- Venta: `(tenant_id, estado, createdAt)` para filtros de estado
- Producto: `(tenant_id, tipo, categoria)` para filtros combinados
- Compra: `(tenant_id, estado, fecha)` para compras pendientes
- DetalleCompra: `(CompraId, ProductoId)` para joins

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 3: Pool de Sequelize Configurable
**Tipo:** fix | **Prioridad:** critical | **Dependencias:** ninguna

**Archivos a modificar:**
- back/config/database.ts
- back/config/settings.ts
- .env.example

**Descripción:** El pool actual es `max:5` lo cual es muy bajo para producción. Debe ser configurable via environment variable.

**Pasos:**
1. Agregar `DB_POOL_MAX`, `DB_POOL_MIN`, `DB_POOL_ACQUIRE`, `DB_POOL_IDLE` a settings.ts
2. Leer de `process.env` con fallbacks inteligentes (max: 20 para producción, 5 para dev)
3. Actualizar todos los constructores de Sequelize (3 lugares) para usar estas variables
4. Documentar en .env.example los valores recomendados por ambiente

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 4: OCR/AI Async con Cola de Trabajos
**Tipo:** refactor | **Prioridad:** critical | **Dependencias:** ninguna

**Archivos a modificar:**
- back/controllers/compraController.ts
- back/utils/ocrScanner.ts
- back/utils/parserIA.ts
- back/jobs/ocrQueue.ts (nuevo)
- back/config/redis.ts

**Descripción:** El escaneo de facturas es bloqueante (async/await directo). Si la API de IA tarda 10s, bloquea el thread. Debe usar cola de trabajos con Redis.

**Pasos:**
1. Crear `ocrQueue.ts` con Bull queue respaldada por Redis
2. Refactorizar `ocrScanner.ts` para recibir job y devolver jobId inmediatamente
3. Modificar `compraController.ts` endpoint de escaneo para encolar y devolver `jobId`
4. Crear endpoint GET `/api/compras/ocr/:jobId` para consultar resultado
5. Implementar retry automático (3 intentos) y dead letter queue
6. Emitir evento Socket.IO al cliente cuando el job complete

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 5: Global Error Handler + DTOs
**Tipo:** refactor | **Prioridad:** critical | **Dependencias:** ninguna

**Archivos a modificar:**
- back/middleware/errorHandler.ts (nuevo)
- back/server.ts
- back/utils/errors.ts (nuevo)
- back/controllers/ventaController.ts (refactor)
- back/controllers/productoController.ts (refactor)
- back/controllers/compraController.ts (refactor)
- back/dto/ (nuevo directorio)

**Descripción:** No hay global error handler, los controllers hacen `try/catch` manualmente. Además, los modelos Sequelize se exponen directamente sin serialización.

**Pasos:**
1. Crear `errors.ts` con clases AppError, ValidationError, NotFoundError, UnauthorizedError
2. Crear `errorHandler.ts` middleware que captura todos los errores
3. Reemplazar todos los `try/catch` en controllers para usar `next(new AppError(...))`
4. Crear carpeta `back/dto/` con archivos de serialización para cada modelo
5. Reemplazar retornos directos de modelos Sequelize con DTOs mapeados
6. Integrar error handler en server.ts antes de las rutas

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 6: scopeTenant Automatizado via Sequelize Hook
**Tipo:** refactor | **Prioridad:** high | **Dependencias:** Tarea 5

**Archivos a modificar:**
- back/utils/tenantScope.ts
- back/models/index.ts
- back/middleware/tenantContext.ts
- back/controllers/ventaController.ts (limpiar)
- back/controllers/productoController.ts (limpiar)
- back/controllers/compraController.ts (limpiar)

**Descripción:** El scopeTenant se repite en 20+ controllers manualmente. Un hook global de Sequelize puede automatizar esto.

**Pasos:**
1. Crear `tenantScopeHook` en `models/index.ts` usando `Model.addHook('beforeFind')`
2. Extraer `tenantId` del objeto `options` en el hook
3. Modificar `tenantContext.ts` para inyectar `tenantId` en `options` de todas las queries
4. Eliminar todos los `scopeTenant({...}, req.tenantId!)` repetidos en controllers
5. Mantener `belongsToTenant` para validaciones de ownership (GET by id, DELETE)

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 7: Deduplicar Lógica de Stock en VentaController
**Tipo:** refactor | **Prioridad:** high | **Dependencias:** ninguna

**Archivos a modificar:**
- back/controllers/ventaController.ts
- back/utils/stockManager.ts (nuevo)
- back/utils/kardexManager.ts (nuevo)

**Descripción:** La lógica de validar/descontar stock aparece 4 veces (crearRapida, cobrar, agregarProductos, actualizarDetalle). Código duplicado propenso a bugs.

**Pasos:**
1. Crear `stockManager.ts` con funciones `validarStock()` y `descontarStock()`
2. Crear `kardexManager.ts` con funciones `registrarEntrada()` y `registrarSalida()`
3. Reemplazar todas las llamadas inline en `ventaController.ts` por imports a estos managers
4. Unificar también en `compraController.ts` la lógica de recibir compra

**Estado:** ✅ Completado (19/08/2026)

---

## FASE 2: CODE QUALITY (Refactors, Seguridad, DX)

### Tarea 8: Rate Limit con IP Lockout + Session Tracking
**Tipo:** fix | **Prioridad:** high | **Dependencias:** ninguna

**Archivos a modificar:**
- back/middleware/rateLimit.ts
- back/models/SessionActiva.ts (nuevo)
- back/controllers/authController.ts
- back/routes/usuarios.ts

**Descripción:** El login limiter no tiene lockout persistente por IP. Un atacante puede probar contraseñas con IPs rotativas. Falta tracking de sesiones activas.

**Pasos:**
1. Crear modelo `SessionActiva` con campos: `tokenId, usuarioId, ipAddress, userAgent, loginAt, ultimoUso`
2. Modificar `loginLimiter` para usar Redis (no memoria) con key `ratelimit:login:${ip}`
3. Implementar exponential backoff: 5 intentos → 15min, 10 intentos → 1h, 20 intentos → 24h
4. En `authController.ts`, registrar cada login en `SessionActiva`
5. Crear endpoint DELETE `/api/auth/sessions` para revoke global de sesiones
6. Crear endpoint GET `/api/auth/sessions` para listar sesiones activas del usuario

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 9: JWT Refresh Token Rotation
**Tipo:** feature | **Prioridad:** high | **Dependencias:** Tarea 8

**Archivos a modificar:**
- back/middleware/auth.ts
- back/controllers/authController.ts
- back/models/RefreshToken.ts (nuevo)
- back/routes/usuarios.ts
- front/src/stores/auth.ts
- front/src/services/api.ts

**Descripción:** Implementar refresh token rotation con access token de 15min y refresh token de 7 días.

**Pasos:**
1. Crear modelo `RefreshToken` con campos: `token (unique), usuarioId, expiresAt, revokedAt, replacedByToken`
2. En `authController.ts` login: generar access token + refresh token, guardar hash en DB
3. Crear endpoint POST `/api/auth/refresh` que acepta refresh token y devuelve nuevo par
4. Implementar "refresh token rotation": al usar un refresh token, invalidar el anterior
5. En `auth.ts` frontend: interceptor que detecta 401 y llama refresh antes de retry
6. Agregar `logout` global que revoca todos los refresh tokens del usuario

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 10: Validación de Stock en CrearRapida (anti-bug)
**Tipo:** fix | **Prioridad:** critical | **Dependencias:** Tarea 7

**Archivos a modificar:**
- back/controllers/ventaController.ts
- back/utils/stockManager.ts

**Descripción:** `crearRapida` no valida stock antes de descontar (a diferencia de `cobrar`). Bug crítico que permite ventas de productos sin stock.

**Pasos:**
1. En `crearRapida`, antes de hacer `Producto.decrement('stock')`, llamar a `stockManager.validarStock()`
2. Si stock insuficiente, hacer rollback y retornar 400
3. Agregar test unitario para el caso `crearRapida` con stock insuficiente

**Estado:** ⬜ Pendiente

---

### Tarea 11: Settings via Environment en Vez de require()
**Tipo:** refactor | **Prioridad:** medium | **Dependencias:** ninguna

**Archivos a modificar:**
- back/config/settings.ts
- back/server.ts
- back/config/database.ts
- back/config/redis.ts

**Descripción:** El `require()` dinámico en server.ts es difícil de testear y puede causar issues con hot reload.

**Pasos:**
1. Convertir `settings.ts` de CommonJS `require()` a ES module con `import dotenv` y exports directos
2. Validar variables requeridas en startup (no en runtime require)
3. Mover validaciones de env al archivo correspondiente
4. Crear `back/config/index.ts` que re-exporta todo

**Estado:** ✅ Completado (19/08/2026)

---

### Tarea 12: Tests de Límites de Plan (Middleware tenantLimits)
**Tipo:** feature | **Prioridad:** medium | **Dependencias:** ninguna

**Archivos a modificar:**
- back/middleware/tenantLimits.ts
- back/tests/tenantLimits.test.ts (nuevo)
- back/controllers/productoController.ts
- back/controllers/ventaController.ts

**Descripción:** El middleware `tenantLimits` existe pero no está completamente integrado.

**Pasos:**
1. Revisar `tenantLimits.ts` para asegurar que cubre: maxProductos, maxUsuarios, maxVentasDiarias, maxMesas
2. Crear tests unitarios con mock de TenantConfig para cada plan (Básico/Pro/Enterprise)
3. Integrar llamada a `tenantLimits` en POST producto, POST venta, POST usuario
4. Crear endpoint GET `/api/tenant/usage` que devuelve uso actual vs límites

**Estado:** ✅ Completado (19/08/2026)

---

## FASE 3: UX/POLISH (Onboarding, Offline, Animaciones)

### Tarea 13: Onboarding Wizard de 3 Pasos para Admin
**Tipo:** feature | **Prioridad:** high | **Dependencias:** ninguna

**Archivos a modificar:**
- back/models/OnboardingProgress.ts (nuevo)
- back/controllers/onboardingController.ts (nuevo)
- back/routes/onboarding.ts (nuevo)
- front/src/stores/onboarding.ts (nuevo)
- front/src/views/auth/OnboardingView.vue (nuevo)
- front/src/components/onboarding/StepConfigMesa.vue (nuevo)
- front/src/components/onboarding/StepCargarProductos.vue (nuevo)
- front/src/components/onboarding/StepInvitarStaff.vue (nuevo)
- front/src/router/index.ts

**Descripción:** Admin primer login no tiene guía. Wizard de 3 pasos: 1) Configurar mesas, 2) Cargar productos iniciales, 3) Invitar staff.

**Estado:** ⬜ Pendiente

---

### Tarea 14: Dark Mode Detecta Preferencia del Sistema
**Tipo:** fix | **Prioridad:** medium | **Dependencias:** ninguna

**Archivos a modificar:**
- front/src/App.vue
- front/src/stores/theme.ts (nuevo)

**Descripción:** Currently dark mode solo lee de localStorage. Si es primer acceso, debe usar `prefers-color-scheme` del sistema.

**Pasos:**
1. Crear store `theme.ts` que maneja lógica de inicialización
2. Si `localStorage.getItem('theme')` es null, usar `window.matchMedia('(prefers-color-scheme: dark)').matches`
3. Guardar elección del usuario en localStorage solo después del primer toggle
4. Escuchar cambios en `media query` y actualizar si el usuario no ha hecho override manual

**Estado:** ⬜ Pendiente

---

### Tarea 15: Vue Error Boundary
**Tipo:** feature | **Prioridad:** high | **Dependencias:** ninguna

**Archivos a modificar:**
- front/src/components/common/ErrorBoundary.vue (nuevo)
- front/src/App.vue
- front/src/views/HomeView.vue
- front/src/views/ventas/VentasView.vue
- front/src/views/admin/AdminView.vue

**Descripción:** No hay error boundary en Vue. Un componente que crashea rompe toda la app.

**Pasos:**
1. Crear componente `ErrorBoundary.vue` con `componentDidCatch` y estado de error
2. Mostrar mensaje amigable + botón "Reintentar" + opción de reportar bug
3. Enviar error a backend vía POST `/api/auditoria` (log de cliente)
4. Integrar en App.vue envolviendo `<RouterView>` en `<ErrorBoundary>`

**Estado:** ⬜ Pendiente

---

### Tarea 16: PWA Offline Sync para Ventas
**Tipo:** feature | **Prioridad:** high | **Dependencias:** Tarea 9

**Archivos a modificar:**
- front/src/services/api.ts
- front/src/stores/syncQueue.ts (nuevo)
- front/src/views/ventas/VentasView.vue
- front/src/components/ventas/VentaFormModal.vue
- front/vite.config.ts
- front/src-sw.js (nuevo service worker)

**Descripción:** PWA existe pero no hace offline sync. Si pierdo conexión en medio de una venta, se pierde.

**Pasos:**
1. Crear store `syncQueue.ts` que persiste en IndexedDB via idb-keyval
2. Interceptor de axios que captura errores de red
3. Si request falla por red, guardar en cola y retornar success虚伪 al UI
4. Service worker escucha `online` event y replay cola
5. UI muestra banner "X acciones pendientes de sincronizar"

**Estado:** ⬜ Pendiente

---

### Tarea 17: Micro-interactions y Quick Actions
**Tipo:** feature | **Prioridad:** medium | **Dependencias:** ninguna

**Archivos a modificar:**
- front/src/components/ventas/VentaFormModal.vue
- front/src/components/productos/ProductoFormModal.vue
- front/src/components/common/StatCard.vue
- front/src/components/dashboard/MiniStatCard.vue
- front/src/style.css

**Descripción:** La UI es funcional pero plana. Faltan transiciones, hover effects, loading skeletons, y quick actions.

**Pasos:**
1. Agregar CSS transitions de 200ms ease-out a todos los botones y cards
2. Implementar skeleton loading en tablas
3. StatCard: número cuenta hacia arriba (countUp animation) cuando carga
4. MiniStatCard: agregar shimmer effect mientras carga
5. VentasView: swipe en row de venta para ver acciones rápidas
6. ProductoFormModal: preview de imagen con fade-in al seleccionar
7. ToastContainer: slide-in desde arriba derecha, auto-dismiss con progress bar

**Estado:** ⬜ Pendiente

---

## FASE 4: INTEGRACIONES (MercadoPago, WhatsApp, Delivery)

### Tarea 18: Integración MercadoPago
**Tipo:** feature | **Prioridad:** high | **Dependencias:** Tarea 9

**Archivos a modificar:**
- back/controllers/pagoController.ts
- back/routes/pagos.ts
- back/models/Transaccion.ts
- back/models/PagoMercadoPago.ts (nuevo)
- front/src/stores/pagos.ts (nuevo)
- front/src/views/checkout/CheckoutView.vue
- front/src/components/checkout/MercadoPagoModal.vue (nuevo)
- .env.example

**Descripción:** Solo tiene PayPal. Agregar MercadoPago para usuarios Latam con soporte de Webhook.

**Estado:** ⬜ Pendiente

---

### Tarea 19: WhatsApp Business API - Notificaciones
**Tipo:** feature | **Prioridad:** medium | **Dependencias:** Tarea 18

**Archivos a modificar:**
- back/controllers/notificationController.ts (nuevo)
- back/routes/notifications.ts (nuevo)
- back/services/whatsappClient.ts (nuevo)
- back/models/WhatsAppTemplate.ts (nuevo)
- back/models/NotificationLog.ts (nuevo)
- front/src/stores/notifications.ts (nuevo)
- front/src/views/admin/NotificationSettingsView.vue (nuevo)
- front/src/components/admin/WhatsAppConfigModal.vue (nuevo)
- .env.example

**Descripción:** Notificaciones de pedidos listos / ordenes nuevas via WhatsApp Business API.

**Estado:** ⬜ Pendiente

---

### Tarea 20: Integration Rappi/Uber Eats (Webhook Parser)
**Tipo:** feature | **Prioridad:** medium | **Dependencias:** Tarea 19

**Archivos a modificar:**
- back/controllers/deliveryController.ts
- back/models/DeliveryOrder.ts (nuevo)
- back/models/DeliveryPartner.ts (nuevo)
- back/routes/delivery.ts
- back/services/deliveryWebhookParser.ts (nuevo)
- front/src/stores/delivery.ts
- front/src/views/delivery/DeliveryPedidosView.vue

**Descripción:** Integration basica con Rappi/Uber Eats via webhooks. Parsear orders externas y mostrarlas en la misma vista de delivery.

**Estado:** ⬜ Pendiente

---

## FASE 5: ANALYTICS (ML Forecasting, Dashboards)

### Tarea 21: Dashboard COGS Real-Time
**Tipo:** feature | **Prioridad:** high | **Dependencias:** Tarea 7

**Archivos a modificar:**
- back/controllers/reporteController.ts
- back/models/CogsConfig.ts (nuevo)
- back/routes/reportes.ts
- front/src/components/common/chart-COGS.vue (nuevo)
- front/src/views/HomeView.vue
- front/src/stores/reportes.ts

**Descripción:** COGS (Cost of Goods Sold) actual en tiempo real basado en kardex.

**Estado:** ⬜ Pendiente

---

### Tarea 22: Forecasting de Demanda con ML
**Tipo:** feature | **Prioridad:** medium | **Dependencias:** Tarea 21

**Archivos a modificar:**
- back/services/demandForecast.ts (nuevo)
- back/controllers/reporteController.ts
- back/routes/reportes.ts
- back/scripts/trainModel.js (nuevo)
- front/src/components/dashboard/ForecastPanel.vue (nuevo)
- front/src/views/HomeView.vue

**Descripción:** Predicción de demanda semanal para ayudarte a planificar compras. Usa regresión lineal simple.

**Estado:** ⬜ Pendiente

---

### Tarea 23: Heatmaps de Productos
**Tipo:** feature | **Prioridad:** low | **Dependencias:** Tarea 21

**Archivos a modificar:**
- back/controllers/reporteController.ts
- back/routes/reportes.ts
- front/src/components/dashboard/ProductHeatmap.vue (nuevo)
- front/src/views/HomeView.vue
- front/src/stores/reportes.ts

**Descripción:** Visualizar cuáles productos se venden más por hora del día y día de la semana.

**Estado:** ⬜ Pendiente

---

### Tarea 24: Reporte Exportable PDF de Stock Bajo
**Tipo:** feature | **Prioridad:** medium | **Dependencias:** ninguna

**Archivos a modificar:**
- back/controllers/reporteController.ts
- back/routes/reportes.ts
- back/utils/pdfGenerator.ts (nuevo)
- front/src/views/inventario/InventarioView.vue
- front/src/components/inventario/LowStockReportModal.vue (nuevo)

**Descripción:** Generar PDF con productos bajo stock mínimo incluyendo proveedor y última fecha de compra.

**Estado:** ⬜ Pendiente

---

## GRUPOS DE TRABAJO PARALELO

| Grupo | Tareas Back | Tareas Front |
|-------|-------------|--------------|
| **A** | Tarea 2 (índices), Tarea 3 (pool), Tarea 11 (settings) | Tarea 14 (dark mode), Tarea 15 (error boundary) |
| **B** | Tarea 1 (socket rooms), Tarea 4 (OCR async), Tarea 6 (scopeTenant hook) | Tarea 13 (onboarding wizard), Tarea 16 (PWA offline) |
| **C** | Tarea 5 (error handler + DTOs), Tarea 7 (stock manager), Tarea 10 (validar stock) | Tarea 17 (micro-interactions), Tarea 24 (PDF export) |
| **D** | Tarea 8 (rate limit lockout), Tarea 9 (JWT refresh), Tarea 12 (tenant limits) | — |
| **E** | Tarea 18 (MercadoPago), Tarea 19 (WhatsApp), Tarea 20 (Rappi/Uber) | — |
| **F** | Tarea 21 (COGS), Tarea 22 (ML forecast), Tarea 23 (heatmap) | — |

---

## CRONOGRAMA SUGERIDO

```
Mes 1 (Sprint 38-40):
  - Tarea 1, 2, 3 (críticos de arquitectura)
  - Tarea 10 (bug fix crítico)
  - Tarea 5, 6, 7 (refactors de code quality)

Mes 2 (Sprint 41-43):
  - Tarea 8, 9, 12 (seguridad y límites)
  - Tarea 13, 14, 15, 17 (UX polish)

Mes 3 (Sprint 44-46):
  - Tarea 4 (OCR async)
  - Tarea 11 (settings refactor)
  - Tarea 16 (PWA offline)
  - Tarea 24 (PDF export)

Mes 4 (Sprint 47-49):
  - Tarea 18, 19, 20 (integraciones Latam)

Mes 5 (Sprint 50-52):
  - Tarea 21, 22, 23 (analytics avanzado)
```

---

## ESTADO DE PROGRESO

| Tarea | Estado | Fecha Completado |
|-------|--------|-----------------|
| 1 | ✅ Completada | 19/08/2026 |
| 2 | ✅ Completada | 19/08/2026 |
| 3 | ✅ Completada | 19/08/2026 |
| 4 | ✅ Completada | 19/08/2026 |
| 5 | ✅ Completada | 19/08/2026 |
| 6 | ✅ Completada | 19/08/2026 |
| 7 | ✅ Completada | 19/08/2026 |
| 8 | ✅ Completada | 19/08/2026 |
| 9 | ✅ Completada | 19/08/2026 |
| 10 | ✅ Completada | 19/08/2026 (ya estaba en T7) |
| 11 | ✅ Completada | 19/08/2026 |
| 12 | ✅ Completada | 19/08/2026 |
| 13 | ⬜ Pendiente | - |
| 14 | ⬜ Pendiente | - |
| 15 | ⬜ Pendiente | - |
| 16 | ⬜ Pendiente | - |
| 17 | ⬜ Pendiente | - |
| 18 | ⬜ Pendiente | - |
| 19 | ⬜ Pendiente | - |
| 20 | ⬜ Pendiente | - |
| 21 | ⬜ Pendiente | - |
| 22 | ⬜ Pendiente | - |
| 23 | ⬜ Pendiente | - |
| 24 | ⬜ Pendiente | - |

**Completado:** 12/24 (50%)
