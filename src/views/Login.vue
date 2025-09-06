<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ t('login.title') }}</h2>
      <el-form :model="form" @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="form.username" :placeholder="t('login.username')" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" :placeholder="t('login.password')" />
        </el-form-item>
        <el-form-item>
          <LanguageSwitcher />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onLogin">{{ t('login.submit') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
const { t } = useI18n()
const router = useRouter()
const user = useUserStore()
// 预填默认账号密码
const form = ref({ username: 'admin789', password: 'admin789' })
function onLogin() {
  if (form.value.username && form.value.password) {
    // 简单模拟登录：写入 token 与角色
    user.login(form.value.username, 'dev-token-123', ['admin'])
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } else {
    ElMessage.error('请输入账号和密码')
  }
}
</script>
<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%);
}
.login-box {
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
  min-width: 320px;
}
</style>
