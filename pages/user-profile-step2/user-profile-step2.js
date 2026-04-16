import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarHeight: 0,
    caregiver: '',
    familyLanguage: '',
    dialectArea: '',
    interactionFrequency: ''
  },

  onLoad() {
    this.setData({
      navBarHeight: getNavBarHeight()
    });
  },

  onCaregiverInput(e) {
    this.setData({ caregiver: e.detail.value });
  },

  onLanguageInput(e) {
    this.setData({ familyLanguage: e.detail.value });
  },

  onDialectAreaInput(e) {
    this.setData({ dialectArea: e.detail.value });
  },

  onFrequencyInput(e) {
    this.setData({ interactionFrequency: e.detail.value });
  },

  submit() {
    const { caregiver, familyLanguage, interactionFrequency } = this.data;
    if (!caregiver || !familyLanguage || !interactionFrequency) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    // 模拟提交
    wx.showLoading({ title: '提交中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.switchTab({
        url: '/pages/home/home' // 提交后跳转到首页
      });
    }, 1500);
  },

  goBack() {
    wx.navigateBack();
  },

  goToHelp() {
    wx.showToast({ title: '帮助功能即将上线', icon: 'none' });
  }
});