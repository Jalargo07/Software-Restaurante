<script setup lang="ts">
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSuperAdminAuthStore } from './stores/superAdminAuth'
import { useBrandingStore } from './stores/branding'
import { useSucursalStore } from './stores/sucursales'
import { ref, onMounted, computed, watch } from 'vue'
import ToastContainer from './components/common/ToastContainer.vue'
import Sidebar from './components/common/Sidebar.vue'

const authStore = useAuthStore()
const sucursalStore = useSucursalStore()
const saAuthStore = useSuperAdminAuthStore()
const brandingStore = useBrandingStore()
const router = useRouter()
const route = useRoute()

const theme = ref(localStorage.getItem('theme') || 'light')
const currentMode = ref<'produccion' | 'administracion' | 'cms'>('produccion')
const mobileMenuOpen = ref(false)

const isPublicRoute = computed(() => {
  return route.path === '/' || route.name === 'login' || route.name === 'tenant-login' || route.name === 'menu-qr' || route.name === 'super-admin-login'
})

const adminRoutes = ['/dashboard', '/admin', '/proveedores', '/compras', '/recetas', '/usuarios', '/auditoria', '/branding', '/sucursales', '/inventario', '/reportes', '/super-admin', '/cms', '/delivery/config']

const isAdministrationRoute = computed(() => {
  return adminRoutes.includes(route.path) || adminRoutes.some(r => r !== '/' && route.path.startsWith(r))
})

watch(
  () => route.path,
  (path) => {
    if (path === '/cms' || path.startsWith('/cms')) {
      currentMode.value = 'cms'
    } else if (adminRoutes.includes(path) || adminRoutes.some(r => r !== '/' && path.startsWith(r))) {
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
      await sucursalStore.fetchSucursales()
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

function labelPlan(plan: string) {
  const map: Record<string, string> = { basico: 'Básico', pro: 'Pro', enterprise: 'Enterprise' }
  return map[plan] || plan
}

function salir() {
  authStore.logout()
  saAuthStore.logout()
  router.push('/admin/login')
}

function cambiarSucursal() {
  window.location.reload()
}

const navItems = computed(() => {
    const items = [
      { path: '/mesas', icon: '🪑', label: 'Mesas', roles: ['admin', 'mesero', 'cajero'] },
      { path: '/pedidos', icon: '📋', label: 'Pedidos', roles: ['admin', 'mesero', 'cajero'] },
      { path: '/ventas', icon: '💰', label: 'Ventas', roles: ['admin', 'mesero', 'cajero'] },
      { path: '/caja', icon: '🏦', label: 'Caja', roles: ['admin', 'cajero'] },
      { path: '/delivery/pedidos', icon: '🛵', label: 'Delivery', roles: ['admin', 'mesero', 'cajero'] },
      { path: '/comandas', icon: '👨‍🍳', label: 'Cocina', roles: ['admin', 'mesero', 'cocinero'] },
      { path: '/admin', icon: '⚙️', label: 'Admin', roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
    ]
  return items.filter(item => item.roles.includes(authStore.user?.rol || ''))
})

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}
</script>

<template>
  <div
    v-if="isPublicRoute"
    class="min-h-screen"
  >
    <RouterView />
    <ToastContainer />
  </div>

  <div
    v-else
    :class="['flex flex-col', (authStore.isAuthenticated || saAuthStore.isAuthenticated) && (currentMode === 'administracion' || currentMode === 'cms' || isAdministrationRoute) ? 'md:grid md:grid-cols-[260px_1fr] min-h-screen' : 'min-h-screen']"
  >
    <Sidebar
      v-if="(authStore.isAuthenticated || saAuthStore.isAuthenticated) && (currentMode === 'administracion' || currentMode === 'cms' || isAdministrationRoute)"
      v-model="mobileMenuOpen"
      v-model:currentMode="currentMode"
      :theme="theme"
      @toggle-theme="toggleTheme"
      @logout="salir"
    />

    <div class="flex flex-col flex-1 min-w-0">
      <header v-if="authStore.isAuthenticated || saAuthStore.isAuthenticated" class="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button v-if="currentMode === 'administracion' || currentMode === 'cms' || isAdministrationRoute" class="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <img
          v-if="brandingStore.branding?.logo"
          :src="brandingStore.branding.logo"
          :alt="brandingStore.branding?.nombreCompleto || 'Logo'"
          class="h-8 w-auto object-contain"
        />
        <span v-if="brandingStore.branding?.nombreCompleto" class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ brandingStore.branding.nombreCompleto }}
        </span>
        <select v-if="sucursalStore.hasSucursales" v-model="sucursalStore.selectedId" @change="cambiarSucursal"
          class="ml-auto text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <option v-for="s in sucursalStore.sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
        </select>
      </header>

      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-24">
        <RouterView />
      </main>
    </div>

    <nav v-if="(authStore.isAuthenticated || saAuthStore.isAuthenticated) && !(currentMode === 'administracion' || currentMode === 'cms' || isAdministrationRoute)" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 rounded-2xl px-2 py-1.5 flex items-center gap-1 shadow-lg z-50 max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-hide">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors min-w-[64px]"
        :class="{ '!text-white !bg-[var(--color-primario)]': isActive(item.path) }"
      >
        <span class="text-lg leading-none">{{ item.icon }}</span>
        <span class="text-[10px] leading-tight">{{ item.label }}</span>
      </RouterLink>

      <button class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors min-w-[64px]" @click="toggleTheme" :title="theme === 'light' ? 'Modo oscuro' : 'Modo claro'">
        <span class="text-lg leading-none">{{ theme === 'light' ? '🌙' : '☀️' }}</span>
        <span class="text-[10px] leading-tight">Tema</span>
      </button>

      <div class="flex items-center gap-2 pl-2 ml-1 border-l border-gray-700 text-xs text-gray-400">
        <span>{{ authStore.user?.nombre }}</span>
        <span v-if="authStore.user?.plan" class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-300">{{ labelPlan(authStore.user.plan) }}</span>
        <button class="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs transition-colors" @click="salir">Salir</button>
      </div>
    </nav>
    <ToastContainer />
  </div>
</template>
