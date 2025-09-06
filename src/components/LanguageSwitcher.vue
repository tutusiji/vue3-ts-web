<template>
  <el-dropdown @command="changeLang">
    <span class="lang-switcher"><span class="globe">🌐</span>{{ $t('lang.current') }}</span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
        <el-dropdown-item command="zh-TW">繁體中文</el-dropdown-item>
        <el-dropdown-item command="en-US">English</el-dropdown-item>
        <el-dropdown-item command="ja-JP">日本語</el-dropdown-item>
        <el-dropdown-item command="th-TH">ไทย</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
function changeLang(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>
<style scoped>
.lang-switcher {
  cursor: pointer;
  font-weight: 500;
  margin-right: 8px;
}
.globe { margin-right: 6px; }
</style>
