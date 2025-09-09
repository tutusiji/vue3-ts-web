import { ApiClient, request, type ApiResponse } from './request'

// 示例：用户相关API
export interface User {
  id: string
  username: string
  email: string
}

export interface UserListResponse {
  users: User[]
  total: number
}

// 方式1：创建专用的API客户端
const userApiClient = new ApiClient({
  baseURL: 'http://localhost:3000/api/user',
  timeout: 10000,
})

export class UserApiService {
  /**
   * 获取用户列表
   */
  static async getUsers(page = 1, limit = 10): Promise<UserListResponse> {
    const response = await userApiClient.get<ApiResponse<UserListResponse>>('/list', {
      params: { page, limit }
    })
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to fetch users')
  }

  /**
   * 获取单个用户
   */
  static async getUser(id: string): Promise<User> {
    const response = await userApiClient.get<ApiResponse<User>>(`/${id}`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || `Failed to fetch user: ${id}`)
  }

  /**
   * 创建用户
   */
  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await userApiClient.post<ApiResponse<User>>('/', userData)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to create user')
  }
}

// 方式2：直接使用全局request方法（适合简单场景）
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    request.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', credentials),
  
  logout: () =>
    request.post<ApiResponse>('/api/auth/logout'),
  
  refreshToken: () =>
    request.post<ApiResponse<{ token: string }>>('/api/auth/refresh'),
}
