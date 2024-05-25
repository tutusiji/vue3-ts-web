import { defineStore } from 'pinia'
import { formConfig, modelsData } from './config'

export const useConfigStore = defineStore('configer', {
  // 状态
  state: () => ({
    list: [],
    currentItem: 0,
    totalItems: 0,
    loading: false,
    data: [],
    formConfig: formConfig,
    modelsData: modelsData
  }),
  // 状态数据计算属性 相当于computed
  getters: {},
  // 修改状态 同步异步都可修改
  actions: {
    setlist(newList: []) {
      this.list = newList
    },
    setPageCurrent(newPage: number) {
      // this.currentPage = newPage
    },
    setTotalItems(newTotal: number) {
      this.totalItems = newTotal
    },
    fetchArticles() {
      try {
        this.loading = true
      } catch (error) {
        console.error((error as Error).message)
      } finally {
        this.loading = false
      }
    }
  }
})
