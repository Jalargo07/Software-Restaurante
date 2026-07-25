<script setup lang="ts">
const problems = [
  {
    icon: '📝',
    title: 'Pedidos perdidos',
    description: 'Comandas que se extravian, platos que nunca llegan y clientes que se van frustrados.',
  },
  {
    icon: '📦',
    title: 'Inventario descontrolado',
    description: 'No sabes cuánto stock tienes, qué se venció o cuánto se desperdició hoy.',
  },
  {
    icon: '💸',
    title: 'Cuentas que no cierran',
    description: 'Diferencias en caja todos los días, sin saber dónde está el error.',
  },
  {
    icon: '📊',
    title: 'Falta de visibilidad',
    description: 'No tienes datos claros de qué se vende más, cuánto ganas o dónde mejorar.',
  },
]
</script>

<template>
  <section class="py-20 sm:py-28 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          ¿Tu restaurante sufre de esto?
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Si te identificas con alguno de estos problemas, BiteOps es para ti.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(problem, index) in problems"
          :key="index"
          class="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 hover:shadow-lg transition-shadow"
          data-scroll
        >
          <span class="text-4xl mb-4 block">{{ problem.icon }}</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ problem.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ problem.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
