<template>
  <div class="basic-info">
    <el-card shadow="never" class="mb12">
      <template #header>
        <div class="card-title">基础数据</div>
      </template>
      <el-row :gutter="12">
        <el-col :span="8"><div class="field"><label>设备ID：</label><span>{{ model.id }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>设备类型名称：</label><span>{{ model.name }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>设备类型标识：</label><span>{{ model.code }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>设备网络：</label><span>{{ model.network || '-' }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>设备KEY：</label><span>{{ model.deviceKey || '-' }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>所属产品：</label><span>{{ model.parentProduct || '—' }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>是否物联设备：</label>
          <el-tag size="small" :type="model.isIot ? 'success' : 'info'">{{ model.isIot ? '是' : '否' }}</el-tag>
        </div></el-col>
        <el-col :span="8"><div class="field"><label>启用状态：</label>
          <el-tag size="small" :type="model.enabled ? 'success' : 'danger'">{{ model.enabled ? '启用' : '停用' }}</el-tag>
        </div></el-col>
        <el-col :span="8"><div class="field"><label>离线状态：</label>
          <el-icon v-if="model.online" color="#52c41a"><circle-check /></el-icon>
          <el-icon v-else color="#d9d9d9"><circle-close /></el-icon>
        </div></el-col>
        <el-col :span="8"><div class="field"><label>排序号：</label><span>{{ model.sort }}</span></div></el-col>
        <el-col :span="8"><div class="field"><label>房号：</label><span>{{ model.roomNo }}</span></div></el-col>
        <el-col :span="24"><div class="field"><label>备注：</label><span>{{ model.remark || '—' }}</span></div></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import type { DeviceProduct } from '@/utils/deviceProductApi'

interface Props { model: DeviceProduct }
const props = defineProps<Props>()
const model = props.model
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
.field { line-height: 30px; }
.field label { color:#666; margin-right:6px; }
.card-title { font-weight:600; }
</style>