# AGENTS.md — Memoria Persistente del Proyecto

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
| `controllers/compraController.js` | CRUD compras + cancelar |
| `routes/` | 6 routers: mesas, productos, compras, ventas, usuarios, proveedores |
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
- **Auth**: POST `/api/usuarios/login` (público), GET `/api/usuarios` (admin), POST `/api/usuarios` (admin)
- **Mesas**: GET, GET/:id, POST, PUT/:id, DELETE/:id (authenticateToken)
- **Productos**: GET, GET/:id (auth), POST, PUT/:id, DELETE/:id (admin)
- **Proveedores**: GET, GET/:id (auth), POST, PUT/:id, DELETE/:id (admin)
- **Ventas**: GET, GET/:id (auth), POST, POST/:id/productos, PUT/:id/cobrar, PUT/:id, DELETE/:id (auth + mesero/cajero/admin)
- **Compras**: GET, GET/:id (auth), POST, DELETE/:id (admin)
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
- **Dashboard**: Cards con stats (mesas, stock bajo, pedidos activos, ventas hoy)
- **Mesas**: Grid visual, ocupar/editar/eliminar, modal crear pedido por mesa
- **Inventario**: Tabla con filtro categoría, stock bajo indicator, CRUD
- **Proveedores**: Tabla con CRUD completo
- **Compras**: Tabla con detalle y cancelar, selectores proveedor/producto
- **Ventas**: Tabla con filtro todas/abiertas/cerradas, venta rápida, continuar pedido
- **Pedidos**: Cards por venta, agregar productos, cobrar (con tabla en modal), cancelar

### Frontend — UX
- Bottom navigation fija con íconos
- Toggle claro/oscuro con persistencia localStorage
- ToastContainer con success/error/info/warning
- Loading states (spinners + botones disabled)

## 4. Lo que está PENDIENTE

### Funcionalidades
1. **Roles en frontend**: Backend tiene roles (admin/mesero/cajero/cocinero) pero frontend no gestiona permisos ni vistas por rol
2. **Gestión de usuarios frontend**: No hay vista para listar/crear/editar usuarios
3. **Editar productos de venta abierta**: No se puede modificar cantidades ni eliminar productos individuales (solo agregar)
4. **Recibir compra**: Modelo tiene estado `recibida` pero no hay endpoint ni botón para marcarla como recibida. Stock se actualiza al crear, no al recibir
5. **Reportes**: No hay reportes (ventas por día, productos más vendidos, etc.)
6. **Caja / Corte de caja**: No existe
7. **Tipos TypeScript**: `front/src/types/` vacío. Todos los stores usan `any[]`

### Bugs conocidos
1. **Stock negativo**: Al cobrar/crear venta rápida se descuenta stock sin validar que sea suficiente
2. **sync alter SQLite**: `ALTER TABLE` limitado, puede fallar si se modifican columnas con datos. Solución: borrar database.sqlite y reiniciar
3. **Código de barras**: Campo existe en modelo pero no en ProductoFormModal
4. **Filtro ventas**: No incluye opción "Canceladas" en VentasView
5. **DetalleVentas vs DetalleVenta**: API devuelve `DetalleVenta` (singular), template usa `DetalleVentas || DetalleVenta`
6. **Sin tests**: No hay archivos de test
7. **`front/src/counter.ts`**: Archivo residual del scaffold de Vite

### Mejoras planeadas (siguientes sprints)
- **Sprint 2**: Compras recibir/editar + Dashboard reportes
- **Sprint 3**: Gestión usuarios + Sistema comandas/cocina
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
