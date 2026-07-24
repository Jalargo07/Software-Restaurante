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
    <p class="text-sm text-gray-700 dark:text-gray-300"><strong>Proveedor:</strong> {{ compra.Proveedor?.nombre || compra.proveedor }}</p>
    <p class="text-sm text-gray-700 dark:text-gray-300"><strong>Fecha:</strong> {{ new Date(compra.fecha).toLocaleString() }}</p>
    <p class="text-sm text-gray-700 dark:text-gray-300"><strong>Estado:</strong> {{ compra.estado }}</p>
    <p v-if="compra.observaciones" class="text-sm text-gray-700 dark:text-gray-300"><strong>Observaciones:</strong> {{ compra.observaciones }}</p>

    <div class="overflow-x-auto mt-3">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.U.</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="d in compra.DetalleCompras" :key="d.id">
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">{{ d.Producto?.nombre || 'N/A' }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">{{ d.cantidad }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">${{ d.precioUnitario }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">${{ d.subtotal }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-50 dark:bg-gray-800">
            <th colspan="3" class="px-3 py-2 text-right text-xs font-medium text-gray-900 dark:text-gray-100">Total:</th>
            <th class="px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-100">${{ compra.total }}</th>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="flex gap-2 mt-4">
      <button v-if="compra.estado === 'pendiente'" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex-1" @click="recibir">Recibir Compra</button>
      <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex-1" @click="emit('cerrar')">Cerrar</button>
    </div>
  </div>
</template>
