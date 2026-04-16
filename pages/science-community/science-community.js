import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarTotalHeight: 0,
    postList: [],
    
    // 创作弹窗
    showCreateModal: false,
    newPostContent: '',
    selectedTag: '',
    topicList: ['#语言启蒙家', '#亲子共读', '#辅食添加', '#早教游戏', '#育儿心得']
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search-ai/search-ai'
    });
  },

  goToRecommend() {
    wx.switchTab({
      url: '/pages/science-recommend/science-recommend'
    });
  },

  goToLiterature() {
    wx.navigateTo({
      url: '/pages/science-literature/science-literature'
    });
  },

  goToCommunity() {
    wx.showToast({
      title: '当前在社区页',
      icon: 'none'
    });
  },

  likePost(e) {
    wx.showToast({
      title: '社区功能即将上线',
      icon: 'none'
    });
  },

  collectPost(e) {
    wx.showToast({
      title: '社区功能即将上线',
      icon: 'none'
    });
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  goToFunction() {
    wx.switchTab({
      url: '/pages/function/function'
    });
  },

  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  // 显示创作弹窗
  showCreateModal() {
    this.setData({
      showCreateModal: true,
      newPostContent: '',
      selectedTag: ''
    });
  },

  // 关闭创作弹窗
  closeCreateModal() {
    this.setData({ showCreateModal: false });
  },

  // 输入内容
  onPostContentInput(e) {
    this.setData({ newPostContent: e.detail.value });
  },

  // 选择话题标签
  selectTag(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({
      selectedTag: this.data.selectedTag === tag ? '' : tag
    });
  },

  // 发布动态
  submitPost() {
    const { newPostContent, selectedTag } = this.data;
    
    if (!newPostContent.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    const userId = wx.getStorageSync('userId') || '游客';
    const newPost = {
      id: Date.now(),
      author: `用户${userId}`,
      time: '刚刚',
      content: selectedTag ? `${selectedTag} ${newPostContent}` : newPostContent,
      likeCount: 0,
      collectCount: 0,
      isLiked: false,
      isCollected: false
    };

    // 添加到帖子列表
    const postList = [newPost, ...this.data.postList];
    
    // 保存到本地存储
    wx.setStorageSync('communityPosts', postList);

    this.setData({
      postList,
      showCreateModal: false,
      newPostContent: '',
      selectedTag: ''
    });

    wx.showToast({
      title: '发布成功',
      icon: 'success'
    });
  },

  // 点赞
  likePost(e) {
    const postId = e.currentTarget.dataset.id;
    const postList = this.data.postList.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    });
    
    this.setData({ postList });
    wx.setStorageSync('communityPosts', postList);
  },

  // 收藏
  collectPost(e) {
    const postId = e.currentTarget.dataset.id;
    const postList = this.data.postList.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          collectCount: post.isCollected ? post.collectCount - 1 : post.collectCount + 1,
          isCollected: !post.isCollected
        };
      }
      return post;
    });
    
    this.setData({ postList });
    wx.setStorageSync('communityPosts', postList);
  },

  onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      this.setData({
        navBarTotalHeight: 100
      });
    }

    // 从本地存储加载帖子数据
    const savedPosts = wx.getStorageSync('communityPosts') || [];
    this.setData({
      postList: savedPosts
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 模拟刷新，实际项目中可以从云数据库获取最新数据
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '社区功能即将上线',
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
      title: '咿呀智库·社区',
      path: '/pages/science-community/science-community'
    };
  }
});