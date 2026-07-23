<script setup lang="ts">
import { ref } from 'vue'
import { usePedidoStore } from '../../stores/pedidos'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const pedidoStore = usePedidoStore()
const mesaId = ref<number | undefined>(undefined)

async function crear() {
  await pedidoStore.createPedido(mesaId.value || undefined)
  emit('guardado')
  emit('cerrar')
}
</script>

<template>
  <form @submit.prevent="crear">
    <div class="mb-2">
      <label class="form-label">Mesa (opcional)</label>
      <input v-model.number="mesaId" type="number" min="1" class="form-control" placeholder="ID de mesa">
    </div>
    <button type="submit" class="btn btn-primary w-100 mt-2">Crear Pedido</button>
  </form>
</template>
