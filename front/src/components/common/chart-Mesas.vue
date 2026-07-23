<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{ disponibles: number; ocupadas: number }>()

const chartData = computed(() => ({
  labels: ['Disponibles', 'Ocupadas'],
  datasets: [{
    data: [props.disponibles, props.ocupadas],
    backgroundColor: ['#00b894', '#e17055'],
    borderWidth: 0,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { position: 'bottom' as const },
  },
}
</script>

<template>
  <div style="height: 220px;">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
