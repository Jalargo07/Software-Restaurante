<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const planId = route.params.plan as string
const loading = ref(false)
const orderId = ref('')

const planes: Record<string, { nombre: string; precio: number; comision: string; features: string[] }> = {
  basico: { nombre: 'Básico', precio: 39900, comision: '0,7%', features: ['POS en la nube', 'Menú QR Digital', 'Dashboard', 'Control de stock básico'] },
  pro: { nombre: 'Pro', precio: 69900, comision: '0,5%', features: ['Todo lo de Básico', 'Kardex FIFO', '10 usuarios', 'Branding personalizado', 'Split bill'] },
  enterprise: { nombre: 'Enterprise', precio: 179900, comision: '0,35%', features: ['Todo lo de Pro', 'Usuarios ilimitados', 'API Ventas/Compras', 'Multi-sucursal', 'Soporte prioritario'] },
}

const plan = computed(() => planes[planId])
const paypalReady = ref(false)

onMounted(() => {
  if (!plan.value) return
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  cargarPayPal()
})

function cargarPayPal() {
  const script = document.createElement('script')
  script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb'}&currency=USD`
  script.onload = () => { paypalReady.value = true; renderPayPalButton() }
  document.head.appendChild(script)
}

function renderPayPalButton() {
  if (!(window as any).paypal) return
  ;(window as any).paypal.Buttons({
    createOrder: async () => {
      try {
        const { data } = await api.post('/pagos/crear', { plan: planId })
        orderId.value = data.orderId
        return data.orderId
      } catch (e: any) {
        toast.error('Error al crear orden')
        throw e
      }
    },
    onApprove: async (data: any) => {
      loading.value = true
      try {
        const res = await api.post('/pagos/capturar', { orderId: data.orderID })
        if (res.data.status === 'completado') {
          toast.success(`¡Plan ${plan.value.nombre} activado!`)
          authStore.user!.plan = planId
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          toast.error('El pago no pudo completarse')
        }
      } catch {
        toast.error('Error al confirmar pago')
      } finally { loading.value = false }
    },
    onError: () => { toast.error('Error en el proceso de pago') },
  }).render('#paypal-button-container')
}

function formatPrecio(n: number) { return '$' + n.toLocaleString('es-CL') }
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div v-if="!plan" class="text-center">
      <p class="text-6xl mb-4">❌</p>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Plan no encontrado</h2>
      <router-link to="/" class="text-[var(--color-primario)] hover:underline mt-2 inline-block">Volver al inicio</router-link>
    </div>

    <div v-else class="w-full max-w-lg">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">Adquirir {{ plan.nombre }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Completá el pago para activar tu plan</p>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-gray-900 dark:text-white">Plan {{ plan.nombre }}</span>
            <span class="text-2xl font-black text-[var(--color-primario)]">{{ formatPrecio(plan.precio) }}/mes</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">{{ plan.comision }} venta neta mensual + IVA</p>
          <ul class="space-y-1">
            <li v-for="f in plan.features" :key="f" class="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
              <span class="text-[var(--color-primario)]">✓</span> {{ f }}
            </li>
          </ul>
        </div>

        <div v-if="!paypalReady" class="text-center py-8">
          <div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></div>
          <p class="text-xs text-gray-500 mt-2">Cargando PayPal...</p>
        </div>
        <div id="paypal-button-container" class="min-h-[150px]"></div>

        <div v-if="loading" class="text-center text-sm text-gray-500 mt-4">
          Procesando pago...
        </div>

        <p class="text-xs text-gray-400 text-center mt-4">Pago seguro vía PayPal. No guardamos información de tu tarjeta.</p>
      </div>
    </div>
  </div>
</template>
