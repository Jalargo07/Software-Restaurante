<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
      <div class="text-center max-w-4xl mx-auto" data-scroll>
        <div class="flex justify-center mb-8">
          <img src="/logo-biteops.png" alt="BiteOps" class="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl">
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
          El sistema operativo de
          <span class="bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">tu restaurante</span>
        </h1>
        <p class="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Gestiona mesas, comandas, inventario, compras y reportes desde una sola plataforma.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <RouterLink
            to="/login"
            class="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          >
            Comenzar gratis
          </RouterLink>
          <a
            href="#features"
            class="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl transition-all"
          >
            Ver demo
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
