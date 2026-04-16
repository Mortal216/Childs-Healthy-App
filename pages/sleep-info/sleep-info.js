import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarTotalHeight: 0
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/profile/profile'
        });
      }
    });
  },

  onLoad(options) {
    // 计算动态导航栏高度（异常兜底）
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      console.error('导航栏高度计算失败：', error);
      this.setData({
        navBarTotalHeight: 100 // 兜底高度，适配大部分机型
      });
    }
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: '小睡的重要性',
      path: '/pages/sleep-info/sleep-info'
    };
  }
});