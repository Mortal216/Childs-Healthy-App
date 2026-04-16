import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarTotalHeight: 0
  },

  // 返回上一页（回到profile页面）
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

  // 帮助按钮点击
  goToHelp() {
    wx.showToast({
      title: '我的收藏帮助即将上线',
      icon: 'none',
      duration: 2000
    });
  },

  // 跳转到收藏文章详情页
  goToArticle(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${id}`,
      fail: (err) => {
        wx.showToast({
          title: '文章页面跳转失败',
          icon: 'none'
        });
        console.error('跳转失败原因：', err);
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
      title: '咿呀智库·我的收藏',
      path: '/pages/my-collection/my-collection'
    };
  }
});