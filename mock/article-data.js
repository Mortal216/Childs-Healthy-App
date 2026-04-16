function articleContent(title, summary, publishTime) {
  return [
    '## 摘要',
    summary,
    '',
    '## 导读',
    '本文围绕「' + title + '」梳理 0-3 岁儿童发展相关观察要点，供家长在日常生活中对照参考。',
    '',
    '## 实践建议',
    '- 保持稳定的亲子互动节奏',
    '- 用具体语言描述当下情境',
    '- 记录变化，必要时寻求专业支持',
    '',
    '> 发布时间：' + publishTime
  ].join('\n');
}

const articleRecords = [
  {
    id: 1,
    title: "2026年最新研究：0-3岁宝宝语言发展的关键期",
    author: "中国儿童发展研究中心",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20reading%20book%20to%20baby%20language%20development%20warm%20home%20setting&image_size=square",
    summary: "最新研究表明，0-3岁是宝宝语言发展的黄金期，家庭语言环境对语言能力发展有着至关重要的影响...",
    content: articleContent("2026年最新研究：0-3岁宝宝语言发展的关键期", "最新研究表明，0-3岁是宝宝语言发展的黄金期，家庭语言环境对语言能力发展有着至关重要的影响...", "2026-02-25")
  },
  {
    id: 2,
    title: "大数据分析：如何打造最佳家庭语言环境",
    author: "育儿科学研究院",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20talking%20together%20language%20environment%20modern%20living%20room&image_size=square",
    summary: "基于10万家庭的数据研究，本文分析了家庭语言环境的关键因素，为家长提供了科学的语言启蒙建议...",
    content: articleContent("大数据分析：如何打造最佳家庭语言环境", "基于10万家庭的数据研究，本文分析了家庭语言环境的关键因素，为家长提供了科学的语言启蒙建议...", "2026-02-24")
  },
  {
    id: 3,
    title: "AI助力儿童语言发展：最新技术应用",
    author: "科技育儿前沿",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20technology%20helping%20child%20language%20development%20interactive%20learning&image_size=square",
    summary: "人工智能技术在儿童语言发展领域的最新应用，包括智能对话系统、个性化语言训练等创新方法...",
    content: articleContent("AI助力儿童语言发展：最新技术应用", "人工智能技术在儿童语言发展领域的最新应用，包括智能对话系统、个性化语言训练等创新方法...", "2026-02-23")
  },
  {
    id: 4,
    title: "亲子对话质量评估：新方法与标准",
    author: "早期教育研究",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20child%20conversation%20quality%20assessment%20warm%20interaction&image_size=square",
    summary: "本文介绍了亲子对话质量评估的新方法和标准，帮助家长识别和改进与孩子的沟通方式...",
    content: articleContent("亲子对话质量评估：新方法与标准", "本文介绍了亲子对话质量评估的新方法和标准，帮助家长识别和改进与孩子的沟通方式...", "2026-02-22")
  },
  {
    id: 5,
    title: "0-3岁儿童认知发展的神经机制研究",
    author: "心理科学进展",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cognitive%20development%20neural%20mechanism%20research&image_size=square",
    summary: "本文综述了近年来关于0-3岁儿童认知发展的神经科学研究...",
    content: articleContent("0-3岁儿童认知发展的神经机制研究", "本文综述了近年来关于0-3岁儿童认知发展的神经科学研究...", "2026-02-25")
  },
  {
    id: 6,
    title: "早期数学能力发展与0-3岁儿童认知发展的关系",
    author: "学前教育研究",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=early%20math%20skills%20cognitive%20development&image_size=square",
    summary: "本文探讨了早期数学能力发展对儿童整体认知发展的促进作用...",
    content: articleContent("早期数学能力发展与0-3岁儿童认知发展的关系", "本文探讨了早期数学能力发展对儿童整体认知发展的促进作用...", "2026-02-24")
  },
  {
    id: 7,
    title: "0-3岁儿童注意力发展的影响因素研究",
    author: "心理学报",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=attention%20development%20influence%20factors&image_size=square",
    summary: "本文分析了家庭环境、养育方式等因素对0-3岁儿童注意力发展的影响...",
    content: articleContent("0-3岁儿童注意力发展的影响因素研究", "本文分析了家庭环境、养育方式等因素对0-3岁儿童注意力发展的影响...", "2026-02-23")
  },
  {
    id: 8,
    title: "游戏在0-3岁儿童认知发展中的作用",
    author: "教育研究",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=play%20cognitive%20development%20research&image_size=square",
    summary: "本文探讨了不同类型的游戏对0-3岁儿童认知发展的促进作用...",
    content: articleContent("游戏在0-3岁儿童认知发展中的作用", "本文探讨了不同类型的游戏对0-3岁儿童认知发展的促进作用...", "2026-02-22")
  },
  {
    id: 9,
    title: "0-3岁儿童社交能力发展的影响因素研究",
    author: "中国心理卫生杂志",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=social%20development%20influence%20factors%20research&image_size=square",
    summary: "本文分析了家庭、同伴等因素对0-3岁儿童社交能力发展的影响...",
    content: articleContent("0-3岁儿童社交能力发展的影响因素研究", "本文分析了家庭、同伴等因素对0-3岁儿童社交能力发展的影响...", "2026-02-25")
  },
  {
    id: 10,
    title: "亲子依恋与0-3岁儿童社交能力发展的关系",
    author: "心理发展与教育",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parent%20child%20attachment%20social%20development&image_size=square",
    summary: "本文探讨了不同类型的亲子依恋对儿童社交能力发展的影响...",
    content: articleContent("亲子依恋与0-3岁儿童社交能力发展的关系", "本文探讨了不同类型的亲子依恋对儿童社交能力发展的影响...", "2026-02-24")
  },
  {
    id: 11,
    title: "0-3岁儿童同伴交往的发展特点与指导策略",
    author: "学前教育研究",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=peer%20interaction%20development%20strategies&image_size=square",
    summary: "本文介绍了0-3岁儿童同伴交往的发展特点，并提供了科学的指导策略...",
    content: articleContent("0-3岁儿童同伴交往的发展特点与指导策略", "本文介绍了0-3岁儿童同伴交往的发展特点，并提供了科学的指导策略...", "2026-02-23")
  },
  {
    id: 12,
    title: "家庭养育方式对0-3岁儿童社交能力的影响",
    author: "中国家庭教育",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parenting%20styles%20social%20development&image_size=square",
    summary: "本文分析了不同养育方式对儿童社交能力发展的影响...",
    content: articleContent("家庭养育方式对0-3岁儿童社交能力的影响", "本文分析了不同养育方式对儿童社交能力发展的影响...", "2026-02-22")
  },
  {
    id: 13,
    title: "0-3岁儿童情绪调节能力的发展与培养",
    author: "心理发展与教育",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotional%20regulation%20development%20research&image_size=square",
    summary: "本文探讨了0-3岁儿童情绪调节能力的发展特点和培养策略...",
    content: articleContent("0-3岁儿童情绪调节能力的发展与培养", "本文探讨了0-3岁儿童情绪调节能力的发展特点和培养策略...", "2026-02-25")
  },
  {
    id: 14,
    title: "家庭环境对0-3岁儿童情绪发展的影响",
    author: "中国心理卫生杂志",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20environment%20emotional%20development&image_size=square",
    summary: "本文分析了家庭环境中影响儿童情绪发展的关键因素...",
    content: articleContent("家庭环境对0-3岁儿童情绪发展的影响", "本文分析了家庭环境中影响儿童情绪发展的关键因素...", "2026-02-24")
  },
  {
    id: 15,
    title: "0-3岁儿童情绪表达的发展特点",
    author: "心理学报",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotional%20expression%20development%20characteristics&image_size=square",
    summary: "本文介绍了0-3岁儿童情绪表达的发展特点和规律...",
    content: articleContent("0-3岁儿童情绪表达的发展特点", "本文介绍了0-3岁儿童情绪表达的发展特点和规律...", "2026-02-23")
  },
  {
    id: 16,
    title: "养育者情绪状态对0-3岁儿童情绪发展的影响",
    author: "教育研究",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=caregiver%20emotional%20state%20child%20development&image_size=square",
    summary: "本文探讨了养育者情绪状态对儿童情绪发展的影响机制...",
    content: articleContent("养育者情绪状态对0-3岁儿童情绪发展的影响", "本文探讨了养育者情绪状态对儿童情绪发展的影响机制...", "2026-02-22")
  },
  {
    id: 17,
    title: "多语言环境对儿童语言发展的影响",
    author: "国际育儿研究",
    cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=multilingual%20family%20language%20development%20cultural%20diversity&image_size=square",
    summary: "最新研究探讨了多语言家庭环境对儿童语言发展的影响，为多语言家庭提供了科学的语言教育指导...",
    content: articleContent("多语言环境对儿童语言发展的影响", "最新研究探讨了多语言家庭环境对儿童语言发展的影响，为多语言家庭提供了科学的语言教育指导...", "2026-01-30")
  }
];

const articleById = new Map();
articleRecords.forEach((item) => {
  articleById.set(String(item.id), item);
});

function getArticleById(id) {
  if (id === undefined || id === null) return undefined;
  const key = String(id).trim();
  return articleById.get(key);
}

const articleList = articleRecords.map((item) => ({
  id: item.id,
  title: item.title,
  author: item.author,
  cover: item.cover,
  content: [item.title, item.summary, item.content].join('\n')
}));

function getArticleList() {
  return articleList.map((item) => ({
    id: item.id,
    title: item.title,
    author: item.author,
    cover: item.cover
  }));
}

module.exports = {
  articleRecords,
  articleList,
  getArticleList,
  getArticleById
};
