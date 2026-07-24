# 🍽️ Restaurant Manager — BiteOps

Sistema de gestión integral para restaurantes con control de inventario, compras, ventas, administración de mesas, comandas de cocina, recetas para productos compuestos (con merma e insumos), caja, auditoría, subida de imágenes con S3/MinIO, autenticación JWT con roles y **arquitectura multi-tenant** para SaaS. Soporta **dos modos de venta**: venta directa (mostrador) y venta por mesa.

---

## 🚀 Tecnologías y Stack

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Pinia-F5DEB3?style=for-the-badge&logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/AWS%20SDK-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white" alt="AWS SDK" />
  <img src="https://img.shields.io/badge/MinIO-C72C30?style=for-the-badge&logo=minio&logoColor=white" alt="MinIO" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</p>

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3.5 (Composition API) + TypeScript + Vite + Pinia + Bootstrap 5.3 + Vue Router + Axios + Chart.js + Socket.IO Client + PWA (Workbox) |
| **Backend** | Node.js 18+ + Express 5 + Sequelize 6 + SQLite / PostgreSQL + JWT + bcryptjs + Socket.IO + Multer + AWS SDK v3 (S3/MinIO) |
| **Multi-tenant** | Modelo Tenant + tenant_id en 12 tablas + middleware tenantContext + scoping automático en controllers |
| **Testing & DevOps** | Vitest + Supertest (47 tests, 7 suites) + Docker & Docker Compose + Nginx |

---

## 📋 Requisitos Previos

- Node.js v18 o superior
- Docker y Docker Compose (opcional, para ejecución contenedorizada)

---

## 🛠️ Instalación y Ejecución Local

### Requisito: pnpm
Este proyecto usa **pnpm** como gestor de paquetes. Para instalarlo:
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### 1. Clonar el repositorio y configurar variables de entorno
```bash
git clone https://github.com/Jalargo07/Software-Restaurante.git
cd Software-Restaurante
```

### 2. Backend
```bash
cd back
pnpm install
# Configurar .env basado en .env.example
pnpm run seed  # Carga datos de prueba (productos, mesas, recetas, proveedores)
pnpm run dev   # Inicia servidor en http://localhost:3000
```

### 3. Frontend
```bash
cd front
pnpm install
pnpm run dev   # Inicia Vite en http://localhost:5173
```

---

## 🐳 Ejecución con Docker

Para levantar todo el ecosistema (Backend, Frontend con Nginx y PostgreSQL) con un solo comando:

```bash
docker compose up --build -d
```

- **Frontend:** `http://localhost`
- **Backend API:** `http://localhost:3000/api`
- **MinIO Console:** `http://localhost:9001` (requiere MinIO externo o docker-compose con MinIO)

---

## 🔐 Credenciales por Defecto

| Email | Contraseña | Rol | Acceso |
|-------|------------|-----|--------|
| `admin@restaurant.com` | `admin123` | `admin` | Acceso total al sistema y gestión de usuarios |

---

## 🧪 Pruebas Automatizadas

El backend incluye una suite completa de pruebas de integración con **Vitest** y **Supertest** (62 tests distribuidos en 9 suites: auth, productos, ventas, compras, recetas, tenant, tenantScope, tenantConfig y branding).

```bash
cd back
pnpm test          # Ejecuta todos los tests una vez
pnpm run test:watch  # Ejecuta en modo watch
```

---

## 🌟 Características Principales

- **Multi-tenant (SaaS):** Arquitectura completa con Modelo Tenant, tenant_id en 12 tablas, middleware de contexto y scoping automático en todos los controllers.
- **Gestión de Roles & Permisos:** Admin, Mesero, Cajero, Cocinero con control estricto en rutas y vistas.
- **Inventario Avanzado:** Tipos de producto (`insumo`, `compuesto`, `directo`), gestión de stock mínimo y fotos con S3/MinIO.
- **Recetas e Ingredientes:** Productos compuestos con descuento automático de insumos en inventario y cálculo de merma.
- **Comandas en Tiempo Real:** Notificaciones instantáneas a cocina mediante WebSockets (Socket.IO).
- **Caja / Corte de Caja:** Resumen por método de pago (efectivo, tarjeta, transferencia), cierre de caja e historial.
- **Split Bill:** División de cuentas en partes iguales o montos personalizados con pagos mixtos.
- **Auditoría y Reportes:** Registro automático de acciones con filtros, paginación y exportación a Excel (`.xlsx`).
- **Dashboard Estadístico:** 8 tarjetas de estadísticas y gráficos interactivos con Chart.js.
- **PWA:** Progressive Web App con service worker (Workbox) y manifest para instalación offline.
- **Paginación:** Server-side en Ventas, Compras y Proveedores con UI de navegación.
- **Imágenes S3:** Upload/eliminar imágenes de productos con namespacing por tenant (Soporta MinIO, Cloudflare R2, Supabase Storage).

---

## 📊 Sprints

| Sprint | Estado | Descripción |
|--------|--------|-------------|
| **Sprint 1** | ✅ Completado | CRUD de productos, proveedores, mesas, ventas y autenticación JWT |
| **Sprint 2** | ✅ Completado | Recepción/edición de compras, Dashboard con reportes y gráficos |
| **Sprint 3** | ✅ Completado | Gestión frontend de usuarios y sistema de comandas/cocina en tiempo real |
| **Sprint 4** | ✅ Completado | Exportación a Excel, historial de compras por proveedor y logs de auditoría |
| **Sprint 5** | ✅ Completado | Recetas, roles frontend, WebSockets, caja, Docker, S3, TypeScript, tests |
| **Sprint 6** | ✅ Completado | PWA, Split Bill, Paginación, PostgreSQL, S3 desacoplado para Cloud |
| **Sprint 7** | ✅ Completado | Arquitectura Multi-tenant (Modelo Tenant, middleware, scoping controllers) |
| **Sprint 8** | 🔄 En curso | Identidad y Branding Dinámico (White-label, logo, colores, slug) |
