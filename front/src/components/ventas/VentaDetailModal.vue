<script setup lang="ts">
defineProps<{
  venta: any
}>()

const emit = defineEmits<{
  cerrar: []
}>()
</script>

<template>
  <div>
    <p><strong>Mesa:</strong> #{{ venta.Mesa?.numero }}</p>
    <p><strong>Fecha:</strong> {{ new Date(venta.createdAt).toLocaleString() }}</p>
    <p><strong>Metodo Pago:</strong> {{ venta.metodoPago || '-' }}</p>
    <p><strong>Estado:</strong> {{ venta.estado }}</p>

    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
      <thead>
        <tr class="bg-gray-50 dark:bg-gray-800">
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.U.</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="d in (venta.DetalleVentas || venta.DetalleVenta || [])" :key="d.id">
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ d.Producto?.nombre || 'N/A' }}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ d.cantidad }}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ d.precioUnitario }}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ d.subtotal }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="bg-gray-50 dark:bg-gray-800">
          <th colspan="3" class="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Total:</th>
          <th class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">${{ venta.total }}</th>
        </tr>
      </tfoot>
    </table>

    <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors w-full mt-3" @click="emit('cerrar')">Cerrar</button>
  </div>
</template>
