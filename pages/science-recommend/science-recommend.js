import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarTotalHeight: 0,
    recentArticles: [
      {
        id: 1,
        title: '2026年最新研究：0-3岁宝宝语言发展的关键期',
        source: '中国儿童发展研究中心',
        publishTime: '2026-02-25',
        summary: '最新研究表明，0-3岁是宝宝语言发展的黄金期，家庭语言环境对语言能力发展有着至关重要的影响...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20reading%20book%20to%20baby%20language%20development%20warm%20home%20setting&image_size=square'
      },
      {
        id: 2,
        title: '大数据分析：如何打造最佳家庭语言环境',
        source: '育儿科学研究院',
        publishTime: '2026-02-24',
        summary: '基于10万家庭的数据研究，本文分析了家庭语言环境的关键因素，为家长提供了科学的语言启蒙建议...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20talking%20together%20language%20environment%20modern%20living%20room&image_size=square'
      },
      {
        id: 3,
        title: 'AI助力儿童语言发展：最新技术应用',
        source: '科技育儿前沿',
        publishTime: '2026-02-23',
        summary: '人工智能技术在儿童语言发展领域的最新应用，包括智能对话系统、个性化语言训练等创新方法...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20technology%20helping%20child%20language%20development%20interactive%20learning&image_size=square'
      },
      {
        id: 4,
        title: '亲子对话质量评估：新方法与标准',
        source: '早期教育研究',
        publishTime: '2026-02-22',
        summary: '本文介绍了亲子对话质量评估的新方法和标准，帮助家长识别和改进与孩子的沟通方式...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20child%20conversation%20quality%20assessment%20warm%20interaction&image_size=square'
      }
    ],
    loading: false
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search-ai/search-ai'
    });
  },

  goToRecommend() {
    wx.showToast({
      title: '当前在推荐页',
      icon: 'none'
    });
  },

  goToLiterature() {
    wx.navigateTo({
      url: '/pages/science-literature/science-literature'
    });
  },

  goToCommunity() {
    wx.navigateTo({
      url: '/pages/science-community/science-community'
    });
  },

  goToArticle(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${id}`,
      fail: (err) => {
        console.error('跳转失败：', err);
        wx.showToast({
          title: '文章详情页不存在',
          icon: 'none'
        });
      }
    });
  },

  async onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      this.setData({ navBarTotalHeight: 100 });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 直接使用预设数据，无需重新加载
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '已更新到最新文章',
        icon: 'none'
      });
    }, 1000);
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: '咿呀智库·科普推荐',
      path: '/pages/science-recommend/science-recommend'
    };
  }
});