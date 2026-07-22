<script setup lang="ts">
</script>

<template>
  <div class="container mt-4">
    <h1>Sistema de Restaurante</h1>
    <div class="row mt-4">
      <div class="col-md-3">
        <router-link to="/mesas" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Mesas</h5>
            <p class="card-text">Gestionar mesas del restaurante</p>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/inventario" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Inventario</h5>
            <p class="card-text">Control de productos</p>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/compras" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Compras</h5>
            <p class="card-text">Registrar compras</p>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/ventas" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Ventas</h5>
            <p class="card-text">Historial de ventas</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
