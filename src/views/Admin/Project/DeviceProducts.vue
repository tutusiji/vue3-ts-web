<template>
  <div class="device-products-page">
    <template v-if="mode === 'list'">
      <el-row :gutter="12">
        <!-- 左侧分类树 -->
        <el-col :span="4" class="category-tree-wrapper">
          <div class="panel-title">产品管理</div>
          <el-input v-model="categoryFilter" size="small" placeholder="搜索产品名称" clearable class="mb8" />
          <el-tree
            :data="categoryTree"
            node-key="id"
            :expand-on-click-node="false"
            highlight-current
            @node-click="onCategoryClick"
          />
          <div class="mt8 small-tip">共 {{ categoryCount }} 类</div>
        </el-col>
        <!-- 右侧主体 -->
        <el-col :span="20">
          <!-- 查询条件 -->
          <el-card shadow="never" class="filter-card" :body-style="{padding:'10px 12px 4px'}">
            <el-form :inline="true" :model="query" size="small" @submit.prevent>
              <el-form-item label="设备类型名称">
                <el-input v-model="query.keyword" placeholder="输入名称或标识" clearable @keyup.enter="load" style="width:200px" />
              </el-form-item>
              <el-form-item label="是否物联设备">
                <el-select v-model="query.isIot" style="width:120px">
                  <el-option label="全部" value="all" />
                  <el-option label="是" value="yes" />
                  <el-option label="否" value="no" />
                </el-select>
              </el-form-item>
              <el-form-item label="启用状态">
                <el-select v-model="query.enabled" style="width:120px">
                  <el-option label="全部" value="all" />
                  <el-option label="启用" value="on" />
                  <el-option label="停用" value="off" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="load" :loading="loading">查询</el-button>
                <el-button @click="resetFilters">重置</el-button>
                <el-button link type="primary" @click="toggleFilterCollapse">{{ filterCollapsed ? '展开' : '收起' }}</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 工具栏 -->
          <div class="toolbar mt8">
            <div>
              <el-button type="primary" size="small" @click="openCreate">新增</el-button>
              <el-button size="small" @click="exportData">导出</el-button>
            </div>
            <div class="selected-info" v-if="multipleSelection.length">
              已勾选 {{ multipleSelection.length }} 条数据
              <el-button link size="small" @click="clearSelection">清空</el-button>
            </div>
          </div>

          <!-- 表格 -->
          <el-table
            ref="tableRef"
            :data="list"
            size="small"
            border
            v-loading="loading"
            @selection-change="onSelectionChange"
          >
            <el-table-column type="selection" width="42" />
            <el-table-column prop="roomNo" label="房号" width="60" />
            <el-table-column prop="name" label="设备类型名称" min-width="140" show-overflow-tooltip />
            <el-table-column prop="code" label="设备类型标识" width="120" />
            <el-table-column prop="isIot" label="是否物联设备" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.isIot" size="small" type="success">是</el-tag>
                <el-tag v-else size="small" type="info">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="boundIotTypeName" label="绑定物联设备类型名称" min-width="180" />
            <el-table-column prop="online" label="离线状态" width="90">
              <template #default="{ row }">
                <el-icon v-if="row.online" color="#52c41a"><circle-check /></el-icon>
                <el-icon v-else color="#d9d9d9"><circle-close /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="enabled" label="启用状态" width="90">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="onToggleEnabled(row)" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序号" width="90">
              <template #default="{ row }">
                <div v-if="editingSortId !== row.id" @dblclick="startEditSort(row)" class="sort-display">{{ row.sort }}</div>
                <el-input
                  v-else
                  v-model.number="editSortValue"
                  size="small"
                  @blur="saveSort(row)"
                  @keyup.enter="saveSort(row)"
                  style="width:60px"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
                <el-button link size="small" @click="openConfig(row)">设备类型配置</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="query.page"
              v-model:page-size="query.pageSize"
              :total="total"
              layout="total, prev, pager, next, jumper"
              small
              @current-change="load"
              @size-change="load"
            />
          </div>
        </el-col>
      </el-row>

      <DeviceProductDialog
        v-model="dialogVisible"
        :is-edit="dialogIsEdit"
        :model="currentRecord || undefined"
        :categories="flatCategories"
        @save="handleDialogSave"
      />

      <!-- 配置弹窗占位 -->
      <el-dialog v-model="configDialog.visible" title="设备类型配置" width="500px">
        <p>这里可以放置该设备类型的扩展配置表单（占位）。</p>
        <p>名称：{{ configDialog.record?.name }}</p>
        <template #footer>
          <el-button type="primary" @click="configDialog.visible=false">关闭</el-button>
        </template>
      </el-dialog>
    </template>

    <!-- 详情页 -->
    <template v-else>
      <div class="detail-header">
        <el-button link type="primary" @click="backToList">返回列表</el-button>
        <span class="title">设备类型：{{ currentRecord?.name }}</span>
      </div>
      <el-card shadow="never">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基础配置" name="basic">
            <DeviceTypeBasic v-if="currentRecord" :model="currentRecord" />
          </el-tab-pane>
          <el-tab-pane label="属性上报" name="runtime">
            <DeviceTypeRuntime v-if="currentRecord" :model="currentRecord" />
          </el-tab-pane>
          <el-tab-pane label="事件上报" name="events">
            <DeviceTypeEvents v-if="currentRecord" :model="currentRecord" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DeviceProductApi, type DeviceProduct } from '@/utils/deviceProductApi'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import DeviceProductDialog from './components/DeviceProductDialog.vue'
import DeviceTypeBasic from './components/DeviceTypeBasic.vue'
import DeviceTypeRuntime from './components/DeviceTypeRuntime.vue'
import DeviceTypeEvents from './components/DeviceTypeEvents.vue'
import { useRoute, useRouter } from 'vue-router'

// 路由与模式切换
const route = useRoute();
const router = useRouter();
const mode = ref<'list' | 'detail'>(route.query.mode === 'detail' ? 'detail' : 'list')
const activeTab = ref((route.query.tab as string) || 'basic')

function openConfig(row:DeviceProduct) {
  // 跳转到详情模式，并带上当前记录id
  currentRecord.value = { ...row }
  mode.value = 'detail'
  activeTab.value = 'basic'
  // 可选：通过路由参数持久化
  router.replace({ query: { mode: 'detail', id: row.id, tab: 'basic' } })
}

function backToList(){
  mode.value = 'list'
  router.replace({ query: {} })
}

// 分类树 mock
const categoryTree = ref([
  { id: 'root-1', label: '机器人', children: [ { id: '机器人', label: '机器人 (7)' } ] },
  { id: 'root-2', label: 'AGV', children: [ { id: 'AGV', label: 'AGV' } ] },
  { id: 'root-3', label: '机器狗', children: [ { id: '机器狗', label: '机器狗' } ] },
])
const flatCategories = ['机器人','AGV','机器狗']
const categoryFilter = ref('')
const categoryCount = computed(()=> flatCategories.length)

const query = reactive({
  keyword: '',
  isIot: 'all',
  enabled: 'all',
  category: '',
  page: 1,
  pageSize: 10,
})

const list = ref<DeviceProduct[]>([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref<DeviceProduct[]>([])

// 排序号编辑
const editingSortId = ref<string| null>(null)
const editSortValue = ref<number>(0)
const tableRef = ref()

// 弹窗(子组件)
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const currentRecord = ref<Partial<DeviceProduct> | null>(null)
const configDialog = reactive<{visible: boolean, record: DeviceProduct | null}>({ visible:false, record:null })

const filterCollapsed = ref(false)
function toggleFilterCollapse() { filterCollapsed.value = !filterCollapsed.value }

async function load() {
  loading.value = true
  try {
    const { list: rows, total: t } = await DeviceProductApi.query(query as any)
    list.value = rows
    total.value = t
    // 如果路由带有id，尝试选中并进入详情
    const id = (route.query.id as string) || ''
    if (mode.value === 'detail' && id) {
      const hit = rows.find(r => r.id === id)
      if (hit) currentRecord.value = { ...hit }
    }
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  query.keyword=''
  query.isIot='all'
  query.enabled='all'
  query.page=1
  load()
}

function onCategoryClick(node:any) {
  if (flatCategories.includes(node.id)) {
    query.category = node.id
    query.page = 1
    load()
  }
}

function onSelectionChange(rows:DeviceProduct[]) { multipleSelection.value = rows }
function clearSelection() { multipleSelection.value = []; tableRef.value?.clearSelection?.() }

function openCreate(){ dialogIsEdit.value=false; currentRecord.value=null; dialogVisible.value=true }
function openEdit(row:DeviceProduct){ dialogIsEdit.value=true; currentRecord.value={...row}; dialogVisible.value=true }
async function handleDialogSave(data:DeviceProduct, isEdit:boolean){
  if(isEdit) await DeviceProductApi.update(data); else await DeviceProductApi.create(data)
  ElMessage.success(isEdit ? '已保存' : '已创建')
  load()
}

async function remove(row:DeviceProduct) {
  await ElMessageBox.confirm(`确定删除【${row.name}】?`, '提示', { type:'warning' })
  await DeviceProductApi.remove(row.id)
  ElMessage.success('已删除')
  load()
}

function onToggleEnabled(row:DeviceProduct) {
  DeviceProductApi.update({ id: row.id, enabled: row.enabled })
}

function startEditSort(row:DeviceProduct) { editingSortId.value = row.id; editSortValue.value = row.sort }
function saveSort(row:DeviceProduct) { DeviceProductApi.update({ id: row.id, sort: editSortValue.value }); row.sort = editSortValue.value; editingSortId.value=null }

function exportData() { ElMessage.success('已导出(模拟)') }

onMounted(() => { load(); })
</script>

<style scoped>
.device-products-page { padding:4px 4px 12px }
.category-tree-wrapper { background:#fff; padding:8px 10px; border:1px solid #ebeef5; border-radius:4px; min-height:520px }
.panel-title { font-weight:600; margin-bottom:6px; }
.mb8 { margin-bottom:8px; }
.mt8 { margin-top:8px; }
.toolbar { display:flex; justify-content:space-between; align-items:center; margin:8px 0 6px; }
.selected-info { font-size:12px; color:#666; }
.pagination-bar { margin-top:10px; display:flex; justify-content:flex-end; }
.sort-display { cursor:text; padding:0 4px; }
.small-tip { font-size:12px; color:#999; margin-top:4px; }
.detail-header { display:flex; align-items:center; gap:12px; margin-bottom:8px }
.detail-header .title { font-weight:600 }
</style>
