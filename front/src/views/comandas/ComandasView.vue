<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useComandaStore } from '../../stores/comandas'
import type { DetalleVenta, Venta, EstadoComanda } from '../../types'
import { useToastStore } from '../../stores/toast'
import { connectSocket, disconnectSocket, socket } from '../../services/socket'

const comandaStore = useComandaStore()
const toast = useToastStore()
const filtroEstado = ref<string>('')

const estadoSiguiente: Record<string, string> = {
  pendiente: 'en_preparacion',
  en_preparacion: 'listo',
}

const estadoLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
}

const estadoBg: Record<string, string> = {
  pendiente: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  en_preparacion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  listo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

onMounted(() => {
  comandaStore.fetchComandas()
  connectSocket()

  socket.on('nueva-comanda', (venta) => {
    comandaStore.agregarComanda(venta)
    toast.info(`Nueva comanda — Mesa #${venta.Mesa?.numero || 'Fast Food'}`)
  })
  socket.on('comanda-actualizada', (venta) => {
    comandaStore.actualizarComandaLocal(venta)
  })
  socket.on('venta-cerrada', ({ id }) => {
    comandaStore.removerComandaPorVentaId(id)
  })
  socket.on('venta-cancelada', ({ id }) => {
    comandaStore.removerComandaPorVentaId(id)
  })
})

onUnmounted(() => {
  socket.off('nueva-comanda')
  socket.off('comanda-actualizada')
  socket.off('venta-cerrada')
  socket.off('venta-cancelada')
  disconnectSocket()
})

const comandasFiltradas = computed(() => {
  if (!filtroEstado.value) return comandaStore.comandas
  return comandaStore.comandas.filter((venta) => {
    const detalles = venta.DetalleVentas || venta.DetalleVenta || []
    return detalles.some((d: DetalleVenta) => d.estadoComanda === filtroEstado.value)
  })
})

function obtenerDetalles(venta: Venta): DetalleVenta[] {
  return venta.DetalleVentas || venta.DetalleVenta || []
}

function contarPorEstado(venta: Venta, estado: string): number {
  return obtenerDetalles(venta).filter((d: DetalleVenta) => d.estadoComanda === estado).length
}

function tieneEstadoFiltro(venta: Venta): boolean {
  if (!filtroEstado.value) return true
  return obtenerDetalles(venta).some((d: DetalleVenta) => d.estadoComanda === filtroEstado.value)
}

async function avanzarEstado(detalle: DetalleVenta) {
  const siguiente = estadoSiguiente[detalle.estadoComanda]
  if (!siguiente) return
  try {
    await comandaStore.actualizarEstado(detalle.id, siguiente as EstadoComanda)
    toast.success(`${detalle.Producto?.nombre || 'Producto'} → ${estadoLabel[siguiente]}`)
  } catch {
    toast.error('Error al actualizar estado')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Comandas / Cocina</h2>
      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors" @click="comandaStore.fetchComandas()">
        ↻ Actualizar
      </button>
    </div>

    <div class="mt-3 flex gap-2 flex-wrap">
      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors" :class="filtroEstado === '' ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'"
        @click="filtroEstado = ''">
        Todas
      </button>
      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors" :class="filtroEstado === 'pendiente' ? 'bg-red-600 text-white' : 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white'"
        @click="filtroEstado = 'pendiente'">
        Pendientes
      </button>
      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors" :class="filtroEstado === 'en_preparacion' ? 'bg-yellow-500 text-white' : 'border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'"
        @click="filtroEstado = 'en_preparacion'">
        En Preparación
      </button>
      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors" :class="filtroEstado === 'listo' ? 'bg-green-600 text-white' : 'border border-green-600 text-green-600 hover:bg-green-600 hover:text-white'"
        @click="filtroEstado = 'listo'">
        Listos
      </button>
    </div>

    <div v-if="comandaStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600"></span>
    </div>

    <div v-else-if="!comandasFiltradas.length" class="text-center mt-4">
      <p class="text-gray-500 dark:text-gray-400">No hay comandas pendientes</p>
    </div>

    <div v-else class="grid grid-cols-12 gap-3 mt-3">
      <div v-for="venta in comandasFiltradas" :key="venta.id" class="md:col-span-6 lg:col-span-4 col-span-12 mb-3">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full overflow-hidden" :class="obtenerDetalles(venta).every((d: DetalleVenta) => d.estadoComanda === 'listo') ? 'ring-2 ring-green-500' : contarPorEstado(venta, 'pendiente') > 0 ? 'ring-2 ring-red-500' : 'ring-2 ring-yellow-500'">
          <div class="flex items-center justify-between px-4 py-3"
            :class="obtenerDetalles(venta).every((d: DetalleVenta) => d.estadoComanda === 'listo') ? 'bg-green-600 text-white' : contarPorEstado(venta, 'pendiente') > 0 ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'">
            <strong>Mesa #{{ venta.Mesa?.numero || 'Fast Food' }}</strong>
            <span>${{ venta.total }}</span>
          </div>
          <div class="p-0">
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div v-for="detalle in obtenerDetalles(venta)" :key="detalle.id"
                class="flex items-center justify-between px-4 py-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <img v-if="detalle.Producto?.imagen" :src="detalle.Producto.imagen" class="rounded"
                      style="width:28px;height:28px;object-fit:cover">
                    <span class="font-semibold text-sm text-gray-900 dark:text-gray-100">{{ detalle.Producto?.nombre || 'Producto' }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="estadoBg[detalle.estadoComanda]">
                      {{ estadoLabel[detalle.estadoComanda] }}
                    </span>
                  </div>
                  <small class="text-gray-500 dark:text-gray-400">x{{ detalle.cantidad }}</small>
                </div>
                <button v-if="detalle.estadoComanda !== 'listo'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg transition-colors"
                  @click="avanzarEstado(detalle)">
                  → {{ estadoLabel[estadoSiguiente[detalle.estadoComanda]] }}
                </button>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            {{ new Date(venta.createdAt).toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
