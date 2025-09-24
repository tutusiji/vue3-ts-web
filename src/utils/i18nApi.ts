import { i18nApiClient, I18N_API_BASE_URL } from './request/i18nApi'
import type { ApiResponse } from './request'

// 核心接口类型
export interface Language {
  code: string
  name: string
  nativeName: string
  enabled: boolean
  file: string
}

export interface LanguageConfig {
  languages: Language[]
  defaultLanguage: string
  fallbackLanguage: string
}

export interface LanguageData {
  code: string
  translations: Record<string, any>
}

export interface CompleteDataResponse {
  success: boolean
  version: string
  lastUpdated: string
  languages: Language[]
  messages: Record<string, Record<string, any>>
  defaultLanguage: string
  fallbackLanguage: string
}

// API服务类
export class I18nApiService {
  static baseURL = I18N_API_BASE_URL

  /**
   * 获取指定语言的翻译文件
   */
  static async getLanguage(code: string): Promise<LanguageData> {
    const response = await i18nApiClient.get<ApiResponse<LanguageData>>(`/language/${code}`)
    if (response.data.success && response.data.data) return response.data.data
    throw new Error(response.data.error || `Failed to fetch language: ${code}`)
  }

  /**
   * 更新指定语言的翻译文件
   */
  static async updateLanguage(code: string, translations: Record<string, any>): Promise<LanguageData> {
    const response = await i18nApiClient.post<ApiResponse<LanguageData>>(`/language/${code}/update`, { translations })
    if (response.data.success && response.data.data) return response.data.data
    throw new Error(response.data.error || `Failed to update language: ${code}`)
  }

  /**
   * 创建新的多语言key
   */
  static async createKey(key: string, translations: Record<string, string>): Promise<void> {
    const response = await i18nApiClient.post<ApiResponse>('/languages/create-key', { key, translations })
    if (!response.data.success) throw new Error(response.data.error || `Failed to create key: ${key}`)
  }

  /**
   * 更新现有key的翻译内容
   */
  static async updateKey(key: string, translations: Record<string, string>): Promise<void> {
    const response = await i18nApiClient.put<ApiResponse>('/languages/update-key', { key, translations })
    if (!response.data.success) throw new Error(response.data.error || `Failed to update key: ${key}`)
  }

  /**
   * 重命名一个已有 key：后端会在所有语言与模板中迁移 oldKey -> newKey
   * overwrite=true 时若新 key 已存在会覆盖其值
   */
  static async renameKey(oldKey: string, newKey: string, overwrite = false): Promise<{ oldKey: string; newKey: string }> {
    const response = await i18nApiClient.post<ApiResponse<{ oldKey: string; newKey: string }>>('/languages/rename-key', { oldKey, newKey, overwrite })
    if (response.data.success && response.data.data) return response.data.data
    throw new Error(response.data.error || 'Failed to rename key')
  }

  /** 删除一个 key（所有语言与模板） */
  static async deleteKey(key: string): Promise<void> {
    const response = await i18nApiClient.post<ApiResponse<{ key: string }>>('/languages/delete-key', { key })
    if (!response.data.success) throw new Error(response.data.error || 'Failed to delete key')
  }

  /**
   * 添加新的语言
   */
  static async addLanguage(
    code: string,
    name: string,
    nativeName: string,
    enabled = true,
    overwrite = false
  ): Promise<Language> {
    const response = await i18nApiClient.post<ApiResponse<Language>>('/language', { code, name, nativeName, enabled, overwrite })
    if (response.data.success && response.data.data) return response.data.data
    throw new Error(response.data.error || `Failed to add language: ${code}`)
  }

  /**
   * 删除语言
   */
  static async deleteLanguage(code: string): Promise<void> {
    const response = await i18nApiClient.post<ApiResponse>(`/language/${code}/delete`)
    if (!response.data.success) throw new Error(response.data.error || `Failed to delete language: ${code}`)
  }

  /**
   * 获取下载链接（最新版本语言包）
   */
  static async getDownloadUrl(): Promise<{ downloadUrl: string; fileName: string; fileSize: number; version: string }> {
    const response = await i18nApiClient.get<ApiResponse<{ downloadUrl: string; fileName: string; fileSize: number; version: string; lastUpdated: string }>>('/download/latest')
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to get download URL')
  }

  /**
   * 手动创建语言包
   */
  static async createLanguagePackage(): Promise<{ fileName: string; version: string; fileSize: number; downloadUrl: string }> {
    const response = await i18nApiClient.post<ApiResponse<{ fileName: string; version: string; fileSize: number; downloadUrl: string }>>('/download/create-package')
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to create language package')
  }

  /**
   * 下载文件（使用a标签方式）
   */
  static downloadFile(url: string, fileName: string = 'i18n-files.zip'): void {
    const link = document.createElement('a')
    // 如果是相对URL，使用API基础URL来拼接
    let fullUrl = url
    if (!url.startsWith('http')) {
      // 使用API基础URL（包含正确的端口3400）而不是当前页面的origin
      const apiBaseUrl = I18N_API_BASE_URL.replace('/api/i18n', '')
      fullUrl = `${apiBaseUrl}${url}`
    }
    link.href = fullUrl
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 获取完整的i18n数据（核心方法）
   */
  static async getCompleteData(includeDisabled: boolean = false): Promise<CompleteDataResponse> {
    // 只有当includeDisabled为true时才添加参数，避免发送不必要的false参数
    const response = await i18nApiClient.get('/data/complete', 
      includeDisabled ? { params: { includeDisabled: true } } : {}
    )
    if (response.data.success) {
      return response.data
    }
    throw new Error(response.data.error || 'Failed to fetch complete data')
  }
}

// 导出类型
export type { ApiResponse }
