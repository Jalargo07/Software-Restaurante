<script setup lang="ts">
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useBrandingStore } from './stores/branding'
import { ref, onMounted, computed } from 'vue'
import ToastContainer from './components/common/ToastContainer.vue'

const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const router = useRouter()
const route = useRoute()

const theme = ref(localStorage.getItem('theme') || 'light')

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', theme.value)

  try {
    if (authStore.isAuthenticated) {
      await brandingStore.fetchBranding()
    }
    const b = brandingStore.branding
    if (b) {
      document.documentElement.style.setProperty('--color-primario', b.colorPrimario)
      document.documentElement.style.setProperty('--color-secundario', b.colorSecundario)
      document.documentElement.style.setProperty('--color-acento', b.colorAcento)
      document.documentElement.style.setProperty('--font-principal', `'${b.fontPrincipal}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
      if (b.nombreCompleto) {
        document.title = b.nombreCompleto
      }
    }
  } catch {
    // fallback: se mantienen los valores por defecto de :root
  }
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

function salir() {
  authStore.logout()
  router.push('/login')
}

const navItems = computed(() => {
  const items = [
    { path: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
    { path: '/mesas', icon: '🪑', label: 'Mesas', roles: ['admin', 'mesero', 'cajero'] },
    { path: '/pedidos', icon: '📋', label: 'Pedidos', roles: ['admin', 'mesero', 'cajero'] },
    { path: '/inventario', icon: '📦', label: 'Inventario', roles: ['admin', 'mesero'] },
    { path: '/compras', icon: '🛒', label: 'Compras', roles: ['admin'] },
    { path: '/ventas', icon: '💰', label: 'Ventas', roles: ['admin', 'mesero', 'cajero'] },
    { path: '/caja', icon: '🏦', label: 'Caja', roles: ['admin', 'cajero'] },
    { path: '/proveedores', icon: '🏢', label: 'Proveedores', roles: ['admin', 'mesero'] },
    { path: '/comandas', icon: '👨‍🍳', label: 'Cocina', roles: ['admin', 'mesero', 'cocinero'] },
    { path: '/recetas', icon: '📖', label: 'Recetas', roles: ['admin'] },
    { path: '/usuarios', icon: '👥', label: 'Usuarios', roles: ['admin'] },
    { path: '/auditoria', icon: '📋', label: 'Auditoría', roles: ['admin'] },
  ]
  return items.filter(item => item.roles.includes(authStore.user?.rol || ''))
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="app-layout">
    <header v-if="authStore.isAuthenticated && brandingStore.branding" class="app-header">
      <img
        v-if="brandingStore.branding.logo"
        :src="brandingStore.branding.logo"
        :alt="brandingStore.branding.nombreCompleto || 'Logo'"
        class="header-logo"
      />
      <span v-if="brandingStore.branding.nombreCompleto" class="header-name">
        {{ brandingStore.branding.nombreCompleto }}
      </span>
    </header>

    <main class="main-content">
      <div class="content-container">
        <RouterView />
      </div>
    </main>

    <nav v-if="authStore.isAuthenticated" class="bottom-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>

      <button class="theme-btn" @click="toggleTheme" :title="theme === 'light' ? 'Modo oscuro' : 'Modo claro'">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>

      <div class="user-section">
        <span>{{ authStore.user?.nombre }}</span>
        <button class="logout-btn" @click="salir">Salir</button>
      </div>
    </nav>
    <ToastContainer />
  </div>
</template>
