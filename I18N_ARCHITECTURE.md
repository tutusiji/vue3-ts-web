# 多语言（i18n）架构设计全解析

> 本文档系统性说明本项目的多语言体系：设计目标、整体架构、核心流程、数据模型、容错与性能策略、版本与发布机制以及未来扩展方向。

---
## 1. 设计目标
| 目标 | 说明 |
|------|------|
| 即插即用 | 前端任意页面/组件可直接使用 `$t()` 或 `useI18n()` |
| 多端一致 | 前端、管理后台、下游服务使用同一份语言数据来源 |
| 本地优先 | 首屏/离线可用，网络失败不影响基础展示 |
| 运行期动态更新 | 不重新构建即可上线新翻译与新语言 |
| 精细化版本控制 | 每次变更都有 `version` 与 `lastUpdated`，可回滚与对比 |
| 可扩展的语言包机制 | 支持批量下载、离线分发、增量更新 |
| AI 辅助提效 | 支持批量 AI 翻译、缺失项快速补齐 |
| 极致容错 | 多层 fallback，避免任何情况下出现“空白 UI”|

---
## 2. 整体架构概览
```
┌──────────────────────────────────────────┐
│                管理后台 (Admin)         │
│  - 多语言管理页  - 批量编辑/AI翻译       │
└──────────────▲──────────────────────────┘
               │REST API (JSON)
┌──────────────┴──────────────────────────┐
│             i18n 服务端 (Fastify)        │
│  - /data/complete 统一聚合输出           │
│  - /language/:code CRUD                  │
│  - /languages/update-key-batch           │
│  - /download/* 语言包 & 版本元数据       │
│  - 持久化（JSON / 可拓展 DB）            │
└──────────────▲──────────────────────────┘
               │HTTP
┌──────────────┴──────────────────────────┐
│        前端应用 (Vue3 + Pinia + i18n)    │
│  - i18n Store (本地优先初始化)           │
│  - vue-i18n runtime                     │
│  - 缓存层(localStorage)                 │
│  - 动态语言加载 & 切换                   │
│  - 版本对比 + 回退策略                  │
└──────────────────────────────────────────┘
```

---
## 3. 核心模块拆解
### 3.1 前端 i18n Store (`src/store/i18n.ts`)
职责：
- 初始化：本地缓存 → 本地动态扫描(glob)内置语言文件 → 远程合并
- 维护状态：`languageConfig`、`messages`、`version`、`lastUpdated`
- 语言切换：动态更新 `vue-i18n` 实例 & 缓存
- 版本判断：`compareVersions(remote, local)` 决定是否升级
- 容错：所有路径失败时仍构建最小可用配置（至少中文 + 英文）

关键流程（伪代码）：
```ts
async initializeI18n(forceRefresh) {
  loadFromCache()
  tryRemoteFetch()
  if (remoteNewer || forceRefresh) acceptRemote()
  else if (!hasConfig) loadLocalFiles()
  persistToCache()
  ensureInitialized()
}
```

### 3.2 `vue-i18n` 集成 (`src/i18n/index.ts`)
- 初始通过 `import.meta.glob` 动态匹配 `languages/*.json` 作为 fallback（不再硬编码 import 列表）
- 语言模块完全动态（新增语言只需增加 json + 更新语言列表）
- `languageConfigState = computed(() => store.languageConfig)` → 组件自动跟随

### 3.3 语言配置文件结构
```
/i18n/language-list.json
{
  "languages": [
    { "code": "zh-CN", "name": "简体中文", "nativeName": "中文", "enabled": true, "file": "zh-CN.json" },
    { "code": "en-US", "name": "English",   "nativeName": "English", "enabled": true, "file": "en-US.json" },
    ...
  ],
  "defaultLanguage": "zh-CN",
  "fallbackLanguage": "zh-CN"
}
```

### 3.4 服务端聚合输出 `/data/complete`
统一返回：
```json
{
  "success": true,
  "version": "1.4.2",
  "lastUpdated": "2025-09-10T08:12:11Z",
  "languages": [...],
  "messages": { "zh-CN": {...}, "en-US": {...} },
  "defaultLanguage": "zh-CN",
  "fallbackLanguage": "zh-CN"
}
```
意义：一次请求满足前端初始化需求，降低 RTT 与一致性风险。

### 3.5 AI 翻译流程
```
缺失扫描 → 构造批处理列表 → 调用 AI 提供商 → 解析归并 → 人工复核 → 提交 → 版本号+1
```
优化点：
- 统一 Prompt 模板
- 批处理合并减少调用
- 失败项重试 + 可视化标记

### 3.6 版本与缓存策略
| 版本来源 | 字段 | 用途 |
|----------|------|------|
| 服务端   | version        | 决定是否覆盖本地缓存 |
| 服务端   | lastUpdated    | 显示/诊断/日志       |
| 本地缓存 | localVersion   | 持久化对比           |

逻辑：
```ts
if (!local || remote > local || forceRefresh) use(remote)
else use(localCache || bundledFiles)
```

### 3.7 多级回退策略 (Fail-Safe Pyramid)
```
远程完整数据
  ↓ 失败
localStorage 缓存
  ↓ 失败
内置静态语言文件 (打包)
  ↓ 失败
硬编码最小配置 { zh-CN + en-US }
```
设计理念：任何节点失败不致“空白界面”。

### 3.8 语言切换流程
```
用户选择语言 → store.switchLanguage(code)
  → 校验是否已加载
      → 未加载：按需加载 / messages merge
  → 更新 vue-i18n.global.locale
  → 写入 localStorage('locale')
  → UI 响应式刷新
```

### 3.9 下载与离线包
- `/download/latest`：获取最新打包 ZIP 的 URL + 元数据（大小/版本）
- `/download/create-package`：触发重新打包（管理后台）
- `I18nApiService.downloadFile(url)`：前端触发下载
- 用途：内网/桌面端/离线环境预置语言

---
## 4. 数据模型汇总
| 名称 | 描述 |
|------|------|
| Language | 单语言元信息（code/name/nativeName/enabled/file） |
| LanguageConfig | 可用语言 + 默认/回退配置 |
| LanguageData | 单语言翻译内容 `{ code, translations }` |
| CompleteDataResponse | 初始化聚合模型 |

---
## 5. 关键设计决策说明
| 决策 | 原因 | 替代方案 | 结论 |
|------|------|----------|------|
| 聚合接口 `/data/complete` | 降低多请求耦合 | 多请求并发 | 选聚合 |
| 本地优先策略 | 首屏快/离线可用 | 纯远程 | 必需 |
| JSON 持久化 | 简单直观/易调试 | DB 初始化成本 | 可后续抽象 DAO |
| 版本字符串对比 | 易读/语义明确 | hash/时间戳 | 语义版 (SemVer-like) |
| 硬编码最小配置 | 保障可用性 | 直接失败提示 | 用户体验优先 |
| AI 批翻译 | 成本与速率平衡 | 单 key 逐条调用 | 批处理 |

---
## 6. 性能与优化点
| 场景 | 措施 |
|------|------|
| 首屏加载 | 本地缓存直出 + 懒更新远程 |
| 大语言包 | 按需拆分/延迟加载不常用语言 |
| 频繁切换 | 缓存已加载 messages；避免二次请求 |
| 多实例监听 | 使用单一 store 源 + computed 派发 |
| 管理端批量保存 | 后端批处理写入 & 版本一次提升 |

---
## 7. 异常与恢复策略
| 异常 | 处理 | 用户反馈 |
|------|------|----------|
| 网络超时 | 回退缓存 | Toast: 使用本地缓存 |
| 远程 5xx | 回退缓存或静态文件 | Toast: 服务器不可用 |
| 缓存损坏 JSON.parse 失败 | 清空缓存 → 静态文件 | 静默恢复 |
| 所有层失败 | 构造最小硬编码配置 | Toast: 使用默认语言 |
| 语言文件缺 key | 由 fallbackLanguage 补齐 | UI 自动回退 |

---
## 8. 安全与一致性
| 项 | 说明 |
|----|------|
| 写操作鉴权 | 后端应添加令牌/角色校验（可扩展） |
| 数据完整性 | 语言新增后 bundle 包重新生成；避免“悬空 code” |
| 并发编辑 | 后端可加版本号比对/乐观锁（未来） |
| 注入防护 | 所有文本仅做纯字符串渲染 |

---
## 9. 扩展规划 (Roadmap)
| 优先级 | 项目 | 描述 |
|--------|------|------|
| ★★★ | 增量更新 API | 只下发变更差异，减少流量 |
| ★★★ | 翻译缺失扫描工具 | CI 中阻断未翻译 key |
| ★★☆ | 权限分层 | 只允许特定角色修改多语言 |
| ★★☆ | WebSocket 推送 | 语言配置实时广播前端热更新 |
| ★★☆ | 语言作用域 | 支持按模块/租户隔离翻译 |
| ★☆☆ | 机器翻译记忆库 | 复用历史人工修订结果 |
| ★☆☆ | 多格式导入导出 | 支持 CSV / Excel / i18next | 

---
## 10. 典型调用流程图（初始化）
```
[App 启动]
   ↓
[i18nStore.initializeI18n()]
   ↓ (尝试读取 localStorage)
[有缓存?]──否──→[加载内置静态语言文件]
   │是
   ↓
[并发请求 /data/complete]
   ↓
[版本比较 remote > local ?]
  ├─是→ 合并 & 覆盖缓存
  └─否→ 保留本地
   ↓
[注入 vue-i18n / 设置默认语言]
   ↓
[UI 渲染]
```

---
## 11. 使用最佳实践
| 场景 | 推荐做法 |
|------|----------|
| 新增语言 | 通过管理后台添加 → 生成文件 → 提升版本 |
| 修改大量文案 | 批量导出 → 批处理 → 导入/更新 |
| 缺失项快速补齐 | 使用 AI 翻译面板 → 人工复核再提交 |
| 切换语言不刷新 | 仅用 store.switchLanguage，不强制 reload |
| 并行开发新模块 | 允许先占位 key，后期补翻译 |

---
## 12. 目录速览（相关部分）
```
src/
  i18n/
    index.ts              # vue-i18n 集成 + 动态 glob fallback
    language-list.json    # 语言配置清单（version, lastUpdated, languages[]...）
    languages/*.json      # 各语言资源（新增语言直接放入）
  store/
    i18n.ts               # 核心状态与初始化逻辑（缓存→本地glob→远程）
  utils/
    i18nApi.ts            # i18n 业务 API（聚合/单语/批量更新/下载）
    i18nField.ts          # 语言 code ↔ 字段名映射 (兼容旧列名)
    request/              # 通用请求封装
```

---
## 13. FAQ
| 问题 | 解答 |
|------|------|
| 为什么不用直接后端动态返回所有 key？ | 仍需本地首屏保障与离线能力 |
| 为什么多一层 `languageConfigState`? | 统一对外只读接口，避免组件直接耦合 store 结构 |
| 语言切换后未更新？ | 确认缓存 / 语言是否启用 / 是否存在 messages 映射 |
| 新增语言不显示？ | 确认已添加 json 文件 + language-list.json 启用 + 强制刷新管理页 |
| 删除语言仍残留列？ | 确认已调用强制刷新（管理页删除后使用 `loadLanguagesFromServer(true)`） |
| 如何监控遗漏 key？ | 可在 dev 模式增强 runtime 捕获 missing 事件 |

---
## 14. 总结
该多语言体系通过“本地优先 + 聚合接口 + 多层回退 + 版本化 + 批量 AI 翻译”实现了高可靠、高可扩展、低耦合的国际化方案，为快速迭代与全球化发布奠定基础。未来结合差量分发与实时推送，可进一步提升动态性与性能。

> 如需扩展/演进建议，可直接在本文件追加 RFC 章节或开 Issue 讨论。
