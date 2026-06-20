Page({
  data: {
    departments: [],
    doctors: [],
    allDoctors: [],
    myAppointments: [],
    loading: true,
    error: '',
    searchKeyword: '',
    activeTab: 0 // 0: 预约挂号, 1: 我的预约
  },

  onLoad(options) {
    if (options.tab) {
      this.setData({ activeTab: parseInt(options.tab) })
    }
    this.loadData()
  },

  onShow() {
    // 检查是否有跨页面传递的 Tab 指令
    const app = getApp()
    if (app.globalData.targetTab !== null) {
      this.setData({ activeTab: app.globalData.targetTab })
      app.globalData.targetTab = null // 使用后清除
    }

    // 每次显示页面时刷新预约数据，以防从详情页返回
    if (this.data.activeTab === 1) {
      this.loadAppointments()
    }
  },

  loadData() {
    this.setData({ loading: true, error: '' })
    
    const promises = [
      this.loadDepartments(),
      this.loadDoctors(),
      this.loadAppointments()
    ]
    
    Promise.all(promises)
      .then(() => {
        this.setData({ loading: false })
      })
      .catch(err => {
        this.setData({ 
          loading: false, 
          error: '网络连接失败，请检查服务器是否运行' 
        })
        console.error('加载数据失败:', err)
      })
  },

  loadDepartments() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:3000/api/departments',
        success: (res) => {
          if (res.data.success) {
            const departments = res.data.data.map(d => ({
              ...d,
              bgColor: d.bgColor || this.getRandomBgColor(),
              localImage: `/images/icon${d.id}.png`,
              showEmoji: false
            }))
            this.setData({ departments })
            resolve()
          } else {
            reject(res.data.message)
          }
        },
        fail: reject
      })
    })
  },

  loadDoctors() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:3000/api/doctors',
        success: (res) => {
          if (res.data.success) {
            const doctors = res.data.data.map(d => ({
              ...d,
              avatar: d.avatar || `/images/doctor${d.id}.png`,
              reviewCount: d.consultCount
            }))
            this.setData({ 
              doctors: doctors,
              allDoctors: doctors
            })
            resolve()
          } else {
            reject(res.data.message)
          }
        },
        fail: reject
      })
    })
  },

  loadAppointments() {
    return new Promise((resolve, reject) => {
      const userInfo = wx.getStorageSync('userInfo') || {}
      const userId = userInfo.id || 1

      wx.request({
        url: `http://localhost:3000/api/appointments/${userId}`,
        success: (res) => {
          if (res.data.success) {
            const myAppointments = res.data.data.map(a => {
              const doctor = a.doctor || {}
              return {
                ...a,
                doctor: doctor.name || '未知医生',
                title: doctor.title || '医师',
                department: doctor.department || '通用科室',
                avatar: doctor.avatar || '/images/doctor1.png',
                hospital: doctor.hospital || '市第一人民医院',
                statusText: a.statusText || (a.status === 'completed' ? '已完成' : '待就诊'),
                statusColor: a.statusColor || (a.status === 'completed' ? '#52c41a' : '#1890ff')
              }
            })
            this.setData({ myAppointments })
            resolve()
          } else {
            reject(res.data.message)
          }
        },
        fail: reject
      })
    })
  },

  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab)
    this.setData({ activeTab: tab })
    if (tab === 1) {
      this.loadAppointments()
    }
  },

  cancelAppointment(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '取消预约',
      content: '确定要取消这次预约吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' })
          wx.request({
            url: `http://localhost:3000/api/appointments/${id}`,
            method: 'DELETE',
            success: (res) => {
              wx.hideLoading()
              if (res.data.success) {
                const myAppointments = this.data.myAppointments.filter(item => item.id !== id)
                this.setData({ myAppointments })
                wx.showToast({ title: '预约已取消', icon: 'success' })
              } else {
                wx.showToast({ title: res.data.message || '取消失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  viewAppointmentDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '正在开发中...',
      icon: 'none'
    })
  },

  getRandomBgColor() {
    const colors = ['#e6f7ff', '#fff1f0', '#fff7e6', '#f6ffed', '#f9f0ff', '#e6fffb', '#fff0f6', '#f5f5f5']
    return colors[Math.floor(Math.random() * colors.length)]
  },

  onDeptImageError(e) {
    const index = e.currentTarget.dataset.index
    const departments = [...this.data.departments]
    if (departments[index]) {
      departments[index].showEmoji = true
      this.setData({ departments })
    }
  },

  onDeptImageLoad(e) {
    const index = e.currentTarget.dataset.index
    const departments = [...this.data.departments]
    if (departments[index]) {
      departments[index].imageLoaded = true
      departments[index].showEmoji = false
      this.setData({ departments })
    }
  },

  selectDept(e) {
    const name = e.currentTarget.dataset.name
    this.setData({ searchKeyword: name })
    this.filterDoctors(name)
  },

  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    this.filterDoctors(keyword)
  },

  filterDoctors(keyword) {
    if (!keyword.trim()) {
      this.setData({ doctors: this.data.allDoctors })
      return
    }
    
    const filtered = this.data.allDoctors.filter(doctor => 
      doctor.name.includes(keyword) ||
      doctor.department.includes(keyword) ||
      doctor.hospital.includes(keyword) ||
      doctor.tags.some(tag => tag.includes(keyword))
    )
    
    this.setData({ doctors: filtered })
  },

  goToDoctorDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/appointment/doctor-detail?id=${id}`
    })
  }
})
