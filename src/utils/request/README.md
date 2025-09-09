# Request封装重构说明

## 重构目标
将axios封装和公共接口请求方法从业务API文件中抽离出来，创建统一的request封装，便于复用。

## 文件结构

```
src/utils/request/
├── index.ts           # 通用request封装
├── i18nApi.ts        # i18n专用API客户端配置
└── README.md         # 本文档
```

## 核心文件说明

### 1. `/request/index.ts` - 通用request封装
- **ApiResponse接口**: 统一的API响应格式
- **createApiClient函数**: axios实例工厂函数
- **ApiClient类**: 封装了GET/POST/PUT/DELETE方法的API客户端
- **defaultApiClient**: 默认的axios实例
- **request对象**: 便捷的静态方法

### 2. `/request/i18nApi.ts` - i18n专用配置
- 基于通用封装创建的i18n专用API客户端
- 配置了i18n API的baseURL和超时设置
- 导出`i18nApiClient`和`I18N_API_BASE_URL`

### 3. `/i18nApi.ts` - 业务API服务
- 重构后只包含业务逻辑
- 使用`i18nApiClient`进行HTTP请求
- 保持原有的API接口不变

## 使用方式

### 方式1：创建专用API客户端（推荐）
```typescript
import { ApiClient, type ApiResponse } from '@/utils/request'

// 创建用户API客户端
const userApiClient = new ApiClient({
  baseURL: 'http://localhost:3000/api/user',
  timeout: 10000,
})

export class UserApiService {
  static async getUsers(): Promise<User[]> {
    const response = await userApiClient.get<ApiResponse<User[]>>('/list')
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Failed to fetch users')
  }
}
```

### 方式2：使用全局request方法（适合简单场景）
```typescript
import { request, type ApiResponse } from '@/utils/request'

export const authApi = {
  login: (credentials: LoginData) =>
    request.post<ApiResponse<LoginResult>>('/api/auth/login', credentials),
  
  logout: () =>
    request.post<ApiResponse>('/api/auth/logout'),
}
```

## 优势

1. **统一性**: 所有API请求使用统一的封装和错误处理
2. **可复用**: 其他模块可以轻松创建自己的API客户端
3. **可维护**: 请求拦截器、响应拦截器集中管理
4. **可扩展**: 支持不同baseURL、timeout等配置
5. **类型安全**: 完整的TypeScript支持

## 兼容性

- 保持原有i18nApi的所有接口不变
- 现有代码无需修改，可以正常使用
- 新增的request封装为增量改进

## 示例项目

参考 `src/utils/exampleApi.ts` 查看完整的使用示例。
