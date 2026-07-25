<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  currentMode: 'produccion' | 'administracion'
  theme: string
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:currentMode', mode: 'produccion' | 'administracion'): void
  (e: 'toggle-theme'): void
  (e: 'logout'): void
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const rol = computed(() => authStore.user?.rol || '')

const produccionItems = [
  { path: '/mesas', icon: '🪑', label: 'Mesas', roles: ['admin', 'mesero', 'cajero'] },
  { path: '/pedidos', icon: '📋', label: 'Pedidos', roles: ['admin', 'mesero', 'cajero'] },
  { path: '/ventas', icon: '💰', label: 'Ventas', roles: ['admin', 'mesero', 'cajero'] },
  { path: '/caja', icon: '🏦', label: 'Caja', roles: ['admin', 'cajero'] },
  { path: '/comandas', icon: '👨‍🍳', label: 'Cocina', roles: ['admin', 'mesero', 'cocinero'] },
]

const administracionItems = [
  { path: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
  { path: '/inventario', icon: '📦', label: 'Inventario', roles: ['admin'] },
  { path: '/proveedores', icon: '🏢', label: 'Proveedores', roles: ['admin'] },
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
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 z-40 md:hidden" @click="emit('update:modelValue', false)"></div>
  <aside class="w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 md:sticky md:top-0 overflow-hidden h-screen md:h-screen transform transition-transform md:translate-x-0" :class="modelValue ? 'translate-x-0' : 'max-md:-translate-x-full'">
    <div class="p-4 border-b border-gray-700">
      <div class="flex rounded-lg bg-gray-800 p-1">
        <button
          class="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="currentMode === 'produccion' ? 'bg-[var(--color-primario)] text-white' : 'text-gray-400 hover:text-white'"
          @click="setMode('produccion')"
        >
          Producción
        </button>
        <button
          class="flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="currentMode === 'administracion' ? 'bg-[var(--color-primario)] text-white' : 'text-gray-400 hover:text-white'"
          @click="setMode('administracion')"
        >
          Admin
        </button>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <router-link
        v-for="item in visibleItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        :class="{ 'bg-[var(--color-primario)] text-white hover:brightness-90': isActive(item.path) }"
      >
        <span>{{ item.icon }}</span>
        <span class="text-sm">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="p-4 border-t border-gray-700">
      <div class="flex items-center gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ authStore.user?.nombre }}</p>
          <span class="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{{ authStore.user?.rol }}</span>
        </div>
      </div>
      <div class="space-y-1">
        <button class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" @click="$emit('toggle-theme')" :title="theme === 'light' ? 'Modo oscuro' : 'Modo claro'">
          <span>{{ theme === 'light' ? '🌙' : '☀️' }}</span>
          <span>Tema</span>
        </button>
        <button class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-600 hover:text-white transition-colors" @click="$emit('logout')" title="Cerrar sesión">
          <span>🚪</span>
          <span>Salir</span>
        </button>
      </div>
    </div>
  </aside>
</template>
