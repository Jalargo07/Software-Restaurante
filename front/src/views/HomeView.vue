<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'
import { useReporteStore } from '../stores/reportes'
import { useToastStore } from '../stores/toast'
import VentasPorDiaChart from '../components/common/chart-VentasPorDia.vue'
import MesasChart from '../components/common/chart-Mesas.vue'
import TopProductosChart from '../components/common/chart-TopProductos.vue'
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
          <button
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="reporteStore.filtroPeriodo === 'hoy' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="cambiarPeriodo('hoy')"
          >
            <Calendar :size="14" /> Hoy
          </button>
          <button
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="reporteStore.filtroPeriodo === '7dias' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="cambiarPeriodo('7dias')"
          >
            <Calendar :size="14" /> Últimos 7 días
          </button>
          <button
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="reporteStore.filtroPeriodo === '30dias' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="cambiarPeriodo('30dias')"
          >
            <CalendarRange :size="14" /> Últimos 30 días
          </button>
          <button
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="reporteStore.filtroPeriodo === 'mes' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="cambiarPeriodo('mes')"
          >
            <Calendar :size="14" /> Este Mes
          </button>
          <button
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="reporteStore.filtroPeriodo === 'personalizado' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="reporteStore.filtroPeriodo = 'personalizado'"
          >
            <SlidersHorizontal :size="14" /> Personalizado
          </button>
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
        <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-sm h-full overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="p-3 bg-white/25 rounded-lg">
                <Coins :size="24" class="text-white" />
              </div>
              <span class="bg-white/25 text-white text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                <ArrowUp :size="12" /> {{ reporteStore.ventasHoy.cantidad }} transacciones
              </span>
            </div>
            <div class="text-white/70 text-xs font-semibold uppercase tracking-wider">Ventas Totales</div>
            <div class="text-2xl font-extrabold text-white">${{ Number(reporteStore.ventasHoy.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}</div>
          </div>
          <div class="pt-0 pb-3 px-4 text-white/70 text-xs">
            Período seleccionado
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="p-3 rounded-lg" style="background-color: rgba(111, 66, 193, 0.1); color: #6f42c1;">
                <ShoppingBag :size="24" />
              </div>
              <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {{ reporteStore.comprasMes.cantidad }} compras
              </span>
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Compras Insumos</div>
            <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100">${{ Number(reporteStore.comprasMes.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 py-2 px-4 text-gray-500 dark:text-gray-400 text-xs">
            Gastos en inventario
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                <Store :size="24" />
              </div>
              <span class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full font-semibold">
                {{ stats.mesasDisponibles }} libres
              </span>
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Mesas Ocupadas</div>
            <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{{ stats.mesasOcupadas }} <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">/ {{ stats.mesasDisponibles + stats.mesasOcupadas }}</span></div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 py-2 px-4 text-gray-500 dark:text-gray-400 text-xs">
            Salón activo
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400">
                <FileText :size="24" />
              </div>
              <span class="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-semibold">
                En proceso
              </span>
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Pedidos Abiertos</div>
            <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{{ stats.pedidosActivos }}</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 py-2 px-4 text-gray-500 dark:text-gray-400 text-xs">
            Ventas en curso
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div class="flex items-center p-3">
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 me-3">
              <AlertTriangle :size="20" />
            </div>
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold">Productos con Stock Bajo</div>
              <div class="text-xl font-bold text-red-500 dark:text-red-400">{{ stats.productosBajoStock }} <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">items</span></div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:col-span-1 md:col-span-1">
          <div class="flex items-center p-3">
            <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 me-3">
              <Star :size="20" />
            </div>
            <div class="truncate">
              <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold">Producto Estrella</div>
              <div class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{{ reporteStore.productosMasVendidos[0]?.nombre || 'Sin datos' }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:col-span-2 md:col-span-2">
          <div class="flex items-center p-3">
            <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 me-3">
              <TrendingUp :size="20" />
            </div>
            <div>
              <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold">Ticket Promedio Estimado</div>
              <div class="text-lg font-bold text-green-600 dark:text-green-400">
                ${{ reporteStore.ventasHoy.cantidad > 0 ? (reporteStore.ventasHoy.total / reporteStore.ventasHoy.cantidad).toFixed(0) : 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full xl:col-span-2">
          <div class="pt-4 px-4 flex justify-between items-center">
            <div>
              <h5 class="font-bold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 :size="18" class="text-blue-600 dark:text-blue-400" /> Evolución de Ventas
              </h5>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Comportamiento financiero en el rango seleccionado</p>
            </div>
          </div>
          <div class="px-4 pb-4">
            <div class="h-[320px]">
              <VentasPorDiaChart :data="reporteStore.ventasPorDia" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full">
          <div class="pt-4 px-4">
            <h5 class="font-bold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <PieChart :size="18" class="text-cyan-500 dark:text-cyan-400" /> Ocupación de Mesas
            </h5>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Distribución actual del salón</p>
          </div>
          <div class="px-4 pb-4 flex flex-col justify-center items-center">
            <div class="h-[260px] w-full">
              <MesasChart :disponibles="stats.mesasDisponibles" :ocupadas="stats.mesasOcupadas" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm xl:col-span-3">
          <div class="pt-4 px-4">
            <h5 class="font-bold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Trophy :size="18" class="text-amber-500 dark:text-amber-400" /> Productos Más Vendidos
            </h5>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Ranking de platos y bebidas con mayor demanda</p>
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
