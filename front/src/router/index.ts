import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSuperAdminAuthStore } from '../stores/superAdminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/public/LandingPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/:slug/login',
      name: 'tenant-login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/menu/:slug',
      name: 'menu-qr',
      component: () => import('../views/public/MenuQRView.vue'),
      meta: { publico: true },
    },
    {
      path: '/sobre-nosotros',
      name: 'sobre-nosotros',
      component: () => import('../views/public/SobreNosotrosView.vue'),
      meta: { publico: true },
    },
    {
      path: '/contacto',
      name: 'contacto',
      component: () => import('../views/public/ContactoView.vue'),
      meta: { publico: true },
    },
    {
      path: '/privacidad',
      name: 'privacidad',
      component: () => import('../views/public/PrivacidadView.vue'),
      meta: { publico: true },
    },
    {
      path: '/terminos',
      name: 'terminos',
      component: () => import('../views/public/TerminosView.vue'),
      meta: { publico: true },
    },
    {
      path: '/checkout/:plan',
      name: 'checkout',
      component: () => import('../views/checkout/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero', 'cocinero', 'super-admin'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero', 'cocinero'] },
    },
    {
      path: '/mesas',
      name: 'mesas',
      component: () => import('../views/mesas/MesasView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero'] },
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/inventario/InventarioView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/compras',
      name: 'compras',
      component: () => import('../views/compras/ComprasView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('../views/ventas/VentasView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero'] },
    },
    {
      path: '/caja',
      name: 'caja',
      component: () => import('../views/caja/CajaView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'cajero'] },
    },
    {
      path: '/pedidos',
      name: 'pedidos',
      component: () => import('../views/pedidos/PedidosView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero'] },
    },
    {
      path: '/proveedores',
      name: 'proveedores',
      component: () => import('../views/proveedores/ProveedoresView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/comandas',
      name: 'comandas',
      component: () => import('../views/comandas/ComandasView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cocinero'] },
    },
    {
      path: '/recetas',
      name: 'recetas',
      component: () => import('../views/recetas/RecetasView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/usuarios/UsuariosView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/mensajes',
      name: 'mensajes',
      component: () => import('../views/admin/MensajesView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/auditoria',
      name: 'auditoria',
      component: () => import('../views/auditoria/AuditoriaView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/branding',
      name: 'branding',
      component: () => import('../views/branding/BrandingView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/sucursales',
      name: 'sucursales',
      component: () => import('../views/admin/SucursalesView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/super-admin',
      name: 'super-admin',
      component: () => import('../views/admin/SuperAdminView.vue'),
      meta: { requiresAuth: true, roles: ['super-admin'] } as RouteMeta,
    },
    {
      path: '/cms',
      name: 'cms',
      component: () => import('../views/admin/CmsView.vue'),
      meta: { requiresAuth: true, roles: ['super-admin'] } as RouteMeta,
    },
    {
      path: '/admin/login',
      name: 'super-admin-login',
      component: () => import('../views/auth/SuperAdminLoginView.vue'),
    },
    {
      path: '/admin/2fa',
      name: 'super-admin-2fa',
      component: () => import('../views/auth/SuperAdminTwoFactorView.vue'),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/auth/OnboardingView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/super-admin/settings',
      name: 'super-admin-settings',
      component: () => import('../views/admin/SuperAdminSettingsView.vue'),
      meta: { requiresAuth: true, roles: ['super-admin'] } as RouteMeta,
    },
    {
      path: '/admin/refresh-2fa',
      name: 'super-admin-refresh',
      component: () => import('../views/auth/SuperAdminRefreshView.vue'),
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('../views/ReportesView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/delivery/config',
      name: 'delivery-config',
      component: () => import('../views/delivery/DeliveryConfigView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/delivery/pedidos',
      name: 'delivery-pedidos',
      component: () => import('../views/delivery/DeliveryPedidosView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero'] },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const saAuthStore = useSuperAdminAuthStore()
  const token = authStore.token || saAuthStore.token
  const user = authStore.user || saAuthStore.user
  const onboardingCompleted = localStorage.getItem('onboardingCompleted')

  if (saAuthStore.token && to.path === '/') return next('/super-admin')
  if (to.name === 'super-admin-login') return next()
  if (to.name === 'super-admin-2fa') return next()
  if (to.name === 'super-admin-refresh') return next()
  if (to.name === 'onboarding') return next()
  if (to.meta.publico) return next()

  if (to.meta.requiresAuth && !token) return next('/login')

  if (saAuthStore.token && (to.name === 'login' || to.name === 'landing' || to.name === 'tenant-login')) return next('/super-admin')

  if (to.name === 'login' && authStore.token) return next('/dashboard')
  if (to.name === 'landing' && authStore.token) return next('/dashboard')
  if (to.name === 'tenant-login' && authStore.token) return next('/dashboard')

  if (user?.rol === 'admin' && !onboardingCompleted && to.name !== 'onboarding') {
    return next('/onboarding')
  }

  if (to.meta.roles && user && !(to.meta.roles as string[]).includes(user.rol)) {
    return next(saAuthStore.token ? '/super-admin' : '/dashboard')
  }
  next()
})

export default router
