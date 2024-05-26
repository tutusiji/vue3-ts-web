<template>
  <el-form-item
    v-if="optionSource?.length"
    :label="`${data.label}`"
    :rules="data.rules"
    :prop="data.key"
  >
    <el-select
      v-model="internalValue"
      @change="(val) => handleChange(val, data.key, data)"
      :placeholder="data.placeholder"
    >
      <el-option
        v-for="option in optionSource"
        :label="option[data.propsKeys.label]"
        :value="option[data.propsKeys.value]"
        :key="option[data.propsKeys.value]"
      />
    </el-select>
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

// watch(
//   () => props.modelValue,
//   (newValue, oldValue) => {
//     console.log(`select.================`, newValue, oldValue)
//   }
// )

watchEffect(() => {
  if (props.data.comType === 'selectgroup') {
    console.log(`watchEffect.================ `, props.modelValue)
    // handleChange(props.modelValue, props.data.key, props.data)
  }
})
</script>
