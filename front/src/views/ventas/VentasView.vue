<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVentaStore } from '../../stores/ventas'
import ModalBase from '../../components/common/ModalBase.vue'
import VentaFormModal from '../../components/ventas/VentaFormModal.vue'
import VentaDetailModal from '../../components/ventas/VentaDetailModal.vue'

const router = useRouter()
const ventaStore = useVentaStore()
const modalFormAbierto = ref(false)
const detalleVenta = ref<any>(null)
const filtroEstado = ref('')

onMounted(() => {
  ventaStore.fetchVentas()
})

function filtrar() {
  ventaStore.fetchVentas(filtroEstado.value || undefined)
}

function continuarVenta(v: any) {
  router.push('/pedidos')
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Ventas</h2>
      <button class="btn btn-success" @click="modalFormAbierto = true">+ Nueva Venta</button>
    </div>

    <div class="mt-3">
      <select class="form-select w-auto" v-model="filtroEstado" @change="filtrar">
        <option value="">Todas</option>
        <option value="abierta">Abiertas</option>
        <option value="cerrada">Cerradas</option>
      </select>
    </div>

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
        <tr v-for="v in ventaStore.ventas" :key="v.id">
          <td>{{ v.id }}</td>
          <td>{{ v.Mesa ? 'Mesa #' + v.Mesa.numero : 'Fast Food' }}</td>
          <td>{{ new Date(v.createdAt).toLocaleDateString() }}</td>
          <td>${{ v.total }}</td>
          <td>{{ v.metodoPago || '-' }}</td>
          <td>
            <span :class="`badge bg-${v.estado === 'cerrada' ? 'success' : 'warning'}`">
              {{ v.estado }}
            </span>
          </td>
          <td>
            <button v-if="v.estado === 'abierta'" class="btn btn-sm btn-warning me-1" @click="continuarVenta(v)">Continuar</button>
            <button class="btn btn-sm btn-outline-info" @click="detalleVenta = v">Ver</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalBase v-if="modalFormAbierto" id="ventaFormModal" titulo="Nueva Venta" @cerrar="modalFormAbierto = false">
      <VentaFormModal @cerrar="modalFormAbierto = false" @guardado="ventaStore.fetchVentas()" />
    </ModalBase>

    <ModalBase v-if="detalleVenta" id="ventaDetailModal" titulo="Detalle de Venta #{{ detalleVenta.id }}" @cerrar="detalleVenta = null">
      <VentaDetailModal :venta="detalleVenta" @cerrar="detalleVenta = null" />
    </ModalBase>
  </div>
</template>
