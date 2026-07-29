<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'
import type { EscaneoFacturaResult } from '../../types'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ confirmar: [data: EscaneoFacturaResult]; cerrar: [] }>()

const paso = ref<'idle' | 'uploading' | 'result' | 'error'>('idle')
const resultado = ref<EscaneoFacturaResult>({ proveedor: { nombre: '' }, fecha: '', items: [] })
const errorMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const productosDB = ref<{ id: number; nombre: string; tipo: string }[]>([])
const searchText = ref<Record<number, string>>({})
const showDropdown = ref<Record<number, boolean>>({})
const activeIndex = ref<number | null>(null)

onMounted(async () => {
  try {
    const res = await api.get('/productos?limit=500')
    const data = res.data?.data || res.data || []
    productosDB.value = (Array.isArray(data) ? data : []).map((p: any) => ({ id: p.id, nombre: p.nombre, tipo: p.tipo }))
  } catch {}
})

function filteredProductos(busqueda: string) {
  if (!busqueda) return []
  const q = busqueda.toLowerCase()
  return productosDB.value.filter(p => p.nombre.toLowerCase().includes(q) && p.tipo !== 'compuesto').slice(0, 8)
}

function seleccionarProducto(item: any, prod: { id: number; nombre: string }) {
  item.nombre = prod.nombre
  item.productoId = prod.id
  showDropdown.value[resultado.value.items.indexOf(item)] = false
}

function editarProducto(item: any, i: number) {
  item.nombre = item.nombre
  item.productoId = null
  searchText.value[i] = item.nombre
  showDropdown.value[i] = true
}

async function subirArchivo(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  paso.value = 'uploading'
  const formData = new FormData()
  formData.append('factura', file)
  try {
    const { data } = await api.post('/compras/escanear', formData)
    resultado.value = data
    data.items.forEach((item: any, i: number) => {
      searchText.value[i] = item.nombre || ''
    })
    paso.value = 'result'
  } catch (err: any) {
    errorMsg.value = err.response?.data?.error || 'Error al procesar la factura'
    paso.value = 'error'
  }
}

function confirmar() {
  emit('confirmar', resultado.value)
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
      <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">🧾 Escanear Factura</h3>
        <button @click="$emit('cerrar')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
      </div>

      <div class="p-6">
        <div v-if="paso === 'idle'" class="border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center">
          <input type="file" accept="image/*,application/pdf" @change="subirArchivo" class="hidden" ref="fileInput">
          <div class="text-gray-400 dark:text-gray-500 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <button @click="$refs.fileInput.click()" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
            Seleccionar factura
          </button>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">PDF o imagen (JPG, PNG, WebP)</p>
        </div>

        <div v-if="paso === 'uploading'" class="text-center py-12">
          <span class="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
          <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">Procesando factura con IA...</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Esto puede tomar unos segundos</p>
        </div>

        <div v-if="paso === 'result'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
              <input v-model="resultado.proveedor.nombre" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
              <input v-model="resultado.fecha" type="date" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Productos ({{ resultado.items.length }})</h4>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Producto</th>
                    <th class="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Cantidad</th>
                    <th class="text-right py-2 px-2 text-gray-600 dark:text-gray-400">P/U</th>
                    <th class="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Subtotal</th>
                    <th class="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in resultado.items" :key="i" class="border-b border-gray-100 dark:border-gray-800 relative">
                    <td class="py-1 px-2 relative">
                      <div class="flex items-center gap-1">
                        <input v-model="item.nombre" @input="item.productoId = null; searchText[i] = item.nombre" @focus="showDropdown[i] = true" @blur="setTimeout(() => showDropdown[i] = false, 300)"
                          class="flex-1 px-2 py-1 rounded border text-sm"
                          :class="item.productoId ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'">
                        <span v-if="!item.productoId && item.nombre" class="text-[10px] font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">Nuevo</span>
                        <span v-if="item.productoId" class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">✔ Vinculado</span>
                      </div>
                      <div v-if="showDropdown[i] && item.nombre" class="absolute z-50 top-full left-0 right-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-36 overflow-y-auto mt-0.5">
                        <div v-if="productosDB.filter(p => p.nombre.toLowerCase().includes(item.nombre.toLowerCase()) && p.tipo === 'compuesto').length > 0" class="px-3 py-1.5 text-xs text-red-500 dark:text-red-400 border-b border-gray-100 dark:border-gray-600">
                          ⛔ Productos compuestos no se pueden comprar
                        </div>
                        <button v-for="p in filteredProductos(item.nombre)" :key="p.id" @mousedown.prevent="seleccionarProducto(item, p)"
                          class="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-600 transition-colors">
                          {{ p.nombre }}
                        </button>
                        <div v-if="filteredProductos(item.nombre).length === 0" class="px-3 py-1.5 text-xs text-gray-400 italic">
                          Sin coincidencias
                        </div>
                      </div>
                    </td>
                    <td class="py-1 px-2"><input v-model.number="item.cantidad" type="number" min="0" step="0.001" class="w-20 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-right"></td>
                    <td class="py-1 px-2"><input v-model.number="item.precioUnitario" type="number" min="0" step="1" class="w-24 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-right"></td>
                    <td class="text-right py-1 px-2 text-gray-700 dark:text-gray-300 font-medium">${{ (item.cantidad * item.precioUnitario).toLocaleString('es-CL') }}</td>
                    <td class="py-1 px-2"><button @click="resultado.items.splice(i, 1)" class="text-red-500 hover:text-red-700 text-lg">&times;</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button @click="resultado.items.push({ nombre: '', cantidad: 1, precioUnitario: 0, productoId: null })" class="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
              + Agregar producto
            </button>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button @click="paso = 'idle'" class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
            <button @click="confirmar" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">Usar en compra</button>
          </div>
        </div>

        <div v-if="paso === 'error'" class="text-center py-12">
          <p class="text-red-600 dark:text-red-400 font-medium mb-4">{{ errorMsg }}</p>
          <button @click="paso = 'idle'" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Reintentar</button>
        </div>
      </div>
    </div>
  </div>
</template>
