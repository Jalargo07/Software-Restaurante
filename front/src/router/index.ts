import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
      path: '/super-admin',
      name: 'super-admin',
      component: () => import('../views/admin/SuperAdminView.vue'),
      meta: { requiresAuth: true, roles: ['super-admin'] } as RouteMeta,
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('../views/ReportesView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.publico) return next()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.name === 'landing' && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.name === 'tenant-login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.roles && authStore.user) {
    if (!(to.meta.roles as string[]).includes(authStore.user.rol)) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
