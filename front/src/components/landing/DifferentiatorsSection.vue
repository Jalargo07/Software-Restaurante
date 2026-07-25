<script setup lang="ts">
const rows = [
  { feature: 'Comandas en tiempo real', biteops: true, competencia: false },
  { feature: 'Control de recetas con merma', biteops: true, competencia: false },
  { feature: 'Multi-sucursal', biteops: true, competencia: false },
  { feature: 'Corte de caja automático', biteops: true, competencia: true },
  { feature: 'Reportes con gráficos', biteops: true, competencia: false },
  { feature: 'Precio justo', biteops: true, competencia: false },
]
</script>

<template>
  <section class="py-20 sm:py-28 bg-white dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          ¿Por qué BiteOps?
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Compara y decide. BiteOps ofrece más por menos.
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
            <tr v-for="(row, index) in rows" :key="index" class="border-b border-gray-100 dark:border-gray-800">
              <td class="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{{ row.feature }}</td>
              <td class="py-4 px-4 text-center">
                <span v-if="row.biteops" class="text-green-500 text-lg">&#10003;</span>
                <span v-else class="text-red-400 text-lg">&#10007;</span>
              </td>
              <td class="py-4 px-4 text-center">
                <span v-if="row.competencia" class="text-green-500 text-lg">&#10003;</span>
                <span v-else class="text-red-400 text-lg">&#10007;</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
