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
  if (a.includes('crear') || a.includes('create')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (a.includes('editar') || a.includes('update')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (a.includes('eliminar') || a.includes('delete')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  if (a.includes('cobrar')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
  if (a.includes('recibir')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  if (a.includes('cancelar')) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
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
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Auditoría</h2>
      <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="exportarLogs" :disabled="exportando">
        <span v-if="exportando" class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
        Exportar Excel
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-2 mt-3 items-end">
      <div class="md:col-span-3">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Usuario</label>
        <input type="text" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="filtroUsuario" placeholder="Email o nombre..." />
      </div>
      <div class="md:col-span-2">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entidad</label>
        <select class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="filtroEntidad">
          <option value="">Todos</option>
          <option value="Venta">Venta</option>
          <option value="Compra">Compra</option>
          <option value="Producto">Producto</option>
          <option value="Proveedor">Proveedor</option>
          <option value="Usuario">Usuario</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desde</label>
        <input type="date" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="filtroDesde" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
        <input type="date" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="filtroHasta" />
      </div>
      <div class="md:col-span-3 flex gap-2">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="aplicarFiltros">Buscar</button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="filtroUsuario = ''; filtroEntidad = ''; filtroDesde = ''; filtroHasta = ''; auditoriaStore.page = 1; auditoriaStore.fetchLogs()">Limpiar</button>
      </div>
    </div>

    <div v-if="auditoriaStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600"></span>
    </div>

    <template v-else>
      <div class="overflow-x-auto mt-3">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="log in auditoriaStore.logs" :key="log.id" class="hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ new Date(log.createdAt).toLocaleString() }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ log.usuario || log.usuarioEmail || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', badgeClass(log.accion)]">{{ log.accion }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ log.entidad || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ log.entidadId || log.registroId || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"><JsonViewer :data="log.detalles || log.descripcion" :entidad="log.entidad" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!auditoriaStore.logs.length" class="text-center text-gray-500 dark:text-gray-400 py-4">
        No hay logs de auditoría
      </div>

      <div class="flex items-center justify-between mt-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">Página {{ auditoriaStore.page }} de {{ auditoriaStore.totalPages }} ({{ auditoriaStore.total }} registros)</span>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button class="px-3 py-1.5 text-xs border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50" :disabled="auditoriaStore.page <= 1" @click="anterior">Anterior</button>
          <button class="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50" :disabled="auditoriaStore.page >= auditoriaStore.totalPages" @click="siguiente">Siguiente</button>
        </div>
      </div>
    </template>
  </div>
</template>
