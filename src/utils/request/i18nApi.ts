import { ApiClient } from './index'

// I18n API 基础配置
const I18N_API_BASE_URL = (import.meta as any).env?.VITE_I18N_API_BASE
  ? `${(import.meta as any).env.VITE_I18N_API_BASE.replace(/\/$/, '')}/api/i18n`
  : 'http://localhost:3001/api/i18n'

// 创建专用的i18n API客户端
export const i18nApiClient = new ApiClient({
  baseURL: I18N_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 导出基础URL供其他地方使用
export { I18N_API_BASE_URL }
