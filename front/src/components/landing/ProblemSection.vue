<script setup lang="ts">
import type { LandingItem } from '../../types'

const props = withDefaults(defineProps<{ data?: { titulo: string; subtitulo: string; items: LandingItem[] } }>(), {
  data: () => ({
    titulo: '¿Cansado del caos?',
    subtitulo: 'Los restaurantes sin un sistema digital pierden tiempo, plata y clientes.',
    items: [
      { icon: '📝', titulo: 'Pedidos perdidos', descripcion: 'Comandas en papel que se extravían en la cocina' },
      { icon: '📉', titulo: 'Inventario descontrolado', descripcion: 'Sin saber qué ingredientes tenés ni cuándo se vencen' },
      { icon: '💰', titulo: 'Fugas de dinero', descripcion: 'Descuadres de caja que nunca sabés de dónde vienen' },
      { icon: '😤', titulo: 'Clientes insatisfechos', descripcion: 'Demoras en la cocina y errores en los pedidos' },
    ],
  }),
})
</script>

<template>
  <section class="py-20 sm:py-28 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ data.titulo }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {{ data.subtitulo }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(item, index) in data.items"
          :key="index"
          class="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 hover:shadow-lg transition-shadow"
          data-scroll
        >
          <span class="text-4xl mb-4 block">{{ item.icon }}</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.titulo }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ item.descripcion }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
