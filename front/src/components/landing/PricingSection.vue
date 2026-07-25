<script setup lang="ts">
import { RouterLink } from 'vue-router'

const plans = [
  {
    name: 'Básico',
    price: 'Gratis',
    period: '',
    description: 'Para restaurantes que inician',
    features: ['Hasta 5 mesas', 'Comandas básicas', 'Control de inventario', '1 usuario'],
    cta: 'Comenzar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mes',
    description: 'Para restaurantes en crecimiento',
    features: ['Mesas ilimitadas', 'Comandas en tiempo real', 'Reportes avanzados', 'Hasta 10 usuarios', 'Corte de caja', 'Compras y proveedores'],
    cta: 'Probar Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$149',
    period: '/mes',
    description: 'Para cadenas y multi-sucursal',
    features: ['Todo en Pro', 'Multi-sucursal', 'Usuarios ilimitados', 'Soporte prioritario', 'API personalizada', 'Branding white-label'],
    cta: 'Contactar ventas',
    highlighted: false,
  },
]
</script>

<template>
  <section id="pricing" class="py-20 sm:py-28 bg-gray-50 dark:bg-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Planes que crecen contigo
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Empieza gratis y escala cuando lo necesites. Sin contratos, cancela cuando quieras.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div
          v-for="(plan, index) in plans"
          :key="index"
          class="relative p-8 rounded-2xl transition-all"
          :class="plan.highlighted
            ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-105 ring-2 ring-blue-400'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg'"
          data-scroll
        >
          <div v-if="plan.highlighted" class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
            Popular
          </div>
          <h3 class="text-xl font-bold" :class="plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'">{{ plan.name }}</h3>
          <p class="mt-1 text-sm" :class="plan.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'">{{ plan.description }}</p>
          <div class="mt-6 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold" :class="plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'">{{ plan.price }}</span>
            <span v-if="plan.period" class="text-sm" :class="plan.highlighted ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'">{{ plan.period }}</span>
          </div>
          <ul class="mt-8 space-y-3">
            <li v-for="(feature, fi) in plan.features" :key="fi" class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 shrink-0" :class="plan.highlighted ? 'text-blue-200' : 'text-green-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span :class="plan.highlighted ? 'text-blue-50' : 'text-gray-600 dark:text-gray-300'">{{ feature }}</span>
            </li>
          </ul>
          <RouterLink
            to="/login"
            class="mt-8 block w-full py-3 text-center text-sm font-semibold rounded-xl transition-all"
            :class="plan.highlighted
              ? 'bg-white text-blue-600 hover:bg-blue-50'
              : 'bg-blue-600 text-white hover:bg-blue-700'"
          >
            {{ plan.cta }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
