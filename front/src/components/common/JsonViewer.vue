<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ data: any; entidad?: string }>()
const expandido = ref(false)

interface FieldDef {
  key: string
  label: string
  format?: 'precio' | 'fecha' | 'boolean' | 'badge'
  badgeClass?: string
}

const ENTITY_CONFIG: Record<string, { icon: string; title: string; fields: FieldDef[] }> = {
  Producto: {
    icon: '📦',
    title: 'Producto',
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'precioVenta', label: 'Precio de venta', format: 'precio' },
      { key: 'precioCompra', label: 'Precio de compra', format: 'precio' },
      { key: 'categoria', label: 'Categoría', format: 'badge' },
      { key: 'tipo', label: 'Tipo', format: 'badge' },
      { key: 'stock', label: 'Stock' },
      { key: 'stockMinimo', label: 'Stock mínimo' },
      { key: 'unidad', label: 'Unidad', format: 'badge' },
    ],
  },
  Venta: {
    icon: '🛒',
    title: 'Venta',
    fields: [
      { key: 'total', label: 'Total', format: 'precio' },
      { key: 'metodoPago', label: 'Método de pago', format: 'badge' },
      { key: 'estado', label: 'Estado', format: 'badge' },
      { key: 'tipo', label: 'Tipo de venta', format: 'badge' },
      { key: 'mesa', label: 'Mesa' },
      { key: 'usuario', label: 'Vendedor' },
    ],
  },
  Compra: {
    icon: '📋',
    title: 'Compra',
    fields: [
      { key: 'total', label: 'Total', format: 'precio' },
      { key: 'estado', label: 'Estado', format: 'badge' },
      { key: 'proveedor', label: 'Proveedor' },
      { key: 'usuario', label: 'Comprador' },
    ],
  },
  DetalleVenta: {
    icon: '🧾',
    title: 'Detalle de venta',
    fields: [
      { key: 'producto', label: 'Producto' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'precioUnitario', label: 'Precio unitario', format: 'precio' },
      { key: 'subtotal', label: 'Subtotal', format: 'precio' },
      { key: 'estadoComanda', label: 'Estado comanda', format: 'badge' },
    ],
  },
  DetalleCompra: {
    icon: '📦',
    title: 'Detalle de compra',
    fields: [
      { key: 'producto', label: 'Producto' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'precioUnitario', label: 'Precio unitario', format: 'precio' },
      { key: 'subtotal', label: 'Subtotal', format: 'precio' },
    ],
  },
  Receta: {
    icon: '🍽️',
    title: 'Receta',
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'porciones', label: 'Porciones' },
      { key: 'producto', label: 'Producto base' },
      { key: 'detalles', label: 'Ingredientes' },
    ],
  },
  Proveedor: {
    icon: '🏭',
    title: 'Proveedor',
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'contacto', label: 'Contacto' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'email', label: 'Email' },
    ],
  },
  Usuario: {
    icon: '👤',
    title: 'Usuario',
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'rol', label: 'Rol', format: 'badge' },
      { key: 'activo', label: 'Activo', format: 'boolean' },
    ],
  },
  Mesa: {
    icon: '🪑',
    title: 'Mesa',
    fields: [
      { key: 'numero', label: 'Número' },
      { key: 'capacidad', label: 'Capacidad' },
      { key: 'estado', label: 'Estado', format: 'badge' },
    ],
  },
  CorteCaja: {
    icon: '💰',
    title: 'Corte de caja',
    fields: [
      { key: 'totalGeneral', label: 'Total general', format: 'precio' },
      { key: 'totalEfectivo', label: 'Efectivo', format: 'precio' },
      { key: 'totalTarjeta', label: 'Tarjeta', format: 'precio' },
      { key: 'totalTransferencia', label: 'Transferencia', format: 'precio' },
      { key: 'ventasCerradas', label: 'Ventas cerradas' },
    ],
  },
  CorteCajaDetallado: {
    icon: '💰',
    title: 'Corte de caja',
    fields: [
      { key: 'totalGeneral', label: 'Total general', format: 'precio' },
      { key: 'totalEfectivo', label: 'Efectivo', format: 'precio' },
      { key: 'totalTarjeta', label: 'Tarjeta', format: 'precio' },
      { key: 'totalTransferencia', label: 'Transferencia', format: 'precio' },
      { key: 'ventasCerradas', label: 'Ventas cerradas' },
    ],
  },
}

const parsed = computed(() => {
  if (!props.data) return null
  const raw = typeof props.data === 'string' ? (() => { try { return JSON.parse(props.data) } catch { return null } })() : props.data
  if (!raw || typeof raw !== 'object') return null
  return raw
})

const config = computed(() => {
  if (props.entidad && ENTITY_CONFIG[props.entidad]) return ENTITY_CONFIG[props.entidad]
  if (parsed.value) {
    const keys = Object.keys(parsed.value)
    for (const [name, cfg] of Object.entries(ENTITY_CONFIG)) {
      const matchCount = cfg.fields.filter(f => keys.includes(f.key)).length
      if (matchCount >= Math.min(3, keys.length)) return cfg
    }
  }
  return null
})

const mappedFields = computed(() => {
  if (!config.value || !parsed.value) return []
  const obj = parsed.value
  return config.value.fields
    .filter(f => obj[f.key] !== undefined && obj[f.key] !== null && obj[f.key] !== '')
    .map(f => ({
      ...f,
      value: obj[f.key],
    }))
})

const unknownFields = computed(() => {
  if (config.value || !parsed.value) return []
  const obj = parsed.value
  return Object.entries(obj).map(([key, value]) => ({
    key,
    label: key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim(),
    value,
  }))
})

function formatValue(value: any, format?: string): string {
  if (value === null || value === undefined) return '-'
  if (format === 'precio' && typeof value === 'number') {
    return '$' + value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (format === 'precio' && typeof value === 'string' && !isNaN(Number(value))) {
    return '$' + Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (format === 'fecha') return new Date(value).toLocaleString('es-MX')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function badgeClass(value: any): string {
  const v = String(value).toLowerCase()
  if (['creado', 'create', 'crear'].some(x => v.includes(x))) return 'green'
  if (['editar', 'update', 'modificar'].some(x => v.includes(x))) return 'blue'
  if (['eliminar', 'delete', 'borrar'].some(x => v.includes(x))) return 'red'
  if (v === 'activo' || v === 'listo' || v === 'recibida' || v === 'cerrada') return 'green'
  if (v === 'pendiente' || v === 'en_preparacion') return 'yellow'
  if (v === 'cancelado' || v === 'cancelada' || v === 'inactivo') return 'gray'
  if (v === 'abierto' || v === 'abierta') return 'cyan'
  if (v === 'efectivo') return 'green'
  if (v === 'tarjeta') return 'blue'
  if (v === 'transferencia') return 'cyan'
  if (v === 'mixto') return 'yellow'
  return 'gray'
}

const badgeTailwind: Record<string, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
}

function toggle() {
  expandido.value = !expandido.value
}
</script>

<template>
  <div v-if="data" class="text-sm">
    <button type="button" class="bg-transparent border-0 p-0 text-decoration-none cursor-pointer inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" @click="toggle">
      <span class="text-xs">{{ expandido ? '▼' : '▶' }}</span>
      <span class="text-xs text-gray-400 dark:text-gray-500">Ver detalles</span>
    </button>

    <div v-if="expandido && parsed" class="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm max-w-[340px] text-sm">
      <template v-if="config">
        <div class="px-3 pt-2 pb-0">
          <span class="mr-1">{{ config.icon }}</span>
          <span class="font-semibold text-xs">{{ config.title }}</span>
        </div>
        <div class="px-3 pt-1 pb-2">
          <template v-if="mappedFields.length">
            <div
              v-for="field in mappedFields"
              :key="field.key"
              class="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <span class="text-gray-500 dark:text-gray-400 text-xs">{{ field.label }}</span>
              <span class="text-right text-xs font-medium">
                <template v-if="field.format === 'badge'">
                  <span :class="`inline-block px-2 py-0.5 rounded text-xs font-medium ${badgeTailwind[badgeClass(field.value)] || badgeTailwind.gray}`">
                    {{ String(field.value) }}
                  </span>
                </template>
                <template v-else-if="field.format === 'boolean'">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-medium" :class="field.value ? badgeTailwind.green : badgeTailwind.gray">
                    {{ field.value ? 'Sí' : 'No' }}
                  </span>
                </template>
                <template v-else-if="field.format === 'precio'">
                  <span class="text-green-600 dark:text-green-400 font-bold">{{ formatValue(field.value, field.format) }}</span>
                </template>
                <template v-else>
                  {{ formatValue(field.value, field.format) }}
                </template>
              </span>
            </div>
          </template>
          <div v-else class="text-gray-400 dark:text-gray-500 italic text-xs py-1">Sin datos disponibles</div>
        </div>
      </template>

      <template v-else>
        <div class="px-3 pt-2 pb-0">
          <span class="mr-1">📄</span>
          <span class="font-semibold text-xs">Detalles</span>
        </div>
        <div class="px-3 pt-1 pb-2">
          <div
            v-for="field in unknownFields"
            :key="field.key"
            class="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <span class="text-gray-500 dark:text-gray-400 text-xs">{{ field.label }}</span>
            <span class="text-right text-xs font-medium">{{ formatValue(field.value) }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
  <span v-else class="text-gray-400 dark:text-gray-500">-</span>
</template>
