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
    <p><strong>Fecha:</strong> {{ new Date(venta.fecha).toLocaleString() }}</p>
    <p><strong>Metodo Pago:</strong> {{ venta.metodoPago || '-' }}</p>
    <p><strong>Estado:</strong> {{ venta.estado }}</p>

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
        <tr v-for="d in venta.DetalleVentas" :key="d.id">
          <td>{{ d.Producto?.nombre || 'N/A' }}</td>
          <td>{{ d.cantidad }}</td>
          <td>${{ d.precioUnitario }}</td>
          <td>${{ d.subtotal }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3" class="text-end">Total:</th>
          <th>${{ venta.total }}</th>
        </tr>
      </tfoot>
    </table>

    <button class="btn btn-secondary w-100" @click="emit('cerrar')">Cerrar</button>
  </div>
</template>
