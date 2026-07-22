<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useVentaStore } from '../../stores/ventas'
import ModalBase from '../../components/common/ModalBase.vue'

const router = useRouter()
const ventaStore = useVentaStore()
const ventasAbiertas = ref<any[]>([])
const cobrandoVenta = ref<any>(null)
const metodoPago = ref('efectivo')
const agregandoAVenta = ref<any>(null)
const showProductSelector = ref(false)
const productos = ref<any[]>([])
const busqueda = ref('')
const seleccionados = ref<{ productoId: number; nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[]>([])

onMounted(async () => {
  try {
    const [ventasRes, prodRes] = await Promise.all([
      api.get('/ventas?estado=abierta'),
      api.get('/productos'),
    ])
    ventasAbiertas.value = ventasRes.data
    productos.value = prodRes.data
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
  }
})

const filtrados = computed(() => {
  if (!busqueda.value) return productos.value
  const q = busqueda.value.toLowerCase()
  return productos.value.filter((p: any) => p.nombre.toLowerCase().includes(q))
})

const totalSeleccion = computed(() => seleccionados.value.reduce((s, d) => s + d.subtotal, 0))

function abrirAgregar(venta: any) {
  agregandoAVenta.value = venta
  seleccionados.value = []
  busqueda.value = ''
  showProductSelector.value = true
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
}

function quitarSeleccion(i: number) {
  seleccionados.value.splice(i, 1)
}

async function guardarProductos() {
  if (!agregandoAVenta.value || !seleccionados.value.length) return
  await ventaStore.addProductos(
    agregandoAVenta.value.id,
    seleccionados.value.map((d) => ({
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    }))
  )
  agregandoAVenta.value = null
  seleccionados.value = []
  const { data } = await api.get('/ventas?estado=abierta')
  ventasAbiertas.value = data
}

function abrirCobro(venta: any) {
  cobrandoVenta.value = venta
  metodoPago.value = 'efectivo'
}

async function confirmarCobro() {
  if (!cobrandoVenta.value) return
  await ventaStore.cobrarVenta(cobrandoVenta.value.id, metodoPago.value)
  cobrandoVenta.value = null
  const { data } = await api.get('/ventas?estado=abierta')
  ventasAbiertas.value = data
}
</script>

<template>
  <div class="container mt-4">
    <h2>Pedidos Activos (Mesas Ocupadas)</h2>

    <div v-if="!ventasAbiertas.length" class="text-center mt-4">
      <p>No hay pedidos activos</p>
      <router-link to="/mesas" class="btn btn-primary">Ir a Mesas</router-link>
    </div>

    <div class="row mt-3" v-for="v in ventasAbiertas" :key="v.id">
      <div class="col-12 mb-3">
        <div class="card border-danger">
          <div class="card-header d-flex justify-content-between align-items-center bg-danger text-white">
            <strong>Mesa #{{ v.Mesa?.numero || 'Fast Food' }}</strong>
            <span>Total: ${{ v.total }}</span>
          </div>
          <div class="card-body">
            <table class="table table-sm mb-2">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant</th>
                  <th>P.U.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in v.DetalleVentas" :key="d.id">
                  <td>{{ d.Producto?.nombre }}</td>
                  <td>{{ d.cantidad }}</td>
                  <td>${{ d.precioUnitario }}</td>
                  <td>${{ d.subtotal }}</td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-warning" @click="abrirAgregar(v)">+ Agregar Producto</button>
              <button class="btn btn-sm btn-success" @click="abrirCobro(v)">Cobrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal agregar productos -->
    <ModalBase v-if="agregandoAVenta" id="addProductosModal" titulo="Agregar Productos" @cerrar="agregandoAVenta = null">
      <div>
        <input v-model="busqueda" class="form-control mb-2" placeholder="Buscar producto...">
        <div style="max-height: 150px; overflow-y: auto;">
          <button v-for="p in filtrados" :key="p.id" type="button"
            class="btn btn-outline-secondary btn-sm d-block w-100 text-start mb-1"
            @click="agregarProducto(p)">
            {{ p.nombre }} - ${{ p.precioVenta }}
          </button>
        </div>

        <div v-for="(d, i) in seleccionados" :key="i" class="d-flex align-items-center gap-2 mt-2">
          <span class="flex-grow-1 small">{{ d.nombre }}</span>
          <input v-model.number="d.cantidad" type="number" min="1" class="form-control form-control-sm w-25"
            @input="d.subtotal = d.cantidad * d.precioUnitario">
          <span class="small">${{ Number(d.subtotal).toFixed(2) }}</span>
          <button class="btn btn-sm btn-danger" @click="quitarSeleccion(i)">X</button>
        </div>

        <button class="btn btn-primary w-100 mt-2" :disabled="!seleccionados.length" @click="guardarProductos">
          Agregar (Total: ${{ totalSeleccion.toFixed(2) }})
        </button>
      </div>
    </ModalBase>

    <!-- Modal cobrar -->
    <ModalBase v-if="cobrandoVenta" id="cobroModal" titulo="Cobrar Venta" @cerrar="cobrandoVenta = null">
      <div>
        <p><strong>Total a cobrar: ${{ cobrandoVenta.total }}</strong></p>
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
  </div>
</template>
