<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProductoStore } from '../../stores/productos'
import { useToastStore } from '../../stores/toast'
import { useRoles } from '../../composables/useRoles'
import ModalBase from '../../components/common/ModalBase.vue'
import ProductoFormModal from '../../components/productos/ProductoFormModal.vue'
import type { Producto } from '../../types'

const productoStore = useProductoStore()
const toast = useToastStore()
const { canCreate, canEdit, canDelete } = useRoles()

const modalAbierto = ref(false)
const productoEditando = ref<Producto | undefined>(undefined)

onMounted(() => {
  productoStore.fetchProductos()
})

const productosCompuestos = computed(() =>
  productoStore.productos.filter((p) => p.tipo === 'compuesto')
)

function abrirModal(producto?: Producto) {
  productoEditando.value = producto
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  productoEditando.value = undefined
}

async function eliminar(id: number) {
  if (confirm('¿Desactivar este producto compuesto?')) {
    try {
      await productoStore.desactivarProducto(id)
      toast.success('Producto compuesto desactivado')
      await productoStore.fetchProductos()
    } catch {
      toast.error('Error al desactivar producto')
    }
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Recetas (Productos Compuestos)</h2>
      <button v-if="canCreate" class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors" @click="abrirModal()">+ Nuevo Producto Compuesto</button>
    </div>

    <div v-if="productoStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600"></span>
    </div>

    <div v-else-if="productosCompuestos.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 align-middle">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto Compuesto</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredientes (Receta)</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
          <tr v-for="p in productosCompuestos" :key="p.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              <img v-if="p.imagen" :src="p.imagen" alt="" class="rounded-lg" style="width: 40px; height: 40px; object-fit: cover;">
              <span v-else class="text-gray-500 dark:text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{{ p.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 capitalize">{{ p.categoria }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ Number(p.precioVenta).toFixed(2) }}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
              <ul v-if="p.detallesReceta && p.detallesReceta.length > 0" class="mb-0 ps-3 text-xs">
                <li v-for="d in p.detallesReceta" :key="d.id">
                  {{ d.insumo?.nombre || 'Insumo #' + d.insumoId }}
                  — {{ d.cantidad }} {{ d.unidad }}
                  <span v-if="d.merma > 0" class="text-gray-500 dark:text-gray-400">(merma {{ d.merma }}%)</span>
                </li>
              </ul>
              <span v-else class="text-gray-500 dark:text-gray-400 text-xs">Sin ingredientes</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-right">
              <button v-if="canEdit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors mr-1" @click="abrirModal(p)">Editar</button>
              <button v-if="canDelete" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="eliminar(p.id)">X</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!productoStore.loading && productosCompuestos.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-4">
      No hay productos compuestos (recetas) registrados
    </div>

    <ModalBase v-if="modalAbierto" id="productoModal" :titulo="productoEditando ? 'Editar Producto Compuesto' : 'Nuevo Producto Compuesto'" @cerrar="cerrarModal">
      <ProductoFormModal :producto="productoEditando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="productoStore.fetchProductos()" />
    </ModalBase>
  </div>
</template>
