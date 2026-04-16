// 18-30月测评独立报告页面
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
      age: assessment.age_months ? `${assessment.age_months}个月` : '18-30个月',
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
      'vocab_production': '词汇产出',
      'word_usage': '词汇使用',
      'sentence_structure': '句子结构',
      'sentence_combination': '句子组合',
      'complexity': '语言复杂度',
      'grammar': '语法发展'
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
      suggestions.push('多进行复杂的对话练习，拓展语言表达能力');
      suggestions.push('鼓励宝宝讲述完整的故事和经历');
      suggestions.push('可以开始培养早期阅读兴趣');
    } else if (totalScore >= 60) {
      suggestions.push('宝宝语言发展良好，可以适当加强语言复杂度训练');
      suggestions.push('每天进行20-30分钟的亲子对话和阅读时间');
      suggestions.push('多提问开放式问题，鼓励宝宝完整表达');
      suggestions.push('通过游戏和日常活动丰富词汇量');
    } else if (totalScore >= 40) {
      suggestions.push('宝宝语言发展需要更多关注，建议增加语言互动和训练');
      suggestions.push('使用完整句子与宝宝交流，避免过度简化');
      suggestions.push('多进行词汇扩展训练，学习新词汇');
      suggestions.push('鼓励宝宝用完整句子表达需求和想法');
      suggestions.push('必要时可咨询专业语言治疗师');
    } else {
      suggestions.push('宝宝语言发展需要重点关注，建议采取积极干预措施');
      suggestions.push('建议尽快寻求专业语言评估和指导');
      suggestions.push('从基础词汇和简单句子开始系统训练');
      suggestions.push('增加日常语言互动时间，创造更多表达机会');
      suggestions.push('保持耐心，给予宝宝充分的表达时间和鼓励');
    }

    // 根据各维度得分给出针对性建议
    dimensionScores.forEach(dim => {
      if (dim.score < 40) {
        switch(dim.name) {
          case '词汇产出':
            suggestions.push('【词汇产出】鼓励宝宝主动说出物品名称，从名词开始逐步扩展');
            break;
          case '词汇使用':
            suggestions.push('【词汇使用】教宝宝在不同情境中使用合适的词汇');
            break;
          case '句子结构':
            suggestions.push('【句子结构】使用完整句子与宝宝对话，帮助理解语法结构');
            break;
          case '句子组合':
            suggestions.push('【句子组合】引导宝宝将简单句子组合成复杂句子');
            break;
          case '语言复杂度':
            suggestions.push('【语言复杂度】逐步增加对话复杂度，使用更多连接词');
            break;
          case '语法发展':
            suggestions.push('【语法发展】注意语法正确性，及时温和地纠正错误');
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
            url: '/pages/basic-test-18-30/basic-test-18-30'
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
