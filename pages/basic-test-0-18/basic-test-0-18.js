import { getNavBarHeight } from '../../utils/navBar.js';
const API = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarTotalHeight: 0,
    userId: null,
    babyId: null,
    startTime: Date.now(),
    
    // 量表数据
    scaleId: 'PCDI_VOCAB_GESTURE_0_18',
    scaleName: '汉语沟通发展量表（普通话版）：词汇及手势',
    
    // 当前部分索引 (0=A, 1=B, 2=C, 3=D)
    currentSectionIndex: 0,
    
    // 当前部分进度
    currentSectionCompleted: 0,
    currentSectionTotal: 0,
    currentSectionProgress: 0,
    
    // 四个部分的数据
    sections: [
      {
        id: 'A',
        title: '甲、初期对语言的反应',
        subtitle: '请根据孩子的实际情况选择',
        questions: [],
        options: ['没有', '有'],
        optionScores: [0, 10]
      },
      {
        id: 'B',
        title: '乙、听短句',
        subtitle: '请根据孩子的实际情况选择',
        questions: [],
        options: ['听不懂', '听懂'],
        optionScores: [0, 2]
      },
      {
        id: 'C',
        title: '丙、开始说话的方式',
        subtitle: '请根据孩子的实际情况选择',
        questions: [],
        options: ['从不', '有时', '经常'],
        optionScores: [0, 1, 3]
      },
      {
        id: 'D',
        title: '丁、词汇量表',
        subtitle: '请根据孩子的词汇掌握情况选择',
        questions: [],
        options: ['不懂', '听懂', '能说'],
        optionScores: [0, 1, 2]
      }
    ],
    
    // 用户答案
    answers: {},
    
    // 加载状态
    isLoading: true,
    loadingText: '加载题目中...',
    
    // 提交成功弹窗
    showSuccessPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const navBarHeight = getNavBarHeight();
    this.setData({
      navBarTotalHeight: navBarHeight,
      userId: options.userId || wx.getStorageSync('userId'),
      babyId: options.babyId || wx.getStorageSync('babyId'),
      startTime: Date.now()
    });
    
    // 加载题目
    this.loadQuestions();
  },

  /**
   * 计算当前部分已完成的题目数量
   */
  getCurrentSectionCompletedCount() {
    const sections = this.data.sections;
    const currentSectionIndex = this.data.currentSectionIndex;
    const questions = sections[currentSectionIndex].questions;
    return questions.filter(q => q.selectedOption !== null).length;
  },

  /**
   * 计算当前部分的总题目数量
   */
  getCurrentSectionTotalCount() {
    const sections = this.data.sections;
    const currentSectionIndex = this.data.currentSectionIndex;
    return sections[currentSectionIndex].questions.length;
  },

  /**
   * 计算当前部分的完成进度百分比
   */
  getCurrentSectionProgress() {
    const completed = this.getCurrentSectionCompletedCount();
    const total = this.getCurrentSectionTotalCount();
    return total > 0 ? (completed / total) * 100 : 0;
  },

  /**
   * 从服务器加载题目
   */
  loadQuestions() {
    this.setData({ isLoading: true, loadingText: '加载题目中...' });
    
    // 调用API获取题目
    API.assessment.getScaleQuestions(this.data.scaleId, '0~18个月')
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
   * 组织题目到四个部分
   */
  organizeQuestions(questions) {
    console.log('组织题目，原始数据数量:', questions.length);
    
    const sections = [
      {
        id: 'A',
        title: '甲、初期对语言的反应',
        subtitle: '请根据孩子的实际情况选择',
        questions: [],
        options: ['没有', '有'],
        optionScores: [0, 10]
      },
      {
        id: 'B',
        title: '乙、听短句',
        subtitle: '请根据孩子的实际情况选择',
        questions: [],
        options: ['听不懂', '听懂'],
        optionScores: [0, 2]
      },
      {
        id: 'C',
        title: '丙、开始说话的方式',
        subtitle: '请根据孩子的实际情况选择',
        questions: [],
        options: ['从不', '有时', '经常'],
        optionScores: [0, 1, 3]
      },
      {
        id: 'D',
        title: '丁、词汇量表',
        subtitle: '请根据孩子的词汇掌握情况选择',
        questions: [],
        options: ['不懂', '听懂', '能说'],
        optionScores: [0, 1, 2]
      },
      {
        id: 'E',
        title: '第二部分：动作及手势',
        subtitle: '请根据孩子的动作发展情况选择',
        questions: [],
        options: ['还没有', '有'],
        optionScores: [0, 1]
      }
    ];
    
    let matchedCount = 0;
    
    questions.forEach(q => {
      const dimension = (q.dimension || '').toLowerCase();
      const qid = (q.question_id || '').toLowerCase();
      
      if (dimension.includes('初期对语言的反应')) {
        sections[0].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('听短句理解')) {
        sections[1].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('开始说话的方式')) {
        sections[2].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('词汇量表')) {
        sections[3].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null
        });
        matchedCount++;
      } else if (dimension.includes('动作及手势')) {
        // part2 动作及手势部分
        let options = ['还没有', '有'];
        let scores = [0, 1];
        
        // 初期沟通手势有三个选项
        if (dimension.includes('初期沟通手势')) {
          options = ['还没有', '有时会', '经常会'];
          scores = [0, 1, 2];
        }
        
        sections[4].questions.push({
          id: q.question_id,
          text: q.question,
          selectedOption: null,
          options: options,
          optionScores: scores
        });
        matchedCount++;
      } else {
        // 根据题目ID判断归属
        if (qid.includes('part2_')) {
          sections[4].questions.push({
            id: q.question_id,
            text: q.question,
            selectedOption: null
          });
          matchedCount++;
        } else {
          // 默认分配到丁部分（词汇量表）
          sections[3].questions.push({
            id: q.question_id,
            text: q.question,
            selectedOption: null
          });
          matchedCount++;
        }
      }
    });
    
    console.log('题目分配结果:', {
      A: sections[0].questions.length,
      B: sections[1].questions.length,
      C: sections[2].questions.length,
      D: sections[3].questions.length,
      E: sections[4].questions.length,
      matched: matchedCount
    });
    
    // 生成随机答案
    this.generateRandomAnswers(sections);
    
    this.setData({ 
      sections,
      currentSectionCompleted: sections[0].questions.filter(q => q.selectedOption !== null).length,
      currentSectionTotal: sections[0].questions.length,
      currentSectionProgress: sections[0].questions.length > 0 ? (sections[0].questions.filter(q => q.selectedOption !== null).length / sections[0].questions.length) * 100 : 0
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
    // 甲部分 - 初期对语言的反应 (3题)
    const sectionAQuestions = [
      { id: 'A_001', text: '叫他的名字时会有反应（例如：转向及看声音来源的方向）', selectedOption: null },
      { id: 'A_002', text: '别人说"别××/不许××"时会有反应（例如：暂停做某件事）', selectedOption: null },
      { id: 'A_003', text: '当听到"妈妈/爸爸在哪里？"会向周围找', selectedOption: null }
    ];
    
    // 乙部分 - 听短句 (27题，这里展示部分)
    const sectionBQuestions = [
      { id: 'B_001', text: '爸爸/妈妈回家了', selectedOption: null },
      { id: 'B_002', text: '睡觉觉', selectedOption: null },
      { id: 'B_003', text: '尿湿了', selectedOption: null },
      { id: 'B_004', text: '不要动', selectedOption: null },
      { id: 'B_005', text: '过来', selectedOption: null }
    ];
    
    // 丙部分 - 开始说话的方式 (4题)
    const sectionCQuestions = [
      { id: 'C_001', text: '发出一连串的声音，好像是在说话', selectedOption: null },
      { id: 'C_002', text: '用声音来吸引别人注意', selectedOption: null },
      { id: 'C_003', text: '用手指东西，同时发出声音', selectedOption: null },
      { id: 'C_004', text: '模仿大人说话的声音', selectedOption: null }
    ];
    
    // 丁部分 - 词汇量表 (示例10词)
    const sectionDQuestions = [
      { id: 'D_001', text: '爸爸', selectedOption: null },
      { id: 'D_002', text: '妈妈', selectedOption: null },
      { id: 'D_003', text: '抱抱', selectedOption: null },
      { id: 'D_004', text: '狗狗', selectedOption: null },
      { id: 'D_005', text: '吃饭', selectedOption: null },
      { id: 'D_006', text: '喝水', selectedOption: null },
      { id: 'D_007', text: '睡觉', selectedOption: null },
      { id: 'D_008', text: '再见', selectedOption: null },
      { id: 'D_009', text: '谢谢', selectedOption: null },
      { id: 'D_010', text: '不要', selectedOption: null }
    ];
    
    const sections = this.data.sections;
    sections[0].questions = sectionAQuestions;
    sections[1].questions = sectionBQuestions;
    sections[2].questions = sectionCQuestions;
    sections[3].questions = sectionDQuestions;
    
    // 生成随机答案
    this.generateRandomAnswers(sections);
    
    this.setData({ 
      sections,
      currentSectionCompleted: sections[0].questions.filter(q => q.selectedOption !== null).length,
      currentSectionTotal: sections[0].questions.length,
      currentSectionProgress: sections[0].questions.length > 0 ? (sections[0].questions.filter(q => q.selectedOption !== null).length / sections[0].questions.length) * 100 : 0
    });
  },

  /**
   * 选择选项
   */
  selectOption(e) {
    const { sectionIndex, questionIndex, optionIndex } = e.currentTarget.dataset;
    const sections = this.data.sections;
    
    // 更新选中状态
    sections[sectionIndex].questions[questionIndex].selectedOption = optionIndex;
    
    // 计算当前部分的进度
    const completedCount = sections[sectionIndex].questions.filter(q => q.selectedOption !== null).length;
    const totalCount = sections[sectionIndex].questions.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    this.setData({ 
      sections,
      currentSectionCompleted: completedCount,
      currentSectionTotal: totalCount,
      currentSectionProgress: progress
    });
    
    // 保存答案
    const questionId = sections[sectionIndex].questions[questionIndex].id;
    const answers = this.data.answers;
    answers[questionId] = {
      section: sections[sectionIndex].id,
      selected_option: optionIndex
    };
    this.setData({ answers });
  },

  /**
   * 切换部分
   */
  switchSection(e) {
    const index = e.currentTarget.dataset.index;
    
    // 计算新部分的进度
    const sections = this.data.sections;
    const completedCount = sections[index].questions.filter(q => q.selectedOption !== null).length;
    const totalCount = sections[index].questions.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    this.setData({
      currentSectionIndex: index,
      currentSectionCompleted: completedCount,
      currentSectionTotal: totalCount,
      currentSectionProgress: progress
    });
  },

  /**
   * 上一部分
   */
  prevSection() {
    if (this.data.currentSectionIndex > 0) {
      this.setData({
        currentSectionIndex: this.data.currentSectionIndex - 1
      });
      // 滚动到顶部
      wx.pageScrollTo({ scrollTop: 0 });
    }
  },

  /**
   * 下一部分
   */
  nextSection() {
    const currentSection = this.data.sections[this.data.currentSectionIndex];
    const unanswered = currentSection.questions.filter(q => q.selectedOption === null).length;
    
    if (unanswered > 0) {
      wx.showToast({
        title: `还有${unanswered}题未完成`,
        icon: 'none'
      });
      return;
    }
    
    if (this.data.currentSectionIndex < 4) {
      this.setData({
        currentSectionIndex: this.data.currentSectionIndex + 1
      });
      wx.pageScrollTo({ scrollTop: 0 });
    } else {
      this.submitAssessment();
    }
  },

  /**
   * 提交测评
   */
  submitAssessment() {
    // 检查是否所有题目都已完成
    const sections = this.data.sections;
    let totalUnanswered = 0;
    sections.forEach(section => {
      totalUnanswered += section.questions.filter(q => q.selectedOption === null).length;
    });
    
    if (totalUnanswered > 0) {
      wx.showModal({
        title: '提示',
        content: `还有${totalUnanswered}道题目未完成，是否继续提交？`,
        success: (res) => {
          if (res.confirm) {
            this.doSubmit();
          }
        }
      });
    } else {
      this.doSubmit();
    }
  },

  /**
   * 执行提交
   */
  doSubmit() {
    wx.showLoading({ title: '提交测评...' });
    
    // 构建答案数组
    const answers = [];
    this.data.sections.forEach(section => {
      section.questions.forEach(q => {
        if (q.selectedOption !== null) {
          answers.push({
            question_id: q.id,
            section: section.id,
            selected_option: q.selectedOption
          });
        }
      });
    });
    
    // 构建测评数据
    const assessmentData = {
      user_id: parseInt(this.data.userId) || 1,
      baby_id: this.data.babyId || 1,
      scale_id: this.data.scaleId,
      age_group: '0~18个月',
      age_months: 12,
      gender: 'female',
      answers: answers,
      test_duration: this.calculateTestDuration()
    };
    
    console.log('PCDI 0-18月测评数据：', assessmentData);
    
    // 提交测评
    API.assessment.submitAssessment(assessmentData)
      .then(result => {
        wx.hideLoading();
        
        // 显示成功弹窗
        this.setData({ showSuccessPopup: true });
        
        setTimeout(() => {
          // 跳转到0-18月独立报告页面
          wx.redirectTo({
            url: `/pages/report-0-18/report-0-18?assessmentId=${result.id}`,
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
      title: '确认退出',
      content: '退出后已填写的答案将不会保存，是否确认退出？',
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
