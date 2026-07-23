<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRecetaStore } from '../../stores/recetas'
import { useProductoStore } from '../../stores/productos'
import { useToastStore } from '../../stores/toast'

const props = defineProps<{
  receta?: any
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const store = useRecetaStore()
const productoStore = useProductoStore()
const toast = useToastStore()
const guardando = ref(false)

interface DetalleForm {
  insumoId: number | null
  cantidad: number
  unidad: string
  merma: number
}

const form = ref({
  nombre: '',
  porciones: 1,
  productoId: null as number | null,
  detalles: [] as DetalleForm[],
})

const productos = ref<any[]>([])
const insumos = ref<any[]>([])

watch(() => props.abierto, async (val) => {
  if (val) {
    await cargarProductos()
    if (props.receta) {
      form.value = {
        nombre: props.receta.nombre,
        porciones: props.receta.porciones,
        productoId: props.receta.productoId,
        detalles: (props.receta.DetalleRecetas || []).map((d: any) => ({
          insumoId: d.insumoId,
          cantidad: d.cantidad,
          unidad: d.unidad,
          merma: d.merma,
        })),
      }
    } else {
      form.value = {
        nombre: '',
        porciones: 1,
        productoId: null,
        detalles: [],
      }
    }
  }
})

async function cargarProductos() {
  try {
    await productoStore.fetchProductos()
    productos.value = productoStore.productos.filter((p: any) => p.tipo === 'compuesto')
    insumos.value = productoStore.productos.filter((p: any) => p.tipo === 'insumo')
  } catch {
    toast.error('Error al cargar productos')
  }
}

function agregarIngrediente() {
  form.value.detalles.push({ insumoId: null, cantidad: 1, unidad: 'unidad', merma: 0 })
}

function quitarIngrediente(index: number) {
  form.value.detalles.splice(index, 1)
}

async function guardar() {
  if (!form.value.productoId) {
    toast.warning('Seleccioná un producto compuesto')
    return
  }
  if (!form.value.nombre.trim()) {
    toast.warning('Ingresá un nombre para la receta')
    return
  }
  if (form.value.detalles.length === 0) {
    toast.warning('Agregá al menos un ingrediente')
    return
  }

  guardando.value = true
  try {
    if (props.receta) {
      await store.updateReceta(props.receta.id, form.value)
      toast.success('Receta actualizada')
    } else {
      await store.createReceta(form.value)
      toast.success('Receta creada')
    }
    emit('guardado')
    emit('cerrar')
  } catch {
    toast.error('Error al guardar receta')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="form-label">Producto Compuesto</label>
      <select v-model="form.productoId" class="form-select" required>
        <option :value="null" disabled>Seleccionar producto</option>
        <option v-for="p in productos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
      </select>
    </div>
    <div class="row mb-2">
      <div class="col">
        <label class="form-label">Nombre Receta</label>
        <input v-model="form.nombre" class="form-control" required>
      </div>
      <div class="col">
        <label class="form-label">Porciones</label>
        <input v-model.number="form.porciones" type="number" min="1" class="form-control" required>
      </div>
    </div>

    <hr>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label class="form-label mb-0 fw-bold">Ingredientes</label>
      <button type="button" class="btn btn-sm btn-outline-success" @click="agregarIngrediente">+ Agregar</button>
    </div>

    <div v-if="form.detalles.length === 0" class="text-muted text-center mb-2">
      Sin ingredientes
    </div>

    <div v-for="(d, i) in form.detalles" :key="i" class="row g-1 mb-1 align-items-end">
      <div class="col-4">
        <select v-model="d.insumoId" class="form-select form-select-sm" required>
          <option :value="null" disabled>Insumo</option>
          <option v-for="ins in insumos" :key="ins.id" :value="ins.id">{{ ins.nombre }}</option>
        </select>
      </div>
      <div class="col-2">
        <input v-model.number="d.cantidad" type="number" step="0.01" min="0.01" class="form-control form-control-sm" placeholder="Cant." required>
      </div>
      <div class="col-2">
        <select v-model="d.unidad" class="form-select form-select-sm">
          <option value="kg">Kg</option>
          <option value="g">g</option>
          <option value="litro">Litro</option>
          <option value="ml">ml</option>
          <option value="unidad">Unidad</option>
        </select>
      </div>
      <div class="col-2">
        <input v-model.number="d.merma" type="number" step="0.01" min="0" max="100" class="form-control form-control-sm" placeholder="Merma %">
      </div>
      <div class="col-2 text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" @click="quitarIngrediente(i)">X</button>
      </div>
    </div>

    <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="guardando">
      <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
      {{ guardando ? 'Guardando...' : (receta ? 'Actualizar' : 'Crear') + ' Receta' }}
    </button>
  </form>
</template>
