<script setup lang="ts">
const features = [
  {
    icon: '📱',
    title: 'Comandas digitales',
    description: 'Pedidos en tiempo real del mesero a cocina. Sin papel, sin errores, sin demoras.',
  },
  {
    icon: '📦',
    title: 'Control de inventario',
    description: 'Stock en tiempo real, alertas de stock bajo y descuento automático por recetas.',
  },
  {
    icon: '💰',
    title: 'Corte de caja',
    description: 'Cierre de caja diario con desglose por método de pago y reportes automáticos.',
  },
  {
    icon: '📊',
    title: 'Reportes inteligentes',
    description: 'Ventas por día, productos más vendidos, tendencias y exportación a Excel.',
  },
  {
    icon: '🛒',
    title: 'Compras y proveedores',
    description: 'Gestiona órdenes de compra, recepción de mercancía e historial de proveedores.',
  },
  {
    icon: '🏢',
    title: 'Multi-sucursal',
    description: 'Administra múltiples sucursales desde un solo panel con datos independientes.',
  },
]
</script>

<template>
  <section id="features" class="py-20 sm:py-28 bg-gray-50 dark:bg-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16" data-scroll>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          BiteOps lo resuelve
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Todo lo que necesitas para operar tu restaurante de forma eficiente, en un solo lugar.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all"
          data-scroll
        >
          <span class="text-4xl mb-4 block">{{ feature.icon }}</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
