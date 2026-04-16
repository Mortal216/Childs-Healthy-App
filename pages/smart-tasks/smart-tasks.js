// 智能任务推送页面
const TaskGenerator = require('../../utils/taskGenerator.js');

Page({
  data: {
    tasks: [],
    currentTime: '',
    timeSlot: '',
    loading: false,
    userId: 'default_user', // 默认用户ID，实际项目中应从登录状态获取
    navBarTotalHeight: 0 // 导航栏总高度
  },

  onLoad() {
    // 计算导航栏高度
    this.calculateNavBarHeight()
    // 页面加载时获取任务
    this.getTasks()
  },

  /**
   * 计算导航栏高度
   */
  calculateNavBarHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight
    const navBarHeight = 44 // 导航栏默认高度
    this.setData({
      navBarTotalHeight: statusBarHeight + navBarHeight
    })
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 获取智能任务
   */
  getTasks() {
    this.setData({ loading: true })
    
    // 模拟测评结果，实际项目中应从后端获取
    const mockAssessment = {
      vocabularyScore: 65,
      interactionScore: 72,
      languageEnvScore: 68
    }
    
    try {
      // 使用前端工具类生成任务
      const result = TaskGenerator.generateTasks({
        assessment: mockAssessment
      })
      
      console.log('获取任务成功:', result)
      
      if (result.success) {
        const data = result.data
        this.setData({
          tasks: data.tasks,
          currentTime: this.formatTime(data.currentTime),
          timeSlot: data.timeSlot
        })
      } else {
        wx.showToast({
          title: '获取任务失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('获取任务失败:', err)
      wx.showToast({
        title: '获取任务失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 刷新任务
   */
  refreshTasks() {
    this.getTasks()
  },

  /**
   * 格式化时间显示
   * @param {string} isoTime - ISO格式时间
   * @returns {string} 格式化后的时间
   */
  formatTime(isoTime) {
    const date = new Date(isoTime)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
})