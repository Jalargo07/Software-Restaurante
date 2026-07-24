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
  if (!busqueda.value) return productos.value
  const q = busqueda.value.toLowerCase()
  return productos.value.filter((p: any) => p.nombre.toLowerCase().includes(q))
})

const totalPedido = computed(() => seleccionados.value.reduce((s, d) => s + d.subtotal, 0))

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
    const venta = await ventaStore.createVenta({ mesaId: ocupandoMesa.value.id })
    await ventaStore.addProductos(
      venta.id,
      seleccionados.value.map((d) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      }))
    )
    await mesaStore.fetchMesas()
    toast.success('Pedido guardado')
    cerrarPedido()
  } catch {
    toast.error('Error al guardar pedido')
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
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Gestion de Mesas</h2>
      <button class="btn btn-primary" @click="abrirModal()">+ Nueva Mesa</button>
    </div>

    <div v-if="mesaStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <div class="row mt-3" v-else-if="mesaStore.mesas.length">
      <div class="col-md-3 mb-3" v-for="mesa in mesaStore.mesas" :key="mesa.id">
        <div class="card">
          <div class="card-body text-center">
            <h5>Mesa #{{ mesa.numero }}</h5>
            <p>Capacidad: {{ mesa.capacidad }} personas</p>
            <p v-if="mesa.ubicacion" class="text-muted small">{{ mesa.ubicacion }}</p>
            <span :class="`badge bg-${estadoColor(mesa.estado)}`">{{ mesa.estado }}</span>
            <div class="mt-2">
              <button v-if="mesa.estado === 'disponible'" class="btn btn-sm btn-success me-1" @click="abrirPedido(mesa)">Ocupar</button>
              <button v-if="mesa.estado === 'ocupada'" class="btn btn-sm btn-warning me-1" @click="verPedido(mesa)">Ver Pedido</button>
              <button class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(mesa)">Editar</button>
              <button class="btn btn-sm btn-outline-danger" @click="eliminar(mesa.id)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!mesaStore.loading" class="text-center mt-4">
      <p>No hay mesas registradas</p>
    </div>

    <ModalBase v-if="modalAbierto" id="mesaModal" :titulo="editando ? 'Editar Mesa' : 'Nueva Mesa'" @cerrar="cerrarModal">
      <MesaFormModal :mesa="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="mesaStore.fetchMesas()" />
    </ModalBase>

    <ModalBase v-if="ocupandoMesa" id="pedidoModal" :titulo="`Pedido - Mesa #${ocupandoMesa.numero}`" @cerrar="cerrarPedido">
      <div>
        <button type="button" class="btn btn-sm btn-outline-success mb-2" @click="mostrarSelector = !mostrarSelector">
          + Agregar Producto
        </button>

        <div v-if="mostrarSelector">
          <input v-model="busqueda" class="form-control form-control-sm mb-1" placeholder="Buscar...">
          <div style="max-height: 150px; overflow-y: auto;">
            <button v-for="p in filtrados" :key="p.id" type="button"
              class="btn btn-outline-secondary btn-sm d-block w-100 text-start mb-1"
              @click="agregarProducto(p)">
              {{ p.nombre }} - ${{ p.precioVenta }}
            </button>
            <p v-if="!filtrados.length" class="text-muted small">Sin resultados</p>
          </div>
        </div>

        <div v-for="(d, i) in seleccionados" :key="i" class="d-flex align-items-center gap-2 mt-2 mb-1">
          <span class="flex-grow-1 small">{{ d.nombre }}</span>
          <input v-model.number="d.cantidad" type="number" min="1" class="form-control form-control-sm w-25"
            @input="d.subtotal = d.cantidad * d.precioUnitario">
          <span class="small">${{ Number(d.subtotal).toFixed(2) }}</span>
          <button class="btn btn-sm btn-danger" @click="quitarSeleccion(i)">X</button>
        </div>

        <h5 class="text-end mt-2">Total: ${{ totalPedido.toFixed(2) }}</h5>
        <button class="btn btn-success w-100 mt-2" :disabled="!seleccionados.length" @click="guardarPedido">
          Guardar Pedido
        </button>
      </div>
    </ModalBase>
  </div>
</template>
