// 0-18月测评独立报告页面
import { getNavBarHeight } from '../../utils/navBar.js';
const API = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,
    loading: true,
    
    // 报告数据
    assessmentId: null,
    babyInfo: {
      name: '宝宝',
      age: '',
      testTime: ''
    },
    
    // 测评结果
    totalScore: 0,
    scoreLevel: '',
    
    // 各维度得分
    dimensionScores: [],
    
    // 个性化干预建议
    suggestions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取导航栏高度
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({ navBarTotalHeight: totalHeight });
    } catch (error) {
      console.error('导航栏高度计算失败：', error);
      this.setData({ navBarTotalHeight: 100 });
    }

    // 获取测评ID
    const assessmentId = options.assessmentId;
    if (!assessmentId) {
      wx.showToast({
        title: '报告ID缺失',
        icon: 'none'
      });
      return;
    }

    this.setData({ assessmentId });
    
    // 加载报告数据
    this.loadReportData(assessmentId);
  },

  /**
   * 加载报告数据
   */
  loadReportData(assessmentId) {
    wx.showLoading({ title: '加载报告...' });

    API.assessment.getAssessmentDetail(assessmentId)
      .then(assessment => {
        console.log('测评详情：', assessment);
        
        // 处理报告数据
        this.processReportData(assessment);
        
        wx.hideLoading();
      })
      .catch(err => {
        console.error('加载报告失败：', err);
        wx.hideLoading();
        wx.showToast({
          title: '加载报告失败',
          icon: 'none'
        });
      });
  },

  /**
   * 处理报告数据
   */
  processReportData(assessment) {
    // 宝宝信息
    const babyInfo = {
      name: '宝宝',
      age: assessment.age_months ? `${assessment.age_months}个月` : '0-18个月',
      testTime: assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : new Date().toLocaleDateString()
    };

    // 总分和等级
    const totalScore = assessment.total_score || 0;
    const scoreLevel = this.getScoreLevel(totalScore);

    // 处理维度得分
    const dimensionScores = this.processDimensionScores(assessment.dimension_scores);

    // 生成个性化建议
    const suggestions = this.generateSuggestions(totalScore, dimensionScores);

    this.setData({
      babyInfo,
      totalScore,
      scoreLevel,
      dimensionScores,
      suggestions,
      loading: false
    });
  },

  /**
   * 根据分数获取等级
   */
  getScoreLevel(score) {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '中等';
    return '需关注';
  },

  /**
   * 处理维度得分
   */
  processDimensionScores(dimensionScores) {
    if (!dimensionScores || !Array.isArray(dimensionScores)) {
      return [];
    }

    // 维度名称映射
    const dimensionNameMap = {
      'vocab_spoken': '词汇表达',
      'vocab_understanding': '词汇理解',
      'gesture': '手势沟通',
      'early_response': '初期语言反应',
      'sentence_comprehension': '句子理解',
      'speaking_style': '说话方式'
    };

    return dimensionScores.map(item => {
      const key = item.dimension || item.name || '';
      return {
        name: dimensionNameMap[key] || key,
        score: item.score || 0,
        level: this.getScoreLevel(item.score || 0)
      };
    });
  },

  /**
   * 根据分数生成个性化干预建议
   */
  generateSuggestions(totalScore, dimensionScores) {
    const suggestions = [];

    // 根据总分给出整体建议
    if (totalScore >= 80) {
      suggestions.push('宝宝语言发展状况优秀，继续保持良好的语言环境');
      suggestions.push('多进行亲子阅读，拓展词汇量');
      suggestions.push('鼓励宝宝表达自己的想法和需求');
    } else if (totalScore >= 60) {
      suggestions.push('宝宝语言发展良好，可以适当加强语言刺激');
      suggestions.push('每天进行15-20分钟的亲子对话时间');
      suggestions.push('多给宝宝讲故事，增加语言输入');
    } else if (totalScore >= 40) {
      suggestions.push('宝宝语言发展需要更多关注，建议增加语言互动');
      suggestions.push('多使用简单、清晰的语句与宝宝交流');
      suggestions.push('通过游戏和日常活动创造语言学习机会');
      suggestions.push('必要时可咨询专业语言治疗师');
    } else {
      suggestions.push('宝宝语言发展需要重点关注，建议采取积极干预措施');
      suggestions.push('建议尽快寻求专业语言评估和指导');
      suggestions.push('在日常生活中增加语言刺激和互动');
      suggestions.push('保持耐心，给予宝宝充分的表达时间');
    }

    // 根据各维度得分给出针对性建议
    dimensionScores.forEach(dim => {
      if (dim.score < 40) {
        switch(dim.name) {
          case '词汇表达':
            suggestions.push('【词汇表达】多鼓励宝宝说出物品名称，从简单词汇开始');
            break;
          case '词汇理解':
            suggestions.push('【词汇理解】多使用简单指令，帮助宝宝理解语言含义');
            break;
          case '手势沟通':
            suggestions.push('【手势沟通】教宝宝使用简单手势，如挥手再见、点头等');
            break;
          case '初期语言反应':
            suggestions.push('【语言反应】多叫宝宝名字，培养对语言的敏感度');
            break;
          case '句子理解':
            suggestions.push('【句子理解】使用简单短句，配合动作帮助理解');
            break;
          case '说话方式':
            suggestions.push('【说话方式】模仿宝宝的发音，逐步引导正确发音');
            break;
        }
      }
    });

    return suggestions;
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
   * 重新测评
   */
  retest() {
    wx.showModal({
      title: '提示',
      content: '重新测评将清除当前结果，是否继续？',
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: '/pages/basic-test-0-18/basic-test-0-18'
          });
        }
      }
    });
  },

  /**
   * 查看详细分析
   */
  viewDetail() {
    wx.showToast({
      title: '详细分析功能开发中',
      icon: 'none'
    });
  },

  /**
   * 分享报告
   */
  shareReport() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  }
});
