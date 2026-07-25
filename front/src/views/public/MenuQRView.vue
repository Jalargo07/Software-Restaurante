<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const slug = route.params.slug as string

const tenant = ref<any>(null)
const productos = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const busqueda = ref('')

async function fetchMenu() {
  try {
    loading.value = true
    const res = await axios.get(`/api/public/menus/${slug}`)
    tenant.value = res.data.tenant
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
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{{ categoria }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="p in items" :key="p.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre" class="w-full h-32 object-cover" />
            <div class="p-3">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">{{ p.nombre }}</h4>
                <span v-if="p.tipo === 'compuesto'" class="text-[10px] bg-[var(--color-primario)] text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">Receta</span>
              </div>
              <p v-if="p.descripcion" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ p.descripcion }}</p>
              <p class="text-lg font-bold text-[var(--color-primario)] mt-2">${{ Number(p.precioVenta).toLocaleString() }}</p>
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
