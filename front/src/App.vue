<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Restaurante</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto" v-if="authStore.isAuthenticated">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/mesas">Mesas</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/pedidos">Pedidos</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/inventario">Inventario</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/compras">Compras</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/ventas">Ventas</RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav" v-if="authStore.isAuthenticated">
          <li class="nav-item">
            <span class="nav-link text-light">{{ authStore.user?.nombre }} ({{ authStore.user?.rol }})</span>
          </li>
          <li class="nav-item">
            <button class="nav-link btn btn-link text-light" @click="authStore.logout()">Salir</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <RouterView />
</template>
