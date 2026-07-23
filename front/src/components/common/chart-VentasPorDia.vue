<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{ data: any[] }>()

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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true },
  },
}
</script>

<template>
  <div style="height: 220px;">
    <Bar v-if="data.length" :data="chartData" :options="chartOptions" />
    <p v-else class="text-muted text-center mt-4">Sin datos de ventas</p>
  </div>
</template>
