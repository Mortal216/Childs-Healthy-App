const INTERACTION_DIMENSION_ORDER = ['引导性', '亲密性', '回应性'];
const ENVIRONMENT_DIMENSION_ORDER = ['物质资源', '语言文化活动', '家长语言教育观念'];

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getLevelMeta(percent) {
  if (percent >= 85) {
    return { label: '优势明显', color: '#F66B8D', tone: '#FFF1F5' };
  }
  if (percent >= 70) {
    return { label: '发展良好', color: '#FF8E53', tone: '#FFF4EC' };
  }
  if (percent >= 55) {
    return { label: '稳步提升', color: '#4E8EF7', tone: '#EEF4FF' };
  }
  return { label: '重点关注', color: '#8E62D9', tone: '#F3EDFF' };
}

function normalizeDimensionScores(rawScores, order) {
  const list = Array.isArray(rawScores) ? rawScores : [];
  const mapped = order.map((dimension) => {
    const current = list.find((item) => item.dimension === dimension) || {};
    const score = toNumber(current.score);
    const maxScore = toNumber(current.max_score || current.maxScore, 100);
    const percent = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : toNumber(current.percent);
    const levelMeta = getLevelMeta(percent);

    return {
      dimension,
      shortLabel: dimension.replace('家长', '').replace('语言', ''),
      score: Number(score.toFixed(2)),
      maxScore,
      percent,
      level: levelMeta.label,
      levelColor: levelMeta.color,
      levelTone: levelMeta.tone
    };
  });

  return mapped;
}

function parseDimensionScores(rawScores) {
  if (!rawScores) {
    return [];
  }

  if (typeof rawScores === 'string') {
    try {
      return JSON.parse(rawScores);
    } catch (error) {
      return [];
    }
  }

  return Array.isArray(rawScores) ? rawScores : [];
}

function buildInteractionAnalysis(ageMonths, dimensions) {
  const guiding = dimensions.find((item) => item.dimension === '引导性') || {};
  const intimacy = dimensions.find((item) => item.dimension === '亲密性') || {};
  const responsiveness = dimensions.find((item) => item.dimension === '回应性') || {};
  const sorted = [...dimensions].sort((a, b) => b.percent - a.percent);
  const strongest = sorted[0] || { dimension: '亲子互动', percent: 0 };
  const weakest = sorted[sorted.length - 1] || { dimension: '回应性', percent: 0 };
  const ageHint =
    ageMonths && ageMonths < 18
      ? '当前月龄更适合多使用夸张语调、重复命名和共同注意的互动方式，帮助孩子更稳定地接收语言输入。'
      : '当前月龄可以更多鼓励孩子用语言主动表达需求，并在日常场景中扩展他的回答内容。';

  const paragraphs = [
    `本次亲子互动问卷中，您在“${strongest.dimension}”上的表现相对更突出，而“${weakest.dimension}”仍有提升空间。整体来看，这份结果反映的是日常互动质量，而不是单次表现。`,
    intimacy.percent >= 75
      ? '亲密性得分较高，说明家庭中已经具备较好的情感支持氛围，这对孩子理解语言、愿意与成人互动通常是有帮助的。'
      : '亲密性得分偏低，建议在安抚、拥抱、眼神交流和共同活动中投入更多稳定而积极的情感回应。'
  ];

  if (guiding.percent < 60) {
    paragraphs.push('引导性维度提示，家长可以增加读书、编故事、讲解玩具用途等活动，把语言刺激自然放进游戏和生活。');
  } else if (responsiveness.percent < 60) {
    paragraphs.push('回应性维度提示，孩子发出动作、目光或声音信号时，更及时地接话、扩展和等待回应，往往比单向讲解更有效。');
  } else {
    paragraphs.push('三项核心维度整体比较均衡，后续重点是把现有互动方式持续化，让高质量互动稳定出现在喂食、玩耍和阅读等日常时段。');
  }

  paragraphs.push(ageHint);

  const suggestions = [];
  if (guiding.percent < 70) {
    suggestions.push('每天安排 10 到 15 分钟共同阅读或描述图片，把“看到了什么”“接下来会怎样”变成固定互动。');
  }
  if (responsiveness.percent < 70) {
    suggestions.push('孩子发出声音、手势或眼神时，先回应再扩展，例如把“车车”扩展成“对，是红色的小汽车”。');
  }
  if (intimacy.percent < 70) {
    suggestions.push('在孩子失落、受挫或寻求帮助时，先安抚和共情，再进入指导，能让语言输入更容易被接受。');
  }
  if (suggestions.length === 0) {
    suggestions.push('保持现有互动优势，同时把高质量亲子交流尽量分散到喂食、出门、收纳和睡前等日常场景。');
  }

  return { paragraphs, suggestions };
}

function buildEnvironmentAnalysis(totalScore, dimensions) {
  const resource = dimensions.find((item) => item.dimension === '物质资源') || {};
  const activity = dimensions.find((item) => item.dimension === '语言文化活动') || {};
  const beliefs = dimensions.find((item) => item.dimension === '家长语言教育观念') || {};
  const activityTotal = resource.score + activity.score;
  const benchmarkTotal = 64.82;
  const benchmarkActivity = 26.33;
  const benchmarkBeliefs = 38.49;
  const comparison =
    totalScore >= benchmarkTotal
      ? `本次总分高于文献样本均值 ${benchmarkTotal.toFixed(2)} 分。`
      : `本次总分低于文献样本均值 ${benchmarkTotal.toFixed(2)} 分，家庭语言支持还有明显提升空间。`;

  const paragraphs = [
    `${comparison} 从维度分布看，家庭语言环境的优势和短板主要体现在资源、活动频率以及教育观念三个方面。`,
    activityTotal >= benchmarkActivity
      ? `物质资源与语言文化活动合计 ${activityTotal} 分，高于研究中的均值 ${benchmarkActivity.toFixed(2)} 分，说明家庭已提供了较丰富的语言输入机会。`
      : `物质资源与语言文化活动合计 ${activityTotal} 分，低于研究中的均值 ${benchmarkActivity.toFixed(2)} 分，建议优先补足阅读材料、亲子阅读和外出语言文化活动。`,
    beliefs.score >= benchmarkBeliefs
      ? `家长语言教育观念得分 ${beliefs.score} 分，高于研究均值 ${benchmarkBeliefs.toFixed(2)} 分，说明您更认同在生活情境中促进孩子语言学习。`
      : `家长语言教育观念得分 ${beliefs.score} 分，低于研究均值 ${benchmarkBeliefs.toFixed(2)} 分，后续可减少“机械背诵”和“主要依赖老师”的倾向，把语言学习更多放回日常生活。`
  ];

  const suggestions = [];
  if (resource.percent < 65) {
    suggestions.push('优先补充适龄绘本、图画书和可共同使用的语言学习材料，不必追求多，关键是固定可重复使用。');
  }
  if (activity.percent < 65) {
    suggestions.push('把亲子阅读、围绕同一话题的对话和文化场所参访做成固定频次，比零散输入更容易形成稳定刺激。');
  }
  if (beliefs.percent < 65) {
    suggestions.push('少用机械背诵式练习，多在真实生活中解释词语、提问、等待孩子表达，再进行扩展性回应。');
  }
  if (suggestions.length === 0) {
    suggestions.push('继续保持资源投入和高质量互动，并尝试结合优质教育 APP、动画讨论或录音故事，进一步丰富语言输入形态。');
  }

  return {
    benchmarkText: `参考文献样本均值：物质资源及活动 26.33 分，教育观念 38.49 分，总分 64.82 分。`,
    paragraphs,
    suggestions
  };
}

function buildInteractionReportData(assessment) {
  const totalScore = toNumber(assessment.total_score);
  const maxScore = toNumber(assessment.max_score, 100);
  const percent = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;
  const levelMeta = getLevelMeta(percent);
  const dimensions = normalizeDimensionScores(parseDimensionScores(assessment.dimension_scores), INTERACTION_DIMENSION_ORDER);
  const analysis = buildInteractionAnalysis(toNumber(assessment.age_months), dimensions);

  return {
    totalScore,
    maxScore,
    percent,
    scoreLevel: levelMeta.label,
    scoreLevelColor: levelMeta.color,
    scoreLevelTone: levelMeta.tone,
    dimensionScores: dimensions,
    radarItems: dimensions.map((item) => ({ label: item.shortLabel, percent: item.percent })),
    analysisParagraphs: analysis.paragraphs,
    suggestions: analysis.suggestions
  };
}

function buildEnvironmentReportData(assessment) {
  const totalScore = toNumber(assessment.total_score);
  const maxScore = toNumber(assessment.max_score, 112);
  const percent = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;
  const levelMeta = getLevelMeta(percent);
  const dimensions = normalizeDimensionScores(parseDimensionScores(assessment.dimension_scores), ENVIRONMENT_DIMENSION_ORDER);
  const analysis = buildEnvironmentAnalysis(totalScore, dimensions);

  return {
    totalScore,
    maxScore,
    percent,
    scoreLevel: levelMeta.label,
    scoreLevelColor: levelMeta.color,
    scoreLevelTone: levelMeta.tone,
    dimensionScores: dimensions,
    radarItems: dimensions.map((item) => ({ label: item.shortLabel, percent: item.percent })),
    analysisParagraphs: analysis.paragraphs,
    suggestions: analysis.suggestions,
    benchmarkText: analysis.benchmarkText
  };
}

module.exports = {
  buildInteractionReportData,
  buildEnvironmentReportData,
  getLevelMeta
};
