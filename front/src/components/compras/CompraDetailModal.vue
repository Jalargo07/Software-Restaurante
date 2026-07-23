<script setup lang="ts">
import { useCompraStore } from '../../stores/compras'
import { useToastStore } from '../../stores/toast'

const props = defineProps<{
  compra: any
}>()

const emit = defineEmits<{
  cerrar: []
  actualizado: []
}>()

const compraStore = useCompraStore()
const toast = useToastStore()

async function recibir() {
  if (confirm('¿Recibir esta compra? Se actualizará el stock automáticamente.')) {
    try {
      await compraStore.recibirCompra(props.compra.id)
      toast.success('Compra recibida y stock actualizado')
      emit('actualizado')
      emit('cerrar')
    } catch {
      toast.error('Error al recibir compra')
    }
  }
}
</script>

<template>
  <div>
    <p><strong>Proveedor:</strong> {{ compra.Proveedor?.nombre || compra.proveedor }}</p>
    <p><strong>Fecha:</strong> {{ new Date(compra.fecha).toLocaleString() }}</p>
    <p><strong>Estado:</strong> {{ compra.estado }}</p>
    <p v-if="compra.observaciones"><strong>Observaciones:</strong> {{ compra.observaciones }}</p>

    <table class="table table-sm">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>P.U.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in compra.DetalleCompras" :key="d.id">
          <td>{{ d.Producto?.nombre || 'N/A' }}</td>
          <td>{{ d.cantidad }}</td>
          <td>${{ d.precioUnitario }}</td>
          <td>${{ d.subtotal }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3" class="text-end">Total:</th>
          <th>${{ compra.total }}</th>
        </tr>
      </tfoot>
    </table>

    <div class="d-flex gap-2">
      <button v-if="compra.estado === 'pendiente'" class="btn btn-success flex-grow-1" @click="recibir">Recibir Compra</button>
      <button class="btn btn-secondary flex-grow-1" @click="emit('cerrar')">Cerrar</button>
    </div>
  </div>
</template>
