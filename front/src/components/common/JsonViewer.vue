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
  if (['creado', 'create', 'crear'].some(x => v.includes(x))) return 'bg-success'
  if (['editar', 'update', 'modificar'].some(x => v.includes(x))) return 'bg-primary'
  if (['eliminar', 'delete', 'borrar'].some(x => v.includes(x))) return 'bg-danger'
  if (v === 'activo' || v === 'listo' || v === 'recibida' || v === 'cerrada') return 'bg-success'
  if (v === 'pendiente' || v === 'en_preparacion') return 'bg-warning text-dark'
  if (v === 'cancelado' || v === 'cancelada' || v === 'inactivo') return 'bg-secondary'
  if (v === 'abierto' || v === 'abierta') return 'bg-info'
  if (v === 'efectivo') return 'bg-success'
  if (v === 'tarjeta') return 'bg-primary'
  if (v === 'transferencia') return 'bg-info'
  if (v === 'mixto') return 'bg-warning text-dark'
  return 'bg-secondary'
}

function toggle() {
  expandido.value = !expandido.value
}
</script>

<template>
  <div v-if="data" class="audit-detail-viewer">
    <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none" @click="toggle">
      <span class="me-1">{{ expandido ? '▼' : '▶' }}</span>
      <span class="small text-muted">Ver detalles</span>
    </button>

    <div v-if="expandido && parsed" class="audit-card card mt-2 border-0 shadow-sm">
      <!-- Structured card for known entities -->
      <template v-if="config">
        <div class="card-header bg-transparent border-bottom-0 pb-0 pt-2">
          <span class="me-1">{{ config.icon }}</span>
          <span class="fw-semibold small">{{ config.title }}</span>
        </div>
        <div class="card-body pt-1 pb-2 px-3">
          <template v-if="mappedFields.length">
            <div
              v-for="field in mappedFields"
              :key="field.key"
              class="d-flex justify-content-between align-items-start py-1 border-bottom border-light"
            >
              <span class="text-muted small">{{ field.label }}</span>
              <span class="text-end small fw-medium">
                <template v-if="field.format === 'badge'">
                  <span :class="`badge badge-sm ${badgeClass(field.value)}`">
                    {{ String(field.value) }}
                  </span>
                </template>
                <template v-else-if="field.format === 'boolean'">
                  <span class="badge" :class="field.value ? 'bg-success' : 'bg-secondary'">
                    {{ field.value ? 'Sí' : 'No' }}
                  </span>
                </template>
                <template v-else-if="field.format === 'precio'">
                  <span class="text-success fw-bold">{{ formatValue(field.value, field.format) }}</span>
                </template>
                <template v-else>
                  {{ formatValue(field.value, field.format) }}
                </template>
              </span>
            </div>
          </template>
          <div v-else class="text-muted small fst-italic py-1">Sin datos disponibles</div>
        </div>
      </template>

      <!-- Fallback: key-value list for unknown entities -->
      <template v-else>
        <div class="card-header bg-transparent border-bottom-0 pb-0 pt-2">
          <span class="me-1">📄</span>
          <span class="fw-semibold small">Detalles</span>
        </div>
        <div class="card-body pt-1 pb-2 px-3">
          <div
            v-for="field in unknownFields"
            :key="field.key"
            class="d-flex justify-content-between align-items-start py-1 border-bottom border-light"
          >
            <span class="text-muted small">{{ field.label }}</span>
            <span class="text-end small fw-medium">{{ formatValue(field.value) }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
  <span v-else class="text-muted">-</span>
</template>

<style scoped>
.audit-card {
  font-size: 13px;
  max-width: 340px;
}

.audit-card .card-header {
  font-size: 12px;
}

.audit-card .border-bottom:last-child {
  border-bottom: none !important;
}

.badge-sm {
  font-size: 11px;
  font-weight: 500;
}
</style>
