Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    menuList: [],
    helpList: [],
    healthSummary: {},
    healthOverviewItems: [],
    devices: [],
    achievements: [],
    notifications: [],
    loading: true,
    error: '',
    isAdmin: false,
    showEditModal: false,
    tempNickname: '',
    tempAvatar: '',
    avatarOptions: [
      '/images/doctor1.png',
      '/images/doctor2.png',
      '/images/doctor3.png',
      '/images/doctor4.png',
      '/images/doctor5.png',
      '/images/avatar.png'
    ],
    greeting: '你好',
    dailyTip: '保持充足的睡眠是健康的第一步。',
    healthTips: [
      '早起一杯温开水，有助于排毒。',
      '每天坚持步行30分钟，心血管更健康。',
      '饮食要清淡，少油少盐多蔬菜。',
      '长时间用眼后，记得向远处眺望。',
      '保持心情愉快是最好的良药。'
    ]
  },

  onLoad() {
    this.updateGreeting()
    this.getRandomTip()
    this.checkLoginStatus()
    this.loadSettings()
  },

  getRandomTip() {
    const tips = this.data.healthTips
    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    this.setData({ dailyTip: randomTip })
  },

  handleCheckIn() {
    wx.showLoading({ title: '打卡中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '打卡成功！积分+10',
        icon: 'success'
      })
    }, 1000)
  },

  updateGreeting() {
    const hour = new Date().getHours()
    let greeting = '你好'
    if (hour < 6) greeting = '凌晨好'
    else if (hour < 9) greeting = '早上好'
    else if (hour < 12) greeting = '上午好'
    else if (hour < 14) greeting = '中午好'
    else if (hour < 18) greeting = '下午好'
    else greeting = '晚上好'
    this.setData({ greeting })
  },

  onShow() {
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.id) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
        isAdmin: userInfo.nickname === '管理员' || userInfo.id === 1
      })
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null,
        isAdmin: false
      })
    }
  },

  loadSettings() {
    this.setData({ loading: true, error: '' })
    
    wx.request({
      url: 'http://localhost:3000/api/settings',
      success: (res) => {
        if (res.data && res.data.success) {
          const data = res.data.data
          const healthSummary = data.health_summary || {}
          
          const app = getApp()
          const globalHealthOverview = app.globalData.healthOverview || []
          
          let healthOverviewItems = []
          if (globalHealthOverview.length > 0) {
            healthOverviewItems = globalHealthOverview
          } else {
            healthOverviewItems = [
              { icon: '❤️', label: '心率', value: healthSummary.heartRate || 0, unit: 'bpm', bgColor: '#fff1f0' },
              { icon: '💤', label: '睡眠', value: healthSummary.sleepHours || 0, unit: 'h', bgColor: '#f9f0ff' },
              { icon: '💉', label: '血压', value: healthSummary.bloodPressure || '--', unit: '', bgColor: '#e6f7ff' },
              { icon: '⚖️', label: '体重', value: healthSummary.weight || '--', unit: '', bgColor: '#f6ffed' }
            ]
          }

          this.setData({
            menuList: data.profile_menus || [],
            helpList: data.help_menus || [],
            healthSummary: healthSummary,
            healthOverviewItems: healthOverviewItems,
            devices: data.devices || [],
            achievements: data.achievements || [],
            notifications: data.notifications || [],
            loading: false
          })
        } else {
          this.loadDefaultSettings()
        }
      },
      fail: () => {
        this.loadDefaultSettings()
      }
    })
  },

  loadDefaultSettings() {
    const healthSummary = {
      totalRecords: 156,
      healthScore: 85,
      todaySteps: 6234,
      heartRate: 72,
      sleepHours: 7.2,
      bloodPressure: '120/80',
      weight: '68.5kg'
    }

    const app = getApp()
    const globalHealthOverview = app.globalData.healthOverview || []
    
    let healthOverviewItems = []
    if (globalHealthOverview.length > 0) {
      healthOverviewItems = globalHealthOverview
    } else {
      healthOverviewItems = [
        { icon: '❤️', label: '心率', value: healthSummary.heartRate, unit: 'bpm', bgColor: '#fff1f0' },
        { icon: '💤', label: '睡眠', value: healthSummary.sleepHours, unit: 'h', bgColor: '#f9f0ff' },
        { icon: '💉', label: '血压', value: healthSummary.bloodPressure, unit: '', bgColor: '#e6f7ff' },
        { icon: '⚖️', label: '体重', value: healthSummary.weight, unit: '', bgColor: '#f6ffed' }
      ]
    }

    this.setData({
      menuList: [
        { id: 1, name: '个人资料', icon: '👤', bgColor: '#1890ff', url: '/pages/profile/profile', hint: '完善度 80%' },
        { id: 2, name: '健康记录', icon: '📊', bgColor: '#52c41a', url: '/pages/health/health' },
        { id: 3, name: '我的预约', icon: '📅', bgColor: '#fa8c16', url: '/pages/appointment/appointment' },
        { id: 9, name: '帮助中心', icon: '❓', bgColor: '#722ed1' }
      ],
      healthSummary,
      healthOverviewItems,
      devices: [
        { id: 1, name: '智能手表', model: 'Apple Watch S8', status: 'connected', lastSync: '10分钟前', battery: 85 },
        { id: 2, name: '血压计', model: '欧姆龙 HEM-7136', status: 'connected', lastSync: '1小时前', battery: 15 }
      ],
      loading: false,
      error: ''
    })
  },

  openEditModal() {
    if (!this.data.isLoggedIn) return
    this.setData({
      showEditModal: true,
      tempNickname: this.data.userInfo.nickname,
      tempAvatar: this.data.userInfo.avatar || '/images/avatar.png'
    })
  },

  closeEditModal() {
    this.setData({ showEditModal: false })
  },

  onNicknameInput(e) {
    this.setData({ tempNickname: e.detail.value })
  },

  selectAvatar(e) {
    this.setData({ tempAvatar: e.currentTarget.dataset.url })
  },

  saveProfile() {
    const { tempNickname, tempAvatar, userInfo } = this.data
    wx.showLoading({ title: '保存中...' })
    
    wx.request({
      url: `http://localhost:3000/api/users/${userInfo.id}`,
      method: 'PUT',
      data: {
        nickname: tempNickname,
        avatar: tempAvatar
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.success) {
          const newUserInfo = { ...userInfo, nickname: tempNickname, avatar: tempAvatar }
          wx.setStorageSync('userInfo', newUserInfo)
          this.setData({
            userInfo: newUserInfo,
            showEditModal: false
          })
          wx.showToast({ title: '修改成功', icon: 'success' })
        } else {
          wx.showToast({ title: res.data.message || '修改失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  handleMenu(e) {
    const id = e.currentTarget.dataset.id
    const menu = this.data.menuList.find(m => m.id === id)
    if (menu && menu.url) {
      if (menu.id === 3) getApp().globalData.targetTab = 1
      wx.switchTab({
        url: menu.url,
        fail: () => wx.navigateTo({ url: menu.url })
      })
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          this.setData({ isLoggedIn: false, userInfo: null })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  }
})