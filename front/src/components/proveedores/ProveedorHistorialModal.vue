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
    <span class="spinner-border text-primary"></span>
  </div>

  <template v-else-if="historial">
    <div class="row g-3 mb-3">
      <div class="col-6">
        <div class="card border-0 bg-light">
          <div class="card-body text-center py-2">
            <div class="fs-4 fw-bold text-primary">{{ historial.resumen?.totalCompras || 0 }}</div>
            <div class="text-muted small">Total Compras</div>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="card border-0 bg-light">
          <div class="card-body text-center py-2">
            <div class="fs-4 fw-bold text-success">${{ Number(historial.resumen?.montoTotal || 0).toFixed(2) }}</div>
            <div class="text-muted small">Monto Total</div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm btn-success" @click="exportarExcel" :disabled="loading">
        Exportar Excel
      </button>
    </div>

    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in (historial.compras || [])" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ new Date(c.fecha || c.createdAt).toLocaleDateString() }}</td>
          <td>
            <span :class="`badge bg-${c.estado === 'recibida' ? 'success' : c.estado === 'cancelada' ? 'danger' : 'warning'}`">
              {{ c.estado }}
            </span>
          </td>
          <td>${{ c.total }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="!historial.compras?.length" class="text-center text-muted py-3">
      No hay compras registradas para este proveedor
    </div>
  </template>

  <div class="modal-footer px-0">
    <button class="btn btn-secondary" @click="emit('cerrar')">Cerrar</button>
  </div>
</template>
