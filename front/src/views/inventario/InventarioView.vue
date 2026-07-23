<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProductoStore } from '../../stores/productos'
import { useToastStore } from '../../stores/toast'
import { useRoles } from '../../composables/useRoles'
import ModalBase from '../../components/common/ModalBase.vue'
import ProductoFormModal from '../../components/productos/ProductoFormModal.vue'

const productoStore = useProductoStore()
const toast = useToastStore()
const { canCreate, canEdit, canDelete } = useRoles()
const categoriaFiltro = ref('')
const tipoFiltro = ref('')
const busqueda = ref('')
const modalAbierto = ref(false)
const editando = ref<any>(null)

const paginaActual = ref(1)
const porPagina = 10

onMounted(() => {
  productoStore.fetchProductos()
})

function filtrar() {
  productoStore.fetchProductos(categoriaFiltro.value || undefined)
}

const productosFiltrados = computed(() => {
  let resultado = productoStore.productos
  if (tipoFiltro.value) {
    resultado = resultado.filter((p: any) => p.tipo === tipoFiltro.value)
  }
  if (busqueda.value.trim()) {
    const texto = busqueda.value.trim().toLowerCase()
    resultado = resultado.filter((p: any) => p.nombre.toLowerCase().includes(texto))
  }
  return resultado
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(productosFiltrados.value.length / porPagina)))

const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return productosFiltrados.value.slice(inicio, inicio + porPagina)
})

watch([busqueda, tipoFiltro, categoriaFiltro], () => {
  paginaActual.value = 1
})

function abrirModal(producto?: any) {
  editando.value = producto ?? null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  editando.value = null
}

async function eliminar(id: number) {
  if (confirm('Desactivar este producto?')) {
    try {
      await productoStore.desactivarProducto(id)
      toast.success('Producto desactivado')
    } catch {
      toast.error('Error al desactivar producto')
    }
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Inventario</h2>
      <button v-if="canCreate" class="btn btn-primary" @click="abrirModal()">+ Nuevo Producto</button>
    </div>

    <div class="mt-3 d-flex gap-2 flex-wrap">
      <input type="text" class="form-control w-auto" v-model="busqueda" placeholder="Buscar por nombre...">
      <select class="form-select w-auto" v-model="categoriaFiltro" @change="filtrar">
        <option value="">Todas las categorias</option>
        <option value="bebida">Bebidas</option>
        <option value="comida">Comida</option>
        <option value="insumo">Insumos</option>
        <option value="postre">Postres</option>
      </select>
      <select class="form-select w-auto" v-model="tipoFiltro">
        <option value="">Todos los tipos</option>
        <option value="directo">Directo</option>
        <option value="insumo">Insumo</option>
        <option value="compuesto">Compuesto</option>
      </select>
    </div>

    <div v-if="productoStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <template v-else>
      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productosPaginados" :key="p.id">
            <td>
              <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre"
                class="rounded" style="width:40px;height:40px;object-fit:cover">
              <span v-else class="text-muted">&mdash;</span>
            </td>
            <td>{{ p.nombre }}</td>
            <td>
              <span :class="{
                'badge bg-primary': p.tipo === 'compuesto',
                'badge bg-warning text-dark': p.tipo === 'insumo',
                'badge bg-secondary': p.tipo === 'directo' || !p.tipo
              }">
                {{ p.tipo || 'directo' }}
              </span>
            </td>
            <td>{{ p.categoria }}</td>
            <td>${{ p.precioCompra }}</td>
            <td>${{ p.precioVenta }}</td>
            <td>{{ p.stock }} {{ p.unidad }}</td>
            <td>
              <span :class="p.stock <= p.stockMinimo ? 'badge bg-danger' : 'badge bg-success'">
                {{ p.stock <= p.stockMinimo ? 'Bajo' : 'OK' }}
              </span>
            </td>
            <td>
              <button v-if="canEdit" class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(p)">Editar</button>
              <button v-if="canDelete" class="btn btn-sm btn-outline-danger" @click="eliminar(p.id)">X</button>
            </td>
          </tr>
          <tr v-if="productosPaginados.length === 0">
            <td colspan="9" class="text-center text-muted py-3">No se encontraron productos</td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="paginaActual >= totalPaginas" @click="paginaActual++">
            Siguiente
          </button>
        </div>
      </div>
    </template>

    <ModalBase v-if="modalAbierto" id="productoModal" :titulo="editando ? 'Editar Producto' : 'Nuevo Producto'" @cerrar="cerrarModal">
      <ProductoFormModal :producto="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="productoStore.fetchProductos()" />
    </ModalBase>
  </div>
</template>
