<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import type { GananciaBruta } from '../../types'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  data: GananciaBruta[]
}>()

const   chartData = computed(() => ({
  labels: props.data.map((item) => item.dia),
  datasets: [
    {
      label: 'Costo ($)',
      data: props.data.map((item) => item.costo),
      backgroundColor: '#ef4444',
      stack: 'combined',
    },
    {
      label: 'Ganancia ($)',
      data: props.data.map((item) => item.ganancia),
      backgroundColor: '#eab308',
      stack: 'combined',
    },
    {
      label: 'Ventas ($)',
      data: props.data.map((item) => item.ventas),
      backgroundColor: '#22c55e',
      stack: 'combined',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true },
  },
  plugins: {
    legend: { position: 'top' as const },
  },
}
</script>

<template>
  <div class="w-full h-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
