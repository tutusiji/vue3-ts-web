<template>
  <el-form
    ref="ruleFormRef"
    label-position="top"
    :model="ruleForm"
    label-width="auto"
    class="demo-ruleForm p-10"
    :size="formSize"
    status-icon
  >
    <el-row :gutter="20">
      <el-col
        :span="item.column"
        v-for="(item, index) in configData"
        :key="`${item.key}_${index}`"
        class="formItem my-3"
      >
        <component
          :is="myComponents[item.comName]"
          :data="item"
          :model-value="ruleForm[item.key]"
          :option-source="
            item.optionKey &&
            (item.optionKey === 'default' ? item.options : customOptions(item, ruleForm[item.key]))
          "
          @update:modelValue="(value: any) => (ruleForm[item.key] = value)"
          @custom-event="updateMethod"
        >
        </component>
      </el-col>
    </el-row>
    <el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button>
      <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { formConfig } from './config'
import { fetchUserData, fetchOrgTree, fetchCityTree } from './request'

interface RuleForm {
  // name: string
  // level: string
  // phone: number
  // desc: string
}

const formSize = ref<ComponentSize>('large')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<any>({})

const configData = ref(formConfig)

const submitForm = async (formEl: FormInstance | undefined) => {
  console.log('submitForm', ruleForm)
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
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
  formConfig.forEach((item) => {
    obj[item.comName] = defineAsyncComponent(componentFiles[`./components/${item.comName}.vue`])
    ruleForm[item.key] = objMap[item.dataType]
  })
  return obj
}
const myComponents = components()

// function resolveComponent(name) {
//   return components[name]
// }

// watch(
//   () => ruleForm,
//   (newValue, oldValue) => {
//     console.log(`ruleForm.================ ${oldValue} to ${newValue}`)
//   }
// )

// watchEffect(() => {
//   console.log(`watchEffect.================ `, ruleForm)
// })

function updateMethod(val: any, key: string, data: any) {
  console.log('updateMethod-------------:', val, key, data)
  console.log('ruleForm===', ruleForm)

  if (data.comType === 'selectgroup') {
    for (let index = data.nodeLevel; index < Object.keys(data.related).length; index++) {
      ruleForm[data.related[String(index + 1)]] = ''
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
    const temp = treeData[`${item.optionKey}${item.nodeLevel}`].find((ops:any) => ops.id === value)
    if (temp && temp.children) {
      treeData[`${item.optionKey}${item.nodeLevel + 1}`] = temp.children
      ruleForm[item.key] = value
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
    ruleForm[key] = value
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
  getUserData()
  getOrgTree()
  getCityTree()
})
</script>

<style scoped lang="scss">
.formItem {
  padding: 10px;
  margin: 10px;
  background-color: #f1f1f1;
}
</style>
