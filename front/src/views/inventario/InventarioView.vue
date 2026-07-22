<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProductoStore } from '../../stores/productos'
import ModalBase from '../../components/common/ModalBase.vue'
import ProductoFormModal from '../../components/productos/ProductoFormModal.vue'

const productoStore = useProductoStore()
const categoriaFiltro = ref('')
const modalAbierto = ref(false)
const editando = ref<any>(null)

onMounted(() => {
  productoStore.fetchProductos()
})

function filtrar() {
  productoStore.fetchProductos(categoriaFiltro.value || undefined)
}

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
    await productoStore.desactivarProducto(id)
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Inventario</h2>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo Producto</button>
    </div>

    <div class="mt-3">
      <select class="form-select w-auto" v-model="categoriaFiltro" @change="filtrar">
        <option value="">Todas las categorias</option>
        <option value="bebida">Bebidas</option>
        <option value="comida">Comida</option>
        <option value="insumo">Insumos</option>
        <option value="postre">Postres</option>
      </select>
    </div>

    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>Precio Compra</th>
          <th>Precio Venta</th>
          <th>Stock</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productoStore.productos" :key="p.id">
          <td>{{ p.nombre }}</td>
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
            <button class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(p)">Editar</button>
            <button class="btn btn-sm btn-outline-danger" @click="eliminar(p.id)">X</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalBase v-if="modalAbierto" id="productoModal" :titulo="editando ? 'Editar Producto' : 'Nuevo Producto'" @cerrar="cerrarModal">
      <ProductoFormModal :producto="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="productoStore.fetchProductos()" />
    </ModalBase>
  </div>
</template>
