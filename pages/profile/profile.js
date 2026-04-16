const API = require('../../utils/api.js')

Page({
  data: {
    navBarTotalHeight: 0,
    isLoggedIn: false,
    userInfo: null,
    sleepRecords: [],
    recentSleepData: [],
    totalSleepDays: 0,
    continuousSleepDays: 0,
    
    // 用户信息表弹窗
    showUserInfoForm: false,
    userInfoForm: {
      babyName: '',
      birthday: '',
      premature: 'no',
      prematureWeeks: 0,
      hasRisk: 'no',
      caregiver: '',
      familyLanguage: ''
    },
    
    // 出生日期选择器
    birthYearRange: [],
    birthYearIndex: 0,
    birthMonthRange: Array.from({length: 12}, (_, i) => i + 1),
    birthMonthIndex: 0,
    birthDayRange: Array.from({length: 31}, (_, i) => i + 1),
    birthDayIndex: 0,
    calculatedAge: 0,
    
    // 早产周数选择
    prematureWeekRange: Array.from({length: 12}, (_, i) => `早产${i + 1}周`),
    prematureWeekIndex: 0,
    
    // 养育者选项
    caregiverOptions: ['父母', '祖父母', '外祖父母', '保姆/月嫂', '托育机构', '其他'],
    caregiverIndex: 0,
    
    // 语言环境选项
    languageOptions: ['普通话', '方言', '普通话+方言', '英语', '其他语言'],
    languageIndex: 0
  },
  
  // 初始化出生年份范围（最近10年）
  initBirthYearRange() {
    const currentYear = new Date().getFullYear()
    const years = Array.from({length: 10}, (_, i) => currentYear - i)
    this.setData({ birthYearRange: years })
  },

  onLoad(options) {
    try {
      const { totalHeight } = require('../../utils/navBar.js').getNavBarHeight()
      this.setData({ navBarTotalHeight: totalHeight })
      
      this.checkLoginStatus()
    } catch (error) {
      console.error('导航栏高度计算失败：', error)
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
      isLoggedIn,
      userInfo: isLoggedIn ? {
        username: `用户${userId}`,
        uid: `UID: ${userId}${Date.now()}`
      } : null
    }, () => {
      // setData回调中加载小睡记录
      if (isLoggedIn) {
        this.loadSleepRecords()
      }
    })
  },

  // 加载小睡记录
  loadSleepRecords() {
    const napRecords = wx.getStorageSync('napRecords') || []
    const checkInRecords = wx.getStorageSync('sleepCheckInRecords') || []
    
    // 计算打卡天数
    const totalSleepDays = checkInRecords.length
    const continuousSleepDays = this.calculateContinuousDays(checkInRecords)
    
    // 处理最近7天的小睡数据，用于展示折线图
    const recentSleepData = this.processRecentSleepData(napRecords)
    
    this.setData({
      sleepRecords: napRecords,
      recentSleepData: recentSleepData,
      totalSleepDays: totalSleepDays,
      continuousSleepDays: continuousSleepDays
    })
  },

  // 计算连续打卡天数
  calculateContinuousDays(checkInRecords) {
    if (checkInRecords.length === 0) return 0
    
    // 按日期排序（从新到旧）
    const sortedRecords = [...checkInRecords].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    let continuousDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 检查今天是否打卡
    const todayStr = this.formatDate(today)
    const todayChecked = sortedRecords.some(record => record.date === todayStr)
    
    // 如果今天没打卡，从昨天开始计算
    let checkDate = todayChecked ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDateStr = this.formatDate(checkDate)
      const hasRecord = sortedRecords.some(record => record.date === recordDateStr)
      
      if (hasRecord) {
        continuousDays++
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
      } else {
        break
      }
    }
    
    return continuousDays
  },

  // 处理最近7天的小睡数据
  processRecentSleepData(records) {
    const now = new Date()
    const recentData = []
    
    // 生成最近7天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = this.formatDate(date)
      
      // 查找该日期的小睡记录
      const dayRecords = records.filter(record => record.date === dateStr)
      // duration 是秒数，转换为分钟
      const totalMinutes = dayRecords.reduce((sum, record) => sum + (record.durationMinutes || 0), 0)
      
      recentData.push({
        date: dateStr,
        duration: totalMinutes,
        day: date.getDate()
      })
    }
    
    return recentData
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  goToSetting() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.showActionSheet({
      itemList: ['退出登录'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.logout()
        }
      }
    })
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userId')
          wx.removeStorageSync('token')
          wx.removeStorageSync('babyId')
          wx.removeStorageSync('babyBirthday')
          
          this.setData({ 
            isLoggedIn: false,
            userInfo: null
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 显示用户信息表弹窗
  showUserInfoForm() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    // 初始化年份范围
    this.initBirthYearRange()
    
    // 从本地存储加载已保存的信息
    const savedInfo = wx.getStorageSync('userInfoForm') || {}
    
    // 解析已保存的出生日期
    let birthYearIndex = 0
    let birthMonthIndex = 0
    let birthDayIndex = 0
    let caregiverIndex = 0
    let languageIndex = 0
    
    if (savedInfo.birthday) {
      const parts = savedInfo.birthday.split('-')
      if (parts.length === 3) {
        const year = parseInt(parts[0])
        const month = parseInt(parts[1])
        const day = parseInt(parts[2])
        const currentYear = new Date().getFullYear()
        birthYearIndex = currentYear - year
        birthMonthIndex = month - 1
        birthDayIndex = day - 1
      }
    }
    
    // 查找养育者索引
    if (savedInfo.caregiver) {
      caregiverIndex = this.data.caregiverOptions.indexOf(savedInfo.caregiver)
      if (caregiverIndex === -1) caregiverIndex = 0
    }
    
    // 查找语言环境索引
    if (savedInfo.familyLanguage) {
      languageIndex = this.data.languageOptions.indexOf(savedInfo.familyLanguage)
      if (languageIndex === -1) languageIndex = 0
    }
    
    this.setData({
      showUserInfoForm: true,
      userInfoForm: {
        babyName: savedInfo.babyName || '',
        birthday: savedInfo.birthday || '',
        premature: savedInfo.premature || 'no',
        prematureWeeks: savedInfo.prematureWeeks || 0,
        hasRisk: savedInfo.hasRisk || 'no',
        caregiver: savedInfo.caregiver || this.data.caregiverOptions[0],
        familyLanguage: savedInfo.familyLanguage || this.data.languageOptions[0]
      },
      birthYearIndex,
      birthMonthIndex,
      birthDayIndex,
      caregiverIndex,
      languageIndex
    })
    
    // 计算月龄
    this.calculateAge()
  },

  // 关闭用户信息表弹窗
  closeUserInfoForm() {
    this.setData({ showUserInfoForm: false })
  },

  // 计算月龄
  calculateAge() {
    const { birthYearRange, birthYearIndex, birthMonthRange, birthMonthIndex, birthDayRange, birthDayIndex } = this.data
    
    if (birthYearRange.length === 0) return
    
    const year = birthYearRange[birthYearIndex]
    const month = birthMonthRange[birthMonthIndex]
    const day = birthDayRange[birthDayIndex]
    
    const birthDate = new Date(year, month - 1, day)
    const today = new Date()
    
    let ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12
    ageInMonths += today.getMonth() - birthDate.getMonth()
    
    if (today.getDate() < birthDate.getDate()) {
      ageInMonths--
    }
    
    // 更新生日字符串和月龄
    const birthday = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    this.setData({
      'userInfoForm.birthday': birthday,
      calculatedAge: Math.max(0, ageInMonths)
    })
    
    // 保存到本地存储
    wx.setStorageSync('babyBirthday', birthday)
    wx.setStorageSync('babyAgeMonths', Math.max(0, ageInMonths))
  },

  // 出生日期选择器事件
  onBirthYearChange(e) {
    this.setData({ birthYearIndex: parseInt(e.detail.value) }, () => {
      this.calculateAge()
    })
  },

  onBirthMonthChange(e) {
    this.setData({ birthMonthIndex: parseInt(e.detail.value) }, () => {
      this.calculateAge()
    })
  },

  onBirthDayChange(e) {
    this.setData({ birthDayIndex: parseInt(e.detail.value) }, () => {
      this.calculateAge()
    })
  },

  // 早产周数选择
  onPrematureWeekChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      prematureWeekIndex: index,
      'userInfoForm.prematureWeeks': index + 1
    })
  },

  // 养育者选择
  onCaregiverChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      caregiverIndex: index,
      'userInfoForm.caregiver': this.data.caregiverOptions[index]
    })
  },

  // 语言环境选择
  onLanguageChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      languageIndex: index,
      'userInfoForm.familyLanguage': this.data.languageOptions[index]
    })
  },

  // 表单输入处理
  onBabyNameInput(e) {
    this.setData({ 'userInfoForm.babyName': e.detail.value })
  },

  onPrematureChange(e) {
    this.setData({ 'userInfoForm.premature': e.currentTarget.dataset.value })
  },

  onRiskChange(e) {
    this.setData({ 'userInfoForm.hasRisk': e.currentTarget.dataset.value })
  },

  // 保存用户信息
  saveUserInfo() {
    const { babyName, birthday } = this.data.userInfoForm
    
    if (!babyName || !birthday) {
      wx.showToast({ title: '请填写宝宝姓名和出生日期', icon: 'none' })
      return
    }
    
    // 保存到本地存储
    wx.setStorageSync('userInfoForm', this.data.userInfoForm)
    
    // 更新显示的用户名
    this.setData({
      'userInfo.username': babyName,
      showUserInfoForm: false
    })
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  goToCalendar() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.navigateTo({
      url: '/pages/calendar/calendar',
      fail: (err) => {
        wx.showToast({
          title: '记录日历跳转失败',
          icon: 'none'
        })
        console.error('跳转失败原因：', err)
      }
    })
  },

  goToReport() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.navigateTo({
      url: '/pages/report-cognition/report-cognition',
      fail: (err) => {
        wx.showToast({
          title: '报告页面跳转失败',
          icon: 'none'
        })
        console.error('跳转失败原因：', err)
      }
    })
  },

  goToCollection() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-collection/my-collection',
      fail: (err) => {
        wx.showToast({
          title: '收藏页面跳转失败',
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

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  onShareAppMessage() {
    return {
      title: '咿呀智库·我的',
      path: '/pages/profile/profile'
    }
  }
})