# AGENTS.md — Memoria Persistente del Proyecto

## 0. Workflow con Sub-Agentes (OBLIGATORIO)

El agente principal (opencode) NUNCA debe escribir código directamente. Debe delegar usando subagentes.

### Sub-Agentes Disponibles

| Agente | Cuándo usarlo | Qué hace |
|--------|---------------|----------|
| `planner` | Al recibir un ticket o sprint | Analiza el código, divide en tareas, genera plan paso a paso con archivos exactos |
| `coder-back` | Para cualquier cambio en `back/` | Escribe controllers, routes, models, middleware. Solo toca `back/` |
| `coder-front` | Para cualquier cambio en `front/` | Escribe stores, views, components, router. Solo toca `front/` |
| `explore` | Cuando no entendés un archivo o flujo | Busca en el código, lee archivos, responde preguntas. No modifica nada |
| `reviewer` | Después de implementar, antes de push | Revisa código en busca de bugs, errores de sintaxis, malas prácticas |

### Flujo Correcto para Cada Ticket

```
1. planner    → "Analizá este ticket, generá el plan"
2. coder-back → "Implementá X en el backend según este plan"
3. coder-front→ "Implementá Y en el frontend según este plan"
4. reviewer   → "Revisá que no haya bugs en estos archivos"
5. opencode   → Git add + commit + push
```

### Reglas

1. **NUNCA** escribas código en el mensaje directamente — siempre delegá al coder correspondiente
2. **SIEMPRE** pasá el contexto completo al sub-agente (archivos a modificar, qué debe hacer exactamente)
3. **DESPUÉS** de que coder-back y coder-front terminen, llamá al reviewer
4. **SOLO** cuando el reviewer apruebe, hacé el commit
5. Si necesitás entender algo del código, usá `explore` antes de planificar

### Ejemplo de Delegación

```bash
# Mal: opencode escribe el código directamente
# Bien: opencode delega al sub-agente

task(subagent_type="coder-back", prompt="Creá endpoint PUT /api/compras/:id/recibir...")
task(subagent_type="coder-front", prompt="Creá store comandas.ts con acción fetchComandas...")
task(subagent_type="reviewer", prompt="Revisá back/controllers/compraController.js y front/src/stores/compras.ts...")
```

---

## 1. Resumen del Proyecto
Sistema de gestión integral para restaurantes. Backend en Node.js + Express 5 + Sequelize + SQLite. Frontend en Vue 3 + TypeScript + Pinia + Bootstrap 5. Autenticación JWT con roles. Dos modos de venta: directa (mostrador) y por mesa.

## 2. Estructura de Archivos Clave

### Backend (`back/`)
| Archivo | Descripción |
|---------|-------------|
| `server.js` | Entry point, monta rutas, sincroniza DB, seed admin |
| `config/database.js` | Conexión SQLite con Sequelize |
| `models/` | 8 modelos: Usuario, Producto, Proveedor, Mesa, Venta, DetalleVenta, Compra, DetalleCompra |
| `models/index.js` | Asociaciones entre modelos |
| `controllers/ventaController.js` | CRUD ventas + crear rápida, cobrar, agregar productos, actualizar, cancelar |
| `controllers/productoController.js` | CRUD productos + filtros |
| `controllers/proveedorController.js` | CRUD proveedores |
| `controllers/compraController.js` | CRUD compras + recibir, actualizar, cancelar |
| `controllers/reporteController.js` | Reportes: ventas hoy, por día, productos más vendidos, compras mes |
| `controllers/comandaController.js` | Comandas: obtener pendientes, actualizar estado |
| `routes/` | 8 routers: mesas, productos, compras, ventas, usuarios, proveedores, reportes, comandas |
| `middleware/auth.js` | `authenticateToken` + `authorizeRole` |
| `middleware/validar*.js` | Validaciones con express-validator |
| `.env` | `PORT=3000`, `JWT_SECRET=restaurant_secret_key_2026` |

### Frontend (`front/src/`)
| Archivo | Descripción |
|---------|-------------|
| `main.ts` | Bootstrap Vue 3 + Pinia + Router + Bootstrap CSS + style.css |
| `App.vue` | Layout con bottom-nav, theme toggle, user section, ToastContainer |
| `router/index.ts` | 8 rutas: login, home, mesas, inventario, compras, ventas, pedidos, proveedores |
| `services/api.ts` | Axios + baseURL localhost:3000/api + interceptor 401 |
| `stores/` | 8 stores: auth, ventas, mesas, productos, proveedores, compras, pedidos, toast |
| `views/` | 8 vistas: Login, Home, Mesas, Inventario, Compras, Ventas, Pedidos, Proveedores |
| `components/common/` | ModalBase, ToastContainer, ProductoSelector, ProveedorSelector |
| `style.css` | Tema claro/oscuro con variables CSS |

## 3. Lo que YA está Implementado

### Backend — API REST (todos con JWT + roles)
- **Auth**: POST `/api/usuarios/login` (público), GET `/api/usuarios` (admin), POST `/api/usuarios` (admin), PUT `/:id` (admin), DELETE `/:id` (admin)
- **Mesas**: GET, GET/:id, POST, PUT/:id, DELETE/:id (authenticateToken)
- **Productos**: GET, GET/:id (auth), POST, PUT/:id, DELETE/:id (admin)
- **Proveedores**: GET, GET/:id (auth), POST, PUT/:id, DELETE/:id (admin)
- **Ventas**: GET, GET/:id (auth), POST, POST/:id/productos, PUT/:id/cobrar, PUT/:id, DELETE/:id (auth + mesero/cajero/admin)
- **Compras**: GET, GET/:id (auth), POST, PUT/:id (admin), PUT/:id/recibir (admin), DELETE/:id (admin)
- **Reportes**: GET `/api/reportes/ventas-hoy`, `/ventas-por-dia`, `/productos-mas-vendidos`, `/compras-mes` (auth)
- **Comandas**: GET `/api/comandas` (auth), PUT `/api/comandas/:id/estado` (auth)
- **Health**: GET `/api/health`

### Backend — Middleware
- JWT con `authenticateToken` y `authorizeRole` en todas las rutas
- Validación con express-validator (productos, compras, proveedores, ventas)

### Backend — Modelos
- 8 modelos Sequelize con asociaciones completas
- `sync({ alter: true })` al iniciar
- Seed automático: admin `admin@restaurant.com` / admin123
- Hash de contraseñas con bcryptjs

### Frontend — Vistas
- **Login**: Formulario con email pre-cargado
- **Dashboard**: 8 stats cards + 3 gráficos (ventas por día, mesas doughnut, top productos)
- **Mesas**: Grid visual, ocupar/editar/eliminar, modal crear pedido por mesa
- **Inventario**: Tabla con filtro categoría, stock bajo indicator, CRUD
- **Proveedores**: Tabla con CRUD completo
- **Compras**: Tabla con filtro estado, detalle, recibir, editar, cancelar, selectores proveedor/producto
- **Ventas**: Tabla con filtro todas/abiertas/cerradas, venta rápida, continuar pedido
- **Pedidos**: Cards por venta, agregar productos, cobrar (con tabla en modal), cancelar
- **Usuarios**: Tabla con CRUD, toggle activo/inactivo, solo visible para admin

### Frontend — UX
- Bottom navigation fija con íconos (Usuarios visible solo para admin)
- Toggle claro/oscuro con persistencia localStorage
- ToastContainer con success/error/info/warning
- Loading states (spinners + botones disabled)
- Chart.js con vue-chartjs para gráficos del dashboard

## 4. Lo que está PENDIENTE

### Completado
- **Sprint 2**: Compras recibir/editar + Dashboard reportes + gráficos
- **Sprint 3 (parcial)**: Gestión usuarios frontend + Backend comandas

### Pendiente
1. **Frontend comandas/cocina**: Falta `ComandasView.vue`, store, ruta y nav item
2. **Roles en frontend**: Backend tiene roles pero frontend no gestiona permisos por rol
3. **Editar productos de venta abierta**: No se puede modificar cantidades ni eliminar productos individuales
4. **Caja / Corte de caja**: No existe
5. **Tipos TypeScript**: `front/src/types/` vacío. Todos los stores usan `any[]`
6. **Sin tests**: No hay archivos de test

### Bugs conocidos
1. **Stock negativo**: Al cobrar/crear venta rápida se descuenta stock sin validar que sea suficiente
2. **sync alter SQLite**: `ALTER TABLE` limitado, puede fallar si se modifican columnas con datos. Solución: borrar database.sqlite y reiniciar
3. **Código de barras**: Campo existe en modelo pero no en ProductoFormModal
4. **Filtro ventas**: No incluye opción "Canceladas" en VentasView
5. **DetalleVentas vs DetalleVenta**: API devuelve `DetalleVenta` (singular), template usa `DetalleVentas || DetalleVenta`
6. **`front/src/counter.ts`**: Archivo residual del scaffold de Vite

### Sprints futuros
- **Sprint 4**: Exportar Excel + Historial compras proveedor + Logs auditoría
- **Futuro**: PWA, escáner código barras, split bill, Docker, paginación, PostgreSQL

## 5. Notas Técnicas

### Inicio
```bash
cd back && npm run dev    # nodemon server.js (puerto 3000)
cd front && npm run dev   # vite (puerto 5173)
```

### Base de datos
- SQLite en `back/database.sqlite`
- `sync({ alter: true })` en cada inicio
- Si falla por cambios de schema: borrar database.sqlite y reiniciar

### Seed
- Admin auto-creado: `admin@restaurant.com` / `admin123`
- Script seed en `back/scripts/seed.js` (si existe)

### Dependencias clave
- Backend: express 5, sequelize 6, sqlite3 6, bcryptjs, jsonwebtoken, cors, express-validator
- Frontend: vue 3.5, vue-router 4, pinia 4, axios, bootstrap 5.3, vite 8, typescript 6

### API Base URL
Hardcodeada en `front/src/services/api.ts`: `http://localhost:3000/api`
