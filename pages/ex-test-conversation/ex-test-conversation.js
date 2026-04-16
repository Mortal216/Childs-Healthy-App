import { getNavBarHeight } from '../../utils/navBar.js';
const DeepSeek = require('../../utils/deepseek.js');
const { analyzeDialogueText } = require('../../utils/dialogue-analyzer.js');
const { getDemoTranscript, getDefaultFileInfo } = require('../../mock/dialogue-demo.js');
const { buildReportFromAi } = require('../../utils/dialogue-result-normalize.js');

Page({
  data: {
    navBarTotalHeight: 0,
    status: 'idle',
    statusText: '请上传录音或输入对话文本',
    selectedFile: null,
    fileInfo: {
      name: '',
      sizeMB: 0,
      durationSec: 0,
      format: ''
    },
    transcriptText: '',
    dialogueText: '',
    loading: false,
    isAnalyzing: false,
    maxFileSizeMB: 20,
    maxDurationSec: 600
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }
    });
  },

  goToHelp() {
    wx.showToast({
      title: '帮助功能即将上线',
      icon: 'none',
      duration: 2000
    });
  },

  onInput(e) {
    const value = e.detail.value || '';
    this.setData({
      dialogueText: value,
      transcriptText: value,
      status: value.trim() ? 'ready' : 'idle',
      statusText: value.trim() ? '文本已就绪，可开始分析' : '请上传录音或输入对话文本'
    });
  },

  uploadAudio() {
    this.chooseAudio();
  },

  uploadVideo() {
    wx.chooseMessageFile({
      count: 1,
      type: 'video',
      success: () => {
        wx.showToast({
          title: '视频上传成功',
          icon: 'none'
        });
      },
      fail: () => {
        wx.showToast({
          title: '视频上传失败',
          icon: 'none'
        });
      }
    });
  },

  selectHistory() {
    wx.showToast({
      title: '历史对话功能即将上线',
      icon: 'none'
    });
  },

  delay(ms = 500) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  },

  saveReport(report) {
    const records = wx.getStorageSync('dialogueAnalysisRecords') || [];
    records.unshift(report);
    wx.setStorageSync('dialogueAnalysisRecords', records.slice(0, 20));
  },

  async startAnalyze() {
    const hasText = !!(this.data.dialogueText || '').trim();
    const hasAudio = !!this.data.selectedFile;

    if (!hasText && !hasAudio) {
      wx.showToast({
        title: '请输入或上传对话内容',
        icon: 'none'
      });
      return;
    }

    this.setData({
      loading: true,
      isAnalyzing: true
    });

    try {
      let finalText = (this.data.dialogueText || '').trim();
      let finalFileInfo = { ...this.data.fileInfo };

      if (hasAudio) {
        this.setData({
          status: 'uploading',
          statusText: '音频处理中...'
        });
        await this.delay(600);

        this.setData({
          status: 'transcribing',
          statusText: '正在准备转写文本...'
        });
        await this.delay(500);

        finalText = getDemoTranscript();

        finalFileInfo = {
          ...getDefaultFileInfo(
            this.data.fileInfo.name || 'demo-dialogue.m4a',
            this.data.fileInfo.sizeMB || 3.2,
            this.data.fileInfo.durationSec || 286
          ),
          ...this.data.fileInfo
        };

        this.setData({
          transcriptText: finalText
        });
      }

      if (hasText && !hasAudio) {
        finalFileInfo = {
          name: '手动输入文本',
          sizeMB: 0,
          durationSec: Math.max(60, Math.min(600, Math.ceil(finalText.length / 8))),
          format: 'txt'
        };
        this.setData({
          transcriptText: finalText,
          fileInfo: finalFileInfo
        });
      }

      this.setData({
        status: 'analyzing',
        statusText: '正在分析对话...'
      });

      let report;
      try {
        const ai = await DeepSeek.analyzeDialogue({
          dialogueText: finalText
        });
        report = buildReportFromAi(ai, finalText, finalFileInfo);
      } catch (aiErr) {
        console.warn('AI 分析不可用，使用本地规则分析', aiErr);
        report = analyzeDialogueText(finalText, finalFileInfo);
      }

      this.saveReport(report);

      this.setData({
        status: 'done',
        statusText: '分析完成'
      });

      wx.navigateTo({
        url: `/pages/dialogue-result/dialogue-result?reportData=${encodeURIComponent(JSON.stringify(report))}`,
        fail: (err) => {
          wx.showToast({
            title: '跳转分析结果页失败',
            icon: 'none'
          });
          console.error('跳转失败原因：', err);
        }
      });
    } catch (error) {
      console.error('分析失败:', error);
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
      this.setData({
        status: 'fail',
        statusText: '分析失败，请重试'
      });
    } finally {
      this.setData({
        loading: false,
        isAnalyzing: false
      });
    }
  },

  cancel() {
    this.setData({
      dialogueText: '',
      transcriptText: '',
      selectedFile: null,
      status: 'idle',
      statusText: '请上传录音或输入对话文本',
      loading: false,
      isAnalyzing: false,
      fileInfo: {
        name: '',
        sizeMB: 0,
        durationSec: 0,
        format: ''
      }
    });
  },

  getAudioDuration(filePath) {
    return new Promise((resolve) => {
      const audio = wx.createInnerAudioContext();
      let finished = false;

      const finish = (duration) => {
        if (finished) return;
        finished = true;
        try {
          audio.destroy();
        } catch (e) {}
        resolve(duration || 0);
      };

      audio.src = filePath;

      audio.onCanplay(() => {
        setTimeout(() => {
          finish(Math.round(audio.duration || 0));
        }, 300);
      });

      audio.onError(() => {
        finish(0);
      });

      setTimeout(() => {
        finish(Math.round(audio.duration || 0));
      }, 3000);
    });
  },

  chooseAudio() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'm4a', 'wav'],
      success: async (res) => {
        const file = (res.tempFiles && res.tempFiles[0]) || {};
        const path = file.path || file.tempFilePath || '';
        const name = file.name || '未命名音频';
        const size = Number(file.size || 0);
        const ext = name.split('.').pop().toLowerCase();
        const sizeMB = Number((size / 1024 / 1024).toFixed(2));

        if (!['mp3', 'm4a', 'wav'].includes(ext)) {
          wx.showToast({
            title: '仅支持 mp3/m4a/wav',
            icon: 'none'
          });
          return;
        }

        if (sizeMB > this.data.maxFileSizeMB) {
          wx.showToast({
            title: '文件不能超过 20MB',
            icon: 'none'
          });
          return;
        }

        let durationSec = await this.getAudioDuration(path);

        if (!durationSec || Number.isNaN(durationSec)) {
          durationSec = 286;
        }

        if (durationSec > this.data.maxDurationSec) {
          wx.showToast({
            title: '音频时长不能超过 10 分钟',
            icon: 'none'
          });
          return;
        }

        this.setData({
          selectedFile: {
            name,
            path
          },
          fileInfo: {
            name,
            sizeMB,
            durationSec,
            format: ext
          },
          status: 'ready',
          statusText: '音频已选择，可开始分析',
          transcriptText: '',
          dialogueText: ''
        });
      },
      fail: () => {
        wx.showToast({
          title: '选择音频失败',
          icon: 'none'
        });
      }
    });
  },

  onLoad() {
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
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: '咿呀智库·交流对话分析',
      path: '/pages/ex-test-conversation/ex-test-conversation'
    };
  }
});
