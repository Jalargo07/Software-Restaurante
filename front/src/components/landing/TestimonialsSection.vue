<script setup lang="ts">
const testimonios = [
  {
    nombre: 'María González',
    cargo: 'Dueña de La Cocina de María',
    texto: 'BiteOps transformó la forma en que gestionamos el restaurante. Las comandas llegan directo a cocina, el inventario se actualiza solo y los reportes nos ayudan a tomar mejores decisiones. Recuperé mi tiempo libre.',
    iniciales: 'MG',
  },
  {
    nombre: 'Carlos Muñoz',
    cargo: 'Gerente de Rincón Criollo',
    texto: 'Pasamos de 3 sistemas distintos a uno solo. El control de inventario con recetas nos ahorró un 20% en mermas. Y el dashboard financiero me da visibilidad en tiempo real de todo el negocio.',
    iniciales: 'CM',
  },
  {
    nombre: 'Ana Soto',
    cargo: 'CEO de Sushi House',
    texto: 'Implementamos BiteOps en nuestros 3 locales. La sincronización multi-tenant es impecable, el soporte es excelente y la curva de aprendizaje de nuestro equipo fue mínima. Muy recomendable.',
    iniciales: 'AS',
  },
]
</script>

<template>
  <section class="py-20 sm:py-28 bg-white dark:bg-gray-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Lo que dicen nuestros clientes
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Restaurantes que confían en BiteOps para gestionar su operación diaria.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="t in testimonios"
          :key="t.nombre"
          class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          data-scroll
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              {{ t.iniciales }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ t.nombre }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t.cargo }}</p>
            </div>
          </div>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed italic">
            "{{ t.texto }}"
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
