const app = getApp()

Page({
  data: {
    userName: '李女士',
    updateTime: '08:30',
    healthData: [],
    quickActions: [],
    reminders: [],
    newsList: [],
    loading: true,
    error: '',
    healthScore: 85,
    healthLevel: '良好'
  },

  onLoad() {
    this.getGreeting()
    this.loadData()
  },

  onShow() {
    if (!this.data.loading) {
      this.loadData()
    }
  },

  getGreeting() {
    const hour = new Date().getHours()
    let greeting = '你好'
    if (hour < 12) greeting = '早上好'
    else if (hour < 18) greeting = '下午好'
    else greeting = '晚上好'
    this.setData({
      greetingText: greeting
    })
  },

  formatTime(date) {
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const period = hours < 12 ? '上午' : '下午'
    const hour = hours % 12 || 12
    return `${period}${hour}:${minutes}`
  },

  loadData() {
    this.setData({ loading: true, error: '' })

    wx.request({
      url: 'http://localhost:3000/api/home',
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        console.log('API响应:', res)
        try {
          if (res.data && res.data.success && res.data.data) {
            const data = res.data.data
            console.log('数据内容:', data)

            const health_overview = data.health_overview || data.healthOverview || [
              { key: 'steps', icon: '👣', value: '8,500', label: '步数', bgColor: '#e6f7ff' },
              { key: 'heart', icon: '❤️', value: '72', label: '心率', bgColor: '#fff1f0' },
              { key: 'sleep', icon: '😴', value: '7.5h', label: '睡眠', bgColor: '#fff7e6' },
              { key: 'water', icon: '💧', value: '1.8L', label: '饮水', bgColor: '#f6ffed' }
            ]

            const quick_actions = data.quick_actions || data.quickActions || []
            console.log('快捷入口数据:', quick_actions)

            const healthData = this.processHealthData(health_overview)

            this.setData({
              healthData: healthData,
              quickActions: quick_actions.length > 0 ? quick_actions : this.getDefaultQuickActions(),
              reminders: data.reminders || [],
              newsList: data.newsList || [],
              loading: false,
              updateTime: this.formatTime(new Date())
            })
            
            const app = getApp()
            app.globalData.healthOverview = health_overview
            console.log('数据设置完成并同步到全局')
          } else {
            throw new Error('数据格式错误')
          }
        } catch (e) {
          console.error('数据处理错误:', e)
          this.loadDefaultData()
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err)
        this.loadDefaultData()
      }
    })
  },

  getDefaultQuickActions() {
    return [
      { id: 1, name: '预约挂号', icon: '🏥', bgColor: '#e6f7ff', url: '/pages/appointment/appointment' },
      { id: 2, name: '健康咨询', icon: '💬', bgColor: '#fff1f0', url: '/pages/news/news' },
      { id: 3, name: '药品查询', icon: '💊', bgColor: '#fff7e6', url: '/pages/drug/drug' },
      { id: 4, name: '健康档案', icon: '📋', bgColor: '#f6ffed', url: '/pages/health/health' },
      { id: 5, name: '检查报告', icon: '📊', bgColor: '#f9f0ff', url: '/pages/health/health' },
      { id: 6, name: '远程问诊', icon: '📱', bgColor: '#e6fffb', url: '/pages/appointment/appointment' },
      { id: 7, name: '体检预约', icon: '🩺', bgColor: '#fff0f6', url: '/pages/appointment/appointment' },
      { id: 8, name: '更多服务', icon: '⋮', bgColor: '#f5f5f5', url: '/pages/profile/profile' }
    ]
  },

  loadDefaultData() {
    const defaultHealthData = [
      { key: 'steps', icon: '👣', value: '8,500', label: '步数', bgColor: '#e6f7ff' },
      { key: 'heart', icon: '❤️', value: '72', label: '心率', bgColor: '#fff1f0' },
      { key: 'sleep', icon: '😴', value: '7.5h', label: '睡眠', bgColor: '#fff7e6' },
      { key: 'water', icon: '💧', value: '1.8L', label: '饮水', bgColor: '#f6ffed' }
    ]

    const defaultQuickActions = this.getDefaultQuickActions()

    const defaultReminders = [
      { id: 1, icon: '💊', title: '服用降压药', time: '09:00', done: false, bgColor: '#e6f7ff' },
      { id: 2, icon: '🩸', title: '血糖检测', time: '12:00', done: false, bgColor: '#fff1f0' },
      { id: 3, icon: '🏃', title: '餐后散步', time: '18:30', done: true, bgColor: '#f6ffed' }
    ]

    const defaultNewsList = [
      { id: 1, title: '春季养生：如何预防过敏', desc: '春季是过敏高发季节，这些防护措施要记牢', time: '2小时前', image: '' },
      { id: 2, title: '合理饮食，远离高血压', desc: '日常饮食中的这些小技巧帮助您控制血压', time: '5小时前', image: '' }
    ]

    this.setData({
      healthData: this.processHealthData(defaultHealthData),
      quickActions: defaultQuickActions,
      reminders: defaultReminders,
      newsList: defaultNewsList,
      loading: false,
      error: '服务器未连接，显示默认数据'
    })
    console.log('已加载默认数据')
  },

  processHealthData(data) {
    if (!data || !Array.isArray(data)) {
      return []
    }

    return data.map(item => {
      let trend = 'stable'
      let trendText = '正常'
      let progress = 100
      let target = ''
      let status = 'normal'

      if (item.key === 'steps') {
        const steps = parseInt(item.value.replace(',', ''))
        progress = Math.min(100, Math.round(steps / 10000 * 100))
        target = '目标: 10,000步'
        trend = steps >= 8500 ? 'up' : 'down'
        trendText = steps >= 8500 ? '达标' : '继续加油'
        status = steps >= 10000 ? 'excellent' : steps >= 7000 ? 'good' : 'warning'
      } else if (item.key === 'heart') {
        const heart = parseInt(item.value)
        trend = heart >= 60 && heart <= 100 ? 'stable' : 'warning'
        trendText = heart >= 60 && heart <= 100 ? '正常范围' : '请注意'
        status = heart >= 60 && heart <= 100 ? 'normal' : 'warning'
      } else if (item.key === 'sleep') {
        const sleep = parseFloat(item.value)
        progress = Math.min(100, Math.round(sleep / 8 * 100))
        target = '目标: 8小时'
        trend = sleep >= 7 ? 'up' : 'down'
        trendText = sleep >= 7 ? '睡眠充足' : '睡眠不足'
        status = sleep >= 7 ? 'good' : 'warning'
      } else if (item.key === 'water') {
        const water = parseFloat(item.value)
        progress = Math.min(100, Math.round(water / 2 * 100))
        target = '目标: 2L'
        trend = water >= 1.5 ? 'up' : 'down'
        trendText = water >= 1.5 ? '饮水充足' : '多喝水'
        status = water >= 1.5 ? 'good' : 'warning'
      }

      return {
        ...item,
        trend,
        trendText,
        progress,
        target,
        status
      }
    })
  },

  goToPage(e) {
    const url = e.currentTarget.dataset.url
    const name = e.currentTarget.dataset.name

    wx.showToast({
      title: `正在打开${name}...`,
      icon: 'none',
      duration: 800
    })

    setTimeout(() => {
      wx.switchTab({
        url: url,
        fail: () => {
          wx.navigateTo({
            url: url
          })
        }
      })
    }, 400)
  },

  goToNewsDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/news/detail?id=${id}`
    })
  },

  goToHealthDetail(e) {
    const key = e.currentTarget.dataset.key
    wx.switchTab({
      url: '/pages/health/health'
    })
  },

  refreshData() {
    wx.showLoading({ title: '刷新中...' })
    this.loadData()
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    }, 500)
  }
})