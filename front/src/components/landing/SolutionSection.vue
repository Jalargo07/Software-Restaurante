<script setup lang="ts">
import type { LandingItem } from '../../types'

const props = withDefaults(defineProps<{ data?: { titulo: string; subtitulo: string; items: LandingItem[] } }>(), {
  data: () => ({
    titulo: 'BiteOps lo soluciona todo',
    subtitulo: 'Una plataforma inteligente que centraliza cada aspecto de tu restaurante.',
    items: [
      { icon: '🖥️', titulo: 'POS Inteligente', descripcion: 'Ventas rápidas, split bill, múltiples métodos de pago' },
      { icon: '📦', titulo: 'Inventario con Kardex', descripcion: 'Control FIFO/PEPS, alertas de stock bajo, mermas' },
      { icon: '👨‍🍳', titulo: 'Comandas en tiempo real', descripcion: 'Los pedidos llegan al instante a la cocina' },
      { icon: '📊', titulo: 'Dashboard financiero', descripcion: 'Ventas, costos, ganancias en gráficos claros' },
      { icon: '📱', titulo: 'Menú QR Digital', descripcion: 'Tus clientes escanean y piden desde su celular' },
      { icon: '☁️', titulo: 'Multi-sucursal', descripcion: 'Todos tus locales centralizados en un solo panel' },
    ],
  }),
})
</script>

<template>
  <section id="features" class="py-20 sm:py-28 bg-gray-50 dark:bg-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ data.titulo }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {{ data.subtitulo }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(item, index) in data.items"
          :key="index"
          class="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all"
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
