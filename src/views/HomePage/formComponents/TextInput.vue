<template>
  <el-form-item :label="`${data.label}`" :rules="data.rules" :prop="data.key">
    <div
      class="text-gray-400 text-xs mb-2"
      v-if="data.remark && configStore.createData.baseInfo.labelPosition === 'top'"
    >
      {{ data.remark }}
    </div>
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
    <template v-if="data.slotPrepend" #prepend>人民币</template>
      <template v-if="data.slotAppend" #append>元</template>
    </el-input>
    <div
      class="text-gray-400 text-xs mt-2"
      v-if="
        data.remark &&
        (configStore.createData.baseInfo.labelPosition === 'left' ||
        configStore.createData.baseInfo.labelPosition === 'right')
      "
    >
      {{ data.remark }}
    </div>
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
import { useConfigStore } from '@/store/configStore'
const configStore = useConfigStore()

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
