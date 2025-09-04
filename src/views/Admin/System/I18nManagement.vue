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
import zhCN from '@/i18n/zh-CN.json'
import zhTW from '@/i18n/zh-TW.json'
import enUS from '@/i18n/en-US.json'
import jaJP from '@/i18n/ja-JP.json'
import thTH from '@/i18n/th-TH.json'
import { aiTranslate } from '@/utils/ai'

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

onMounted(() => {
  const saved = localStorage.getItem('i18nLanguages')
  languages.value = saved ? JSON.parse(saved) : defaultLanguages.map(l => ({ name: l.name, code: l.code, field: l.field, builtin: l.builtin }))
  attachPacks(languages.value)

  dict.value = buildDictFromPacks()
  i18nList.value = [...dict.value]
})

watch(languages, (val) => {
  localStorage.setItem('i18nLanguages', JSON.stringify(val.map(({ name, code, field, builtin }) => ({ name, code, field, builtin }))))
}, { deep: true })

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
function saveItem() {
  if (!form.value.key) return ElMessage.error('Key不能为空')
  const idx = i18nList.value.findIndex(i => i.key === form.value.key)
  if (idx > -1) i18nList.value[idx] = { ...form.value }
  else i18nList.value.unshift({ ...form.value })
  dialogVisible.value = false
  ElMessage.success('保存成功')
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

function saveLang() {
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

  if (langEditIndex.value === -1) {
    languages.value.push({ name, code, field, builtin: false })
    // 给现有数据补充新字段
    i18nList.value = i18nList.value.map(r => ({ ...r, [field]: r[field] ?? '' }))
  } else {
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
  }
  langEditVisible.value = false
}

function removeLang(index: number) {
  const l = languages.value[index]
  if (l.builtin) return
  ElMessageBox.confirm(`确定删除语言「${l.name}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      const field = l.field
      languages.value.splice(index, 1)
      // 可选：删除数据中的该字段
      i18nList.value = i18nList.value.map(r => { const nv = { ...r }; delete (nv as any)[field]; return nv })
      ElMessage.success('删除成功')
    })
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
