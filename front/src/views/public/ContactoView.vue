<script setup lang="ts">
import { ref } from 'vue'
import PublicHeader from '../../components/public/PublicHeader.vue'
import FooterSection from '../../components/landing/FooterSection.vue'

const nombre = ref('')
const email = ref('')
const mensaje = ref('')

function enviarMensaje() {
  alert('Mensaje enviado correctamente. Te contactaremos pronto.')
  nombre.value = ''
  email.value = ''
  mensaje.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <PublicHeader />

    <main>
      <section class="relative py-24 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Contacto</h1>
          <p class="mt-4 text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto">
            ¿Tenés preguntas? Estamos para ayudarte.
          </p>
        </div>
      </section>

      <section class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Envianos un mensaje</h2>
              <form class="space-y-5" @submit.prevent="enviarMensaje" itemscope itemtype="https://schema.org/ContactPoint">
                <div>
                  <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input id="nombre" v-model="nombre" type="text" itemprop="name" required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Tu nombre completo" />
                </div>
                <div>
                  <label for="contact-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input id="contact-email" v-model="email" type="email" itemprop="email" required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                    placeholder="tu@email.com" />
                </div>
                <div>
                  <label for="mensaje" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                  <textarea id="mensaje" v-model="mensaje" required rows="5" itemprop="description"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors resize-none"
                    placeholder="¿En qué podemos ayudarte?" />
                </div>
                <button type="submit"
                  class="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
                  Enviar Mensaje
                </button>
              </form>
            </div>

            <div class="space-y-8">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Información de contacto</h2>
                <div class="space-y-6">
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Email</h3>
                      <p class="text-gray-600 dark:text-gray-300">contacto@biteops.app</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">GitHub</h3>
                      <a href="https://github.com/Jalargo07/Software-Restaurante" target="_blank" rel="noopener noreferrer"
                        class="text-emerald-600 dark:text-emerald-400 hover:underline">
                        github.com/Jalargo07/Software-Restaurante
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <FooterSection />
  </div>
</template>
