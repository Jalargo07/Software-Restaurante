<script setup lang="ts">
const planes = [
  {
    nombre: 'Básico',
    precio: 39900,
    comision: '0,7%',
    descripcion: 'Ideal para pequeños comercios gastronómicos, cafeterías, foodtrucks y otros.',
    features: [
      'POS en la nube',
      'Impresión de comandas',
      'Menú QR Digital',
      'Boleta electrónica ilimitada',
      'Dashboard con reportes',
      'Control de stock básico',
    ],
    planId: 'basico',
  },
  {
    nombre: 'Pro',
    precio: 69900,
    comision: '0,5%',
    descripcion: 'Recomendado para negocios gastronómicos medianos que buscan centralizar su operación.',
    features: [
      'Todo lo de Básico',
      'Control de stock avanzado',
      'Kardex FIFO/PEPS',
      'Múltiples usuarios (hasta 10)',
      'Corte de caja',
      'Split bill',
      'Branding personalizado',
    ],
    planId: 'pro',
    destacado: true,
  },
  {
    nombre: 'Enterprise',
    precio: 179900,
    comision: '0,35%',
    descripcion: 'Para grandes restaurantes que necesitan todas las herramientas y soporte dedicado.',
    features: [
      'Todo lo de Pro',
      'Usuarios ilimitados',
      'API de compras y ventas',
      'Soporte prioritario',
      'Factura electrónica',
      'Multi-sucursal',
      'KAM personalizado',
    ],
    planId: 'enterprise',
  },
]

function formatPrecio(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

function contratar(planId: string) {
  window.location.href = `/checkout/${planId}`
}
</script>

<template>
  <section id="precios" class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">Planes para tu Restaurante</h2>
      <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">Elegí el plan que mejor se adapte a tu negocio. Todos incluyen 14 días de prueba gratuita.</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="plan in planes" :key="plan.planId"
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
    </div>
  </section>
</template>
