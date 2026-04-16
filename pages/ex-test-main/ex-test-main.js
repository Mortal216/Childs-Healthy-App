import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarTotalHeight: 0
  },

  goToConversation() {
    wx.navigateTo({
      url: '/pages/ex-test-conversation/ex-test-conversation'
    })
  },

  goToInteraction() {
    wx.navigateTo({
      url: '/pages/ex-test-interaction/ex-test-interaction'
    })
  },

  goToAtmosphere() {
    wx.navigateTo({
      url: '/pages/ex-test-environment/ex-test-environment'
    })
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
  },

  onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      })
    } catch (e) {
      this.setData({ navBarTotalHeight: 100 })
    }
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})