<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useComandaStore, type DetalleComanda } from '../../stores/comandas'
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
  pendiente: 'bg-danger',
  en_preparacion: 'bg-warning text-dark',
  listo: 'bg-success',
}

const estadoBorder: Record<string, string> = {
  pendiente: 'border-danger',
  en_preparacion: 'border-warning',
  listo: 'border-success',
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
    return detalles.some((d: DetalleComanda) => d.estadoComanda === filtroEstado.value)
  })
})

function obtenerDetalles(venta: any): DetalleComanda[] {
  return venta.DetalleVentas || venta.DetalleVenta || []
}

function contarPorEstado(venta: any, estado: string): number {
  return obtenerDetalles(venta).filter((d: DetalleComanda) => d.estadoComanda === estado).length
}

function tieneEstadoFiltro(venta: any): boolean {
  if (!filtroEstado.value) return true
  return obtenerDetalles(venta).some((d: DetalleComanda) => d.estadoComanda === filtroEstado.value)
}

async function avanzarEstado(detalle: DetalleComanda) {
  const siguiente = estadoSiguiente[detalle.estadoComanda]
  if (!siguiente) return
  try {
    await comandaStore.actualizarEstado(detalle.id, siguiente as any)
    toast.success(`${detalle.Producto?.nombre || 'Producto'} → ${estadoLabel[siguiente]}`)
  } catch {
    toast.error('Error al actualizar estado')
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Comandas / Cocina</h2>
      <button class="btn btn-outline-primary btn-sm" @click="comandaStore.fetchComandas()">
        ↻ Actualizar
      </button>
    </div>

    <div class="mt-3 d-flex gap-2 flex-wrap">
      <button class="btn btn-sm" :class="filtroEstado === '' ? 'btn-primary' : 'btn-outline-primary'"
        @click="filtroEstado = ''">
        Todas
      </button>
      <button class="btn btn-sm" :class="filtroEstado === 'pendiente' ? 'btn-danger' : 'btn-outline-danger'"
        @click="filtroEstado = 'pendiente'">
        Pendientes
      </button>
      <button class="btn btn-sm" :class="filtroEstado === 'en_preparacion' ? 'btn-warning' : 'btn-outline-warning'"
        @click="filtroEstado = 'en_preparacion'">
        En Preparación
      </button>
      <button class="btn btn-sm" :class="filtroEstado === 'listo' ? 'btn-success' : 'btn-outline-success'"
        @click="filtroEstado = 'listo'">
        Listos
      </button>
    </div>

    <div v-if="comandaStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <div v-else-if="!comandasFiltradas.length" class="text-center mt-4">
      <p class="text-muted">No hay comandas pendientes</p>
    </div>

    <div v-else class="row mt-3">
      <div v-for="venta in comandasFiltradas" :key="venta.id" class="col-md-6 col-lg-4 mb-3">
        <div class="card h-100" :class="obtenerDetalles(venta).every((d: DetalleComanda) => d.estadoComanda === 'listo') ? 'border-success' : contarPorEstado(venta, 'pendiente') > 0 ? 'border-danger' : 'border-warning'">
          <div class="card-header d-flex justify-content-between align-items-center"
            :class="obtenerDetalles(venta).every((d: DetalleComanda) => d.estadoComanda === 'listo') ? 'bg-success' : contarPorEstado(venta, 'pendiente') > 0 ? 'bg-danger' : 'bg-warning'"
            style="color: #333">
            <strong>Mesa #{{ venta.Mesa?.numero || 'Fast Food' }}</strong>
            <span>${{ venta.total }}</span>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li v-for="detalle in obtenerDetalles(venta)" :key="detalle.id"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2">
                    <img v-if="detalle.Producto?.imagen" :src="detalle.Producto.imagen" class="rounded"
                      style="width:28px;height:28px;object-fit:cover">
                    <span class="fw-semibold">{{ detalle.Producto?.nombre || 'Producto' }}</span>
                    <span class="badge" :class="estadoBg[detalle.estadoComanda]">
                      {{ estadoLabel[detalle.estadoComanda] }}
                    </span>
                  </div>
                  <small class="text-muted">x{{ detalle.cantidad }}</small>
                </div>
                <button v-if="detalle.estadoComanda !== 'listo'" class="btn btn-sm btn-outline-dark"
                  @click="avanzarEstado(detalle)">
                  → {{ estadoLabel[estadoSiguiente[detalle.estadoComanda]] }}
                </button>
              </li>
            </ul>
          </div>
          <div class="card-footer text-muted small">
            {{ new Date(venta.createdAt).toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
