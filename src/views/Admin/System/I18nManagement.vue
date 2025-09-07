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
          {{ $t('i18n.downloadAll') || '下载所有' }}
        </el-button>
        <el-button type="primary" @click="openAddDialog">{{ $t('i18n.add') }}</el-button>
      </div>
    </div>
    <el-table :data="paged" style="width:100%">
      <el-table-column prop="key" label="Key" width="260" />
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
        <el-button @click="aiFill" :loading="aiLoading" plain>一键AI生成</el-button>
        <el-button type="primary" @click="saveItem">{{ $t('i18n.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 语言管理弹窗 -->
    <el-dialog v-model="langDialogVisible" title="语言管理" width="720px">
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
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openLangEdit(scope.row, scope.$index)">编辑</el-button>
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
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import zhCN from '@/i18n/zh-CN.json'
import zhTW from '@/i18n/zh-TW.json'
import enUS from '@/i18n/en-US.json'
import jaJP from '@/i18n/ja-JP.json'
import thTH from '@/i18n/th-TH.json'
import { aiTranslate } from '@/utils/ai'
import { I18nApiService } from '@/utils/i18nApi'
import type { Language, LanguageConfig } from '@/utils/i18nApi'
import { refreshLanguageConfig, languageConfigState } from '@/i18n'

type Row = { key: string; [field: string]: any }
type LangDef = { name: string; code: string; field: string; builtin?: boolean; pack?: any }

const defaultLanguages: LangDef[] = [
  { name: '中文', code: 'zh-CN', field: 'zh', builtin: true, pack: zhCN },
  { name: '繁體', code: 'zh-TW', field: 'zhTW', builtin: true, pack: zhTW },
  { name: 'English', code: 'en-US', field: 'en', builtin: true, pack: enUS },
  { name: '日本語', code: 'ja-JP', field: 'ja', builtin: true, pack: jaJP },
  { name: 'ไทย', code: 'th-TH', field: 'th', builtin: true, pack: thTH },
]

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

// 语言管理弹窗状态
const langDialogVisible = ref(false)
const langEditVisible = ref(false)
const langEditIndex = ref(-1)
const langForm = ref<LangDef>({ name: '', code: '', field: '' })

// 类型（根据 key 的第一级，如 login.username -> login）
const selectedType = ref<'all' | string>('all')
const types = computed(() => {
  const set = new Set<string>()
  dict.value.forEach(r => { const p = r.key.split('.')[0]; if (p) set.add(p) })
  return Array.from(set).sort()
})

function attachPacks(list: LangDef[]) {
  // 依据 code 重新绑定内置语言的包，避免本地存储丢失 pack
  const byCode: Record<string, any> = {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
    'ja-JP': jaJP,
    'th-TH': thTH,
  }
  list.forEach(l => { if (byCode[l.code]) l.pack = byCode[l.code] })
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

function setNestedValue(obj: any, path: string, value: string) {
  const keys = path.split('.')
  let current = obj
  
  // 遍历到倒数第二个key，确保路径存在
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  // 设置最后一个key的值
  const lastKey = keys[keys.length - 1]
  current[lastKey] = value
}

// 从服务器加载语言配置和翻译数据
async function loadLanguagesFromServer() {
  try {
    // 获取服务器端的语言配置和翻译数据
    const serverData = await I18nApiService.getEnabledMessages(true) // 包含禁用的语言
    const serverLanguages = serverData.config.languages
    const serverMessages = serverData.messages
    
    // 转换为前端需要的格式
    const convertedLanguages: LangDef[] = serverLanguages.map(lang => {
      // 根据code推断field名称
      let field = lang.code.toLowerCase().replace('-', '')
      if (lang.code === 'zh-CN') field = 'zh'
      else if (lang.code === 'zh-TW') field = 'zhTW'
      else if (lang.code === 'en-US') field = 'en'
      else if (lang.code === 'ja-JP') field = 'ja'
      else if (lang.code === 'th-TH') field = 'th'
      
      return {
        name: lang.nativeName || lang.name,
        code: lang.code,
        field: field,
        builtin: ['zh-CN', 'zh-TW', 'en-US', 'ja-JP', 'th-TH'].includes(lang.code),
        pack: serverMessages[lang.code] || {}
      }
    })
    
    // 为内置语言补充前端打包的翻译数据（作为fallback）
    attachPacks(convertedLanguages)
    
    // 更新语言列表
    languages.value = convertedLanguages
    
    // 重新构建字典和列表
    dict.value = buildDictFromPacks()
    i18nList.value = [...dict.value]
    
    // 更新本地缓存（但不再作为主要数据源）
    localStorage.setItem('i18nLanguages', JSON.stringify(convertedLanguages.map(({ name, code, field, builtin }) => ({ name, code, field, builtin }))))
    
    // 更新全局语言配置状态
    if (languageConfigState.value) {
      languageConfigState.value = {
        ...languageConfigState.value,
        languages: convertedLanguages
      }
    }
    
  } catch (error) {
    console.error('Failed to load languages from server:', error)
    ElMessage.warning('无法从服务器加载语言配置，使用本地缓存')
    
    // 降级到本地缓存或默认配置
    const saved = localStorage.getItem('i18nLanguages')
    languages.value = saved ? JSON.parse(saved) : defaultLanguages.map(l => ({ name: l.name, code: l.code, field: l.field, builtin: l.builtin }))
    attachPacks(languages.value)
    
    dict.value = buildDictFromPacks()
    i18nList.value = [...dict.value]
  }
}

onMounted(async () => {
  await loadLanguagesFromServer()
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
  form.value = { ...row }
  dialogVisible.value = true
}
async function saveItem() {
  if (!form.value.key) return ElMessage.error('Key不能为空')
  
  try {
    // 找出原始数据，确定哪些字段被修改了
    const originalRow = i18nList.value.find(i => i.key === form.value.key)
    const isNewItem = !originalRow
    
    // 更新本地数据
    const idx = i18nList.value.findIndex(i => i.key === form.value.key)
    if (idx > -1) i18nList.value[idx] = { ...form.value }
    else i18nList.value.unshift({ ...form.value })
    
    // 只同步被修改的语言字段到后端
    const updatePromises: Promise<any>[] = []
    
    for (const lang of languages.value) {
      const fieldName = lang.field
      const newValue = form.value[fieldName] || ''
      const oldValue = originalRow?.[fieldName] || ''
      
      // 只有当值发生变化时才更新后端
       if (isNewItem || newValue !== oldValue) {
         // 使用新的部分更新API，直接更新指定key，无需拉取完整文件
         const updatePromise = I18nApiService.updateLanguageKey(lang.code, form.value.key, newValue)
         updatePromises.push(updatePromise)
       }
    }
    
    // 只有有变化的字段才需要等待更新完成
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }
    
    dialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error as Error).message)
  }
}
function deleteItem(row: Row) {
  ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
    .then(() => {
      i18nList.value = i18nList.value.filter(i => i.key !== row.key)
      ElMessage.success('删除成功')
    })
}

async function aiFill() {
  if (!form.value.key) return ElMessage.error('请先填写 Key')
  // 找一条已填写的语言作为种子（优先中文/英文）
  const seed = form.value.zh || form.value.en
  if (!seed) return ElMessage.error('请至少填写一条文案供 AI 参考')
  aiLoading.value = true
  try {
    const prompt = `请将以下文案翻译为五种语言（简体中文、繁体中文、英文、日文、泰文），仅返回 JSON，对应字段 zh, zhTW, en, ja, th。\nKey: ${form.value.key}\nText: ${seed}`
    const res = await aiTranslate(prompt)
    const { zh, zhTW, en, ja, th } = res || {}
    // 仅对内置五种进行自动填充
    const fillMap: Record<string, string | undefined> = { zh, zhTW, en, ja, th }
    languages.value.forEach(l => {
      if (fillMap[l.field] !== undefined) {
        form.value[l.field] = form.value[l.field] || (fillMap[l.field] as string) || ''
      }
    })
    ElMessage.success('AI已自动填充')
  } catch (e) {
    ElMessage.error('AI翻译失败')
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
      console.log('调用后端API添加语言:', { code, name, field })
      
      try {
        await I18nApiService.addLanguage(code, name, name, true) // 使用name作为nativeName
        ElMessage.success(`语言 ${name} 添加成功`)
      } catch (apiError) {
        // 如果是409错误（语言已存在），自动重试并覆盖
        if (apiError.response && apiError.response.status === 409) {
          console.log('语言已存在，尝试覆盖更新...')
          await I18nApiService.addLanguage(code, name, name, true, true) // 设置overwrite=true
          ElMessage.success(`语言 ${name} 更新成功`)
        } else {
          throw apiError // 重新抛出其他错误
        }
      }
    } else {
      // 编辑语言 - 只更新本地配置
      const old = languages.value[langEditIndex.value]
      const changingField = old.field !== field
      languages.value[langEditIndex.value] = { ...old, name, code, field }
      if (changingField) {
        // 迁移列数据
        i18nList.value = i18nList.value.map(r => {
          const nv: Row = { ...r }
          nv[field] = r[old.field] || ''
          if (field !== old.field) delete nv[old.field]
          return nv
        })
      }
      ElMessage.success('语言配置更新成功')
    }
    
    langEditVisible.value = false
    
    // 重新从服务器加载最新数据
    await loadLanguagesFromServer()
    
    // 刷新全局语言配置
    await refreshLanguageConfig()
  } catch (error) {
    console.error('保存语言失败:', error)
    
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
    
    // 获取版本信息
    const versionInfo = await I18nApiService.getVersion()
    
    // 下载文件
    const blob = await I18nApiService.downloadAllFiles()
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `languages-${versionInfo.version}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('下载成功')
    
    // 刷新数据
    await loadData()
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

async function removeLang(index: number) {
  const l = languages.value[index]
  if (l.builtin) return
  
  try {
    await ElMessageBox.confirm(`确定删除语言「${l.name}」吗？`, '提示', { type: 'warning' })
    
    // 调用后端API删除语言
    console.log('调用后端API删除语言:', l.code)
    await I18nApiService.deleteLanguage(l.code)
    
    ElMessage.success('删除成功')
    
    // 重新从服务器加载最新数据
    await loadLanguagesFromServer()
    
    // 刷新全局语言配置
    await refreshLanguageConfig()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除语言失败:', error)
      ElMessage.error('删除语言失败，请重试')
    }
  }
}
</script>
<style scoped>
.i18n-page { padding: 16px; }
.title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.actions { display: flex; gap: 8px; }
.pager { display:flex; justify-content:flex-end; padding: 12px 0; }
.compact-form :deep(.el-form-item) { margin-bottom: 10px; }
.lang-actions { display:flex; justify-content:flex-end; }
</style>
