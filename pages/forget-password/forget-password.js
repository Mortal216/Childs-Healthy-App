const API = require('../../utils/api.js');

Page({
  data: {
    phone: '',
    code: '',
    newPwd: '',
    codeDisabled: false,
    codeText: '获取验证码',
    countdown: 60
  },

  // 手机号输入监听
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 验证码输入监听
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    });
  },

  // 新密码输入监听
  onNewPwdInput(e) {
    this.setData({
      newPwd: e.detail.value
    });
  },

  // 获取验证码（带倒计时）
  getCode() {
    const { phone } = this.data;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 启动倒计时
    this.setData({
      codeDisabled: true,
      codeText: `${this.data.countdown}秒后重发`
    });

    const timer = setInterval(() => {
      const countdown = this.data.countdown - 1;
      if (countdown > 0) {
        this.setData({
          countdown,
          codeText: `${countdown}秒后重发`
        });
      } else {
        clearInterval(timer);
        this.setData({
          codeDisabled: false,
          codeText: '获取验证码',
          countdown: 60
        });
      }
    }, 1000);

    // 模拟发送验证码（实际项目中调用后端接口）
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
  },

  // 重置密码逻辑
  resetPwd() {
    const { phone, code, newPwd } = this.data;

    // 表单校验
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    if (!code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }
    if (!newPwd || newPwd.length < 6 || newPwd.length > 16) {
      wx.showToast({
        title: '请设置6-16位新密码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '重置中...'
    });
    API.auth
      .resetPassword(phone, newPwd)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '重置成功',
          icon: 'success'
        });
        this.goToLogin();
      })
      .catch(() => {
        wx.hideLoading();
      });
  },

  // 跳转到登录页（回到login页面）
  goToLogin() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    });
  },

  onLoad(options) {
    // 页面加载逻辑（可接收传递的参数）
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: '重置密码',
      path: '/pages/forget-password/forget-password'
    };
  }
});