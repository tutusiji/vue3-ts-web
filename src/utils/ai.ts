import axios from 'axios'

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = 'sk-cc04dfad34294b3792ce029e82b8a3e8'

// 语言映射
const LANGUAGE_MAPPING: Record<string, string> = {
  'zh-CN': '中文',
  'zh-TW': '繁体中文',
  'en-US': '英语',
  'ja-JP': '日语',
  'ko-KR': '韩语',
  'fr-FR': '法语',
  'de-DE': '德语',
  'es-ES': '西班牙语',
  'it-IT': '意大利语',
  'pt-PT': '葡萄牙语',
  'ru-RU': '俄语',
  'ar-SA': '阿拉伯语',
  'th-TH': '泰语',
  'vi-VN': '越南语',
  'id-ID': '印尼语',
  'ms-MY': '马来语',
  'hi-IN': '印地语',
  'tr-TR': '土耳其语',
  'pl-PL': '波兰语',
  'nl-NL': '荷兰语',
  'sv-SE': '瑞典语',
  'da-DK': '丹麦语',
  'no-NO': '挪威语',
  'fi-FI': '芬兰语',
  'cs-CZ': '捷克语',
  'hu-HU': '匈牙利语'
}

// 翻译进度回调类型
export interface TranslationProgress {
  completed: number
  total: number
  percentage: number
  currentKey?: string
}

// 翻译结果类型
export interface TranslationResult {
  success: boolean
  data?: Record<string, any>
  error?: string
}

/**
 * 简单的AI翻译函数（保持向后兼容）
 */
export async function aiTranslate(prompt: string): Promise<Record<string, any>> {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    if (response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content.trim()
      
      // 尝试解析JSON格式的返回结果
      try {
        // 移除可能的markdown代码块标记
        const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim()
        return JSON.parse(cleanContent)
      } catch (parseError) {
        // 如果解析失败，返回原始内容
        throw new Error('AI返回格式不正确，请重试')
      }
    } else {
      throw new Error('DeepSeek API返回格式异常')
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('DeepSeek API密钥无效，请检查配置')
    } else if (error.response?.status === 429) {
      throw new Error('API调用频率过高，请稍后重试')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('请求超时，请重试')
    } else {
      throw new Error(error.message || 'AI翻译服务暂不可用')
    }
  }
}

/**
 * AI翻译服务类
 */
export class TranslationService {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || DEEPSEEK_API_KEY
    this.apiUrl = DEEPSEEK_API_URL
  }

  /**
   * 翻译单个文本
   */
  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage: string = '中文'
  ): Promise<string> {
    if (!text || !text.trim()) {
      return text
    }

    const prompt = this.getTranslationPrompt(text, sourceLanguage, targetLanguage)
    
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      if (response.data?.choices?.[0]?.message?.content) {
        const translatedText = response.data.choices[0].message.content.trim()
        return this.cleanTranslationResult(translatedText)
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error: any) {
      this.handleApiError(error)
    }
  }

  /**
   * 批量翻译语言文件
   */
  async translateLanguageFile(
    sourceData: Record<string, any>,
    targetLanguageCode: string,
    onProgress?: (progress: TranslationProgress) => void
  ): Promise<TranslationResult> {
    const targetLanguage = LANGUAGE_MAPPING[targetLanguageCode]
    if (!targetLanguage) {
      return {
        success: false,
        error: `不支持的语言代码: ${targetLanguageCode}`
      }
    }

    const result: Record<string, any> = {}
    const allKeys = this.getAllKeys(sourceData)
    const totalKeys = allKeys.length
    let completedKeys = 0

    try {
      for (const keyPath of allKeys) {
        const value = this.getValueByPath(sourceData, keyPath)
        
        if (onProgress) {
          onProgress({
            completed: completedKeys,
            total: totalKeys,
            percentage: Math.round((completedKeys / totalKeys) * 100),
            currentKey: keyPath
          })
        }

        if (typeof value === 'string' && value.trim()) {
          try {
            const translatedValue = await this.translateText(value, targetLanguage, '中文')
            this.setValueByPath(result, keyPath, translatedValue)
            
            // 添加延迟避免API限流
            await this.delay(100)
          } catch (error: any) {
            console.warn(`翻译失败 ${keyPath}:`, error.message)
            // 翻译失败时保持原值
            this.setValueByPath(result, keyPath, value)
          }
        } else {
          // 非字符串值或空值直接复制
          this.setValueByPath(result, keyPath, value)
        }

        completedKeys++
      }

      if (onProgress) {
        onProgress({
          completed: totalKeys,
          total: totalKeys,
          percentage: 100
        })
      }

      return {
        success: true,
        data: result
      }
    } catch (error: any) {
      return {
        success: false,
        error: `批量翻译失败: ${error.message}`
      }
    }
  }

  /**
   * 一次性翻译整个JSON对象
   */
  async translateJsonObject(
    sourceData: Record<string, any>,
    targetLanguageCode: string,
    onProgress?: (progress: TranslationProgress) => void
  ): Promise<TranslationResult> {
    const targetLanguage = LANGUAGE_MAPPING[targetLanguageCode]
    if (!targetLanguage) {
      return {
        success: false,
        error: `不支持的语言代码: ${targetLanguageCode}`
      }
    }

    try {
      if (onProgress) {
        onProgress({
          completed: 0,
          total: 1,
          percentage: 0,
          currentKey: '正在准备翻译...'
        })
      }

      const prompt = this.getJsonTranslationPrompt(sourceData, targetLanguage)
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      if (onProgress) {
        onProgress({
          completed: 1,
          total: 1,
          percentage: 100,
          currentKey: '翻译完成'
        })
      }

      if (response.data?.choices?.[0]?.message?.content) {
        const translatedContent = response.data.choices[0].message.content.trim()
        const jsonResult = this.parseJsonFromResponse(translatedContent)
        
        return {
          success: true,
          data: jsonResult
        }
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error: any) {
      console.error('JSON翻译失败:', error)
      this.handleApiError(error)
    }
  }

  /**
   * 验证API密钥
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.translateText('测试', '英语', '中文')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 生成JSON翻译提示词
   */
  private getJsonTranslationPrompt(sourceData: Record<string, any>, targetLanguage: string): string {
    const jsonString = JSON.stringify(sourceData, null, 2)
    return `请将以下JSON对象中每一个key翻译成${targetLanguage}，并填充到key所对应的value值中。要求：
1. 保持JSON结构完整不变
2. 只翻译value值，不要修改key名称
3. 使用地道的${targetLanguage}表达
4. 如果是技术术语，请使用标准的${targetLanguage}技术词汇
5. 直接返回完整的JSON对象，不要添加任何解释或标记

原始JSON：
${jsonString}`
  }

  /**
   * 从API响应中解析JSON
   */
  private parseJsonFromResponse(content: string): Record<string, any> {
    try {
      // 尝试直接解析
      return JSON.parse(content)
    } catch {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch {
          throw new Error('无法解析翻译结果为有效的JSON格式')
        }
      } else {
        throw new Error('翻译结果中未找到有效的JSON格式')
      }
    }
  }

  /**
   * 生成翻译提示词
   */
  private getTranslationPrompt(text: string, sourceLanguage: string, targetLanguage: string): string {
    return `请将以下${sourceLanguage}文本翻译成${targetLanguage}，要求：
1. 保持原文的语义和语调
2. 使用地道的${targetLanguage}表达
3. 如果是技术术语，请使用标准的${targetLanguage}技术词汇
4. 只返回翻译结果，不要添加任何解释或标记

原文：${text}`
  }

  /**
   * 清理翻译结果
   */
  private cleanTranslationResult(text: string): string {
    // 移除可能的引号包围
    let cleaned = text.replace(/^["']|["']$/g, '')
    
    // 移除可能的前缀（如"翻译："、"Translation:"等）
    cleaned = cleaned.replace(/^(翻译[：:]|Translation[：:]|译文[：:]|Result[：:])/i, '')
    
    return cleaned.trim()
  }

  /**
   * 处理API错误
   */
  private handleApiError(error: any): never {
    console.error('Translation API error:', error)
    if (error.response?.status === 401) {
      throw new Error('API密钥无效或已过期')
    } else if (error.response?.status === 429) {
      throw new Error('API调用频率超限，请稍后重试')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('翻译请求超时')
    } else {
      throw new Error(`翻译失败: ${error.message}`)
    }
  }

  /**
   * 获取对象的所有键路径
   */
  private getAllKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = []
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = prefix ? `${prefix}.${key}` : key
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys.push(...this.getAllKeys(obj[key], currentPath))
        } else {
          keys.push(currentPath)
        }
      }
    }
    
    return keys
  }

  /**
   * 根据路径获取值
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 根据路径设置值
   */
  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      return current[key]
    }, obj)
    
    target[lastKey] = value
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取支持的语言映射
   */
  static getLanguageMapping(): Record<string, string> {
    return { ...LANGUAGE_MAPPING }
  }
}

// 导出默认实例
export const translationService = new TranslationService()

// 导出类型
export type { TranslationProgress, TranslationResult }
