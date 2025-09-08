<template>
  <div class="i18n-version-test">
    <h2>国际化版本测试</h2>
    <div class="version-info">
      <h3>版本信息:</h3>
      <div class="version-item">
        <strong>本地版本:</strong> {{ versionInfo.local.version }} ({{ versionInfo.local.lastUpdated }})
      </div>
      <div class="version-item">
        <strong>远程版本:</strong> {{ versionInfo.remote.version }} ({{ versionInfo.remote.lastUpdated }})
      </div>
      <div class="version-item">
        <strong>当前使用版本:</strong> {{ versionInfo.current.version }} ({{ versionInfo.current.lastUpdated }})
      </div>
      <div class="version-item">
        <strong>版本比较:</strong> 
        <span v-if="compareVersions(versionInfo.local.version, versionInfo.remote.version) > 0" class="text-green">本地版本更新</span>
        <span v-else-if="compareVersions(versionInfo.local.version, versionInfo.remote.version) < 0" class="text-red">远程版本更新</span>
        <span v-else class="text-blue">版本相同</span>
      </div>
      <div class="version-item">
        <strong>数据源:</strong> 
        <span v-if="versionInfo.current.version === versionInfo.local.version" class="text-green">使用本地数据</span>
        <span v-else class="text-orange">使用远程数据</span>
      </div>
    </div>
    
    <div class="actions">
      <el-button @click="refreshData" :loading="loading">刷新数据</el-button>
      <el-button @click="forceRefresh" :loading="loading">强制从服务器刷新</el-button>
    </div>
    
    <div class="language-data">
      <h3>语言配置:</h3>
      <pre>{{ JSON.stringify(i18nStore.languageConfig, null, 2) }}</pre>
    </div>
    
    <div class="messages-data">
      <h3>消息数量:</h3>
      <div v-for="(messages, code) in i18nStore.messages" :key="code">
        <strong>{{ code }}:</strong> {{ Object.keys(messages).length }} 条消息
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18nStore } from '@/store/i18n'
import { ElButton, ElMessage } from 'element-plus'

const i18nStore = useI18nStore()
const loading = ref(false)
const versionInfo = ref({
  local: { version: 'Unknown', lastUpdated: 'Unknown' },
  remote: { version: 'Unknown', lastUpdated: 'Unknown' },
  current: { version: 'Unknown', lastUpdated: 'Unknown' },
  needsUpdate: false
})

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

async function loadVersionInfo() {
  try {
    const info = await i18nStore.getVersionInfo()
    versionInfo.value = info
  } catch (error) {
    ElMessage.error('获取版本信息失败: ' + error)
  }
}

async function refreshData() {
  loading.value = true
  try {
    await i18nStore.initializeI18n()
    await loadVersionInfo()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败: ' + error)
  } finally {
    loading.value = false
  }
}

async function forceRefresh() {
  loading.value = true
  try {
    await i18nStore.initializeI18n(true) // 强制刷新
    await loadVersionInfo()
    ElMessage.success('强制刷新成功')
  } catch (error) {
    ElMessage.error('强制刷新失败: ' + error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // 确保i18n已初始化
    if (!i18nStore.isInitialized) {
      await i18nStore.initializeI18n()
    }
    await loadVersionInfo()
  } catch (error) {
    ElMessage.error('初始化失败: ' + error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.i18n-version-test {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.version-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.version-item {
  margin: 8px 0;
  padding: 5px 0;
}

.text-green { color: #67c23a; }
.text-red { color: #f56c6c; }
.text-blue { color: #409eff; }
.text-orange { color: #e6a23c; }

.actions {
  margin: 20px 0;
}

.language-data, .messages-data {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

pre {
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
