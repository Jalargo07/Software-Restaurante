<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCompraStore } from '../../stores/compras'
import ModalBase from '../../components/common/ModalBase.vue'
import CompraFormModal from '../../components/compras/CompraFormModal.vue'
import CompraDetailModal from '../../components/compras/CompraDetailModal.vue'

const compraStore = useCompraStore()
const modalFormAbierto = ref(false)
const detalleCompra = ref<any>(null)

onMounted(() => {
  compraStore.fetchCompras()
})

function verDetalle(compra: any) {
  detalleCompra.value = compra
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Compras</h2>
      <button class="btn btn-primary" @click="modalFormAbierto = true">+ Nueva Compra</button>
    </div>

    <table class="table table-striped mt-3">
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
        <tr v-for="c in compraStore.compras" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.proveedor }}</td>
          <td>{{ new Date(c.fecha).toLocaleDateString() }}</td>
          <td>${{ c.total }}</td>
          <td>
            <span :class="`badge bg-${c.estado === 'recibida' ? 'success' : c.estado === 'cancelada' ? 'danger' : 'warning'}`">
              {{ c.estado }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-info" @click="verDetalle(c)">Ver</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalBase v-if="modalFormAbierto" id="compraFormModal" titulo="Nueva Compra" @cerrar="modalFormAbierto = false">
      <CompraFormModal @cerrar="modalFormAbierto = false" @guardado="compraStore.fetchCompras()" />
    </ModalBase>

    <ModalBase v-if="detalleCompra" id="compraDetailModal" titulo="Detalle de Compra #{{ detalleCompra.id }}" @cerrar="detalleCompra = null">
      <CompraDetailModal :compra="detalleCompra" @cerrar="detalleCompra = null" />
    </ModalBase>
  </div>
</template>
