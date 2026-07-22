<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const compras = ref<any[]>([])

onMounted(async () => {
  const { data } = await api.get('/compras')
  compras.value = data
})
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Compras</h2>
      <button class="btn btn-primary">+ Nueva Compra</button>
    </div>

    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Proveedor</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in compras" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.proveedor }}</td>
          <td>{{ new Date(c.fecha).toLocaleDateString() }}</td>
          <td>${{ c.total }}</td>
          <td>
            <span :class="`badge bg-${c.estado === 'recibida' ? 'success' : c.estado === 'cancelada' ? 'danger' : 'warning'}`">
              {{ c.estado }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
