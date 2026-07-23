<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompraStore } from '../../stores/compras'
import ProductoSelector from '../common/ProductoSelector.vue'
import ProveedorSelector from '../common/ProveedorSelector.vue'

const props = defineProps<{
  compra?: any
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const compraStore = useCompraStore()
const guardando = ref(false)
const proveedorId = ref<number | null>(null)
const proveedorNombre = ref('')
const observaciones = ref('')
const detalles = ref<any[]>([])
const mostrarSelector = ref(false)
const mostrarProveedorSelector = ref(false)

const esEdicion = computed(() => !!props.compra)

onMounted(() => {
  if (props.compra) {
    const c = props.compra
    proveedorId.value = c.proveedorId
    proveedorNombre.value = c.Proveedor?.nombre || c.proveedor
    observaciones.value = c.observaciones || ''
    detalles.value = (c.DetalleCompras || c.detalles || []).map((d: any) => ({
      productoId: d.ProductoId || d.productoId,
      nombre: d.Producto?.nombre || d.nombre,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario),
      subtotal: Number(d.subtotal),
    }))
  }
})

function seleccionarProveedor(proveedor: any) {
  proveedorId.value = proveedor.id
  proveedorNombre.value = proveedor.nombre
  mostrarProveedorSelector.value = false
}

function agregarProducto(producto: any) {
  const existente = detalles.value.find((d) => d.productoId === producto.id)
  if (existente) {
    existente.cantidad++
    existente.subtotal = existente.cantidad * existente.precioUnitario
  } else {
    detalles.value.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: Number(producto.precioCompra),
      subtotal: Number(producto.precioCompra),
    })
  }
  mostrarSelector.value = false
}

function quitarDetalle(index: number) {
  detalles.value.splice(index, 1)
}

const total = computed(() => detalles.value.reduce((s, d) => s + d.subtotal, 0))

async function guardar() {
  guardando.value = true
  try {
    if (esEdicion.value) {
      await compraStore.actualizarCompra(props.compra.id, {
        proveedorId: proveedorId.value!,
        observaciones: observaciones.value || undefined,
        detalles: detalles.value.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })),
      })
    } else {
      await compraStore.createCompra({
        proveedorId: proveedorId.value!,
        observaciones: observaciones.value || undefined,
        detalles: detalles.value.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })),
      })
    }
    emit('guardado')
    emit('cerrar')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="form-label">Proveedor</label>
      <div v-if="!proveedorNombre">
        <button type="button" class="btn btn-outline-secondary w-100" @click="mostrarProveedorSelector = !mostrarProveedorSelector">
          Seleccionar Proveedor
        </button>
        <ProveedorSelector v-if="mostrarProveedorSelector" @seleccionar="seleccionarProveedor" />
      </div>
      <div v-else class="d-flex align-items-center gap-2">
        <span class="badge bg-info">{{ proveedorNombre }}</span>
        <button type="button" class="btn btn-sm btn-outline-danger" @click="proveedorId = null; proveedorNombre = ''">X</button>
      </div>
    </div>
    <div class="mb-2">
      <label class="form-label">Observaciones</label>
      <textarea v-model="observaciones" class="form-control" rows="2"></textarea>
    </div>

    <div class="mb-2">
      <label class="form-label">Productos</label>
      <button type="button" class="btn btn-sm btn-outline-success mb-2" @click="mostrarSelector = !mostrarSelector">
        + Agregar Producto
      </button>
      <ProductoSelector v-if="mostrarSelector" @seleccionar="agregarProducto" />
      <div v-for="(d, i) in detalles" :key="i" class="d-flex align-items-center gap-2 mb-1">
        <span class="flex-grow-1">{{ d.nombre }}</span>
        <input v-model.number="d.cantidad" type="number" min="1" class="form-control form-control-sm w-25"
          @input="d.subtotal = d.cantidad * d.precioUnitario">
        <input v-model.number="d.precioUnitario" type="number" step="0.01" class="form-control form-control-sm w-25"
          @input="d.subtotal = d.cantidad * d.precioUnitario">
        <span>${{ Number(d.subtotal).toFixed(2) }}</span>
        <button type="button" class="btn btn-sm btn-danger" @click="quitarDetalle(i)">X</button>
      </div>
    </div>

    <h5 class="text-end">Total: ${{ total.toFixed(2) }}</h5>
    <button type="submit" class="btn btn-primary w-100" :disabled="!detalles.length || guardando">
      <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
      {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar Compra' : 'Registrar Compra' }}
    </button>
  </form>
</template>

