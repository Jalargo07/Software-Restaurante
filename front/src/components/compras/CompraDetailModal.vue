<script setup lang="ts">
defineProps<{
  compra: any
}>()

const emit = defineEmits<{
  cerrar: []
}>()
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

    <button class="btn btn-secondary w-100" @click="emit('cerrar')">Cerrar</button>
  </div>
</template>
