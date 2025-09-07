import axios from 'axios'

// API基础配置（允许通过环境变量指定）
const API_BASE_URL = (import.meta as any).env?.VITE_I18N_API_BASE
  ? `${(import.meta as any).env.VITE_I18N_API_BASE.replace(/\/$/, '')}/api/i18n`
  : 'http://localhost:3001/api/i18n'

console.log('I18n API Base URL:', API_BASE_URL)
console.log('Environment VITE_I18N_API_BASE:', (import.meta as any).env?.VITE_I18N_API_BASE)

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
    console.log('API请求:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('API响应错误:', error.response?.status, error.response?.data || error.message)
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
  changelog: Array<{
    version: string
    date: string
    changes: string[]
  }>
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
   * 获取版本信息
   */
  static async getVersion(): Promise<VersionInfo> {
    const response = await apiClient.get<ApiResponse<VersionInfo>>('/version')
    if (response.data.success && response.data.data) return response.data.data
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
   * 下载所有语言文件
   */
  static async downloadAllFiles(): Promise<Blob> {
    const response = await apiClient.get('/download/all', {
      responseType: 'blob'
    })
    return response.data
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
  ManifestInfo,
  ApiResponse 
}
