import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
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
      meta: { requiresAuth: true, roles: ['admin', 'mesero'] },
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
      path: '/pedidos',
      name: 'pedidos',
      component: () => import('../views/pedidos/PedidosView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero', 'cajero'] },
    },
    {
      path: '/proveedores',
      name: 'proveedores',
      component: () => import('../views/proveedores/ProveedoresView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'mesero'] },
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
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.roles && authStore.user) {
    if (!(to.meta.roles as string[]).includes(authStore.user.rol)) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
