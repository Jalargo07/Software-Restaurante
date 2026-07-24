<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  currentMode: 'produccion' | 'administracion'
  theme: string
}>()

const emit = defineEmits<{
  (e: 'update:currentMode', mode: 'produccion' | 'administracion'): void
  (e: 'toggle-theme'): void
  (e: 'logout'): void
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const rol = computed(() => authStore.user?.rol || '')

const produccionItems = [
  { path: '/mesas', icon: '🪑', label: 'Mesas', roles: ['admin', 'mesero', 'cajero'] },
  { path: '/pedidos', icon: '📋', label: 'Pedidos', roles: ['admin', 'mesero', 'cajero'] },
  { path: '/inventario', icon: '📦', label: 'Inventario', roles: ['admin', 'mesero'] },
  { path: '/ventas', icon: '💰', label: 'Ventas', roles: ['admin', 'mesero', 'cajero'] },
  { path: '/caja', icon: '🏦', label: 'Caja', roles: ['admin', 'cajero'] },
  { path: '/comandas', icon: '👨‍🍳', label: 'Cocina', roles: ['admin', 'mesero', 'cocinero'] },
]

const administracionItems = [
  { path: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
  { path: '/proveedores', icon: '🏢', label: 'Proveedores', roles: ['admin', 'mesero'] },
  { path: '/compras', icon: '🛒', label: 'Compras', roles: ['admin'] },
  { path: '/recetas', icon: '📖', label: 'Recetas', roles: ['admin'] },
  { path: '/usuarios', icon: '👥', label: 'Usuarios', roles: ['admin'] },
  { path: '/auditoria', icon: '📋', label: 'Auditoría', roles: ['admin'] },
  { path: '/branding', icon: '🎨', label: 'Branding', roles: ['admin'] },
]

const visibleItems = computed(() => {
  const items = props.currentMode === 'produccion' ? produccionItems : administracionItems
  return items.filter(item => item.roles.includes(rol.value))
})

function setMode(mode: 'produccion' | 'administracion') {
  emit('update:currentMode', mode)
  if (mode === 'produccion') {
    router.push('/mesas')
  } else {
    router.push('/')
  }
}

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-mode-selector">
        <button
          class="mode-btn"
          :class="{ active: currentMode === 'produccion' }"
          @click="setMode('produccion')"
        >
          Producción
        </button>
        <button
          class="mode-btn"
          :class="{ active: currentMode === 'administracion' }"
          @click="setMode('administracion')"
        >
          Admin
        </button>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in visibleItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="sidebar-icon">{{ item.icon }}</span>
        <span class="sidebar-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <span class="user-name">{{ authStore.user?.nombre }}</span>
        <span class="user-role badge bg-secondary">{{ authStore.user?.rol }}</span>
      </div>
      <div class="sidebar-actions">
        <button class="sidebar-action-btn" @click="$emit('toggle-theme')" :title="theme === 'light' ? 'Modo oscuro' : 'Modo claro'">
          {{ theme === 'light' ? '🌙 <span>Tema</span>' : '☀️ <span>Tema</span>' }}
        </button>
        <button class="sidebar-action-btn logout" @click="$emit('logout')" title="Cerrar sesión">
          🚪 <span>Salir</span>
        </button>
      </div>
    </div>
  </aside>
</template>
