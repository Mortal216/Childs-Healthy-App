import { getNavBarHeight } from '../../utils/navBar.js';

const API = require('../../utils/api.js');
const { interactionQuestionnaire } = require('../../utils/questionnaire-data.js');

function createQuestions() {
  return interactionQuestionnaire.questions.map((question, index) => ({
    ...question,
    number: index + 1,
    selectedOption: null
  }));
}

Page({
  data: {
    navBarTotalHeight: 0,
    startTime: 0,
    userId: null,
    babyId: null,
    ageMonths: 24,
    questionnaire: interactionQuestionnaire,
    questions: [],
    answeredCount: 0,
    totalCount: interactionQuestionnaire.questions.length,
    isAllSelected: false,
    submitting: false,
    submitTip: '请完成所有题目后提交'
  },

  onLoad() {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({ navBarTotalHeight: totalHeight });
    } catch (error) {
      console.error('导航栏高度计算失败:', error);
      this.setData({ navBarTotalHeight: 100 });
    }

    this.setData({
      startTime: Date.now(),
      userId: wx.getStorageSync('userId') || 1,
      babyId: wx.getStorageSync('babyId') || 1,
      ageMonths: wx.getStorageSync('babyAgeMonths') || 24,
      questions: createQuestions()
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

  showHelp() {
    wx.showModal({
      title: '问卷说明',
      content: this.data.questionnaire.helpText,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  selectOption(e) {
    const questionIndex = Number(e.currentTarget.dataset.questionIndex);
    const optionIndex = Number(e.currentTarget.dataset.optionIndex);
    const questions = this.data.questions.map((question, index) => {
      if (index !== questionIndex) {
        return question;
      }

      return {
        ...question,
        selectedOption: optionIndex
      };
    });

    const answeredCount = questions.filter((question) => question.selectedOption !== null).length;
    const isAllSelected = answeredCount === questions.length;

    this.setData({
      questions,
      answeredCount,
      isAllSelected,
      submitTip: isAllSelected ? '已完成全部题目，可以提交问卷' : '请完成所有题目后提交'
    });
  },

  submitAssessment() {
    if (this.data.submitting) {
      return;
    }

    if (!this.data.isAllSelected) {
      wx.showToast({
        title: '请完成所有题目后提交',
        icon: 'none'
      });
      return;
    }

    const assessmentData = {
      user_id: Number(this.data.userId) || 1,
      baby_id: Number(this.data.babyId) || 1,
      scale_id: this.data.questionnaire.scaleId,
      age_group: '0~30个月',
      age_months: Number(this.data.ageMonths) || 24,
      gender: wx.getStorageSync('babyGender') || 'female',
      answers: this.data.questions.map((question) => ({
        question_id: question.id,
        selected_option: question.selectedOption
      })),
      test_duration: this.calculateTestDuration()
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '正在提交...' });

    API.assessment
      .submitAssessment(assessmentData)
      .then((result) => {
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/report-interaction/report-interaction?assessmentId=${result.id}`
          });
        }, 500);
      })
      .catch((error) => {
        console.error('提交亲子互动问卷失败:', error);
        wx.hideLoading();
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  calculateTestDuration() {
    const duration = Math.floor((Date.now() - this.data.startTime) / 1000);
    return duration > 0 ? duration : 60;
  }
});
