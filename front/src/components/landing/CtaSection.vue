<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="py-20 sm:py-28 bg-gradient-to-br from-blue-600 to-violet-700">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-scroll>
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
        Comienza hoy a transformar tu restaurante
      </h2>
      <p class="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
        Configura tu cuenta en menos de 5 minutos. Sin tarjeta de crédito, sin compromisos.
      </p>
      <RouterLink
        to="/login"
        class="inline-block px-10 py-4 text-base font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Crear cuenta gratis
      </RouterLink>
    </div>
  </section>
</template>
