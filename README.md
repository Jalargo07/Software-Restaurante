# Sistema de Inventario

Sistema de gestión de inventario para restaurante construido con **Vue 3** (Frontend) y **Node.js/Express** (Backend), utilizando **Sequelize** como ORM y **SQLite** como base de datos.

## Estructura del proyecto

```
├── back/                    # API REST - Node.js + Express
│   ├── config/              # Configuración de base de datos
│   ├── controllers/         # Lógica de negocio (Producto, Compra, Venta)
│   ├── middleware/           # Validación de entradas (express-validator)
│   ├── models/              # Modelos Sequelize (Producto, Compra, Venta, Mesa, etc.)
│   ├── routes/              # Definición de endpoints
│   ├── utils/               # Utilidades
│   └── server.js            # Punto de entrada
├── front/                   # SPA - Vue 3 + TypeScript
│   └── src/
└── README.md
```

## Modelos principales

- **Producto**: nombre, código de barras/SKU, descripción, precios, stock.
- **Compra**: proveedor, fecha, total, detalles (productos comprados).
- **Venta**: cliente, mesa, método de pago, fecha, total, detalles (productos vendidos).

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

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/productos | Listar productos |
| POST | /api/productos | Crear producto |
| GET | /api/compras | Listar compras |
| POST | /api/compras | Registrar compra |
| GET | /api/ventas | Listar ventas |
| POST | /api/ventas | Registrar venta |
| GET | /api/mesas | Listar mesas |
| GET | /api/health | Estado del servidor |
