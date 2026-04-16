import { getNavBarHeight } from '../../utils/navBar.js';
const { articleList } = require('../../mock/article-data.js');

Page({
  data: {
    navBarTotalHeight: 0,
    keyword: '',
    resultList: []
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

    const keyword = options.keyword || '';
    this.setData({ keyword });
    this.searchArticles(keyword);
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  onInput(e) {
    this.setData({
      keyword: e.detail.value || ''
    });
  },

  onSearch() {
    this.searchArticles(this.data.keyword);
  },

  searchArticles(keyword) {
    const kw = (keyword || '').trim();

    if (!kw) {
      this.setData({
        resultList: articleList
      });
      return;
    }

    const resultList = articleList.filter((item) => {
      return (
        item.title.includes(kw) ||
        item.author.includes(kw) ||
        item.content.includes(kw)
      );
    });

    this.setData({
      resultList
    });
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${id}`
    });
  }
});
