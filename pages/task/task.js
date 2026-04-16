import { getNavBarHeight } from '../../utils/navBar.js';

const taskData = require('./tasks-data.js');

Page({
  data: {
    navBarTotalHeight: 0,
    currentAge: '0-1',
    ageOptions: ['0-1岁', '1-2岁', '2-3岁'],
    ageKeys: ['0-1', '1-2', '2-3'],
    currentAgeIndex: 0,
    todayTask: null,
    pushTime: '',
    completedTasks: [],
    taskHistory: [],
    showHistory: false
  },

  onLoad(options) {
    const { totalHeight } = getNavBarHeight();
    this.setData({
      navBarTotalHeight: totalHeight
    });

    this.loadSavedData();
    this.generateTodayTask();
  },

  onShow() {
    this.checkAndRefreshTask();
  },

  loadSavedData() {
    try {
      const savedAge = wx.getStorageSync('currentAgeIndex');
      if (savedAge !== '' && savedAge !== null) {
        this.setData({
          currentAgeIndex: savedAge,
          currentAge: this.data.ageKeys[savedAge]
        });
      }

      const completedTasks = wx.getStorageSync('completedTasks') || [];
      const taskHistory = wx.getStorageSync('taskHistory') || [];
      this.setData({
        completedTasks,
        taskHistory
      });
    } catch (e) {
      console.error('加载保存数据失败:', e);
    }
  },

  onAgeChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      currentAgeIndex: index,
      currentAge: this.data.ageKeys[index]
    });

    wx.setStorageSync('currentAgeIndex', index);
    this.generateTodayTask();
  },

  generateTodayTask() {
    const { currentAge } = this.data;
    const taskLibrary = taskData.taskLibrary[currentAge];

    if (!taskLibrary || taskLibrary.length === 0) {
      this.setData({ todayTask: null });
      return;
    }

    const today = this.getTodayString();
    const savedTaskInfo = wx.getStorageSync(`task_${currentAge}_${today}`);

    if (savedTaskInfo) {
      this.setData({
        todayTask: savedTaskInfo.task,
        pushTime: savedTaskInfo.pushTime
      });
    } else {
      const randomIndex = Math.floor(Math.random() * taskLibrary.length);
      const selectedTask = taskLibrary[randomIndex];

      const pushTime = this.generateRandomPushTime();

      const taskInfo = {
        task: selectedTask,
        pushTime: pushTime,
        date: today
      };

      wx.setStorageSync(`task_${currentAge}_${today}`, taskInfo);

      this.setData({
        todayTask: selectedTask,
        pushTime: pushTime
      });
    }
  },

  generateRandomPushTime() {
    const timeSlots = taskData.pushTimeSlots;
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

    const [startHour, startMin] = randomSlot.start.split(':').map(Number);
    const [endHour, endMin] = randomSlot.end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const randomMinutes = startMinutes + Math.floor(Math.random() * (endMinutes - startMinutes));

    const hour = Math.floor(randomMinutes / 60);
    const minute = randomMinutes % 60;

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },

  checkAndRefreshTask() {
    const today = this.getTodayString();
    const { currentAge } = this.data;
    const savedTaskInfo = wx.getStorageSync(`task_${currentAge}_${today}`);

    if (!savedTaskInfo) {
      this.generateTodayTask();
    }
  },

  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  },

  onCompleteTask() {
    const { todayTask, currentAge } = this.data;
    if (!todayTask) return;

    const completedTask = {
      ...todayTask,
      completedAt: new Date().toISOString(),
      ageGroup: currentAge
    };

    const completedTasks = [...this.data.completedTasks, completedTask];
    this.setData({ completedTasks });
    wx.setStorageSync('completedTasks', completedTasks);

    wx.showToast({
      title: '任务已完成！',
      icon: 'success'
    });

    this.addToHistory(completedTask);
  },

  addToHistory(task) {
    const taskHistory = [...this.data.taskHistory];
    taskHistory.unshift({
      ...task,
      displayDate: this.formatDate(task.completedAt),
      historyKey: `${task.id || ''}_${task.completedAt || Date.now()}`
    });

    if (taskHistory.length > 30) {
      taskHistory.pop();
    }

    this.setData({ taskHistory });
    wx.setStorageSync('taskHistory', taskHistory);
  },

  formatDate(isoString) {
    const date = new Date(isoString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  toggleHistory() {
    this.setData({
      showHistory: !this.data.showHistory
    });
  },

  onRefreshTask() {
    const today = this.getTodayString();
    const { currentAge } = this.data;

    wx.removeStorageSync(`task_${currentAge}_${today}`);
    this.generateTodayTask();

    wx.showToast({
      title: '已刷新任务',
      icon: 'none'
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
