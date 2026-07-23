<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProductoStore } from '../../stores/productos'

const props = defineProps<{
  producto?: any
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const store = useProductoStore()
const guardando = ref(false)
const form = ref({
  nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
  precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad',
})

watch(() => props.abierto, (val) => {
  if (val && props.producto) {
    form.value = { ...props.producto }
  } else if (val) {
    form.value = {
      nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
      precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad',
    }
  }
})

async function guardar() {
  guardando.value = true
  try {
    if (props.producto) {
      await store.updateProducto(props.producto.id, form.value)
    } else {
      await store.createProducto(form.value)
    }
    emit('guardado')
    emit('cerrar')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="form-label">Nombre</label>
      <input v-model="form.nombre" class="form-control" required>
    </div>
    <div class="mb-2">
      <label class="form-label">Descripcion</label>
      <textarea v-model="form.descripcion" class="form-control" rows="2"></textarea>
    </div>
    <div class="row mb-2">
      <div class="col">
        <label class="form-label">Categoria</label>
        <select v-model="form.categoria" class="form-select">
          <option value="comida">Comida</option>
          <option value="bebida">Bebida</option>
          <option value="postre">Postre</option>
          <option value="insumo">Insumo</option>
        </select>
      </div>
      <div class="col">
        <label class="form-label">Unidad</label>
        <select v-model="form.unidad" class="form-select">
          <option value="unidad">Unidad</option>
          <option value="kg">Kg</option>
          <option value="litro">Litro</option>
          <option value="docena">Docena</option>
        </select>
      </div>
    </div>
    <div class="mb-2">
      <label class="form-label">Tipo</label>
      <select v-model="form.tipo" class="form-select">
        <option value="directo">Directo</option>
        <option value="insumo">Insumo</option>
        <option value="compuesto">Compuesto</option>
      </select>
    </div>
    <div class="row mb-2">
      <div class="col">
        <label class="form-label">Precio Compra</label>
        <input v-model.number="form.precioCompra" type="number" step="0.01" class="form-control" required min="0">
      </div>
      <div class="col">
        <label class="form-label">Precio Venta</label>
        <input v-model.number="form.precioVenta" type="number" step="0.01" class="form-control" required min="0">
      </div>
    </div>
    <div class="row mb-2">
      <div class="col">
        <label class="form-label">Stock</label>
        <input v-model.number="form.stock" type="number" class="form-control" min="0">
      </div>
      <div class="col">
        <label class="form-label">Stock Minimo</label>
        <input v-model.number="form.stockMinimo" type="number" class="form-control" min="0">
      </div>
    </div>
    <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="guardando">
      <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
      {{ guardando ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear') + ' Producto' }}
    </button>
  </form>
</template>
