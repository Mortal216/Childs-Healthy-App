function makeSimpleStory({ id, title, author, length, cover, tags, paragraphs }) {
  const pages = paragraphs.map((text, idx) => ({
    pageNo: idx + 1,
    text,
    image: cover,
    audio: '',
    parentTip: '请家长指着画面问：你看到了什么？',
    childTask: '请孩子指认或说出画面里的主要角色。',
    demoSentence: '我们一起看看，接下来还会发生什么？',
    interaction: {
      type: 'predict',
      question: '你觉得下面会发生什么？'
    }
  }));
  return {
    id,
    title,
    author,
    length,
    cover,
    tags,
    ageRange: '0-30个月',
    pages
  };
}

const storyList = [
  makeSimpleStory({
    id: 1,
    title: '小星星的梦想',
    author: '陈伯吹',
    length: 5,
    cover:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20children%20book%20cover%20with%20stars%20and%20moon%2C%20cartoon%20style&image_size=square',
    tags: ['睡前故事', '想象力', '温暖'],
    paragraphs: [
      '夜晚来了，小星星挂在天上，一闪一闪地望着地面。',
      '它想：如果能到地面上看看小朋友的梦，该多好啊。',
      '风婆婆听见了，轻轻托起小星星，把它送进一个甜甜的梦里。',
      '梦里，小朋友对小星星说：你也来做我的好朋友吧。',
      '天快亮了，小星星回到天空，心里装满了温暖的梦。'
    ]
  }),
  makeSimpleStory({
    id: 2,
    title: '小兔子乖乖',
    author: '鲁兵',
    length: 4,
    cover:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rabbit%20family%20in%20forest%2C%20children%20book%20illustration&image_size=square',
    tags: ['经典', '安全教育', '家庭'],
    paragraphs: [
      '兔妈妈出门了，叮嘱小兔子们：陌生人来敲门，千万不要开。',
      '大灰狼捏着嗓子说：“小兔子乖乖，把门儿开开。”',
      '小兔子们从门缝一看，呀，不是妈妈的大耳朵，是尖尖的爪子。',
      '它们齐声说：“不开不开，我不开，妈妈不回来，谁来也不开。”'
    ]
  }),
  makeSimpleStory({
    id: 3,
    title: '拔萝卜',
    author: '民间故事',
    length: 3,
    cover:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20man%20pulling%20giant%20radish%20with%20animals%2C%20cartoon%20style&image_size=square',
    tags: ['合作', '幽默', '传统'],
    paragraphs: [
      '老爷爷种了一个大大的萝卜，萝卜长啊长，长得又大又结实。',
      '老爷爷拔呀拔，拔不动，叫来老奶奶一起拔，还是拔不动。',
      '小狗、小猫、小老鼠都来帮忙，“嗨哟嗨哟”——大萝卜终于拔出来啦！'
    ]
  }),
  makeSimpleStory({
    id: 4,
    title: '小蝌蚪找妈妈',
    author: '方惠珍',
    length: 6,
    cover:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tadpoles%20searching%20for%20mother%20frog%2C%20children%20book%20art&image_size=square',
    tags: ['科普', '亲情', '成长'],
    paragraphs: [
      '池塘里有一群小蝌蚪，甩着尾巴游来游去，它们要去找妈妈。',
      '它们问鲤鱼阿姨：“您是我们的妈妈吗？”鲤鱼摇摇头。',
      '它们看见乌龟有四条腿，高兴地喊：“妈妈！”乌龟笑着说不是。',
      '白肚皮、大眼睛的青蛙告诉它们：你们的妈妈会“呱呱”叫。',
      '小蝌蚪慢慢长出后腿、前腿，尾巴变短，终于变成了小青蛙。',
      '它们跳到荷叶上，和妈妈一起唱：“呱呱，我们找到妈妈啦！”'
    ]
  }),
  makeSimpleStory({
    id: 5,
    title: '雪孩子',
    author: '嵇鸿',
    length: 7,
    cover:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=snowman%20playing%20with%20little%20boy%2C%20winter%20scene%2C%20warm%20colors&image_size=square',
    tags: ['友谊', '牺牲', '温暖'],
    paragraphs: [
      '下雪了，兔妈妈给小白兔堆了一个可爱的雪孩子。',
      '雪孩子眨眨眼睛，好像在说：我会陪你一起玩。',
      '小白兔跳舞，雪孩子也跟着转圈，森林里都是笑声。',
      '忽然，木屋冒起了烟，小白兔还在屋里睡觉呢！',
      '雪孩子冲进屋里，把小白兔抱了出来，自己化成了一滩水。',
      '太阳出来了，水汽飞上天空，变成一朵很轻很轻的白云。',
      '小白兔抬头望着云，知道那是善良的朋友，还在守护着自己。'
    ]
  }),
  {
    id: 6,
    title: '小熊找帽子',
    author: '咿呀智库编辑部',
    length: 5,
    cover:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20little%20bear%20looking%20for%20a%20yellow%20hat%2C%20children%20book%20cover%2C%20warm%20cartoon%20style&image_size=square',
    tags: ['睡前故事', '认知启蒙', '亲子互动'],
    ageRange: '18-30个月',
    pages: [
      {
        pageNo: 1,
        text: '小熊醒来啦。它揉揉眼睛，想戴上自己最喜欢的小黄帽。可是，小黄帽不见了。',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20bear%20waking%20up%20in%20bedroom%20looking%20for%20yellow%20hat%2C%20children%20book%20illustration&image_size=landscape_4_3',
        audio: '',
        parentTip: '请家长先指着画面问：小熊在找什么呀？',
        childTask: '请孩子指出“小熊”和“帽子”',
        demoSentence: '小熊的帽子去哪儿了呀？我们一起找找看。',
        interaction: {
          type: 'predict',
          question: '你觉得小熊会先去哪里找帽子？'
        }
      },
      {
        pageNo: 2,
        text: '小熊先在床边找一找，又到枕头下面看一看。可是床边没有，枕头下面也没有。',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20bear%20searching%20near%20bed%20and%20under%20pillow%2C%20children%20book%20illustration&image_size=landscape_4_3',
        audio: '',
        parentTip: '请家长引导孩子观察位置词：床边、下面。',
        childTask: '请孩子指出“床”和“枕头”',
        demoSentence: '帽子不在床边，也不在枕头下面，我们再去别的地方看看。',
        interaction: {
          type: 'point',
          question: '请孩子指出图片里的枕头。'
        }
      },
      {
        pageNo: 3,
        text: '小熊走到客厅，看见玩具篮旁边有一根黄色的小带子。咦，这是不是帽子的带子呢？',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20bear%20in%20living%20room%20finding%20yellow%20strap%20near%20toy%20basket%2C%20children%20book%20illustration&image_size=landscape_4_3',
        audio: '',
        parentTip: '请家长用提问引导：你看到黄色的东西了吗？',
        childTask: '请孩子指出“玩具篮”',
        demoSentence: '这是黄色的小带子，你觉得它是不是帽子的带子呢？',
        interaction: {
          type: 'predict',
          question: '你觉得帽子会不会就在附近？'
        }
      },
      {
        pageNo: 4,
        text: '小熊轻轻扒开玩具篮，呀！小黄帽就在里面。原来昨天玩完游戏，它把帽子忘在这里啦。',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20bear%20finding%20yellow%20hat%20inside%20toy%20basket%2C%20happy%20children%20book%20illustration&image_size=landscape_4_3',
        audio: '',
        parentTip: '请家长用惊喜语气朗读，并鼓励孩子说出“帽子”。',
        childTask: '请孩子跟着说“帽子找到了”',
        demoSentence: '找到了！小黄帽就在玩具篮里面。',
        interaction: {
          type: 'say',
          question: '请家长引导孩子说出“帽子找到了”。'
        }
      },
      {
        pageNo: 5,
        text: '小熊戴上小黄帽，开开心心地出门啦。它一边走一边想：下次一定要把东西放回原来的地方。',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20bear%20wearing%20yellow%20hat%20going%20outside%20happily%2C%20children%20book%20illustration&image_size=landscape_4_3',
        audio: '',
        parentTip: '请家长和孩子一起回顾：小熊最后在哪里找到帽子的？',
        childTask: '请孩子指出“小黄帽”',
        demoSentence: '小熊戴好帽子啦，我们也要记得把东西放回原位。',
        interaction: {
          type: 'review',
          question: '你还记得小熊是在哪里找到帽子的吗？'
        }
      }
    ]
  }
];

function getStoryList() {
  return storyList.map((item) => ({
    id: item.id,
    title: item.title,
    author: item.author,
    length: item.length,
    cover: item.cover,
    tags: item.tags,
    ageRange: item.ageRange
  }));
}

function getStoryById(id) {
  const key = String(id == null ? '' : id).trim();
  return storyList.find((item) => String(item.id) === key);
}

module.exports = {
  storyList,
  getStoryList,
  getStoryById
};
