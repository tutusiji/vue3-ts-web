// 模拟的异步请求函数
export function fetchUserData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: '张三李四',
        phone: '13478781245',
        money: '10000000',
        peops: 21,
        level: '3',
        remark: '讽德诵功讽德诵功发多少刚发打撒',
        email: 'john.doe@qq.com',
        address: 'district009',
        schoolList: ['major002', 'major005'],
        school: 'univ002',
        college: 'college003',
        major: 'major006'
      })
    }, 200)
  })
}

const orgTree = [
  {
    id: 'univ001',
    name: '北京大学',
    children: [
      {
        id: 'college001',
        name: '计算机学院',
        children: [
          {
            id: 'major001',
            name: '软件工程'
          },
          {
            id: 'major002',
            name: '网络安全'
          }
        ]
      },
      {
        id: 'college002',
        name: '心理学院',
        // children: [
        //   {
        //     id: 'major003',
        //     name: '应用心理学'
        //   },
        //   {
        //     id: 'major004',
        //     name: '教育心理学'
        //   }
        // ]
      }
    ]
  },
  {
    id: 'univ002',
    name: '清华大学',
    children: [
      {
        id: 'college003',
        name: '机械工程学院',
        children: [
          {
            id: 'major005',
            name: '机械设计'
          },
          {
            id: 'major006',
            name: '机械制造'
          }
        ]
      },
      {
        id: 'college004',
        name: '建筑学院',
        children: [
          {
            id: 'major007',
            name: '建筑学'
          },
          {
            id: 'major008',
            name: '城市规划'
          }
        ]
      }
    ]
  },
  {
    id: 'univ003',
    name: '武汉大学',
    children: [
      {
        id: 'college005',
        name: '法学院',
        children: [
          {
            id: 'major009',
            name: '法学'
          },
          {
            id: 'major010',
            name: '国际法'
          }
        ]
      },
      {
        id: 'college006',
        name: '生命科学学院',
        children: [
          {
            id: 'major011',
            name: '生物技术'
          },
          {
            id: 'major012',
            name: '生物信息学'
          }
        ]
      }
    ]
  },
  {
    id: 'univ004',
    name: '华中科技大学',
    children: [
      {
        id: 'college007',
        name: '电气与电子工程学院',
        children: [
          {
            id: 'major013',
            name: '电气工程'
          },
          {
            id: 'major014',
            name: '电子科学与技术'
          }
        ]
      },
      {
        id: 'college008',
        name: '计算机学院',
        children: [
          {
            id: 'major015',
            name: '计算机科学与技术'
          },
          {
            id: 'major016',
            name: '人工智能'
          }
        ]
      }
    ]
  },
  {
    id: 'univ005',
    name: '复旦大学',
    children: [
      {
        id: 'college009',
        name: '经济学院',
        children: [
          {
            id: 'major017',
            name: '经济学'
          },
          {
            id: 'major018',
            name: '国际经济与贸易'
          }
        ]
      },
      {
        id: 'college010',
        name: '医学院',
        children: [
          {
            id: 'major019',
            name: '临床医学'
          },
          {
            id: 'major020',
            name: '公共卫生'
          }
        ]
      }
    ]
  }
]
export function fetchOrgTree() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(orgTree)
    }, 200)
  })
}

const cityTree = [
  {
    id: 'province001',
    name: '北京市',
    children: [
      {
        id: 'city001',
        name: '北京市',
        children: [
          {
            id: 'district001',
            name: '东城区'
          },
          {
            id: 'district002',
            name: '西城区'
          },
          {
            id: 'district003',
            name: '朝阳区'
          },
          {
            id: 'district004',
            name: '海淀区'
          }
        ]
      }
    ]
  },
  {
    id: 'province002',
    name: '上海市',
    children: [
      {
        id: 'city002',
        name: '上海市',
        children: [
          {
            id: 'district005',
            name: '黄浦区'
          },
          {
            id: 'district006',
            name: '徐汇区'
          },
          {
            id: 'district007',
            name: '长宁区'
          },
          {
            id: 'district008',
            name: '普陀区'
          }
        ]
      }
    ]
  },
  {
    id: 'province003',
    name: '广东省',
    children: [
      {
        id: 'city003',
        name: '广州市',
        children: [
          {
            id: 'district009',
            name: '越秀区'
          },
          {
            id: 'district010',
            name: '荔湾区'
          },
          {
            id: 'district011',
            name: '海珠区'
          },
          {
            id: 'district012',
            name: '天河区'
          }
        ]
      },
      {
        id: 'city004',
        name: '深圳市',
        children: [
          {
            id: 'district013',
            name: '罗湖区'
          },
          {
            id: 'district014',
            name: '福田区'
          },
          {
            id: 'district015',
            name: '南山区'
          },
          {
            id: 'district016',
            name: '宝安区'
          }
        ]
      }
    ]
  },
  {
    id: 'province004',
    name: '四川省',
    children: [
      {
        id: 'city005',
        name: '成都市',
        children: [
          {
            id: 'district017',
            name: '锦江区'
          },
          {
            id: 'district018',
            name: '青羊区'
          },
          {
            id: 'district019',
            name: '金牛区'
          },
          {
            id: 'district020',
            name: '武侯区'
          }
        ]
      }
    ]
  }
]

export function fetchCityTree() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(cityTree)
    }, 200)
  })
}
