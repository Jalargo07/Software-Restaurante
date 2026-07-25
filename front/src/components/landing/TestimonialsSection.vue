<script setup lang="ts">
import type { LandingTestimonial } from '../../types'

const props = withDefaults(defineProps<{ data?: { titulo: string; subtitulo: string; items: LandingTestimonial[] } }>(), {
  data: () => ({
    titulo: 'Lo que dicen nuestros clientes',
    subtitulo: 'Restaurantes como el tuyo ya confían en BiteOps.',
    items: [
      { nombre: 'María García', cargo: 'Dueña de La Cocina de María', texto: 'BiteOps transformó mi restaurante.', iniciales: 'MG' },
      { nombre: 'Carlos Martínez', cargo: 'Chef ejecutivo', texto: 'Las comandas en cocina nos salvaron.', iniciales: 'CM' },
      { nombre: 'Ana López', cargo: 'Gerente general', texto: 'El dashboard financiero es increíble.', iniciales: 'AL' },
    ],
  }),
})
</script>

<template>
  <section class="py-20 sm:py-28 bg-white dark:bg-gray-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ data.titulo }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          {{ data.subtitulo }}
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="item in data.items"
          :key="item.nombre"
          class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          data-scroll
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              {{ item.iniciales }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.nombre }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.cargo }}</p>
            </div>
          </div>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed italic">
            "{{ item.texto }}"
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
