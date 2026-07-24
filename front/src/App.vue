<script setup lang="ts">
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useBrandingStore } from './stores/branding'
import { ref, onMounted, computed, watch } from 'vue'
import ToastContainer from './components/common/ToastContainer.vue'
import Sidebar from './components/common/Sidebar.vue'

const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const router = useRouter()
const route = useRoute()

const theme = ref(localStorage.getItem('theme') || 'light')
const currentMode = ref<'produccion' | 'administracion'>('produccion')

const adminRoutes = ['/', '/admin', '/proveedores', '/compras', '/recetas', '/usuarios', '/auditoria', '/branding']

const isAdministrationRoute = computed(() => {
  return adminRoutes.includes(route.path) || adminRoutes.some(r => r !== '/' && route.path.startsWith(r))
})

watch(
  () => route.path,
  (path) => {
    if (adminRoutes.includes(path) || adminRoutes.some(r => r !== '/' && path.startsWith(r))) {
      currentMode.value = 'administracion'
    } else {
      currentMode.value = 'produccion'
    }
  },
  { immediate: true }
)

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
    // fallback
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
    { path: '/mesas', icon: '🪑', label: 'Mesas', roles: ['admin', 'mesero', 'cajero'] },
    { path: '/pedidos', icon: '📋', label: 'Pedidos', roles: ['admin', 'mesero', 'cajero'] },
    { path: '/inventario', icon: '📦', label: 'Inventario', roles: ['admin', 'mesero'] },
    { path: '/ventas', icon: '💰', label: 'Ventas', roles: ['admin', 'mesero', 'cajero'] },
    { path: '/caja', icon: '🏦', label: 'Caja', roles: ['admin', 'cajero'] },
    { path: '/comandas', icon: '👨‍🍳', label: 'Cocina', roles: ['admin', 'mesero', 'cocinero'] },
    { path: '/admin', icon: '⚙️', label: 'Admin', roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
  ]
  return items.filter(item => item.roles.includes(authStore.user?.rol || ''))
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="app-layout" :class="{ 'with-sidebar': authStore.isAuthenticated && (currentMode === 'administracion' || isAdministrationRoute) }">
    <Sidebar
      v-if="authStore.isAuthenticated && (currentMode === 'administracion' || isAdministrationRoute)"
      v-model:currentMode="currentMode"
      :theme="theme"
      @toggle-theme="toggleTheme"
      @logout="salir"
    />

    <div class="app-main-wrapper">
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
    </div>

    <nav v-if="authStore.isAuthenticated && !(currentMode === 'administracion' || isAdministrationRoute)" class="bottom-nav">
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
