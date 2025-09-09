export interface DeviceProduct {
  id: string
  category: string
  roomNo: number
  name: string
  code: string
  isIot: boolean
  boundIotTypeName?: string
  online: boolean
  enabled: boolean
  sort: number
  network?: 'WIFI' | '4G'
  deviceKey?: string
  parentProduct?: string
  remark?: string
}

export interface DeviceProductQuery {
  keyword?: string
  isIot?: 'all' | 'yes' | 'no'
  enabled?: 'all' | 'on' | 'off'
  category?: string
  page?: number
  pageSize?: number
}

export interface PagedResult<T> { total: number; list: T[] }

// 临时使用前端Mock，未来可改为真实API
const mockData: DeviceProduct[] = Array.from({ length: 25 }).map((_, i) => ({
  id: String(i + 1),
  category: i % 3 === 0 ? '机器人' : (i % 3 === 1 ? 'AGV' : '机器狗'),
  roomNo: (i % 8) + 1,
  name: `海康头-${(i % 8) + 1}`,
  code: String(32 + (i % 2)),
  isIot: i % 2 === 0,
  boundIotTypeName: i % 2 === 0 ? `海康头-${(i % 8) + 1}` : undefined,
  online: i % 4 !== 0,
  enabled: true,
  sort: (i % 8) + 1,
  network: 'WIFI',
  deviceKey: `KEY-${i + 1}`,
  parentProduct: '示例上级',
  remark: '示例备注',
}))

export const DeviceProductApi = {
  async query(params: DeviceProductQuery): Promise<PagedResult<DeviceProduct>> {
    const { page = 1, pageSize = 10 } = params
    let data = [...mockData]
    if (params.category) data = data.filter(d => d.category === params.category)
    if (params.keyword) data = data.filter(d => d.name.includes(params.keyword) || String(d.code).includes(params.keyword))
    if (params.isIot && params.isIot !== 'all') data = data.filter(d => (params.isIot === 'yes' ? d.isIot : !d.isIot))
    if (params.enabled && params.enabled !== 'all') data = data.filter(d => (params.enabled === 'on' ? d.enabled : !d.enabled))

    const total = data.length
    const start = (page - 1) * pageSize
    const list = data.slice(start, start + pageSize)
    return Promise.resolve({ total, list })
  },
  async update(item: Partial<DeviceProduct> & { id: string }) {
    const idx = mockData.findIndex(d => d.id === item.id)
    if (idx >= 0) Object.assign(mockData[idx], item)
    return Promise.resolve(mockData[idx])
  },
  async remove(id: string) {
    const idx = mockData.findIndex(d => d.id === id)
    if (idx >= 0) mockData.splice(idx, 1)
    return Promise.resolve(true)
  },
  async create(data: Omit<DeviceProduct, 'id'>) {
    const id = String(mockData.length + 1)
    const record: DeviceProduct = { id, ...data }
    mockData.push(record)
    return Promise.resolve(record)
  }
}
