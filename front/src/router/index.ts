import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/mesas',
      name: 'mesas',
      component: () => import('../views/mesas/MesasView.vue'),
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/inventario/InventarioView.vue'),
    },
    {
      path: '/compras',
      name: 'compras',
      component: () => import('../views/compras/ComprasView.vue'),
    },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('../views/ventas/VentasView.vue'),
    },
  ],
})

export default router
