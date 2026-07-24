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
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Recetas (Productos Compuestos)</h2>
      <button v-if="canCreate" class="btn btn-primary" @click="abrirModal()">+ Nuevo Producto Compuesto</button>
    </div>

    <div v-if="productoStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <table v-else-if="productosCompuestos.length > 0" class="table table-striped align-middle">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Producto Compuesto</th>
          <th>Categoría</th>
          <th>Precio Venta</th>
          <th>Ingredientes (Receta)</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productosCompuestos" :key="p.id">
          <td>
            <img v-if="p.imagen" :src="p.imagen" alt="" class="rounded" style="width: 40px; height: 40px; object-fit: cover;">
            <span v-else class="text-muted">—</span>
          </td>
          <td class="fw-bold">{{ p.nombre }}</td>
          <td class="text-capitalize">{{ p.categoria }}</td>
          <td>${{ Number(p.precioVenta).toFixed(2) }}</td>
          <td>
            <ul v-if="p.detallesReceta && p.detallesReceta.length > 0" class="mb-0 ps-3 small">
              <li v-for="d in p.detallesReceta" :key="d.id">
                {{ d.insumo?.nombre || 'Insumo #' + d.insumoId }}
                — {{ d.cantidad }} {{ d.unidad }}
                <span v-if="d.merma > 0" class="text-muted">(merma {{ d.merma }}%)</span>
              </li>
            </ul>
            <span v-else class="text-muted small">Sin ingredientes</span>
          </td>
          <td class="text-end">
            <button v-if="canEdit" class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(p)">Editar</button>
            <button v-if="canDelete" class="btn btn-sm btn-outline-danger" @click="eliminar(p.id)">X</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!productoStore.loading && productosCompuestos.length === 0" class="text-center text-muted mt-4">
      No hay productos compuestos (recetas) registrados
    </div>

    <ModalBase v-if="modalAbierto" id="productoModal" :titulo="productoEditando ? 'Editar Producto Compuesto' : 'Nuevo Producto Compuesto'" @cerrar="cerrarModal">
      <ProductoFormModal :producto="productoEditando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="productoStore.fetchProductos()" />
    </ModalBase>
  </div>
</template>
