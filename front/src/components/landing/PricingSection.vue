<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { LandingPlan, ModulosSeleccionados } from '../../types'
import { calcularPrecio } from '../../composables/useCalculadoraPrecios'

const router = useRouter()

const props = withDefaults(defineProps<{ data?: { titulo: string; subtitulo: string; planes: LandingPlan[] } }>(), {
  data: () => ({
    titulo: 'Planes para tu Restaurante',
    subtitulo: 'Elegí el plan que mejor se adapte a tu negocio. Todos incluyen 14 días de prueba gratuita.',
    planes: [
      { nombre: 'Básico', precio: 39900, comision: '0,7%', descripcion: 'Ideal para pequeños comercios gastronómicos, cafeterías, foodtrucks y otros.', features: ['POS en la nube', 'Impresión de comandas', 'Menú QR Digital', 'Boleta electrónica ilimitada', 'Dashboard con reportes', 'Control de stock básico'], planId: 'basico', destacado: false },
      { nombre: 'Pro', precio: 69900, comision: '0,5%', descripcion: 'Recomendado para negocios gastronómicos medianos que buscan centralizar su operación.', features: ['Todo lo de Básico', 'Control de stock avanzado', 'Kardex FIFO/PEPS', 'Múltiples usuarios (hasta 10)', 'Corte de caja', 'Split bill', 'Branding personalizado'], planId: 'pro', destacado: true },
      { nombre: 'Enterprise', precio: 179900, comision: '0,35%', descripcion: 'Para grandes restaurantes que necesitan todas las herramientas y soporte dedicado.', features: ['Todo lo de Pro', 'Usuarios ilimitados', 'API de compras y ventas', 'Soporte prioritario', 'Factura electrónica', 'Multi-sucursal', 'KAM personalizado'], planId: 'enterprise', destacado: false },
    ],
  }),
})

const showCustom = ref(false)
const modulos = ref<ModulosSeleccionados>({
  pos: 'rapido',
  mesas: '0',
  usuarios: '1',
  inventario: 'basico',
  delivery: 'no',
  menuQr: 'no',
  reportes: 'basico',
  multiSucursal: 'no',
})
const precioCustom = computed(() => calcularPrecio(modulos.value))

function formatPrecio(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

function contratar(planId: string) {
  window.location.href = `/checkout/${planId}`
}

function contratarCustom() {
  const encoded = encodeURIComponent(JSON.stringify(modulos.value))
  router.push('/checkout/custom?modulos=' + encoded + '&precio=' + precioCustom.value)
}
</script>

<template>
  <section id="precios" class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">{{ data.titulo }}</h2>
      <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">{{ data.subtitulo }}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="plan in data.planes" :key="plan.planId"
          class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 p-6 flex flex-col transition-all hover:shadow-xl"
          :class="plan.destacado ? 'border-[var(--color-primario)] scale-105 md:scale-110' : 'border-gray-200 dark:border-gray-700'">
          <div v-if="plan.destacado" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primario)] text-white text-xs font-bold px-4 py-1 rounded-full">MÁS POPULAR</div>

          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ plan.nombre }}</h3>
          <p class="text-3xl font-black text-gray-900 dark:text-white mb-1">{{ formatPrecio(plan.precio) }}<span class="text-sm font-normal text-gray-500">/mes</span></p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ plan.comision }} venta neta mensual + IVA</p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">{{ plan.descripcion }}</p>

          <ul class="space-y-2 mb-8 flex-1">
            <li v-for="f in plan.features" :key="f" class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span class="text-[var(--color-primario)] mt-0.5">✓</span>
              {{ f }}
            </li>
          </ul>

          <button @click="contratar(plan.planId)"
            class="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            :class="plan.destacado ? 'bg-[var(--color-primario)] text-white hover:brightness-90' : 'border-2 border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white'">
            Adquirir {{ plan.nombre }}
          </button>
        </div>
      </div>

      <div class="text-center mt-12 mb-6">
        <button @click="showCustom = !showCustom" class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-lg">
          {{ showCustom ? 'Ocultar' : 'O armá tu plan personalizado →' }}
        </button>
      </div>

      <div v-if="showCustom" class="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Armá tu plan</h3>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Punto de Venta (POS)</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'rapido',l:'Solo rápido'},{v:'mesas',l:'Solo mesas'},{v:'ambos',l:'Rápido + Mesas'}]" :key="opt.v"
                @click="modulos.pos = opt.v"
                :class="modulos.pos === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mesas</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'0',l:'0'},{v:'5',l:'5'},{v:'10',l:'10'},{v:'20',l:'20'},{v:'ilimitado',l:'∞'}]" :key="opt.v"
                @click="modulos.mesas = opt.v"
                :class="modulos.mesas === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Usuarios</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'1',l:'1'},{v:'3',l:'3'},{v:'5',l:'5'},{v:'10',l:'10'},{v:'ilimitado',l:'∞'}]" :key="opt.v"
                @click="modulos.usuarios = opt.v"
                :class="modulos.usuarios === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Inventario</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'basico',l:'Básico'},{v:'avanzado',l:'Avanzado (+Kardex)'}]" :key="opt.v"
                @click="modulos.inventario = opt.v"
                :class="modulos.inventario === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'no',l:'No'},{v:'si',l:'Sí'}]" :key="opt.v"
                @click="modulos.delivery = opt.v"
                :class="modulos.delivery === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Menú QR Digital</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'no',l:'No'},{v:'si',l:'Sí'}]" :key="opt.v"
                @click="modulos.menuQr = opt.v"
                :class="modulos.menuQr === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reportes</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'basico',l:'Básico'},{v:'avanzado',l:'Avanzado (+P&L)'}]" :key="opt.v"
                @click="modulos.reportes = opt.v"
                :class="modulos.reportes === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Multi-sucursal</label>
            <div class="flex gap-2 flex-wrap">
              <button v-for="opt in [{v:'no',l:'No'},{v:'si',l:'Sí'}]" :key="opt.v"
                @click="modulos.multiSucursal = opt.v"
                :class="modulos.multiSucursal === opt.v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ opt.l }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">Precio mensual estimado</p>
          <p class="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">${{ precioCustom.toLocaleString('es-CL') }}</p>
          <p class="text-xs text-gray-400 mt-1">+ impuestos aplicables</p>
          <button @click="contratarCustom"
            class="mt-4 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-lg">
            Contratar plan personalizado
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
