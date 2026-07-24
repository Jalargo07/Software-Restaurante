<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'
import { useReporteStore } from '../stores/reportes'
import { useToastStore } from '../stores/toast'
import VentasPorDiaChart from '../components/common/chart-VentasPorDia.vue'
import MesasChart from '../components/common/chart-Mesas.vue'
import TopProductosChart from '../components/common/chart-TopProductos.vue'
import PeriodoFilterButton from '../components/dashboard/PeriodoFilterButton.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import MiniStatCard from '../components/dashboard/MiniStatCard.vue'
import ChartHeader from '../components/dashboard/ChartHeader.vue'
import {
  Coins,
  ShoppingBag,
  Store,
  FileText,
  AlertTriangle,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Trophy,
  Calendar,
  CalendarRange,
  SlidersHorizontal,
  FileSpreadsheet,
  Check,
  ArrowUp,
} from '@lucide/vue'

const reporteStore = useReporteStore()
const toast = useToastStore()

const stats = ref({
  mesasDisponibles: 0,
  mesasOcupadas: 0,
  productosBajoStock: 0,
  totalProductos: 0,
  pedidosActivos: 0,
})

const getFormattedDate = (date: Date) => date.toISOString().slice(0, 10)

const cambiarPeriodo = (periodo: 'hoy' | '7dias' | '30dias' | 'mes' | 'personalizado') => {
  reporteStore.filtroPeriodo = periodo
  const hoyObj = new Date()
  const hoyStr = getFormattedDate(hoyObj)

  if (periodo === 'hoy') {
    reporteStore.fechaDesde = hoyStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: hoyStr, fechaHasta: hoyStr, dias: 1 })
  } else if (periodo === '7dias') {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    const desdeStr = getFormattedDate(d)
    reporteStore.fechaDesde = desdeStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: desdeStr, fechaHasta: hoyStr, dias: 7 })
  } else if (periodo === '30dias') {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    const desdeStr = getFormattedDate(d)
    reporteStore.fechaDesde = desdeStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: desdeStr, fechaHasta: hoyStr, dias: 30 })
  } else if (periodo === 'mes') {
    const primerDia = new Date(hoyObj.getFullYear(), hoyObj.getMonth(), 1)
    const desdeStr = getFormattedDate(primerDia)
    reporteStore.fechaDesde = desdeStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: desdeStr, fechaHasta: hoyStr })
  }
}

const aplicarFiltroPersonalizado = () => {
  if (!reporteStore.fechaDesde || !reporteStore.fechaHasta) {
    toast.warning('Seleccione fecha desde y hasta')
    return
  }
  reporteStore.fetchAll({
    fechaDesde: reporteStore.fechaDesde,
    fechaHasta: reporteStore.fechaHasta,
  })
}

onMounted(async () => {
  const [mesas, productos, pedidos] = await Promise.all([
    api.get('/mesas'),
    api.get('/productos'),
    api.get('/ventas?estado=abierta'),
  ])

  const mesasArr = mesas.data.data || mesas.data
  const prodsArr = productos.data.data || productos.data

  stats.value = {
    mesasDisponibles: mesasArr.filter((m: any) => m.estado === 'disponible').length,
    mesasOcupadas: mesasArr.filter((m: any) => m.estado === 'ocupada').length,
    productosBajoStock: prodsArr.filter((p: any) => p.stock <= p.stockMinimo).length,
    totalProductos: prodsArr.length,
    pedidosActivos: Number(pedidos.data.total) || 0,
  }

  if (!reporteStore.filtroPeriodo || reporteStore.filtroPeriodo !== 'personalizado') {
    cambiarPeriodo(reporteStore.filtroPeriodo || 'hoy')
  } else if (reporteStore.fechaDesde && reporteStore.fechaHasta) {
    reporteStore.fetchAll({ fechaDesde: reporteStore.fechaDesde, fechaHasta: reporteStore.fechaHasta })
  } else {
    cambiarPeriodo('hoy')
  }
})

async function exportarReporteExcel() {
  try {
    await reporteStore.exportarVentasExcel(reporteStore.fechaDesde, reporteStore.fechaHasta)
    toast.success('Reporte de ventas exportado exitosamente')
  } catch {
    toast.error('Error al exportar reporte')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
      <div>
        <h1 class="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100">Dashboard General</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Resumen operativo y métricas financieras en tiempo real</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shadow-sm disabled:opacity-50"
          @click="exportarReporteExcel"
          :disabled="reporteStore.exportando"
        >
          <svg v-if="reporteStore.exportando" class="animate-spin w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <FileSpreadsheet :size="16" /> Exportar Excel
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 p-3">
      <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
        <div class="flex flex-wrap gap-2">
          <PeriodoFilterButton :activo="reporteStore.filtroPeriodo === 'hoy'" :icono="Calendar" texto="Hoy" @click="cambiarPeriodo('hoy')" />
          <PeriodoFilterButton :activo="reporteStore.filtroPeriodo === '7dias'" :icono="Calendar" texto="Últimos 7 días" @click="cambiarPeriodo('7dias')" />
          <PeriodoFilterButton :activo="reporteStore.filtroPeriodo === '30dias'" :icono="CalendarRange" texto="Últimos 30 días" @click="cambiarPeriodo('30dias')" />
          <PeriodoFilterButton :activo="reporteStore.filtroPeriodo === 'mes'" :icono="Calendar" texto="Este Mes" @click="cambiarPeriodo('mes')" />
          <PeriodoFilterButton :activo="reporteStore.filtroPeriodo === 'personalizado'" :icono="SlidersHorizontal" texto="Personalizado" @click="reporteStore.filtroPeriodo = 'personalizado'" />
        </div>

        <div v-if="reporteStore.filtroPeriodo === 'personalizado'" class="flex items-center gap-2 transition-all">
          <div class="flex">
            <span class="inline-flex items-center px-2 py-1.5 text-sm rounded-l-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-r-0 border-gray-300 dark:border-gray-600">Desde</span>
            <input type="date" class="rounded-none rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" v-model="reporteStore.fechaDesde" />
          </div>
          <div class="flex">
            <span class="inline-flex items-center px-2 py-1.5 text-sm rounded-l-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-r-0 border-gray-300 dark:border-gray-600">Hasta</span>
            <input type="date" class="rounded-none rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" v-model="reporteStore.fechaHasta" />
          </div>
          <button class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap" @click="aplicarFiltroPersonalizado">
            <Check :size="14" /> Aplicar
          </button>
        </div>
      </div>
    </div>

    <div v-if="reporteStore.loading && stats.pedidosActivos === 0" class="text-center py-5">
      <div class="animate-spin w-12 h-12 border-2 border-current border-t-transparent rounded-full text-blue-600 mx-auto"></div>
      <p class="text-gray-500 dark:text-gray-400 mt-3 font-medium">Actualizando métricas...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard variante="gradient" :badge="`${reporteStore.ventasHoy.cantidad} transacciones`" titulo="Ventas Totales" :valor="`$${Number(reporteStore.ventasHoy.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`" footer="Período seleccionado">
          <template #icon><Coins :size="24" class="text-white" /></template>
          <template #badge-icon><ArrowUp :size="12" /></template>
        </StatCard>

        <StatCard icon-color="purple" :badge="`${reporteStore.comprasMes.cantidad} compras`" titulo="Compras Insumos" :valor="`$${Number(reporteStore.comprasMes.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`" footer="Gastos en inventario">
          <template #icon><ShoppingBag :size="24" /></template>
        </StatCard>

        <StatCard icon-color="blue" :badge="`${stats.mesasDisponibles} libres`" titulo="Mesas Ocupadas" footer="Salón activo">
          <template #icon><Store :size="24" /></template>
          <template #valor>{{ stats.mesasOcupadas }} <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">/ {{ stats.mesasDisponibles + stats.mesasOcupadas }}</span></template>
        </StatCard>

        <StatCard icon-color="amber" badge="En proceso" titulo="Pedidos Abiertos" :valor="String(stats.pedidosActivos)" footer="Ventas en curso">
          <template #icon><FileText :size="24" /></template>
        </StatCard>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <MiniStatCard icon-color="red" titulo="Productos con Stock Bajo">
          <template #icon><AlertTriangle :size="20" /></template>
          <template #valor>{{ stats.productosBajoStock }} <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">items</span></template>
        </MiniStatCard>

        <MiniStatCard icon-color="blue" titulo="Producto Estrella" :valor="reporteStore.productosMasVendidos[0]?.nombre || 'Sin datos'" class="sm:col-span-1 md:col-span-1">
          <template #icon><Star :size="20" /></template>
        </MiniStatCard>

        <MiniStatCard icon-color="green" titulo="Ticket Promedio Estimado" class="sm:col-span-2 md:col-span-2">
          <template #icon><TrendingUp :size="20" /></template>
          <template #valor>${{ reporteStore.ventasHoy.cantidad > 0 ? (reporteStore.ventasHoy.total / reporteStore.ventasHoy.cantidad).toFixed(0) : 0 }}</template>
        </MiniStatCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full xl:col-span-2">
          <div class="pt-4 px-4 flex justify-between items-center">
            <ChartHeader icon-color="blue" titulo="Evolución de Ventas" descripcion="Comportamiento financiero en el rango seleccionado">
              <template #icon><BarChart3 :size="18" /></template>
            </ChartHeader>
          </div>
          <div class="px-4 pb-4">
            <div class="h-[320px]">
              <VentasPorDiaChart :data="reporteStore.ventasPorDia" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full">
          <div class="pt-4 px-4">
            <ChartHeader icon-color="cyan" titulo="Ocupación de Mesas" descripcion="Distribución actual del salón">
              <template #icon><PieChart :size="18" /></template>
            </ChartHeader>
          </div>
          <div class="px-4 pb-4 flex flex-col justify-center items-center">
            <div class="h-[260px] w-full">
              <MesasChart :disponibles="stats.mesasDisponibles" :ocupadas="stats.mesasOcupadas" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm xl:col-span-3">
          <div class="pt-4 px-4">
            <ChartHeader icon-color="amber" titulo="Productos Más Vendidos" descripcion="Ranking de platos y bebidas con mayor demanda">
              <template #icon><Trophy :size="18" /></template>
            </ChartHeader>
          </div>
          <div class="px-4 pb-4">
            <div class="h-[300px]">
              <TopProductosChart :data="reporteStore.productosMasVendidos" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
