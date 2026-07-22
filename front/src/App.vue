<script setup lang="ts">
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()

function salir() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="d-flex" style="height: 100vh;">
    <nav v-if="authStore.isAuthenticated" class="d-flex flex-column bg-dark text-white p-3"
      style="width: 220px; flex-shrink: 0;">
      <h5 class="text-center mb-4 mt-2">Restaurante</h5>

      <ul class="nav flex-column flex-grow-1">
        <li class="nav-item">
          <RouterLink class="nav-link text-white" to="/mesas">Mesas</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-white" to="/pedidos">Pedidos</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-white" to="/inventario">Inventario</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-white" to="/compras">Compras</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-white" to="/ventas">Ventas</RouterLink>
        </li>
      </ul>

      <div class="border-top border-secondary pt-2 mt-auto">
        <small class="d-block text-center">{{ authStore.user?.nombre }} ({{ authStore.user?.rol }})</small>
        <button class="btn btn-outline-light btn-sm w-100 mt-1" @click="salir">Salir</button>
      </div>
    </nav>

    <main class="flex-grow-1 overflow-auto" style="background: #f5f5f5;">
      <RouterView />
    </main>
  </div>
</template>
