<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCompraStore } from '../../stores/compras'
import ProductoSelector from '../common/ProductoSelector.vue'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const compraStore = useCompraStore()
const proveedor = ref('')
const observaciones = ref('')
const detalles = ref<any[]>([])
const mostrarSelector = ref(false)

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
  await compraStore.createCompra({
    proveedor: proveedor.value,
    observaciones: observaciones.value || undefined,
    detalles: detalles.value.map((d) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    })),
  })
  emit('guardado')
  emit('cerrar')
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="form-label">Proveedor</label>
      <input v-model="proveedor" class="form-control" required placeholder="Nombre del proveedor">
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
    <button type="submit" class="btn btn-primary w-100" :disabled="!detalles.length">Registrar Compra</button>
  </form>
</template>

