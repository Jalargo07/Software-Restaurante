<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
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

const comprasFiltradas = computed(() => {
  if (!filtroEstado.value) return compraStore.compras
  return compraStore.compras.filter((c) => c.estado === filtroEstado.value)
})

onMounted(() => {
  compraStore.fetchCompras()
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
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Compras</h2>
      <div>
        <button class="btn btn-success me-2" @click="exportarExcel" :disabled="reporteStore.exportando">
          <span v-if="reporteStore.exportando" class="spinner-border spinner-border-sm me-1"></span>
          Exportar Excel
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="modalFormAbierto = true">+ Nueva Compra</button>
      </div>
    </div>

    <div class="mt-3 row g-2 align-items-end">
      <div class="col-auto">
        <select class="form-select w-auto" v-model="filtroEstado">
          <option value="">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="recibida">Recibidas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>
      <div class="col-auto">
        <label class="form-label small">Desde</label>
        <input type="date" class="form-control" v-model="filtroDesde" />
      </div>
      <div class="col-auto">
        <label class="form-label small">Hasta</label>
        <input type="date" class="form-control" v-model="filtroHasta" />
      </div>
    </div>

    <div v-if="compraStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <table v-else class="table table-striped mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Proveedor</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in comprasFiltradas" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.proveedor?.nombre || c.Proveedor?.nombre || c.proveedor }}</td>
          <td>{{ new Date(c.fecha).toLocaleDateString() }}</td>
          <td>${{ c.total }}</td>
          <td>
            <span :class="`badge bg-${c.estado === 'recibida' ? 'success' : c.estado === 'cancelada' ? 'danger' : 'warning'}`">
              {{ c.estado }}
            </span>
          </td>
            <td>
              <button class="btn btn-sm btn-outline-info me-1" @click="verDetalle(c)">Ver</button>
              <button v-if="c.estado === 'pendiente' && canEdit" class="btn btn-sm btn-outline-primary me-1" @click="editarCompra(c)">Editar</button>
              <button v-if="c.estado === 'pendiente' && canEdit" class="btn btn-sm btn-outline-success me-1" @click="recibirCompra(c.id)">Recibir</button>
              <button v-if="c.estado === 'pendiente' && canDelete" class="btn btn-sm btn-outline-danger" @click="cancelarCompra(c.id)">Cancelar</button>
            </td>
        </tr>
      </tbody>
    </table>

    <ModalBase v-if="modalFormAbierto" id="compraFormModal" titulo="Nueva Compra" @cerrar="modalFormAbierto = false">
      <CompraFormModal @cerrar="modalFormAbierto = false" @guardado="compraStore.fetchCompras()" />
    </ModalBase>

    <ModalBase v-if="detalleCompra" id="compraDetailModal" titulo="Detalle de Compra #{{ detalleCompra.id }}" @cerrar="detalleCompra = null">
      <CompraDetailModal :compra="detalleCompra" @cerrar="detalleCompra = null" @actualizado="compraStore.fetchCompras()" />
    </ModalBase>

    <ModalBase v-if="modalEditando" id="compraEditModal" titulo="Editar Compra #{{ compraEditando.id }}" @cerrar="modalEditando = false">
      <CompraFormModal :compra="compraEditando" @cerrar="modalEditando = false; compraEditando = null" @guardado="compraStore.fetchCompras(); modalEditando = false; compraEditando = null" />
    </ModalBase>
  </div>
</template>
