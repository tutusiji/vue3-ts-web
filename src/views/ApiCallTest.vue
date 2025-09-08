<template>
  <div class="api-test-container">
    <h2>API调用测试</h2>
    <div class="test-section">
      <h3>测试重复调用修复</h3>
      <p>打开浏览器开发者工具的Network面板，然后点击下面的按钮测试API调用</p>
      
      <div class="button-group">
        <button @click="testInitialize" :disabled="loading">测试初始化</button>
        <button @click="testVersionInfo" :disabled="loading">测试版本信息</button>
        <button @click="clearAndTest" :disabled="loading">清除缓存并测试</button>
      </div>
      
      <div v-if="loading" class="loading">测试中...</div>
      
      <div class="results" v-if="results.length > 0">
        <h4>测试结果:</h4>
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <strong>{{ result.action }}:</strong> {{ result.message }}
          <small>{{ result.timestamp }}</small>
        </div>
      </div>
      
      <div class="instructions">
        <h4>如何验证修复:</h4>
        <ol>
          <li>打开浏览器开发者工具 (F12)</li>
          <li>切换到 Network 面板</li>
          <li>过滤请求: 输入 "data/complete" 来只显示相关请求</li>
          <li>点击上面的测试按钮</li>
          <li>检查是否只有一个 /api/i18n/data/complete 请求，而不是两个</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18nStore } from '@/store/i18n'

const i18nStore = useI18nStore()
const loading = ref(false)
const results = ref<Array<{action: string, message: string, timestamp: string}>>([])

function addResult(action: string, message: string) {
  results.value.unshift({
    action,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
}

async function testInitialize() {
  loading.value = true
  try {
    console.log('=== 开始测试初始化 ===')
    await i18nStore.initializeI18n()
    addResult('初始化测试', '成功完成')
    console.log('=== 初始化测试完成 ===')
  } catch (error) {
    addResult('初始化测试', `失败: ${error}`)
    console.error('初始化测试失败:', error)
  } finally {
    loading.value = false
  }
}

async function testVersionInfo() {
  loading.value = true
  try {
    console.log('=== 开始测试版本信息 ===')
    const versionInfo = await i18nStore.getVersionInfo()
    addResult('版本信息测试', `本地: ${versionInfo.local.version}, 远程: ${versionInfo.remote.version}`)
    console.log('=== 版本信息测试完成 ===')
  } catch (error) {
    addResult('版本信息测试', `失败: ${error}`)
    console.error('版本信息测试失败:', error)
  } finally {
    loading.value = false
  }
}

async function clearAndTest() {
  loading.value = true
  try {
    console.log('=== 开始清除缓存并测试 ===')
    // 清除缓存
    i18nStore.clearCache()
    addResult('清除缓存', '缓存已清除')
    
    // 重新初始化
    await i18nStore.initializeI18n()
    addResult('重新初始化', '成功完成')
    
    // 获取版本信息
    const versionInfo = await i18nStore.getVersionInfo()
    addResult('获取版本信息', `本地: ${versionInfo.local.version}, 远程: ${versionInfo.remote.version}`)
    
    console.log('=== 清除缓存并测试完成 ===')
  } catch (error) {
    addResult('清除缓存并测试', `失败: ${error}`)
    console.error('清除缓存并测试失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  color: #007bff;
  font-weight: bold;
  margin: 10px 0;
}

.results {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  background: white;
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.result-item small {
  display: block;
  color: #666;
  margin-top: 5px;
}

.instructions {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.instructions ol {
  margin: 10px 0;
  padding-left: 20px;
}

.instructions li {
  margin: 5px 0;
}
</style>