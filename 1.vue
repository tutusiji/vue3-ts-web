<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      default-expand-all
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :label="col.label"
        :sortable="col.sortable"
      >
        <template #default="scope" v-if="col.prop === 'date'">
          <el-checkbox
            v-if="!scope.row.parentId"
            v-model="scope.row.checked"
            @change="() => checkboxChanged(scope.row)"
            :label="scope.row[col.prop]"
          ></el-checkbox>
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>

        <template #default="scope" v-else>
          <span>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>

      <!-- Last column with text links for actions -->
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button href="#" @click="editItem(scope.row)">Edit</el-button>
          <el-button href="#" @click="deleteItem(scope.row)" style="margin-left: 10px"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface User {
  id: number
  date: string
  name: string
  address: string
  parentId?: number
  hasChildren?: boolean
  children?: User[]
  checked?: boolean
}

const tableData = ref<User[]>([
  {
    id: 1,
    parentId: 1,
    checked: false,
    date: '2016-05-02',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    id: 2,
    parentId: 2,
    date: '2016-05-04',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    id: 3,
    parentId: 3,
    date: '2016-05-01',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
    children: [
      {
        id: 31,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
        children: [
          {
            id: 53,
            date: '2016-05-01',
            name: 'wangxiaoh111111u',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: 54,
            date: '2016-05-011111',
            name: 'wangxi1111aohu',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: 32,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  },
  {
    id: 4,
    parentId: 4,
    date: '2016-05-03',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles'
  }
])

const columns = ref([
  { prop: 'date', label: 'Date', sortable: true },
  { prop: 'name', label: 'Name', sortable: true },
  { prop: 'address', label: 'Address', sortable: true }
])

function checkboxChanged(item: User) {
  // Toggle children's checked state recursively
  const toggleChildrenChecked = (children: User[], checked: boolean) => {
    if (children && children.length) {
      children.forEach((child) => {
        child.checked = checked
        toggleChildrenChecked(child.children, checked)
      })
    }
  }

  toggleChildrenChecked(item.children, item.checked)

  // Adjust parent's checked state
  const updateParentChecked = (currentItem: User) => {
    const parentItem = findParent(currentItem, tableData.value)
    if (parentItem) {
      parentItem.checked = parentItem.children?.every((child) => child.checked)
      updateParentChecked(parentItem)
    }
  }

  updateParentChecked(item)
}

function findParent(childItem: User, allData: User[]): User | undefined {
  for (let item of allData) {
    if (item.children?.some((child) => child.id === childItem.id)) {
      return item
    } else if (item.children) {
      const deeperParent = findParent(childItem, item.children)
      if (deeperParent) return deeperParent
    }
  }
  return undefined
}

function editItem(item: User) {
  console.log('Edit item:', item)
}

function deleteItem(item: User) {
  console.log('Delete item:', item)
}

function handleSelectionChange(selectedItems: User[]) {
  console.log('Selected items:', selectedItems)
}
</script>
给date的表头加一个全选的复选框，点击选择全部，再点击取消全部