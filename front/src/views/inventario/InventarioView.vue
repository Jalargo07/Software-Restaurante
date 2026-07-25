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
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Inventario</h2>
      <button v-if="canCreate" class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors" @click="abrirModal()">+ Nuevo Producto</button>
    </div>

    <div class="mt-3 flex gap-2 flex-wrap">
      <input type="text" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500 w-auto" v-model="busqueda" placeholder="Buscar por nombre...">
      <select class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-auto" v-model="categoriaFiltro" @change="filtrar">
        <option value="">Todas las categorias</option>
        <option value="bebida">Bebidas</option>
        <option value="comida">Comida</option>
        <option value="insumo">Insumos</option>
        <option value="postre">Postres</option>
      </select>
      <select class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-auto" v-model="tipoFiltro">
        <option value="">Todos los tipos</option>
        <option value="directo">Directo</option>
        <option value="insumo">Insumo</option>
        <option value="compuesto">Compuesto</option>
      </select>
    </div>

    <div v-if="productoStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <template v-else>
      <div class="overflow-x-auto mt-3">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Foto</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Categoria</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Precio Compra</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Precio Venta</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="p in productosPaginados" :key="p.id">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden md:table-cell">
                <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre" loading="lazy"
                  class="rounded-lg" style="width:40px;height:40px;object-fit:cover">
                <span v-else class="text-gray-500 dark:text-gray-400">&mdash;</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ p.nombre }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden md:table-cell">
                <span :class="p.tipo === 'compuesto' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : p.tipo === 'insumo' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'">
                  {{ p.tipo || 'directo' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden lg:table-cell">{{ p.categoria }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden md:table-cell">${{ p.precioCompra }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden lg:table-cell">${{ p.precioVenta }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ p.stock }} {{ p.unidad }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span :class="p.stock <= p.stockMinimo ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'">
                  {{ p.stock <= p.stockMinimo ? 'Bajo' : 'OK' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <button v-if="canEdit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors mr-1" @click="abrirModal(p)">Editar</button>
                <button v-if="canDelete" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="eliminar(p.id)">X</button>
              </td>
            </tr>
            <tr v-if="productosPaginados.length === 0">
              <td colspan="9" class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No se encontraron productos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPaginas > 1" class="flex items-center justify-between mt-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button class="px-3 py-1.5 text-xs border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual >= totalPaginas" @click="paginaActual++">
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
