<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
        recetaForm.value = {
          porciones: 1,
          detalles: (props.producto.detallesReceta || []).map((d: any) => ({
            insumoId: d.insumoId,
            cantidad: Number(d.cantidad),
          })),
        }
      } else {
        recetaForm.value = { porciones: 1, detalles: [] }
      }
    } else {
      form.value = {
        nombre: '', descripcion: '', categoria: 'comida', tipo: 'directo',
        precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: 'unidad', merma: 0,
      }
      previewUrl.value = ''
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
      // Si estamos editando y había una imagen anterior, la eliminamos del bucket
      if (props.producto?.imagen && props.producto.imagen !== imagenUrl) {
        try {
          const urlParts = props.producto.imagen.split('/')
          const filename = urlParts[urlParts.length - 1]
          if (filename) {
            await api.delete(`/upload/${filename}`)
          }
        } catch (err) {
          console.error('No se pudo eliminar la imagen anterior del bucket:', err)
        }
      }
    }
    const payload: any = { ...form.value }
    if (imagenUrl) payload.imagen = imagenUrl

    if (form.value.tipo === 'compuesto') {
      payload.detallesReceta = recetaForm.value.detalles
        .filter((d) => d.insumoId !== null)
        .map((d) => {
          const insumo = insumos.value.find((i) => i.id === d.insumoId)
          return {
            insumoId: d.insumoId!,
            cantidad: d.cantidad,
            unidad: insumo?.unidad || 'unidad',
          }
        })
    } else {
      payload.detallesReceta = []
    }

    if (props.producto) {
      await store.updateProducto(props.producto.id, payload)
    } else {
      await store.createProducto({ ...payload, stock: 0 })
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
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen</label>
      <input type="file" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" accept="image/*" @change="onFileChange">
      <div v-if="previewUrl" class="mt-2 text-center">
        <img :src="previewUrl" alt="Preview" class="rounded-lg" style="max-width:120px;max-height:120px;object-fit:cover">
      </div>
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
      <input v-model="form.nombre" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" required>
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion</label>
      <textarea v-model="form.descripcion" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" rows="2"></textarea>
    </div>
    <div class="grid grid-cols-12 gap-3 mb-2">
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
        <select v-model="form.categoria" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          <option value="comida">Comida</option>
          <option value="bebida">Bebida</option>
          <option value="postre">Postre</option>
          <option value="insumo">Insumo</option>
        </select>
      </div>
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad</label>
        <select v-model="form.unidad" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
          <option value="unidad">Unidad</option>
          <option value="kg">Kg</option>
          <option value="litro">Litro</option>
          <option value="docena">Docena</option>
        </select>
      </div>
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
      <select v-model="form.tipo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
        <option value="directo">Directo</option>
        <option value="insumo">Insumo</option>
        <option value="compuesto">Compuesto</option>
      </select>
    </div>
    <div class="grid grid-cols-12 gap-3 mb-2">
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Compra</label>
        <input v-model.number="form.precioCompra" type="number" step="0.001" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" required min="0">
      </div>
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Venta</label>
        <input v-model.number="form.precioVenta" type="number" step="0.001" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" required min="0">
      </div>
    </div>
    <div class="grid grid-cols-12 gap-3 mb-2">
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Minimo</label>
        <input v-model.number="form.stockMinimo" type="number" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" min="0">
      </div>
      <div v-if="!esNuevo" class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock (se gestiona con compras)</label>
        <input :value="form.stock" type="number" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm" readonly>
      </div>
      <div v-else class="col-span-6 flex items-end">
        <span class="text-gray-500 dark:text-gray-400 text-xs">Stock: 0 (se actualiza con compras)</span>
      </div>
    </div>

    <div v-if="form.tipo === 'insumo'" class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Merma %</label>
      <input v-model.number="form.merma" type="number" step="0.001" min="0" max="100" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500">
    </div>

    <div v-if="form.tipo === 'compuesto'" class="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mt-2 mb-2">
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-0 font-bold">Receta</label>
        <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors" @click="agregarIngrediente">+ Ingrediente</button>
      </div>
      <div class="grid grid-cols-12 gap-3 mb-2">
        <div class="col-span-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Porciones</label>
          <input v-model.number="recetaForm.porciones" type="number" min="1" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500">
        </div>
      </div>
      <div v-if="recetaForm.detalles.length === 0" class="text-gray-500 dark:text-gray-400 text-center mb-2 text-sm">
        Sin ingredientes
      </div>
      <div v-for="(d, i) in recetaForm.detalles" :key="i" class="grid grid-cols-12 gap-1 mb-1 items-end">
        <div class="col-span-4">
          <select v-model="d.insumoId" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm" required>
            <option :value="null" disabled>Insumo</option>
            <option v-for="ins in insumos" :key="ins.id" :value="ins.id">{{ ins.nombre }}</option>
          </select>
        </div>
        <div class="col-span-2">
          <input v-model.number="d.cantidad" type="number" step="0.001" min="0.001" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" placeholder="Cant." required>
        </div>
        <div class="col-span-2">
          <span class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 block">{{ insumos.find((i) => i.id === d.insumoId)?.unidad || '—' }}</span>
        </div>
        <div class="col-span-2 text-right">
          <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="quitarIngrediente(i)">X</button>
        </div>
      </div>
    </div>

    <button type="submit" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors w-full mt-2" :disabled="guardando">
      <span v-if="guardando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
      {{ guardando ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear') + ' Producto' }}
    </button>
  </form>
</template>
