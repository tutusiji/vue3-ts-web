// 工具：语言 code 到表格字段名的映射与生成
// 兼容旧字段（历史表格列/本地存储）
export const legacyFieldMap: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-TW': 'zhTW',
  'en-US': 'en',
  'ja-JP': 'ja',
  'th-TH': 'th'
}

// 生成 field 名：优先使用 legacy；否则移除 '-' 并保持驼峰（首段小写）
export function toField(code: string): string {
  if (legacyFieldMap[code]) return legacyFieldMap[code]
  return code.split('-').map((seg, idx) => idx === 0 ? seg.toLowerCase() : (seg.charAt(0).toUpperCase()+seg.slice(1))).join('')
}

// 反向：用于从 field 找回 code（可用于迁移读取）
export function fieldToCode(field: string, codes: string[]): string | undefined {
  // 先匹配 legacy
  for (const [code, f] of Object.entries(legacyFieldMap)) if (f === field) return code
  // 再尝试基于规则恢复
  return codes.find(code => toField(code) === field)
}
