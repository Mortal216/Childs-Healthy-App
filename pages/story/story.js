// 故事共读页面
Page({
  data: {
    // 故事列表数据
    storyList: [
      {
        id: 1,
        title: '小星星的梦想',
        author: '陈伯吹',
        length: 5,
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20children%20book%20cover%20with%20stars%20and%20moon%2C%20cartoon%20style&image_size=square',
        tags: ['睡前故事', '想象力', '温暖']
      },
      {
        id: 2,
        title: '小兔子乖乖',
        author: '鲁兵',
        length: 4,
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rabbit%20family%20in%20forest%2C%20children%20book%20illustration&image_size=square',
        tags: ['经典', '安全教育', '家庭']
      },
      {
        id: 3,
        title: '拔萝卜',
        author: '民间故事',
        length: 3,
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20man%20pulling%20giant%20radish%20with%20animals%2C%20cartoon%20style&image_size=square',
        tags: ['合作', '幽默', '传统']
      },
      {
        id: 4,
        title: '小蝌蚪找妈妈',
        author: '方惠珍',
        length: 6,
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tadpoles%20searching%20for%20mother%20frog%2C%20children%20book%20art&image_size=square',
        tags: ['科普', '亲情', '成长']
      },
      {
        id: 5,
        title: '雪孩子',
        author: '嵇鸿',
        length: 7,
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=snowman%20playing%20with%20little%20boy%2C%20winter%20scene%2C%20warm%20colors&image_size=square',
        tags: ['友谊', '牺牲', '温暖']
      },
      {
        id: 6,
        title: '小熊找帽子',
        author: '咿呀智库编辑部',
        length: 5,
        cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20little%20bear%20looking%20for%20a%20yellow%20hat%2C%20children%20book%20cover%2C%20warm%20cartoon%20style&image_size=square',
        tags: ['睡前故事', '认知启蒙', '亲子互动']
      }
    ],
    // 导航栏总高度
    navBarTotalHeight: 0
  },

  /**
   * 跳转到故事详情页面
   * @param {Object} e - 事件对象
   */
  goToStoryDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/story-reader/story-reader?id=${id}`,
      fail: () => {
        wx.showToast({
          title: '无法打开故事共读',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 计算导航栏高度
   */
  calculateNavBarHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight
    const navBarHeight = 44 // 导航栏默认高度
    this.setData({
      navBarTotalHeight: statusBarHeight + navBarHeight
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算导航栏高度
    this.calculateNavBarHeight()
    // 页面加载时可以从后端获取故事列表
    // 这里使用模拟数据
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
  onPullDownRefresh() {
    // 下拉刷新时可以重新获取故事列表
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 上拉加载更多故事
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '故事共读 - 咿呀智库',
      path: '/pages/story/story'
    }
  }
})