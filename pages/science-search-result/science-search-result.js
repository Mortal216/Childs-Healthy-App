import { getNavBarHeight } from '../../utils/navBar.js';
const DeepSeek = require('../../utils/deepseek.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,
    keyword: '',
    loading: false,
    articles: [],
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算动态导航栏高度
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      console.error('导航栏高度计算失败：', error);
      this.setData({ navBarTotalHeight: 100 });
    }

    // 获取搜索关键词
    if (options.keyword) {
      this.setData({
        keyword: decodeURIComponent(options.keyword)
      });
      // 执行搜索
      this.searchArticles();
    }
  },

  /**
   * 搜索科普文章
   */
  async searchArticles() {
    this.setData({ loading: true });

    try {
      // 使用DeepSeek API搜索科普文章
      const searchResult = await DeepSeek.searchArticles({
        keyword: this.data.keyword,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      // 处理搜索结果
      if (searchResult && searchResult.articles) {
        const newArticles = this.data.page === 1 ? searchResult.articles : [...this.data.articles, ...searchResult.articles];
        
        this.setData({
          articles: newArticles,
          hasMore: searchResult.articles.length === this.data.pageSize,
          loading: false
        });
      } else {
        // 使用默认数据作为fallback
        this.setDefaultArticles();
      }
    } catch (error) {
      console.error('搜索失败：', error);
      // 使用默认数据作为fallback
      this.setDefaultArticles();
    }
  },

  /**
   * 设置默认科普文章数据
   */
  setDefaultArticles() {
    const defaultArticles = [
      {
        id: 1,
        title: '2026年最新研究：0-3岁宝宝语言发展的关键期',
        source: '中国儿童发展研究中心',
        publishTime: '2026-02-20',
        summary: '最新研究表明，0-3岁是宝宝语言发展的黄金期，家庭语言环境对语言能力发展有着至关重要的影响...',
        url: '#',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20reading%20book%20to%20baby%20language%20development%20warm%20home%20setting&image_size=square'
      },
      {
        id: 2,
        title: '大数据分析：如何打造最佳家庭语言环境',
        source: '育儿科学研究院',
        publishTime: '2026-02-15',
        summary: '基于10万家庭的数据研究，本文分析了家庭语言环境的关键因素，为家长提供了科学的语言启蒙建议...',
        url: '#',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20talking%20together%20language%20environment%20modern%20living%20room&image_size=square'
      },
      {
        id: 3,
        title: 'AI助力儿童语言发展：最新技术应用',
        source: '科技育儿前沿',
        publishTime: '2026-02-10',
        summary: '人工智能技术在儿童语言发展领域的最新应用，包括智能对话系统、个性化语言训练等创新方法...',
        url: '#',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20technology%20helping%20child%20language%20development%20interactive%20learning&image_size=square'
      },
      {
        id: 4,
        title: '亲子对话质量评估：新方法与标准',
        source: '早期教育研究',
        publishTime: '2026-02-05',
        summary: '本文介绍了亲子对话质量评估的新方法和标准，帮助家长识别和改进与孩子的沟通方式...',
        url: '#',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20child%20conversation%20quality%20assessment%20warm%20interaction&image_size=square'
      },
      {
        id: 5,
        title: '多语言环境对儿童语言发展的影响',
        source: '国际育儿研究',
        publishTime: '2026-01-30',
        summary: '最新研究探讨了多语言家庭环境对儿童语言发展的影响，为多语言家庭提供了科学的语言教育指导...',
        url: '#',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=multilingual%20family%20language%20development%20cultural%20diversity&image_size=square'
      }
    ];

    this.setData({
      articles: defaultArticles,
      hasMore: false,
      loading: false
    });
  },

  /**
   * 加载更多文章
   */
  loadMoreArticles() {
    if (!this.data.loading && this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.searchArticles();
    }
  },

  /**
   * 查看文章详情
   */
  viewArticleDetail(e) {
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

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/science-recommend/science-recommend'
        });
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.searchArticles();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadMoreArticles();
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
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: `搜索：${this.data.keyword} - 咿呀智库`,
      path: `/pages/science-search-result/science-search-result?keyword=${encodeURIComponent(this.data.keyword)}`
    };
  }
});
