<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: {
    horas: number[];
    dias: string[];
    matrix: number[][];
  };
}>();

const maxValue = computed(() => {
  let max = 0;
  for (const row of props.data.matrix) {
    for (const val of row) {
      if (val > max) max = val;
    }
  }
  return max || 1;
});

function getColor(value: number): string {
  const intensity = value / maxValue.value;
  if (intensity < 0.2) return 'bg-base-200';
  if (intensity < 0.4) return 'bg-success/30';
  if (intensity < 0.6) return 'bg-success/50';
  if (intensity < 0.8) return 'bg-success/70';
  return 'bg-success';
}
</script>

<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h3 class="card-title text-lg">Heatmap de Ventas</h3>
      <p class="text-sm text-base-content/60">Productos vendidos por hora y día de la semana</p>

      <div class="overflow-x-auto mt-4">
        <table class="table table-sm">
          <thead>
            <tr>
              <th class="text-xs">Hora</th>
              <th v-for="dia in data.dias" :key="dia" class="text-xs text-center">{{ dia.substring(0, 3) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(hora, hIdx) in data.horas" :key="hora">
              <td class="text-xs font-mono">{{ hora }}:00</td>
              <td v-for="(dia, dIdx) in data.dias" :key="dia" class="text-center p-1">
                <div
                  class="w-8 h-8 mx-auto rounded flex items-center justify-center text-xs font-bold"
                  :class="getColor(data.matrix[dIdx][hIdx])"
                  :title="`${data.matrix[dIdx][hIdx]} ventas`"
                >
                  {{ data.matrix[dIdx][hIdx] || '' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-center gap-2 mt-4 text-xs">
        <span>Menos</span>
        <div class="w-4 h-4 bg-base-200 rounded"></div>
        <div class="w-4 h-4 bg-success/30 rounded"></div>
        <div class="w-4 h-4 bg-success/50 rounded"></div>
        <div class="w-4 h-4 bg-success/70 rounded"></div>
        <div class="w-4 h-4 bg-success rounded"></div>
        <span>Más</span>
      </div>
    </div>
  </div>
</template>
