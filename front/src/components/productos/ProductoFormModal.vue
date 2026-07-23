<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProductoStore } from '../../stores/productos'
import { useToastStore } from '../../stores/toast'
import api from '../../services/api'

const props = defineProps<{
  producto?: any
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const store = useProductoStore()
const toast = useToastStore()
const guardando = ref(false)
const form = ref({
  nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
  precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad',
})

const archivo = ref<File | null>(null)
const previewUrl = ref('')

watch(() => props.abierto, (val) => {
  if (val && props.producto) {
    form.value = { ...props.producto }
    previewUrl.value = props.producto.imagen || ''
  } else if (val) {
    form.value = {
      nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
      precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad',
    }
    previewUrl.value = ''
  }
  archivo.value = null
})

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  archivo.value = input.files[0]
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(archivo.value)
}

async function subirImagen(): Promise<string | null> {
  if (!archivo.value) return null
  const fd = new FormData()
  fd.append('imagen', archivo.value)
  const { data } = await api.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

async function guardar() {
  guardando.value = true
  try {
    let productoGuardado: any
    if (props.producto) {
      productoGuardado = await store.updateProducto(props.producto.id, form.value)
    } else {
      productoGuardado = await store.createProducto(form.value)
    }
    if (archivo.value) {
      const url = await subirImagen()
      if (url) {
        await store.updateProducto(productoGuardado.id, { imagen: url })
      }
    }
    toast.success(props.producto ? 'Producto actualizado' : 'Producto creado')
    emit('guardado')
    emit('cerrar')
  } catch {
    toast.error('Error al guardar producto')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="form-label">Imagen</label>
      <input type="file" class="form-control" accept="image/*" @change="onFileChange">
      <div v-if="previewUrl" class="mt-2 text-center">
        <img :src="previewUrl" alt="Preview" class="rounded" style="max-width:120px;max-height:120px;object-fit:cover">
      </div>
    </div>
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
