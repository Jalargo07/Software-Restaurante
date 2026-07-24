<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuditoriaStore } from '../../stores/auditoria'
import { useToastStore } from '../../stores/toast'
import { useExcelExport } from '../../composables/useExcelExport'
import JsonViewer from '../../components/common/JsonViewer.vue'

const auditoriaStore = useAuditoriaStore()
const toast = useToastStore()
const { descargarExcel } = useExcelExport()

const filtroUsuario = ref('')
const filtroEntidad = ref('')
const filtroDesde = ref('')
const filtroHasta = ref('')
const exportando = ref(false)

onMounted(() => {
  auditoriaStore.fetchLogs()
})

function aplicarFiltros() {
  auditoriaStore.page = 1
  auditoriaStore.fetchLogs({
    usuario: filtroUsuario.value,
    entidad: filtroEntidad.value,
    desde: filtroDesde.value,
    hasta: filtroHasta.value,
  })
}

function anterior() {
  auditoriaStore.fetchPrevPage()
}

function siguiente() {
  auditoriaStore.fetchNextPage()
}

function badgeClass(accion: string): string {
  const a = accion?.toLowerCase() || ''
  if (a.includes('crear') || a.includes('create')) return 'bg-success'
  if (a.includes('editar') || a.includes('update')) return 'bg-primary'
  if (a.includes('eliminar') || a.includes('delete')) return 'bg-danger'
  if (a.includes('cobrar')) return 'bg-info'
  if (a.includes('recibir')) return 'bg-warning text-dark'
  if (a.includes('cancelar')) return 'bg-secondary'
  return 'bg-info'
}

async function exportarLogs() {
  exportando.value = true
  try {
    let params = 'auditoria'
    const queryParts: string[] = []
    if (filtroUsuario.value) queryParts.push(`usuario=${filtroUsuario.value}`)
    if (filtroEntidad.value) queryParts.push(`entidad=${filtroEntidad.value}`)
    if (filtroDesde.value) queryParts.push(`desde=${filtroDesde.value}`)
    if (filtroHasta.value) queryParts.push(`hasta=${filtroHasta.value}`)
    if (queryParts.length) params += '?' + queryParts.join('&')
    const hoy = new Date().toISOString().slice(0, 10)
    await descargarExcel(params, `auditoria_${hoy}.xlsx`)
    toast.success('Logs exportados')
  } catch {
    toast.error('Error al exportar logs')
  } finally {
    exportando.value = false
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Auditoría</h2>
      <button class="btn btn-success" @click="exportarLogs" :disabled="exportando">
        <span v-if="exportando" class="spinner-border spinner-border-sm me-1"></span>
        Exportar Excel
      </button>
    </div>

    <div class="row g-2 mt-3 align-items-end">
      <div class="col-md-3">
        <label class="form-label small">Usuario</label>
        <input type="text" class="form-control" v-model="filtroUsuario" placeholder="Email o nombre..." />
      </div>
      <div class="col-md-2">
        <label class="form-label small">Entidad</label>
        <select class="form-select" v-model="filtroEntidad">
          <option value="">Todos</option>
          <option value="Venta">Venta</option>
          <option value="Compra">Compra</option>
          <option value="Producto">Producto</option>
          <option value="Proveedor">Proveedor</option>
          <option value="Usuario">Usuario</option>
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label small">Desde</label>
        <input type="date" class="form-control" v-model="filtroDesde" />
      </div>
      <div class="col-md-2">
        <label class="form-label small">Hasta</label>
        <input type="date" class="form-control" v-model="filtroHasta" />
      </div>
      <div class="col-md-3">
        <button class="btn btn-primary me-2" @click="aplicarFiltros">Buscar</button>
        <button class="btn btn-outline-secondary" @click="filtroUsuario = ''; filtroEntidad = ''; filtroDesde = ''; filtroHasta = ''; auditoriaStore.page = 1; auditoriaStore.fetchLogs()">Limpiar</button>
      </div>
    </div>

    <div v-if="auditoriaStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <template v-else>
      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>ID</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in auditoriaStore.logs" :key="log.id">
            <td>{{ new Date(log.createdAt).toLocaleString() }}</td>
            <td>{{ log.usuario || log.usuarioEmail || '-' }}</td>
            <td><span :class="`badge ${badgeClass(log.accion)}`">{{ log.accion }}</span></td>
            <td>{{ log.entidad || '-' }}</td>
            <td>{{ log.entidadId || log.registroId || '-' }}</td>
            <td><JsonViewer :data="log.detalles || log.descripcion" /></td>
          </tr>
        </tbody>
      </table>

      <div v-if="!auditoriaStore.logs.length" class="text-center text-muted py-4">
        No hay logs de auditoría
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">Página {{ auditoriaStore.page }} de {{ auditoriaStore.totalPages }} ({{ auditoriaStore.total }} registros)</span>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" :disabled="auditoriaStore.page <= 1" @click="anterior">Anterior</button>
          <button class="btn btn-sm btn-outline-primary" :disabled="auditoriaStore.page >= auditoriaStore.totalPages" @click="siguiente">Siguiente</button>
        </div>
      </div>
    </template>
  </div>
</template>
