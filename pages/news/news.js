Page({
  data: {
    currentTab: 0,
    newsList: [],
    categories: ['推荐', '科普', '养生', '新闻'],
    loading: true,
    error: ''
  },

  onLoad() {
    this.fetchNews()
  },

  fetchNews() {
    this.setData({ loading: true, error: '' })
    
    const category = this.data.categories[this.data.currentTab]

    wx.request({
      url: 'http://localhost:3000/api/news',
      method: 'GET',
      data: {
        category: category === '推荐' ? '全部' : category
      },
      success: (res) => {
        this.setData({ loading: false })
        
        if (res.data.success) {
          const newsList = res.data.data.map(item => {
            let categoryBg = '#fff7e6'
            let categoryColor = '#fa8c16'
            
            if (item.category === '科普') {
              categoryBg = '#e6f7ff'
              categoryColor = '#1890ff'
            } else if (item.category === '推荐') {
              categoryBg = '#f6ffed'
              categoryColor = '#52c41a'
            } else if (item.category === '新闻') {
              categoryBg = '#fff0f6'
              categoryColor = '#eb2f96'
            }

            return {
              ...item,
              image: item.image || `/images/news${item.id}.jpg`,
              categoryBg,
              categoryColor,
              author: '健康小助手'
            }
          })
          
          this.setData({
            newsList
          })
        } else {
          this.setData({ error: '获取数据失败' })
        }
      },
      fail: () => {
        this.setData({ loading: false, error: '网络连接失败，请检查服务器是否运行' })
      }
    })
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTab: index
    })
    this.fetchNews()
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/news/detail?id=${id}`
    })
  }
})
