Page({
  data: {
    news: null
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.fetchNewsDetail(id)
    }
  },

  fetchNewsDetail(id) {
    wx.showLoading({
      title: '加载中...'
    })

    wx.request({
      url: `http://localhost:3000/api/news/${id}`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading()
        
        if (res.data.success) {
          const news = res.data.data
          news.image = news.image || `/images/news${news.id}.jpg`
          news.formattedViews = news.views >= 1000 ? (news.views / 1000).toFixed(1) + 'k' : news.views.toString()
          news.formattedLikes = news.likes >= 1000 ? (news.likes / 1000).toFixed(1) + 'k' : news.likes.toString()
          
          this.setData({
            news: news
          })
        } else {
          wx.showToast({
            title: '文章不存在',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.news?.title || '健康资讯',
      path: `/pages/news/detail?id=${this.data.news?.id}`
    }
  }
})
