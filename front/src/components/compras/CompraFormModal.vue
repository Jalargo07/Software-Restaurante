<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompraStore } from '../../stores/compras'
import ProductoSelector from '../common/ProductoSelector.vue'
import ProveedorSelector from '../common/ProveedorSelector.vue'
import EscanerFacturaModal from './EscanerFacturaModal.vue'
import type { EscaneoFacturaResult } from '../../types'

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
const mostrarEscaner = ref(false)

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
      merma: Number(producto.merma) || 0,
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

function onEscaneoConfirmado(data: EscaneoFacturaResult) {
  if (data.proveedor.id) {
    proveedorId.value = data.proveedor.id
  }
  if (data.proveedor.nombre) {
    proveedorNombre.value = data.proveedor.nombre
  }
  detalles.value = data.items.map(item => ({
    productoId: item.productoId || null,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.cantidad * item.precioUnitario,
  }))
  mostrarEscaner.value = false
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
    <div class="flex justify-end mb-2">
      <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors" @click="mostrarEscaner = true">
        🧾 Escanear factura
      </button>
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
      <div v-if="!proveedorNombre">
        <button type="button" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-400 text-gray-600 hover:bg-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors w-full" @click="mostrarProveedorSelector = !mostrarProveedorSelector">
          Seleccionar Proveedor
        </button>
        <ProveedorSelector v-if="mostrarProveedorSelector" @seleccionar="seleccionarProveedor" />
      </div>
      <div v-else class="flex items-center gap-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">{{ proveedorNombre }}</span>
        <button type="button" class="inline-flex items-center gap-1.5 px-2 py-1 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="proveedorId = null; proveedorNombre = ''">X</button>
      </div>
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
      <textarea v-model="observaciones" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" rows="2"></textarea>
    </div>

    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Productos</label>
      <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors mb-2" @click="mostrarSelector = !mostrarSelector">
        + Agregar Producto
      </button>
      <ProductoSelector v-if="mostrarSelector" :soloInsumos="true" @seleccionar="agregarProducto" />
      <div class="max-h-[250px] overflow-y-auto">
        <div v-for="(d, i) in detalles" :key="i" class="flex items-center gap-2 mb-1">
          <span class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ d.nombre }}</span>
          <input v-model.number="d.cantidad" type="number" min="1" class="w-1/4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
            @input="d.subtotal = d.cantidad * d.precioUnitario">
          <input v-model.number="d.precioUnitario" type="number" step="0.01" class="w-1/4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
            @input="d.subtotal = d.cantidad * d.precioUnitario">
          <span class="text-sm text-gray-900 dark:text-gray-100">${{ Number(d.subtotal).toFixed(2) }}</span>
          <span v-if="d.merma > 0" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" title="Se aplicará al recibir la compra">merma {{ d.merma }}%</span>
          <button type="button" class="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" @click="quitarDetalle(i)">X</button>
        </div>
      </div>
    </div>

    <h5 class="text-right text-base font-bold text-gray-900 dark:text-gray-100">Total: ${{ total.toFixed(2) }}</h5>
    <button type="submit" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors w-full" :disabled="!detalles.length || guardando">
      <span v-if="guardando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
      {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar Compra' : 'Registrar Compra' }}
    </button>
  </form>
  <EscanerFacturaModal :visible="mostrarEscaner" @confirmar="onEscaneoConfirmado" @cerrar="mostrarEscaner = false" />
</template>

