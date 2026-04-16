import { getNavBarHeight } from '../../utils/navBar.js';

const API = require('../../utils/api.js');
const { drawRadarChart } = require('../../utils/radar-chart.js');
const { buildInteractionReportData } = require('../../utils/questionnaire-report.js');

Page({
  data: {
    navBarTotalHeight: 0,
    loading: true,
    assessmentId: null,
    babyInfo: {
      name: '宝宝',
      age: '',
      testTime: ''
    },
    totalScore: 0,
    maxScore: 100,
    percent: 0,
    scoreLevel: '',
    scoreLevelColor: '#F66B8D',
    scoreLevelTone: '#FFF1F5',
    dimensionScores: [],
    radarItems: [],
    analysisParagraphs: [],
    suggestions: []
  },

  onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({ navBarTotalHeight: totalHeight });
    } catch (error) {
      console.error('导航栏高度计算失败:', error);
      this.setData({ navBarTotalHeight: 100 });
    }

    const assessmentId = options.assessmentId;
    if (!assessmentId) {
      wx.showToast({
        title: '缺少报告编号',
        icon: 'none'
      });
      return;
    }

    this.setData({ assessmentId });
    this.loadReportData(assessmentId);
  },

  loadReportData(assessmentId) {
    wx.showLoading({ title: '正在加载...' });

    API.assessment
      .getAssessmentDetail(assessmentId)
      .then((assessment) => {
        this.processReportData(assessment);
        wx.hideLoading();
      })
      .catch((error) => {
        console.error('加载亲子互动报告失败:', error);
        wx.hideLoading();
        wx.showToast({
          title: '报告加载失败',
          icon: 'none'
        });
      });
  },

  processReportData(assessment) {
    const babyInfo = {
      name: wx.getStorageSync('babyName') || '宝宝',
      age: assessment.age_months ? `${assessment.age_months}个月` : '0-30个月',
      testTime: assessment.created_at
        ? new Date(assessment.created_at).toLocaleDateString()
        : new Date().toLocaleDateString()
    };

    const report = buildInteractionReportData(assessment);

    this.setData(
      {
        loading: false,
        babyInfo,
        ...report
      },
      () => {
        setTimeout(() => {
          this.drawRadar();
        }, 80);
      }
    );
  },

  drawRadar() {
    drawRadarChart(this, 'radarCanvas', this.data.radarItems, {
      themeColor: '#F66B8D',
      fillColor: 'rgba(246, 107, 141, 0.22)'
    });
  },

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

  goToTest() {
    wx.navigateTo({
      url: '/pages/ex-test-interaction/ex-test-interaction'
    });
  },

  shareReport() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  }
});
