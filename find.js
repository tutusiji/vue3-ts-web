<template>
  <div>
    <el-cascader
      ref="cascader"
      :options="options"
      filterable
      :filter-method="customFilter"
      :before-filter="handleBeforeFilter"
      @blur="handleBlur"
      placeholder="尝试搜索：指南"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElCascader } from 'element-plus'

const cascaderRef = ref<InstanceType<typeof ElCascader>>()
const userInput = ref('')
function customFilter(query, item, path) {
  return path.some((option) => option.label.toLowerCase().includes(item.toLowerCase()))
}

function handleBeforeFilter(item) {
  userInput.value = item
  return true
}

function handleBlur() {
  console.log('失焦时的用户输入:', userInput.value)
  if (cascaderRef.value) {
    cascaderRef.value.inputValue = userInput.value // 尝试在组件失焦时恢复用户输入
  }
}
const props = {
  multiple: true
}

const options = [
  {
    value: 'guide',
    label: 'Guide',
    children: [
      {
        value: 'disciplines',
        label: 'Disciplines',
        children: [
          {
            value: 'consistency',
            label: 'Consistency'
          },
          {
            value: 'feedback',
            label: 'Feedback'
          },
          {
            value: 'efficiency',
            label: 'Efficiency'
          },
          {
            value: 'controllability',
            label: 'Controllability'
          }
        ]
      },
      {
        value: 'navigation',
        label: 'Navigation',
        children: [
          {
            value: 'side nav',
            label: 'Side Navigation'
          },
          {
            value: 'top nav',
            label: 'Top Navigation'
          }
        ]
      }
    ]
  },
  {
    value: 'component',
    label: 'Component',
    children: [
      {
        value: 'basic',
        label: 'Basic',
        children: [
          {
            value: 'layout',
            label: 'Layout'
          },
          {
            value: 'color',
            label: 'Color'
          },
          {
            value: 'typography',
            label: 'Typography'
          },
          {
            value: 'icon',
            label: 'Icon'
          },
          {
            value: 'button',
            label: 'Button'
          }
        ]
      },
      {
        value: 'form',
        label: 'Form',
        children: [
          {
            value: 'radio',
            label: 'Radio'
          },
          {
            value: 'checkbox',
            label: 'Checkbox'
          },
          {
            value: 'input',
            label: 'Input'
          },
          {
            value: 'input-number',
            label: 'InputNumber'
          },
          {
            value: 'select',
            label: 'Select'
          },
          {
            value: 'cascader',
            label: 'Cascader'
          },
          {
            value: 'switch',
            label: 'Switch'
          },
          {
            value: 'slider',
            label: 'Slider'
          },
          {
            value: 'time-picker',
            label: 'TimePicker'
          },
          {
            value: 'date-picker',
            label: 'DatePicker'
          },
          {
            value: 'datetime-picker',
            label: 'DateTimePicker'
          },
          {
            value: 'upload',
            label: 'Upload'
          },
          {
            value: 'rate',
            label: 'Rate'
          },
          {
            value: 'form',
            label: 'Form'
          }
        ]
      },
      {
        value: 'data',
        label: 'Data',
        children: [
          {
            value: 'table',
            label: 'Table'
          },
          {
            value: 'tag',
            label: 'Tag'
          },
          {
            value: 'progress',
            label: 'Progress'
          },
          {
            value: 'tree',
            label: 'Tree'
          },
          {
            value: 'pagination',
            label: 'Pagination'
          },
          {
            value: 'badge',
            label: 'Badge'
          }
        ]
      },
      {
        value: 'notice',
        label: 'Notice',
        children: [
          {
            value: 'alert',
            label: 'Alert'
          },
          {
            value: 'loading',
            label: 'Loading'
          },
          {
            value: 'message',
            label: 'Message'
          },
          {
            value: 'message-box',
            label: 'MessageBox'
          },
          {
            value: 'notification',
            label: 'Notification'
          }
        ]
      },
      {
        value: 'navigation',
        label: 'Navigation',
        children: [
          {
            value: 'menu',
            label: 'Menu'
          },
          {
            value: 'tabs',
            label: 'Tabs'
          },
          {
            value: 'breadcrumb',
            label: 'Breadcrumb'
          },
          {
            value: 'dropdown',
            label: 'Dropdown'
          },
          {
            value: 'steps',
            label: 'Steps'
          }
        ]
      },
      {
        value: 'others',
        label: 'Others',
        children: [
          {
            value: 'dialog',
            label: 'Dialog'
          },
          {
            value: 'tooltip',
            label: 'Tooltip'
          },
          {
            value: 'popover',
            label: 'Popover'
          },
          {
            value: 'card',
            label: 'Card'
          },
          {
            value: 'carousel',
            label: 'Carousel'
          },
          {
            value: 'collapse',
            label: 'Collapse'
          }
        ]
      }
    ]
  },
  {
    value: 'resource',
    label: 'Resource',
    children: [
      {
        value: 'axure',
        label: 'Axure Components'
      },
      {
        value: 'sketch',
        label: 'Sketch Templates'
      },
      {
        value: 'docs',
        label: 'Design Documentation'
      }
    ]
  }
]

function findItemByValueOrLabel(options, key, match) {
    // 遍历每一个选项
    for (const option of options) {
        // 检查当前选项是否匹配
        if (option.value === match || option.label === match) {
            return option;
        }
        // 如果当前选项有子项，递归查找子项
        if (option.children) {
            const found = findItemByValueOrLabel(option.children, key, match);
            if (found) return found;
        }
    }
    return null; // 如果没有找到匹配项，返回null
}

const result = findItemByValueOrLabel(options, 'label', 'Disciplines');
console.log(result);

function findAllItemsByValueOrLabel(options, match) {
    let matches = [];  // 初始化一个空数组用于存储所有匹配的项目

    // 定义一个递归函数来遍历和检查每一个选项
    function searchItems(items) {
        for (const item of items) {
            // 使用.includes()方法检查当前选项的value或label是否包含match文本
            if (item.value.includes(match) || item.label.includes(match)) {
                matches.push(item);  // 如果匹配，添加到结果数组中
            }
            // 如果有子项，递归搜索子项
            if (item.children) {
                searchItems(item.children);
            }
        }
    }

    searchItems(options);  // 开始递归搜索

    return matches;  // 返回包含所有匹配项的数组
}
const resultsall = findAllItemsByValueOrLabel(options, 'e');
console.log(resultsall);

</script>
