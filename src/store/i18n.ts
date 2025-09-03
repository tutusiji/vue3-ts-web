import { defineStore } from 'pinia'
export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: localStorage.getItem('locale') || 'zh-CN',
  }),
  actions: {
    setLocale(lang: string) {
      this.locale = lang
      localStorage.setItem('locale', lang)
    },
  },
})
