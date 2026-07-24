<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProductoStore } from '../../stores/productos'
import { useRecetaStore } from '../../stores/recetas'
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
const recetaStore = useRecetaStore()
const toast = useToastStore()
const guardando = ref(false)

interface DetalleRecetaForm {
  insumoId: number | null
  cantidad: number
}

const form = ref({
  nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
  precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad', merma: 0,
})

const recetaForm = ref({
  porciones: 1,
  detalles: [] as DetalleRecetaForm[],
})

const insumos = ref<any[]>([])
const recetaExistenteId = ref<number | null>(null)
const esNuevo = computed(() => !props.producto)

const archivo = ref<File | null>(null)
const previewUrl = ref('')

watch(() => props.abierto, async (val) => {
  if (val) {
    await store.fetchProductos()
    insumos.value = store.productos.filter((p: any) => p.tipo === 'insumo')

    if (props.producto) {
      form.value = { ...props.producto }
      previewUrl.value = props.producto.imagen || ''
      if (props.producto.tipo === 'compuesto') {
        await recetaStore.fetchRecetas()
        const receta = recetaStore.recetas.find((r: any) => r.productoId === props.producto!.id)
        if (receta) {
          recetaExistenteId.value = receta.id
          recetaForm.value = {
            porciones: receta.porciones,
            detalles: (receta.DetalleRecetas || []).map((d: any) => ({
              insumoId: d.insumoId,
              cantidad: d.cantidad,
            })),
          }
        } else {
          recetaExistenteId.value = null
          recetaForm.value = { porciones: 1, detalles: [] }
        }
      } else {
        recetaExistenteId.value = null
        recetaForm.value = { porciones: 1, detalles: [] }
      }
    } else {
      form.value = {
        nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
        precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad', merma: 0,
      }
      previewUrl.value = ''
      recetaExistenteId.value = null
      recetaForm.value = { porciones: 1, detalles: [] }
    }
    archivo.value = null
  }
}, { immediate: true })

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
    headers: { 'Content-Type': undefined },
  })
  return data.url
}

function agregarIngrediente() {
  recetaForm.value.detalles.push({ insumoId: null, cantidad: 1 })
}

function quitarIngrediente(index: number) {
  recetaForm.value.detalles.splice(index, 1)
}

async function guardar() {
  guardando.value = true
  try {
    let imagenUrl: string | null = null
    if (archivo.value) {
      imagenUrl = await subirImagen()
    }
    const payload: any = { ...form.value }
    if (imagenUrl) payload.imagen = imagenUrl

    let productoGuardado: any
    if (props.producto) {
      productoGuardado = await store.updateProducto(props.producto.id, payload)
    } else {
      productoGuardado = await store.createProducto({ ...payload, stock: 0 })
    }
    if (form.value.tipo === 'compuesto' && recetaForm.value.detalles.length > 0) {
      const detalles = recetaForm.value.detalles
        .filter((d) => d.insumoId !== null)
        .map((d) => {
          const insumo = insumos.value.find((i) => i.id === d.insumoId)
          return {
            insumoId: d.insumoId!,
            cantidad: d.cantidad,
            unidad: insumo?.unidad || 'unidad',
          }
        })
      const nombreReceta = `Receta ${form.value.nombre}`
      if (recetaExistenteId.value) {
        await recetaStore.updateReceta(recetaExistenteId.value, {
          porciones: recetaForm.value.porciones,
          nombre: nombreReceta,
          detalles,
        })
      } else {
        await recetaStore.createReceta({
          nombre: nombreReceta,
          porciones: recetaForm.value.porciones,
          productoId: productoGuardado.id,
          detalles,
        })
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
        <input v-model.number="form.precioCompra" type="number" step="0.001" class="form-control" required min="0">
      </div>
      <div class="col">
        <label class="form-label">Precio Venta</label>
        <input v-model.number="form.precioVenta" type="number" step="0.001" class="form-control" required min="0">
      </div>
    </div>
    <div class="row mb-2">
      <div class="col">
        <label class="form-label">Stock Minimo</label>
        <input v-model.number="form.stockMinimo" type="number" class="form-control" min="0">
      </div>
      <div v-if="!esNuevo" class="col">
        <label class="form-label">Stock (se gestiona con compras)</label>
        <input :value="form.stock" type="number" class="form-control bg-light" readonly>
      </div>
      <div v-else class="col d-flex align-items-end">
        <span class="text-muted small">Stock: 0 (se actualiza con compras)</span>
      </div>
    </div>

    <div v-if="form.tipo === 'insumo'" class="mb-2">
      <label class="form-label">Merma %</label>
      <input v-model.number="form.merma" type="number" step="0.001" min="0" max="100" class="form-control">
    </div>

    <div v-if="form.tipo === 'compuesto'" class="border rounded p-3 mt-2 mb-2">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="form-label mb-0 fw-bold">Receta</label>
        <button type="button" class="btn btn-sm btn-outline-success" @click="agregarIngrediente">+ Ingrediente</button>
      </div>
      <div class="row mb-2">
        <div class="col-3">
          <label class="form-label">Porciones</label>
          <input v-model.number="recetaForm.porciones" type="number" min="1" class="form-control form-control-sm">
        </div>
      </div>
      <div v-if="recetaForm.detalles.length === 0" class="text-muted text-center mb-2">
        Sin ingredientes
      </div>
      <div v-for="(d, i) in recetaForm.detalles" :key="i" class="row g-1 mb-1 align-items-end">
        <div class="col-4">
          <select v-model="d.insumoId" class="form-select form-select-sm" required>
            <option :value="null" disabled>Insumo</option>
            <option v-for="ins in insumos" :key="ins.id" :value="ins.id">{{ ins.nombre }}</option>
          </select>
        </div>
        <div class="col-2">
          <input v-model.number="d.cantidad" type="number" step="0.001" min="0.001" class="form-control form-control-sm" placeholder="Cant." required>
        </div>
        <div class="col-2">
          <span class="form-control form-control-sm text-muted bg-light">{{ insumos.find((i) => i.id === d.insumoId)?.unidad || '—' }}</span>
        </div>
        <div class="col-2 text-end">
          <button type="button" class="btn btn-sm btn-outline-danger" @click="quitarIngrediente(i)">X</button>
        </div>
      </div>
    </div>

    <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="guardando">
      <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
      {{ guardando ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear') + ' Producto' }}
    </button>
  </form>
</template>
