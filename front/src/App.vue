<script setup lang="ts">
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const theme = ref(localStorage.getItem('theme') || 'light')

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
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

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/mesas', icon: '🪑', label: 'Mesas' },
  { path: '/pedidos', icon: '📋', label: 'Pedidos' },
  { path: '/inventario', icon: '📦', label: 'Inventario' },
  { path: '/compras', icon: '🛒', label: 'Compras' },
  { path: '/ventas', icon: '💰', label: 'Ventas' },
  { path: '/proveedores', icon: '🏢', label: 'Proveedores' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="app-layout">
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
  </div>
</template>
