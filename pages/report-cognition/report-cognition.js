import { getNavBarHeight } from '../../utils/navBar.js';
const API = require('../../utils/api.js');

Page({
  data: {
    navBarTotalHeight: 0,
    loading: true,
    // 发展等级数据
    developmentLevel: '',
    developmentLevelDesc: '',
    // 发展轨迹数据
    developmentTrail: [],
    trailLineStyle: '',
    // 未完成的测评
    unfinishedTests: []
  },

  // 返回上一页（回到profile页面）
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/profile/profile'
        });
      }
    });
  },

  // 帮助按钮点击
  goToHelp() {
    wx.showToast({
      title: '报告解读帮助即将上线',
      icon: 'none',
      duration: 2000
    });
  },

  // 跳转到未完成的测评
  goToUnfinishedTest(e) {
    const testName = e.currentTarget.dataset.testName || '该测评';
    wx.showToast({
      title: `即将进入${testName}`,
      icon: 'none'
    });
    // 示例：根据不同测评名称跳转到对应页面
    // if (testName.includes('词汇测试')) {
    //   wx.navigateTo({ url: '/pages/basic-test-18-30/basic-test-18-30' });
    // } else if (testName.includes('交流对话')) {
    //   wx.navigateTo({ url: '/pages/ex-test-conversation/ex-test-conversation' });
    // }
  },

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

    // 加载发展报告数据
    this.loadDevelopmentReportData();
  },

  /**
   * 加载发展报告数据
   */
  loadDevelopmentReportData() {
    wx.showLoading({ title: '加载发展报告...' });
    
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
        
        // 处理发展等级
        const { developmentLevel, developmentLevelDesc } = this.analyzeDevelopmentLevel(assessments);
        
        // 生成发展轨迹
        const developmentTrail = this.generateDevelopmentTrail(assessments);
        
        // 生成轨迹线条样式
        const trailLineStyle = this.generateTrailLineStyle(developmentTrail);
        
        // 识别未完成的测评
        const unfinishedTests = this.identifyUnfinishedTests(assessments);
        
        this.setData({
          developmentLevel,
          developmentLevelDesc,
          developmentTrail,
          trailLineStyle,
          unfinishedTests,
          loading: false
        });
        
        wx.hideLoading();
      })
      .catch(err => {
        console.error('加载发展报告失败：', err);
        wx.hideLoading();
        
        // 显示错误提示
        wx.showToast({
          title: '加载报告失败，请重试',
          icon: 'none'
        });
        
        // 设置默认数据，避免页面空白
        this.setData({
          developmentLevel: '未知',
          developmentLevelDesc: '无法获取发展等级数据',
          developmentTrail: [],
          trailLineStyle: '',
          unfinishedTests: [],
          loading: false
        });
      });
  },

  /**
   * 分析发展等级
   */
  analyzeDevelopmentLevel(assessments) {
    if (!assessments || assessments.length === 0) {
      return {
        developmentLevel: '未测评',
        developmentLevelDesc: '请完成测评后查看发展等级'
      };
    }
    
    // 获取最新的测评结果
    const latestAssessment = assessments.reduce((latest, current) => {
      const latestDate = new Date(latest.created_at || 0);
      const currentDate = new Date(current.created_at || 0);
      return currentDate > latestDate ? current : latest;
    });
    
    // 计算综合得分
    let totalScore = 0;
    let validAssessments = 0;
    
    assessments.forEach(assessment => {
      if (assessment.total_score) {
        totalScore += assessment.total_score;
        validAssessments++;
      }
    });
    
    const averageScore = validAssessments > 0 ? Math.round(totalScore / validAssessments) : 0;
    
    // 确定发展等级
    let developmentLevel = '';
    let developmentLevelDesc = '';
    
    if (averageScore >= 90) {
      developmentLevel = '优秀';
      developmentLevelDesc = '孩子的语言认知能力发展优秀，各项指标均表现出色，继续保持良好的教育方式。';
    } else if (averageScore >= 80) {
      developmentLevel = '良好';
      developmentLevelDesc = '孩子的语言认知能力发展良好，大部分指标表现不错，可适当加强薄弱环节的训练。';
    } else if (averageScore >= 70) {
      developmentLevel = '中等';
      developmentLevelDesc = '孩子的语言认知能力发展处于中等水平，需要针对性地进行干预和训练。';
    } else if (averageScore >= 60) {
      developmentLevel = '及格';
      developmentLevelDesc = '孩子的语言认知能力发展略低于平均水平，建议加强基础训练，定期进行测评。';
    } else {
      developmentLevel = '需关注';
      developmentLevelDesc = '孩子的语言认知能力发展明显落后，建议寻求专业人士的帮助，制定个性化的干预计划。';
    }
    
    return {
      developmentLevel,
      developmentLevelDesc
    };
  },

  /**
   * 生成发展轨迹
   */
  generateDevelopmentTrail(assessments) {
    if (!assessments || assessments.length === 0) {
      return [];
    }
    
    // 按时间排序
    const sortedAssessments = assessments.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateA - dateB;
    });
    
    // 生成轨迹数据
    return sortedAssessments.map(assessment => {
      const date = new Date(assessment.created_at || 0);
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        score: assessment.total_score || 0
      };
    });
  },

  /**
   * 生成轨迹线条样式
   */
  generateTrailLineStyle(trail) {
    if (!trail || trail.length < 2) {
      return '';
    }
    
    // 生成SVG路径
    const points = trail.map((item, index) => {
      const x = (index / (trail.length - 1)) * 100;
      const y = 100 - (item.score / 100) * 100;
      return `${x}% ${y}%`;
    });
    
    return `clip-path: polygon(${points.join(', ')})`;
  },

  /**
   * 识别未完成的测评
   */
  identifyUnfinishedTests(assessments) {
    // 所有需要完成的测评类型
    const requiredTests = [
      { name: '幼儿词汇测试（0-18月龄）', key: 'PCDI_VOCAB_SENTENCE', ageGroup: '0~18个月' },
      { name: '幼儿词汇测试（18-30月龄）', key: 'PCDI_VOCAB_SENTENCE', ageGroup: '18~30个月' },
      { name: '抚养方式测评', key: 'PCDI_VOCAB_GESTURE' },
      { name: '对话分析测评', key: 'PCDI_CONVERSATION_ANALYSIS' },
      { name: '互动质量分析', key: 'PCDI_INTERACTION_QUALITY' },
      { name: '家庭语言环境分析', key: 'PCDI_LANGUAGE_ENVIRONMENT' }
    ];
    
    // 已完成的测评
    const completedTests = new Set();
    assessments.forEach(assessment => {
      if (assessment.scale_id.includes('PCDI_VOCAB_SENTENCE')) {
        if (assessment.age_group === '0~18个月') {
          completedTests.add('PCDI_VOCAB_SENTENCE_0_18');
        } else if (assessment.age_group === '18~30个月') {
          completedTests.add('PCDI_VOCAB_SENTENCE_18_30');
        }
      } else {
        completedTests.add(assessment.scale_id);
      }
    });
    
    // 未完成的测评
    return requiredTests.filter(test => {
      if (test.key === 'PCDI_VOCAB_SENTENCE') {
        if (test.ageGroup === '0~18个月') {
          return !completedTests.has('PCDI_VOCAB_SENTENCE_0_18');
        } else if (test.ageGroup === '18~30个月') {
          return !completedTests.has('PCDI_VOCAB_SENTENCE_18_30');
        }
      }
      return !completedTests.has(test.key);
    });
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: '咿呀智库·语言认知能力发展报告',
      path: '/pages/report-cognition/report-cognition'
    };
  }
});