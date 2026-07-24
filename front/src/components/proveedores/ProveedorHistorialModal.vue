<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'
import { useExcelExport } from '../../composables/useExcelExport'

const props = defineProps<{
  proveedorId: number
  proveedorNombre: string
}>()

const emit = defineEmits<{
  cerrar: []
}>()

const toast = useToastStore()
const { descargarExcel } = useExcelExport()

const loading = ref(true)
const historial = ref<any>(null)

onMounted(async () => {
  try {
    const { data } = await api.get(`/proveedores/${props.proveedorId}/historial`)
    historial.value = data
  } catch {
    toast.error('Error al cargar historial')
    emit('cerrar')
  } finally {
    loading.value = false
  }
})

async function exportarExcel() {
  try {
    const hoy = new Date().toISOString().slice(0, 10)
    await descargarExcel(`proveedores/${props.proveedorId}/historial`, `historial_${props.proveedorNombre}_${hoy}.xlsx`)
    toast.success('Excel descargado')
  } catch {
    toast.error('Error al exportar')
  }
}
</script>

<template>
  <div v-if="loading" class="text-center py-4">
    <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
  </div>

  <template v-else-if="historial">
    <div class="grid grid-cols-12 gap-3 mb-3">
      <div class="col-span-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div class="text-center py-3 px-4">
            <div class="text-2xl font-bold text-[var(--color-primario)] dark:text-blue-400">{{ historial.resumen?.totalCompras || 0 }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Total Compras</div>
          </div>
        </div>
      </div>
      <div class="col-span-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div class="text-center py-3 px-4">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">${{ Number(historial.resumen?.montoTotal || 0).toFixed(2) }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Monto Total</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end mb-2">
      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" @click="exportarExcel" :disabled="loading">
        Exportar Excel
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
          <tr v-for="c in (historial.compras || [])" :key="c.id">
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">{{ c.id }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">{{ new Date(c.fecha || c.createdAt).toLocaleDateString() }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">
              <span :class="c.estado === 'recibida' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : c.estado === 'cancelada' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'">
                {{ c.estado }}
              </span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">${{ c.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!historial.compras?.length" class="text-center text-gray-500 dark:text-gray-400 py-3">
      No hay compras registradas para este proveedor
    </div>
  </template>

  <div class="flex justify-end mt-4">
    <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors" @click="emit('cerrar')">Cerrar</button>
  </div>
</template>
