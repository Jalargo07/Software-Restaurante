// ─── String Literal Union Types ──────────────────────

export type UsuarioRol = 'admin' | 'mesero' | 'cajero' | 'cocinero' | 'super-admin'

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
  plan?: string
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
  estiloMenu?: EstiloMenu
  pais?: string
  rut?: string
  razonSocial?: string
  giro?: string
  direccion?: string
  comuna?: string
  ciudad?: string
  ambiente?: string
}

export interface TenantConfigUpdatePayload {
  logo?: string | null
  banner?: string | null
  colorPrimario?: string
  colorSecundario?: string
  colorAcento?: string
  nombreCompleto?: string | null
  fontPrincipal?: string
  estiloMenu?: EstiloMenu
  pais?: string
  rut?: string
  razonSocial?: string
  giro?: string
  direccion?: string
  comuna?: string
  ciudad?: string
  ambiente?: string
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
  licenseWarning?: string
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

export interface GananciaBruta {
  dia: string
  ventas: number
  costo: number
  ganancia: number
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

export interface SuperAdminStats {
  total: number
  activos: number
  suspendidos: number
  pendientes: number
  ingresosEstimados: number
}

export type TenantPlan = 'basico' | 'pro' | 'enterprise'
export type TenantEstado = 'pendiente_aprobacion' | 'activo' | 'suspendido'

export interface Tenant {
  id: number
  nombre: string
  slug: string
  plan: TenantPlan
  estado: TenantEstado
  activo: boolean
  createdAt: string
  updatedAt: string
  TenantConfig?: TenantConfig
  productosCount: number
  usuariosCount: number
  ventasHoyCount: number
}

export type TipoDocumentoFiscal = 'boleta' | 'factura'
export type EstadoDocumentoFiscal = 'pendiente' | 'timbrado' | 'rechazado'

export type EstiloMenu = 'elegante' | 'novedoso' | 'minimalista'

export interface DocumentoFiscal {
  id: number
  tenant_id: number
  ventaId: number
  tipo: TipoDocumentoFiscal
  estado: EstadoDocumentoFiscal
  rutCliente?: string
  razonSocial?: string
  giro?: string
  direccion?: string
  comuna?: string
  ciudad?: string
  montoNeto: number
  iva: number
  montoTotal: number
  xml?: string
  pdf?: string
  timbre?: string
  folio?: string
  codigoBarras?: string
  fechaTimbre?: string
  respuestaSii?: any
  createdAt: string
}

// ─── CMS Landing Types ─────────────────────────────────

export interface LandingHero {
  logo: string; titulo: string; tituloGradiente: string; subtitulo: string
  ctaPrincipal: { texto: string; link: string }
  ctaSecundario: { texto: string; link: string }
}
export interface LandingItem { icon: string; titulo: string; descripcion: string }
export interface LandingDiffItem { feature: string; biteops: boolean; competencia: boolean }
export interface LandingPlan { nombre: string; precio: number; comision: string; descripcion: string; features: string[]; planId: string; destacado: boolean }
export interface LandingTestimonial { nombre: string; cargo: string; texto: string; iniciales: string }
export interface LandingCta { titulo: string; subtitulo: string; boton: { texto: string; link: string } }
export interface LandingFooter { marca: string; descripcion: string; grupos: Array<{ titulo: string; links: Array<{ label: string; href: string }> }>; copyright: string }
export interface LandingData {
  hero: LandingHero
  problem: { titulo: string; subtitulo: string; items: LandingItem[] }
  solution: { titulo: string; subtitulo: string; items: LandingItem[] }
  differentiators: { titulo: string; subtitulo: string; items: LandingDiffItem[] }
  pricing: { titulo: string; subtitulo: string; planes: LandingPlan[] }
  testimonials: { titulo: string; subtitulo: string; items: LandingTestimonial[] }
  cta: LandingCta
  footer: LandingFooter
}

// ─── Delivery Types ────────────────────────────────────

export type DeliveryApp = 'rappi' | 'uber' | 'pedidosya'

export interface DeliveryConfig {
  id: number
  tenant_id: number
  app: DeliveryApp
  activo: boolean
  webhookSecret?: string
  apiKey?: string
  createdAt: string
}

export interface Sucursal {
  id: number
  tenant_id: number
  nombre: string
  direccion?: string
  telefono?: string
  activo: boolean
  createdAt?: string
}

export interface DeliverySimularPayload {
  app: DeliveryApp
  productos: Array<{ nombre: string; cantidad: number; precio?: number }>
}
