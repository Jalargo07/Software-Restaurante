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
  labels: props.data.map((d) => {
    const fecha = new Date(d.dia)
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
  }),
  datasets: [{
    label: 'Ventas ($)',
    data: props.data.map((d) => Number(d.total)),
    backgroundColor: 'rgba(108, 92, 231, 0.7)',
    borderColor: 'rgba(108, 92, 231, 1)',
    borderWidth: 1,
    borderRadius: 6,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      ticks: { color: isDark.value ? '#a1a1aa' : '#636e72' },
    },
    x: {
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
