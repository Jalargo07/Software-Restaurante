<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

const props = defineProps<{
  data: {
    totalVentas: number
    totalCostos: number
    cogsPorcentaje: number
    gananciaBruta: number
    margenPorcentaje: number
  }
}>()

const chartData = computed(() => ({
  labels: ['COGS', 'Ganancia Bruta'],
  datasets: [
    {
      label: 'COGS vs Ganancia',
      data: [props.data.totalCostos, props.data.gananciaBruta],
      backgroundColor: ['#ef4444', '#22c55e'],
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'COGS - Costo de Goods Sold' },
  },
}
</script>

<template>
  <div class="w-full h-full">
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="stat bg-base-200 rounded-lg py-2">
        <div class="stat-title text-xs">Total Ventas</div>
        <div class="stat-value text-lg text-primary">${{ data.totalVentas.toLocaleString() }}</div>
      </div>
      <div class="stat bg-base-200 rounded-lg py-2">
        <div class="stat-title text-xs">Total Costos</div>
        <div class="stat-value text-lg text-error">${{ data.totalCostos.toLocaleString() }}</div>
      </div>
      <div class="stat bg-base-200 rounded-lg py-2">
        <div class="stat-title text-xs">% COGS</div>
        <div class="stat-value text-lg" :class="data.cogsPorcentaje > 40 ? 'text-error' : 'text-warning'">
          {{ data.cogsPorcentaje }}%
        </div>
      </div>
      <div class="stat bg-base-200 rounded-lg py-2">
        <div class="stat-title text-xs">Margen</div>
        <div class="stat-value text-lg text-success">{{ data.margenPorcentaje.toFixed(1) }}%</div>
      </div>
    </div>

    <div class="h-40">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
