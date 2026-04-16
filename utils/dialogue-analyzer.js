function normalizeText(text = '') {
  return text.replace(/\r/g, '').trim();
}

function parseDialogueText(text = '') {
  const lines = normalizeText(text)
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  const parsed = [];
  let lastRole = 'parent';

  lines.forEach((line) => {
    let role = '';
    let content = line;

    if (/^(家长|妈妈|爸爸|监护人|老师)[:：]/.test(line)) {
      role = 'parent';
      content = line.replace(/^(家长|妈妈|爸爸|监护人|老师)[:：]/, '').trim();
    } else if (/^(孩子|宝宝)[:：]/.test(line)) {
      role = 'child';
      content = line.replace(/^(孩子|宝宝)[:：]/, '').trim();
    } else {
      role = lastRole === 'parent' ? 'child' : 'parent';
    }

    lastRole = role;
    parsed.push({
      role,
      text: content
    });
  });

  return parsed;
}

function countParentQuestionTypes(parentTexts = []) {
  const result = [
    { type: '开放式提问', count: 0 },
    { type: '是非提问', count: 0 },
    { type: '选择式提问', count: 0 },
    { type: '指令/提示', count: 0 }
  ];

  parentTexts.forEach((text) => {
    const t = text || '';

    if (/(什么|为什么|怎么|哪里|谁|怎么样)/.test(t)) {
      result[0].count += 1;
    }
    if (/(吗|对吗|是不是)/.test(t)) {
      result[1].count += 1;
    }
    if (/还是/.test(t)) {
      result[2].count += 1;
    }
    if (/(来|请你|跟我|试试|告诉我|看一看|摸一摸|指出)/.test(t)) {
      result[3].count += 1;
    }
  });

  return result;
}

function getOverlapRatio(a = '', b = '') {
  if (!a || !b) return 0;
  const shorter = a.length <= b.length ? a : b;
  let overlap = 0;
  for (let i = 0; i < shorter.length; i += 1) {
    if (b.includes(shorter[i])) overlap += 1;
  }
  return overlap / shorter.length;
}

function classifyChildResponses(items = []) {
  const result = {
    activeReply: 0,
    imitationReply: 0,
    shortReply: 0,
    noReply: 0
  };

  for (let i = 0; i < items.length; i += 1) {
    const current = items[i];

    if (current.role !== 'child') continue;

    const text = current.text || '';
    const prev = items[i - 1] || { text: '' };

    if (!text) {
      result.noReply += 1;
      continue;
    }

    if (text.length <= 2) {
      result.shortReply += 1;
      continue;
    }

    if (getOverlapRatio(text, prev.text) > 0.6) {
      result.imitationReply += 1;
      continue;
    }

    result.activeReply += 1;
  }

  return result;
}

function buildSummary(parentQuestionTypes, childResponse, languageStimulus) {
  const openCount = parentQuestionTypes.find(item => item.type === '开放式提问')?.count || 0;
  const shortReply = childResponse.shortReply || 0;
  const activeReply = childResponse.activeReply || 0;

  let coreConclusion = '家长回应较积极，亲子互动基本顺畅。';
  const keywords = [];

  if (openCount <= 2) {
    coreConclusion = '家长回应较及时，但开放式提问偏少，孩子主动表达空间不足。';
    keywords.push('开放式提问少');
  } else {
    keywords.push('提问形式较丰富');
  }

  if (shortReply >= 3) {
    keywords.push('孩子短句回应较多');
  }

  if (activeReply >= 3) {
    keywords.push('孩子有主动表达');
  }

  if (languageStimulus.totalCount >= 6) {
    keywords.push('语言刺激较稳定');
  }

  if (keywords.length < 3) {
    keywords.push('互动节奏自然');
  }

  return {
    coreConclusion,
    keywords: Array.from(new Set(keywords)).slice(0, 5)
  };
}

function buildSuggestions(parentQuestionTypes, childResponse) {
  const openCount = parentQuestionTypes.find(item => item.type === '开放式提问')?.count || 0;
  const shortReply = childResponse.shortReply || 0;

  const suggestions = [];

  if (openCount <= 2) {
    suggestions.push('多使用“你觉得为什么”“接下来会发生什么”这类开放式提问。');
  }

  if (shortReply >= 3) {
    suggestions.push('孩子回答较短时，家长可以进行扩展回应，例如把“球”扩展成“红色的球滚过来了”。');
  }

  suggestions.push('减少连续指令，提问后给孩子 3~5 秒等待时间。');
  suggestions.push('多加入描述性语言，例如颜色、形状、动作和感受。');

  return suggestions.slice(0, 4);
}

function buildOptimizedExamples() {
  return [
    {
      before: '快说，这是什么？',
      after: '你看看，这是什么呀？它是什么颜色的呢？'
    },
    {
      before: '不要乱摸，坐好。',
      after: '我们先坐下来，再一起摸一摸这个苹果，好吗？'
    }
  ];
}

function analyzeDialogueText(text = '', fileInfo = {}) {
  const items = parseDialogueText(text);
  const parentTexts = items.filter(item => item.role === 'parent').map(item => item.text);
  const childTexts = items.filter(item => item.role === 'child').map(item => item.text);

  const turnCount = items.length;
  const parentQuestionTypes = countParentQuestionTypes(parentTexts);
  const childResponse = classifyChildResponses(items);

  const durationSec = Number(fileInfo.durationSec || 180);
  const totalStimulus = parentTexts.filter(text => text.length >= 4).length;
  const frequency = durationSec > 0 ? (totalStimulus / (durationSec / 60)).toFixed(1) : '0.0';

  const languageStimulus = {
    totalCount: totalStimulus,
    frequencyText: `平均每分钟约 ${frequency} 次`
  };

  const summary = buildSummary(parentQuestionTypes, childResponse, languageStimulus);
  const suggestions = buildSuggestions(parentQuestionTypes, childResponse);
  const optimizedExamples = buildOptimizedExamples();

  return {
    analysisId: `dlg_${Date.now()}`,
    createdAt: new Date().toLocaleString(),
    sourceType: fileInfo.name ? 'audio' : 'text',
    fileInfo: {
      name: fileInfo.name || '手动输入文本',
      sizeMB: fileInfo.sizeMB || 0,
      durationSec: durationSec,
      format: fileInfo.format || 'txt'
    },
    summary,
    metrics: {
      turnCount,
      parentQuestionTypes,
      childResponse,
      languageStimulus
    },
    suggestions,
    optimizedExamples,
    transcriptPreview: items.slice(0, 10),
    rawText: text,
    meta: {
      parentSentenceCount: parentTexts.length,
      childSentenceCount: childTexts.length
    },
    ui: {
      parentMetricSuffix: '次',
      hideChildBlock: false,
      hideLanguageBlock: false,
      analysisSource: 'local'
    }
  };
}

module.exports = {
  analyzeDialogueText,
  parseDialogueText
};
