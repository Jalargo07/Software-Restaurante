// ─── String Literal Union Types ──────────────────────

export type UsuarioRol = 'admin' | 'mesero' | 'cajero' | 'cocinero'

export type ProductoCategoria = 'bebida' | 'comida' | 'insumo' | 'postre'

export type ProductoUnidad = 'unidad' | 'kg' | 'litro' | 'docena'

export type ProductoTipo = 'insumo' | 'compuesto' | 'directo'

export type MesaEstado = 'disponible' | 'ocupada' | 'reservada' | 'mantenimiento'

export type VentaEstado = 'abierta' | 'cerrada' | 'cancelada'

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto'

export type CompraEstado = 'pendiente' | 'recibida' | 'cancelada'

export type EstadoComanda = 'pendiente' | 'en_preparacion' | 'listo'

export type DetalleRecetaUnidad = 'kg' | 'g' | 'litro' | 'ml' | 'unidad'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

// ─── Model Interfaces ────────────────────────────────

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: UsuarioRol
  activo: boolean
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  categoria: ProductoCategoria
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  unidad: ProductoUnidad
  tipo: ProductoTipo
  activo: boolean
  imagen: string | null
  merma: number
  detallesReceta?: DetalleReceta[]
}

export interface Proveedor {
  id: number
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: boolean
}

export interface Mesa {
  id: number
  numero: number
  capacidad: number
  estado: MesaEstado
  ubicacion: string | null
}

export interface Venta {
  id: number
  mesaId: number | null
  total: number
  estado: VentaEstado
  metodoPago: MetodoPago | null
  cliente: string | null
  createdAt?: string
  DetalleVentas?: DetalleVenta[]
  DetalleVenta?: DetalleVenta[]
  Mesa?: Mesa
}

export interface DetalleVenta {
  id: number
  VentaId: number
  ProductoId: number
  cantidad: number
  precioUnitario: number
  subtotal: number
  estadoComanda: EstadoComanda
  Producto?: Producto
}

export interface Compra {
  id: number
  proveedorId: number
  fecha: string
  total: number
  estado: CompraEstado
  observaciones: string | null
  createdAt?: string
  DetalleCompras?: DetalleCompra[]
  Proveedor?: Proveedor
}

export interface DetalleCompra {
  id: number
  CompraId: number
  ProductoId: number
  cantidad: number
  precioUnitario: number
  subtotal: number
  Producto?: Producto
}

export interface DetalleReceta {
  id: number
  productoId: number
  insumoId: number
  cantidad: number
  unidad: DetalleRecetaUnidad
  merma: number
  insumo?: Producto
}

export interface CorteCaja {
  id: number
  fecha: string
  totalEfectivo: number
  totalTarjeta: number
  totalTransferencia: number
  totalGeneral: number
  cantidadVentas: number
  ventasCanceladas: number
  montoCanceladas: number
  ventasCerradas: unknown
  usuarioId: number | null
  cerradoEn: string
}

export interface Auditoria {
  id: number
  usuarioId: number | null
  usuarioEmail: string | null
  accion: string
  entidad: string
  entidadId: number | null
  detalles: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface TenantConfig {
  id: number
  tenant_id: number
  logo: string | null
  banner: string | null
  colorPrimario: string
  colorSecundario: string
  colorAcento: string
  nombreCompleto: string | null
  fontPrincipal: string
}

export interface TenantConfigUpdatePayload {
  logo?: string | null
  banner?: string | null
  colorPrimario?: string
  colorSecundario?: string
  colorAcento?: string
  nombreCompleto?: string | null
  fontPrincipal?: string
}

export interface PublicBrandingResponse {
  tenant: string
  slug: string
  branding: TenantConfig
}

// ─── API Payloads ────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  usuario: Omit<Usuario, 'password'>
}

export interface ProductoCreatePayload {
  nombre: string
  descripcion?: string
  categoria: ProductoCategoria
  precioCompra: number
  precioVenta: number
  stock?: number
  stockMinimo?: number
  unidad?: ProductoUnidad
  tipo?: ProductoTipo
  imagen?: string
  detallesReceta?: DetalleRecetaPayload[]
}

export interface ProductoUpdatePayload {
  nombre?: string
  descripcion?: string
  categoria?: ProductoCategoria
  precioCompra?: number
  precioVenta?: number
  stock?: number
  stockMinimo?: number
  unidad?: ProductoUnidad
  tipo?: ProductoTipo
  imagen?: string
  activo?: boolean
  detallesReceta?: DetalleRecetaPayload[]
}

export interface ProveedorCreatePayload {
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
}

export interface ProveedorUpdatePayload {
  nombre?: string
  telefono?: string
  email?: string
  direccion?: string
}

export interface MesaCreatePayload {
  numero: number
  capacidad?: number
  ubicacion?: string
}

export interface MesaUpdatePayload {
  numero?: number
  capacidad?: number
  estado?: MesaEstado
  ubicacion?: string
}

export interface VentaCreatePayload {
  mesaId?: number
}

export interface VentaRapidaPayload {
  mesaId?: number
  metodoPago: MetodoPago
  cliente?: string
  productos: VentaProductoPayload[]
}

export interface VentaProductoPayload {
  productoId: number
  cantidad: number
  precioUnitario?: number
}

export interface CompraDetallePayload {
  productoId: number
  cantidad: number
  precioUnitario: number
}

export interface CompraCreatePayload {
  proveedorId: number
  observaciones?: string
  detalles: CompraDetallePayload[]
}

export interface CompraUpdatePayload {
  proveedorId?: number
  observaciones?: string
  detalles?: CompraDetallePayload[]
}

export interface DetalleRecetaPayload {
  insumoId: number
  cantidad: number
  unidad?: DetalleRecetaUnidad
  merma?: number
}

export interface UsuarioCreatePayload {
  nombre: string
  email: string
  password: string
  rol: UsuarioRol
}

export interface UsuarioUpdatePayload {
  nombre?: string
  email?: string
  password?: string
  rol?: UsuarioRol
}

// ─── Report Types ────────────────────────────────────

export interface ReporteVentasHoy {
  total: number
  cantidad: number
}

export interface ProductoMasVendido {
  productoId: number
  nombre: string
  totalVendido: number
  totalIngresos: number
}

export interface ResumenCaja {
  total: number
  cantidad: number
}

export interface VentasPorDia {
  dia: string
  cantidad: number
  total: number
}

// ─── Pagination ──────────────────────────────────────

export interface PaginatedResponse<T> {
  logs: T[]
  total: number
  page: number
  totalPages: number
}

// ─── Utility Interfaces ──────────────────────────────

export interface UploadResponse {
  imagen: string
}

export interface AuditoriaFiltros {
  usuario?: string
  entidad?: string
  desde?: string
  hasta?: string
}

export interface Toast {
  id: number
  message: string
  type: ToastType
}
