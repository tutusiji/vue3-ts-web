import axios from 'axios'

// 根据你的后端接口调整该地址
const AI_API = '/api/ai/translate'

export async function aiTranslate(prompt: string): Promise<{ zh?: string; zhTW?: string; en?: string; ja?: string; th?: string }> {
  try {
    const { data } = await axios.post(AI_API, { prompt })
    // 期望 data 为 { zh, zhTW, en, ja, th }
    return data || {}
  } catch (e) {
    // 占位兜底：不报错，返回空对象
    return {}
  }
}
