import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'function',
    navBarTotalHeight: 0, // 存储动态导航栏总高度
    // 用户信息
    username: '用户852212688',
    ageOptions: ['1', '2', '3', '4', '5'], // 年龄选项
    currentAgeIndex: 0, // 当前选中的年龄索引
    // 功能列表数据
    functionList: [
      {
        id: 1,
        title: '干预任务智能推送',
        icon: '/images/tab/bottom1.png' // 替换为实际图标路径
      },
      {
        id: 2,
        title: 'AI场景模拟测评',
        icon: '/images/tab/bottom2.png'
      },
      {
        id: 3,
        title: '故事共读',
        icon: '/images/tab/bottom3.png'
      },
      {
        id: 4,
        title: 'AI智能体',
        icon: '/images/tab/bottom4.png'
      },
      {
        id: 5,
        title: '每日养育观察',
        icon: '/images/tab/bottom1.png'
      }
    ]
  },

  /**
   * 年龄选择器变化事件
   */
  onAgeChange(e) {
    const index = e.detail.value;
    this.setData({
      currentAgeIndex: index
    });
    // 可在此处添加年龄变化后的业务逻辑（如重新加载适配该年龄的功能）
  },

  /**
   * 功能卡片点击事件
   */
  onFunctionTap(e) {
    const { id } = e.currentTarget.dataset;
    switch (id) {
      case 1:
        wx.navigateTo({ url: '/pages/smart-tasks/smart-tasks' });
        break;
      case 2:
        wx.navigateTo({ url: '/pages/ai-scene/ai-scene' });
        break;
      case 3:
        wx.navigateTo({ url: '/pages/story/story' });
        break;
      case 4:
        wx.navigateTo({ url: '/pages/ai-agent/ai-agent' });
        break;
      case 5:
      case '5':
        wx.navigateTo({ url: '/pages/task/task' });
        break;
    }
  },

  /**
   * 底部Tab切换
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    wx.switchTab({
      url: `/pages/${tab}/${tab}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算并设置动态导航栏高度
    const { totalHeight } = getNavBarHeight();
    this.setData({
      navBarTotalHeight: totalHeight
    });
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