<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{ disponibles: number; ocupadas: number }>()

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
  labels: ['Disponibles', 'Ocupadas'],
  datasets: [{
    data: [props.disponibles, props.ocupadas],
    backgroundColor: ['#00b894', '#e17055'],
    borderWidth: 0,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: isDark.value ? '#e4e4e7' : '#2d3436' },
    },
  },
}))
</script>

<template>
  <div class="h-[220px]">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
