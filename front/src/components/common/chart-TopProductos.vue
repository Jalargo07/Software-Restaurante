<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{ data: any[] }>()

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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { beginAtZero: true },
  },
}
</script>

<template>
  <div style="height: 220px;">
    <Bar v-if="data.length" :data="chartData" :options="chartOptions" />
    <p v-else class="text-muted text-center mt-4">Sin datos de ventas</p>
  </div>
</template>
