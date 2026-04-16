const INTERACTION_OPTIONS = ['总是', '经常', '有时', '极少', '从未'];

const AGREEMENT_OPTIONS = ['很不同意', '不同意', '一般', '同意', '很同意'];

const RESOURCE_OPTIONS = ['10本以下', '10-20本', '21-40本', '41-60本', '60本以上'];

const FREQUENCY_OPTIONS = ['几乎没有', '1-2次', '3-4次', '5-6次', '每天'];

const VISIT_OPTIONS = ['几乎没有', '1-2次', '3-5次', '6-10次', '10次以上'];

const DEVICE_OPTIONS = ['没有', '1-2个', '3-4个', '5-6个', '7个以上'];

const interactionQuestionnaire = {
  scaleId: 'PCDI_INTERACTION_QUALITY',
  title: '亲子互动问卷',
  subtitle: '20题',
  intro:
    '以下题目主要了解您与孩子日常互动的真实情况。每题请选择最符合家庭实际的一项。',
  helpText:
    '请根据过去一段时间里最常见的互动方式作答。本问卷没有标准答案，越贴近真实情况，反馈越有参考价值。',
  questions: [
    { id: 'PIQ_01', text: '我和孩子一起玩，并和他（她）玩游戏', options: INTERACTION_OPTIONS },
    { id: 'PIQ_02', text: '我拥抱和亲吻我的孩子', options: INTERACTION_OPTIONS },
    { id: 'PIQ_03', text: '当孩子哭的时候，我通常会对他（她）说话', options: INTERACTION_OPTIONS },
    { id: 'PIQ_04', text: '我通过言语和演示来帮助孩子了解新事物', options: INTERACTION_OPTIONS },
    { id: 'PIQ_05', text: '我陪着孩子看书，或者给孩子读儿童读物', options: INTERACTION_OPTIONS },
    { id: 'PIQ_06', text: '我的孩子在和我讲话时不能平静下来，或看起来并不是很感兴趣', options: INTERACTION_OPTIONS },
    { id: 'PIQ_07', text: '我为孩子编造游戏或歌曲', options: INTERACTION_OPTIONS },
    { id: 'PIQ_08', text: '当我的孩子看着或碰触一个玩具时，我会给他讲解这个玩具', options: INTERACTION_OPTIONS },
    { id: 'PIQ_09', text: '当我的孩子看着我时，我会和他讲话，或者对着他发出声音', options: INTERACTION_OPTIONS },
    { id: 'PIQ_10', text: '我的孩子看起来不喜欢我', options: INTERACTION_OPTIONS },
    { id: 'PIQ_11', text: '我非常享受给孩子喂食，或者和孩子一起吃东西', options: INTERACTION_OPTIONS },
    { id: 'PIQ_12', text: '我会用一种特别亲切、容易吸引孩子的方式和他说话', options: INTERACTION_OPTIONS },
    { id: 'PIQ_13', text: '和我的孩子相处并不愉快', options: INTERACTION_OPTIONS },
    { id: 'PIQ_14', text: '当我的孩子感到失落的时候，我能让他感觉好一些', options: INTERACTION_OPTIONS },
    { id: 'PIQ_15', text: '当我的孩子看着或触碰某个东西时，我第一反应是说“不”', options: INTERACTION_OPTIONS },
    { id: 'PIQ_16', text: '我喜欢我的孩子', options: INTERACTION_OPTIONS },
    { id: 'PIQ_17', text: '我的孩子并不需要我帮助他（她）学习新事物', options: INTERACTION_OPTIONS },
    { id: 'PIQ_18', text: '我在给孩子喂食，或者和他（她）一起吃东西时会和他说话', options: INTERACTION_OPTIONS },
    { id: 'PIQ_19', text: '我会鼓励孩子用语言表达自己的需求', options: INTERACTION_OPTIONS },
    { id: 'PIQ_20', text: '不需要孩子开口，我就会立刻对孩子的需求作出回应', options: INTERACTION_OPTIONS }
  ]
};

const languageEnvironmentQuestionnaire = {
  scaleId: 'PCDI_LANGUAGE_ENVIRONMENT',
  title: '家庭语言环境问卷',
  subtitle: '23题',
  intro:
    '本问卷主要了解家庭中的语言资源、亲子语言文化活动，以及家长的语言教育观念。',
  helpText:
    '第二部分请根据家庭已有资源和近期活动情况作答，第三部分请根据自己的真实想法选择最符合的一项。',
  sections: [
    {
      id: 'resource_activity',
      title: '第二部分 物质资源与语言文化活动',
      description: '请根据家庭真实情况选择。',
      questions: [
        {
          id: 'HLE_23',
          text: '在家有多少本适合孩子现在年龄阶段的儿童读物或图画书（图多字少的书）？',
          options: RESOURCE_OPTIONS
        },
        {
          id: 'HLE_24',
          text: '家中供大人阅读的图书数量（包括书籍或报刊）大约有多少本？',
          options: RESOURCE_OPTIONS
        },
        {
          id: 'HLE_25',
          text: '孩子在家阅读图画书的频次',
          options: FREQUENCY_OPTIONS
        },
        {
          id: 'HLE_26',
          text: '您平时阅读图书的频次',
          options: FREQUENCY_OPTIONS
        },
        {
          id: 'HLE_27',
          text: '一周里，与孩子一起读书、讲故事约多少次？',
          options: FREQUENCY_OPTIONS
        },
        {
          id: 'HLE_28',
          text: '一周里，与孩子谈话、进行启发性思考及倾听幼儿表达约多少次？',
          options: FREQUENCY_OPTIONS
        },
        {
          id: 'HLE_29',
          text: '一周里，家长陪孩子一起收看电视中的儿童节目或动画片约多少次？',
          options: FREQUENCY_OPTIONS
        },
        {
          id: 'HLE_30',
          text: '最近三个月，带孩子到图书馆、书店、电影院或儿童文化中心等地方大约多少次？',
          options: VISIT_OPTIONS
        },
        {
          id: 'HLE_31',
          text: '一年里，带孩子到书店买书大约多少次？',
          options: ['几乎没有', '1-2次', '3-4次', '5-6次', '7次以上']
        },
        {
          id: 'HLE_32',
          text: '家里有语音发声类玩具、用品约多少个？（如点读机、故事机、录音娃娃、早教机等）',
          options: DEVICE_OPTIONS
        },
        {
          id: 'HLE_33',
          text: '家里适用于幼儿的语言教育类光盘或游戏软件大约有多少种？',
          options: DEVICE_OPTIONS
        },
        {
          id: 'HLE_34',
          text: '有没有给孩子报兴趣班？',
          options: [
            '没有',
            '有，报了语言类学习类兴趣班',
            '有，报了艺术体育类兴趣班'
          ]
        }
      ]
    },
    {
      id: 'beliefs',
      title: '第三部分 家长语言教育观念',
      description: '请根据您的真实想法选择。',
      questions: [
        {
          id: 'HLE_35',
          text: '孩子现在学到的词语会影响他未来的语言学习。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_36',
          text: '我认为家长应多提供认字、拼字、词汇等题目，让幼儿反复练习才能掌握知识。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_37',
          text: '我认为利用生活情景（如广告、食品包装袋）教孩子识字效果很好。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_38',
          text: '我认为现在是孩子语言发展的重要年龄，有必要对孩子进行词汇教育。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_39',
          text: '我认为孩子接受语言教育主要靠学校老师的指导，家长参与作用不大。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_40',
          text: '我认为孩子会通过观察和模仿大人、电视、手机等学到很多新词语。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_41',
          text: '我认为记忆和背诵是影响幼儿语言学习的主要因素。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_42',
          text: '在家里我会有意识地营造有利于孩子语言学习的环境。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_43',
          text: '我认为孩子没有自主学习语言的能力，必须由成人传授和教导才能掌握。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_44',
          text: '我认为孩子学习新的词语离不开日常经验的积累。',
          options: AGREEMENT_OPTIONS
        },
        {
          id: 'HLE_45',
          text: '我认为孩子需要学习新的词语，主要是为了上小学做准备。',
          options: AGREEMENT_OPTIONS
        }
      ]
    }
  ]
};

module.exports = {
  interactionQuestionnaire,
  languageEnvironmentQuestionnaire
};
