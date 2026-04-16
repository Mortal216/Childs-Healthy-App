import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0
  },

  /**
   * 0-18月龄测评按钮点击（跳转到basic-test-0-18）
   */
  onStart0To18Test() {
    const targetUrl = '/pages/basic-test-0-18/basic-test-0-18';
    console.log('尝试跳转0-18月龄页面：', targetUrl);
    
    wx.navigateTo({
      url: targetUrl,
      success: () => {
        console.log('0-18月龄页面跳转成功');
      },
      fail: (err) => {
        let errorMsg = '跳转失败，请检查：';
        if (err.errMsg.includes('page not found')) {
          errorMsg += '1.页面文件夹是否创建 2.app.json是否注册该页面 3.路径是否拼写错误';
        } else {
          errorMsg += err.errMsg;
        }
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        console.error('0-18月龄测评跳转失败：', err);
      }
    });
  },

  /**
   * 返回按钮点击
   */
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

  /**
   * 18-30月龄测评按钮点击（核心修改：跳转到basic-test-18-30）
   */
  onStart18To30Test() {
    const targetUrl = '/pages/basic-test-18-30/basic-test-18-30'; // 跳转到第12张图片的问卷页
    console.log('尝试跳转18-30月龄页面：', targetUrl);
    
    wx.navigateTo({
      url: targetUrl,
      success: () => {
        console.log('18-30月龄页面跳转成功');
      },
      fail: (err) => {
        let errorMsg = '跳转失败，请检查：';
        if (err.errMsg.includes('page not found')) {
          errorMsg += '1.页面文件夹是否创建 2.app.json是否注册该页面 3.路径是否拼写错误';
        } else {
          errorMsg += err.errMsg;
        }
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        console.error('18-30月龄测评跳转失败：', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算并设置动态导航栏高度
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (err) {
      console.error('计算导航栏高度失败：', err);
      // 兜底：设置默认导航栏高度（避免页面布局错乱）
      this.setData({
        navBarTotalHeight: 100 // 单位rpx，适配大部分机型
      });
    }
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
  onShareAppMessage() {}
});