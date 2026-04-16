// 抚养方式测评报告页面
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
    scoreLevelColor: '#F44336',
    
    // 各维度得分
    dimensionScores: [],
    
    // 个性化建议
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
      age: assessment.age_months ? `${assessment.age_months}个月` : '0-36个月',
      testTime: assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : new Date().toLocaleDateString()
    };

    // 总分和等级
    const totalScore = assessment.total_score || 0;
    const scoreLevel = this.getScoreLevel(totalScore);
    const scoreLevelColor = this.getScoreLevelColor(scoreLevel);

    // 各维度得分
    let dimensionScores = [];
    if (assessment.dimension_scores) {
      try {
        const dimensionData = typeof assessment.dimension_scores === 'string' 
          ? JSON.parse(assessment.dimension_scores) 
          : assessment.dimension_scores;
        
        if (Array.isArray(dimensionData)) {
          dimensionScores = dimensionData.map(item => ({
            dimension: item.dimension || '',
            score: item.score || 0,
            maxScore: item.max_score || 4,
            level: item.level || '需关注',
            levelColor: this.getScoreLevelColor(item.level || '需关注')
          }));
        } else if (typeof dimensionData === 'object') {
          // 处理对象格式的维度数据
          for (const [key, value] of Object.entries(dimensionData)) {
            dimensionScores.push({
              dimension: key,
              score: value.score || 0,
              maxScore: value.max_score || 4,
              level: value.level || '需关注',
              levelColor: this.getScoreLevelColor(value.level || '需关注')
            });
          }
        }
      } catch (error) {
        console.error('解析维度数据失败：', error);
      }
    }

    // 个性化建议
    let suggestions = [];
    if (assessment.suggestions) {
      try {
        suggestions = typeof assessment.suggestions === 'string' 
          ? JSON.parse(assessment.suggestions) 
          : assessment.suggestions;
        if (!Array.isArray(suggestions)) {
          suggestions = [];
        }
      } catch (error) {
        console.error('解析建议数据失败：', error);
      }
    }

    // 如果没有建议，生成默认建议
    if (suggestions.length === 0) {
      suggestions = this.generateDefaultSuggestions(totalScore);
    }

    this.setData({
      babyInfo,
      totalScore,
      scoreLevel,
      scoreLevelColor,
      dimensionScores,
      suggestions
    });
  },

  /**
   * 根据分数获取等级
   */
  getScoreLevel(score) {
    if (score >= 16) {
      return '科学抚养';
    } else if (score >= 12) {
      return '良好抚养';
    } else if (score >= 8) {
      return '一般抚养';
    } else {
      return '需要改进';
    }
  },

  /**
   * 根据等级获取颜色
   */
  getScoreLevelColor(level) {
    switch (level) {
      case '科学抚养':
      case '优秀':
        return '#4CAF50';
      case '良好抚养':
      case '良好':
        return '#2196F3';
      case '一般抚养':
      case '中等':
        return '#FFC107';
      case '需要改进':
      case '及格':
        return '#FF9800';
      case '需关注':
      default:
        return '#F44336';
    }
  },

  /**
   * 生成默认建议
   */
  generateDefaultSuggestions(score) {
    if (score >= 16) {
      return [
        '您的抚养方式非常科学，继续保持！',
        '建议在保持现有方式的基础上，多与其他家长交流经验',
        '定期关注孩子的发展变化，适时调整抚养策略'
      ];
    } else if (score >= 12) {
      return [
        '您的抚养方式整体良好，有进一步提升的空间',
        '建议增加与孩子的互动时间，提高陪伴质量',
        '在情绪应对方面，可以尝试更多耐心引导的方式'
      ];
    } else if (score >= 8) {
      return [
        '您的抚养方式需要适当调整，建议关注以下方面',
        '增加每天陪伴孩子的互动时间，至少30分钟以上',
        '学习科学的情绪管理方法，耐心了解孩子的需求',
        '适当放手，培养孩子的自主性和独立性'
      ];
    } else {
      return [
        '您的抚养方式需要重点关注和改进',
        '建议寻求专业的育儿指导，学习科学的抚养方法',
        '增加亲子互动时间，建立良好的亲子关系',
        '调整教育理念，注重孩子的全面发展',
        '在情绪应对上避免过于严厉或溺爱，寻求平衡点'
      ];
    }
  },

  /**
   * 返回按钮点击
   */
  goBack() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  /**
   * 分享按钮点击
   */
  shareReport() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  /**
   * 重新测评按钮点击
   */
  goToTest() {
    wx.navigateTo({
      url: '/pages/basic-test-fuyang/basic-test-fuyang'
    });
  }
});
