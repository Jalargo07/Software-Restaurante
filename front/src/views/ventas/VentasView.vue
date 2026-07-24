<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVentaStore } from '../../stores/ventas'
import { useReporteStore } from '../../stores/reportes'
import { useToastStore } from '../../stores/toast'
import { useRoles } from '../../composables/useRoles'
import ModalBase from '../../components/common/ModalBase.vue'
import VentaFormModal from '../../components/ventas/VentaFormModal.vue'
import VentaDetailModal from '../../components/ventas/VentaDetailModal.vue'

const router = useRouter()
const ventaStore = useVentaStore()
const reporteStore = useReporteStore()
const toast = useToastStore()
const { isAdmin, isMesero } = useRoles()
const modalFormAbierto = ref(false)
const detalleVenta = ref<any>(null)
const filtroEstado = ref('')
const filtroDesde = ref('')
const filtroHasta = ref('')
const paginaActual = ref(1)

onMounted(() => {
  cargarVentas()
})

function cargarVentas() {
  ventaStore.fetchVentas(paginaActual.value, 10, filtroEstado.value || undefined)
}

function filtrar() {
  paginaActual.value = 1
  cargarVentas()
}

watch(paginaActual, () => {
  cargarVentas()
})

watch(filtroEstado, () => {
  paginaActual.value = 1
  cargarVentas()
})

const ventasFiltradas = computed(() => {
  let res = ventaStore.ventas
  if (filtroDesde.value) {
    res = res.filter(v => new Date(v.createdAt) >= new Date(filtroDesde.value))
  }
  if (filtroHasta.value) {
    const hasta = new Date(filtroHasta.value)
    hasta.setHours(23, 59, 59, 999)
    res = res.filter(v => new Date(v.createdAt) <= hasta)
  }
  return res
})

function continuarVenta(v: any) {
  router.push('/pedidos')
}

async function exportarExcel() {
  try {
    await reporteStore.exportarVentasExcel(filtroDesde.value || undefined, filtroHasta.value || undefined)
    toast.success('Reporte de ventas exportado')
  } catch {
    toast.error('Error al exportar')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Ventas</h2>
      <div class="flex items-center gap-2">
        <button v-if="isAdmin" class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors" @click="exportarExcel" :disabled="reporteStore.exportando">
          <span v-if="reporteStore.exportando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
          Exportar Excel
        </button>
        <button v-if="isAdmin || isMesero" class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors" @click="modalFormAbierto = true">+ Nueva Venta</button>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-12 gap-2 items-end">
      <div class="col-auto">
        <select class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-auto" v-model="filtroEstado" @change="filtrar">
          <option value="">Todas</option>
          <option value="abierta">Abiertas</option>
          <option value="cerrada">Cerradas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>
      <div class="col-auto">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
        <input type="date" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="filtroDesde" />
      </div>
      <div class="col-auto">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
        <input type="date" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="filtroHasta" />
      </div>
    </div>

    <div v-if="ventaStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600"></span>
    </div>

    <template v-else>
      <div class="overflow-x-auto mt-3">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metodo Pago</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="v in ventasFiltradas" :key="v.id">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ v.id }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ v.Mesa ? 'Mesa #' + v.Mesa.numero : 'Fast Food' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ new Date(v.createdAt).toLocaleDateString() }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ v.total }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ v.metodoPago || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span :class="v.estado === 'cerrada' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : v.estado === 'cancelada' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'">
                  {{ v.estado }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <button v-if="v.estado === 'abierta'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors mr-1" @click="continuarVenta(v)">Continuar</button>
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors" @click="detalleVenta = v">Ver</button>
              </td>
            </tr>
            <tr v-if="ventasFiltradas.length === 0">
              <td colspan="7" class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No se encontraron ventas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="ventaStore.paginas > 1" class="flex items-center justify-between mt-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">Página {{ ventaStore.pagina }} de {{ ventaStore.paginas }}</span>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button class="px-3 py-1.5 text-xs border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual >= ventaStore.paginas" @click="paginaActual++">
            Siguiente
          </button>
        </div>
      </div>
    </template>

    <ModalBase v-if="modalFormAbierto" id="ventaFormModal" titulo="Nueva Venta" @cerrar="modalFormAbierto = false">
      <VentaFormModal @cerrar="modalFormAbierto = false" @guardado="cargarVentas()" />
    </ModalBase>

    <ModalBase v-if="detalleVenta" id="ventaDetailModal" titulo="Detalle de Venta #{{ detalleVenta.id }}" @cerrar="detalleVenta = null">
      <VentaDetailModal :venta="detalleVenta" @cerrar="detalleVenta = null" />
    </ModalBase>
  </div>
</template>
