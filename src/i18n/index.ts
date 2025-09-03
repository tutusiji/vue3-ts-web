import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'
import jaJP from './ja-JP.json'
import thTH from './th-TH.json'
import zhTW from './zh-TW.json'

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'th-TH': thTH,
}

function getLocale() {
  const saved = localStorage.getItem('locale')
  if (saved) return saved
  const browserLang = navigator.language
  if (messages[browserLang]) return browserLang
  return 'zh-CN'
}

export default createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'zh-CN',
  messages,
})
