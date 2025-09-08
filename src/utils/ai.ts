import axios from 'axios'

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-your-actual-deepseek-api-key-here'

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
