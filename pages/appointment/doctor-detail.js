Page({
  data: {
    doctor: {},
    availableDates: [],
    availableTimes: [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ],
    selectedDate: '',
    selectedTime: '',
    patientName: '',
    phone: '',
    symptoms: '',
    showConfirmModal: false,
    disabledTimes: ['08:00', '09:00', '14:00']
  },

  onLoad(options) {
    if (options.id) {
      this.loadDoctorDetail(options.id)
    }
    this.generateAvailableDates()
    const userInfo = wx.getStorageSync('userInfo') || {}
    if (userInfo.nickname) {
      this.setData({ patientName: userInfo.nickname })
    }
  },

  loadDoctorDetail(id) {
    wx.showLoading({ title: '加载中...' })
    wx.request({
      url: 'http://localhost:3000/api/doctors',
      success: (res) => {
        wx.hideLoading()
        if (res.data.success) {
          const doctorData = res.data.data.find(d => d.id === parseInt(id))
          if (doctorData) {
            const doctor = {
              ...doctorData,
              avatar: doctorData.avatar || `/images/doctor${id}.png`
            }
            this.setData({ doctor })
            wx.setNavigationBarTitle({ title: doctor.name })
          } else {
            wx.showToast({ title: '医生不存在', icon: 'none' })
          }
        } else {
          wx.showToast({ title: '获取医生信息失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  generateAvailableDates() {
    const dates = []
    const today = new Date()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDay = weekDays[date.getDay()]
      const fullDate = `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      
      let status = 'available'
      if (Math.random() > 0.8) {
        status = 'full'
      }
      
      dates.push({
        date: fullDate,
        day: `${month}/${day}`,
        week: weekDay,
        status
      })
    }
    
    this.setData({ availableDates: dates })
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date
    const dateItem = this.data.availableDates.find(d => d.date === date)
    if (dateItem && dateItem.status !== 'full') {
      this.setData({ 
        selectedDate: date,
        selectedTime: ''
      })
    }
  },

  selectTime(e) {
    const time = e.currentTarget.dataset.time
    if (!this.isTimeDisabled(time)) {
      this.setData({ selectedTime: time })
    }
  },

  isTimeDisabled(time) {
    return this.data.disabledTimes.includes(time)
  },

  onPatientNameInput(e) {
    this.setData({ patientName: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onSymptomsInput(e) {
    this.setData({ symptoms: e.detail.value })
  },

  submitBooking() {
    if (!this.data.selectedDate) {
      wx.showToast({ title: '请选择就诊日期', icon: 'none' })
      return
    }
    
    if (!this.data.selectedTime) {
      wx.showToast({ title: '请选择就诊时间', icon: 'none' })
      return
    }
    
    if (!this.data.patientName.trim()) {
      wx.showToast({ title: '请输入就诊人姓名', icon: 'none' })
      return
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(this.data.phone)) {
      wx.showToast({ title: '请输入正确的手机号码', icon: 'none' })
      return
    }
    
    this.setData({ showConfirmModal: true })
  },

  closeModal() {
    this.setData({ showConfirmModal: false })
  },

  stopPropagation() {
  },

  confirmBooking() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const userId = userInfo.id || 1
    
    wx.showLoading({ title: '提交中...' })
    
    wx.request({
      url: 'http://localhost:3000/api/appointments',
      method: 'POST',
      data: {
        user_id: userId,
        doctor_id: this.data.doctor.id,
        date: this.data.selectedDate,
        time: this.data.selectedTime,
        patient_name: this.data.patientName,
        phone: this.data.phone,
        symptoms: this.data.symptoms
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.success) {
          this.setData({
            showConfirmModal: false
          })
          wx.showToast({ 
            title: '预约成功', 
            icon: 'success',
            duration: 1500
          })
          setTimeout(() => {
            const app = getApp()
            app.globalData.targetTab = 0
            wx.switchTab({
              url: '/pages/appointment/appointment'
            })
          }, 1500)
        } else {
          wx.showToast({ title: res.data.message || '预约失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  }
})
