<template>
  <div class="version-test">
    <h2>版本信息测试</h2>
    
    <div class="version-info">
      <h3>版本对比显示</h3>
      <div class="version-tags">
        <el-tag type="info" size="large">
          本地版本: {{ i18nStore.localVersion }}
        </el-tag>
        <el-tag type="warning" size="large" style="margin-left: 8px;">
          远程版本: {{ i18nStore.remoteVersion }}
        </el-tag>
        <el-tag type="primary" size="large" style="margin-left: 8px;">
          当前使用: {{ i18nStore.version }}
        </el-tag>
      </div>
      
      <div class="version-details" style="margin-top: 16px;">
        <div class="info-item">
          <strong>本地版本:</strong> {{ i18nStore.localVersion }}
          <span class="time">({{ formatDate(i18nStore.localLastUpdated) }})</span>
        </div>
        <div class="info-item">
          <strong>远程版本:</strong> {{ i18nStore.remoteVersion }}
          <span class="time">({{ formatDate(i18nStore.remoteLastUpdated) }})</span>
        </div>
        <div class="info-item">
          <strong>当前使用:</strong> {{ i18nStore.version }}
          <span class="time">({{ formatDate(i18nStore.lastUpdated) }})</span>
        </div>
        <div class="info-item">
          <strong>版本比较:</strong> 
          <template v-if="versionCompare > 0">
            远程版本更新，应使用远程数据
          </template>
          <template v-else-if="versionCompare < 0">
            本地版本更新，应使用本地数据
          </template>
          <template v-else>
            版本相同
          </template>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="refreshData" :disabled="loading">刷新数据</button>
      <button @click="clearCache" :disabled="loading">清除缓存</button>
    </div>
    
    <div class="debug-info">
      <h3>调试信息</h3>
      <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElTag } from 'element-plus'
import { useI18nStore } from '@/store/i18n'
import languageListData from '@/i18n/language-list.json'

const i18nStore = useI18nStore()
const loading = ref(false)

const debugInfo = computed(() => ({
  storeInitialized: i18nStore.isInitialized,
  localFileVersion: languageListData.version,
  localFileLastUpdated: languageListData.lastUpdated,
  storeVersion: i18nStore.version,
  storeLocalVersion: i18nStore.localVersion,
  storeRemoteVersion: i18nStore.remoteVersion,
  hasLanguageConfig: !!i18nStore.languageConfig,
  hasMessages: !!i18nStore.messages
}))

// 版本比较函数
function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number)
  const v2parts = version2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0
    const v2part = v2parts[i] || 0
    
    if (v1part > v2part) return 1
    if (v1part < v2part) return -1
  }
  
  return 0
}

// 版本比较结果
const versionCompare = computed(() => {
  if (!i18nStore.remoteVersion || !i18nStore.localVersion) return 0
  return compareVersions(i18nStore.remoteVersion, i18nStore.localVersion)
})

// 格式化日期
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await i18nStore.refresh()
    console.log('数据已刷新')
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    loading.value = false
  }
}

const clearCache = async () => {
  loading.value = true
  try {
    await i18nStore.clearCache()
    console.log('缓存已清除')
  } catch (error) {
    console.error('清除缓存失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!i18nStore.isInitialized) {
    await i18nStore.initializeI18n()
  }
})
</script>

<style scoped>
.version-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.version-info {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  margin: 8px 0;
  padding: 8px;
  background: white;
  border-radius: 3px;
}

.actions {
  margin: 20px 0;
}

.actions button {
  margin-right: 10px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

.actions button:hover:not(:disabled) {
  background: #66b1ff;
}

.debug-info {
  margin: 20px 0;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 4px;
}

.debug-info pre {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}
</style>