<template>
  <el-form-item :label="`${data.label}`" :rules="data.rules" :prop="data.key">
    <el-input-number
      v-model="internalValue"
      :min="data.min"
      :max="data.max"
    />
  </el-form-item>
</template>

<script setup>
const props = defineProps({
  data: Object,
  modelValue: [String, Number, Array]
})

const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
