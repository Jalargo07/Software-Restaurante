# 🍽️ Restaurant Manager — BiteOps

Sistema de gestión integral para restaurantes con control de inventario, compras, ventas, administración de mesas, comandas de cocina, recetas para productos compuestos (con merma e insumos), caja, auditoría, subida de imágenes con S3/MinIO, autenticación JWT con roles y **arquitectura multi-tenant** para SaaS. Soporta **dos modos de venta**: venta directa (mostrador) y venta por mesa.

## 🌐 Demo en Vivo

El sistema ya está desplegado y funcionando en producción:

**🔗 [https://biteops-blush.vercel.app/](https://biteops-blush.vercel.app/)**

| Servicio | Función |
|----------|---------|
| **Vercel** | Frontend (Vue 3 + Vite) |
| **Render** | Backend (Node.js + Express) |
| **Supabase** | Base de datos PostgreSQL |
| **Upstash** | Redis (caché) |
| **Cloudflare R2** | Almacenamiento de imágenes |

Credenciales de prueba: `admin@restaurant.com` / `admin123`

---

## 🚀 Tecnologías y Stack

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Pinia-F5DEB3?style=for-the-badge&logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/AWS%20SDK-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white" alt="AWS SDK" />
  <img src="https://img.shields.io/badge/MinIO-C72C30?style=for-the-badge&logo=minio&logoColor=white" alt="MinIO" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</p>

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3.5 (Composition API) + TypeScript + Vite + Pinia + Tailwind CSS 4 + Lucide Icons + Vue Router + Axios + Chart.js + Socket.IO Client + PWA (Workbox) |
| **Backend** | Node.js 22+ + Express 5 + Sequelize 6 + SQLite / PostgreSQL + JWT + bcryptjs + Socket.IO + Multer + AWS SDK v3 (S3/MinIO) |
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

El backend incluye una suite completa de pruebas de integración con **Vitest** y **Supertest** (72+ tests distribuidos en 10+ suites: auth, productos, ventas, compras, recetas, tenant, tenantScope, tenantConfig, branding y cache).

```bash
cd back
pnpm test          # Ejecuta todos los tests una vez
pnpm run test:watch  # Ejecuta en modo watch
```

---

## 🌟 Características Principales

- **Multi-tenant (SaaS):** Arquitectura completa con Modelo Tenant, tenant_id en 12 tablas, middleware de contexto y scoping automático en todos los controllers.
- **Landing Page Pública:** Página de aterrizaje completa con secciones de problemas, soluciones, diferentes, precios y testimonios.
- **Branding Dinámico:** Colores personalizados por tenant con CSS Variables, dark mode automático en toda la app.
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
| **Sprint 8** | ✅ Completado | Branding dinámico (White-label, logo, colores CSS Variables, login personalizado) |
| **Sprint 9** | ✅ Completado | Caché con Redis, invalidación por WebSockets, middleware genérico |
| **Sprint 10** | ✅ Completado | Super Admin, Planes de Suscripción, Límites por Tenant |
| **Sprint 11** | ✅ Completado | TypeScript Backend completo + Dashboard UX + Refactor Recetas |
| **Sprint 12-18** | ✅ Completado | Migración completa a Tailwind CSS (0 clases Bootstrap, dark mode total) |
