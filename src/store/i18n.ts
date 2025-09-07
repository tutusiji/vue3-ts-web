import { defineStore } from 'pinia'
import { I18nApiService } from '@/utils/i18nApi'
import type { LanguageConfig } from '@/utils/i18nApi'

interface I18nState {
  locale: string
  version: string
  lastUpdated: string
  languageConfig: LanguageConfig | null
  messages: Record<string, any>
  isLoading: boolean
  isInitialized: boolean
}

interface VersionInfo {
  version: string
  lastUpdated: string
  changelog: Array<{
    version: string
    date: string
    changes: string[]
  }>
}

export const useI18nStore = defineStore('i18n', {
  state: (): I18nState => ({
    locale: localStorage.getItem('locale') || 'zh-CN',
    version: localStorage.getItem('i18n-version') || '0.0.0',
    lastUpdated: localStorage.getItem('i18n-lastUpdated') || '',
    languageConfig: null,
    messages: {},
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    availableLanguages: (state) => {
      return state.languageConfig?.languages.filter(lang => lang.enabled) || []
    },
    currentLanguage: (state) => {
      return state.languageConfig?.languages.find(lang => lang.code === state.locale)
    },
    needsUpdate: (state) => {
      const cachedVersion = localStorage.getItem('i18n-version') || '0.0.0'
      return compareVersions(state.version, cachedVersion) > 0
    }
  },

  actions: {
    // 设置语言
    setLocale(lang: string) {
      this.locale = lang
      localStorage.setItem('locale', lang)
    },

    // 检查版本更新
    async checkForUpdates(): Promise<boolean> {
      try {
        const response = await I18nApiService.checkVersion(this.version)
        if (response.needsUpdate) {
          console.log('New i18n version available:', response.serverVersion)
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to check for updates:', error)
        return false
      }
    },

    // 渐进式初始化
    async initializeI18n(forceRefresh: boolean = false): Promise<void> {
      if (this.isInitialized && !forceRefresh) {
        return
      }

      this.isLoading = true
      
      try {
        // 1. 先加载缓存的数据（如果有）
        this.loadFromCache()
        
        // 2. 检查是否需要更新
        const needsUpdate = forceRefresh || await this.checkForUpdates()
        
        if (needsUpdate) {
          // 3. 从服务器获取最新数据
          await this.loadFromServer()
        }
        
        this.isInitialized = true
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        // 如果服务器加载失败，确保至少有缓存数据可用
        this.loadFromCache()
      } finally {
        this.isLoading = false
      }
    },

    // 从缓存加载
    loadFromCache() {
      try {
        const cachedConfig = localStorage.getItem('i18n-config')
        const cachedMessages = localStorage.getItem('i18n-messages')
        const cachedVersion = localStorage.getItem('i18n-version')
        const cachedLastUpdated = localStorage.getItem('i18n-lastUpdated')
        
        if (cachedConfig && cachedMessages) {
          this.languageConfig = JSON.parse(cachedConfig)
          this.messages = JSON.parse(cachedMessages)
          this.version = cachedVersion || '0.0.0'
          this.lastUpdated = cachedLastUpdated || ''
          console.log('Loaded i18n from cache, version:', this.version)
        }
      } catch (error) {
        console.error('Failed to load from cache:', error)
      }
    },

    // 从服务器加载
    async loadFromServer() {
      try {
        // 获取聚合数据
        const enabled = await I18nApiService.getEnabledMessages()
        
        // 更新状态
        this.languageConfig = enabled.config
        this.messages = enabled.messages
        
        // 获取版本信息
        const versionInfo = await I18nApiService.getVersion()
        this.version = versionInfo.version
        this.lastUpdated = versionInfo.lastUpdated
        
        // 保存到缓存
        this.saveToCache()
        
        console.log('Loaded i18n from server, version:', this.version)
      } catch (error) {
        console.error('Failed to load from server:', error)
        throw error
      }
    },

    // 保存到缓存
    saveToCache() {
      try {
        localStorage.setItem('i18n-config', JSON.stringify(this.languageConfig))
        localStorage.setItem('i18n-messages', JSON.stringify(this.messages))
        localStorage.setItem('i18n-version', this.version)
        localStorage.setItem('i18n-lastUpdated', this.lastUpdated)
      } catch (error) {
        console.error('Failed to save to cache:', error)
      }
    },

    // 强制刷新
    async refresh() {
      await this.initializeI18n(true)
    },

    // 清除缓存
    clearCache() {
      localStorage.removeItem('i18n-config')
      localStorage.removeItem('i18n-messages')
      localStorage.removeItem('i18n-version')
      localStorage.removeItem('i18n-lastUpdated')
      this.languageConfig = null
      this.messages = {}
      this.version = '0.0.0'
      this.lastUpdated = ''
      this.isInitialized = false
    },

    // 下载所有语言文件
    async downloadAllFiles() {
      try {
        const response = await fetch(`${I18nApiService.baseURL}/download/all`)
        if (!response.ok) {
          throw new Error('Download failed')
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'i18n-files.zip'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Failed to download files:', error)
        throw error
      }
    }
  },
})

// 版本比较工具函数
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
