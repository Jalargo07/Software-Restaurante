<script setup lang="ts">
import PublicHeader from '../../components/public/PublicHeader.vue'
import FooterSection from '../../components/landing/FooterSection.vue'
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <PublicHeader />

    <main>
      <section class="relative py-24 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Sobre BiteOps</h1>
          <p class="mt-4 text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto">
            El sistema operativo inteligente diseñado para transformar la gestión de restaurantes.
          </p>
        </div>
      </section>

      <section class="py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Nuestra Historia</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              BiteOps nació de la necesidad real de simplificar la gestión diaria de restaurantes.
              Observamos cómo dueños y equipos luchaban con sistemas complicados, hojas de cálculo
              desordenados y herramientas que no se adaptaban a su ritmo de trabajo. Decidimos crear
              una plataforma intuitiva, rápida y poderosa que resolviera estos problemas de raíz.
              Hoy, BiteOps es el aliado tecnológico que permite a los restaurantes enfocarse en lo que
              realmente importa: ofrecer una experiencia excepcional a sus clientes.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Misión</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Empoderar a los restaurantes con tecnología accesible e inteligente que optimice sus
                operaciones, reduzca costos y mejore la experiencia tanto del equipo como de los comensales.
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div class="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Visión</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ser la plataforma de referencia para la gestión inteligente de restaurantes en
                Latinoamérica, reconocida por su facilidad de uso, innovación constante y compromiso
                con el éxito de cada negocio que nos elige.
              </p>
            </div>
          </div>

          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Tecnología</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
              BiteOps está construido con las mejores tecnologías modernas para garantizar
              rendimiento, escalabilidad y una experiencia de usuario fluida.
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div v-for="tech in ['Vue 3', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'WebSockets']" :key="tech"
                class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ tech }}</span>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 text-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">¿Listo para transformar tu restaurante?</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">Uní tu equipo a BiteOps y empezá a gestionar de forma inteligente.</p>
            <RouterLink to="/login"
              class="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
              Comenzar Ahora
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <FooterSection />
  </div>
</template>
