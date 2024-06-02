<template>
  <div class="p-10">
    <el-form-item label="标签位置">
      <el-radio-group v-model="labelPosition" @change="handleLabelPositionChange">
        <el-radio-button value="top">上</el-radio-button>
        <el-radio-button value="left">左</el-radio-button>
        <el-radio-button value="right">右</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="组件排列">
      <el-slider v-model="column" :min="0" :max="100" show-input @change="handleColumnsChange" />
    </el-form-item>

    <el-form ref="form" :model="form" label-width="auto" :label-position="labelPosition">
      <transition-group name="list" tag="ul" class="draggable-list">
        <li
          v-for="(field, index) in formFields"
          :key="field.id"
          :class="[
            'draggable-item',
            draggingIndex === index && 'dragging',
            dropIndex === index && 'drop-over',
            `focus_${labelPosition}`
          ]"
          :style="{
            width: `${column}%`
          }"
          draggable="true"
          @dragstart="dragStart(index)"
          @dragover.prevent="dragOver($event, index)"
          @dragleave="dragLeave(index)"
          @drop="drop(index)"
          @dragend="dragEnd"
        >
          <el-form-item :label="field.label">
            <component
              :is="field.component"
              v-model="form[field.model]"
              :placeholder="'Enter ' + field.label"
            ></component>
          </el-form-item>
        </li>
      </transition-group>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElInput, ElSelect, ElDatePicker } from 'element-plus'
import { throttle, debounce } from 'lodash'

export default defineComponent({
  name: 'DraggableForm',
  components: {
    ElInput,
    ElSelect,
    ElDatePicker
  },
  setup() {
    const form = ref({
      name: '',
      age: null,
      date: ''
    })
    const formFields = ref([
      { id: 1, label: '姓名', model: 'name', component: 'ElInput' },
      { id: 2, label: '年龄', model: 'age', component: 'ElInput' },
      { id: 3, label: '出生日期', model: 'dob', component: 'ElDatePicker' },
      { id: 4, label: '电子邮件', model: 'email', component: 'ElInput' },
      { id: 5, label: '开始日期', model: 'startDate', component: 'ElDatePicker' },
      { id: 6, label: '电话号码', model: 'phoneNumber', component: 'ElInput' },
      { id: 7, label: '结束日期', model: 'endDate', component: 'ElDatePicker' },
      { id: 8, label: '城市', model: 'city', component: 'ElInput' },
      { id: 9, label: '入学日期', model: 'enrollmentDate', component: 'ElDatePicker' },
      { id: 10, label: '国家', model: 'country', component: 'ElInput' },
      { id: 11, label: '毕业日期', model: 'graduationDate', component: 'ElDatePicker' },
      { id: 12, label: '地址', model: 'address', component: 'ElInput' },
      { id: 13, label: '预约日期', model: 'appointmentDate', component: 'ElDatePicker' },
      { id: 14, label: '邮政编码', model: 'zipCode', component: 'ElInput' },
      { id: 15, label: '雇佣日期', model: 'hireDate', component: 'ElDatePicker' },
      { id: 16, label: '薪资', model: 'salary', component: 'ElInput' },
      { id: 17, label: '辞职日期', model: 'resignationDate', component: 'ElDatePicker' },
      { id: 18, label: '会员资格', model: 'membership', component: 'ElInput' },
      { id: 19, label: '到期日期', model: 'expirationDate', component: 'ElDatePicker' }
    ])

    let draggingIndex = ref<number | null>(null) // 正在拖拽的元素的索引
    let dropIndex = ref<number | null>(null) // 拖拽元素释放时所在的索引
    let labelPosition = ref<string>('left') // 拖拽元素释放时所在的索引
    let column = ref<number>(20) // 页面列数

    // 标签对齐方式
    const handleLabelPositionChange = (val: string) => {
      console.log(val)
      // labelPosition.value = val
    }

    // 页面列数
    const handleColumnsChange = (val: any) => {
      column.value = val
      console.log('列数：', Math.ceil(24 / val))
    }

    function dragStart(index: number) {
      draggingIndex.value = index
    }

    const throttledDragOver = throttle((event, index) => {
      // event.preventDefault()
      // const targetRect = event.target.getBoundingClientRect()
      // const middleY = targetRect.top + targetRect.height / 2

      // if (event.clientY < middleY) {
      //   dropIndex.value = index
      // } else {
      //   dropIndex.value = index + 1
      // }
      dropIndex.value = index
    }, 300)

    const dragOver = (event, index) => {
      if (dropIndex.value !== index) {
        throttledDragOver(event, index)
      }
    }

    function drop(targetIndex: number) {
      if (draggingIndex.value !== null && draggingIndex.value !== targetIndex) {
        const itemToMove = formFields.value.splice(draggingIndex.value, 1)[0]
        if (targetIndex > draggingIndex.value) {
          targetIndex -= 1 // 因为已经从数组中移除了元素，所以索引减一
        }
        formFields.value.splice(targetIndex, 0, itemToMove)
      }
      // draggingIndex.value = null
      // dropIndex.value = null
      clearStates()
    }

    // 只在拖拽结束时清理状态
    const clearStates = () => {
      // setTimeout(() => {
        throttledDragOver.cancel()
        dropIndex.value = null
        draggingIndex.value = null
      // },3000)
    }

    function dragLeave(index: number) {
      // console.log('dragLeave', index)
      if (dropIndex.value === index) {
        // dropIndex.value = null
      }
    }

    function dragEnd() {
      console.log('dragEnd')
      clearStates()
    }

    return {
      form,
      formFields,
      dragStart,
      dragOver,
      dragLeave,
      drop,
      dragEnd,
      draggingIndex,
      dropIndex,
      labelPosition,
      handleLabelPositionChange,
      handleColumnsChange,
      column
    }
  }
})
</script>
<style>
.el-form-item .el-form-item__label {
  cursor: move;
}
.draggable-list {
  list-style: none;
  padding: 0;
}

.draggable-item {
  position: relative;
  display: inline-block;
  width: 100%;
  margin: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: move;
  transition: transform 0.5s ease;
}

.dragging {
  z-index: 1000;
  opacity: 0.5;
  border: 2px solid black;
}

.drop-over:not(.dragging) {
  border: 2px dashed #f00;
  &::before {
    content: '';
    position: absolute;
    border-radius: 5px;
    background-color: #f00;
    animation: ani_flicker 0.8s 0s infinite;
  }
  &.focus_left,
  &.focus_right {
    &::before {
      top: 0;
      left: -10px;
      width: 5px;
      height: 100%;
    }
  }
  &.focus_top {
    &::before {
      top: -10px;
      left: 0;
      width: 100%;
      height: 5px;
    }
  }
}
@keyframes ani_flicker {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.1;
  }
}

.list-move {
  z-index: 1000;
  transition: transform 1.5s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter, .list-leave-to /* .list-leave-active in <2.1.8 */ {
  transform: translateY(20px);
  opacity: 0;
}
</style>
