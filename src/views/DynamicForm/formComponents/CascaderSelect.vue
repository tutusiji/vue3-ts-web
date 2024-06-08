<template>
  <div>
    <!-- 为存在子级的选择显示下拉框 -->
    <el-select
      v-for="(levelOptions, index) in computedLevels"
      :key="index"
      v-model="selectedValues[index]"
      placeholder="请选择"
      @change="() => handleSelectChange(index)"
    >
      <el-option
        v-for="option in levelOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import type { CascaderOption } from '@/views/types'

export default defineComponent({
  name: 'CascaderSelect',
  props: {
    options: {
      type: Array as () => CascaderOption[],
      required: true
    },
    initValues: {
      type: Array as () => string[], // 初始选中值数组
      default: () => []
    }
  },
  setup(props) {
    const selectedValues = ref<string[]>(props.initValues) // 使用初始值

    const computedLevels = computed(() => {
      let levels = []
      let currentOptions = props.options

      // 根据selectedValues来确定每个级别的选项
      for (let i = 0; i < selectedValues.value.length; i++) {
        levels.push(currentOptions)
        const selectedOption = currentOptions.find(
          (option) => option.value === selectedValues.value[i]
        )
        if (!selectedOption || !selectedOption.children || selectedOption.children.length === 0) {
          // break;
          return levels // 返回当前已经确认的级别列表
        }
        currentOptions = selectedOption.children
      }

      // 如果最后一个选中的选项仍有子选项，添加这个级别
      if (currentOptions.length > 0 && levels.length === selectedValues.value.length) {
        levels.push(currentOptions)
      }

      return levels
    })

    const handleSelectChange = (index: number) => {
      selectedValues.value = selectedValues.value.slice(0, index + 1)
    }

    // 监听初始值变化并更新选中值
    watch(
      () => props.initValues,
      (newVal) => {
        selectedValues.value = [...newVal]
      },
      { immediate: true }
    )

    return {
      selectedValues,
      computedLevels,
      handleSelectChange
    }
  }
})
</script>
