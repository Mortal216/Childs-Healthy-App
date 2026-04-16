const DeepSeek = require('../../utils/deepseek.js')
const API = require('../../utils/api.js')
const { request } = require('../../utils/request.js')
const { buildAiContentHtml } = require('../../utils/format-ai-bubble.js')

const QUICK_QUESTIONS = [
  '我的孩子不爱说话怎么办？',
  '如何培养孩子的语言能力？',
  '孩子发脾气时怎么处理？',
  '如何建立良好的亲子关系？',
  '孩子挑食怎么办？',
  '如何安排孩子的作息时间？'
]

function buildFallbackResponse(userInput) {
  if (userInput.includes('说话') || userInput.includes('语言')) {
    return '建议先从高频互动开始：每天固定面对面聊天、描述正在发生的事、读绘本时指图命名，并及时回应孩子的声音和手势。'
  }

  if (userInput.includes('发脾气') || userInput.includes('情绪')) {
    return '先接住情绪，再守住边界。可以先说“我知道你现在很生气”，等孩子稍微平静后，再给出简单明确的规则和替代做法。'
  }

  if (userInput.includes('亲子') || userInput.includes('关系')) {
    return '优先保证稳定陪伴和高质量互动，比如一起读书、游戏、模仿发声。孩子更看重回应是否及时，而不是互动是否复杂。'
  }

  if (userInput.includes('挑食') || userInput.includes('吃饭')) {
    return '不要强迫进食，尽量固定进餐节奏，少用零食替代正餐，让孩子多次接触同一种食物，降低吃饭时的压力。'
  }

  if (userInput.includes('作息') || userInput.includes('睡')) {
    return '可以建立固定睡前流程，比如洗漱、关灯、讲故事。白天保证活动量，晚上减少刺激，通常比单纯催睡更有效。'
  }

  return '可以继续告诉我孩子的月龄、具体场景和你的担心点，我会按育儿场景给你更具体的建议。'
}

function looksLikeCozeIndexSpam(text) {
  const re = /[\u4e00-\u9fff]\d{1,4}(?=[\u4e00-\u9fff])/g
  const m = text.match(re)
  return !!(m && m.length >= 5)
}

/** 与后端一致：保留月龄/秒数等；仅疑似索引刷屏时去汉字间数字；去掉行首序号 */
function stripCozeStreamIndexNoise(text) {
  const protect =
    /约\s*\d{1,4}(?:个月|岁|周|天)|\d{1,4}[\-–]\d{1,4}(?:秒|分钟|小时|个月|岁|周|天)?|\d{1,4}(?:个月|岁|周|天|秒|分钟|小时|周龄|日龄)|\d{1,4}个(?:月|词|字)?|\d+个(?:有意义的)?词/g
  const vault = []
  let t = text.replace(protect, (m) => {
    vault.push(m)
    return `⟦YH${vault.length - 1}⟧`
  })
  t = t.replace(/(?:^|\n)[ \t]*\d{1,3}[\.\．、)]\s+/g, '\n')
  t = t.replace(/(?:^|\n)[ \t]*[一二三四五六七八九十百]+[、．.]\s*/g, '\n')
  if (looksLikeCozeIndexSpam(t)) {
    const reBetween = new RegExp(
      '(?:^|\\n|(?<=[\\u4e00-\\u9fff\\u3000-\\u303f\\uff00-\\uffef\\u27e7\\]\\)、，。；：\\s]))\\d{1,4}(?=[\\u4e00-\\u9fff\\u3000-\\u303f\\uff00-\\uffef])',
      'g'
    )
    t = t.replace(reBetween, '')
  }
  vault.forEach((v, i) => {
    t = t.split(`⟦YH${i}⟧`).join(v)
  })
  t = t.replace(/\n{3,}/g, '\n\n')
  return t
}

function stripCozeProtocolWordLeaks(text) {
  let t = text.replace(/message(?:-message)+/gi, ' ')
  t = t.replace(/(?<![A-Za-z])message\d+/g, '')
  t = t.replace(/(?<![A-Za-z])message(?![A-Za-z0-9_-])/gi, '')
  return t.replace(/[ \t\f\v]{2,}/g, ' ')
}

/** 去掉 Coze stream 里混入的事件名+后缀（如 answeryiya_app_user） */
function sanitizeCozeReply(text) {
  if (typeof text !== 'string' || !text) {
    return text
  }
  let t = text.replace(/[a-z][a-z0-9_]{0,80}yiya_app_user/gi, '')
  t = t.replace(/yiya_app_user/gi, '')
  t = stripCozeProtocolWordLeaks(t)
  t = stripCozeStreamIndexNoise(t)
  t = t.replace(/[ \t\f\v]{2,}/g, ' ')
  t = t.replace(/\n{3,}/g, '\n\n')
  t = t.trim()
  return t
}

function aiBubbleFields(text) {
  const content = typeof text === 'string' ? text : ''
  return {
    content,
    contentHtml: buildAiContentHtml(content)
  }
}

Page({
  data: {
    chatHistory: [],
    agentChannel: 'deepseek',
    inputValue: '',
    loading: false,
    aiAvatar: '/images/zhinengti/1.jpg',
    userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20parent%20avatar%2C%20friendly%20smile&image_size=square',
    quickQuestions: QUICK_QUESTIONS,
    streaming: false,
    tempResponse: '',
    navBarTotalHeight: 0
  },

  onLoad() {
    this.calculateNavBarHeight()
    this.initWelcomeMessage()
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  calculateNavBarHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = 44

    this.setData({
      navBarTotalHeight: statusBarHeight + navBarHeight
    })
  },

  initWelcomeMessage() {
    if (this.data.chatHistory.length > 0) {
      return
    }

    const welcome =
      '你好，我是“小咿”。上方可切换「DeepSeek」或「Coze 智能体」：DeepSeek 走云开发对话；Coze 由后端转发官方智能体。你可以直接描述孩子的表现、月龄和你的困扰。'
    this.setData({
      chatHistory: [{
        role: 'ai',
        ...aiBubbleFields(welcome)
      }]
    })
  },

  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  setAgentChannel(e) {
    const channel = e.currentTarget.dataset.channel
    if (!channel || this.data.loading) {
      return
    }
    this.setData({ agentChannel: channel })
  },

  async callCozeAgent(message, baseHistory) {
    const history = baseHistory || this.data.chatHistory
    this.setData({
      loading: true,
      streaming: false,
      tempResponse: ''
    })
    try {
      const res = await API.coze.chat(message)
      const rawReply =
        (res && typeof res.reply === 'string' && res.reply.trim()) ||
        '（暂未解析到文本回复，请在后端核对 Coze 返回结构或查看 raw）'
      const reply = sanitizeCozeReply(rawReply) || rawReply
      this.setData({
        chatHistory: [
          ...history,
          {
            role: 'ai',
            ...aiBubbleFields(reply),
            sourceLabel: 'Coze智能体回复'
          }
        ],
        loading: false
      })
    } catch (err) {
      console.error('Coze 请求失败', err)
      wx.showToast({
        title: (err && err.detail) || 'Coze 请求失败',
        icon: 'none',
        duration: 2500
      })
      this.setData({
        chatHistory: [
          ...history,
          {
            role: 'ai',
            ...aiBubbleFields('Coze 智能体暂时不可用，请检查后端配置或稍后再试。'),
            sourceLabel: 'Coze智能体回复'
          }
        ],
        loading: false
      })
    }
  },

  async sendMessage(presetQuestion) {
    const rawInput = typeof presetQuestion === 'string' ? presetQuestion : this.data.inputValue
    const inputValue = (rawInput || '').trim()
    const { chatHistory, loading, agentChannel } = this.data

    if (!inputValue || loading) {
      return
    }

    const newChatHistory = [...chatHistory, {
      role: 'user',
      content: inputValue
    }]

    this.setData({
      chatHistory: newChatHistory,
      inputValue: ''
    })

    if (agentChannel === 'coze') {
      await this.callCozeAgent(inputValue, newChatHistory)
      return
    }

    this.setData({
      loading: true,
      streaming: true,
      tempResponse: ''
    })

    try {
      const response = await DeepSeek.generateAgentResponse({
        message: inputValue,
        chatHistory,
        onChunk: (chunk) => {
          if (chunk.type === 'text') {
            this.setData({
              tempResponse: chunk.fullText
            })
          }
        }
      })

      this.setData({
        chatHistory: [...newChatHistory, {
          role: 'ai',
          ...aiBubbleFields(response)
        }],
        loading: false,
        streaming: false,
        tempResponse: ''
      })
    } catch (error) {
      console.error('调用 DeepSeek 失败:', error)
      wx.showToast({
        title: 'AI 服务暂时不可用，已切换本地回复',
        icon: 'none',
        duration: 2000
      })
      this.fallbackResponse(inputValue, newChatHistory)
    }
  },

  selectQuickQuestion(e) {
    const { question } = e.currentTarget.dataset
    this.sendMessage(question)
  },

  async generateAIResponse(userInput) {
    const { chatHistory } = this.data

    try {
      const res = await request({
        url: '/llm/agent',
        method: 'POST',
        data: {
          message: userInput,
          chat_history: chatHistory.map((item) => ({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: item.content
          }))
        }
      })

      if (res && res.response) {
        this.setData({
          chatHistory: [...chatHistory, {
            role: 'ai',
            ...aiBubbleFields(res.response)
          }],
          loading: false
        })
        return
      }
    } catch (error) {
      console.error('调用后端 AI 接口失败:', error)
    }

    this.fallbackResponse(userInput, chatHistory)
  },

  fallbackResponse(userInput, chatHistory) {
    this.setData({
      chatHistory: [...chatHistory, {
        role: 'ai',
        ...aiBubbleFields(buildFallbackResponse(userInput))
      }],
      loading: false,
      streaming: false,
      tempResponse: ''
    })
  }
})