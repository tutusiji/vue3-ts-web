<template>
  <div class="i18n-page">
    <div class="title-row">
      <h2>{{ $t('menu.internationalization') }}</h2>
      <div class="actions">
        <el-select v-model="selectedType" placeholder="类型" style="width: 180px" @change="onTypeChange">
          <el-option label="全部" value="all" />
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button @click="addLanguage" plain>{{ $t('i18n.addLang') }}</el-button>
        <el-button type="primary" @click="openAddDialog">{{ $t('i18n.add') }}</el-button>
      </div>
    </div>
    <el-table :data="paged" style="width:100%">
      <el-table-column prop="key" label="Key" width="260" />
      <el-table-column prop="zh" label="中文" />
      <el-table-column prop="zhTW" label="繁體" />
      <el-table-column prop="en" label="English" />
      <el-table-column prop="ja" label="日本語" />
      <el-table-column prop="th" label="ไทย" />
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
        <el-form-item label="中文"><el-input v-model="form.zh" style="max-width:360px" /></el-form-item>
        <el-form-item label="繁體"><el-input v-model="form.zhTW" style="max-width:360px" /></el-form-item>
        <el-form-item label="English"><el-input v-model="form.en" style="max-width:360px" /></el-form-item>
        <el-form-item label="日本語"><el-input v-model="form.ja" style="max-width:360px" /></el-form-item>
        <el-form-item label="ไทย"><el-input v-model="form.th" style="max-width:360px" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">{{ $t('i18n.cancel') }}</el-button>
        <el-button @click="aiFill" :loading="aiLoading" plain>一键AI生成</el-button>
        <el-button type="primary" @click="saveItem">{{ $t('i18n.save') }}</el-button>
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

type Row = { key: string; zh?: string; zhTW?: string; en?: string; ja?: string; th?: string }
const dict = ref<Row[]>([])
const i18nList = ref<Row[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref<Row>({ key: '', zh: '', zhTW: '', en: '', ja: '', th: '' })
const page = ref(1)
const pageSize = ref(20)
const aiLoading = ref(false)

// 类型（根据 key 的第一级，如 login.username -> login）
const selectedType = ref<'all' | string>('all')
const types = computed(() => {
  const set = new Set<string>()
  dict.value.forEach(r => { const p = r.key.split('.')[0]; if (p) set.add(p) })
  return Array.from(set).sort()
})

function buildDictFromPacks() {
  const keys = new Set<string>()
  ;[zhCN, zhTW, enUS, jaJP, thTH].forEach((pack:any) => {
    Object.keys(pack).forEach(k => collect(`${k}`, (pack as any)[k]))
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
    rows.push({
      key: k,
      zh: getVal(zhCN, k),
      zhTW: getVal(zhTW, k),
      en: getVal(enUS, k),
      ja: getVal(jaJP, k),
      th: getVal(thTH, k),
    })
  })
  return rows
}
function getVal(obj:any, path:string) {
  return path.split('.').reduce((acc, cur) => (acc ? acc[cur] : undefined), obj) || ''
}

onMounted(() => {
  dict.value = buildDictFromPacks()
  i18nList.value = [...dict.value]
})

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
  form.value = { key: '', zh: '', zhTW: '', en: '', ja: '', th: '' }
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
    form.value.zh = form.value.zh || zh || ''
    form.value.zhTW = form.value.zhTW || zhTW || ''
    form.value.en = form.value.en || en || ''
    form.value.ja = form.value.ja || ja || ''
    form.value.th = form.value.th || th || ''
    ElMessage.success('AI已自动填充')
  } catch (e) {
    ElMessage.error('AI翻译失败')
  } finally {
    aiLoading.value = false
  }
}

function addLanguage() {
  ElMessageBox.prompt('请输入新语言代码（例如 fr-FR）与名称（例如 Français），用英文逗号分隔', '新增语言', {
    confirmButtonText: '确定', cancelButtonText: '取消', inputPattern: /^.+,.+$/, inputErrorMessage: '格式示例：fr-FR,Français'
  }).then(({ value }) => {
    const [code, name] = value.split(',').map(s => s.trim())
    // 仅前端动态列演示：在表格中动态加入该语言列（临时，实现最小闭环）
    // 实际项目中，应该同时新增语言包文件，并在 i18n/index.ts 注册
    i18nList.value = i18nList.value.map(row => ({ ...row, [code]: '' }))
    ElMessage.success(`已新增语言列：${name} (${code})`)
  })
}
</script>
<style scoped>
.i18n-page { padding: 16px; }
.title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.actions { display: flex; gap: 8px; }
.pager { display:flex; justify-content:flex-end; padding: 12px 0; }
.compact-form :deep(.el-form-item) { margin-bottom: 10px; }
</style>
