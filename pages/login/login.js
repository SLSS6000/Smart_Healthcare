Page({
  data: {
    username: '',
    password: '',
    showPassword: false,
    remember: false
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  onRememberChange(e) {
    const value = e.detail.value
    this.setData({
      remember: value.includes('remember')
    })
  },

  forgotPassword() {
    wx.showToast({
      title: '请联系客服找回密码',
      icon: 'none'
    })
  },

  doLogin() {
    const { username, password } = this.data

    if (!username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
      return
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    wx.request({
      url: 'http://localhost:3000/api/login',
      method: 'POST',
      data: {
        username: username,
        password: password
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.data.success) {
          const userInfo = {
            id: res.data.data.id,
            username: res.data.data.username,
            nickname: res.data.data.nickname,
            avatar: res.data.data.avatar,
            isLoggedIn: true,
            loginTime: res.data.data.loginTime
          }

          wx.setStorageSync('userInfo', userInfo)

          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }, 1500)
            }
          })
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
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

  loginWithWechat() {
    wx.showToast({
      title: '微信登录功能开发中',
      icon: 'none'
    })
  },

  loginWithPhone() {
    wx.showToast({
      title: '手机验证码登录开发中',
      icon: 'none'
    })
  },

  goToRegister() {
    wx.showToast({
      title: '注册功能开发中',
      icon: 'none'
    })
  }
})
