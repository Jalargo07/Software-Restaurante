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
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Ventas</h2>
      <div>
        <button v-if="isAdmin" class="btn btn-success me-2" @click="exportarExcel" :disabled="reporteStore.exportando">
          <span v-if="reporteStore.exportando" class="spinner-border spinner-border-sm me-1"></span>
          Exportar Excel
        </button>
        <button v-if="isAdmin || isMesero" class="btn btn-success" @click="modalFormAbierto = true">+ Nueva Venta</button>
      </div>
    </div>

    <div class="mt-3 row g-2 align-items-end">
      <div class="col-auto">
        <select class="form-select w-auto" v-model="filtroEstado" @change="filtrar">
          <option value="">Todas</option>
          <option value="abierta">Abiertas</option>
          <option value="cerrada">Cerradas</option>
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

    <div v-if="ventaStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <template v-else>
      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Metodo Pago</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventasFiltradas" :key="v.id">
            <td>{{ v.id }}</td>
            <td>{{ v.Mesa ? 'Mesa #' + v.Mesa.numero : 'Fast Food' }}</td>
            <td>{{ new Date(v.createdAt).toLocaleDateString() }}</td>
            <td>${{ v.total }}</td>
            <td>{{ v.metodoPago || '-' }}</td>
            <td>
              <span :class="`badge bg-${v.estado === 'cerrada' ? 'success' : v.estado === 'cancelada' ? 'danger' : 'warning'}`">
                {{ v.estado }}
              </span>
            </td>
            <td>
              <button v-if="v.estado === 'abierta'" class="btn btn-sm btn-warning me-1" @click="continuarVenta(v)">Continuar</button>
              <button class="btn btn-sm btn-outline-info" @click="detalleVenta = v">Ver</button>
            </td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="7" class="text-center text-muted py-3">No se encontraron ventas</td>
          </tr>
        </tbody>
      </table>

      <div v-if="ventaStore.paginas > 1" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted">Página {{ ventaStore.pagina }} de {{ ventaStore.paginas }}</span>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="paginaActual >= ventaStore.paginas" @click="paginaActual++">
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
