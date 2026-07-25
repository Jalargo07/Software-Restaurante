# Guía de Despliegue — BiteOps

## Servicios Utilizados

| Servicio | Función | Plan Gratis |
|----------|---------|-------------|
| **Koyeb** | Backend (Node.js + TypeScript) | ✅ Sí |
| **Vercel** | Frontend (Vue 3 + Vite) | ✅ Sí |
| **Supabase** | Base de datos PostgreSQL | ✅ Sí (500MB) |
| **Upstash** | Redis (caché) | ✅ Sí (10K comandos/día) |
| **Cloudflare R2** | Almacenamiento de imágenes | ✅ Sí (10GB) |

---

## PASO 1: Cloudflare R2 (Imágenes)

1. Ir a [dash.cloudflare.com](https://dash.cloudflare.com) → crear cuenta gratis
2. Menú lateral → **R2** → **Create bucket**
3. Nombre: `biteops-images` → **Create bucket**
4. Pestaña **API Tokens** → **Create API token** → **Edit R2 buckets** → seleccionar bucket → **Create**
5. **Copiar credenciales** (Access Key ID + Secret Access Key)
6. Pestaña del bucket → **Settings** → **Public access** → **Allow Access**

**Variables necesarias:**
- `S3_ENDPOINT`: `https://[account-id].r2.cloudflarestorage.com` (encontrar en R2 → API → S3 API)
- `S3_ACCESS_KEY`: Access Key ID
- `S3_SECRET_KEY`: Secret Access Key
- `S3_BUCKET_NAME`: `biteops-images`
- `S3_REGION`: `auto`
- `S3_FORCE_PATH_STYLE`: `false`

---

## PASO 2: Supabase (Base de datos)

1. Ir a [supabase.com](https://supabase.com) → cuenta gratis
2. **New Project** → nombre: `biteops-db` → password fuerte → región cercana → **Create**
3. Esperar 2-3 min
4. **Project Settings** → **Database** → copiar **Connection String** (modo URI):
   ```
   postgresql://postgres.[project-id]:[password]@db.[project-id].supabase.co:5432/postgres
   ```

**Variable necesaria:**
- `DATABASE_URL`: Connection string de Supabase
- `DB_DIALECT`: `postgres`

---

## PASO 3: Upstash (Redis)

1. Ir a [upstash.com](https://upstash.com) → cuenta gratis
2. **Create Database** → nombre: `biteops-redis` → región cercana → **Create**
3. Copiar **REST URL** y **REST Token**

**Variables necesarias:**
- `REDIS_URL`: REST URL de Upstash
- `REDIS_TOKEN`: REST Token de Upstash

---

## PASO 4: Koyeb (Backend)

1. Ir a [koyeb.com](https://koyeb.com) → cuenta gratis → **Create App**
2. **GitHub** → autorizar → seleccionar repo `Software-Restaurante`
3. Configuración:
   - **Builder**: Docker
   - **Dockerfile path**: `back/Dockerfile`
   - **Port**: `3000`
   - **Instance type**: Free
4. **Environment Variables** (pegar todas):

| Variable | Valor |
|----------|-------|
| `PORT` | `3000` |
| `JWT_SECRET` | Cadena larga aleatoria (ej: `biteops-secret-2026-xyz-123`) |
| `CORS_ORIGIN` | URL de Vercel (ej: `https://biteops.vercel.app`) |
| `DATABASE_URL` | Connection string de Supabase |
| `DB_DIALECT` | `postgres` |
| `REDIS_URL` | REST URL de Upstash |
| `REDIS_TOKEN` | REST Token de Upstash |
| `S3_ENDPOINT` | `https://[account-id].r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY` | Access Key ID de R2 |
| `S3_SECRET_KEY` | Secret Access Key de R2 |
| `S3_BUCKET_NAME` | `biteops-images` |
| `S3_REGION` | `auto` |
| `S3_FORCE_PATH_STYLE` | `false` |
| `NODE_ENV` | `production` |

5. **Deploy** → esperar 5-10 min
6. Copiar URL (ej: `https://biteops-backend.koyeb.app`)

---

## PASO 5: Vercel (Frontend)

1. Ir a [vercel.com](https://vercel.com) → cuenta gratis → **Add New Project**
2. **Import Git Repository** → GitHub → seleccionar `Software-Restaurante`
3. Configuración:
   - **Framework Preset**: Vite
   - **Root Directory**: `front`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install --frozen-lockfile`
4. **Environment Variables**:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://biteops-backend.koyeb.app/api` |

5. **Deploy** → esperar 2-3 min
6. Copiar URL (ej: `https://biteops.vercel.app`)

---

## PASO 6: Actualizar CORS en Koyeb

Volver a Koyeb → app → **Environment Variables** → actualizar `CORS_ORIGIN` con URL de Vercel → **Redeploy**.

---

## PASO 7: Verificar

1. Abrir URL de Vercel → ver landing de BiteOps
2. Click "Iniciar Sesión" → seleccionar restaurante → login con `admin@restaurant.com` / `admin123`
3. Subir imagen de producto → verificar que se guarde en R2

---

## Variables de Entorno - Resumen

### Backend (Koyeb)
```env
PORT=3000
JWT_SECRET=biteops-secret-2026-xyz-123
CORS_ORIGIN=https://biteops.vercel.app
DATABASE_URL=postgresql://postgres.[project-id]:[password]@db.[project-id].supabase.co:5432/postgres
DB_DIALECT=postgres
REDIS_URL=https://[tu-db].upstash.io
REDIS_TOKEN=[tu-token]
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_ACCESS_KEY=[access-key]
S3_SECRET_KEY=[secret-key]
S3_BUCKET_NAME=biteops-images
S3_REGION=auto
S3_FORCE_PATH_STYLE=false
NODE_ENV=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://biteops-backend.koyeb.app/api
```

---

## Solución de Problemas

### Backend no arranca
- Verificar logs en Koyeb → **Logs**
- Comprobar que todas las variables de entorno estén correctas
- Verificar que Supabase esté activo

### CORS error en frontend
- Actualizar `CORS_ORIGIN` en Koyeb con URL exacta de Vercel
- Redeploy en Koyeb

### Imágenes no se suben
- Verificar credenciales de R2
- Verificar que el bucket tenga acceso público habilitado
- Comprobar `S3_FORCE_PATH_STYLE=false` para R2

### Redis no conecta
- Upstash gratis tiene límite de 10K comandos/día
- Si se agota, el backend funciona sin caché (más lento pero funcional)
