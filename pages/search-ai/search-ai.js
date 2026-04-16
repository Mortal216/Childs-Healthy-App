// 引入导航栏高度计算工具（项目通用）
import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,    // 动态导航栏高度
    searchKeyword: '',       // 搜索输入关键词
    autoFocus: true,         // 自动聚焦搜索框
    // 历史搜索列表（实际可从本地缓存读取）
    historyList: ['语言启蒙', '亲子共读', '辅食添加', '宝宝语言发展'],
    // 热门搜索列表
    hotList: [
      { id: 1, rank: 1, keyword: '0-3岁语言发展', count: 23.5 },
      { id: 2, rank: 2, keyword: '亲子对话技巧', count: 18.9 },
      { id: 3, rank: 3, keyword: '宝宝开口晚原因', count: 15.6 },
      { id: 4, rank: 4, keyword: '家庭语言环境', count: 12.3 },
      { id: 5, rank: 5, keyword: '绘本阅读方法', count: 9.8 }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
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

    // 如果从其他页面带关键词过来，自动填充
    if (options.keyword) {
      this.setData({
        searchKeyword: decodeURIComponent(options.keyword)
      });
    }
  },

  /**
   * 搜索输入监听
   */
  handleSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 执行搜索
   */
  handleSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 1. 将搜索关键词加入历史记录（去重）
    const newHistory = [
      keyword,
      ...this.data.historyList.filter(item => item !== keyword)
    ].slice(0, 10); // 最多保留10条历史
    this.setData({ historyList: newHistory });

    // 2. 跳转到搜索结果页（可替换为实际结果页路径）
    wx.navigateTo({
      url: `/pages/science-search-result/science-search-result?keyword=${encodeURIComponent(keyword)}`,
      fail: (err) => {
        wx.showToast({
          title: '搜索结果页跳转失败',
          icon: 'none'
        });
        console.error('跳转失败原因：', err);
      }
    });
  },

  /**
   * 点击历史记录搜索
   */
  searchByHistory(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.handleSearch();
  },

  /**
   * 点击热门搜索搜索
   */
  searchByHot(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.handleSearch();
  },

  /**
   * 清空历史搜索
   */
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空所有历史搜索记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ historyList: [] });
          // 实际项目中可同步清除本地缓存
          wx.setStorageSync('scienceSearchHistory', []);
          wx.showToast({
            title: '已清空历史记录',
            icon: 'success',
            duration: 1500
          });
        }
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
        // 兜底返回科普主页面
        wx.switchTab({
          url: '/pages/science-recommend/science-recommend'
        });
      }
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
  onShareAppMessage() {
    return {
      title: '咿呀智库·科普搜索',
      path: '/pages/science-search/science-search'
    };
  }
});