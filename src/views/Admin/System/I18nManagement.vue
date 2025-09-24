<template>
  <div class="i18n-page">
    <div class="title-row">
      <h2>{{ $t('menu.internationalization') }}</h2>
      
      <div class="actions">
        <el-select v-model="selectedType" placeholder="类型" style="width: 180px" @change="onTypeChange">
          <el-option label="全部" value="all" />
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button @click="openLangManager" plain>管理语言</el-button>
        <el-button type="success" @click="downloadAllFiles" :loading="downloading">
          <el-icon><Download /></el-icon>
          {{ $t('i18n.downloadAll') || '下载语言包' }}
        </el-button>
        <el-button type="warning" @click="createLanguagePackage" :loading="creating" plain>
          <el-icon><Loading /></el-icon>
          {{ creating ? '创建中...' : '重新打包' }}
        </el-button>
        <el-button type="primary" @click="openAddDialog">{{ $t('i18n.add') }}</el-button>
      </div>
    </div>
    <div class="version-info" v-if="versionInfo">
        <el-tag type="info" size="small">
          本地版本: {{ versionInfo.local.version }}
        </el-tag>
        <el-tag type="success" size="small" style="margin-left: 8px;">
          远程版本: {{ versionInfo.remote.version }}
        </el-tag>
        <el-tag type="primary" size="small" style="margin-left: 8px;">
          当前使用: {{ versionInfo.current.version }}
        </el-tag>
        <el-tag type="success" size="small" style="margin-left: 8px;">
          更新时间: {{ formatDate(versionInfo.current.lastUpdated) }}
        </el-tag>
      </div>
    <el-table :data="paged" style="width:100%">
      <el-table-column label="Key" width="260">
        <template #default="scope">
          <span>{{ scope.row.key }}</span>
          <el-button 
            type="text" 
            size="small" 
            @click="copyToClipboard(scope.row.key)"
            style="margin-left: 8px; padding: 0;"
            title="复制Key"
          >
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-for="lang in languages"
        :key="lang.field"
        :prop="lang.field"
        :label="lang.name"
      />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editItem(scope.row)">{{ $t('i18n.edit') }}</el-button>
          <el-button size="small" type="danger" @click="deleteItem(scope.row)">{{ $t('i18n.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        background
        layout="sizes, prev, pager, next, jumper"
        :page-sizes="[10,20,50,100]"
        :page-size="pageSize"
        :total="filtered.length"
        @current-change="onPage"
        @size-change="onSize"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px">
      <el-form :model="form" label-width="120px" label-position="left" class="compact-form">
        <el-form-item label="Key"><el-input v-model="form.key" style="max-width:360px" /></el-form-item>
        <template v-for="lang in languages" :key="'form-'+lang.field">
          <el-form-item :label="lang.name">
            <el-input v-model="form[lang.field]" style="max-width:360px" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">{{ $t('i18n.cancel') }}</el-button>
        <el-button 
          @click="aiFill" 
          :loading="aiLoading" 
          :disabled="!canUseAI"
          plain
          :title="canUseAI ? '点击使用AI翻译' : '请先填写Key和中文内容'"
        >
          一键AI生成
        </el-button>
        <el-button type="primary" @click="saveItem">{{ $t('i18n.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 语言管理弹窗 -->
    <el-dialog v-model="langDialogVisible" title="语言管理" width="900px">
      <div class="lang-actions">
        <el-button type="primary" @click="openLangEdit()">新增语言</el-button>
      </div>
      <el-table :data="languages" size="small" style="width:100%; margin-top:8px;">
        <el-table-column prop="name" label="名称" width="160" />
        <el-table-column prop="code" label="代码" width="160" />
        <el-table-column prop="field" label="字段" width="160" />
        <el-table-column label="内置" width="100">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.builtin ? 'info' : 'success'">{{ scope.row.builtin ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" @click="openLangEdit(scope.row, scope.$index)">编辑</el-button>
            <el-button 
              size="small" 
              type="success" 
              :disabled="scope.row.code === 'zh-CN' || translatingLanguages.has(scope.row.code)"
              :loading="translatingLanguages.has(scope.row.code)"
              @click="translateFromChinese(scope.row)"
            >
              {{ translatingLanguages.has(scope.row.code) ? '翻译中...' : 'AI翻译' }}
            </el-button>
            <el-button size="small" type="danger" :disabled="scope.row.builtin" @click="removeLang(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="langDialogVisible=false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 语言新增/编辑弹窗 -->
    <el-dialog v-model="langEditVisible" :title="langEditIndex===-1? '新增语言' : '编辑语言'" width="560px">
      <el-form :model="langForm" label-width="120px" label-position="left" class="compact-form">
        <el-form-item label="选择语言" v-if="langEditIndex===-1">
          <el-select v-model="selectedLanguageTemplate" placeholder="选择常用语言" style="width: 100%" @change="onLanguageTemplateChange" clearable>
            <el-option 
              v-for="lang in languageTemplates" 
              :key="lang.code" 
              :label="`${lang.name} (${lang.code})`" 
              :value="lang.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="langForm.name" placeholder="例如 Français" />
        </el-form-item>
        <el-form-item label="代码">
          <el-input v-model="langForm.code" placeholder="例如 fr-FR" :disabled="langForm.builtin" />
        </el-form-item>
        <el-form-item label="字段">
          <el-input v-model="langForm.field" placeholder="例如 fr" :disabled="langForm.builtin" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="langEditVisible=false">取消</el-button>
        <el-button type="primary" @click="saveLang">保存</el-button>
      </template>
    </el-dialog>

    <!-- 翻译预览弹窗 -->
    <el-dialog v-model="translationPreviewVisible" title="翻译预览" width="80%" :close-on-click-modal="false">
      <div class="translation-preview">
        <div class="preview-header">
          <h3>{{ currentTranslationLang?.name }} ({{ currentTranslationLang?.code }})</h3>
          <div class="translation-status">
            <span v-if="isTranslating" class="translating">
              <el-icon class="is-loading"><Loading /></el-icon>
              翻译中... {{ Math.round(currentTranslationProgress?.percentage || 0) }}%
            </span>
            <span v-else class="ready">准备就绪</span>
          </div>
        </div>
        
        <div class="preview-content">
          <el-scrollbar height="400px">
            <div class="json-editor">
              <pre>{{ JSON.stringify(previewTranslationData, null, 2) }}</pre>
            </div>
          </el-scrollbar>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="translationPreviewVisible = false">取消</el-button>
          <el-button 
            type="warning" 
            @click="startTranslationInPreview" 
            :loading="isTranslating"
            :disabled="isTranslating"
          >
            {{ isTranslating ? '翻译中...' : 'AI翻译' }}
          </el-button>
          <el-button 
            type="primary" 
            @click="submitTranslation"
            :disabled="isTranslating || !hasTranslationData"
          >
            提交翻译
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Loading, DocumentCopy } from '@element-plus/icons-vue'
// 语言文件现在从store中获取，不再需要直接导入
import { aiTranslate } from '@/utils/ai'
import { I18nApiService } from '@/utils/i18nApi'
import { translationService } from '@/utils/ai'
import type { TranslationProgress } from '@/utils/ai'
import { toField } from '@/utils/i18nField'
import { useI18nStore } from '@/store/i18n'

type Row = { key: string; [field: string]: any }
type LangDef = { name: string; code: string; field: string; builtin?: boolean; pack?: any }

// 从store中获取语言配置
const i18nStore = useI18nStore()

// 本地 fallback：若初始化尚未完成，使用语言列表配置的最小占位（不含硬编码写死）
const placeholderLanguages = computed(() => {
  const cfg = i18nStore.languageConfig?.languages
  if (!cfg) return [] as LangDef[]
  return cfg.map(l => ({ name: l.name, code: l.code, field: toField(l.code), builtin: true, pack: {} }))
})

const languages = ref<LangDef[]>([])
const dict = ref<Row[]>([])
const i18nList = ref<Row[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref<Row>({ key: '' })
const page = ref(1)
const pageSize = ref(20)
const aiLoading = ref(false)
const downloading = ref(false)
const creating = ref(false)

// 语言管理弹窗状态
const langDialogVisible = ref(false)
const langEditVisible = ref(false)
const langEditIndex = ref(-1)
const langForm = ref<LangDef>({ name: '', code: '', field: '' })

// 语言模板相关
const selectedLanguageTemplate = ref('')
const languageTemplates = ref([
  { name: '英语', code: 'en-US', field: 'en' },
  { name: '法语', code: 'fr-FR', field: 'fr' },
  { name: '德语', code: 'de-DE', field: 'de' },
  { name: '西班牙语', code: 'es-ES', field: 'es' },
  { name: '意大利语', code: 'it-IT', field: 'it' },
  { name: '葡萄牙语', code: 'pt-PT', field: 'pt' },
  { name: '俄语', code: 'ru-RU', field: 'ru' },
  { name: '日语', code: 'ja-JP', field: 'ja' },
  { name: '韩语', code: 'ko-KR', field: 'ko' },
  { name: '阿拉伯语', code: 'ar-SA', field: 'ar' },
  { name: '泰语', code: 'th-TH', field: 'th' },
  { name: '越南语', code: 'vi-VN', field: 'vi' },
  { name: '印地语', code: 'hi-IN', field: 'hi' },
  { name: '荷兰语', code: 'nl-NL', field: 'nl' },
  { name: '瑞典语', code: 'sv-SE', field: 'sv' },
  { name: '挪威语', code: 'no-NO', field: 'no' },
  { name: '丹麦语', code: 'da-DK', field: 'da' },
  { name: '芬兰语', code: 'fi-FI', field: 'fi' },
  { name: '波兰语', code: 'pl-PL', field: 'pl' },
  { name: '捷克语', code: 'cs-CZ', field: 'cs' },
  { name: '匈牙利语', code: 'hu-HU', field: 'hu' },
  { name: '土耳其语', code: 'tr-TR', field: 'tr' },
  { name: '希腊语', code: 'el-GR', field: 'el' },
  { name: '希伯来语', code: 'he-IL', field: 'he' },
  { name: '马来语', code: 'ms-MY', field: 'ms' },
  { name: '印尼语', code: 'id-ID', field: 'id' },
  { name: '菲律宾语', code: 'tl-PH', field: 'tl' }
])

// 版本比较工具函数
function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number)
  const v2parts = version2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0
    const v2part = v2parts[i] || 0
    
    if (v1part > v2part) return 1
    if (v1part < v2part) return -1
  }
  
  return 0
}

// 复制到剪贴板功能
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    // 如果现代API不可用，使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('已复制到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
}

// 翻译状态管理
const translatingLanguages = ref(new Set<string>())

// 翻译预览弹窗状态
const translationPreviewVisible = ref(false)
const currentTranslationLang = ref<LangDef | null>(null)
const previewTranslationData = ref<Record<string, any>>({})
const currentTranslationProgress = ref<TranslationProgress | null>(null)
const isTranslating = ref(false)
const hasTranslationData = computed(() => {
  const data = previewTranslationData.value
  return data && typeof data === 'object' && Object.keys(data).length > 0
})

// 类型（根据 key 的第一级，如 login.username -> login）
const selectedType = ref<'all' | string>('all')

// AI生成按钮是否可用
const canUseAI = computed(() => {
  // 检查key是否已填写
  if (!form.value.key || !form.value.key.trim()) {
    return false
  }
  
  // 检查是否有中文内容
  const chineseText = form.value.zh || form.value.zhCN || form.value.zh_CN || 
                      form.value['zh-CN'] || form.value.zhcn
  
  return !!(chineseText && chineseText.trim())
})

const versionInfo = ref<{
  local: { version: string; lastUpdated: string };
  remote: { version: string; lastUpdated: string };
  current: { version: string; lastUpdated: string };
} | null>(null)
const types = computed(() => {
  const set = new Set<string>()
  dict.value.forEach(r => { const p = r.key.split('.')[0]; if (p) set.add(p) })
  return Array.from(set).sort()
})

function attachPacks(list: LangDef[]) {
  // 依据 code 重新绑定内置语言的包，避免本地存储丢失 pack
  // 从 i18n store 中获取语言包数据
  const messages = i18nStore.messages
  list.forEach(l => { 
    if (messages[l.code]) {
      l.pack = messages[l.code]
    }
  })
}

function ensureFormFields() {
  languages.value.forEach(l => { if (form.value[l.field] === undefined) form.value[l.field] = '' })
}

function buildDictFromPacks() {
  const keys = new Set<string>()
  const packs = languages.value.map(l => l.pack).filter(Boolean)
  packs.forEach((pack:any) => {
    Object.keys(pack).forEach((k:string) => collect(`${k}`, (pack as any)[k]))
  })
  function collect(prefix: string, obj: any) {
    if (obj && typeof obj === 'object') {
      for (const sub of Object.keys(obj)) {
        const prop = `${prefix}.${sub}`
        if (typeof obj[sub] === 'object') collect(prop, obj[sub])
        else keys.add(prop)
      }
    }
  }
  const rows: Row[] = []
  keys.forEach(k => {
    const r: Row = { key: k }
    languages.value.forEach(l => { r[l.field] = l.pack ? getVal(l.pack, k) : '' })
    rows.push(r)
  })
  return rows
}
function getVal(obj:any, path:string) {
  return path.split('.').reduce((acc, cur) => (acc ? acc[cur] : undefined), obj) || ''
}

// 刷新所有数据 - 用于保证多用户环境下的数据一致性
async function refreshAllData() {
  try {
    // 强制从服务器重新加载语言和翻译数据
    await loadLanguagesFromServer(true)
    // 重新加载版本信息
    await loadVersionInfo()
    ElMessage.success('数据已更新')
  } catch (error) {
    ElMessage.error('刷新数据失败: ' + (error as Error).message)
  }
}

// 从服务器加载语言配置和翻译数据（避免已初始化情况下的重复请求）
async function loadLanguagesFromServer(forceRefresh: boolean = false) {
  try {
    const i18nStore = useI18nStore()

    // 仅在需要刷新或尚未初始化时才请求服务器
    if (forceRefresh || !i18nStore.isInitialized) {
      await i18nStore.initializeI18n(forceRefresh)
    }

    // 使用 store 中已有的数据
    const serverLanguages = i18nStore.languageConfig?.languages || []
    const serverMessages = i18nStore.messages || {}

    const localModulePaths = Object.keys(import.meta.glob('@/i18n/languages/*.json'))
    const convertedLanguages: LangDef[] = serverLanguages
      .filter(l => l.enabled !== false)
      .map(lang => {
        const field = toField(lang.code)
        const fileName = lang.file || `${lang.code}.json`
        const builtin = localModulePaths.some(p => p.endsWith(`/${fileName}`))
        return {
          name: lang.nativeName || lang.name,
          code: lang.code,
          field,
          builtin,
            pack: serverMessages[lang.code] || {}
        }
      })

    attachPacks(convertedLanguages)
    languages.value = convertedLanguages
    dict.value = buildDictFromPacks()
    i18nList.value = [...dict.value]
    localStorage.setItem('i18nLanguages', JSON.stringify(convertedLanguages.map(({ name, code, field, builtin }) => ({ name, code, field, builtin }))))

  } catch (error) {
    // 加载失败时使用本地/缓存数据
    ElMessage.warning('无法从服务器加载语言配置，使用本地默认配置')
    const savedLanguages = localStorage.getItem('i18nLanguages')
  languages.value = savedLanguages ? JSON.parse(savedLanguages) : placeholderLanguages.value
    attachPacks(languages.value)
    dict.value = buildDictFromPacks()
    i18nList.value = [...dict.value]
  }
}

// 获取版本信息（从store中获取，避免重复API调用）
function loadVersionInfo() {
  try {
    // 直接从store中获取版本信息
    versionInfo.value = {
      local: {
        version: i18nStore.localVersion || 'Unknown',
        lastUpdated: i18nStore.localLastUpdated || 'Unknown'
      },
      remote: {
        version: (i18nStore.remoteVersion && i18nStore.remoteVersion !== '0.0.0' && i18nStore.remoteVersion !== '') ? i18nStore.remoteVersion : 'Unknown',
        lastUpdated: (i18nStore.remoteLastUpdated && i18nStore.remoteLastUpdated !== '') ? i18nStore.remoteLastUpdated : 'Unknown'
      },
      current: {
        version: i18nStore.version || 'Unknown',
        lastUpdated: i18nStore.lastUpdated || 'Unknown'
      }
    }
    
    // 注释掉异步获取远程版本信息的逻辑，因为初始化时已经获取过了
    // if (!i18nStore.remoteVersion || i18nStore.remoteVersion === '0.0.0' || i18nStore.remoteVersion === '') {
    //   getRemoteVersionInfo()
    // }
    
  } catch (error) {
    // 获取版本信息失败 - 降级到显示未知状态
    versionInfo.value = {
      local: {
        version: 'Unknown',
        lastUpdated: 'Unknown'
      },
      remote: {
        version: 'Unknown',
        lastUpdated: 'Unknown'
      },
      current: {
        version: 'Unknown',
        lastUpdated: 'Unknown'
      }
    }
  }
}

// 异步获取远程版本信息
async function getRemoteVersionInfo() {
  try {
    const remoteVersionInfo = await i18nStore.getVersionInfo()
    
    // 更新版本信息
    versionInfo.value = {
      ...versionInfo.value,
      remote: {
        version: remoteVersionInfo.remote.version,
        lastUpdated: remoteVersionInfo.remote.lastUpdated
      }
    }
    
  } catch (error) {
    // 当获取远程版本信息失败时，设置远程版本为未知
    if (versionInfo.value) {
      versionInfo.value = {
        ...versionInfo.value,
        remote: {
          version: 'Unknown',
          lastUpdated: 'Unknown'
        }
      }
    }
  }
}

// 格式化日期
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

onMounted(async () => {
  try {
    // 只有在还未初始化时才主动初始化，避免重复请求
    if (!i18nStore.isInitialized) {
      await i18nStore.initializeI18n()
    }
  } catch (error) {
    // i18n初始化失败时的处理
    ElMessage.warning('国际化服务初始化失败，部分功能可能不可用')
  }
  
  // 获取版本信息（从store中获取，初始化后应该已经有数据了）
  loadVersionInfo()
  
  // 加载语言列表（从已初始化的store中获取数据）
  await loadLanguagesFromServer(false)
})

// 移除自动保存到localStorage的watch，因为现在数据源是服务器
// watch(languages, (val) => {
//   localStorage.setItem('i18nLanguages', JSON.stringify(val.map(({ name, code, field, builtin }) => ({ name, code, field, builtin }))))
// }, { deep: true })

const filtered = computed(() => {
  if (selectedType.value === 'all') return i18nList.value
  return i18nList.value.filter(r => r.key.startsWith(selectedType.value + '.'))
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
function onPage(p:number) { page.value = p }
function onSize(s:number) { pageSize.value = s; page.value = 1 }
function onTypeChange() { page.value = 1 }

function openAddDialog() {
  dialogTitle.value = '新增'
  form.value = { key: '' }
  ensureFormFields()
  dialogVisible.value = true
}
function editItem(row: Row) {
  dialogTitle.value = '编辑'
  // 记录原始 key 以便区分“编辑同名”与“重命名”
  form.value = { ...row, __originalKey: row.key }
  dialogVisible.value = true
}
async function saveItem() {
  const keyVal = (form.value.key || '').trim()
  if (!keyVal) return ElMessage.error('Key不能为空')

  // Key 规则：模块名.关键词(.子级...) 仅允许 a-zA-Z0-9_- 与点，至少一处点
  const KEY_PATTERN = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/
  if (!KEY_PATTERN.test(keyVal)) {
    return ElMessage.error('Key格式不合法，应为 模块.子项 或 多级，例如: user.profile.name')
  }

  // Key 规范：不允许空格结尾/开头，避免隐藏差异
  if (/\s/.test(keyVal)) {
    // 允许中间的点与字母数字下划线，若存在空白提示
    // 可根据需要放宽，这里仅简单提醒
    // 不强制失败，只是规范提示
  }

  // 重复校验：
  // 允许“编辑模式”下不改名（key 未变化）；若改名则必须确保新 key 不存在
  const originalKey = (form.value as any).__originalKey as string | undefined
  const isRename = !!originalKey && originalKey !== keyVal
  const duplicate = i18nList.value.some(r => {
    if (r.key !== keyVal) return false
    if (!originalKey) return true            // 新增场景，已有同名即重复
    if (!isRename && originalKey === keyVal) return false // 编辑但未改名
    return true // 改名且已有同名 -> 重复
  })
  if (duplicate) return ElMessage.error('Key已存在，请更换')

  // 中文字段集合（兼容旧字段命名）
  const chineseFieldCandidates = ['zh', 'zhCN', 'zh_CN', 'zh-CN', 'zhcn']
  const chineseField = languages.value.find(l => chineseFieldCandidates.includes(l.field))
  let chineseText = ''
  if (chineseField) {
    chineseText = (form.value[chineseField.field] || '').trim()
  } else {
    // 如果没有明确中文字段，放宽：不阻塞，但提示
    ElMessage.warning('未检测到中文字段，已跳过中文必填校验')
  }

  if (chineseField && !chineseText) {
    return ElMessage.error('中文翻译必填')
  }

  // 统一写回修正后的 key（去除前后空白）
  form.value.key = keyVal
  
  // 找出原始数据（重命名时用旧 key 查找）
  const originalRow = isRename
    ? i18nList.value.find(i => i.key === originalKey)
    : i18nList.value.find(i => i.key === keyVal)
  const isNewItem = !originalRow
  
  try {
    // 收集需要更新的语言翻译数据
    const translationsToUpdate: Record<string, string> = {}
    let hasChanges = false
    
    for (const lang of languages.value) {
      const fieldName = lang.field
      const newValue = form.value[fieldName] || ''
      const oldValue = originalRow?.[fieldName] || ''
      
      // 只有当值发生变化时才加入更新列表
      if (isNewItem || newValue !== oldValue) {
        translationsToUpdate[lang.code] = newValue
        hasChanges = true
      }
    }
    
    if (isRename) {
      // 先调用后端重命名，再补写变化覆盖（防止覆盖顺序问题）
      await I18nApiService.renameKey(originalKey!, keyVal)
      if (hasChanges) {
        await I18nApiService.updateKey(keyVal, translationsToUpdate)
      }
    } else if (hasChanges) {
      if (isNewItem) {
        // 新增key - 使用create接口，包含重复检查
        await I18nApiService.createKey(keyVal, translationsToUpdate)
      } else {
        // 编辑现有key - 使用update接口，不检查重复
        await I18nApiService.updateKey(keyVal, translationsToUpdate)
      }
    }
    
    dialogVisible.value = false
    
    // 重新加载完整数据以保证一致性
    await refreshAllData()
    
    ElMessage.success('保存成功')
  } catch (error: any) {
    // 处理409冲突错误（key已存在）
    if (error.response && error.response.status === 409) {
      ElMessage.error('该Key已存在，请使用不同的Key名称')
    } else {
      ElMessage.error('保存失败: ' + (error.response?.data?.error || error.message || '未知错误'))
    }
    
    // 如果保存失败，重新加载数据以保证状态一致性
    await refreshAllData()
  }
}
function deleteItem(row: Row) {
  ElMessageBox.confirm(`确定删除Key「${row.key}」吗？`, '提示', { type: 'warning' })
    .then(async () => {
      try {
        await I18nApiService.deleteKey(row.key)
        // 重新加载完整数据以保证一致性
        await refreshAllData()
        ElMessage.success('删除成功')
      } catch (e) {
        ElMessage.error('删除失败: ' + (e as Error).message)
      }
    })
}

async function aiFill() {
  // 检查必要条件：key和中文都必须填写
  if (!form.value.key || !form.value.key.trim()) {
    return ElMessage.error('请先填写 Key')
  }

  const KEY_PATTERN = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/
  if (!KEY_PATTERN.test(form.value.key.trim())) {
    return ElMessage.error('Key格式不合法，应为 模块.子项，例如: common.ok')
  }
  
  // 检查是否有中文内容
  const chineseText = form.value.zh || form.value.zhCN || form.value.zh_CN || 
                      form.value['zh-CN'] || form.value.zhcn
  
  if (!chineseText || !chineseText.trim()) {
    return ElMessage.error('请先填写中文内容作为翻译源')
  }
  
  aiLoading.value = true
  
  try {
    // 获取所有需要翻译的语言（排除中文字段）
    const targetLanguages = languages.value.filter(lang => {
      const chineseFields = ['zh', 'zhCN', 'zh_CN', 'zh-CN', 'zhcn']
      return !chineseFields.includes(lang.field)
    })
    
    // 组装需要翻译的对象，key为字段名，值为语言名称
    const translationObject = {}
    targetLanguages.forEach(lang => {
      translationObject[lang.field] = lang.name
    })
    
    // 构造AI提示词
    const prompt = `请将中文文本翻译成多种语言。

中文原文："${chineseText}"

目标语言对象：
${JSON.stringify(translationObject, null, 2)}

要求：
1. 返回标准JSON格式，键名保持不变
2. 将对象中的键对应的语言名称替换为中文原文的翻译
3. 翻译要准确自然，符合各语言表达习惯
4. 保持原文语气和含义
5. 如果是UI文案，使用简洁表达

示例输入对象：{"en": "English", "ja": "Japanese"}
示例输出对象：{"en": "translated english text", "ja": "translated japanese text"}

请只返回JSON数据，不要包含其他说明文字。`

    // 调用AI翻译服务
    const result = await aiTranslate(prompt)
    
    if (!result || typeof result !== 'object') {
      throw new Error('AI返回格式不正确')
    }
    
    // 将翻译结果填充到表单中
    let filledCount = 0
    Object.keys(result).forEach(fieldName => {
      const translatedText = result[fieldName]
      if (translatedText && typeof translatedText === 'string') {
        // 只有当前字段为空或仅包含空白字符时才填充
        if (!form.value[fieldName] || !form.value[fieldName].trim()) {
          form.value[fieldName] = translatedText
          filledCount++
        }
      }
    })
    
    if (filledCount > 0) {
      ElMessage.success(`AI翻译完成，已填充 ${filledCount} 个语言字段`)
    } else {
      ElMessage.warning('AI翻译完成，但所有字段都已有内容，未进行覆盖')
    }
    
  } catch (error) {
    ElMessage.error(`AI翻译失败: ${error.message || '未知错误'}`)
  } finally {
    aiLoading.value = false
  }
}

function openLangManager() {
  langDialogVisible.value = true
}

function openLangEdit(row?: LangDef, index?: number) {
  if (row) {
    langForm.value = { ...row }
    langEditIndex.value = index ?? -1
  } else {
    langForm.value = { name: '', code: '', field: '' }
    langEditIndex.value = -1
  }
  langEditVisible.value = true
}

async function saveLang() {
  const name = (langForm.value.name || '').trim()
  const code = (langForm.value.code || '').trim()
  const field = (langForm.value.field || '').trim()
  if (!name) return ElMessage.error('名称必填')
  if (!/^.{2,}$/.test(code) || !/^[a-z]{2,3}(-[A-Z]{2})?$/.test(code)) return ElMessage.error('代码格式不正确，例如 zh-CN')
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(field)) return ElMessage.error('字段格式不正确，例如 zh 或 fr')

  // 唯一性校验
  const dupField = languages.value.some((l, idx) => l.field === field && idx !== langEditIndex.value)
  if (dupField) return ElMessage.error('字段已存在')
  const dupCode = languages.value.some((l, idx) => l.code === code && idx !== langEditIndex.value)
  if (dupCode) return ElMessage.error('代码已存在')

  try {
    if (langEditIndex.value === -1) {
      // 新增语言 - 调用后端API
      try {
        await I18nApiService.addLanguage(code, name, name, true) // 使用name作为nativeName
        ElMessage.success(`语言 ${name} 添加成功`)
      } catch (apiError) {
        // 如果是409错误（语言已存在），自动重试并覆盖
        if (apiError.response && apiError.response.status === 409) {
          await I18nApiService.addLanguage(code, name, name, true, true) // 设置overwrite=true
          ElMessage.success(`语言 ${name} 更新成功`)
        } else {
          throw apiError // 重新抛出其他错误
        }
      }
      
  // 新增成功后，强制刷新获取最新配置（包含新语言的空模板）
  await loadLanguagesFromServer(true)
      
    } else {
      // 编辑语言 - 更新后重新获取数据
      ElMessage.success('语言配置更新成功')
      
      // 重新加载完整数据以保证一致性
      await refreshAllData()
    }
    
    langEditVisible.value = false
    
  } catch (error) {
    
    // 处理具体的错误信息
    if (error.response && error.response.data && error.response.data.error) {
      ElMessage.error(error.response.data.error)
    } else {
      ElMessage.error('保存语言失败，请重试')
    }
  }
}

// 下载所有语言文件
async function downloadAllFiles() {
  try {
    downloading.value = true
    
    // 获取最新版本的语言包下载链接
    const downloadInfo = await I18nApiService.getDownloadUrl()
    
    // 显示下载信息
    ElMessage.success(`正在下载版本 ${downloadInfo.version} 的语言包`)
    
    // 使用a标签下载，使用版本化的文件名
    I18nApiService.downloadFile(downloadInfo.downloadUrl, `language-pack-${downloadInfo.version}.zip`)
    
    ElMessage.success('下载成功')
    
  } catch (error) {
    ElMessage.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

// 手动创建语言包
async function createLanguagePackage() {
  try {
    creating.value = true
    
    // 调用API创建语言包
    const packageInfo = await I18nApiService.createLanguagePackage()
    
    ElMessage.success(`语言包 v${packageInfo.version} 创建成功`)
    
    // 刷新版本信息
    await getRemoteVersionInfo()
    
  } catch (error) {
    ElMessage.error('创建语言包失败，请重试')
  } finally {
    creating.value = false
  }
}

async function removeLang(index: number) {
  const l = languages.value[index]
  if (!l) return

  // 禁止删除当前正在使用的语言
  if (i18nStore.locale === l.code) {
    ElMessage.warning('当前使用中的语言不能删除')
    return
  }

  // 可选：内置语言不允许删除（保持原行为）
  if (l.builtin) {
    ElMessage.info('内置语言不可删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定删除语言「${l.name}」吗？`, '提示', { type: 'warning' })

    await I18nApiService.deleteLanguage(l.code)

    ElMessage.success('删除成功')

    // 强制刷新以拿到最新列表和 messages
    await loadLanguagesFromServer(true)

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除语言失败，请重试')
    }
  }
}

// 语言模板选择处理
function onLanguageTemplateChange() {
  if (selectedLanguageTemplate.value) {
    const template = languageTemplates.value.find(t => t.code === selectedLanguageTemplate.value)
    if (template) {
      langForm.value.name = template.name
      langForm.value.code = template.code
      langForm.value.field = template.field
    }
  }
}

// 一键从中文翻译功能 - 打开翻译预览弹窗
async function translateFromChinese(targetLang: LangDef) {
  if (targetLang.code === 'zh-CN') {
    ElMessage.warning('无需翻译中文到中文')
    return
  }

  try {
    // 确认操作
    await ElMessageBox.confirm(
      `确定要将中文翻译到「${targetLang.name}」吗？`,
      '确认翻译',
      { type: 'info' }
    )

    // 设置当前翻译语言
    currentTranslationLang.value = targetLang
    
    // 获取目标语言现有数据（如果存在）
    try {
      const existingData = await I18nApiService.getLanguage(targetLang.code)
      previewTranslationData.value = existingData || {}
    } catch (error) {
      // 如果语言文件不存在，使用空对象
      previewTranslationData.value = {}
    }
    
    // 重置翻译状态
    isTranslating.value = false
    currentTranslationProgress.value = null
    
    // 打开翻译预览弹窗
    translationPreviewVisible.value = true

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`打开翻译预览失败: ${error.message || '未知错误'}`)
    }
  }
}

// 在预览弹窗中开始翻译
async function startTranslationInPreview() {
  if (!currentTranslationLang.value) {
    ElMessage.error('未选择翻译语言')
    return
  }

  try {
    isTranslating.value = true
    currentTranslationProgress.value = null

    // 获取中文语言文件
    const chineseData = await I18nApiService.getLanguage('zh-CN')
    if (!chineseData || typeof chineseData !== 'object' || Object.keys(chineseData).length === 0) {
      throw new Error('未找到中文翻译文件或文件为空')
    }

    ElMessage.info(`开始翻译到${currentTranslationLang.value.name}，请稍候...`)

    // 执行整体JSON翻译
    const result = await translationService.translateJsonObject(
      chineseData,
      currentTranslationLang.value.code,
      (progress) => {
        currentTranslationProgress.value = progress
      }
    )

    if (result.success) {
      // 更新预览数据
      previewTranslationData.value = result.data
      ElMessage.success('翻译完成！')
    } else {
      throw new Error(result.error || '翻译失败')
    }

  } catch (error) {
    ElMessage.error(`翻译失败: ${error.message || '未知错误'}`)
  } finally {
    isTranslating.value = false
  }
}

// （已移除 refreshLanguageCache：不再需要单独刷新单一语言缓存，依赖全量缓存刷新逻辑）

// 提交翻译结果
async function submitTranslation() {
  if (!currentTranslationLang.value) {
    ElMessage.error('未选择翻译语言')
    return
  }

  if (!hasTranslationData.value) {
    ElMessage.error('没有翻译数据可提交')
    return
  }

  try {
    // 确认提交
    await ElMessageBox.confirm(
      `确定要提交「${currentTranslationLang.value.name}」的翻译结果吗？`,
      '确认提交',
      { type: 'warning' }
    )

    // 提交到后端
    await I18nApiService.updateLanguage(currentTranslationLang.value.code, previewTranslationData.value)

    ElMessage.success('翻译提交成功！')

    // 关闭预览弹窗
    translationPreviewVisible.value = false

  // 重新加载数据（强制刷新，确保新翻译立即可见）
  await loadLanguagesFromServer(true)

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`提交翻译失败: ${error.message || '未知错误'}`)
    }
  }
}
</script>
<style scoped>
.i18n-page { padding: 16px; }
.title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.version-info { display: flex; align-items: center; margin-left: auto; margin-right: 16px; }
.actions { display: flex; gap: 8px; }
.pager { display:flex; justify-content:flex-end; padding: 12px 0; }
.compact-form :deep(.el-form-item) { margin-bottom: 10px; }
.lang-actions { display:flex; justify-content:flex-end; }

/* 翻译预览弹窗样式 */
.translation-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.preview-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.translation-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.translating {
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ready {
  color: #67c23a;
}

.preview-content {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.json-editor {
  padding: 16px;
  background-color: #f8f9fa;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
}

.json-editor pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
