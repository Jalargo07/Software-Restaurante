<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePedidoStore } from '../../stores/pedidos'
import { useToastStore } from '../../stores/toast'
import { io } from 'socket.io-client'

const pedidoStore = usePedidoStore()
const toast = useToastStore()
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000')

const pedidosDelivery = ref<any[]>([])

onMounted(async () => {
  await pedidoStore.fetchPedidos()
  pedidosDelivery.value = pedidoStore.pedidos.filter((v: any) => v.tipo === 'delivery')

  socket.on('nuevo-pedido-delivery', async () => {
    await pedidoStore.fetchPedidos()
    pedidosDelivery.value = pedidoStore.pedidos.filter((v: any) => v.tipo === 'delivery')
    toast.info('¡Nuevo pedido de delivery!')
  })
})

onUnmounted(() => { socket.disconnect() })

const badgeApp: Record<string, string> = { rappi: 'bg-purple-100 text-purple-700', uber: 'bg-green-100 text-green-700', pedidosya: 'bg-blue-100 text-blue-700' }
const labelApp: Record<string, string> = { rappi: 'Rappi', uber: 'Uber Eats', pedidosya: 'PedidosYa' }

function badgeEstado(estado: string) {
  const map: Record<string, string> = { pendiente: 'bg-yellow-100 text-yellow-700', en_preparacion: 'bg-blue-100 text-blue-700', listo: 'bg-green-100 text-green-700' }
  return map[estado] || 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="px-4 py-6 max-w-7xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pedidos Delivery</h2>
    <div v-if="pedidosDelivery.length === 0" class="text-center py-12 text-gray-500">Sin pedidos de delivery</div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="v in pedidosDelivery" :key="v.id"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="badgeApp[v.deliveryApp] || 'bg-gray-100'">{{ labelApp[v.deliveryApp] || v.deliveryApp }}</span>
          <span class="text-xs text-gray-500">#{{ v.id }}</span>
        </div>
        <div v-if="v.direccionEntrega" class="text-xs text-gray-500 mb-2">📍 {{ v.direccionEntrega }}</div>
        <div v-if="v.clienteTelefono" class="text-xs text-gray-500 mb-2">📞 {{ v.clienteTelefono }}</div>
        <div class="space-y-1 mb-3">
          <div v-for="d in v.DetalleVentas" :key="d.id" class="flex justify-between text-sm">
            <span class="text-gray-900 dark:text-gray-100">{{ d.cantidad }}x {{ d.Producto?.nombre }}</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">${{ (d.subtotal || 0).toLocaleString() }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span class="text-xs font-medium" :class="badgeEstado(v.estado)">{{ v.estado }}</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">${{ (v.total || 0).toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
