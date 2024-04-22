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
      <!-- Date column with checkbox for select all -->
      <el-table-column label="Date" sortable>
        <template #header>
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="selectAllChecked"
            @change="toggleSelectAll"
            >Select All</el-checkbox
          >
        </template>
        <template #default="scope">
          <el-checkbox
            v-if="!scope.row.parentId"
            v-model="scope.row.checked"
            @change="() => checkboxChanged(scope.row)"
            style="margin-right: 8px"
          ></el-checkbox>
          {{ scope.row.date }}
        </template>
      </el-table-column>

      <!-- Other columns without checkboxes -->
      <el-table-column
        v-for="col in otherColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
      ></el-table-column>

      <!-- Actions column with links -->
      <el-table-column label="Actions">
        <template #default="scope">
          <a href="#" @click.prevent="editItem(scope)">Edit</a>
          <a href="#" @click.prevent="deleteItem(scope)" style="margin-left: 10px">Delete</a>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

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
        checked: false,
        address: 'No. 189, Grove St, Los Angeles',
        children: [
          {
            id: 53,
            date: '2016-05-01',
            checked: false,
            name: 'wangxiaoh111111u',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: 54,
            date: '2016-05-011111',
            checked: false,
            name: 'wangxi1111aohu',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: 32,
        checked: false,
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

const otherColumns = computed(() => {
  return columns.value.filter((col) => col.prop !== 'date')
})

const selectAllChecked = ref(false)
const isIndeterminate = ref(false)

function toggleSelectAll(checked: boolean) {
  tableData.value.forEach((row) => {
    if (row.children && row.children.length > 0) {
      // Only toggle rows that are not top-level
      row.checked = checked
      checkboxChanged(row)
    }
  })
}

function checkboxChanged(item: User) {
  // Update children's checked state recursively
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
    if (parentItem && parentItem.children) {
      parentItem.checked = parentItem.children.every((child) => child.checked)
      updateParentChecked(parentItem)
    }
  }

  updateParentChecked(item)
}

function findParent(childItem: User, allData: User[]): User | undefined {
  // Recursive function to find parent
}

function editItem(item: User) {
  console.log('Editing item:', item)
}

function deleteItem(item: User) {
  console.log('Deleting item:', item)
}

function handleSelectionChange(selectedItems: User[]) {
  console.log('Selected items:', selectedItems)
  updateIndeterminateState()
}

function updateIndeterminateState() {
  const total = tableData.value.filter((row) => row.children && row.children.length > 0).length
  const checkedCount = tableData.value.filter((row) => row.checked).length
  selectAllChecked.value = checkedCount === total
  isIndeterminate.value = checkedCount > 0 && checkedCount < total
}
</script>
