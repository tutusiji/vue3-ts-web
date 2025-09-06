<template>
  <el-menu mode="horizontal" :default-active="active" class="top-menu" @select="handleSelect">
    <el-sub-menu v-for="top in topMenus" :key="top.id" :index="top.key">
      <template #title>{{ t(top.title) }}</template>
      <el-menu-item v-for="item in top.children" :key="item.path" :index="item.path">{{ t(item.title) }}</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getTopNodes } from '@/router/nodes'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter()
const user = useUserStore()
user.restoreFromStorage()
const active = ref('')
const topMenus = computed(() => {
  const tops = getTopNodes()
  return tops.map((tn) => {
    const children = []
    if (tn.nodes && tn.nodes.length) {
      const first = tn.nodes[0]
      if (first.children && first.children.length) {
        for (const c of first.children) {
          children.push({ title: c.title, path: c.path })
        }
      } else if (first.path) {
        children.push({ title: first.title, path: first.path })
      }
    }
    return { id: tn.id, title: tn.title, key: tn.key, children }
  })
})
function handleSelect(index) {
  router.push(index)
  active.value = index
}
</script>
<style scoped>
.top-menu {
  background: #fff;
  border-bottom: 1px solid #eee;
  font-size: 16px;
}
</style>
