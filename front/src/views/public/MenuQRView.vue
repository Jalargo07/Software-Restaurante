<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import type { EstiloMenu } from '../../types'

const route = useRoute()
const slug = route.params.slug as string

const tenant = ref<any>(null)
const productos = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const busqueda = ref('')
const estiloMenu = ref<EstiloMenu>('elegante')

async function fetchMenu() {
  try {
    loading.value = true
    const res = await api.get(`/public/menus/${slug}`)
    tenant.value = res.data.tenant
    estiloMenu.value = res.data.tenant.estiloMenu || 'elegante'
    productos.value = res.data.productos
    if (tenant.value) {
      document.documentElement.style.setProperty('--color-primario', tenant.value.colorPrimario)
      document.documentElement.style.setProperty('--color-secundario', tenant.value.colorSecundario)
    }
  } catch (e: any) {
    error.value = 'Restaurante no encontrado'
  } finally {
    loading.value = false
  }
}

const productosAgrupados = computed(() => {
  const filtrados = productos.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
  const grupos: Record<string, any[]> = {}
  for (const p of filtrados) {
    if (!grupos[p.categoria]) grupos[p.categoria] = []
    grupos[p.categoria].push(p)
  }
  return grupos
})

onMounted(fetchMenu)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm" v-if="tenant">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <img v-if="tenant.logo" :src="tenant.logo" class="w-10 h-10 rounded-full object-cover" />
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">{{ tenant.nombre }}</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Menú digital</p>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-3" v-if="tenant">
      <input v-model="busqueda" type="text" placeholder="Buscar plato o bebida..." class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent outline-none transition-all" />
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-[var(--color-primario)]"></div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-20 text-center">
      <p class="text-6xl mb-4">🔍</p>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Restaurante no encontrado</h2>
      <p class="text-gray-500 dark:text-gray-400">Escaneá nuevamente el código QR</p>
    </div>

    <div v-else class="max-w-4xl mx-auto px-4 pb-20">
      <div v-for="(items, categoria) in productosAgrupados" :key="categoria" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{{ categoria }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <!-- ELEGANTE -->
          <div v-if="estiloMenu === 'elegante'" v-for="p in items" :key="p.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="relative">
              <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre" class="w-full h-40 object-cover" />
              <div v-else class="w-full h-40 bg-gradient-to-br from-[var(--color-primario)]/20 to-[var(--color-secundario)]/20 flex items-center justify-center">
                <span class="text-4xl opacity-30">🍽️</span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">{{ p.nombre }}</h4>
                <span v-if="p.tipo === 'compuesto'" class="text-[10px] bg-[var(--color-primario)] text-white px-2 py-0.5 rounded-full whitespace-nowrap">Receta</span>
              </div>
              <p v-if="p.descripcion" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ p.descripcion }}</p>
              <div class="mt-3">
                <span class="inline-block bg-[var(--color-primario)] text-white px-3 py-1 rounded-full text-sm font-bold">${{ Number(p.precioVenta).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- NOVEDOSO -->
          <div v-if="estiloMenu === 'novedoso'" v-for="p in items" :key="p.id"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre" class="w-full h-48 object-cover" />
            <div v-else class="w-full h-48 bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-secundario)]/50 flex items-center justify-center">
              <span class="text-5xl opacity-40">🌟</span>
            </div>
            <div class="p-5">
              <span class="text-xs font-medium text-[var(--color-secundario)] bg-[var(--color-secundario)]/10 px-2 py-1 rounded-full">{{ categoria }}</span>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ p.nombre }}</h4>
              <p v-if="p.descripcion" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ p.descripcion }}</p>
              <p class="text-2xl font-black text-[var(--color-primario)] mt-3">${{ Number(p.precioVenta).toLocaleString() }}</p>
            </div>
          </div>

          <!-- MINIMALISTA -->
          <div v-if="estiloMenu === 'minimalista'" v-for="p in items" :key="p.id"
            class="bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h4 class="text-base font-medium text-gray-900 dark:text-white">{{ p.nombre }}</h4>
                <p v-if="p.descripcion" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{{ p.descripcion }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-xl font-semibold text-[var(--color-primario)]">${{ Number(p.precioVenta).toLocaleString() }}</p>
                <span v-if="p.tipo === 'compuesto'" class="text-[10px] text-gray-400">Receta</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <footer class="text-center py-6 text-xs text-gray-400 dark:text-gray-500">
      Menú digital generado por <span class="font-semibold">BiteOps</span>
    </footer>
  </div>
</template>
