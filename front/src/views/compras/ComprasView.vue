<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useCompraStore } from '../../stores/compras'
import { useReporteStore } from '../../stores/reportes'
import { useToastStore } from '../../stores/toast'
import { useRoles } from '../../composables/useRoles'
import ModalBase from '../../components/common/ModalBase.vue'
import CompraFormModal from '../../components/compras/CompraFormModal.vue'
import CompraDetailModal from '../../components/compras/CompraDetailModal.vue'

const compraStore = useCompraStore()
const reporteStore = useReporteStore()
const toast = useToastStore()
const { canCreate, canEdit, canDelete } = useRoles()
const modalFormAbierto = ref(false)
const modalEditando = ref(false)
const compraEditando = ref<any>(null)
const detalleCompra = ref<any>(null)
const filtroEstado = ref('')
const filtroDesde = ref('')
const filtroHasta = ref('')
const paginaActual = ref(1)

onMounted(() => {
  cargarCompras()
})

function cargarCompras() {
  compraStore.fetchCompras(paginaActual.value, 10, filtroEstado.value || undefined)
}

watch(paginaActual, () => {
  cargarCompras()
})

watch(filtroEstado, () => {
  paginaActual.value = 1
  cargarCompras()
})

const comprasFiltradas = computed(() => {
  let res = compraStore.compras
  if (filtroEstado.value) {
    res = res.filter((c) => c.estado === filtroEstado.value)
  }
  if (filtroDesde.value) {
    res = res.filter((c) => new Date(c.fecha) >= new Date(filtroDesde.value))
  }
  if (filtroHasta.value) {
    const hasta = new Date(filtroHasta.value)
    hasta.setHours(23, 59, 59, 999)
    res = res.filter((c) => new Date(c.fecha) <= hasta)
  }
  return res
})

function verDetalle(compra: any) {
  detalleCompra.value = compra
}

function editarCompra(compra: any) {
  compraEditando.value = compra
  modalEditando.value = true
}

async function recibirCompra(id: number) {
  if (confirm('¿Recibir esta compra? Se actualizará el stock automáticamente.')) {
    try {
      await compraStore.recibirCompra(id)
      toast.success('Compra recibida y stock actualizado')
      cargarCompras()
    } catch {
      toast.error('Error al recibir compra')
    }
  }
}

async function cancelarCompra(id: number) {
  if (confirm('Cancelar esta compra?')) {
    try {
      await compraStore.cancelarCompra(id)
      toast.success('Compra cancelada')
      cargarCompras()
    } catch {
      toast.error('Error al cancelar compra')
    }
  }
}

async function exportarExcel() {
  try {
    await reporteStore.exportarComprasExcel(filtroDesde.value || undefined, filtroHasta.value || undefined)
    toast.success('Reporte de compras exportado')
  } catch {
    toast.error('Error al exportar')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Compras</h2>
      <div class="flex items-center gap-2">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors" @click="exportarExcel" :disabled="reporteStore.exportando">
          <span v-if="reporteStore.exportando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
          Exportar Excel
        </button>
        <button v-if="canCreate" class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors" @click="modalFormAbierto = true">+ Nueva Compra</button>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-12 gap-2 items-end">
      <div class="col-auto">
        <select class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-auto" v-model="filtroEstado">
          <option value="">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="recibida">Recibidas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>
      <div class="col-auto">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
        <input type="date" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" v-model="filtroDesde" />
      </div>
      <div class="col-auto">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
        <input type="date" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" v-model="filtroHasta" />
      </div>
    </div>

    <div v-if="compraStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <template v-else>
      <div class="overflow-x-auto mt-3">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="c in comprasFiltradas" :key="c.id">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ c.id }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ c.proveedor?.nombre || c.Proveedor?.nombre || c.proveedor }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ new Date(c.fecha).toLocaleDateString() }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ c.total }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span :class="c.estado === 'recibida' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : c.estado === 'cancelada' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'">
                  {{ c.estado }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors mr-1" @click="verDetalle(c)">Ver</button>
                <button v-if="c.estado === 'pendiente' && canEdit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors mr-1" @click="editarCompra(c)">Editar</button>
                <button v-if="c.estado === 'pendiente' && canEdit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors mr-1" @click="recibirCompra(c.id)">Recibir</button>
                <button v-if="c.estado === 'pendiente' && canDelete" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="cancelarCompra(c.id)">Cancelar</button>
              </td>
            </tr>
            <tr v-if="comprasFiltradas.length === 0">
              <td colspan="6" class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No se encontraron compras</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="compraStore.paginas > 1" class="flex items-center justify-between mt-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">Página {{ compraStore.pagina }} de {{ compraStore.paginas }}</span>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button class="px-3 py-1.5 text-xs border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual >= compraStore.paginas" @click="paginaActual++">
            Siguiente
          </button>
        </div>
      </div>
    </template>

    <ModalBase v-if="modalFormAbierto" id="compraFormModal" titulo="Nueva Compra" @cerrar="modalFormAbierto = false">
      <CompraFormModal @cerrar="modalFormAbierto = false" @guardado="cargarCompras()" />
    </ModalBase>

    <ModalBase v-if="detalleCompra" id="compraDetailModal" titulo="Detalle de Compra #{{ detalleCompra.id }}" @cerrar="detalleCompra = null">
      <CompraDetailModal :compra="detalleCompra" @cerrar="detalleCompra = null" @actualizado="cargarCompras()" />
    </ModalBase>

    <ModalBase v-if="modalEditando" id="compraEditModal" titulo="Editar Compra #{{ compraEditando.id }}" @cerrar="modalEditando = false">
      <CompraFormModal :compra="compraEditando" @cerrar="modalEditando = false; compraEditando = null" @guardado="cargarCompras(); modalEditando = false; compraEditando = null" />
    </ModalBase>
  </div>
</template>
