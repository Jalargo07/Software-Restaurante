<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeliveryStore } from '../../stores/delivery'
import { useToastStore } from '../../stores/toast'
import type { DeliveryApp } from '../../types'
import api from '../../services/api'

const store = useDeliveryStore()
const toast = useToastStore()
const simulando = ref(false)
const simApp = ref<DeliveryApp>('rappi')
const simProd = ref('')
const simCant = ref(1)
const productos = ref<any[]>([])

const apps: DeliveryApp[] = ['rappi', 'uber', 'pedidosya']
const labels: Record<string, string> = { rappi: 'Rappi', uber: 'Uber Eats', pedidosya: 'PedidosYa' }

onMounted(async () => {
  await store.fetchConfigs()
  try {
    const { data } = await api.get('/productos')
    productos.value = data.filter((p: any) => p.tipo !== 'insumo')
  } catch { /* ignore */ }
})

function getConfig(app: DeliveryApp) {
  return store.configs.find(c => c.app === app)
}

async function toggleApp(app: DeliveryApp) {
  const cfg = getConfig(app)
  try {
    await store.updateConfig(app, { activo: !cfg?.activo })
    toast.success(`${labels[app]} ${!cfg?.activo ? 'activado' : 'desactivado'}`)
  } catch { toast.error('Error al actualizar') }
}

async function simular() {
  if (!simProd.value) return
  simulando.value = true
  const prod = productos.value.find(p => p.nombre === simProd.value)
  try {
    await store.simularPedido({
      app: simApp.value,
      productos: [{ nombre: simProd.value, cantidad: simCant.value, precio: prod?.precioVenta }],
    })
    toast.success('Pedido de prueba enviado a cocina')
    simProd.value = ''
    simCant.value = 1
  } catch { toast.error('Error al simular') }
  finally { simulando.value = false }
}
</script>

<template>
  <div class="px-4 py-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Delivery Apps</h2>

    <div class="space-y-4 mb-8">
      <div v-for="app in apps" :key="app"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ labels[app] }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ getConfig(app)?.activo ? 'Recibiendo pedidos' : 'Integración desactivada' }}
            </p>
          </div>
          <button @click="toggleApp(app)"
            class="relative w-12 h-6 rounded-full transition-colors"
            :class="getConfig(app)?.activo ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="getConfig(app)?.activo ? 'translate-x-6' : ''" />
          </button>
        </div>
        <div v-if="getConfig(app)?.activo" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Webhook URL: <code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">/api/delivery/webhook/{{ app }}</code>
        </div>
      </div>
    </div>

    <!-- Simulador -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Simular pedido de prueba</h3>
      <div class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">App</label>
          <select v-model="simApp" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm">
            <option v-for="a in apps" :key="a" :value="a">{{ labels[a] }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Producto</label>
          <select v-model="simProd" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm w-44">
            <option value="" disabled>Seleccionar</option>
            <option v-for="p in productos" :key="p.id" :value="p.nombre">{{ p.nombre }} - ${{ Number(p.precioVenta).toLocaleString() }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
          <input v-model="simCant" type="number" min="1" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm w-20" />
        </div>
        <button @click="simular" :disabled="!simProd || simulando"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {{ simulando ? 'Enviando...' : 'Enviar pedido' }}
        </button>
      </div>
    </div>
  </div>
</template>
