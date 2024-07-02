import { createRouter, createWebHistory } from 'vue-router'
import DynamicForm from '../views/DynamicForm/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'DynamicForm',
      component: DynamicForm
    },
    {
      path: '/drag',
      name: 'drag',
      component: () => import('../views/DragPage.vue')
    },
    {
      path: '/select',
      name: 'CascaderSelect',
      component: () => import('../views/DynamicForm/formComponents/CascaderSelect.vue')
    }
  ]
})

export default router
