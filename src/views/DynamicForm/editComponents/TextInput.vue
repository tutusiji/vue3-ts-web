<template>
  <el-form-item label="标题" :prop="data.label">
    <el-input v-model="configStore.createData.comList[props.index].label" clearable> </el-input>
  </el-form-item>
  <el-form-item label="备注" :prop="data.remark">
    <el-input v-model="configStore.createData.comList[props.index].remark" clearable> </el-input>
  </el-form-item>
  <el-form-item label="占位符文" :prop="data.placeholder">
    <el-input v-model="configStore.createData.comList[props.index].placeholder" clearable> </el-input>
  </el-form-item>
  <el-form-item label="字数限制" :prop="data.key">
    <el-input-number v-model="configStore.createData.comList[props.index].length" :min="1" :max="100" @change="handleChange" />
  </el-form-item>
  <el-form-item>
    <el-collapse class="w-[100%]">
      <el-collapse-item title="校验规则" name="1">
        <el-form-item label="是否必填" :prop="data.key">
          <el-switch v-model="configStore.createData.comList[props.index].required" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="错误提示">
          <el-input v-model="rules" clearable> </el-input>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </el-form-item>
</template>

<script setup>
import { useConfigStore } from '@/store/configStore'
const configStore = useConfigStore()

const num = ref(100)
const value = ref(true)

const props = defineProps({
  data: Object,
  modelValue: [String, Number, Array],
  index: Number
})
console.log(props)

const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})




</script>
