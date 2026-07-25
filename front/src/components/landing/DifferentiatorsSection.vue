<script setup lang="ts">
import type { LandingDiffItem } from '../../types'

const props = withDefaults(defineProps<{ data?: { titulo: string; subtitulo: string; items: LandingDiffItem[] } }>(), {
  data: () => ({
    titulo: '¿Por qué BiteOps?',
    subtitulo: 'Nos comparamos con la competencia para que veas la diferencia.',
    items: [
      { feature: 'POS en la nube', biteops: true, competencia: true },
      { feature: 'Comandas en cocina', biteops: true, competencia: true },
      { feature: 'Control de stock con Kardex', biteops: true, competencia: false },
      { feature: 'Menú QR Digital', biteops: true, competencia: true },
      { feature: 'Dashboard P&L', biteops: true, competencia: false },
      { feature: 'Split bill', biteops: true, competencia: false },
    ],
  }),
})
</script>

<template>
  <section class="py-20 sm:py-28 bg-white dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ data.titulo }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {{ data.subtitulo }}
        </p>
      </div>

      <div class="overflow-x-auto" data-scroll>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Característica</th>
              <th class="py-4 px-4 text-sm font-semibold text-center">
                <span class="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent font-bold">BiteOps</span>
              </th>
              <th class="py-4 px-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400">Competencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data.items" :key="index" class="border-b border-gray-100 dark:border-gray-800">
              <td class="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{{ item.feature }}</td>
              <td class="py-4 px-4 text-center">
                <span v-if="item.biteops" class="text-green-500 text-lg">&#10003;</span>
                <span v-else class="text-red-400 text-lg">&#10007;</span>
              </td>
              <td class="py-4 px-4 text-center">
                <span v-if="item.competencia" class="text-green-500 text-lg">&#10003;</span>
                <span v-else class="text-red-400 text-lg">&#10007;</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
