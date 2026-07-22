<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'

const stats = ref({
  mesasDisponibles: 0,
  mesasOcupadas: 0,
  productosBajoStock: 0,
  totalProductos: 0,
  ventasHoy: 0,
  ventasTotal: 0,
  pedidosActivos: 0,
})

onMounted(async () => {
  const [mesas, productos, ventas, pedidos] = await Promise.all([
    api.get('/mesas'),
    api.get('/productos'),
    api.get('/ventas'),
    api.get('/ventas?estado=abierta'),
  ])

  stats.value = {
    mesasDisponibles: mesas.data.filter((m: any) => m.estado === 'disponible').length,
    mesasOcupadas: mesas.data.filter((m: any) => m.estado === 'ocupada').length,
    productosBajoStock: productos.data.filter((p: any) => p.stock <= p.stockMinimo).length,
    totalProductos: productos.data.length,
    ventasHoy: ventas.data.filter((v: any) => {
      const hoy = new Date()
      const fechaV = new Date(v.fecha)
      return fechaV.toDateString() === hoy.toDateString()
    }).length,
    ventasTotal: ventas.data.length,
    pedidosActivos: pedidos.data.length,
  }
})
</script>

<template>
  <div class="container mt-4">
    <h1>Dashboard - Restaurante</h1>

    <div class="row mt-4">
      <div class="col-md-3 mb-3">
        <div class="card border-success">
          <div class="card-body text-center">
            <h3 class="text-success">{{ stats.mesasDisponibles }}</h3>
            <p class="card-text">Mesas Disponibles</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card border-danger">
          <div class="card-body text-center">
            <h3 class="text-danger">{{ stats.mesasOcupadas }}</h3>
            <p class="card-text">Mesas Ocupadas</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card border-warning">
          <div class="card-body text-center">
            <h3 class="text-warning">{{ stats.productosBajoStock }}</h3>
            <p class="card-text">Productos con Stock Bajo</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card border-info">
          <div class="card-body text-center">
            <h3 class="text-info">{{ stats.pedidosActivos }}</h3>
            <p class="card-text">Pedidos Activos</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-3 mb-3">
        <router-link to="/mesas" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Gestionar Mesas</h5>
            <p>{{ stats.mesasDisponibles }} disponibles / {{ stats.mesasOcupadas }} ocupadas</p>
          </div>
        </router-link>
      </div>
      <div class="col-md-3 mb-3">
        <router-link to="/pedidos" class="card text-decoration-none text-dark border-danger">
          <div class="card-body text-center">
            <h5 class="card-title text-danger">Pedidos Activos</h5>
            <p>{{ stats.pedidosActivos }} mesas con cuenta abierta</p>
          </div>
        </router-link>
      </div>
      <div class="col-md-3 mb-3">
        <router-link to="/inventario" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Inventario</h5>
            <p>{{ stats.totalProductos }} productos</p>
          </div>
        </router-link>
      </div>
      <div class="col-md-3 mb-3">
        <router-link to="/compras" class="card text-decoration-none text-dark">
          <div class="card-body text-center">
            <h5 class="card-title">Compras</h5>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
