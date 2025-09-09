<template>
  <div class="events-pane">
    <el-card shadow="never" :body-style="{padding:'10px'}">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="综合查询" size="small" style="width:220px"/>
        <el-select v-model="query.type" size="small" class="ml8" style="width:120px">
          <el-option label="告警类型" value="alarm" />
          <el-option label="下拉选单" value="dropdown" />
        </el-select>
        <el-select v-model="query.level" size="small" class="ml8" style="width:120px">
          <el-option label="告警级别" value="L1" />
          <el-option label="L2" value="L2" />
        </el-select>
        <el-date-picker v-model="query.date" type="datetimerange" size="small" class="ml8"/>
        <el-button type="primary" size="small" class="ml8" @click="load">查询</el-button>
      </div>

      <el-table :data="list" size="small" border class="mt10">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="prop" label="属性信息" min-width="200" />
        <el-table-column prop="count" label="数量" width="90" />
        <el-table-column prop="unit" label="单位" width="90" />
        <el-table-column prop="level" label="告警级别" width="110" />
        <el-table-column prop="type" label="告警类型" width="120" />
        <el-table-column prop="desc" label="告警说明" min-width="160" />
        <el-table-column prop="time" label="数据记录时间" min-width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Row { prop:string; count:number; unit:string; level:string; type:string; desc:string; time:string }

const query = reactive({ keyword:'', type:'alarm', level:'L1', date: [] as any[] })
const list = ref<Row[]>([])

function load(){
  const now = new Date().toLocaleString()
  list.value = [
    { prop:'电量', count:10, unit:'%', level:'电量过低', type:'电量过低', desc:'—', time: now }
  ]
}

load()
</script>

<style scoped>
.toolbar { display:flex; align-items:center }
.ml8 { margin-left:8px }
.mt10 { margin-top:10px }
</style>