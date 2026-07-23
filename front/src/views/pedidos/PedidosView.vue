<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePedidoStore } from '../../stores/pedidos'
import { useToastStore } from '../../stores/toast'
import api from '../../services/api'
import ModalBase from '../../components/common/ModalBase.vue'
import PedidoFormModal from '../../components/pedidos/PedidoFormModal.vue'

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
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Pedidos</h2>
      <button class="btn btn-primary" @click="modalNuevoAbierto = true">+ Nuevo Pedido</button>
    </div>

    <div class="mt-3">
      <select class="form-select w-auto" v-model="filtroEstado" @change="cambiarFiltro">
        <option value="">Todos</option>
        <option value="abierta">Activos</option>
        <option value="cerrada">Cerrados</option>
        <option value="cancelada">Cancelados</option>
      </select>
    </div>

    <div v-if="pedidoStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <div v-else-if="!pedidoStore.pedidos.length" class="text-center mt-4">
      <p>No hay pedidos</p>
    </div>

    <div v-else class="row mt-3" v-for="v in pedidoStore.pedidos" :key="v.id">
      <div class="col-12 mb-3">
        <div class="card" :class="v.estado === 'cerrada' ? 'border-success' : v.estado === 'cancelada' ? 'border-secondary' : 'border-danger'">
          <div class="card-header d-flex justify-content-between align-items-center" :class="v.estado === 'cerrada' ? 'bg-success' : v.estado === 'cancelada' ? 'bg-secondary' : 'bg-danger'" style="color:white">
            <strong>Mesa #{{ v.Mesa?.numero || 'Fast Food' }}</strong>
            <span>Total: ${{ v.total }}</span>
          </div>
          <div class="card-body">
            <p v-if="v.cliente"><strong>Cliente:</strong> {{ v.cliente }}</p>
            <table class="table table-sm mb-2">
              <thead>
                <tr><th>Producto</th><th>Cant</th><th>P.U.</th><th>Subtotal</th><th v-if="v.estado === 'abierta'">Acciones</th></tr>
              </thead>
              <tbody>
                <tr v-for="d in (v.DetalleVentas || v.DetalleVenta || [])" :key="d.id">
                  <td>{{ d.Producto?.nombre }}</td>
                  <td>{{ d.cantidad }}</td>
                  <td>${{ d.precioUnitario }}</td>
                  <td>${{ d.subtotal }}</td>
                  <td v-if="v.estado === 'abierta'" class="text-nowrap">
                    <button class="btn btn-sm btn-outline-secondary me-1" :disabled="d.cantidad <= 1" @click="pedidoStore.editarDetalle(v.id, d.id, d.cantidad - 1).then(() => cargarDatos())">-</button>
                    <span class="mx-1">{{ d.cantidad }}</span>
                    <button class="btn btn-sm btn-outline-secondary me-1" @click="pedidoStore.editarDetalle(v.id, d.id, d.cantidad + 1).then(() => cargarDatos())">+</button>
                    <button class="btn btn-sm btn-outline-primary me-1" @click="abrirEditarCantidad(d)">&#9998;</button>
                    <button class="btn btn-sm btn-outline-danger" @click="eliminarProducto(v.id, d)">&#128465;</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex gap-2">
              <button v-if="v.estado === 'abierta'" class="btn btn-sm btn-warning" @click="abrirAgregar(v)">+ Agregar Producto</button>
              <button v-if="v.estado === 'abierta'" class="btn btn-sm btn-success" @click="abrirCobro(v)">Cobrar</button>
              <button v-if="v.estado === 'abierta'" class="btn btn-sm btn-outline-danger" @click="cancelarPedido(v.id)">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalBase v-if="modalNuevoAbierto" id="nuevoPedidoModal" titulo="Nuevo Pedido" @cerrar="modalNuevoAbierto = false">
      <PedidoFormModal @cerrar="modalNuevoAbierto = false" @guardado="cargarDatos" />
    </ModalBase>

    <ModalBase v-if="agregandoAVenta" id="addProductosModal" titulo="Agregar Productos" @cerrar="agregandoAVenta = null">
      <div>
        <input v-model="busqueda" class="form-control mb-2" placeholder="Buscar...">
        <div style="max-height:150px;overflow-y:auto">
          <button v-for="p in filtrados" :key="p.id" type="button"
            class="btn btn-outline-secondary btn-sm d-block w-100 text-start mb-1"
            @click="agregarProducto(p)">
            <img v-if="p.imagen" :src="p.imagen" class="rounded me-1"
              style="width:24px;height:24px;object-fit:cover">
            {{ p.nombre }} - ${{ p.precioVenta }}
          </button>
        </div>
        <div v-for="(d,i) in seleccionados" :key="i" class="d-flex align-items-center gap-2 mt-2">
          <span class="flex-grow-1 small">{{ d.nombre }}</span>
          <input v-model.number="d.cantidad" type="number" min="1" class="form-control form-control-sm w-25"
            @input="d.subtotal = d.cantidad * d.precioUnitario">
          <span class="small">${{ Number(d.subtotal).toFixed(2) }}</span>
          <button class="btn btn-sm btn-danger" @click="quitarSeleccion(i)">X</button>
        </div>
        <button class="btn btn-primary w-100 mt-2" :disabled="!seleccionados.length" @click="guardarProductos">
          Agregar (${{ totalAgregar.toFixed(2) }})
        </button>
      </div>
    </ModalBase>

    <ModalBase v-if="cobrandoVenta" id="cobroModal" titulo="Cobrar" @cerrar="cobrandoVenta = null">
      <div>
        <table class="table table-sm mb-2">
          <thead>
            <tr><th>Producto</th><th>Cant</th><th>P.U.</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            <tr v-for="d in (cobrandoVenta.DetalleVentas || cobrandoVenta.DetalleVenta || [])" :key="d.id">
              <td>{{ d.Producto?.nombre }}</td>
              <td>{{ d.cantidad }}</td>
              <td>${{ d.precioUnitario }}</td>
              <td>${{ d.subtotal }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colspan="3" class="text-end">Total:</th>
              <th>${{ cobrandoVenta.total }}</th>
            </tr>
          </tfoot>
        </table>
        <div class="mb-3">
          <label class="form-label">Metodo de Pago</label>
          <select v-model="metodoPago" class="form-select">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <button class="btn btn-success w-100" @click="confirmarCobro">Confirmar Cobro</button>
      </div>
    </ModalBase>

    <ModalBase v-if="editandoDetalle" id="editarCantidadModal" titulo="Editar Cantidad" @cerrar="editandoDetalle = null">
      <div>
        <p><strong>Producto:</strong> {{ editandoDetalle.Producto?.nombre }}</p>
        <div class="d-flex align-items-center gap-2 mb-3">
          <button class="btn btn-outline-secondary" :disabled="cantidadEditar <= 1" @click="cantidadEditar--">-</button>
          <input v-model.number="cantidadEditar" type="number" min="1" class="form-control w-25 text-center">
          <button class="btn btn-outline-secondary" @click="cantidadEditar++">+</button>
        </div>
        <p><strong>Subtotal:</strong> ${{ (cantidadEditar * editandoDetalle.precioUnitario).toFixed(2) }}</p>
        <button class="btn btn-primary w-100" @click="guardarCantidad">Guardar</button>
      </div>
    </ModalBase>
  </div>
</template>
