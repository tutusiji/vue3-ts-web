<template>
  <el-container class="admin-layout">
    <el-header>
      <TopMenu />
      <div class="header-right">
        <LanguageSwitcher />
        <span class="user-info">{{ $t('user.welcome') }}，Admin</span>
        <el-button type="text" @click="logout">{{ $t('user.logout') }}</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px">
        <SideMenu />
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import TopMenu from '@/components/TopMenu.vue'
import SideMenu from '@/components/SideMenu.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
function logout() {
  // TODO: 清理登录状态
  router.push('/login')
}
</script>
<style scoped>
.admin-layout {
  min-height: 100vh;
}
.header-right {
  float: right;
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-info {
  color: #333;
}
</style>
