import { defineStore } from 'pinia'
import { I18nApiService } from '@/utils/i18nApi'
import type { LanguageConfig } from '@/utils/i18nApi'
// 导入本地语言配置文件
import languageListData from '@/i18n/language-list.json'

// 全局防重复初始化：缓存正在进行的初始化Promise
let currentInitPromise: Promise<void> | null = null

interface I18nState {
  locale: string
  // 当前使用的版本信息
  version: string
  lastUpdated: string
  // 本地版本信息
  localVersion: string
  localLastUpdated: string
  // 远程版本信息
  remoteVersion: string
  remoteLastUpdated: string
  languageConfig: LanguageConfig | null
  messages: Record<string, any>
  isLoading: boolean
  isInitialized: boolean
}

export const useI18nStore = defineStore('i18n', {
  state: (): I18nState => ({
    locale: localStorage.getItem('locale') || 'zh-CN',
    // 当前使用的版本信息
    version: localStorage.getItem('i18n-version') || languageListData.version,
    lastUpdated: localStorage.getItem('i18n-lastUpdated') || languageListData.lastUpdated,
    // 本地版本信息（从本地文件读取）
    localVersion: languageListData.version,
    localLastUpdated: languageListData.lastUpdated,
    // 远程版本信息
    remoteVersion: '0.0.0',
    remoteLastUpdated: '',
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

    // 渐进式初始化（本地优先，远程更新）
    async initializeI18n(forceRefresh: boolean = false): Promise<void> {
      // 已初始化且不是强制刷新，直接返回
      if (this.isInitialized && !forceRefresh) {
        return
      }

      // 如果正在初始化且不是强制刷新，复用现有Promise
      if (!forceRefresh && currentInitPromise) {
        return currentInitPromise
      }

      // 强制刷新时等待现有初始化完成
      if (forceRefresh && currentInitPromise) {
        try {
          await currentInitPromise
        } catch {
          // 忽略之前的错误，继续新的初始化
        }
      }

      this.isLoading = true
      
      // 创建新的初始化Promise
      currentInitPromise = this._doInitialize(forceRefresh)
      
      try {
        await currentInitPromise
      } finally {
        currentInitPromise = null
      }
    },

    // 实际的初始化逻辑
    async _doInitialize(forceRefresh: boolean): Promise<void> {
      try {
        // 1. 优先加载本地缓存数据
        this.loadFromCache()
        
        // 2. 异步请求远程数据
        try {
          const response = await I18nApiService.getCompleteData()
          
          // 存储远程版本信息
          this.remoteVersion = response.version
          this.remoteLastUpdated = response.lastUpdated
          
          // 3. 版本比较：决定使用哪个版本的数据
          const shouldUseRemote = !this.localVersion || 
                                this.localVersion === '0.0.0' || 
                                compareVersions(this.remoteVersion, this.localVersion) > 0 ||
                                forceRefresh
          
          if (shouldUseRemote) {
            // 使用远程数据
            this.languageConfig = {
              version: response.version,
              lastUpdated: response.lastUpdated,
              languages: response.languages,
              defaultLanguage: response.defaultLanguage,
              fallbackLanguage: response.fallbackLanguage
            }
            this.messages = response.messages
            this.version = response.version
            this.lastUpdated = response.lastUpdated
            
            // 保存到缓存（注意：不更新本地版本信息，保持本地版本独立）
            this.saveToCache()
            
            // console.log('Updated i18n from server (newer version):', this.remoteVersion, 'vs local:', this.localVersion)
          } else {
            // 使用本地数据：当本地版本 >= 远程版本时
            await this.loadLocalData()
            this.version = this.localVersion
            this.lastUpdated = this.localLastUpdated
          }
        } catch (remoteError) {
          // console.warn('Failed to fetch remote i18n data, using local cache:', remoteError)
          // 远程请求失败时，确保本地数据可用
          // 如果缓存中没有有效的语言配置，强制加载本地数据
          if (!this.languageConfig) {
            await this.loadLocalData()
            this.version = this.localVersion
            this.lastUpdated = this.localLastUpdated
          }
        }
        
        // 只有在确保有有效的languageConfig时才标记为已初始化
        if (this.languageConfig) {
          this.isInitialized = true
        }
      } catch (error) {
        // console.error('Failed to initialize i18n:', error)
        // 如果所有加载都失败，确保至少有本地数据可用
        try {
          this.loadFromCache()
          // 如果缓存也失败，强制加载本地数据作为最后的fallback
          if (!this.languageConfig) {
            await this.loadLocalData()
            this.version = this.localVersion
            this.lastUpdated = this.localLastUpdated
          }
        } catch (fallbackError) {
          // 即使本地数据加载失败，也要提供最基本的语言配置，避免组件空白
          this.languageConfig = {
            version: this.localVersion,
            lastUpdated: this.localLastUpdated,
            languages: [
              { code: 'zh-CN', name: '简体中文', nativeName: '中文', enabled: true, file: 'zh-CN.json' },
              { code: 'zh-TW', name: '繁体中文', nativeName: '繁體中文', enabled: true, file: 'zh-TW.json' },
              { code: 'en-US', name: 'English', nativeName: 'English', enabled: true, file: 'en-US.json' }
            ],
            defaultLanguage: 'zh-CN',
            fallbackLanguage: 'zh-CN'
          }
        }
        this.isInitialized = true
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
          // 设置当前使用的版本信息
          this.version = cachedVersion || languageListData.version
          this.lastUpdated = cachedLastUpdated || languageListData.lastUpdated
        }
        
        // 本地版本信息始终从本地文件读取，不依赖缓存
        this.localVersion = languageListData.version
        this.localLastUpdated = languageListData.lastUpdated
      } catch (error) {
        // Failed to load from cache - silently continue
      }
    },

    // 加载本地文件数据
    async loadLocalData() {
      // 使用 Vite 动态导入本地语言文件，依据 language-list.json 列表
      const modules = import.meta.glob('@/i18n/languages/*.json', { eager: true }) as Record<string, any>

      const messages: Record<string, any> = {}
      languageListData.languages.forEach(lang => {
        const fileName = lang.file || `${lang.code}.json`
        // 在 modules 中查找以 fileName 结尾的路径
        const entry = Object.keys(modules).find(p => p.endsWith(`/${fileName}`))
        if (entry) {
          messages[lang.code] = modules[entry].default || {}
        }
      })

      this.languageConfig = {
        version: languageListData.version,
        lastUpdated: languageListData.lastUpdated,
        languages: languageListData.languages,
        defaultLanguage: languageListData.defaultLanguage,
        fallbackLanguage: languageListData.fallbackLanguage
      }
      this.messages = messages
      this.saveToCache()
    },

    // 从服务器加载（保留兼容性，但推荐使用initializeI18n）
    async loadFromServer() {
      // 使用合并接口获取最新数据
      const response = await I18nApiService.getCompleteData(true)
      
      // 更新状态
      this.languageConfig = {
        version: response.version,
        lastUpdated: response.lastUpdated,
        languages: response.languages,
        defaultLanguage: response.defaultLanguage,
        fallbackLanguage: response.fallbackLanguage
      }
      this.messages = response.messages
      this.version = response.version
      this.lastUpdated = response.lastUpdated
      
      // 保存到缓存
      this.saveToCache()
    },

    // 保存到缓存
    saveToCache() {
      try {
        localStorage.setItem('i18n-config', JSON.stringify(this.languageConfig))
        localStorage.setItem('i18n-messages', JSON.stringify(this.messages))
        localStorage.setItem('i18n-version', this.version)
        localStorage.setItem('i18n-lastUpdated', this.lastUpdated)
        // 注意：本地版本信息不保存到localStorage，始终从文件读取
      } catch (error) {
        // Failed to save to cache - silently continue
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
      // 注意：不清除本地版本相关的localStorage项，因为它们不应该存在
      this.languageConfig = null
      this.messages = {}
      this.version = languageListData.version
      this.lastUpdated = languageListData.lastUpdated
      // 本地版本信息从文件重新读取
      this.localVersion = languageListData.version
      this.localLastUpdated = languageListData.lastUpdated
      this.remoteVersion = '0.0.0'
      this.remoteLastUpdated = ''
      this.isInitialized = false
    },

    // 下载所有语言文件
    async downloadAllFiles() {
      // 获取下载链接
      const downloadInfo = await I18nApiService.getDownloadUrl()
      
      // 使用a标签下载
      I18nApiService.downloadFile(downloadInfo.downloadUrl, downloadInfo.fileName)
    },

    // 获取版本信息（本地和远程）
    async getVersionInfo() {
      try {
        // 如果还没有远程版本信息，确保先初始化（避免重复API调用）
        if (!this.remoteVersion || this.remoteVersion === '0.0.0') {
          // 如果还没有初始化，先调用初始化方法（它会获取完整数据包括版本信息）
          if (!this.isInitialized) {
            await this.initializeI18n()
          } else {
            // 如果已经初始化但没有远程版本信息，说明可能是离线状态，使用本地版本
            this.remoteVersion = this.localVersion
            this.remoteLastUpdated = this.localLastUpdated
          }
        }
        
        return {
          local: {
            version: this.localVersion,
            lastUpdated: this.localLastUpdated
          },
          remote: {
            version: this.remoteVersion,
            lastUpdated: this.remoteLastUpdated
          },
          current: {
            version: this.version,
            lastUpdated: this.lastUpdated
          },
          needsUpdate: compareVersions(this.remoteVersion, this.localVersion) > 0
        }
      } catch (error) {
        // Failed to get version info - return fallback
        return {
          local: {
            version: this.localVersion,
            lastUpdated: this.localLastUpdated
          },
          remote: {
            version: this.remoteVersion || 'Unknown',
            lastUpdated: this.remoteLastUpdated || 'Unknown'
          },
          current: {
            version: this.version,
            lastUpdated: this.lastUpdated
          },
          needsUpdate: false
        }
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
