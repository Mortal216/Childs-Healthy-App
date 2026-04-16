import { getNavBarHeight } from '../../utils/navBar.js';

const COVER_ORDERS = {
  language: ['/images/kepu/1.jpg', '/images/kepu/2.jpg', '/images/kepu/3.jpg', '/images/kepu/4.jpg'],
  cognition: ['/images/kepu/4.jpg', '/images/kepu/1.jpg', '/images/kepu/2.jpg', '/images/kepu/3.jpg'],
  social: ['/images/kepu/2.jpg', '/images/kepu/4.jpg', '/images/kepu/1.jpg', '/images/kepu/3.jpg'],
  emotion: ['/images/kepu/3.jpg', '/images/kepu/2.jpg', '/images/kepu/4.jpg', '/images/kepu/1.jpg']
}

Page({
  data: {
    navBarTotalHeight: 0,
    currentSubTab: 'language',
    coverOrder: COVER_ORDERS.language,
    literatureList: [
      {
        id: 1,
        title: '2026年最新研究：0-3岁宝宝语言发展的关键期',
        source: '中国儿童发展研究中心',
        publishTime: '2026-02-25',
        summary: '本文探讨了关键期语言发展的重要性，分析了不同月龄宝宝的语言发展里程碑...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=language%20development%20research%20scientific%20paper&image_size=square'
      },
      {
        id: 2,
        title: '家庭语言环境对0-3岁儿童语言发展的影响',
        source: '中国儿童保健杂志',
        publishTime: '2026-02-24',
        summary: '基于1000个家庭的追踪研究，本文分析了家庭语言环境的关键因素...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20language%20environment%20research&image_size=square'
      },
      {
        id: 3,
        title: '双语环境下0-3岁儿童的语言发展特点',
        source: '心理学报',
        publishTime: '2026-02-23',
        summary: '本文探讨了双语家庭中儿童语言发展的独特路径和优势...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bilingual%20language%20development%20research&image_size=square'
      },
      {
        id: 4,
        title: '0-3岁儿童语言发展迟缓的早期识别与干预',
        source: '中国特殊教育',
        publishTime: '2026-02-22',
        summary: '本文提供了语言发展迟缓的早期识别工具和科学干预方法...',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=language%20delay%20intervention%20research&image_size=square'
      }
    ],
    loading: false,
    // 不同分类的预设文献数据
    literatureData: {
      language: [
        {
          id: 1,
          title: '2026年最新研究：0-3岁宝宝语言发展的关键期',
          source: '中国儿童发展研究中心',
          publishTime: '2026-02-25',
          summary: '本文探讨了关键期语言发展的重要性，分析了不同月龄宝宝的语言发展里程碑...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=language%20development%20research%20scientific%20paper&image_size=square'
        },
        {
          id: 2,
          title: '家庭语言环境对0-3岁儿童语言发展的影响',
          source: '中国儿童保健杂志',
          publishTime: '2026-02-24',
          summary: '基于1000个家庭的追踪研究，本文分析了家庭语言环境的关键因素...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20language%20environment%20research&image_size=square'
        },
        {
          id: 3,
          title: '双语环境下0-3岁儿童的语言发展特点',
          source: '心理学报',
          publishTime: '2026-02-23',
          summary: '本文探讨了双语家庭中儿童语言发展的独特路径和优势...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bilingual%20language%20development%20research&image_size=square'
        },
        {
          id: 4,
          title: '0-3岁儿童语言发展迟缓的早期识别与干预',
          source: '中国特殊教育',
          publishTime: '2026-02-22',
          summary: '本文提供了语言发展迟缓的早期识别工具和科学干预方法...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=language%20delay%20intervention%20research&image_size=square'
        }
      ],
      cognition: [
        {
          id: 5,
          title: '0-3岁儿童认知发展的神经机制研究',
          source: '心理科学进展',
          publishTime: '2026-02-25',
          summary: '本文综述了近年来关于0-3岁儿童认知发展的神经科学研究...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cognitive%20development%20neural%20mechanism%20research&image_size=square'
        },
        {
          id: 6,
          title: '早期数学能力发展与0-3岁儿童认知发展的关系',
          source: '学前教育研究',
          publishTime: '2026-02-24',
          summary: '本文探讨了早期数学能力发展对儿童整体认知发展的促进作用...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=early%20math%20skills%20cognitive%20development&image_size=square'
        },
        {
          id: 7,
          title: '0-3岁儿童注意力发展的影响因素研究',
          source: '心理学报',
          publishTime: '2026-02-23',
          summary: '本文分析了家庭环境、养育方式等因素对0-3岁儿童注意力发展的影响...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=attention%20development%20influence%20factors&image_size=square'
        },
        {
          id: 8,
          title: '游戏在0-3岁儿童认知发展中的作用',
          source: '教育研究',
          publishTime: '2026-02-22',
          summary: '本文探讨了不同类型的游戏对0-3岁儿童认知发展的促进作用...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=play%20cognitive%20development%20research&image_size=square'
        }
      ],
      social: [
        {
          id: 9,
          title: '0-3岁儿童社交能力发展的影响因素研究',
          source: '中国心理卫生杂志',
          publishTime: '2026-02-25',
          summary: '本文分析了家庭、同伴等因素对0-3岁儿童社交能力发展的影响...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=social%20development%20influence%20factors%20research&image_size=square'
        },
        {
          id: 10,
          title: '亲子依恋与0-3岁儿童社交能力发展的关系',
          source: '心理发展与教育',
          publishTime: '2026-02-24',
          summary: '本文探讨了不同类型的亲子依恋对儿童社交能力发展的影响...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20child%20attachment%20social%20development&image_size=square'
        },
        {
          id: 11,
          title: '0-3岁儿童同伴交往的发展特点与指导策略',
          source: '学前教育研究',
          publishTime: '2026-02-23',
          summary: '本文介绍了0-3岁儿童同伴交往的发展特点，并提供了科学的指导策略...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=peer%20interaction%20development%20strategies&image_size=square'
        },
        {
          id: 12,
          title: '家庭养育方式对0-3岁儿童社交能力的影响',
          source: '中国家庭教育',
          publishTime: '2026-02-22',
          summary: '本文分析了不同养育方式对儿童社交能力发展的影响...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parenting%20styles%20social%20development&image_size=square'
        }
      ],
      emotion: [
        {
          id: 13,
          title: '0-3岁儿童情绪调节能力的发展与培养',
          source: '心理发展与教育',
          publishTime: '2026-02-25',
          summary: '本文探讨了0-3岁儿童情绪调节能力的发展特点和培养策略...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotional%20regulation%20development%20research&image_size=square'
        },
        {
          id: 14,
          title: '家庭环境对0-3岁儿童情绪发展的影响',
          source: '中国心理卫生杂志',
          publishTime: '2026-02-24',
          summary: '本文分析了家庭环境中影响儿童情绪发展的关键因素...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20environment%20emotional%20development&image_size=square'
        },
        {
          id: 15,
          title: '0-3岁儿童情绪表达的发展特点',
          source: '心理学报',
          publishTime: '2026-02-23',
          summary: '本文介绍了0-3岁儿童情绪表达的发展特点和规律...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotional%20expression%20development%20characteristics&image_size=square'
        },
        {
          id: 16,
          title: '养育者情绪状态对0-3岁儿童情绪发展的影响',
          source: '教育研究',
          publishTime: '2026-02-22',
          summary: '本文探讨了养育者情绪状态对儿童情绪发展的影响机制...',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=caregiver%20emotional%20state%20child%20development&image_size=square'
        }
      ]
    },
    showDetail: false,
    currentDetail: null
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search-ai/search-ai'
    });
  },

  goToRecommend() {
    wx.switchTab({
      url: '/pages/science-recommend/science-recommend'
    });
  },

  goToLiterature() {
    wx.showToast({
      title: '当前在文献页',
      icon: 'none'
    });
  },

  goToCommunity() {
    wx.navigateTo({
      url: '/pages/science-community/science-community'
    });
  },

  switchSubTab(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({
      currentSubTab: tab,
      literatureList: this.data.literatureData[tab],
      coverOrder: COVER_ORDERS[tab] || COVER_ORDERS.language
    });
  },

  goToLiteratureDetail(e) {
    const { id } = e.currentTarget.dataset;
    const literature = this.data.literatureList.find(item => item.id === id);
    
    if (literature) {
      this.setData({
        showDetail: true,
        currentDetail: literature
      });
    } else {
      wx.showToast({
        title: '文献信息不存在',
        icon: 'none'
      });
    }
  },

  closeDetail() {
    this.setData({
      showDetail: false,
      currentDetail: null
    });
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  goToFunction() {
    wx.switchTab({
      url: '/pages/function/function'
    });
  },

  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  async onLoad(options) {
    try {
      const { totalHeight } = getNavBarHeight();
      this.setData({
        navBarTotalHeight: totalHeight
      });
    } catch (error) {
      this.setData({ navBarTotalHeight: 100 });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 直接使用预设数据，无需重新加载
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '已更新到最新文献',
        icon: 'none'
      });
    }, 1000);
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onReachBottom() {},
  onShareAppMessage() {
    return {
      title: '咿呀智库·文献',
      path: '/pages/science-literature/science-literature'
    };
  }
});