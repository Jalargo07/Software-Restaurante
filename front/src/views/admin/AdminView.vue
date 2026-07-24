<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const rol = computed(() => authStore.user?.rol || '')

const menuItems = [
  { title: 'Dashboard', desc: 'Estadísticas y gráficos generales', path: '/', icon: '📊', roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
  { title: 'Proveedores', desc: 'Gestión de proveedores y compras', path: '/proveedores', icon: '🏢', roles: ['admin', 'mesero'] },
  { title: 'Compras', desc: 'Órdenes de compra e insumos', path: '/compras', icon: '🛒', roles: ['admin'] },
  { title: 'Recetas', desc: 'Recetas de productos compuestos', path: '/recetas', icon: '📖', roles: ['admin'] },
  { title: 'Usuarios', desc: 'Gestión de usuarios y accesos', path: '/usuarios', icon: '👥', roles: ['admin'] },
  { title: 'Auditoría', desc: 'Logs y registros del sistema', path: '/auditoria', icon: '📋', roles: ['admin'] },
  { title: 'Branding', desc: 'Configuración de marca y logo', path: '/branding', icon: '🎨', roles: ['admin'] },
]

const itemsVisibles = computed(() => {
  return menuItems.filter(item => item.roles.includes(rol.value))
})
</script>

<template>
  <div class="px-4 py-6 max-w-6xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Panel de Administración y Supervisión</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in itemsVisibles"
        :key="item.path"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
        @click="router.push(item.path)"
      >
        <div class="flex items-center gap-4">
          <div class="text-4xl shrink-0">{{ item.icon }}</div>
          <div class="min-w-0">
            <h5 class="text-base font-semibold text-gray-900 dark:text-white mb-0.5">{{ item.title }}</h5>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-0">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
