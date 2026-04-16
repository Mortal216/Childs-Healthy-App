import { getNavBarHeight } from '../../utils/navBar.js';
const API = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,
    // 默认选中第一个选项，贴合抚养方式测评的常见场景
    selectedOptions: ['mom', '30-60', 'comfort', 'sometimes', 'guide'],
    userId: null,
    babyId: null,
    startTime: Date.now()
  },

  /**
   * 选择选项
   */
  selectOption(e) {
    const { index, value } = e.currentTarget.dataset;
    const selectedOptions = [...this.data.selectedOptions];
    selectedOptions[index] = value;
    this.setData({
      selectedOptions
    });
  },

  /**
   * 提交测评
   */
  goToNextPage() {
    wx.showLoading({ title: '提交测评...' });
    
    // 构建测评数据（抚养方式测评）
    const selectedOptions = this.data.selectedOptions;
    
    // 将选项转换为答案格式
    const optionMapping = {
      // 问题1: 主要抚养人
      'mom': 0, 'dad': 1, 'grandma': 2, 'other': 3,
      // 问题2: 陪伴时间
      'lt30': 0, '30-60': 1, 'gt60': 2,
      // 问题3: 情绪应对
      'comfort': 0, 'ignore': 1, 'scold': 2, 'indulge': 3,
      // 问题4: 自主性培养
      'always': 0, 'sometimes': 1, 'never': 2,
      // 问题5: 教育理念
      'free': 0, 'strict': 1, 'happy': 2, 'guide': 3
    };
    
    const answers = [
      { question_id: 'PARENTING_001', selected_option: optionMapping[selectedOptions[0]] || 0 },
      { question_id: 'PARENTING_002', selected_option: optionMapping[selectedOptions[1]] || 0 },
      { question_id: 'PARENTING_003', selected_option: optionMapping[selectedOptions[2]] || 0 },
      { question_id: 'PARENTING_004', selected_option: optionMapping[selectedOptions[3]] || 0 },
      { question_id: 'PARENTING_005', selected_option: optionMapping[selectedOptions[4]] || 0 }
    ];
    
    const assessmentData = {
      user_id: parseInt(this.data.userId) || 1,
      baby_id: this.data.babyId || 1,
      scale_id: 'PARENTING_STYLE',
      age_group: '0~36个月',
      age_months: 24,
      gender: 'female',
      answers: answers,
      test_duration: this.calculateTestDuration()
    };
    
    console.log('测评数据：', assessmentData);
    
    // 提交测评
    API.assessment.submitAssessment(assessmentData)
      .then(result => {
        wx.hideLoading();
        wx.showToast({
          title: '测评完成',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/report-parenting/report-parenting?assessmentId=${result.id}`,
            fail: (err) => {
              console.error('跳转失败:', err);
              wx.showToast({
                title: '页面不存在',
                icon: 'none'
              });
            }
          });
        }, 1500);
      })
      .catch(err => {
        console.error('提交测评失败：', err);
        wx.hideLoading();
        wx.showToast({
          title: '提交测评失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 返回按钮点击
   */
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算并设置动态导航栏高度（增加异常兜底）
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (err) {
      console.error('计算导航栏高度失败：', err);
      // 兜底：设置默认导航栏高度，避免页面布局错乱
      this.setData({
        navBarTotalHeight: 100 // 单位rpx，适配大部分机型
      });
    }
    
    // 加载用户数据
    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    const userId = wx.getStorageSync('userId');
    const babyId = wx.getStorageSync('babyId');
    
    this.setData({ userId, babyId });
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }
  },

  /**
   * 计算测评时长
   */
  calculateTestDuration() {
    return Math.floor((Date.now() - this.data.startTime) / 1000) || 300;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
});