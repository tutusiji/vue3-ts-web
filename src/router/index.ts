import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

import Login from '@/views/Login.vue'
import AdminLayout from '@/views/Admin/Layout.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: () => import('@/views/Admin/Dashboard.vue') },
      { path: 'project/summary', component: () => import('@/views/Admin/Project/ProjectSummary.vue') },
      { path: 'project/detail', component: () => import('@/views/Admin/Project/ProjectDetail.vue') },
      { path: 'project/robots', component: () => import('@/views/Admin/Project/RobotManagement.vue') },
      { path: 'project/devices', component: () => import('@/views/Admin/Project/DeviceProducts.vue') },
      { path: 'project/models', component: () => import('@/views/Admin/Project/ModelManagement.vue') },
      { path: 'project/alarms', component: () => import('@/views/Admin/Project/AlarmLogs.vue') },
      { path: 'project/annotation/event-type', component: () => import('@/views/Admin/Project/EventType.vue') },
      { path: 'skills/list', component: () => import('@/views/Admin/Skills/SkillList.vue') },
      { path: 'skills/detail', component: () => import('@/views/Admin/Skills/SkillDetail.vue') },
      { path: 'skills/tasks', component: () => import('@/views/Admin/Skills/TrainingTasks.vue') },
      { path: 'skills/history', component: () => import('@/views/Admin/Skills/TrainingHistory.vue') },
      { path: 'skills/public', component: () => import('@/views/Admin/Skills/PublicSkills.vue') },
      { path: 'skills/my', component: () => import('@/views/Admin/Skills/MySkills.vue') },
      { path: 'system/account/users', component: () => import('@/views/Admin/System/UserManagement.vue') },
      { path: 'system/account/roles', component: () => import('@/views/Admin/System/RoleManagement.vue') },
      { path: 'system/org/spaces', component: () => import('@/views/Admin/System/Spaces.vue') },
      { path: 'system/org/orgs', component: () => import('@/views/Admin/System/Organizations.vue') },
      { path: 'system/logs/login', component: () => import('@/views/Admin/System/LoginLogs.vue') },
      { path: 'system/logs/operation', component: () => import('@/views/Admin/System/OperationLogs.vue') },
      { path: 'system/i18n', component: () => import('@/views/Admin/System/I18nManagement.vue') },
      { path: 'system/dict', component: () => import('@/views/Admin/System/DataDictionary.vue') },
      { path: 'system/menu', component: () => import('@/views/Admin/System/MenuManagement.vue') },
      { path: 'system/forbidden', component: () => import('@/views/Admin/System/Forbidden.vue') },
      { path: 'test/api-calls', component: () => import('@/views/TestApiCalls.vue') },
      { path: 'test/version', component: () => import('@/views/VersionTest.vue') },
      { path: 'test/api-calls-fix', name: 'ApiCallTest', component: () => import('@/views/ApiCallTest.vue') },
      { path: 'test/i18n-version', name: 'I18nVersionTest', component: () => import('@/views/I18nVersionTest.vue') },
    ],
  },
  { path: '/', redirect: '/login' },
  { path: '/DynamicForm', name: 'DynamicForm', component: () => import('../views/DynamicForm/Index.vue') },
  { path: '/drag', name: 'drag', component: () => import('../views/DynamicForm/DragPage.vue') },
  { path: '/select', name: 'CascaderSelect', component: () => import('../views/DynamicForm/formComponents/CascaderSelect.vue') },
  { path: '/spider', name: 'SpiderNodes', component: () => import('../views/SpiderNodes/Index.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = useUserStore()
  user.restoreFromStorage()
  // require login for admin pages
  if (to.path.startsWith('/admin')) {
    if (!user.isAuthenticated) {
      ElMessage.error('请先登录')
      return next('/login')
    }
    // role-based check via meta.roles if provided
    const roles = (to.meta as any)?.roles || []
    if (roles.length > 0 && !roles.some((r:any) => user.roles.includes(r))) {
      ElMessage.error('无权限访问')
      return next('/admin/system/forbidden')
    }
  }
  next()
})

export default router
