<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePedidoStore } from '../../stores/pedidos'
import { useToastStore } from '../../stores/toast'
import api from '../../services/api'
import ModalBase from '../../components/common/ModalBase.vue'
import PedidoFormModal from '../../components/pedidos/PedidoFormModal.vue'
import SplitBillModal from '../../components/pedidos/SplitBillModal.vue'

const pedidoStore = usePedidoStore()
const toast = useToastStore()
const filtroEstado = ref('')
const cobrandoVenta = ref<any>(null)
const metodoPago = ref('efectivo')
const agregandoAVenta = ref<any>(null)
const mostrarSelector = ref(false)
const productos = ref<any[]>([])
const busqueda = ref('')
const seleccionados = ref<{ productoId: number; nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[]>([])
const modalNuevoAbierto = ref(false)
const editandoDetalle = ref<any>(null)
const cantidadEditar = ref(1)
const ventaSplit = ref<any>(null)

async function cargarDatos() {
  try {
    await pedidoStore.fetchPedidos(filtroEstado.value || undefined)
    const prodRes = await api.get('/productos')
    productos.value = prodRes.data
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
  }
}

onMounted(cargarDatos)

const filtrados = computed(() => {
  let resultado = productos.value.filter((p: any) => p.tipo !== 'insumo')
  if (!busqueda.value) return resultado
  const q = busqueda.value.toLowerCase()
  return resultado.filter((p: any) => p.nombre.toLowerCase().includes(q))
})

const totalAgregar = computed(() => seleccionados.value.reduce((s, d) => s + d.subtotal, 0))

function abrirAgregar(venta: any) {
  agregandoAVenta.value = venta
  seleccionados.value = []
  busqueda.value = ''
  mostrarSelector.value = true
}

function agregarProducto(producto: any) {
  const ex = seleccionados.value.find((d) => d.productoId === producto.id)
  if (ex) {
    ex.cantidad++
    ex.subtotal = ex.cantidad * ex.precioUnitario
  } else {
    seleccionados.value.push({
      productoId: producto.id, nombre: producto.nombre, cantidad: 1,
      precioUnitario: Number(producto.precioVenta),
      subtotal: Number(producto.precioVenta),
    })
  }
  mostrarSelector.value = false
}

function quitarSeleccion(i: number) {
  seleccionados.value.splice(i, 1)
}

async function guardarProductos() {
  if (!agregandoAVenta.value || !seleccionados.value.length) return
  try {
    await pedidoStore.addProductos(
      agregandoAVenta.value.id,
      seleccionados.value.map((d) => ({ productoId: d.productoId, cantidad: d.cantidad, precioUnitario: d.precioUnitario }))
    )
    toast.success('Productos agregados')
    agregandoAVenta.value = null
    seleccionados.value = []
    await cargarDatos()
  } catch {
    toast.error('Error al agregar productos')
  }
}

function abrirCobro(venta: any) {
  cobrandoVenta.value = venta
  metodoPago.value = 'efectivo'
}

async function confirmarCobro() {
  if (!cobrandoVenta.value) return
  try {
    await api.put(`/ventas/${cobrandoVenta.value.id}/cobrar`, { metodoPago: metodoPago.value })
    toast.success('Venta cobrada')
    cobrandoVenta.value = null
    await cargarDatos()
  } catch {
    toast.error('Error al cobrar venta')
  }
}

async function cancelarPedido(id: number) {
  if (confirm('Cancelar este pedido?')) {
    try {
      await pedidoStore.cancelarPedido(id)
      toast.success('Pedido cancelado')
    } catch {
      toast.error('Error al cancelar pedido')
    }
  }
}

function cambiarFiltro() {
  cargarDatos()
}

function abrirEditarCantidad(detalle: any) {
  editandoDetalle.value = detalle
  cantidadEditar.value = detalle.cantidad
}

async function guardarCantidad() {
  if (!editandoDetalle.value) return
  try {
    await pedidoStore.editarDetalle(
      editandoDetalle.value.VentaId,
      editandoDetalle.value.id,
      cantidadEditar.value
    )
    toast.success('Cantidad actualizada')
    editandoDetalle.value = null
    await cargarDatos()
  } catch {
    toast.error('Error al actualizar cantidad')
  }
}

async function eliminarProducto(ventaId: number, detalle: any) {
  if (!confirm(`Eliminar "${detalle.Producto?.nombre}" de la venta?`)) return
  try {
    await pedidoStore.eliminarDetalle(ventaId, detalle.id)
    toast.success('Producto eliminado')
    await cargarDatos()
  } catch {
    toast.error('Error al eliminar producto')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Pedidos</h2>
      <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors" @click="modalNuevoAbierto = true">+ Nuevo Pedido</button>
    </div>

    <div class="mt-3">
      <select class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-auto" v-model="filtroEstado" @change="cambiarFiltro">
        <option value="">Todos</option>
        <option value="abierta">Activos</option>
        <option value="cerrada">Cerrados</option>
        <option value="cancelada">Cancelados</option>
      </select>
    </div>

    <div v-if="pedidoStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <div v-else-if="!pedidoStore.pedidos.length" class="text-center mt-4">
      <p class="text-gray-500 dark:text-gray-400">No hay pedidos</p>
    </div>

    <template v-else>
      <div v-for="v in pedidoStore.pedidos" :key="v.id" class="mt-3 space-y-3">
      <div class="rounded-xl shadow-sm overflow-hidden border" :class="v.estado === 'cerrada' ? 'border-green-500' : v.estado === 'cancelada' ? 'border-gray-400' : 'border-red-500'">
        <div class="px-4 py-3 flex items-center justify-between text-white" :class="v.estado === 'cerrada' ? 'bg-green-600' : v.estado === 'cancelada' ? 'bg-gray-500' : 'bg-red-600'">
          <strong class="text-sm">Mesa #{{ v.Mesa?.numero || 'Fast Food' }}</strong>
          <span class="text-sm font-semibold">Total: ${{ v.total }}</span>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800">
          <p v-if="v.cliente" class="text-sm text-gray-700 dark:text-gray-300 mb-2"><strong class="text-gray-900 dark:text-gray-100">Cliente:</strong> {{ v.cliente }}</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm mb-2">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800">
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.U.</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th v-if="v.estado === 'abierta'" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="d in (v.DetalleVentas || v.DetalleVenta || [])" :key="d.id">
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ d.Producto?.nombre }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ d.cantidad }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ d.precioUnitario }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ d.subtotal }}</td>
                  <td v-if="v.estado === 'abierta'" class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white rounded-lg transition-colors mr-1" :disabled="d.cantidad <= 1" @click="pedidoStore.editarDetalle(v.id, d.id, d.cantidad - 1).then(() => cargarDatos())">-</button>
                    <span class="mx-1 text-gray-900 dark:text-gray-100">{{ d.cantidad }}</span>
                    <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white rounded-lg transition-colors mr-1" @click="pedidoStore.editarDetalle(v.id, d.id, d.cantidad + 1).then(() => cargarDatos())">+</button>
                    <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors mr-1" @click="abrirEditarCantidad(d)">&#9998;</button>
                    <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="eliminarProducto(v.id, d)">&#128465;</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex gap-2 mt-2">
            <button v-if="v.estado === 'abierta'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors" @click="abrirAgregar(v)">+ Agregar Producto</button>
            <button v-if="v.estado === 'abierta'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" @click="abrirCobro(v)">Cobrar</button>
            <button v-if="v.estado === 'abierta'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors" @click="ventaSplit = v">Dividir Cuenta</button>
            <button v-if="v.estado === 'abierta'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="cancelarPedido(v.id)">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
    </template>

    <ModalBase v-if="modalNuevoAbierto" id="nuevoPedidoModal" titulo="Nuevo Pedido" @cerrar="modalNuevoAbierto = false">
      <PedidoFormModal @cerrar="modalNuevoAbierto = false" @guardado="cargarDatos" />
    </ModalBase>

    <ModalBase v-if="agregandoAVenta" id="addProductosModal" titulo="Agregar Productos" @cerrar="agregandoAVenta = null">
      <div>
        <input v-model="busqueda" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500 mb-2" placeholder="Buscar...">
        <div style="max-height:150px;overflow-y:auto">
          <button v-for="p in filtrados" :key="p.id" type="button"
            class="w-full text-left mb-1 px-3 py-1.5 text-xs border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white rounded-lg transition-colors block"
            @click="agregarProducto(p)">
            <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre" loading="lazy" class="rounded-lg mr-1 inline-block"
              style="width:24px;height:24px;object-fit:cover">
            {{ p.nombre }} - ${{ p.precioVenta }}
          </button>
        </div>
        <div v-for="(d,i) in seleccionados" :key="i" class="flex items-center gap-2 mt-2">
          <span class="flex-1 text-xs text-gray-900 dark:text-gray-100">{{ d.nombre }}</span>
          <input v-model.number="d.cantidad" type="number" min="1" class="w-1/4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
            @input="d.subtotal = d.cantidad * d.precioUnitario">
          <span class="text-xs text-gray-900 dark:text-gray-100">${{ Number(d.subtotal).toFixed(2) }}</span>
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" @click="quitarSeleccion(i)">X</button>
        </div>
        <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors w-full mt-2" :disabled="!seleccionados.length" @click="guardarProductos">
          Agregar (${{ totalAgregar.toFixed(2) }})
        </button>
      </div>
    </ModalBase>

    <ModalBase v-if="cobrandoVenta" id="cobroModal" titulo="Cobrar" @cerrar="cobrandoVenta = null">
      <div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm mb-2">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800">
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.U.</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="d in (cobrandoVenta.DetalleVentas || cobrandoVenta.DetalleVenta || [])" :key="d.id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ d.Producto?.nombre }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ d.cantidad }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ d.precioUnitario }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ d.subtotal }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-gray-50 dark:bg-gray-800">
                <th colspan="3" class="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Total:</th>
                <th class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">${{ cobrandoVenta.total }}</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metodo de Pago</label>
          <select v-model="metodoPago" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors w-full" @click="confirmarCobro">Confirmar Cobro</button>
      </div>
    </ModalBase>

    <ModalBase v-if="editandoDetalle" id="editarCantidadModal" titulo="Editar Cantidad" @cerrar="editandoDetalle = null">
      <div>
        <p class="text-sm text-gray-900 dark:text-gray-100 mb-2"><strong>Producto:</strong> {{ editandoDetalle.Producto?.nombre }}</p>
        <div class="flex items-center gap-2 mb-3">
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white rounded-lg transition-colors" :disabled="cantidadEditar <= 1" @click="cantidadEditar--">-</button>
          <input v-model.number="cantidadEditar" type="number" min="1" class="w-1/4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-center focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500">
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white rounded-lg transition-colors" @click="cantidadEditar++">+</button>
        </div>
        <p class="text-sm text-gray-900 dark:text-gray-100 mb-3"><strong>Subtotal:</strong> ${{ (cantidadEditar * editandoDetalle.precioUnitario).toFixed(2) }}</p>
        <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors w-full" @click="guardarCantidad">Guardar</button>
      </div>
    </ModalBase>

    <SplitBillModal v-if="ventaSplit" :venta="ventaSplit" @cerrar="ventaSplit = null" @cobrado="ventaSplit = null; cargarDatos()" />
  </div>
</template>
