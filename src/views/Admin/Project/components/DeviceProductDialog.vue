<template>
  <el-dialog v-model="visibleInternal" :title="isEdit ? '编辑设备类型' : '新增设备类型'" width="760px" @closed="onClosed">
    <div class="dialog-section-title">设备详情</div>
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      label-width="110px"
      size="small"
      class="device-form"
    >
      <el-row :gutter="20">
        <template v-for="cfg in detailItems" :key="cfg.key">
          <el-col :span="cfg.span || 12" v-show="isFieldVisible(cfg)">
            <el-form-item :label="cfg.label" :prop="cfg.key" :required="cfg.required">
              <template v-if="cfg.component==='el-select'">
                <el-select v-bind="cfg.props" v-model="formModel[cfg.key]">
                  <el-option v-for="opt in (cfg.options||[])" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </template>
              <template v-else-if="cfg.component==='el-radio-group'">
                <el-radio-group v-bind="cfg.props" v-model="formModel[cfg.key]">
                  <el-radio v-for="opt in (cfg.options||[])" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
                </el-radio-group>
              </template>
              <component v-else :is="resolveComponent(cfg.component)" v-bind="cfg.props" v-model="formModel[cfg.key]" />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
      <div class="dialog-section-title mt12">其他信息</div>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="formModel.remark" :rows="4" maxlength="200" show-word-limit placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { FormRules } from 'element-plus'
import type { DeviceProduct } from '@/utils/deviceProductApi'

interface FieldOption { label: string; value: any }
interface FieldConfig {
  key: keyof DeviceProduct | string
  label: string
  component: string // element-plus 组件名，如 el-input / el-select / el-radio-group / el-switch
  required?: boolean
  span?: number
  props?: Record<string, any>
  options?: FieldOption[]
}

const props = defineProps<{
  modelValue: boolean
  isEdit: boolean
  model?: Partial<DeviceProduct>
  categories: string[]
}>()
const emits = defineEmits(['update:modelValue','save','closed'])

const visibleInternal = ref(false)
watch(()=>props.modelValue, v=> visibleInternal.value = v)
function close() { visibleInternal.value = false }
function onClosed(){ emits('update:modelValue', false); emits('closed') }

// 初始表单模型
const defaultModel: DeviceProduct = {
  id: '', category: props.categories?.[0] || '机器人', roomNo:1, name:'', code:'', isIot:true,
  boundIotTypeName:'', enabled:true, sort:1, network:'WIFI', deviceKey:'', parentProduct:'', remark:'', online:true
}
const formModel = reactive<any>({ ...defaultModel, ...(props.model||{}) })
watch(()=>props.model, (m)=> { if(m) Object.assign(formModel, defaultModel, m) })

// 字段配置（可后续抽离常量）
const detailItems: FieldConfig[] = [
  { key:'name', label:'设备类型名称', component:'el-input', required:true, props:{ placeholder:'请输入' } },
  { key:'code', label:'设备类型标识', component:'el-input', required:true, props:{ placeholder:'请输入' } },
  { key:'sort', label:'排序号', component:'el-input', props:{ placeholder:'请输入', type:'number' } },
  { key:'deviceKey', label:'设备KEY', component:'el-input', required:true, props:{ placeholder:'请输入' } },
  { key:'parentProduct', label:'上级产品', component:'el-select', options: props.categories.map(c=>({label:c, value:c})), props:{ placeholder:'下拉选择', clearable:true } },
  { key:'network', label:'设备网络', component:'el-radio-group', options:[{label:'WIFI',value:'WIFI'},{label:'4G',value:'4G'}] },
  { key:'isIot', label:'是否物联设备', component:'el-radio-group', options:[{label:'是',value:true},{label:'否',value:false}] },
  { key:'enabled', label:'启用状态', component:'el-radio-group', options:[{label:'启用',value:true},{label:'停用',value:false}] },
  { key:'boundIotTypeName', label:'绑定物联类型', component:'el-input', props:{ placeholder:'请输入' } },
]

// 动态构建校验规则
const formRules = computed<FormRules>(()=>{
  const rules: FormRules = {}
  detailItems.forEach(item=>{
    if(item.required){
      rules[item.key as string] = [{ required:true, message:`请输入${item.label}`, trigger:'blur' }]
    }
  })
  rules['deviceKey'] = [{ required:true, message:'请输入设备KEY', trigger:'blur' }]
  return rules
})

const formRef = ref()
const saving = ref(false)

function resolveComponent(name:string){
  return name
}

function isFieldVisible(cfg: FieldConfig){
  if(cfg.key === 'boundIotTypeName') return !!formModel.isIot
  return true
}

async function submit(){
  if(!formRef.value) return
  await formRef.value.validate(async (ok:boolean)=>{
    if(!ok) return
    saving.value = true
    try {
      const payload: DeviceProduct = { ...defaultModel, ...formModel, id: formModel.id || Date.now().toString() }
      emits('save', payload, props.isEdit)
      close()
    } finally { saving.value = false }
  })
}

watch(visibleInternal, v=> emits('update:modelValue', v))

</script>

<style scoped>
.dialog-section-title { font-weight:600; margin:4px 0 8px; }
.mt12 { margin-top:12px; }
</style>