import { getNavBarHeight } from '../../utils/navBar.js';
const { buildReportFromAi } = require('../../utils/dialogue-result-normalize.js');

Page({
  data: {
    navBarTotalHeight: 0,
    report: null
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }
    });
  },

  goToHelp() {
    wx.showToast({
      title: '帮助功能即将上线',
      icon: 'none',
      duration: 2000
    });
  },

  reAnalyze() {
    wx.navigateBack({
      delta: 1
    });
  },

  viewDetailReport() {
    wx.navigateTo({
      url: '/pages/report-child/report-child',
      fail: () => {
        wx.showToast({
          title: '报告页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      console.error('导航栏高度计算失败：', error);
      this.setData({
        navBarTotalHeight: 100
      });
    }

    if (options.reportData) {
      try {
        const report = JSON.parse(decodeURIComponent(options.reportData));
        this.setData({ report });
      } catch (error) {
        console.error('解析 reportData 失败：', error);
      }
      return;
    }

    if (options.analysisData) {
      try {
        const ai = JSON.parse(decodeURIComponent(options.analysisData));
        const report = buildReportFromAi(ai, '', {});
        this.setData({ report });
      } catch (error) {
        console.error('解析 analysisData 失败：', error);
      }
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
      title: '咿呀智库·对话分析结果',
      path: '/pages/dialogue-result/dialogue-result'
    };
  }
});
