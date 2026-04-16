// pages/story-reader/story-reader.js
import { getNavBarHeight } from '../../utils/navBar.js';
const { getStoryById } = require('../../mock/story-data.js');

Page({
  data: {
    navBarTotalHeight: 0,
    story: null,
    currentPageIndex: 0,
    currentPage: null,
    totalPages: 0,
    isPlaying: false,
    playModeText: '点击朗读'
  },

  onLoad(options) {
    this.innerAudioContext = wx.createInnerAudioContext();
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      this.setData({
        navBarTotalHeight: 100
      });
    }

    const storyId = options.id || '';
    const story = getStoryById(storyId);

    if (!story) {
      wx.showToast({
        title: '故事不存在',
        icon: 'none'
      });
      return;
    }

    this.setData({
      story,
      currentPageIndex: 0,
      currentPage: story.pages[0],
      totalPages: story.pages.length
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/story/story'
        });
      }
    });
  },

  prevPage() {
    const { currentPageIndex, story } = this.data;
    if (currentPageIndex <= 0) {
      wx.showToast({
        title: '已经是第一页',
        icon: 'none'
      });
      return;
    }

    const nextIndex = currentPageIndex - 1;
    this.setData({
      currentPageIndex: nextIndex,
      currentPage: story.pages[nextIndex],
      isPlaying: false,
      playModeText: '点击朗读'
    });
  },

  nextPage() {
    const { currentPageIndex, story, totalPages } = this.data;
    if (currentPageIndex >= totalPages - 1) {
      this.saveReadRecord();

      wx.showToast({
        title: '故事共读完成',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 1200);

      return;
    }

    const nextIndex = currentPageIndex + 1;
    this.setData({
      currentPageIndex: nextIndex,
      currentPage: story.pages[nextIndex],
      isPlaying: false,
      playModeText: '点击朗读'
    });
  },

  saveReadRecord() {
    const { story, totalPages, currentPageIndex } = this.data;
    if (!story) return;

    const records = wx.getStorageSync('storyReadRecords') || [];
    const record = {
      storyId: story.id,
      title: story.title,
      completedAt: new Date().toLocaleString(),
      totalPages,
      lastPage: currentPageIndex + 1,
      cover: story.cover
    };

    const filtered = records.filter((item) => item.storyId !== story.id);
    filtered.unshift(record);
    wx.setStorageSync('storyReadRecords', filtered.slice(0, 20));
  },

  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
  },

  playStoryAudio() {
    const { currentPage } = this.data;
    if (!currentPage) return;

    if (!currentPage.audio) {
      this.setData({
        isPlaying: true,
        playModeText: '朗读中（演示版）'
      });

      wx.showToast({
        title: '当前为演示版配音，可后续接入真实音频',
        icon: 'none'
      });

      setTimeout(() => {
        this.setData({
          isPlaying: false,
          playModeText: '点击朗读'
        });
      }, 1800);

      return;
    }

    this.innerAudioContext.src = currentPage.audio;
    this.innerAudioContext.play();

    this.setData({
      isPlaying: true,
      playModeText: '朗读中'
    });

    this.innerAudioContext.onEnded(() => {
      this.setData({
        isPlaying: false,
        playModeText: '点击朗读'
      });
    });

    this.innerAudioContext.onError(() => {
      this.setData({
        isPlaying: false,
        playModeText: '点击朗读'
      });
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
    });
  },

  pauseStoryAudio() {
    if (this.innerAudioContext) {
      this.innerAudioContext.pause();
    }

    this.setData({
      isPlaying: false,
      playModeText: '已暂停'
    });
  },

  replayStoryAudio() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }

    this.setData({
      isPlaying: false,
      playModeText: '重新朗读中'
    });

    setTimeout(() => {
      this.playStoryAudio();
    }, 200);
  }
});
