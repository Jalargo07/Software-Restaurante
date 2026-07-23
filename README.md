# Restaurant Manager

Sistema de gestión integral para restaurantes con control de inventario, compras, ventas, administración de mesas, comandas de cocina y autenticación JWT. Soporta **dos modos de venta**: venta directa (mostrador) y venta por mesa.

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3 + TypeScript + Vite + Pinia + Bootstrap 5 + Vue Router + Axios + Chart.js |
| **Backend** | Node.js + Express 5 + Sequelize + SQLite + JWT + bcryptjs |
| **Herramientas** | Nodemon, express-validator |

## Requisitos

- Node.js v18 o superior
- npm (incluido con Node.js)

## Instalación y ejecución

### Backend

```bash
cd back
npm install
npm run dev
```

El servidor arranca en `http://localhost:3000`.

### Frontend

```bash
cd front
npm install
npm run dev
```

El frontend arranca en `http://localhost:5173`.

> ⚠️ El backend debe estar corriendo para que el frontend funcione correctamente.

## Credenciales por defecto

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@restaurant.com | admin123 | Administrador |

## Estructura del proyecto

```
restaurant-manager/
├── back/
│   ├── config/           # Configuración de base de datos (SQLite)
│   ├── controllers/      # Lógica de negocio
│   │   ├── authController.js
│   │   ├── compraController.js
│   │   ├── comandaController.js
│   │   ├── mesaController.js
│   │   ├── productoController.js
│   │   ├── proveedorController.js
│   │   ├── reporteController.js
│   │   └── ventaController.js
│   ├── middleware/        # Validación, autenticación JWT y roles
│   ├── models/           # Modelos Sequelize (8 modelos)
│   ├── routes/           # Endpoints REST (8 routers)
│   ├── server.js         # Punto de entrada
│   └── package.json
├── front/
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   │   ├── common/   # ModalBase, ToastContainer, charts
│   │   │   ├── compras/  # CompraFormModal, CompraDetailModal
│   │   │   ├── pedidos/  # PedidoFormModal
│   │   │   ├── productos/# ProductoFormModal
│   │   │   └── proveedores/ # ProveedorFormModal
│   │   ├── router/       # Vue Router (9 rutas)
│   │   ├── services/     # Cliente Axios con interceptor JWT
│   │   ├── stores/       # Stores Pinia (9 stores)
│   │   └── views/        # 9 vistas
│   │       ├── auth/     # Login
│   │       ├── compras/  # ComprasView
│   │       ├── comandas/ # ComandasView (cocina)
│   │       ├── inventario/# InventarioView
│   │       ├── mesas/    # MesasView
│   │       ├── pedidos/  # PedidosView
│   │       ├── proveedores/ # ProveedoresView
│   │       ├── usuarios/ # UsuariosView
│   │       └── ventas/   # VentasView
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## API REST

Todas las rutas requieren JWT (`Authorization: Bearer <token>`) excepto login.

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/api/usuarios/login` | Login y obtener token | Público |
| GET | `/api/usuarios` | Listar usuarios | Admin |
| POST | `/api/usuarios` | Crear usuario | Admin |
| PUT | `/api/usuarios/:id` | Editar usuario | Admin |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | Admin |
| GET | `/api/productos` | Listar productos | Admin |
| GET | `/api/productos/:id` | Obtener producto | Autenticado |
| POST | `/api/productos` | Crear producto | Admin |
| PUT | `/api/productos/:id` | Editar producto | Admin |
| DELETE | `/api/productos/:id` | Eliminar producto | Admin |
| GET | `/api/proveedores` | Listar proveedores | Admin |
| POST | `/api/proveedores` | Crear proveedor | Admin |
| PUT | `/api/proveedores/:id` | Editar proveedor | Admin |
| DELETE | `/api/proveedores/:id` | Eliminar proveedor | Admin |
| GET | `/api/mesas` | Listar mesas | Autenticado |
| POST | `/api/mesas` | Crear mesa | Autenticado |
| PUT | `/api/mesas/:id` | Editar mesa | Autenticado |
| DELETE | `/api/mesas/:id` | Eliminar mesa | Autenticado |
| GET | `/api/ventas` | Listar ventas | Autenticado |
| GET | `/api/ventas/:id` | Obtener venta con detalles | Autenticado |
| POST | `/api/ventas` | Crear venta | Mesero/Cajero/Admin |
| POST | `/api/ventas/:id/productos` | Agregar producto a venta | Mesero/Cajero/Admin |
| PUT | `/api/ventas/:id/cobrar` | Cobrar venta | Mesero/Cajero/Admin |
| PUT | `/api/ventas/:id` | Editar venta | Autenticado |
| DELETE | `/api/ventas/:id` | Cancelar venta | Autenticado |
| GET | `/api/compras` | Listar compras | Autenticado |
| POST | `/api/compras` | Crear compra | Admin |
| PUT | `/api/compras/:id` | Editar compra pendiente | Admin |
| PUT | `/api/compras/:id/recibir` | Recibir compra (actualiza stock) | Admin |
| DELETE | `/api/compras/:id` | Cancelar compra | Admin |
| GET | `/api/comandas` | Obtener comandas pendientes | Autenticado |
| PUT | `/api/comandas/:id/estado` | Actualizar estado comanda | Cocinero/Admin |
| GET | `/api/reportes/ventas-hoy` | Resumen ventas del día | Autenticado |
| GET | `/api/reportes/ventas-por-dia` | Ventas de últimos 7 días | Autenticado |
| GET | `/api/reportes/productos-mas-vendidos` | Top 10 productos vendidos | Autenticado |
| GET | `/api/reportes/compras-mes` | Compras del mes actual | Autenticado |
| GET | `/api/health` | Health check | Público |

## Funcionalidades principales

### Autenticación y roles
- JWT con 4 roles: `admin`, `mesero`, `cajero`, `cocinero
- Rutas protegidas por rol con `authorizeRole`
- Seed automático del usuario admin al iniciar

### Inventario
- CRUD completo de productos con categoría, precio, stock
- Indicador de stock bajo
- Filtro por categoría

### Compras
- Crear compra con detalle de productos y proveedor
- Editar compra mientras esté pendiente
- Recibir compra: actualiza stock automáticamente con transacción
- Cancelar compra
- Filtro por estado (pendiente/recibida/cancelada)

### Ventas
- Venta directa (mostrador): creación rápida sin mesa
- Venta por mesa: asigna productos a una mesa específica
- Cobrar venta: cierra y registra el pago
- Agregar/eliminar productos de venta abierta
- Cancelar venta

### Mesas
- Grid visual con estados: libre, ocupada, reservada
- Crear/editar/eliminar mesas
- Modal para crear pedido directo desde mesa

### Pedidos (Cocina)
- Cards por venta abierta con lista de productos
- Agregar productos al pedido
- Cobrar desde el detalle del pedido
- Cancelar pedido

### Comandas (Cocina)
- Vista de cocina con cards por venta
- Badges de estado: pendiente → en_preparación → listo
- Avanzar estado con un clic
- Filtro por estado de comanda
- Auto-refresh cada 30 segundos
- Acceso restringido a cocineros y admins

### Usuarios
- CRUD completo (crear, editar, activar/desactivar)
- Solo visible para administradores
- Toggle activo/inactivo

### Dashboard
- 8 tarjetas de estadísticas (ventas hoy, ticket promedio, mesas ocupadas, etc.)
- Gráfico de barras: ventas de últimos 7 días
- Gráfico doughnut: distribución de mesas
- Gráfico de barras horizontal: top 10 productos vendidos

### UX
- Bottom navigation con íconos (Usuarios visible solo para admin)
- Toggle claro/oscuro con persistencia en localStorage
- Toast notifications (success, error, info, warning)
- Loading states con spinners
- Modales reutilizables

## Modelos de datos

| Modelo | Campos clave |
|--------|-------------|
| Usuario | nombre, email (unique), password (hash), rol, activo |
| Producto | nombre, categoría, precio, stock, códigoBarras, stockMinimo |
| Proveedor | nombre, contacto, teléfono, email, dirección |
| Mesa | número (unique), capacidad, estado (libre/ocupada/reservada) |
| Venta | total, estado (abierta/cerrada/cancelada), modo (mesa/mostrador), MesaId |
| DetalleVenta | cantidad, precioUnitario, subtotal, VentaId, ProductoId, estadoComanda |
| Compra | total, estado (pendiente/recibida/cancelada), ProveedorId, fechaRecepcion |
| DetalleCompra | cantidad, precioUnitario, subtotal, CompraId, ProductoId |

### Exportar Excel
- Botón "Exportar Excel" en Dashboard, VentasView y ComprasView
- Genera archivos .xlsx con resumen y detalle
- Filtros por fecha (Desde/Hasta)
- Solo accesible por admin

### Historial de compras por proveedor
- Botón "Historial" en cada fila de ProveedoresView
- Modal con resumen (total compras, monto total, promedio)
- Tabla detallada de compras del proveedor
- Botón exportar historial a Excel

### Auditoría
- Modelo `Auditoria` con: usuario, acción, entidad, ID entidad, detalles, IP
- Logging automático en 5 controllers (ventas, compras, productos, proveedores, usuarios)
- Vista con tabla de logs, filtros (usuario, entidad, fecha), paginación
- Badge de color por acción (crear=verde, editar=azul, eliminar=rojo, etc.)
- Exportar logs a Excel
- Solo accesible por admin

## Sprints

| Sprint | Estado | Descripción |
|--------|--------|-------------|
| Sprint 1 | ✅ Completado | CRUD productos, proveedores, mesas, ventas, auth |
| Sprint 2 | ✅ Completado | Compras recibir/editar, Dashboard reportes y gráficos |
| Sprint 3 | ✅ Completado | Gestión usuarios, Sistema comandas/cocina |
| Sprint 4 | ✅ Completado | Exportar Excel, Historial compras proveedor, Logs auditoría |

## Bugs conocidos

1. **Stock negativo**: Al cobrar/crear venta rápida se descuenta stock sin validar suficiente
2. **sync alter SQLite**: `ALTER TABLE` limitado; si falla, borrar `database.sqlite` y reiniciar
3. **Código de barras**: Campo existe en modelo pero no en formulario de producto
4. **Filtro ventas**: No incluye opción "Canceladas" en VentasView

## Futuro

- PWA
- Escáner de código de barras
- Split bill (dividir cuenta)
- Docker
- Paginación
- PostgreSQL como DB alternativa
