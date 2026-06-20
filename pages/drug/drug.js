Page({
  data: {
    categories: [
      { id: 1, name: '感冒发烧', icon: '🤒', bgColor: '#e6f7ff' },
      { id: 2, name: '肠胃不适', icon: '🫃', bgColor: '#fff1f0' },
      { id: 3, name: '外伤用药', icon: '🩹', bgColor: '#fff7e6' },
      { id: 4, name: '慢性病', icon: '💊', bgColor: '#f6ffed' },
      { id: 5, name: '维生素', icon: '💪', bgColor: '#f9f0ff' },
      { id: 6, name: '儿童药', icon: '👶', bgColor: '#e6fffb' },
      { id: 7, name: '皮肤药', icon: '🧴', bgColor: '#fff0f6' },
      { id: 8, name: '更多', icon: '⋮', bgColor: '#f5f5f5' }
    ],
    myDrugs: [
      {
        id: 1,
        name: '硝苯地平缓释片',
        spec: '30mg * 30片',
        usage: '每日1次，每次1片',
        icon: '💊',
        bgColor: '#e6f7ff',
        reminder: '09:00服用'
      },
      {
        id: 2,
        name: '二甲双胍',
        spec: '0.5g * 60片',
        usage: '每日2次，每次1片',
        icon: '💊',
        bgColor: '#fff1f0',
        reminder: '随餐服用'
      }
    ],
    commonDrugs: [
      { id: 1, name: '感冒灵颗粒', desc: '用于感冒引起的头痛、发热、鼻塞', price: '28.00' },
      { id: 2, name: '布洛芬缓释胶囊', desc: '用于缓解轻至中度疼痛', price: '35.00' },
      { id: 3, name: '蒙脱石散', desc: '用于成人及儿童急慢性腹泻', price: '18.00' },
      { id: 4, name: '维生素C片', desc: '用于预防和治疗坏血病', price: '15.00' },
      { id: 5, name: '创可贴', desc: '用于小创伤、擦伤等患处', price: '12.00' }
    ]
  },

  onSearch(e) {
    const keyword = e.detail.value
    wx.showToast({
      title: '搜索：' + keyword,
      icon: 'none'
    })
  },

  scanCode() {
    wx.scanCode({
      success: (res) => {
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    })
  },

  selectCategory(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '选择分类',
      icon: 'none'
    })
  },

  goToDrugDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '药品详情',
      icon: 'none'
    })
  }
})
