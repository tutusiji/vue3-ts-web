# 国际化文件目录结构说明

## 目录结构

```
src/i18n/
├── index.ts                    # 国际化配置文件（不会被下载替换）
├── languages/                  # 从后端下载的语言文件目录
│   ├── zh-CN.json             # 简体中文
│   ├── en-US.json             # 英文
│   ├── ja-JP.json             # 日文
│   ├── th-TH.json             # 泰文
│   ├── zh-TW.json             # 繁体中文
│   ├── language-list.json     # 语言列表配置
│   └── version.json           # 版本信息
├── README.md                   # 本说明文件
└── extract-downloaded-files.bat # 自动解压脚本
```

## 设计原理

### 为什么要分离目录？

1. **避免配置文件被覆盖**：`index.ts` 包含重要的国际化配置逻辑，不应该被下载的语言包替换
2. **便于整体替换**：`languages/` 目录可以安全地整体替换，不会影响其他配置文件
3. **清晰的职责分离**：配置逻辑与数据文件完全分离
4. **动态语言加载**：`index.ts` 会自动读取 `language-list.json` 中的配置，无需手动维护语言列表

### 下载和更新流程

1. **自动下载**：通过前端界面点击下载按钮，系统会自动下载最新的语言包
2. **手动替换**：下载的ZIP文件包含以下结构：
   ```
   i18n-files.zip
   ├── version.json
   ├── language-list.json
   └── languages/
       ├── zh-CN.json
       ├── en-US.json
       └── ...
   ```
3. **解压说明**：
   - 将 `version.json` 和 `language-list.json` 解压到 `src/i18n/languages/` 目录
   - 将 `languages/` 目录下的所有 `.json` 文件解压到 `src/i18n/languages/` 目录

## 使用方法

### 开发时

- 直接修改 `languages/` 目录下的语言文件进行本地测试
- 修改 `index.ts` 来调整i18n配置逻辑

### 生产环境更新

1. 在后端管理界面更新语言文件
2. 在前端点击下载按钮获取最新语言包
3. 解压并替换 `languages/` 目录下的文件：
   
   **方法一：使用自动化脚本（推荐）**
   ```bash
   # 在 src/i18n 目录下运行
   extract-downloaded-files.bat "下载的ZIP文件路径"
   ```
   
   **方法二：手动解压**
   - 将 `version.json` 和 `language-list.json` 解压到 `src/i18n/languages/` 目录
   - 将 `languages/` 目录下的所有 `.json` 文件解压到 `src/i18n/languages/` 目录

4. 重新构建前端项目

## 注意事项

- **不要直接修改** `languages/` 目录下的文件作为永久更改，因为这些文件会被下载替换
- **永久性修改** 应该在后端管理界面进行
- **配置逻辑修改** 应该在 `index.ts` 文件中进行
- **版本控制** 时可以选择忽略 `languages/` 目录，或者只提交稳定版本的文件