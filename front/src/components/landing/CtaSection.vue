<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { LandingCta } from '../../types'

const props = withDefaults(defineProps<{ data?: LandingCta }>(), {
  data: () => ({
    titulo: '¿Listo para transformar tu restaurante?',
    subtitulo: 'Probá BiteOps gratis por 14 días. Sin tarjeta de crédito.',
    boton: { texto: 'Comenzar gratis', link: '/login' },
  }),
})
</script>

<template>
  <section class="py-20 sm:py-28 bg-gradient-to-br from-blue-600 to-violet-700">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-scroll>
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
        {{ data.titulo }}
      </h2>
      <p class="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
        {{ data.subtitulo }}
      </p>
      <RouterLink
        :to="data.boton.link"
        class="inline-block px-10 py-4 text-base font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {{ data.boton.texto }}
      </RouterLink>
    </div>
  </section>
</template>
