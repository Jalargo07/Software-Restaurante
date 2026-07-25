<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useReporteStore } from '../stores/reportes'
import Multiselect from '../components/common/Multiselect.vue'
import api from '../services/api'

const reporteStore = useReporteStore()
const productos = ref<{ id: string | number, label: string }[]>([])

onMounted(async () => {
  // Fetch products for the multiselect
  const { data } = await api.get('/productos')
  productos.value = (data.data || data).map((p: any) => ({ id: p.id, label: p.nombre }))
  
  // Initial fetch
  reporteStore.fetchAll({ fechaDesde: reporteStore.fechaDesde, fechaHasta: reporteStore.fechaHasta, productoIds: reporteStore.productoIds })
})

const aplicarFiltros = () => {
  reporteStore.fetchAll({ 
    fechaDesde: reporteStore.fechaDesde, 
    fechaHasta: reporteStore.fechaHasta, 
    productoIds: reporteStore.productoIds 
  })
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <h1 class="text-2xl font-bold mb-4">Reportes Detallados</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4 flex gap-4 items-end">
      <div class="w-full md:w-1/3">
        <label class="block text-sm font-medium mb-1">Productos</label>
        <Multiselect v-model="reporteStore.productoIds" :options="productos" placeholder="Seleccionar productos" />
      </div>
      <button @click="aplicarFiltros" class="px-4 py-2 bg-[var(--color-primario)] text-white rounded-lg">Filtrar</button>
    </div>
  </div>
</template>
