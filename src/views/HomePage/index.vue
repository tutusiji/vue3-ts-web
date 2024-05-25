<template>
  <el-row class="h-[100vh] overflow-hidden">
    <el-col :span="4" class="p-1 bg-green-300">
      <el-card class="w-[100%]">
        <template #header>
          <div class="card-header">
            <div class="card-header flex items-center justify-between">
              <span>表单控件选择区</span>
              <el-button @click="reloadForm">更新</el-button>
            </div>
          </div>
        </template>
        <div class="h-[calc(100vh-86px)] overflow-x-hidden overflow-y-auto">
          <div
            v-for="item in configStore.modelsData"
            :key="item.label"
            class="flex items-center w-[100%] hover:bg-violet-100 cursor-pointer p-2 rounded-md"
            shadow="hover"
            @click="addFormModel(item)"
          >
            <el-icon class="mr-2"><Document /></el-icon>{{ item.label }}
          </div>
          <ul>
            <li v-for="item in configStore.formConfig" :key="item.label" class="p-2">
              <el-button @click="addFormItem(item)">{{ item.label }}</el-button>
            </li>
          </ul>
        </div>
      </el-card>
    </el-col>
    <el-col :span="7" class="p-1 bg-violet-300">
      <!-- <el-row class="bg-[#fff] mb-3">
        <el-card class="dropbg h-[200px] w-[100%] flex items-center justify-center">
          <p class="p-3">拖拽组件到这里</p>
        </el-card>
      </el-row> -->
      <el-row>
        <el-card class="w-[100%]">
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
                    <el-button type="danger" @click="visible = true">清空页面配置</el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </template>
          <div class="h-[calc(100vh-86px)] overflow-x-hidden overflow-y-auto">
            <el-form label-position="left" status-icon>
              <div class="text-[16px] mb-3 pb-3 border-b">基础信息配置</div>
              <el-form-item label="控件大小">
                <el-radio-group v-model="formSize">
                  <el-radio-button value="large">大</el-radio-button>
                  <el-radio-button value="default">中</el-radio-button>
                  <el-radio-button value="small">小</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="对齐方式">
                <el-radio-group v-model="labelPosition">
                  <el-radio-button value="top">上</el-radio-button>
                  <el-radio-button value="left">左</el-radio-button>
                  <el-radio-button value="right">右</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="布局方式">
                <div class="w-[100%] flex items-center justify-between">
                  <el-radio-group
                    v-model="layout"
                    aria-label="布局方式"
                    @change="handleLayoutChange"
                  >
                    <el-radio-button value="single">单列</el-radio-button>
                    <el-radio-button value="inline">多列</el-radio-button>
                  </el-radio-group>
                  <el-slider
                    v-if="layout === 'inline'"
                    v-model="columns"
                    :min="1"
                    :max="24"
                    show-input
                    style="width: 260px"
                    @change="handleColumnsChange"
                  />
                </div>
              </el-form-item>
              <el-form-item label="栅格间隔">
                <div class="w-[100%] flex justify-between flex-col">
                  <el-radio-group
                    v-model="gutter"
                    aria-label="栅格间隔"
                    @change="handleGutterChange"
                  >
                    <el-radio-button :label="0">无间隔</el-radio-button>
                    <el-radio-button :label="10">10px</el-radio-button>
                    <el-radio-button :label="20">20px</el-radio-button>
                    <el-radio-button :label="30">30px</el-radio-button>
                  </el-radio-group>
                  <el-slider v-model="gutter" :min="0" :max="100" show-input />
                </div>
              </el-form-item>
              <div class="text-[16px] mb-3 pb-3 border-b">控件编辑</div>
              <!-- <transition-group name="fade" mode="out-in"> -->
              <div
                v-for="(item, index) in configStore.data"
                :key="item.key + index"
                class="card border mb-4 p-2 rounded-lg hover:shadow-lg transition-shadow duration-300"
                shadow="hover"
                :class="[
                  configStore.currentItem === index && 'current border-black border-dashed',
                  ' my-3 rounded-lg'
                ]"
                @mouseover="handleMouseOver(index)"
                @mouseleave="handleMouseLeave()"
              >
                <div class="header flex items-center justify-end mb-4">
                  <span class="flex-1">{{ item.label }}</span>
                  <el-icon
                    class="cursor-pointer transition-transform hover:rotate-45 duration-300"
                    @click="removeFormModelItem(index)"
                    ><Delete
                  /></el-icon>
                </div>

                <component
                  :label="item.label"
                  :prop="item.key"
                  :rules="item.rules"
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
              </div>
              <!-- </transition-group> -->
            </el-form>
          </div>
        </el-card>
      </el-row>
    </el-col>
    <el-col :span="13" class="p-1 bg-blue-300">
      <el-card class="w-[100%]">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <span>表单页面预览区</span>
            <div>
              <el-button @click="readConfig">查看json配置</el-button>
              <el-button @click="saveFormConfig">保存为模板</el-button>
              <el-button @click="saveFormConfig">分享</el-button>
              <el-button type="primary" @click="saveFormConfig">保存</el-button>
              <el-button type="primary" @click="previewForm">预览</el-button>
            </div>
          </div>
        </template>
        <div class="h-[calc(100vh-86px)] overflow-x-hidden overflow-y-auto">
          <el-form
            ref="outputFormRef"
            :label-position="labelPosition"
            :model="outputForm"
            label-width="auto"
            class="demo-outputForm pl-3"
            :size="formSize"
            status-icon
          >
            <el-row :gutter="gutter">
              <el-col
                :span="Math.floor(24 / item.column)"
                v-for="(item, index) in configStore.data"
                :key="`${item.key}_${index}`"
                :class="[
                  configStore.currentItem === index && 'current',
                  'formItem my-3 rounded-lg'
                ]"
              >
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
            <el-form-item>
              <el-button type="primary" @click="submitForm(outputFormRef)"> Create </el-button>
              <el-button @click="resetForm(outputFormRef)">Reset</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
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
      <pre>{{ configStore.data }}</pre>
    </el-drawer>
  </el-row>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules, UploadFilled } from 'element-plus'
import type { FormProps } from 'element-plus'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import stringify from 'json-stringify-pretty-compact'

// import { formConfig, modelsData } from '../../store/config'
import { fetchUserData, fetchOrgTree, fetchCityTree } from './request'
const outputFormRef = ref<FormInstance>()
const formSize = ref<ComponentSize>('large') // '' | 'large' | 'default' | 'small'
import { useConfigStore } from '@/store/configStore'
const configStore = useConfigStore()
// configStore.formConfig = formConfig
// configStore.modelsData = modelsData
// const formList = ref<any>(formConfig) //表单控件列表
// const modelList = ref<any>(modelsData) //表单控件模版库列表
// const pagecConfigData = ref(formConfig)
// const pagecConfigData = ref(modelsData) //表单配置数据
const outputForm = reactive<any>([]) //用户输入的数据
const visible = ref(false)
const drawer = ref(false)
const layout = ref('inline')
const columns = ref(3)
const gutter = ref(20)
const labelPosition = ref<FormProps['labelPosition']>('top')

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

// 添加控件
const addFormItem = (item: any) => {
  configStore.data.push(item)
}
// 添加模板
const addFormModel = (item: any) => {
  configStore.data = item.data
}

// 清空编辑区
const clearFormModel = (item: any) => {
  visible.value = false
  configStore.data = []
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
}

const formatJson = ref({})
const readConfig = (index: number) => {
  drawer.value = !drawer.value
  // formatJson.value = jsonStringifyPrettyCompact(JSON.stringify(configStore.data))
  // const formatted = prettier.format(JSON.stringify(configStore.data), {
  //   parser: 'babel',
  //   plugins: [parserBabel], // 根据需要添加
  //   semi: true,
  //   trailingComma: 'all',
  //   singleQuote: true,
  //   printWidth: 80,
  //   tabWidth: 2
  // })

  // formatJson.value = formatted
  // formatJson.value = `<pre>${stringify(configStore.data, { maxLength: 80 }).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
}

const handleMouseOver = (index: number) => {
  configStore.currentItem = index
}
const handleMouseLeave = () => {
  configStore.currentItem = ''
}

// 删除控件
const removeFormModelItem = (index: number) => {
  configStore.currentItem = index
  configStore.data.splice(index, 1)
}

const handleLayoutChange = (val: any) => {
  console.log(val)
  configStore.data.forEach((item: any, index: number) => {
    item.column = val === 'single' ? 1 : columns.value
  })
  console.log('列数：', Math.ceil(24 / val))
}

const handleColumnsChange = (val: any) => {
  configStore.data.forEach((item: any, index: number) => {
    item.column = val
  })
  console.log('列数：', Math.ceil(24 / val))
}

const handleGutterChange = (val: any) => {
  // configStore.columns = val
}

const handleLabelPositionChange = (val: any) => {
  console.log(val)
  // configStore.labelPosition = val
  configStore.data.forEach((item: any, index: number) => {
    item.labelPosition = val
  })
}

const handleVisibleChange = (val: any) => {
  console.log(val)
  // configStore.visible = val
  configStore.data.forEach((item: any, index: number) => {
    item.visible = val
  })
}

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
// const componentFiles: any = import.meta.glob('./components/*.vue')
const componentFiles: Record<string, () => Promise<any>> = import.meta.glob('./components/*.vue')

const components = () => {
  const obj: any = {}
  configStore.formConfig.forEach((item: any) => {
    obj[item.comName] = defineAsyncComponent(componentFiles[`./components/${item.comName}.vue`])
    outputForm[item.key] = objMap[item.dataType] // 数据初始化
  })
  return obj
}
const myComponents = components()

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
  // getUserData()
  getOrgTree()
  getCityTree()
})
</script>

<style scoped lang="scss">
.formItem {
  // padding: 10px;
  // background-color: #f1f1f1;
  border: 1px dashed transparent;

  &.current {
    border: 1px dashed #000;
  }
}
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
</style>
<style>
.mask-layer {
  right: 0 !important;
  width: 600px !important;
  left: auto !important;
}
</style>
