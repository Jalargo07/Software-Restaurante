# 🍽️ BiteOps — Restaurant Management System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

**Full-stack SaaS restaurant management system.** Built with Vue 3, Node.js, TypeScript, and PostgreSQL. Architecture designed for multi-tenancy with modular sprint-based development.

> 🔗 **Live demo:** [biteops-blush.vercel.app](https://biteops-blush.vercel.app/)  
> 📧 `admin@restaurant.com` / `admin123`

---

## 📖 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Project Methodology](#-project-methodology)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Portfolio Highlights](#-portfolio-highlights)

---

## 🏛 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                        │
│  Vue 3 + TypeScript + Pinia + Tailwind CSS + Socket.IO     │
│  PWA · Vue Router · Chart.js · Axios                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend (Render)                         │
│  Node.js + Express 5 + TypeScript + Socket.IO              │
│  JWT Auth · Roles · Redis Cache · Multer                   │
└──────┬──────────────┬──────────────┬────────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────────┐
│ PostgreSQL  │ │   Redis    │ │ Cloudflare R2 │
│ (Supabase)  │ │ (Upstash)  │ │ (S3 Images)   │
└─────────────┘ └────────────┘ └───────────────┘
```

### Multi-tenant Design

- `tenant_id` across all tables with composite indexes
- Middleware-based tenant context resolution (JWT → tenantId)
- Automatic scoping in every controller
- Per-tenant branding (colors, logo, fonts) via CSS Variables

---

## 🌟 Features

### Core Operations
| Feature | Description |
|---------|-------------|
| **POS System** | Quick sales, table orders, split bill, mixed payments |
| **Inventory** | Stock tracking, minimum alerts, virtual physical stock |
| **Purchases** | OCR invoice scanning (AI-powered), auto product creation |
| **Kitchen Display** | Real-time orders via WebSockets with status updates |
| **Cash Register** | Daily close, payment method breakdown, history |

### Advanced
| Feature | Description |
|---------|-------------|
| **Kardex FIFO/PEPS** | Inventory valuation with historical cost, P&L dashboard |
| **Recipe Management** | Compound products with automatic ingredient deduction + waste |
| **Multi-tenant SaaS** | Tenant isolation, per-plan limits (Basic/Pro/Enterprise) |
| **2FA Authentication** | Google Authenticator for Super Admin |
| **AI Invoice Scanner** | Upload invoice → OCR (Tesseract.js) → Parse (Groq AI) → Auto-fill form |
| **QR Menu** | 3 display styles, real QR codes, public landing |
| **Custom Plan Builder** | Modular plan selector for personalized pricing |

### UX & Performance
| Feature | Description |
|---------|-------------|
| **PWA** | Offline-capable, installable, service worker caching |
| **Dark Mode** | System-wide, persistent via CSS variables |
| **Responsive** | Mobile-first, sidebar drawer, fullscreen modals |
| **Lighthouse 90+** | Optimized images (WebP), deferred CSS/fonts, CLS-free |

---

## 📊 Project Methodology

This project was built using an agile sprint methodology. Each sprint delivered a complete vertical slice (backend + frontend + tests).

### Sprint Roadmap

| Phase | Sprints | Theme |
|-------|---------|-------|
| **Foundation** | 1–6 | Core CRUD, auth, Docker, PWA, Split Bill |
| **Multi-tenant** | 7–9 | Tenant model, branding, caching |
| **Admin & Plans** | 10–11 | Super Admin, TypeScript migration |
| **UI Modernization** | 12–18 | Tailwind CSS migration (0 Bootstrap) |
| **Financial** | 19–21 | Kardex FIFO/PEPS, P&L dashboard, product filters |
| **SEO & Performance** | 22–24 | SEO, caching, responsive design |
| **Customer Features** | 25–31 | QR Menu, E-invoice, Plans & Payments, 2FA, CMS |
| **Inventory** | 32–37 | Stock validation, waste tracking, anti-piracy, low stock alerts |
| **AI & Automation** | A–C | Contact system, AI invoice scanning, custom plan builder |

> **Recent:** AI-powered invoice scanner with OCR + Groq LLM parsing, fuzzy product matching with Levenshtein distance, automatic product creation on purchase.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3.5 (Composition API) · TypeScript 6 · Vite 8 · Pinia · Tailwind CSS 4 · Vue Router · Chart.js · Socket.IO Client |
| **Backend** | Node.js 22 · Express 5 · Sequelize 6 · TypeScript · JWT · bcryptjs · Multer · Socket.IO |
| **Database** | PostgreSQL 15 (production) · SQLite (development/testing) |
| **Cache** | Redis 7 |
| **Storage** | MinIO (local) · Cloudflare R2 / Supabase Storage (production) |
| **AI** | Groq (Llama 3.3 70B) · Tesseract.js OCR · @google/generative-ai |
| **DevOps** | Docker · Docker Compose · Nginx · Vitest · Supertest |
| **Infra** | Vercel (frontend) · Render (backend) · Supabase (DB) · Upstash (Redis) |

### Architecture Highlights

- **Monorepo structure** with separate `back/` and `front/` directories
- **95% TypeScript** coverage across the entire codebase
- **15+ Sequelize models** with full associations
- **72+ integration tests** across 10+ suites
- **RESTful API** with JWT authentication and role-based authorization (admin, waiter, cashier, cook)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker & Docker Compose (optional)

### Quick Start with Docker
```bash
git clone https://github.com/Jalargo07/Software-Restaurante.git
cd Software-Restaurante
docker compose up --build -d
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000/api`

### Manual Setup
```bash
# Backend
cd back
pnpm install
cp .env.example .env  # Configure environment variables
pnpm run dev          # http://localhost:3000

# Frontend (new terminal)
cd front
pnpm install
pnpm run dev          # http://localhost:5173
```

### Seed Data
The backend auto-seeds on first run:
- **Admin user:** `admin@restaurant.com` / `admin123`
- **28 products** (15 ingredients, 7 direct, 4 compound, 2 extras)
- **4 suppliers**, 8 purchases, 10 sample sales

---

## 🧪 Testing

```bash
cd back
pnpm test              # Run all tests
pnpm run test:watch    # Watch mode
```

- **72+ tests** across 10 suites
- Integration tests with SuperTest + SQLite
- Covers: auth, products, sales, purchases, tenants, cache, branding

---

## 🌐 Deployment

| Service | Provider | Configuration |
|---------|----------|--------------|
| Frontend | Vercel | Auto-deploy from `main` branch |
| Backend | Render | Auto-deploy from `main` branch |
| Database | Supabase (PostgreSQL) | Connection via `DATABASE_URL` |
| Cache | Upstash (Redis) | Connection via `REDIS_URL` |
| Storage | Cloudflare R2 | S3-compatible API |

Environment variables for production are managed through each provider's dashboard.

---

## 📁 Project Structure

```
├── back/                    # Express API
│   ├── controllers/         # Route handlers (15 controllers)
│   ├── models/              # Sequelize models (15+ models)
│   ├── routes/              # Express routers (13 routers)
│   ├── middleware/          # Auth, tenant, validation, cache
│   ├── utils/               # OCR scanner, AI parser, audit
│   ├── config/              # DB, Redis, S3, MinIO config
│   ├── scripts/             # Seed data, docker entrypoint
│   └── tests/               # Integration tests (10+ suites)
├── front/                   # Vue 3 SPA
│   ├── src/
│   │   ├── views/           # 15+ views (auth, admin, production, public)
│   │   ├── components/      # Reusable components
│   │   ├── stores/          # Pinia stores (14 stores)
│   │   ├── composables/     # Shared composables
│   │   └── services/        # API client, Socket.IO
│   └── public/              # Static assets
└── docker-compose.yml       # Full-stack Docker setup
```

---

## 🏆 Portfolio Highlights

What makes this project stand out:

1. **Real production deployment** — Live on Vercel + Render with actual database and caching
2. **AI integration** — Invoice scanning with OCR + LLM parsing (not just a mock)
3. **Multi-tenant SaaS architecture** — Production-ready tenant isolation
4. **Full CI/CD pipeline** — Auto-deploy from git, Docker containerization
5. **Comprehensive testing** — 72+ integration tests
6. **Agile methodology** — 30+ sprints with documented roadmap
7. **Modern stack** — Vue 3.5 + TypeScript 6 + Vite 8 + Tailwind 4 + Express 5 + PostgreSQL 15

---

<p align="center">
  Built with ❤️ for restaurant management
</p>
