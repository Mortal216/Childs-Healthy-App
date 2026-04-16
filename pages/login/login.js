const API = require('../../utils/api.js')

Page({
  data: {
    phoneNumber: '',
    statusBarHeight: 0
  },

  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  onLogin() {
    const { phoneNumber } = this.data
    if (!phoneNumber || phoneNumber.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '登录中...'
    })

    API.auth.login(phoneNumber)
      .then(res => {
        wx.hideLoading()
        
        // 从响应中获取token和userId
        const token = res.access_token
        const userId = res.user_id || '1'
        
        wx.setStorageSync('userId', String(userId))
        wx.setStorageSync('token', token)
        wx.setStorageSync('phoneNumber', phoneNumber)
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          })
        }, 1500)
      })
      .catch(err => {
        wx.hideLoading()
        console.error('登录失败', err)
        wx.showToast({
          title: err.detail || '登录失败，请重试',
          icon: 'none'
        })
      })
  },

  onLoad(options) {
    const statusBarHeight = require('../../utils/navBar.js').getStatusBarHeight()
    this.setData({
      statusBarHeight
    })
  }
})