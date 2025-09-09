<template>
  <div class="runtime-panel">
    <el-row :gutter="12">
      <el-col :span="8" v-for="(card, idx) in cards" :key="idx">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">{{ card.title }}</div>
          <div class="metric-value">{{ card.value }}</div>
          <div class="metric-time">{{ card.time }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { DeviceProduct } from '@/utils/deviceProductApi'

interface Props { model: DeviceProduct }
const props = defineProps<Props>()
const model = props.model

// 运行时数据先用静态示例，未来可对接实时接口
const now = new Date().toLocaleString()
const cards = [
  { title: '电池电量', value: '80%', time: now },
  { title: '摄像头状态', value: model.online ? '在线' : '离线', time: now },
  { title: '电池电量', value: '80%', time: now },
  { title: '摄像头状态', value: model.online ? '在线' : '离线', time: now },
  { title: '电池电量', value: '—', time: now },
  { title: '摄像头状态', value: model.online ? '在线' : '离线', time: now },
]
</script>

<style scoped>
.metric-card { margin-bottom:12px }
.metric-title { color:#666; margin-bottom:6px }
.metric-value { font-size:22px; font-weight:600; margin-bottom:6px }
.metric-time { color:#999; font-size:12px }
</style>