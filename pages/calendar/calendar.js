import { getNavBarHeight } from '../../utils/navBar.js';

Page({
  data: {
    navBarTotalHeight: 0,
    napRecords: [],
    currentDate: '',
    calendarData: [],
    
    // 小睡状态
    isNapping: false,
    napStartTime: null,
    napStartTimeStr: '',
    elapsedSeconds: 0,
    elapsedStr: '00:00:00',
    timer: null
  },

  goBack() {
    // 如果正在小睡，提示用户
    if (this.data.isNapping) {
      wx.showModal({
        title: '提示',
        content: '正在记录小睡，确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            this.stopTimer();
            wx.navigateBack({
              delta: 1,
              fail: () => {
                wx.switchTab({
                  url: '/pages/profile/profile'
                });
              }
            });
          }
        }
      });
    } else {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({
            url: '/pages/profile/profile'
          });
        }
      });
    }
  },

  goToHelp() {
    wx.navigateTo({
      url: '/pages/sleep-info/sleep-info'
    });
  },

  // 开始小睡
  startNap() {
    const now = new Date();
    const startTime = Date.now();
    const startTimeStr = this.formatTime(now);
    
    this.setData({
      isNapping: true,
      napStartTime: startTime,
      napStartTimeStr: startTimeStr,
      elapsedSeconds: 0,
      elapsedStr: '00:00:00'
    });
    
    // 开始计时
    this.startTimer();
    
    wx.showToast({
      title: '开始记录小睡',
      icon: 'success',
      duration: 1500
    });
  },

  // 结束小睡
  endNap() {
    if (!this.data.isNapping) return;
    
    this.stopTimer();
    
    const endTime = new Date();
    const endTimeStr = this.formatTime(endTime);
    const duration = this.data.elapsedSeconds;
    
    // 计算小睡时长（分钟）
    const durationMinutes = Math.floor(duration / 60);
    
    if (durationMinutes < 1) {
      wx.showModal({
        title: '提示',
        content: '小睡时间太短了，是否继续记录？',
        success: (res) => {
          if (res.confirm) {
            this.saveNapRecord(endTime, endTimeStr, duration, durationMinutes);
          } else {
            // 取消记录，重置状态
            this.setData({
              isNapping: false,
              napStartTime: null,
              elapsedSeconds: 0,
              elapsedStr: '00:00:00'
            });
          }
        }
      });
    } else {
      this.saveNapRecord(endTime, endTimeStr, duration, durationMinutes);
    }
  },

  // 保存小睡记录
  saveNapRecord(endTime, endTimeStr, duration, durationMinutes) {
    const napRecords = wx.getStorageSync('napRecords') || [];
    const dateStr = this.formatDate(new Date(this.data.napStartTime));
    
    const napRecord = {
      id: Date.now().toString(),
      date: dateStr,
      startTime: this.data.napStartTimeStr,
      endTime: endTimeStr,
      duration: duration,
      durationMinutes: durationMinutes,
      durationStr: this.formatDuration(duration),
      createdTime: Date.now()
    };
    
    napRecords.unshift(napRecord);
    wx.setStorageSync('napRecords', napRecords);
    
    // 同时更新打卡记录（用于日历显示）
    this.updateCheckInRecords(dateStr);
    
    // 重置状态
    this.setData({
      isNapping: false,
      napStartTime: null,
      elapsedSeconds: 0,
      elapsedStr: '00:00:00',
      napRecords: napRecords
    });
    
    // 显示完成提示
    wx.showModal({
      title: '小睡记录完成',
      content: `小睡时长：${napRecord.durationStr}\n开始时间：${napRecord.startTime}\n结束时间：${napRecord.endTime}`,
      showCancel: false,
      confirmText: '确定'
    });
    
    // 刷新日历
    this.renderCalendar();
  },

  // 更新打卡记录（用于日历显示）
  updateCheckInRecords(dateStr) {
    const checkInRecords = wx.getStorageSync('sleepCheckInRecords') || [];
    const exists = checkInRecords.some(record => record.date === dateStr);
    
    if (!exists) {
      checkInRecords.unshift({
        id: Date.now().toString(),
        date: dateStr,
        createdTime: Date.now()
      });
      wx.setStorageSync('sleepCheckInRecords', checkInRecords);
    }
  },

  // 开始计时器
  startTimer() {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.napStartTime) / 1000);
      this.setData({
        elapsedSeconds: elapsed,
        elapsedStr: this.formatDuration(elapsed)
      });
    }, 1000);
    
    this.setData({ timer });
  },

  // 停止计时器
  stopTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },

  // 格式化时长
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  // 格式化时间
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 日期点击
  onDateClick(e) {
    const date = e.currentTarget.dataset.date;
    this.showDateNapRecords(date);
  },

  // 显示指定日期的小睡记录
  showDateNapRecords(date) {
    const napRecords = wx.getStorageSync('napRecords') || [];
    const dayRecords = napRecords.filter(record => record.date === date);
    
    if (dayRecords.length > 0) {
      const totalMinutes = dayRecords.reduce((sum, r) => sum + r.durationMinutes, 0);
      const recordList = dayRecords.map(r => `${r.startTime}-${r.endTime} (${r.durationStr})`).join('\n');
      
      wx.showModal({
        title: `${date} 小睡记录`,
        content: `共${dayRecords.length}次小睡，总计${totalMinutes}分钟\n\n${recordList}`,
        showCancel: false,
        confirmText: '确定'
      });
    } else {
      wx.showToast({
        title: `${date} 无小睡记录`,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 渲染日历
  renderCalendar() {
    const checkInRecords = wx.getStorageSync('sleepCheckInRecords') || [];
    const calendarData = this.generateCalendarData(checkInRecords);
    
    this.setData({
      calendarData: calendarData
    });
  },

  // 生成日历数据
  generateCalendarData(checkInRecords) {
    const today = new Date();
    const calendarData = [];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthTitle = `${year}年${month + 1}月`;
      
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = this.formatDate(new Date(year, month, day));
        const isCheckedIn = checkInRecords.some(record => record.date === dateStr);
        const isToday = dateStr === this.formatDate(today);
        
        days.push({
          day: day,
          date: dateStr,
          isCheckedIn: isCheckedIn,
          isToday: isToday
        });
      }
      
      calendarData.push({
        month: monthTitle,
        days: days
      });
    }
    
    return calendarData;
  },

  onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      console.error('导航栏高度计算失败：', error);
      this.setData({
        navBarTotalHeight: 100
      });
    }
    
    const napRecords = wx.getStorageSync('napRecords') || [];
    this.setData({
      napRecords: napRecords
    });
    
    this.renderCalendar();
  },

  onShow() {
    const napRecords = wx.getStorageSync('napRecords') || [];
    this.setData({
      napRecords: napRecords
    });
    this.renderCalendar();
  },

  onHide() {
    // 页面隐藏时暂停计时器（但不停止小睡）
    if (this.data.isNapping && this.data.timer) {
      // 保持小睡状态，只是暂停计时器更新
    }
  },

  onUnload() {
    this.stopTimer();
  },

  onPullDownRefresh() {
    const napRecords = wx.getStorageSync('napRecords') || [];
    this.setData({
      napRecords: napRecords
    });
    this.renderCalendar();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onShareAppMessage() {
    return {
      title: '咿呀智库·小睡记录日历',
      path: '/pages/calendar/calendar'
    };
  }
});
