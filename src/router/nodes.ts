// 导航节点配置（用于菜单与权限）
export type Role = string
export interface MenuNode {
  id: string
  title: string // i18n key
  path?: string
  icon?: string
  roles?: Role[] // 允许访问的角色（为空则表示公开/登录后可见）
  children?: MenuNode[]
}

type TopKey = 'project' | 'skills' | 'system'

const topModel: Record<TopKey, { id: string; key: TopKey; title: string; nodes: MenuNode[] }> = {
  project: {
    id: 'project-root',
    key: 'project',
    title: 'menu.projectManagement',
    nodes: [
      {
        id: 'proj-mgr',
        title: 'menu.projectManagement',
        children: [
          { id: 'proj-summary', title: 'menu.projectOverview', path: '/admin/project/summary' },
          { id: 'proj-detail', title: 'menu.projectDetail', path: '/admin/project/detail' },
        ],
      },
      {
        id: 'robot-mgr',
        title: 'menu.robotManagement',
        children: [
          { id: 'robot-list', title: 'menu.robotManagement', path: '/admin/project/robots' },
          { id: 'device-products', title: 'menu.productDevices', path: '/admin/project/devices' },
          { id: 'model-mgr', title: 'menu.modelManagement', path: '/admin/project/models' },
          { id: 'alarm-logs', title: 'menu.alarmLogs', path: '/admin/project/alarms' },
        ],
      },
      {
        id: 'basic-annotation',
        title: 'menu.basicAnnotation',
        children: [
          { id: 'event-type', title: 'menu.eventTypes', path: '/admin/project/annotation/event-type' },
        ],
      },
    ],
  },
  skills: {
    id: 'skills-root',
    key: 'skills',
    title: 'menu.skillManagement',
    nodes: [
      {
        id: 'skill-mgr',
        title: 'menu.skillManagement',
        children: [
          { id: 'skill-list', title: 'menu.skillList', path: '/admin/skills/list' },
          { id: 'skill-detail', title: 'menu.skillDetail', path: '/admin/skills/detail' },
        ],
      },
      {
        id: 'train-task',
        title: 'menu.trainingTasks',
        children: [
          { id: 'task-list', title: 'menu.taskList', path: '/admin/skills/tasks' },
          { id: 'train-history', title: 'menu.trainingHistory', path: '/admin/skills/history' },
        ],
      },
      {
        id: 'skill-store',
        title: 'menu.skillStore',
        children: [
          { id: 'public-skills', title: 'menu.publicSkills', path: '/admin/skills/public' },
          { id: 'my-skills', title: 'menu.mySkills', path: '/admin/skills/my' },
        ],
      },
    ],
  },
  system: {
    id: 'system-root',
    key: 'system',
    title: 'menu.systemSettings',
    nodes: [
      {
        id: 'account-mgr',
        title: 'menu.accountManagement',
        children: [
          { id: 'users', title: 'menu.users', path: '/admin/system/account/users', roles: ['admin', 'ops'] },
          { id: 'roles', title: 'menu.roles', path: '/admin/system/account/roles', roles: ['admin'] },
        ],
      },
      {
        id: 'space-org',
        title: 'menu.spaceOrganization',
        children: [
          { id: 'spaces', title: 'menu.spaces', path: '/admin/system/org/spaces' },
          { id: 'orgs', title: 'menu.organizations', path: '/admin/system/org/orgs' },
        ],
      },
      {
        id: 'log-mgr',
        title: 'menu.logManagement',
        children: [
          { id: 'login-logs', title: 'menu.loginLogs', path: '/admin/system/logs/login' },
          { id: 'op-logs', title: 'menu.operationLogs', path: '/admin/system/logs/operation' },
        ],
      },
  { id: 'i18n', title: 'menu.internationalization', children: [
        { id: 'i18n-page', title: 'menu.internationalization', path: '/admin/system/i18n', roles: ['admin'] },
      ] },
      { id: 'dict', title: 'menu.dataDictionary', children: [ { id: 'dict-page', title: 'menu.dataDictionary', path: '/admin/system/dict' } ] },
      { id: 'menu-mgr', title: 'menu.menuManagement', children: [ { id: 'menu-page', title: 'menu.menuManagement', path: '/admin/system/menu', roles: ['admin'] } ] },
    ],
  },
}

// 顶部菜单：返回三个顶级节点（为兼容现有 TopMenu 的结构，nodes 为数组且仅使用第一个元素的 children）
export function getTopNodes() {
  return Object.values(topModel)
}

// 根据 top key 和用户角色返回侧边菜单条目（拍平 children）
export function getSideMenuItemsByKey(key: TopKey, roles: Role[] = []) {
  const model = topModel[key]
  if (!model) return []
  const list = (model.nodes || []).flatMap(n => n.children || [])
  return filterByRoles(list, roles)
}

// 兼容旧方法：根据路径推断 top key
export function getSideMenuItems(path: string) {
  const key: TopKey = path.includes('/skills') ? 'skills' : path.includes('/system') ? 'system' : 'project'
  return getSideMenuItemsByKey(key)
}

function filterByRoles(nodes: MenuNode[], roles: Role[]) {
  if (!roles || roles.length === 0) return nodes // 未登录或无角色时，先不做前端拦截
  return nodes.filter(n => !n.roles || n.roles.some(r => roles.includes(r)))
}
