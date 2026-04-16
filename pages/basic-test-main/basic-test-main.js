const API = require('../../utils/api.js')

Page({
  data: {
    navBarTotalHeight: 0,
    userId: null,
    babyId: null,
    scales: [],
    selectedScale: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    loading: true
  },

  onLoad(options) {
    try {
      const { totalHeight } = require('../../utils/navBar.js').getNavBarHeight()
      this.setData({ navBarTotalHeight: totalHeight })
      
      this.loadUserData()
      this.loadScales()
    } catch (err) {
      this.setData({ navBarTotalHeight: 100 })
    }
  },

  loadUserData() {
    const userId = wx.getStorageSync('userId')
    const babyId = wx.getStorageSync('babyId')
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }
    this.setData({ userId, babyId })
  },

  loadScales() {
    wx.showLoading({ title: '加载量表...' })
    
    API.assessment.getScales()
      .then(scales => {
        this.setData({ 
          scales,
          loading: false
        })
        wx.hideLoading()
      })
      .catch(err => {
        this.setData({ loading: false })
        wx.hideLoading()
        wx.showToast({
          title: '加载量表失败',
          icon: 'none'
        })
      })
  },

  onSelectScale(e) {
    const scaleId = e.currentTarget.dataset.scaleId
    const selectedScale = this.data.scales.find(s => s.scale_id === scaleId)
    this.setData({ selectedScale })
    this.loadQuestions(scaleId)
  },

  loadQuestions(scaleId) {
    const babyAge = this.getBabyAge()
    const ageGroup = this.getAgeGroup(babyAge)
    
    wx.showLoading({ title: '加载题目...' })
    
    API.assessment.getScaleQuestions(scaleId, ageGroup)
      .then(questions => {
        this.setData({ 
          questions,
          currentQuestionIndex: 0,
          answers: {}
        })
        wx.hideLoading()
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '加载题目失败',
          icon: 'none'
        })
      })
  },

  getBabyAge() {
    const babyBirthday = wx.getStorageSync('babyBirthday')
    if (!babyBirthday) return 12
    const birthDate = new Date(babyBirthday)
    const now = new Date()
    const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + 
                        (now.getMonth() - birthDate.getMonth())
    return Math.max(1, ageInMonths)
  },

  getAgeGroup(ageInMonths) {
    if (ageInMonths <= 16) return '8~16个月'
    if (ageInMonths <= 30) return '16~30个月'
    return '16~30个月'
  },

  onAnswer(e) {
    const questionId = e.currentTarget.dataset.questionId
    const answer = e.detail.value
    this.setData({
      [`answers.${questionId}`]: answer
    })
  },

  onNextQuestion() {
    const currentQuestion = this.data.questions[this.data.currentQuestionIndex]
    if (!this.data.answers[currentQuestion.question_id]) {
      wx.showToast({
        title: '请先回答当前问题',
        icon: 'none'
      })
      return
    }

    if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
      this.setData({
        currentQuestionIndex: this.data.currentQuestionIndex + 1
      })
    } else {
      this.submitAssessment()
    }
  },

  onPreviousQuestion() {
    if (this.data.currentQuestionIndex > 0) {
      this.setData({
        currentQuestionIndex: this.data.currentQuestionIndex - 1
      })
    }
  },

  submitAssessment() {
    wx.showLoading({ title: '提交测评...' })
    
    const assessmentData = {
      user_id: parseInt(this.data.userId) || 1,
      baby_id: this.data.babyId || 1,
      scale_id: this.data.selectedScale.scale_id,
      age_group: this.getAgeGroup(this.getBabyAge()),
      age_months: this.getBabyAge(),
      gender: 'female', // 默认女
      answers: Object.entries(this.data.answers).map(([question_id, selected_option]) => ({
        question_id,
        selected_option
      })),
      test_duration: this.calculateTestDuration()
    }

    API.assessment.submitAssessment(assessmentData)
      .then(result => {
        wx.hideLoading()
        wx.showToast({
          title: '测评完成',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/report-child/report-child?assessmentId=${result.id}`
          })
        }, 1500)
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        })
      })
  },

  calculateTestDuration() {
    return Math.floor((Date.now() - this.startTime) / 1000) || 300
  },

  onReady() {
    this.startTime = Date.now()
  },

  onStartVocabTest() {
    // 跳转到测评选择页面（选择0-18或18-30月龄）
    wx.showToast({
      title: '正在加载幼儿词汇测试...',
      icon: 'none'
    })
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/basic-test-sub1/basic-test-sub1',
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '页面不存在',
            icon: 'none'
          })
        }
      })
    }, 1000)
  },

  onStartParentingTest() {
    // 模拟加载抚养方式测评
    wx.showToast({
      title: '正在加载抚养方式测评...',
      icon: 'none'
    })
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/basic-test-fuyang/basic-test-fuyang',
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '页面不存在',
            icon: 'none'
          })
        }
      })
    }, 1000)
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }
    })
  }
})