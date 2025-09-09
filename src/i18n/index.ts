import { createI18n } from 'vue-i18n'
import { useI18nStore } from '@/store/i18n'
import { computed } from 'vue'
import type { LanguageConfig } from '@/utils/i18nApi'

// 默认消息（用于离线或API失败时的回退）
// 语言文件现在存放在 languages/ 目录中，与配置文件分离
// 动态导入语言配置列表
import languageListData from './language-list.json'

// 动态导入语言文件
import zhCN from './languages/zh-CN.json'
import enUS from './languages/en-US.json'
import jaJP from './languages/ja-JP.json'
import thTH from './languages/th-TH.json'
import zhTW from './languages/zh-TW.json'

// 根据language-list.json动态构建语言映射
const languageModules = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'th-TH': thTH
}

// 根据配置文件构建备用消息
const fallbackMessages = languageListData.languages
  .filter(lang => lang.enabled && languageModules[lang.code])
  .reduce((acc, lang) => {
    acc[lang.code] = languageModules[lang.code]
    return acc
  }, {} as Record<string, any>)

function getLocale(): string {
  const saved = localStorage.getItem('locale')
  if (saved && Object.keys(fallbackMessages).includes(saved)) {
    return saved
  }
  
  const browserLang = navigator.language
  if (Object.keys(fallbackMessages).includes(browserLang)) {
    return browserLang
  }
  
  return languageListData.defaultLanguage || 'zh-CN' // 使用配置文件中的默认语言
}

// 创建i18n实例
// 使用泛型 any 以支持运行时动态注入的语言结构
const i18n = createI18n<any, any, any>({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'zh-CN',
  messages: fallbackMessages as any, // 初始使用本地文件
})

// 异步加载语言配置
export async function setupI18n(forceRefresh: boolean = false): Promise<void> {
  try {
    const i18nStore = useI18nStore()
    
    // 初始化Store（包含渐进式加载逻辑）
    await i18nStore.initializeI18n(forceRefresh)
    
    // 更新i18n实例
    const g: any = i18n.global as any
    
    // 如果Store中有数据，则更新i18n实例
    if (i18nStore.languageConfig && Object.keys(i18nStore.messages).length > 0) {
      // 清除旧的语言消息（除了fallback）
      const fallbackCodes = Object.keys(fallbackMessages)
      g.availableLocales.forEach((code: string) => {
        if (!fallbackCodes.includes(code)) {
          g.setLocaleMessage(code, {})
        }
      })
      
      // 设置新的语言消息
      Object.keys(i18nStore.messages).forEach(code => {
        g.setLocaleMessage(code, i18nStore.messages[code])
      })
      
      // 设置默认与回退语言
      if (i18nStore.languageConfig.defaultLanguage) {
        const savedLocale = localStorage.getItem('locale')
        if (!savedLocale || !g.getLocaleMessage(savedLocale)) {
          g.locale.value = i18nStore.languageConfig.defaultLanguage
          i18nStore.setLocale(i18nStore.languageConfig.defaultLanguage)
        }
      }
      if (i18nStore.languageConfig.fallbackLanguage) {
        g.fallbackLocale.value = i18nStore.languageConfig.fallbackLanguage
      }
      
      // 保持向后兼容
      g.languageConfig = i18nStore.languageConfig
      
      // languageConfigState是computed属性，会自动响应store的变化
      // 无需手动赋值，因为它依赖于i18nStore.languageConfig
      
      // console.log('Language configuration updated from store, version:', i18nStore.version)
    }
  } catch (error) {
    // console.error('Failed to setup i18n:', error)
    // API失败时使用本地文件，已经在初始化时设置了
  }
}

// 响应式的语言配置状态（保持向后兼容）
export const languageConfigState = computed(() => {
  const i18nStore = useI18nStore()
  return i18nStore.languageConfig
})

// 获取语言配置（供组件使用）
export function getLanguageConfig(): LanguageConfig | null {
  const i18nStore = useI18nStore()
  return i18nStore.languageConfig || (i18n.global as any).languageConfig || null
}

// 刷新语言配置
export async function refreshLanguageConfig(): Promise<void> {
  const i18nStore = useI18nStore()
  await i18nStore.refresh()
  await setupI18n(true)
}

// 动态切换语言
export async function switchLanguage(code: string): Promise<void> {
  const i18nStore = useI18nStore()
  const g: any = i18n.global as any
  
  // 检查是否已有该语言的消息
  if (!g.availableLocales.includes(code)) {
    // 如果Store中有该语言的消息，使用Store中的
    if (i18nStore.messages[code]) {
      g.setLocaleMessage(code, i18nStore.messages[code])
    } else {
      // 否则从API加载
      try {
        const { I18nApiService } = await import('@/utils/i18nApi')
        const languageData = await I18nApiService.getLanguage(code)
        g.setLocaleMessage(code, languageData.translations)
      } catch (error) {
        // console.error(`Failed to load language ${code}:`, error)
        return
      }
    }
  }
  
  // 更新语言
  g.locale.value = code
  i18nStore.setLocale(code)
}

export default i18n
