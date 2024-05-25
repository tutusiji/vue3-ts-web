<template>
  <div>
    <TransitionGroup name="form-transition" tag="div">
      <el-form
        ref="ruleFormRef"
        label-position="top"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        :size="formSize"
        status-icon
      >
        <component
          v-for="(item, index) in formConfig"
          :is="myComponents[item.comType]"
          :key="`${item.key}_${index}`"
          :data="item"
          :name="item.key"
        ></component>
      </el-form>
    </TransitionGroup>
  </div>
</template>

<script setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { formConfig } from '../../store/config'

interface RuleForm {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  type: string[]
  resource: string
  desc: string
}

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  location: '',
  type: [],
  resource: '',
  desc: '',
})


const componentName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// const components = {
//   TextInput: defineAsyncComponent(() => import('./components/TextInput.vue')),
//   NumberInput: defineAsyncComponent(() => import('./components/NumberInput.vue'))
// };

const componentFiles = import.meta.glob('./components/*.vue')

const components = () => {
  const obj = {}
  formConfig.forEach((item) => {
    obj[item.comType] = defineAsyncComponent(componentFiles[`./components/${item.comType}.vue`])
  })
  return obj
}
const myComponents = components()
console.log(myComponents)

function resolveComponent(name) {
  return components[name]
}
</script>
