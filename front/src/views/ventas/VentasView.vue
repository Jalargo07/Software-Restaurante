<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const ventas = ref<any[]>([])

onMounted(async () => {
  const { data } = await api.get('/ventas')
  ventas.value = data
})
</script>

<template>
  <div class="container mt-4">
    <h2>Historial de Ventas</h2>

    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Mesa</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Metodo Pago</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in ventas" :key="v.id">
          <td>{{ v.id }}</td>
          <td>Mesa #{{ v.Mesa?.numero }}</td>
          <td>{{ new Date(v.fecha).toLocaleDateString() }}</td>
          <td>${{ v.total }}</td>
          <td>{{ v.metodoPago || '-' }}</td>
          <td>
            <span :class="`badge bg-${v.estado === 'cerrada' ? 'success' : 'warning'}`">
              {{ v.estado }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
