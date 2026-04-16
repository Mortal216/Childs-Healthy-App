import { getNavBarHeight } from '../../utils/navBar.js';
const { getArticleById } = require('../../mock/article-data.js');

Page({
  data: {
    navBarTotalHeight: 0,
    article: null
  },

  onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (e) {
      this.setData({
        navBarTotalHeight: 100
      });
    }

    const id = options.id || '';
    const article = getArticleById(id);

    if (!article) {
      wx.showToast({
        title: '文章不存在',
        icon: 'none'
      });
      return;
    }

    this.setData({
      article
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
