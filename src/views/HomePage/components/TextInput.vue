<template>
  <el-form-item :label="`${data.label}(${data.comName})`" :rules="data.rules" :prop="data.key">
    <el-input
      v-if="data.comType === 'text' || data.comType === 'textarea'"
      v-model="internalValue"
      show-word-limit
      clearable
      :maxlength="data.length"
      :placeholder="data.placeholder"
      rows="5"
      :type="data.comType"
    >
      <template v-if="data.slotAppend" #append>元</template>
      <template v-if="data.slotPrepend" #prepend>Http://</template>
    </el-input>
    <el-input
      v-else-if="data.comType === 'number'"
      v-model.number="internalValue"
      type="text"
      show-word-limit
      clearable
      :maxlength="data.length"
      :placeholder="data.placeholder"
    >
      <template v-if="data.slotAppend" #append>元</template>
      <template v-if="data.slotPrepend" #prepend>Http://</template>
    </el-input>
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
