<template>
  <el-dropdown @command="changeLang" v-loading="loading">
    <span class="lang-switcher">
      <span class="globe">🌐</span>
      {{ getCurrentLanguageName() || $t('lang.current') }}
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="language in availableLanguages" 
          :key="language.code"
          :command="language.code"
          :disabled="language.code === currentLocale"
        >
          {{ language.nativeName }}
          <span v-if="language.code === currentLocale" class="current-indicator"> ✓</span>
        </el-dropdown-item>
        <el-dropdown-item divided @click="refreshLanguages">
          <el-icon><Refresh /></el-icon> 刷新语言列表
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getLanguageConfig, switchLanguage, refreshLanguageConfig, languageConfigState } from '@/i18n'
import { I18nApiService } from '@/utils/i18nApi'
import { useI18nStore } from '@/store/i18n'
import type { Language } from '@/utils/i18nApi'

const { locale } = useI18n()
const i18nStore = useI18nStore()
const loading = ref(false)
const availableLanguages = ref<Language[]>([])

const currentLocale = computed(() => locale.value)

// 获取当前语言的显示名称
const getCurrentLanguageName = () => {
  const current = availableLanguages.value.find(lang => lang.code === currentLocale.value)
  return current?.nativeName || ''
}

// 加载可用语言列表
const loadLanguages = async () => {
  try {
    loading.value = true
    
    // 使用i18n store中的数据，避免重复API调用
    if (i18nStore.languageConfig && i18nStore.languageConfig.languages) {
      // 只显示启用的语言
      availableLanguages.value = i18nStore.languageConfig.languages.filter(lang => lang.enabled)
    } else {
      // 如果store中没有数据，触发初始化
      await i18nStore.initializeI18n()
      if (i18nStore.languageConfig && i18nStore.languageConfig.languages) {
        availableLanguages.value = i18nStore.languageConfig.languages.filter(lang => lang.enabled)
      }
    }
  } catch (error) {
    console.error('Failed to load languages:', error)
    ElMessage.warning('加载语言列表失败，使用默认配置')
    
    // 使用默认语言配置
    availableLanguages.value = [
      { code: 'zh-CN', name: '简体中文', nativeName: '中文', enabled: true, file: 'zh-CN.json' },
      { code: 'zh-TW', name: '繁体中文', nativeName: '繁體中文', enabled: true, file: 'zh-TW.json' },
      { code: 'en-US', name: 'English', nativeName: 'English', enabled: true, file: 'en-US.json' },
      { code: 'ja-JP', name: '日语', nativeName: '日本語', enabled: true, file: 'ja-JP.json' },
      { code: 'th-TH', name: '泰语', nativeName: 'ไทย', enabled: true, file: 'th-TH.json' }
    ]
  } finally {
    loading.value = false
  }
}

// 切换语言
const changeLang = async (code: string) => {
  if (code === currentLocale.value) return
  
  try {
    loading.value = true
    await switchLanguage(code)
    ElMessage.success(`语言已切换为: ${getCurrentLanguageName()}`)
  } catch (error) {
    console.error('Failed to switch language:', error)
    ElMessage.error('语言切换失败')
    
    // 回退到本地切换
    locale.value = code
    localStorage.setItem('locale', code)
  } finally {
    loading.value = false
  }
}

// 刷新语言列表
const refreshLanguages = async () => {
  try {
    loading.value = true
    // 刷新全局语言配置
    await refreshLanguageConfig()
    // 重新加载本地语言列表
    await loadLanguages()
    ElMessage.success('语言列表已刷新')
  } catch (error) {
    console.error('Failed to refresh languages:', error)
    ElMessage.error('刷新语言列表失败')
  } finally {
    loading.value = false
  }
}

// 监听全局语言配置变化
watch(languageConfigState, (newConfig) => {
  if (newConfig) {
    // 当全局配置更新时，自动更新本地语言列表
    availableLanguages.value = newConfig.languages.filter(lang => lang.enabled)
  }
}, { immediate: true })

// 组件挂载时加载语言列表
onMounted(() => {
  loadLanguages()
})
</script>

<style scoped>
.lang-switcher {
  cursor: pointer;
  font-weight: 500;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
}

.globe { 
  margin-right: 6px; 
}

.current-indicator {
  color: #409eff;
  font-weight: bold;
}

:deep(.el-loading-mask) {
  border-radius: 4px;
}
</style>
