<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Restaurante</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/mesas">Mesas</RouterLink>
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
      </div>
    </div>
  </nav>
  <RouterView />
</template>
