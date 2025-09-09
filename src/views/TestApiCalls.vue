<template>
  <div class="test-api-calls">
    <h2>API调用测试</h2>
    <div class="test-section">
      <button @click="testInitialization" :disabled="loading">测试初始化</button>
      <button @click="testLanguageSwitcher" :disabled="loading">测试语言切换器</button>
      <button @click="testI18nManagement" :disabled="loading">测试国际化管理</button>
      <button @click="clearConsole">清空控制台</button>
    </div>
    
    <div class="results" v-if="results.length > 0">
      <h3>测试结果:</h3>
      <div v-for="(result, index) in results" :key="index" class="result-item">
        <strong>{{ result.test }}:</strong> {{ result.message }}
      </div>
    </div>
    
    <div class="instructions">
      <h3>使用说明:</h3>
      <p>1. 打开浏览器开发者工具的Network面板</p>
      <p>2. 过滤请求URL包含 "complete"</p>
      <p>3. 点击测试按钮，观察API调用次数</p>
      <p>4. 理想情况下，每个测试应该只产生一次API调用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18nStore } from '@/store/i18n'
import { I18nApiService } from '@/utils/i18nApi'

const i18nStore = useI18nStore()
const loading = ref(false)
const results = ref<Array<{test: string, message: string}>>([])

const addResult = (test: string, message: string) => {
  results.value.push({ test, message })
}

const clearConsole = () => {
  console.clear()
  results.value = []
  addResult('控制台', '已清空')
}

const testInitialization = async () => {
  loading.value = true
  try {
    console.log('=== 测试Store初始化 ===')
    await i18nStore.initializeI18n(true) // 强制刷新
    addResult('Store初始化', '成功')
  } catch (error) {
    console.error('Store初始化失败:', error)
    addResult('Store初始化', '失败: ' + error)
  } finally {
    loading.value = false
  }
}

const testLanguageSwitcher = async () => {
  loading.value = true
  try {
    console.log('=== 测试语言切换器逻辑 ===')
    
    // 模拟LanguageSwitcher的逻辑
    let availableLanguages = []
    if (i18nStore.languageConfig && i18nStore.languageConfig.languages) {
      availableLanguages = i18nStore.languageConfig.languages.filter(lang => lang.enabled)
      addResult('语言切换器', `成功获取${availableLanguages.length}种语言，使用Store数据`)
    } else {
      await i18nStore.initializeI18n()
      if (i18nStore.languageConfig && i18nStore.languageConfig.languages) {
        availableLanguages = i18nStore.languageConfig.languages.filter(lang => lang.enabled)
        addResult('语言切换器', `成功获取${availableLanguages.length}种语言，触发Store初始化`)
      } else {
        addResult('语言切换器', '失败：无法获取语言配置')
      }
    }
  } catch (error) {
    console.error('语言切换器测试失败:', error)
    addResult('语言切换器', '失败: ' + error)
  } finally {
    loading.value = false
  }
}

const testI18nManagement = async () => {
  loading.value = true
  try {
    console.log('=== 测试国际化管理逻辑 ===')
    
    // 模拟I18nManagement的逻辑
    let serverLanguages, serverMessages
    
    if (i18nStore.languageConfig && i18nStore.messages) {
      serverLanguages = i18nStore.languageConfig.languages
      serverMessages = i18nStore.messages
      addResult('国际化管理', `成功获取${serverLanguages.length}种语言配置，使用Store数据`)
    } else {
      await i18nStore.initializeI18n(true)
      if (i18nStore.languageConfig && i18nStore.messages) {
        serverLanguages = i18nStore.languageConfig.languages
        serverMessages = i18nStore.messages
        addResult('国际化管理', `成功获取${serverLanguages.length}种语言配置，触发Store初始化`)
      } else {
        addResult('国际化管理', '失败：无法获取数据')
      }
    }
  } catch (error) {
    console.error('国际化管理测试失败:', error)
    addResult('国际化管理', '失败: ' + error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-api-calls {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin: 20px 0;
}

.test-section button {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-section button:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

.test-section button:hover:not(:disabled) {
  background: #66b1ff;
}

.results {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.result-item {
  margin: 5px 0;
  padding: 5px;
  background: white;
  border-radius: 3px;
}

.instructions {
  margin: 20px 0;
  padding: 15px;
  background: #e6f7ff;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
}

.instructions h3 {
  margin-top: 0;
  color: #1890ff;
}

.instructions p {
  margin: 8px 0;
}
</style>