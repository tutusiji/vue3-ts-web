import type { CascaderOption } from './types'

export const cascaderOptions: CascaderOption[] = [
  {
    label: '浙江',
    value: 'zhejiang',
    children: [
      {
        label: '杭州',
        value: 'hangzhou',
        children: [
          { label: '西湖区', value: 'xihu' },
          {
            label: '余杭区',
            value: 'yuhang',
            children: [
              { label: '富阳小区', value: 'fuyang' },
              { label: '钱江小区', value: 'qianjiang' },
              { label: '江北小区', value: 'jiangbei' }
            ]
          }
        ]
      },
      {
        label: '温州',
        value: 'wenzhou',
        children: [
          { label: '鹿城区', value: 'lucheng' },
          { label: '瓯海区', value: 'ouhai' }
        ]
      }
    ]
  },
  {
    label: '江苏',
    value: 'jiangsu',
    children: [
      {
        label: '南京',
        value: 'nanjing',
        children: [
          { label: '玄武区', value: 'xuanwu' },
          { label: '秦淮区', value: 'qinhuai' }
        ]
      },
      {
        label: '苏州',
        value: 'suzhou',
        children: [
          { label: '姑苏区', value: 'gusu' },
          { label: '吴中区', value: 'wuzhong' }
        ]
      }
    ]
  }
]
