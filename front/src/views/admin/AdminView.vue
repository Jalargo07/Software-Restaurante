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
  <div class="container mt-4">
    <h2 class="mb-4">Panel de Administración y Supervisión</h2>
    <div class="row g-3">
      <div v-for="item in itemsVisibles" :key="item.path" class="col-12 col-md-4">
        <div class="card border-0 shadow-sm h-100 cursor-pointer admin-card" @click="router.push(item.path)">
          <div class="card-body d-flex align-items-center">
            <div class="fs-1 me-3">{{ item.icon }}</div>
            <div>
              <h5 class="card-title mb-1">{{ item.title }}</h5>
              <p class="card-text text-muted small mb-0">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.admin-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.1) !important;
}
</style>
