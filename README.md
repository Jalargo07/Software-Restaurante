# Restaurant Manager

Sistema de gestión integral para restaurantes con control de inventario, compras, ventas, administración de mesas y autenticación JWT. Soporta **dos modos de venta**: venta directa (mostrador) y venta por mesa.

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3 + TypeScript + Vite + Pinia + Bootstrap 5 + Vue Router + Axios |
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
│   ├── controllers/      # Lógica de negocio (Producto, Compra, Venta, Mesa, Usuario)
│   ├── middleware/        # Validación y autenticación JWT
│   ├── models/           # Modelos Sequelize
│   ├── routes/           # Endpoints REST
│   ├── utils/            # Utilidades
│   ├── server.js         # Punto de entrada
│   └── package.json
├── front/
│   ├── src/
│   │   ├── assets/       # Recursos estáticos
│   │   ├── components/   # Componentes reutilizables (modales, selectores)
│   │   ├── router/       # Configuración de rutas Vue Router
│   │   ├── services/     # Cliente Axios
│   │   ├── stores/       # Stores Pinia (auth, productos, compras, ventas, mesas)
│   │   ├── types/        # Definiciones TypeScript
│   │   └── views/        # Vistas (auth, compras, inventario, mesas, pedidos, ventas)
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## Funcionalidades principales

- **Autenticación JWT**: login con roles (admin) y protección de rutas
- **Inventario**: CRUD completo de productos con código de barras/SKU y precios
- **Compras**: registro de compras a proveedores con detalle de productos
- **Ventas**: dos modos de operación
  - *Venta directa* (mostrador): selección rápida de productos
  - *Venta por mesa*: asigna productos a una mesa y cierra la cuenta
- **Mesas**: administración de estado (libre, ocupada, reservada) con mapa visual
- **Pedidos**: visualización de pedidos activos por mesa
- **Dashboard**: resumen de ventas, productos bajos en stock y movimientos recientes
