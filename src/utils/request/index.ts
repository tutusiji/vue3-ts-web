import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 通用API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 请求配置选项
export interface RequestOptions {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

// 创建axios实例的工厂函数
export function createApiClient(options: RequestOptions = {}): AxiosInstance {
  const {
    baseURL = '',
    timeout = 5000,
    headers = { 'Content-Type': 'application/json' }
  } = options

  const instance = axios.create({
    baseURL,
    timeout,
    headers,
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 可以在这里添加token等认证信息
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // 统一错误处理
      if (error.response) {
        // 服务器返回错误状态码
        // console.error('API Error:', error.response.status, error.response.data)
      } else if (error.request) {
        // 请求发出但没有收到响应
        // console.error('Network Error:', error.message)
      } else {
        // 其他错误
        // console.error('Request Error:', error.message)
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// 默认的axios实例
export const defaultApiClient = createApiClient()

// 通用请求方法封装
export class ApiClient {
  private instance: AxiosInstance

  constructor(options: RequestOptions = {}) {
    this.instance = createApiClient(options)
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config)
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config)
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config)
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config)
  }

  /**
   * 获取axios实例（用于特殊需求）
   */
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// 导出默认的API客户端实例
export const apiClient = new ApiClient()

// 便捷的静态方法
export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    defaultApiClient.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    defaultApiClient.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    defaultApiClient.put<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    defaultApiClient.delete<T>(url, config),
}
