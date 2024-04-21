<!-- <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div> -->

<template>
  <div class="fff bg-white mb-40">123123123123123</div>
  <div class="mb-10">HomePage</div>
  1111
  <div>
    <el-radio-group v-model="radio1" size="large">
      <el-radio-button label="New York" value="New York" />
      <el-radio-button label="Washington" value="Washington" />
      <el-radio-button label="Los Angeles" value="Los Angeles" />
      <el-radio-button label="Chicago" value="Chicago" />
    </el-radio-group>
  </div>
  <div style="margin-top: 20px">
    <el-radio-group v-model="radio2">
      <el-radio-button label="New York" value="New York" />
      <el-radio-button label="Washington" value="Washington" />
      <el-radio-button label="Los Angeles" value="Los Angeles" />
      <el-radio-button label="Chicago" value="Chicago" />
    </el-radio-group>
  </div>
  <div style="margin-top: 20px">
    <el-radio-group v-model="radio3" size="small">
      <el-radio-button label="New York" value="New York" />
      <el-radio-button label="Washington" value="Washington" disabled />
      <el-radio-button label="Los Angeles" value="Los Angeles" />
      <el-radio-button label="Chicago" value="Chicago" />
    </el-radio-group>
  </div>

  {{ generateArray(20) }}
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { generateArray } from 'Utils/tools' // 使用Utils别名

console.log(generateArray(20))
const radio1 = ref('New York')
const radio2 = ref('New York')
const radio3 = ref('New York')
const radio3333 = ref('New York')

// eslint-disable-next-line no-undef
console.log(process.env.NODE_ENV)
</script>

<style scoped>
.logo {
  padding: 1.5em;
  width: 100px;
  height: 6em;
  transition: filter 300ms;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
