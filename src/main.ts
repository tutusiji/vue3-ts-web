// import './assets/style.css'
import './assets/tailwind.css'
import 'vue-global-api'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'




import App from './App.vue'
import router from './router'
import i18n, { setupI18n } from './i18n'

// 异步初始化应用
async function initializeApp() {
  const app = createApp(App)
  
  // 先初始化Pinia
  const pinia = createPinia()
  app.use(pinia)
  
  // 然后设置i18n（从API加载语言配置）
  await setupI18n()
  
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  app.use(router)
  app.use(i18n)
  
  app.mount('#app')
  
  console.log('Vue3 app initialized successfully')
}

// 启动应用
initializeApp().catch(error => {
  console.error('Failed to initialize app:', error)
  // 即使初始化失败也要挂载应用（使用本地语言文件）
  const app = createApp(App)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})
