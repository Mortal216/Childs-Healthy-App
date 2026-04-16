const DeepSeek = require('../../utils/deepseek.js')
const { request } = require('../../utils/request.js')

const SCENES = [
  {
    id: 1,
    name: '早餐时间',
    dialogueBackground: '/images/changjing/1.png',
    background: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bright%20kitchen%20scene%20with%20breakfast%20table%2C%20warm%20colors&image_size=landscape_16_9',
    childImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20child%20eating%20breakfast%2C%20happy%20expression&image_size=square',
    parentImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20parent%20serving%20breakfast%2C%20friendly%20smile&image_size=square',
    initialDialogue: '妈妈，我不想吃鸡蛋。'
  },
  {
    id: 2,
    name: '玩耍时间',
    dialogueBackground: '/images/changjing/2.jpg',
    background: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20playroom%20with%20toys%2C%20cheerful%20atmosphere&image_size=landscape_16_9',
    childImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20child%20playing%20with%20toys%2C%20excited&image_size=square',
    parentImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20parent%20playing%20with%20child%2C%20engaged&image_size=square',
    initialDialogue: '爸爸，这个玩具坏了。'
  },
  {
    id: 3,
    name: '睡前时间',
    dialogueBackground: '/images/changjing/3.png',
    background: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20bedroom%20with%20nightlight%2C%20warm%20lighting&image_size=landscape_16_9',
    childImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20child%20in%20bed%2C%20sleepy%20eyes&image_size=square',
    parentImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20parent%20sitting%20by%20bed%2C%20reading%20story&image_size=square',
    initialDialogue: '妈妈，我还不想睡觉。'
  },
  {
    id: 4,
    name: '外出时间',
    dialogueBackground: '/images/changjing/4.png',
    background: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=park%20scene%20with%20trees%20and%20grass%2C%20sunny%20day&image_size=landscape_16_9',
    childImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20child%20playing%20in%20park%2C%20energetic&image_size=square',
    parentImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20parent%20watching%20child%20play%2C%20attentive&image_size=square',
    initialDialogue: '爸爸，我想玩那个秋千。'
  }
]

function buildFallbackChildResponse(sceneId, parentResponse) {
  if (sceneId === 1) {
    if (parentResponse.includes('为什么')) {
      return '因为我现在不想吃。'
    }
    if (parentResponse.includes('健康') || parentResponse.includes('营养')) {
      return '那我先吃一小口。'
    }
    return '好吧，我试试看。'
  }

  if (sceneId === 2) {
    if (parentResponse.includes('修') || parentResponse.includes('坏')) {
      return '那你可以帮我修好吗？'
    }
    if (parentResponse.includes('换') || parentResponse.includes('新的')) {
      return '我想要一个新玩具车。'
    }
    return '那我们玩别的吧。'
  }

  if (sceneId === 3) {
    if (parentResponse.includes('为什么')) {
      return '因为我还想玩。'
    }
    if (parentResponse.includes('故事')) {
      return '那你再给我讲一个故事。'
    }
    return '那你要陪着我。'
  }

  if (parentResponse.includes('秋千')) {
    return '太好了，我想马上去玩。'
  }
  if (parentResponse.includes('等') || parentResponse.includes('排队')) {
    return '可是我现在就想玩。'
  }
  return '那我们快过去吧。'
}

Page({
  data: {
    sceneList: SCENES,
    currentScene: SCENES[0],
    dialogueHistory: [],
    inputValue: '',
    showParent: true,
    navBarTotalHeight: 0,
    showInput: false,
    focusInput: false,
    lastMsgId: ''
  },

  onLoad() {
    this.calculateNavBarHeight()
    this.initSceneDialogue()
  },

  calculateNavBarHeight() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = 44

    this.setData({
      navBarTotalHeight: statusBarHeight + navBarHeight
    })
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  showHelp() {
    wx.showModal({
      title: '提示',
      content: '点击麦克风输入你的回应；上滑可选择场景并结束对话。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  openInput() {
    this.setData({
      showInput: true,
      focusInput: false
    }, () => {
      // nextTick 后再聚焦，避免 iOS/Android 偶发不弹键盘
      setTimeout(() => {
        this.setData({
          focusInput: true
        })
      }, 50)
    })
  },

  closeInput() {
    this.setData({
      showInput: false,
      focusInput: false,
      inputValue: ''
    })
  },

  initSceneDialogue() {
    const { currentScene } = this.data

    this.setData({
      dialogueHistory: [{
        role: 'child',
        content: `我是“小宝”，现在是${currentScene.name}场景。${currentScene.initialDialogue}`
      }],
      inputValue: '',
      lastMsgId: 'msg-0'
    })
  },

  changeScene(e) {
    const sceneId = Number(e.currentTarget.dataset.id)
    const scene = SCENES.find((item) => item.id === sceneId)

    if (!scene) {
      return
    }

    this.setData({
      currentScene: scene,
      showInput: false,
      focusInput: false,
      inputValue: ''
    }, () => {
      this.initSceneDialogue()
    })
  },

  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value,
      focusInput: true
    })
  },

  async sendMessage(presetText) {
    const rawInput = typeof presetText === 'string' ? presetText : this.data.inputValue
    const parentResponse = (rawInput || '').trim()
    const { dialogueHistory, currentScene } = this.data

    if (!parentResponse) {
      return
    }

    const newDialogueHistory = [...dialogueHistory, {
      role: 'parent',
      content: parentResponse
    }]

    this.setData({
      dialogueHistory: newDialogueHistory,
      inputValue: '',
      // 发送后保持对话层打开，立即能看到记录与后续回复
      showInput: true,
      focusInput: true,
      lastMsgId: `msg-${newDialogueHistory.length - 1}`
    })

    try {
      const childResponse = await DeepSeek.generateChildResponse({
        scene: currentScene.name,
        dialogueHistory,
        parentResponse
      })

      const nextHistory = [...newDialogueHistory, {
        role: 'child',
        content: childResponse
      }]
      this.setData({
        dialogueHistory: nextHistory,
        showInput: true,
        focusInput: true,
        lastMsgId: `msg-${nextHistory.length - 1}`
      })
    } catch (error) {
      console.error('调用 DeepSeek 场景对话失败:', error)
      wx.showToast({
        title: 'AI 服务暂时不可用，已切换本地模拟',
        icon: 'none',
        duration: 2000
      })
      this.fallbackChildResponse(parentResponse, newDialogueHistory, currentScene)
    }
  },

  async simulateChildResponse(parentResponse) {
    const { dialogueHistory, currentScene } = this.data

    try {
      const res = await request({
        url: '/llm/scene',
        method: 'POST',
        data: {
          scene: currentScene.name,
          dialogue_history: dialogueHistory,
          parent_response: parentResponse
        }
      })

      if (res && res.child_response) {
        this.setData({
          dialogueHistory: [...dialogueHistory, {
            role: 'child',
            content: res.child_response
          }]
        })
        return
      }
    } catch (error) {
      console.error('调用后端场景接口失败:', error)
    }

    this.fallbackChildResponse(parentResponse, dialogueHistory, currentScene)
  },

  fallbackChildResponse(parentResponse, dialogueHistory, currentScene) {
    const nextHistory = [...dialogueHistory, {
      role: 'child',
      content: buildFallbackChildResponse(currentScene.id, parentResponse)
    }]
    this.setData({
      dialogueHistory: nextHistory,
      inputValue: '',
      showInput: true,
      focusInput: true,
      lastMsgId: `msg-${nextHistory.length - 1}`
    })
  },

  endDialogue() {
    const { dialogueHistory, currentScene } = this.data

    if (!dialogueHistory.length) {
      return
    }

    wx.showModal({
      title: '互动反馈',
      content: this.generateFeedback(dialogueHistory, currentScene),
      showCancel: false,
      confirmText: '知道了'
    })
  },

  generateFeedback(dialogueHistory, currentScene) {
    const parentResponses = dialogueHistory.filter((item) => item.role === 'parent')
    const openQuestions = parentResponses.filter((item) => {
      const text = item.content || ''
      return text.includes('为什么') || text.includes('怎么') || text.includes('可以吗')
    })

    const feedback = [
      `场景：${currentScene.name}`,
      `对话轮数：${parentResponses.length}`,
      '',
      '分析结果：'
    ]

    if (parentResponses.length >= 3) {
      feedback.push('1. 你已经和孩子进行了多轮互动，整体节奏不错。')
    } else {
      feedback.push('1. 可以尝试多追问一轮，让孩子有更多表达机会。')
    }

    if (openQuestions.length > 0) {
      feedback.push('2. 你使用了开放式提问，这有助于孩子继续表达。')
    } else {
      feedback.push('2. 可以多用“为什么”“我们怎么做”这类问题。')
    }

    feedback.push('3. 继续保持耐心回应，并先接住孩子当下的情绪。')

    return feedback.join('\n')
  }
})