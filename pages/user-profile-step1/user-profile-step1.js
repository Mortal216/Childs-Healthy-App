import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarHeight: 0,
    babyName: '',
    birthday: '',
    premature: 'yes',
    prematureDays: '',
    hasRisk: 'yes'
  },

  onLoad() {
    this.setData({
      navBarHeight: getNavBarHeight()
    });
  },

  onNameInput(e) {
    this.setData({ babyName: e.detail.value });
  },

  onBirthdayInput(e) {
    this.setData({ birthday: e.detail.value });
  },

  onPrematureChange(e) {
    this.setData({ premature: e.target.dataset.value });
  },

  onPrematureDaysInput(e) {
    this.setData({ prematureDays: e.detail.value });
  },

  onRiskChange(e) {
    this.setData({ hasRisk: e.target.dataset.value });
  },

  goToNext() {
    const { babyName, birthday } = this.data;
    if (!babyName || !birthday) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/user-profile-step2/user-profile-step2',
    });
  },

  goBack() {
    wx.navigateBack();
  },

  goToHelp() {
    wx.showToast({ title: '帮助功能即将上线', icon: 'none' });
  }
});