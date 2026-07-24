<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{ data: any[] }>()

const isDark = ref(document.documentElement.getAttribute('data-theme') === 'dark')
let observer: MutationObserver | null = null

onMounted(() => {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
      }
    })
  })
  observer.observe(document.documentElement, { attributes: true })
})

onUnmounted(() => {
  observer?.disconnect()
})

const chartData = computed(() => ({
  labels: props.data.map((d) => d.nombre),
  datasets: [{
    label: 'Unidades vendidas',
    data: props.data.map((d) => d.totalVendido),
    backgroundColor: [
      'rgba(108, 92, 231, 0.7)',
      'rgba(0, 184, 148, 0.7)',
      'rgba(253, 203, 110, 0.7)',
      'rgba(225, 112, 85, 0.7)',
      'rgba(116, 185, 255, 0.7)',
      'rgba(162, 155, 254, 0.7)',
      'rgba(255, 118, 117, 0.7)',
      'rgba(85, 239, 196, 0.7)',
      'rgba(255, 159, 67, 0.7)',
      'rgba(200, 214, 229, 0.7)',
    ],
    borderRadius: 6,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      ticks: { color: isDark.value ? '#a1a1aa' : '#636e72' },
    },
    y: {
      grid: { color: isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      ticks: { color: isDark.value ? '#a1a1aa' : '#636e72' },
    },
  },
}))
</script>

<template>
  <div class="h-[220px]">
    <Bar v-if="data.length" :data="chartData" :options="chartOptions" />
    <p v-else class="text-gray-400 text-sm text-center mt-4">Sin datos de ventas</p>
  </div>
</template>
