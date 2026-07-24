<script setup lang="ts">
import { ref } from 'vue'
import { usePedidoStore } from '../../stores/pedidos'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const pedidoStore = usePedidoStore()
const guardando = ref(false)
const mesaId = ref<number | undefined>(undefined)

async function crear() {
  guardando.value = true
  try {
    await pedidoStore.createPedido(mesaId.value || undefined)
    emit('guardado')
    emit('cerrar')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="crear">
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mesa (opcional)</label>
      <input v-model.number="mesaId" type="number" min="1" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="ID de mesa">
    </div>
    <button type="submit" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full mt-2" :disabled="guardando">
      <span v-if="guardando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
      {{ guardando ? 'Guardando...' : 'Crear Pedido' }}
    </button>
  </form>
</template>
