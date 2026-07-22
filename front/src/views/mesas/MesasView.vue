<script setup lang="ts">
import { onMounted } from 'vue'
import { useMesaStore } from '../../stores/mesas'

const mesaStore = useMesaStore()

onMounted(() => {
  mesaStore.fetchMesas()
})

function estadoColor(estado: string) {
  const colors: Record<string, string> = {
    disponible: 'success',
    ocupada: 'danger',
    reservada: 'warning',
    mantenimiento: 'secondary',
  }
  return colors[estado] || 'primary'
}
</script>

<template>
  <div class="container mt-4">
    <h2>Gestion de Mesas</h2>
    <div class="row mt-3" v-if="mesaStore.mesas.length">
      <div class="col-md-3 mb-3" v-for="mesa in mesaStore.mesas" :key="mesa.id">
        <div class="card">
          <div class="card-body text-center">
            <h5>Mesa #{{ mesa.numero }}</h5>
            <p>Capacidad: {{ mesa.capacidad }} personas</p>
            <span :class="`badge bg-${estadoColor(mesa.estado)}`">
              {{ mesa.estado }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-4">
      <p>No hay mesas registradas</p>
    </div>
  </div>
</template>
