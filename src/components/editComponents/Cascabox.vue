<template>
  <el-form-item :label="`${data.label}`" :rules="data.rules" :prop="data.key">
    <el-cascader
      v-model="internalValue"
      :options="optionSource"
      :props="data.propsKeys"
      :placeholder="data.placeholder"
      clearable
      class="w-[100%]"
      :show-all-levels="data.showAllLevels"
      @change="(val) => handleChange(val, data.key, data)"
    />
  </el-form-item>
</template>

<script setup>
const props = defineProps({
  data: Object,
  modelValue: [String, Number, Array],
  optionSource: [Array]
})

const emit = defineEmits(['update:modelValue', 'custom-event'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value, key, data) => {
  console.log('handleChange', value, key, data)

  emit('custom-event', value, key, data)
}
</script>
