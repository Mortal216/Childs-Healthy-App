const API = require('../../utils/api.js')

Page({
  data: {
    navBarTotalHeight: 0,
    userId: null,
    babyId: null,
    hasAssessment: false,
    isLoggedIn: false
  },

  onLoad(options) {
    try {
      const { totalHeight } = require('../../utils/navBar.js').getNavBarHeight()
      this.setData({ navBarTotalHeight: totalHeight })
      
      this.checkLoginStatus()
    } catch (err) {
      this.setData({ navBarTotalHeight: 100 })
    }
  },

  onShow() {
    // 每次显示页面时重新检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    const isLoggedIn = !!(userId && token)
    
    this.setData({ 
      userId, 
      isLoggedIn,
      babyId: wx.getStorageSync('babyId')
    }, () => {
      // setData回调中检查是否需要获取测评历史
      if (isLoggedIn) {
        this.checkAssessmentStatus()
      }
    })
  },

  checkAssessmentStatus() {
    if (!this.data.userId) return
    
    API.assessment.getAssessmentHistory(this.data.userId)
      .then(history => {
        this.setData({ hasAssessment: history && history.length > 0 })
      })
      .catch(err => {
        console.error('获取测评历史失败', err)
      })
  },

  onBasicTest() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.navigateTo({
      url: '/pages/basic-test-main/basic-test-main',
      fail: (err) => {
        wx.showToast({
          title: '基础测评页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  onStartExTest() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.navigateTo({
      url: '/pages/ex-test-main/ex-test-main',
      fail: (err) => {
        wx.showToast({
          title: '拓展测评页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  onViewReport() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    if (!this.data.hasAssessment) {
      wx.showToast({
        title: '请先完成测评',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/report-child/report-child',
      fail: (err) => {
        wx.showToast({
          title: '报告页面跳转失败',
          icon: 'none'
        })
        console.error('报告页面跳转失败原因：', err)
      }
    })
  },

  goToConversation() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.navigateTo({
      url: '/pages/ex-test-conversation/ex-test-conversation',
      fail: (err) => {
        wx.showToast({
          title: '交流对话分析页面跳转失败',
          icon: 'none'
        })
        console.error('跳转失败原因：', err)
      }
    })
  },

  showLoginDialog() {
    wx.showModal({
      title: '提示',
      content: '请先登录以使用此功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  },



  goToHelp() {
    wx.showToast({
      title: '帮助功能即将上线',
      icon: 'none',
      duration: 2000
    })
  }
})