import { getNavBarHeight } from '../../utils/navBar.js';
const API = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,
    scaleId: 'PCDI_VOCAB_SENTENCE_18_30',
    scaleName: '汉语沟通发展量表（普通话版）：词汇及句子',
    ageGroup: '18-30月',
    
    // 量表部分
    sections: [],
    sectionProgress: [], // 每个部分的进度状态
    currentSectionIndex: 0,
    
    // 当前部分信息
    currentSectionCompleted: 0,
    currentSectionTotal: 0,
    currentSectionProgress: 0,
    
    // 用户和测评信息
    userId: null,
    babyId: null,
    startTime: Date.now(),
    
    // 加载状态
    isLoading: true,
    loadingText: '加载中...',
    
    // 提交成功弹窗
    showSuccessPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算并设置动态导航栏高度
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({ navBarTotalHeight: totalHeight });
    } catch (err) {
      console.error('计算导航栏高度失败：', err);
      this.setData({ navBarTotalHeight: 100 });
    }
    
    // 加载用户数据
    this.loadUserData();
    
    // 初始化量表结构
    this.initSections();
    
    // 加载题目
    this.loadQuestions();
  },

  /**
   * 初始化量表结构
   */
  initSections() {
    const sections = [
      {
        id: 'part1',
        title: '第一部份：词汇量表',
        subtitle: '请根据孩子的词汇掌握情况选择',
        type: 'vocabulary',
        questions: [],
        options: ['不会说', '会说'],
        optionScores: [0, 1]
      },
      {
        id: 'part2_A',
        title: '第二部份 A：小孩怎么使用词',
        subtitle: '注："有时"即指孩子用过一次以上；"经常"即指需要用的时候大部分会用到',
        type: 'multiple_choice',
        questions: [],
        options: ['还没有', '有时会', '经常会'],
        optionScores: [0, 1, 2]
      },
      {
        id: 'part2_B',
        title: '第二部份 B：句子与语句',
        subtitle: '请根据孩子的实际情况选择',
        type: 'multiple_choice',
        questions: [],
        options: ['还没有', '有时会', '经常会'],
        optionScores: [0, 1, 2]
      },
      {
        id: 'part2_C',
        title: '第二部份 C：句子组合',
        subtitle: '请根据孩子的实际情况选择',
        type: 'multiple_choice',
        questions: [],
        options: ['还没有', '有时会', '经常会'],
        optionScores: [0, 1, 2]
      },
      {
        id: 'part2_D',
        title: '第二部份 D：复杂性',
        subtitle: '请选出最像您孩子现在讲话的样子',
        type: 'complexity',
        questions: [],
        options: [], // 动态生成
        optionScores: [] // 动态计算
      }
    ];
    
    this.setData({ sections, sectionProgress: this.calculateAllSectionProgress(sections) });
  },

  /**
   * 计算所有部分的进度
   */
  calculateAllSectionProgress(sections) {
    return sections.map(section => {
      const total = section.questions.length;
      const answered = section.questions.filter(q => q.selectedOption !== null).length;
      return {
        total,
        answered,
        completed: total > 0 && answered === total
      };
    });
  },

  /**
   * 更新进度数据
   */
  updateProgress() {
    const sectionProgress = this.calculateAllSectionProgress(this.data.sections);
    const currentSection = this.data.sections[this.data.currentSectionIndex];
    const completed = currentSection.questions.filter(q => q.selectedOption !== null).length;
    const total = currentSection.questions.length;
    
    this.setData({
      sectionProgress,
      currentSectionCompleted: completed,
      currentSectionTotal: total,
      currentSectionProgress: total > 0 ? (completed / total * 100) : 0
    });
  },

  /**
   * 从服务器加载题目
   */
  loadQuestions() {
    this.setData({ isLoading: true, loadingText: '加载题目中...' });
    
    // 调用API获取题目
    API.assessment.getScaleQuestions(this.data.scaleId, this.data.ageGroup)
    .then(res => {
      console.log('获取题目成功:', res);
      // API直接返回数组，不是对象
      const questions = Array.isArray(res) ? res : (res.questions || []);
      console.log('题目数组长度:', questions.length);
      this.organizeQuestions(questions);
    })
    .catch(err => {
      console.error('获取题目失败:', err);
      wx.showToast({
        title: '加载题目失败',
        icon: 'none'
      });
      // 使用本地数据作为备用
      this.loadLocalQuestions();
    })
    .finally(() => {
      this.setData({ isLoading: false });
    });
  },

  /**
   * 组织题目到各个部分
   */
  organizeQuestions(questions) {
    console.log('组织题目，原始数据数量:', questions.length);
    
    if (!questions || questions.length === 0) {
      console.log('没有获取到题目，使用本地数据');
      this.loadLocalQuestions();
      return;
    }
    
    // 创建新的 sections 数组
    const sections = [
      { id: 'part1', title: '第一部份：词汇量表', subtitle: '请根据孩子的词汇掌握情况选择', type: 'vocabulary', questions: [], options: ['不会说', '会说'], optionScores: [0, 1] },
      { id: 'part2_A', title: '第二部份 A：小孩怎么使用词', subtitle: '注："有时"即指孩子用过一次以上；"经常"即指需要用的时候大部分会用到', type: 'multiple_choice', questions: [], options: ['还没有', '有时会', '经常会'], optionScores: [0, 1, 2] },
      { id: 'part2_B', title: '第二部份 B：句子与语句', subtitle: '请根据孩子的实际情况选择', type: 'multiple_choice', questions: [], options: ['还没有', '有时会', '经常会'], optionScores: [0, 1, 2] },
      { id: 'part2_C', title: '第二部份 C：句子组合', subtitle: '请根据孩子的实际情况选择', type: 'multiple_choice', questions: [], options: ['还没有', '有时会', '经常会'], optionScores: [0, 1, 2] },
      { id: 'part2_D', title: '第二部份 D：复杂性', subtitle: '请选出最像您孩子现在讲话的样子', type: 'complexity', questions: [], options: [], optionScores: [] }
    ];
    
    let matchedCount = 0;
    
    questions.forEach(q => {
      const dimension = (q.dimension || '').toLowerCase();
      const questionType = q.question_type || '';
      
      // 解析选项 - 后端可能返回字符串或数组
      let options = [];
      if (q.options) {
        if (typeof q.options === 'string') {
          try {
            options = JSON.parse(q.options);
          } catch (e) {
            // 如果解析失败，可能是简单字符串数组
            options = q.options;
          }
        } else if (Array.isArray(q.options)) {
          options = q.options;
        }
      }
      
      // 根据 dimension 和 question_type 分配到对应部分
      if (dimension.includes('词汇量表') || questionType === 'vocabulary') {
        sections[0].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('使用词') || dimension.includes('怎么使用词')) {
        sections[1].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('句子与语句')) {
        sections[2].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('句子组合')) {
        sections[3].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('复杂性') || questionType === 'complexity') {
        // 复杂性题目选项是动态的
        sections[4].questions.push({
          id: q.question_id,
          text: q.question,
          options: options,
          selectedOption: null
        });
        matchedCount++;
      } else {
        console.log('未匹配的题目:', q.question_id, 'dimension:', dimension, 'type:', questionType);
        // 默认分配到词汇量表
        sections[0].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      }
    });
    
    console.log('题目分配结果:', {
      part1: sections[0].questions.length,
      part2_A: sections[1].questions.length,
      part2_B: sections[2].questions.length,
      part2_C: sections[3].questions.length,
      part2_D: sections[4].questions.length,
      matched: matchedCount
    });
    
    // 如果没有任何题目匹配成功，使用本地数据
    if (matchedCount === 0) {
      console.log('没有匹配到任何题目，使用本地数据');
      this.loadLocalQuestions();
      return;
    }
    
    // 生成随机答案
    this.generateRandomAnswers(sections);
    
    this.setData({ 
      sections,
      currentSectionCompleted: sections[0].questions.filter(q => q.selectedOption !== null).length,
      currentSectionTotal: sections[0].questions.length,
      currentSectionProgress: sections[0].questions.length > 0 ? (sections[0].questions.filter(q => q.selectedOption !== null).length / sections[0].questions.length) * 100 : 0,
      sectionProgress: this.calculateAllSectionProgress(sections)
    });
  },
  
  /**
   * 生成随机答案
   */
  generateRandomAnswers(sections) {
    sections.forEach(section => {
      section.questions.forEach(question => {
        const optionsCount = question.options ? question.options.length : section.options.length;
        if (optionsCount > 0) {
          question.selectedOption = Math.floor(Math.random() * optionsCount);
        }
      });
    });
  },

  /**
   * 加载本地备用题目数据
   */
  loadLocalQuestions() {
    // 词汇量表示例（部分）
    const vocabQuestions = [
      { id: 'vocab_001', text: '妈妈', selectedOption: null },
      { id: 'vocab_002', text: '爸爸', selectedOption: null },
      { id: 'vocab_003', text: '抱抱', selectedOption: null },
      { id: 'vocab_004', text: '喝水', selectedOption: null },
      { id: 'vocab_005', text: '吃饭', selectedOption: null }
    ];
    
    // A部分：使用词
    const partAQuestions = [
      { id: 'A_001', text: '如果您提及一个不在眼前的东西，他会不会明白？', selectedOption: null },
      { id: 'A_002', text: '您的孩子有没有指着或拿起人家的东西并说出那人的名字或名称？', selectedOption: null },
      { id: 'A_003', text: '您的孩子有没有讲过有关不在眼前的玩具或动物？', selectedOption: null },
      { id: 'A_004', text: '您的孩子有没有讲过有关过去发生的事或见过的人？', selectedOption: null },
      { id: 'A_005', text: '您的孩子有没有讲过有关将要发生的事？', selectedOption: null }
    ];
    
    // B部分：句子与语句
    const partBQuestions = [
      { id: 'B_001', text: '您的孩子有没有开始组合几个动词在一起？', selectedOption: null },
      { id: 'B_002', text: '当讲起人们的东西或身体部分的时候，您的孩子有没有开始使用"的"表示所属？', selectedOption: null },
      { id: 'B_003', text: '当讲起名词的时候，您的孩子有没有开始使用量词？', selectedOption: null },
      { id: 'B_004', text: '当讲过去发生的事时，您的孩子有没有开始使用"过"或"了"字？', selectedOption: null }
    ];
    
    // C部分：句子组合
    const partCQuestions = [
      { id: 'C_001', text: '您的孩子有没有开始把几个字组合在一起？', selectedOption: null }
    ];
    
    // D部分：复杂性
    const partDQuestions = [
      { 
        id: 'D_001', 
        text: '（表示东西不见了）', 
        options: [
          { type: 'simpler', label: '比"没"更简单', value: 'simpler_than_first' },
          { type: 'option', label: '没', value: '没' },
          { type: 'option', label: '没了', value: '没了' },
          { type: 'option', label: '车没（有）了', value: '车没（有）了' }
        ],
        selectedOption: null 
      }
    ];
    
    const sections = this.data.sections;
    sections[0].questions = vocabQuestions;
    sections[1].questions = partAQuestions;
    sections[2].questions = partBQuestions;
    sections[3].questions = partCQuestions;
    sections[4].questions = partDQuestions;
    
    // 生成随机答案
    this.generateRandomAnswers(sections);
    
    this.setData({ 
      sections,
      currentSectionCompleted: sections[0].questions.filter(q => q.selectedOption !== null).length,
      currentSectionTotal: sections[0].questions.length,
      currentSectionProgress: sections[0].questions.length > 0 ? (sections[0].questions.filter(q => q.selectedOption !== null).length / sections[0].questions.length) * 100 : 0,
      sectionProgress: this.calculateAllSectionProgress(sections)
    });
  },

  /**
   * 切换部分
   */
  switchSection(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentSectionIndex: index });
    this.updateProgress();
  },

  /**
   * 选择选项
   */
  selectOption(e) {
    const { sectionIndex, questionIndex, optionIndex } = e.currentTarget.dataset;
    
    const sections = this.data.sections;
    sections[sectionIndex].questions[questionIndex].selectedOption = optionIndex;
    
    this.setData({ sections });
    this.updateProgress();
  },

  /**
   * 上一部分
   */
  prevSection() {
    if (this.data.currentSectionIndex > 0) {
      const newIndex = this.data.currentSectionIndex - 1;
      this.setData({ currentSectionIndex: newIndex });
      this.updateProgress();
    }
  },

  /**
   * 下一部分
   */
  nextSection() {
    const currentSection = this.data.sections[this.data.currentSectionIndex];
    const completed = currentSection.questions.filter(q => q.selectedOption !== null).length;
    
    // 检查是否完成当前部分
    if (completed < currentSection.questions.length) {
      wx.showToast({
        title: `请完成本部分所有题目`,
        icon: 'none'
      });
      return;
    }
    
    if (this.data.currentSectionIndex < this.data.sections.length - 1) {
      // 进入下一部分
      const newIndex = this.data.currentSectionIndex + 1;
      this.setData({ currentSectionIndex: newIndex });
      this.updateProgress();
    } else {
      // 提交测评
      this.submitAssessment();
    }
  },

  /**
   * 提交测评
   */
  submitAssessment() {
    // 检查是否所有题目都已完成
    for (let i = 0; i < this.data.sections.length; i++) {
      const section = this.data.sections[i];
      const uncompleted = section.questions.filter(q => q.selectedOption === null).length;
      if (uncompleted > 0) {
        wx.showToast({
          title: `第${i + 1}部分还有${uncompleted}题未完成`,
          icon: 'none'
        });
        this.setData({ currentSectionIndex: i });
        return;
      }
    }
    
    wx.showLoading({ title: '提交测评...' });
    
    // 构建答案数据
    const answers = [];
    this.data.sections.forEach(section => {
      const sectionCode = section.id; // part1, part2_A, etc.
      section.questions.forEach(q => {
        answers.push({
          question_id: q.id,
          section: sectionCode,
          selected_option: q.selectedOption
        });
      });
    });
    
    // 构建测评数据
    const assessmentData = {
      user_id: parseInt(this.data.userId) || 1,
      baby_id: this.data.babyId || 1,
      scale_id: this.data.scaleId,
      age_group: this.data.ageGroup,
      age_months: 24, // 默认24个月，可从用户选择获取
      gender: 'female',
      answers: answers,
      test_duration: this.calculateTestDuration()
    };
    
    console.log('18-30月龄测评数据：', assessmentData);
    
    // 提交测评
    API.assessment.submitAssessment(assessmentData)
      .then(result => {
        wx.hideLoading();
        
        // 显示成功弹窗
        this.setData({ showSuccessPopup: true });
        
        setTimeout(() => {
          // 跳转到18-30月独立报告页面
          wx.redirectTo({
            url: `/pages/report-18-30/report-18-30?assessmentId=${result.id}`,
            fail: (err) => {
              console.error('跳转失败:', err);
              wx.showToast({
                title: '页面不存在',
                icon: 'none'
              });
            }
          });
        }, 1500);
      })
      .catch(err => {
        console.error('提交测评失败：', err);
        wx.hideLoading();
        wx.showToast({
          title: '提交测评失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    const userId = wx.getStorageSync('userId');
    const babyId = wx.getStorageSync('babyId');
    
    this.setData({ userId, babyId });
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }
  },

  /**
   * 计算测评时长
   */
  calculateTestDuration() {
    return Math.floor((Date.now() - this.data.startTime) / 1000) || 300;
  },

  /**
   * 返回按钮点击
   */
  goBack() {
    wx.showModal({
      title: '提示',
      content: '确定要退出测评吗？已填写的答案将不会保存。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1,
            fail: () => {
              wx.switchTab({
                url: '/pages/home/home'
              });
            }
          });
        }
      }
    });
  }
});
