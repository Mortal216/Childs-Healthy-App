// 导入导航栏高度计算工具
import { getNavBarHeight } from '../../utils/navBar.js';
const API = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,
    // 报告数据（从接口获取）
    babyInfo: {
      name: '',
      age: '',
      testTime: ''
    },
    totalScore: 0,
    scoreLevel: '',
    scoreDesc: '',
    dimensions: [],
    suggestions: [],
    loading: true,
    // 五个部分的报告数据
    assessmentParts: {
      basicVocab: null,      // 基础测评-幼童词汇
      basicParenting: null,   // 基础测评-抚养方式
      exConversation: null,   // 拓展测评-对话分析
      exInteraction: null,    // 拓展测评-互动分析
      exAtmosphere: null      // 拓展测评-氛围分析
    }
  },

  /**
   * 返回主页
   */
  goBack() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  /**
   * 帮助按钮点击（预留拓展）
   */
  goToHelp() {
    wx.showToast({
      title: '报告解读帮助即将上线',
      icon: 'none',
      duration: 2000
    });
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

    // 加载综合报告数据
    this.loadCombinedReportData();
  },

  /**
   * 加载综合报告数据
   */
  loadCombinedReportData() {
    wx.showLoading({ title: '加载综合报告...' });
    
    // 获取用户ID
    const userId = wx.getStorageSync('userId') || 1;
    
    // 先获取用户的所有测评历史
    API.assessment.getAssessmentHistory(userId)
      .then(history => {
        console.log('测评历史：', history);
        
        // 处理测评历史，获取详细信息
        const assessmentPromises = history.map(item => 
          API.assessment.getAssessmentDetail(item.id)
        );
        
        // 并行获取所有测评的详细信息
        return Promise.all(assessmentPromises);
      })
      .then(assessments => {
        console.log('所有测评详细信息：', assessments);
        
        // 分类处理测评结果
        const assessmentParts = this.classifyAssessments(assessments);
        
        // 计算综合得分
        const { totalScore, scoreLevel } = this.calculateCombinedScore(assessmentParts);
        
        // 处理宝宝信息
        const babyInfo = {
          name: '宝宝',
          age: '未知',
          testTime: new Date().toLocaleDateString()
        };
        
        // 处理建议
        const suggestions = this.generateCombinedSuggestions(assessmentParts);
        
        this.setData({
          babyInfo,
          totalScore,
          scoreLevel,
          scoreDesc: '综合所有测评结果生成',
          suggestions,
          assessmentParts,
          loading: false
        });
        
        wx.hideLoading();
      })
      .catch(err => {
        console.error('加载综合报告失败：', err);
        wx.hideLoading();
        
        // 显示错误提示
        wx.showToast({
          title: '加载报告失败，请重试',
          icon: 'none'
        });
        
        // 设置默认数据，避免页面空白
        this.setData({
          babyInfo: {
            name: '宝宝',
            age: '未知',
            testTime: ''
          },
          totalScore: 0,
          scoreLevel: '未知',
          scoreDesc: '无法加载报告数据',
          suggestions: ['请稍后重试或联系客服'],
          loading: false
        });
      });
  },

  /**
   * 分类处理测评结果
   */
  classifyAssessments(assessments) {
    const parts = {
      basicVocab: null,
      basicParenting: null,
      exConversation: null,
      exInteraction: null,
      exAtmosphere: null
    };
    
    assessments.forEach(assessment => {
      // 根据量表ID和年龄段分类
      const scaleId = assessment.scale_id;
      const ageGroup = assessment.age_group;
      
      if (scaleId === 'PCDI_VOCAB_SENTENCE') {
        if (ageGroup === '0~18个月' || ageGroup === '18~30个月') {
          parts.basicVocab = assessment;
        }
      } else if (scaleId === 'PCDI_VOCAB_GESTURE') {
        parts.basicParenting = assessment;
      } else if (scaleId.includes('CONVERSATION')) {
        parts.exConversation = assessment;
      } else if (scaleId.includes('INTERACTION')) {
        parts.exInteraction = assessment;
      } else if (scaleId.includes('ATMOSPHERE') || scaleId.includes('LANGUAGE_ENVIRONMENT')) {
        parts.exAtmosphere = assessment;
      }
    });
    
    return parts;
  },

  /**
   * 计算综合得分
   */
  calculateCombinedScore(parts) {
    let totalScore = 0;
    let validParts = 0;
    
    // 计算所有有效测评的平均得分
    Object.values(parts).forEach(part => {
      if (part) {
        totalScore += part.total_score || 0;
        validParts++;
      }
    });
    
    const averageScore = validParts > 0 ? Math.round(totalScore / validParts) : 0;
    
    // 计算等级
    let scoreLevel = '未知';
    if (averageScore >= 90) {
      scoreLevel = '优秀';
    } else if (averageScore >= 80) {
      scoreLevel = '良好';
    } else if (averageScore >= 70) {
      scoreLevel = '中等';
    } else if (averageScore >= 60) {
      scoreLevel = '及格';
    } else {
      scoreLevel = '需关注';
    }
    
    return { totalScore: averageScore, scoreLevel };
  },

  /**
   * 生成综合建议
   */
  generateCombinedSuggestions(parts) {
    const suggestions = [];
    
    // 收集各部分的建议
    Object.values(parts).forEach(part => {
      if (part && part.suggestions) {
        suggestions.push(...part.suggestions);
      }
    });
    
    // 如果没有建议，添加默认建议
    if (suggestions.length === 0) {
      suggestions.push('请完成测评后查看个性化建议');
    }
    
    return suggestions;
  },

  // 以下为默认生命周期函数（完整保留）
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: `${this.data.babyInfo.name}的儿童发展报告`,
      path: '/pages/report-child/report-child'
    };
  }
});