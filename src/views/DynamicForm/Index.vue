<template>
  <el-row class="h-[100vh] overflow-hidden">
    <el-col v-loading="loading_com" :span="pageColumns[0]" class="p-1 bg-green-300">
      <el-card class="w-[100%]" :body-style="{ padding: '0px' }">
        <template #header>
          <div class="card-header">
            <div class="card-header flex items-center justify-between">
              <span>表单控件选择区</span>
              <el-button @click="reloadForm">更新</el-button>
            </div>
          </div>
        </template>
        <div class="h-[calc(100vh-86px)] overflow-x-hidden overflow-y-auto p-2">
          <!-- :class="[
              modelCurrent === item.baseInfo.comId &&
                'border border-green-200 bg-green-50 border-dashed shadow-md'
            ]" -->
          <el-collapse v-model="comCellNames">
            <el-collapse-item title="模板库" name="1">
              <div
                v-for="item in configStore.modelsConfig"
                :key="item.baseInfo.comId"
                class="group flex items-center w-[100%] hover:bg-green-50 hover:shadow-md cursor-pointer p-2 rounded-md transition-all"
                @click="addFormModel(item)"
              >
                <el-icon class="mr-2"
                  ><Document
                    class="cursor-pointer transition-transform group-hover:rotate-45 duration-300" /></el-icon
                >{{ item.baseInfo.comName }}
              </div>
            </el-collapse-item>
            <el-collapse-item title="组件库" name="2">
              <ul>
                <li v-for="item in configStore.formConfig" :key="item.label" class="p-2">
                  <el-button @click="addFormItem(item)"
                    ><el-icon class="mr-2"><SetUp /></el-icon>{{ item.label }}</el-button
                  >
                </li>
              </ul>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </el-col>
    <el-col v-loading="loading" :span="pageColumns[1]" class="p-1 bg-blue-300">
      <el-card class="w-[100%]" :body-style="{ padding: '0px' }">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <span>表单页面预览区—【{{ configStore.createData.baseInfo.comName }}】</span>
            <div>
              <el-button @click="readConfig">查看Json配置</el-button>
              <el-button @click="saveFormConfig">保存为模板</el-button>
              <el-button @click="saveFormConfig">分享</el-button>
              <el-button type="primary" @click="saveFormConfig">保存</el-button>
              <el-button type="primary" @click="previewForm">预览</el-button>
            </div>
          </div>
        </template>
        <div class="formbg overflow-x-hidden overflow-y-auto">
          <div class="formContent rounded-lg shadow-lg">
            <el-form
              ref="outputFormRef"
              :label-position="configStore.createData.baseInfo.labelPosition"
              :model="outputForm"
              label-width="auto"
              :size="configStore.createData.baseInfo?.formSize"
              status-icon
            >
              <!-- <transition-group name="list" tag="div" class="draggable-list"> -->
              <el-row :gutter="configStore.createData.baseInfo.gutter">
                <el-col
                  :span="Math.floor(24 / item.column)"
                  v-for="(item, index) in configStore.createData.comList"
                  :key="`${item.key}_${index}`"
                  :class="[
                    configStore.currentItem === index && ' border-blue-500',
                    draggingIndex === index && 'dragging',
                    dropIndex === index && 'drop-over',
                    'formItems group relative border rounded-md border-dashed hover:translate-y-[-3px] hover:shadow-lg transition-all'
                  ]"
                  draggable="true"
                  @dragstart="dragStart(index)"
                  @dragover.prevent="dragOver($event, index)"
                  @dragleave="dragLeave(index)"
                  @drop="drop(index)"
                  @dragend="dragEnd"
                  :style="`margin-bottom:${configStore.createData.baseInfo.spacing}px`"
                  @click="handleFormItemClick(item, index)"
                >
                  <el-icon
                    class="deleteBtn cursor-pointer transition-transform hover:rotate-45 duration-300 group-hover:block"
                    @click="removeFormModelItem(index)"
                    ><Delete
                  /></el-icon>
                  <component
                    :is="myComponents[item.comName]"
                    :data="item"
                    :model-value="outputForm[item.key]"
                    :option-source="
                      item.optionKey &&
                      (item.optionKey === 'default'
                        ? item.options
                        : customOptions(item, outputForm[item.key]))
                    "
                    @update:modelValue="(value: any) => (outputForm[item.key] = value)"
                    @custom-event="updateMethod"
                  >
                  </component>
                </el-col>
              </el-row>
              <!-- </transition-group> -->
              <el-form-item>
                <el-button type="primary" @click="submitForm(outputFormRef)"> Create </el-button>
                <el-button @click="resetForm(outputFormRef)">Reset</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col v-loading="loading" :span="pageColumns[2]" class="p-1 bg-violet-300">
      <!-- <el-row class="bg-[#fff] mb-3">
        <el-card class="dropbg h-[200px] w-[100%] flex items-center justify-center">
          <p class="p-3">拖拽组件到这里</p>
        </el-card>
      </el-row> -->
      <el-row>
        <el-card class="w-[100%]" :body-style="{ padding: '0px' }">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <span>表单页面配置编辑区</span>
              <div>
                <el-popover :visible="visible" placement="left" :width="160">
                  <p>这将会失去所有表单配置数据！</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" text @click="visible = false">再想想</el-button>
                    <el-button size="small" type="primary" @click="clearFormModel">
                      确定
                    </el-button>
                  </div>
                  <template #reference>
                    <!-- type="danger" -->
                    <el-button @click="visible = true">清空页面配置</el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </template>
          <div class="h-[calc(100vh-86px)] overflow-x-hidden overflow-y-auto p-2">
            <el-form label-position="right" label-width="80" status-icon size="small">
              <el-collapse v-model="editCellNames">
                <el-collapse-item title="基础信息配置" name="1">
                  <el-form-item label="表单名称">
                    <el-input v-model="configStore.createData.baseInfo.comName"> </el-input>
                  </el-form-item>
                  <el-form-item label="表单ID">
                    <el-input v-model="configStore.createData.baseInfo.comId"> </el-input>
                  </el-form-item>
                  <el-form-item label="控件大小">
                    <el-radio-group
                      v-model="configStore.createData.baseInfo.formSize"
                      @change="handleFormSizeChange"
                    >
                      <el-radio-button value="large">大</el-radio-button>
                      <el-radio-button value="default">中</el-radio-button>
                      <el-radio-button value="small">小</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="标签位置">
                    <el-radio-group
                      v-model="configStore.createData.baseInfo.labelPosition"
                      @change="handleLabelPositionChange"
                    >
                      <el-radio-button value="top">上</el-radio-button>
                      <el-radio-button value="left">左</el-radio-button>
                      <el-radio-button value="right">右</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="布局分栏">
                    <div class="w-[100%] flex justify-between flex-col">
                      <el-radio-group
                        v-model="configStore.createData.baseInfo.column"
                        @change="handleLayoutModeChange"
                      >
                        <el-radio-button :value="1">单列</el-radio-button>
                        <el-radio-button :value="2">两列</el-radio-button>
                        <el-radio-button :value="3">三列</el-radio-button>
                        <el-radio-button :value="4">四列</el-radio-button>
                      </el-radio-group>
                      <el-slider
                        v-model="configStore.createData.baseInfo.column"
                        :min="0"
                        :max="24"
                        show-input
                        @change="handleColumnsChange"
                      />
                    </div>
                  </el-form-item>
                  <el-form-item label="栅格间隔">
                    <div class="w-[100%] flex justify-between flex-col">
                      <el-radio-group
                        v-model="configStore.createData.baseInfo.gutter"
                        @change="handleGutterChange"
                      >
                        <el-radio-button :label="0">无间隔</el-radio-button>
                        <el-radio-button :label="10">10px</el-radio-button>
                        <el-radio-button :label="20">20px</el-radio-button>
                        <el-radio-button :label="30">30px</el-radio-button>
                      </el-radio-group>
                      <el-slider
                        v-model="configStore.createData.baseInfo.gutter"
                        :min="0"
                        :max="300"
                        show-input
                        @change="handleGutterChange"
                      />
                    </div>
                  </el-form-item>
                  <el-form-item label="上下间距">
                    <div class="w-[100%] flex justify-between flex-col">
                      <el-radio-group
                        v-model="configStore.createData.baseInfo.spacing"
                        @change="handleSpacingChange"
                      >
                        <el-radio-button :label="0">无间隔</el-radio-button>
                        <el-radio-button :label="10">10px</el-radio-button>
                        <el-radio-button :label="20">20px</el-radio-button>
                        <el-radio-button :label="30">30px</el-radio-button>
                      </el-radio-group>
                      <el-slider
                        v-model="configStore.createData.baseInfo.spacing"
                        :min="0"
                        :max="300"
                        show-input
                        @change="handleSpacingChange"
                      />
                    </div>
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="控件编辑" name="2">
                  <!-- <transition-group name="fade" mode="out-in"> -->
                  <div
                    v-if="configStore.currentEditConfigItem"
                    class="border mb-4 p-2 rounded-md border-violet-400 border-dashed shadow-md"
                  >
                    <div class="header flex items-center justify-end mb-4">
                      <span class="flex-1">{{
                        configStore.currentEditConfigItem.comName +
                        ' ' +
                        configStore.currentEditConfigItem.comlabel
                      }}</span>
                    </div>
                    <component
                      :is="myComponentsEdit[configStore.currentEditConfigItem.comName]"
                      :data="configStore.currentEditConfigItem"
                      :index="configStore.currentItem"
                    >
                    </component>
                  </div>
                  <!-- </transition-group> -->
                </el-collapse-item>
              </el-collapse>
            </el-form>
          </div>
        </el-card>
      </el-row>
    </el-col>

    <!-- ltr  rtl ttb btt -->
    <el-drawer
      v-model="drawer"
      title="表单页面配置数据"
      direction="rtl"
      :modal="false"
      :lock-scroll="false"
      :append-to-body="true"
      :destroy-on-close="true"
      modal-class="mask-layer"
      :size="600"
    >
      <!-- <div v-html="formatJson"></div> -->
      <pre>{{ configStore.createData }}</pre>
    </el-drawer>
  </el-row>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { ElNotification } from 'element-plus'
import { throttle, debounce } from 'lodash-es'
// import type { FormProps } from 'element-plus'
// import prettier from 'prettier/standalone'
// import parserBabel from 'prettier/parser-babel'
// import stringify from 'json-stringify-pretty-compact'

import { fetchUserData, fetchOrgTree, fetchCityTree } from './request'
const outputFormRef = ref<FormInstance>()
import { useConfigStore } from '@/store/configStore'
const configStore = useConfigStore()

// const modelList = ref<any>(modelsConfig) //表单控件模版库列表

// const pagecConfigData = ref(modelsConfig) //表单配置数据
const outputForm = reactive<any>([]) //用户输入的数据
const visible = ref(false)
const drawer = ref(false)
const loading = ref(false)
const loading_com = ref(false)
const draggingIndex = ref<number | null>(null) // 正在拖拽的元素的索引
const dropIndex = ref<number | null>(null) // 拖拽元素释放时所在的索引
// const formSize = ref<ComponentSize>('large') // '' | 'large' | 'default' | 'small'
// const modelCurrent = ref('')
const columns = ref(0)
const comCellNames = ref(['1', '2'])
const editCellNames = ref(['2'])
const pageColumns = ref([4, 14, 6])
// const gutter = ref(20)
// const spacing = ref(20)
// const labelPosition = ref<FormProps['labelPosition']>('top')

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  console.log('submitForm', outputForm)
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 保存编辑区
const saveFormConfig = (item: any) => {
  ElNotification({
    // title: 'Title',
    type: 'success',
    offset: 100,
    message: h('i', { style: 'color: teal' }, '保存成功')
  })
}

// 预览编辑区
const previewForm = (item: any) => {
  ElNotification({
    // title: 'Title',
    type: 'warning',
    offset: 100,
    message: h('i', { style: 'color: teal' }, '跳转预览页')
  })
}
// 预览编辑区
const reloadForm = (item: any) => {
  ElNotification({
    // title: 'Title',
    type: 'success',
    offset: 100,
    message: h('i', { style: 'color: teal' }, '控件库列表已更新')
  })
  loading_com.value = true
  setTimeout(() => {
    loading_com.value = false
  }, 800)
}

const formatJson = ref({})
const readConfig = (index: number) => {
  drawer.value = !drawer.value
  // formatJson.value = jsonStringifyPrettyCompact(JSON.stringify(configStore.createData))
  // const formatted = prettier.format(JSON.stringify(configStore.createData), {
  //   parser: 'babel',
  //   plugins: [parserBabel], // 根据需要添加
  //   semi: true,
  //   trailingComma: 'all',
  //   singleQuote: true,
  //   printWidth: 80,
  //   tabWidth: 2
  // })

  // formatJson.value = formatted
  // formatJson.value = `<pre>${stringify(configStore.createData, { maxLength: 80 }).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
}

// 同步当前选中项
const handleFormItemClick = (item: any, index: number) => {
  configStore.currentEditConfigItem = item
  configStore.currentItem = index
}

function dragStart(index: number) {
  draggingIndex.value = index
}

const dragOver = (event, index) => {
  if (dropIndex.value !== index) {
    throttledDragOver(event, index)
  }
}

function drop(targetIndex: number) {
  if (draggingIndex.value !== null && draggingIndex.value !== targetIndex) {
    const itemToMove = configStore.createData.comList.splice(draggingIndex.value, 1)[0]
    if (targetIndex > draggingIndex.value) {
      targetIndex -= 1 // 因为已经从数组中移除了元素，所以索引减一
    }
    configStore.createData.comList.splice(targetIndex, 0, itemToMove)
  }
  // draggingIndex.value = null
  // dropIndex.value = null
  clearStates()
}

// 只在拖拽结束时清理状态
const clearStates = () => {
  // setTimeout(() => {
  throttledDragOver.cancel()
  dropIndex.value = null
  draggingIndex.value = null
  // },3000)
}

function dragLeave(index: number) {
  // console.log('dragLeave', index)
  if (dropIndex.value === index) {
    // dropIndex.value = null
  }
}

function dragEnd() {
  console.log('dragEnd')
  clearStates()
}
const throttledDragOver = throttle((event, index) => {
  // event.preventDefault()
  // const targetRect = event.target.getBoundingClientRect()
  // const middleY = targetRect.top + targetRect.height / 2

  // if (event.clientY < middleY) {
  //   dropIndex.value = index
  // } else {
  //   dropIndex.value = index + 1
  // }
  dropIndex.value = index
}, 300)

// 添加模板
const addFormModel = (item: any) => {
  loading.value = true
  console.log('addFormModel', item)

  // item.baseInfo.comId = `${item.baseInfo.comId}_${index}`
  setTimeout(() => {
    const cloneData = JSON.parse(JSON.stringify(item)) // 这里需要深拷贝模板数据
    configStore.createData = cloneData
    configStore.createData.baseInfo.comId = `${cloneData.baseInfo.comId}_copy_1`
  }, 0)
  setTimeout(() => {
    loading.value = false
  }, 800)
}

// 清空编辑区
const clearFormModel = (item: any) => {
  visible.value = false
  configStore.createData.comList = []
  configStore.currentEditConfigItem = null
}

// 添加控件
const addFormItem = (item: any) => {
  configStore.createData.comList.push(item)
}

// 删除控件
const removeFormModelItem = (index: number) => {
  configStore.currentItem = index
  configStore.createData.comList.splice(index, 1)
}

// 统一布局方式
const handleLayoutModeChange = (val: any) => {
  console.log(val)
  configStore.createData.baseInfo.column = val
  configStore.createData.comList.forEach((item: any, index: number) => {
    item.column = val
  })
}

// 页面列数
const handleColumnsChange = (val: any) => {
  configStore.createData.comList.forEach((item: any, index: number) => {
    item.column = val
  })
  console.log('列数：', Math.ceil(24 / val))
}

// 控件之间的上下间距
const handleSpacingChange = (val: any) => {
  // configStore.columns = val
  configStore.createData.comList.forEach((item: any, index: number) => {
    item.spacing = val
  })
}

// 列间距
const handleGutterChange = (val: any) => {
  configStore.createData.baseInfo.gutter = val
}

// 标签对齐方式
const handleLabelPositionChange = (val: any) => {
  console.log(val)
  configStore.createData.baseInfo.labelPosition = val
}

// 控件大小
const handleFormSizeChange = (val: any) => {
  console.log(val)
  configStore.createData.baseInfo.formSize = val
}

// 重置预览区表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const objMap: any = {
  string: '',
  number: 0,
  array: [],
  object: {}
}
const comMap: any = {
  input: 'el-input',
  select: 'el-select',
  radio: 'el-radio',
  checkbox: 'el-checkbox',
  date: 'el-date-picker',
  upload: 'el-upload',
  switch: 'el-switch',
  slider: 'el-slider',
  rate: 'el-rate',
  color: 'el-color-picker'
}
// const componentFiles: any = import.meta.glob('./components/*.vue')
console.log('import.meta', import.meta)
// 动态加载表单组件库
const componentFiles: Record<string, () => Promise<any>> = import.meta.glob(
  './FormComponents/*.vue'
)
const components = () => {
  const obj: any = {}
  configStore.formConfig.forEach((item: any) => {
    obj[item.comName] = defineAsyncComponent(componentFiles[`./FormComponents/${item.comName}.vue`])
    outputForm[item.key] = objMap[item.dataType] // 数据初始化
  })
  return obj
}
const myComponents = components()

// 动态加载编辑器组件库
const componentEditFiles: Record<string, () => Promise<any>> = import.meta.glob(
  './EditComponents/*.vue'
)
const componentsEdit = () => {
  const obj: any = {}
  configStore.editConfig.forEach((item: any) => {
    obj[item.comName] = defineAsyncComponent(
      componentEditFiles[`./EditComponents/${item.comName}.vue`]
    )
    // outputForm[item.key] = objMap[item.dataType] // 数据初始化
  })
  return obj
}
const myComponentsEdit = componentsEdit()
console.log('myComponentsEdit', myComponentsEdit)

// function resolveComponent(name) {
//   return components[name]
// }

// watch(
//   () => outputForm,
//   (newValue, oldValue) => {
//     console.log(`outputForm.================ ${oldValue} to ${newValue}`)
//   }
// )

// watchEffect(() => {
//   console.log(`watchEffect.================ `, outputForm)
// })

function updateMethod(val: any, key: string, data: any) {
  console.log('updateMethod-------------:', val, key, data)
  console.log('outputForm===', outputForm)

  if (data.comType === 'selectgroup') {
    for (let index = data.nodeLevel; index < Object.keys(data.related).length; index++) {
      outputForm[data.related[String(index + 1)]] = ''
    }
    customOptions(data, val)
  }
}

const treeData = reactive<any>({
  orgTree: [],
  cityTree: []
  // orgTree1: [],
  // orgTree2: [],
  // orgTree3: []
})

function customOptions(item: any, value: any) {
  if (!treeData[item.optionKey].length) {
    return
  }
  if (item.comType === 'selectgroup') {
    if (item.nodeLevel === 1) {
      treeData[`${item.optionKey}${item.nodeLevel}`] = treeData[item.optionKey]
    }
    const temp = treeData[`${item.optionKey}${item.nodeLevel}`]?.find(
      (ops: any) => ops.id === value
    )
    if (temp && temp.children) {
      treeData[`${item.optionKey}${item.nodeLevel + 1}`] = temp.children
      outputForm[item.key] = value
    }
    return treeData[`${item.optionKey}${item.nodeLevel}`]
  } else {
    return treeData[item.optionKey]
  }
}

function findItemByKey(options: any, key: string, match: string) {
  // 遍历每一个选项
  for (const option of options) {
    // 检查当前选项是否匹配
    if (option[key] === match) {
      return option
    }
    // 如果当前选项有子项，递归查找子项
    if (option.children) {
      const found: any = findItemByKey(option.children, key, match)
      if (found) return found
    }
  }
  return null // 如果没有找到匹配项，返回null
}

function findListByKey(options: any, key: string, match: string, depth = 0) {
  // 遍历每一个选项
  for (const option of options) {
    // 检查当前选项是否匹配
    if (option[key] === match) {
      return { item: option, depth }
    }
    // 如果当前选项有子项，递归查找子项
    if (option.children) {
      const found: any = findListByKey(option.children, key, match, depth + 1)
      if (found) return found
    }
  }
  return null // 如果没有找到匹配项，返回null
}

const getUserData = async () => {
  const res: any = await fetchUserData()
  Object.entries(res).forEach(([key, value]) => {
    outputForm[key] = value
  })
}

const getOrgTree = async () => {
  const OrgTree: any = await fetchOrgTree()
  treeData.orgTree = OrgTree
  // treeData.orgTree1 = OrgTree
}

const getCityTree = async () => {
  const cityTree: any = await fetchCityTree()
  treeData.cityTree = cityTree
}

onMounted(() => {
  document.title = '动态表单引擎'
  // getUserData()
  getOrgTree()
  getCityTree()
  configStore.currentEditConfigItem = configStore.createData.comList[0]
})
</script>

<style scoped lang="scss">
.dropbg {
  position: relative;
  background: repeating-linear-gradient(
    315deg,
    #d3d3d3,
    #d3d3d3 20px,
    transparent 20px,
    transparent 40px
  );
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  p {
    padding: 10px 20px;
    background-color: rgba($color: #fff, $alpha: 1);
    border-radius: 5px;
  }
}
.formbg {
  position: relative;
  height: calc(100vh - 80px);
  padding: 30px 60px;
  @extend .checkered;
  .formContent {
    position: relative;
    background-color: #fff;
    min-height: calc(80vh - 0px);
    padding: 30px 50px;
  }
  .formItems {
    cursor: move;
    transition: transform 0.5s ease;
  }
}
.deleteBtn {
  position: absolute;
  right: 14px;
  top: 6px;
  display: none;
}

$primary-color: #f7f7f7;
.checkered {
  background-size: 50px 50px;
  background-image: gradient(
      linear,
      0 0,
      100% 100%,
      color-stop(0.25, $primary-color),
      color-stop(0.25, transparent),
      to(transparent)
    ),
    gradient(
      linear,
      0 100%,
      100% 0,
      color-stop(0.25, $primary-color),
      color-stop(0.25, transparent),
      to(transparent)
    ),
    gradient(
      linear,
      0 0,
      100% 100%,
      color-stop(0.75, transparent),
      color-stop(0.75, $primary-color)
    ),
    gradient(
      linear,
      0 100%,
      100% 0,
      color-stop(0.75, transparent),
      color-stop(0.75, $primary-color)
    );
  background-image: linear-gradient(45deg, $primary-color 25%, transparent 25%, transparent),
    linear-gradient(-45deg, $primary-color 25%, transparent 25%, transparent),
    linear-gradient(45deg, transparent 75%, $primary-color 75%),
    linear-gradient(-45deg, transparent 75%, $primary-color 75%);
}

.dragging {
  z-index: 1000;
  opacity: 0.5;
  border: 2px solid black;
}

.drop-over:not(.dragging) {
  border: 2px dashed #f00;
  &::before {
    content: '';
    position: absolute;
    border-radius: 5px;
    background-color: #f00;
    animation: ani_flicker 0.8s 0s infinite;
    top: 0;
    left: -10px;
    width: 5px;
    height: 100%;
  }
  &.focus_left,
  &.focus_right {
    &::before {
      top: 0;
      left: -10px;
      width: 5px;
      height: 100%;
    }
  }
  &.focus_top {
    &::before {
      top: -10px;
      left: 0;
      width: 100%;
      height: 5px;
    }
  }
}
@keyframes ani_flicker {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.1;
  }
}

.list-move {
  transition: transform 0.8s ease;
}

.list-enter-active,
.list-leave-active {
  z-index: 1000;
  transition: all 0.5s ease;
}

.list-enter, .list-leave-to /* .list-leave-active in <2.1.8 */ {
  transform: translateY(20px);
  opacity: 0;
}
</style>
<style>
.mask-layer {
  right: 0 !important;
  width: 600px !important;
  left: auto !important;
}
</style>
