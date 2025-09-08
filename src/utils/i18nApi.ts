import axios from 'axios'

// API基础配置（允许通过环境变量指定）
const API_BASE_URL = (import.meta as any).env?.VITE_I18N_API_BASE
  ? `${(import.meta as any).env.VITE_I18N_API_BASE.replace(/\/$/, '')}/api/i18n`
  : 'http://localhost:3001/api/i18n'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应接口类型定义
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 语言包信息接口
export interface LanguagePackageInfo {
  version: string
  fileName: string
  createdAt: string
  url?: string
}

interface Language {
  code: string
  name: string
  nativeName: string
  enabled: boolean
  file: string
}

interface LanguageConfig {
  languages: Language[]
  defaultLanguage: string
  fallbackLanguage: string
}

interface LanguageData {
  code: string
  translations: Record<string, any>
}

interface BatchLanguageResponse {
  [code: string]: Record<string, any>
}

interface EnabledMessagesResponse {
  config: LanguageConfig
  messages: BatchLanguageResponse
}

interface VersionInfo {
  version: string
  lastUpdated: string
}

interface VersionCheckResponse {
  needsUpdate: boolean
  clientVersion: string
  serverVersion: string
  lastUpdated: string
  changelog?: Array<{
    version: string
    date: string
    changes: string[]
  }>
}

interface CompleteDataResponse {
  success: boolean
  version: string
  lastUpdated: string
  languages: Language[]
  messages: BatchLanguageResponse
  defaultLanguage: string
  fallbackLanguage: string
}

interface ManifestInfo {
  version: string
  lastUpdated: string
  files: Record<string, {
    version: string
    lastModified: string
  }>
}

// API服务类
export class I18nApiService {
  static baseURL = API_BASE_URL
  /**
   * 获取支持的语言列表
   */
  static async getLanguages(): Promise<LanguageConfig> {
  const response = await apiClient.get<ApiResponse<LanguageConfig>>('/languages')
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || 'Failed to fetch languages')
  }

  /**
   * 获取指定语言的翻译文件
   */
  static async getLanguage(code: string): Promise<LanguageData> {
  const response = await apiClient.get<ApiResponse<LanguageData>>(`/language/${code}`)
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || `Failed to fetch language: ${code}`)
  }

  /**
   * 批量获取多个语言文件
   */
  static async getBatchLanguages(codes: string[]): Promise<BatchLanguageResponse> {
  const response = await apiClient.post<ApiResponse<BatchLanguageResponse>>('/languages/batch', { codes })
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || 'Failed to fetch batch languages')
  }

  /**
   * 一次性获取语言配置 + 已启用语言全部消息
   */
  static async getEnabledMessages(includeDisabled = false): Promise<EnabledMessagesResponse> {
  const response = await apiClient.get<ApiResponse<EnabledMessagesResponse>>(`/languages/enabled-messages`, { params: { includeDisabled } })
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || 'Failed to fetch enabled messages')
  }

  /**
   * 更新语言列表配置
   */
  static async updateLanguages(config: LanguageConfig): Promise<LanguageConfig> {
  const response = await apiClient.post<ApiResponse<LanguageConfig>>('/languages/update', config)
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || 'Failed to update languages')
  }

  /**
   * 更新指定语言的翻译文件
   */
  static async updateLanguage(code: string, translations: Record<string, any>): Promise<LanguageData> {
  const response = await apiClient.post<ApiResponse<LanguageData>>(`/language/${code}/update`, { translations })
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || `Failed to update language: ${code}`)
  }

  /**
   * 更新指定语言文件中的单个key
   */
  static async updateLanguageKey(code: string, key: string, value: string): Promise<void> {
  const response = await apiClient.post<ApiResponse>(`/language/${code}/update-key`, { key, value })
  if (!response.data.success) throw new Error(response.data.error || `Failed to update key ${key} in language: ${code}`)
  }

  /**
   * 批量更新多个语言的指定key
   */
  static async updateLanguageKeyBatch(key: string, translations: Record<string, string>): Promise<void> {
    const response = await apiClient.post<ApiResponse>('/languages/update-key-batch', { key, translations })
    if (!response.data.success) throw new Error(response.data.error || `Failed to batch update key: ${key}`)
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
  const response = await apiClient.post<ApiResponse<Language>>('/language', { code, name, nativeName, enabled, overwrite })
  if (response.data.success && response.data.data) return response.data.data
  throw new Error(response.data.error || `Failed to add language: ${code}`)
  }

  /**
   * 删除语言
   */
  static async deleteLanguage(code: string): Promise<void> {
  const response = await apiClient.post<ApiResponse>(`/language/${code}/delete`)
  if (!response.data.success) throw new Error(response.data.error || `Failed to delete language: ${code}`)
  }

  /**
   * 获取版本信息（从完整数据接口获取）
   */
  static async getVersion(): Promise<VersionInfo> {
    // 不传递includeDisabled参数，避免不必要的请求
    const response = await apiClient.get('/data/complete')
    if (response.data.success) {
      return {
        version: response.data.version,
        lastUpdated: response.data.lastUpdated
      }
    }
    throw new Error(response.data.error || 'Failed to fetch version info')
  }

  /**
   * 检查版本更新
   */
  static async checkVersion(clientVersion: string): Promise<VersionCheckResponse> {
    const response = await apiClient.post<ApiResponse<VersionCheckResponse>>('/version/check', { clientVersion })
    if (response.data.success && response.data.data) return response.data.data
    throw new Error(response.data.error || 'Failed to check version')
  }

  /**
   * 获取文件清单
   */
  static async getManifest(): Promise<ManifestInfo> {
    const response = await apiClient.get<ApiResponse<ManifestInfo>>('/manifest')
    if (response.data.success && response.data.data) return response.data.data
    throw new Error(response.data.error || 'Failed to fetch manifest')
  }

  /**
   * 获取下载链接（最新版本语言包）
   */
  static async getDownloadUrl(): Promise<{ downloadUrl: string; fileName: string; fileSize: number; version: string }> {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string; fileName: string; fileSize: number; version: string; lastUpdated: string }>>('/download/latest')
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to get download URL')
  }

  /**
   * 获取临时下载链接（兼容旧接口）
   */
  static async getTempDownloadUrl(): Promise<{ downloadUrl: string; fileName: string; fileSize: number }> {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string; fileName: string; fileSize: number }>>('/download/all')
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to get download URL')
  }

  /**
   * 手动创建语言包
   */
  static async createLanguagePackage(): Promise<{ fileName: string; version: string; fileSize: number; downloadUrl: string }> {
    const response = await apiClient.post<ApiResponse<{ fileName: string; version: string; fileSize: number; downloadUrl: string }>>('/download/create-package')
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
      // 使用API基础URL（包含正确的端口3001）而不是当前页面的origin
      const apiBaseUrl = API_BASE_URL.replace('/api/i18n', '')
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
   * 获取完整的i18n数据（合并接口）
   */
  static async getCompleteData(includeDisabled: boolean = false): Promise<CompleteDataResponse> {
    // 只有当includeDisabled为true时才添加参数，避免发送不必要的false参数
    const response = await apiClient.get('/data/complete', 
      includeDisabled ? { params: { includeDisabled: true } } : {}
    )
    if (response.data.success) {
      return response.data
    }
    throw new Error(response.data.error || 'Failed to fetch complete data')
  }
}

// 导出类型
export type { 
  Language, 
  LanguageConfig, 
  LanguageData, 
  BatchLanguageResponse, 
  EnabledMessagesResponse, 
  VersionInfo,
  VersionCheckResponse,
  CompleteDataResponse,
  ManifestInfo,
  ApiResponse 
}
