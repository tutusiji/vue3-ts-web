<template>
  <el-menu :default-active="active" class="side-menu" @select="handleSelect">
    <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
      <i :class="item.icon" />
      <span>{{ t(item.title) }}</span>
    </el-menu-item>
  </el-menu>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSideMenuItemsByKey } from '@/router/nodes'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const active = ref(route.path)
const user = useUserStore()
user.restoreFromStorage()
// infer top key from path: /admin/project/... -> 'project'
function keyFromPath(p) {
  if (p.includes('/project')) return 'project'
  if (p.includes('/skills')) return 'skills'
  if (p.includes('/system')) return 'system'
  return 'project'
}
const menuItems = computed(() => getSideMenuItemsByKey(keyFromPath(route.path), user.roles))
function handleSelect(index) {
  router.push(index)
  active.value = index
}
</script>
<style scoped>
.side-menu {
  background: #f8f9fb;
  min-height: 100vh;
  border-right: 1px solid #eee;
}
</style>
