<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMesaStore } from '../../stores/mesas'
import { useVentaStore } from '../../stores/ventas'
import { useToastStore } from '../../stores/toast'
import api from '../../services/api'
import ModalBase from '../../components/common/ModalBase.vue'
import MesaFormModal from '../../components/mesas/MesaFormModal.vue'

const router = useRouter()
const mesaStore = useMesaStore()
const ventaStore = useVentaStore()
const toast = useToastStore()
const modalAbierto = ref(false)
const editando = ref<any>(null)

const ocupandoMesa = ref<any>(null)
const productos = ref<any[]>([])
const busqueda = ref('')
const mostrarSelector = ref(false)
const seleccionados = ref<{ productoId: number; nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[]>([])

onMounted(() => {
  mesaStore.fetchMesas()
  api.get('/productos').then(({ data }) => productos.value = data)
})

const filtrados = computed(() => {
  let resultado = productos.value.filter((p: any) => p.tipo !== 'insumo')
  if (!busqueda.value) return resultado
  const q = busqueda.value.toLowerCase()
  return resultado.filter((p: any) => p.nombre.toLowerCase().includes(q))
})

const totalPedido = computed(() => seleccionados.value.reduce((s, d) => s + d.subtotal, 0))

function stockDisponibleProducto(producto: any): number {
  if (!producto) return 0
  if (producto.tipo === 'directo') {
    return Number(producto.stock) || 0
  }
  if (producto.tipo === 'compuesto' && producto.detallesReceta?.length) {
    let minStock = Infinity
    for (const det of producto.detallesReceta) {
      const insumo = det.insumo
      if (!insumo) return 0
      const reqPorUnidad = Number(det.cantidad)
      if (reqPorUnidad <= 0) return 0
      const disponibles = Math.floor(Number(insumo.stock) / reqPorUnidad)
      minStock = Math.min(minStock, disponibles)
    }
    return minStock === Infinity ? 0 : minStock
  }
  return 0
}

function abrirModal(mesa?: any) {
  editando.value = mesa ?? null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  editando.value = null
}

async function eliminar(id: number) {
  if (confirm('Eliminar esta mesa?')) {
    try {
      await mesaStore.deleteMesa(id)
      toast.success('Mesa eliminada')
    } catch {
      toast.error('Error al eliminar mesa')
    }
  }
}

function abrirPedido(mesa: any) {
  ocupandoMesa.value = mesa
  seleccionados.value = []
  busqueda.value = ''
  mostrarSelector.value = false
}

function cerrarPedido() {
  ocupandoMesa.value = null
  seleccionados.value = []
}

function agregarProducto(producto: any) {
  const ex = seleccionados.value.find((d) => d.productoId === producto.id)
  if (ex) {
    ex.cantidad++
    ex.subtotal = ex.cantidad * ex.precioUnitario
  } else {
    seleccionados.value.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: Number(producto.precioVenta),
      subtotal: Number(producto.precioVenta),
    })
  }
  mostrarSelector.value = false
}

function quitarSeleccion(i: number) {
  seleccionados.value.splice(i, 1)
}

async function guardarPedido() {
  if (!ocupandoMesa.value || !seleccionados.value.length) return
  try {
    await ventaStore.createVentaConProductos({
      mesaId: ocupandoMesa.value.id,
      productos: seleccionados.value.map((d) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      })),
    })
    await mesaStore.fetchMesas()
    toast.success('Pedido guardado')
    cerrarPedido()
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Error al guardar pedido')
  }
}

function verPedido(mesa: any) {
  router.push('/pedidos')
}

function estadoColor(estado: string) {
  const colors: Record<string, string> = {
    disponible: 'success', ocupada: 'danger', reservada: 'warning', mantenimiento: 'secondary',
  }
  return colors[estado] || 'primary'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion de Mesas</h2>
      <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors" @click="abrirModal()">+ Nueva Mesa</button>
    </div>

    <div v-if="mesaStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <div class="grid grid-cols-12 gap-3 mt-3" v-else-if="mesaStore.mesas.length">
      <div class="md:col-span-3 col-span-12 mb-3" v-for="mesa in mesaStore.mesas" :key="mesa.id">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full">
          <div class="p-4 text-center">
            <h5 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Mesa #{{ mesa.numero }}</h5>
            <p class="text-sm text-gray-700 dark:text-gray-300">Capacidad: {{ mesa.capacidad }} personas</p>
            <p v-if="mesa.ubicacion" class="text-gray-500 dark:text-gray-400 text-xs">{{ mesa.ubicacion }}</p>
            <span :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor(mesa.estado) === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : estadoColor(mesa.estado) === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : estadoColor(mesa.estado) === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`">{{ mesa.estado }}</span>
            <div class="mt-2 flex items-center justify-center gap-1">
              <button v-if="mesa.estado === 'disponible'" class="inline-flex items-center gap-1.5 text-xs px-2 py-1 md:text-xs md:px-3 md:py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors mr-1" @click="abrirPedido(mesa)">Ocupar</button>
              <button v-if="mesa.estado === 'ocupada'" class="inline-flex items-center gap-1.5 text-xs px-2 py-1 md:text-xs md:px-3 md:py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors mr-1" @click="verPedido(mesa)">Ver Pedido</button>
              <button class="inline-flex items-center gap-1.5 text-xs px-2 py-1 md:text-xs md:px-3 md:py-1.5 border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors mr-1" @click="abrirModal(mesa)">Editar</button>
              <button class="inline-flex items-center gap-1.5 text-xs px-2 py-1 md:text-xs md:px-3 md:py-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="eliminar(mesa.id)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!mesaStore.loading" class="text-center mt-4">
      <p class="text-gray-500 dark:text-gray-400">No hay mesas registradas</p>
    </div>

    <ModalBase v-if="modalAbierto" id="mesaModal" :titulo="editando ? 'Editar Mesa' : 'Nueva Mesa'" @cerrar="cerrarModal">
      <MesaFormModal :mesa="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="mesaStore.fetchMesas()" />
    </ModalBase>

    <ModalBase v-if="ocupandoMesa" id="pedidoModal" :titulo="`Pedido - Mesa #${ocupandoMesa.numero}`" @cerrar="cerrarPedido">
      <div>
        <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors mb-2" @click="mostrarSelector = !mostrarSelector">
          + Agregar Producto
        </button>

        <div v-if="mostrarSelector">
          <input v-model="busqueda" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500 mb-1" placeholder="Buscar...">
          <div style="max-height: 150px; overflow-y: auto;">
            <button v-for="p in filtrados" :key="p.id" type="button"
              :disabled="stockDisponibleProducto(p) < 1"
              class="w-full text-left mb-1 px-3 py-1.5 text-xs border rounded-lg transition-colors block"
              :class="stockDisponibleProducto(p) < 1
                ? 'border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed'
                : 'border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white dark:border-gray-400 dark:text-gray-300'"
              @click="stockDisponibleProducto(p) >= 1 && agregarProducto(p)">
              {{ p.nombre }} - ${{ p.precioVenta }}
              <span v-if="stockDisponibleProducto(p) < 1"
                class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Agotado</span>
            </button>
            <p v-if="!filtrados.length" class="text-gray-500 dark:text-gray-400 text-xs">Sin resultados</p>
          </div>
        </div>

        <div v-for="(d, i) in seleccionados" :key="i" class="flex items-center gap-2 mt-2 mb-1">
          <span class="flex-1 text-xs text-gray-900 dark:text-gray-100">{{ d.nombre }}</span>
          <input v-model.number="d.cantidad" type="number" min="1"
            :max="stockDisponibleProducto(productos.find((p: any) => p.id === d.productoId) ?? null)"
            class="w-1/4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
            @input="d.cantidad = Math.min(d.cantidad, stockDisponibleProducto(productos.find((p: any) => p.id === d.productoId) ?? null)); d.subtotal = d.cantidad * d.precioUnitario">
          <span class="text-xs text-gray-900 dark:text-gray-100">${{ Number(d.subtotal).toFixed(2) }}</span>
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" @click="quitarSeleccion(i)">X</button>
        </div>

        <h5 class="text-right mt-2 text-base font-bold text-gray-900 dark:text-gray-100">Total: ${{ totalPedido.toFixed(2) }}</h5>
        <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors w-full mt-2" :disabled="!seleccionados.length" @click="guardarPedido">
          Guardar Pedido
        </button>
      </div>
    </ModalBase>
  </div>
</template>
