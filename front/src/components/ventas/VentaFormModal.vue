<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVentaStore } from '../../stores/ventas'
import api from '../../services/api'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const ventaStore = useVentaStore()

const mesas = ref<any[]>([])
const productos = ref<any[]>([])
const busqueda = ref('')
const modoRapido = ref(false)

const mesaId = ref<number | null>(null)
const metodoPago = ref('efectivo')
const detalles = ref<any[]>([])
const mostrarSelector = ref(false)

onMounted(async () => {
  const [mesasRes, prodRes] = await Promise.all([
    api.get('/mesas?estado=disponible'),
    api.get('/productos'),
  ])
  mesas.value = mesasRes.data
  productos.value = prodRes.data
})

const filtrados = computed(() => {
  if (!busqueda.value) return productos.value
  const q = busqueda.value.toLowerCase()
  return productos.value.filter((p: any) =>
    p.nombre.toLowerCase().includes(q)
  )
})

function agregar(producto: any) {
  const existente = detalles.value.find((d) => d.productoId === producto.id)
  if (existente) {
    existente.cantidad++
    existente.subtotal = existente.cantidad * existente.precioUnitario
  } else {
    detalles.value.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: Number(producto.precioVenta),
      subtotal: Number(producto.precioVenta),
    })
  }
  mostrarSelector.value = false
}

function quitar(index: number) {
  detalles.value.splice(index, 1)
}

const total = computed(() => detalles.value.reduce((s, d) => s + d.subtotal, 0))

async function cobrar() {
  try {
    await ventaStore.createVentaRapida({
      mesaId: modoRapido.value ? undefined : (mesaId.value || undefined),
      metodoPago: metodoPago.value,
      productos: detalles.value.map((d) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      })),
    })
    emit('guardado')
    emit('cerrar')
  } catch (error) {
    console.error('Error al crear venta rapida:', error)
  }
}
</script>

<template>
  <form @submit.prevent="cobrar">
    <div class="form-check mb-3">
      <input v-model="modoRapido" type="checkbox" class="form-check-input" id="modoRapido">
      <label class="form-check-label" for="modoRapido">Modo Rapido (sin mesa)</label>
    </div>

    <div class="mb-2" v-if="!modoRapido">
      <label class="form-label">Mesa</label>
      <select v-model.number="mesaId" class="form-select" :required="!modoRapido">
        <option :value="null" disabled>Seleccionar mesa</option>
        <option v-for="m in mesas" :key="m.id" :value="m.id">Mesa #{{ m.numero }} ({{ m.capacidad }}p)</option>
      </select>
    </div>

    <div class="mb-2">
      <label class="form-label">Productos</label>
      <button type="button" class="btn btn-sm btn-outline-success mb-2" @click="mostrarSelector = !mostrarSelector">
        + Agregar
      </button>

      <div v-if="mostrarSelector">
        <input v-model="busqueda" class="form-control form-control-sm mb-1" placeholder="Buscar...">
        <div style="max-height: 150px; overflow-y: auto;">
          <button v-for="p in filtrados" :key="p.id" type="button"
            class="btn btn-outline-secondary btn-sm d-block w-100 text-start mb-1"
            @click="agregar(p)">
            {{ p.nombre }} - ${{ p.precioVenta }}
          </button>
          <p v-if="!filtrados.length" class="text-muted small">Sin resultados</p>
        </div>
      </div>

      <div v-for="(d, i) in detalles" :key="i" class="d-flex align-items-center gap-2 mb-1">
        <span class="flex-grow-1 small">{{ d.nombre }}</span>
        <input v-model.number="d.cantidad" type="number" min="1" class="form-control form-control-sm w-25"
          @input="d.subtotal = d.cantidad * d.precioUnitario">
        <span class="small">${{ Number(d.subtotal).toFixed(2) }}</span>
        <button type="button" class="btn btn-sm btn-danger" @click="quitar(i)">X</button>
      </div>
    </div>

    <div class="mb-2">
      <label class="form-label">Metodo de Pago</label>
      <select v-model="metodoPago" class="form-select">
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
      </select>
    </div>

    <h4 class="text-end">Total: ${{ total.toFixed(2) }}</h4>
    <button type="submit" class="btn btn-success w-100" :disabled="(!modoRapido && !mesaId) || !detalles.length">Cobrar</button>
  </form>
</template>
