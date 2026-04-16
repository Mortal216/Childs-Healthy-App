const { parseDialogueText, analyzeDialogueText } = require('./dialogue-analyzer.js');

function buildReportFromAi(ai, text, fileInfo = {}) {
  const items = parseDialogueText(text || '');
  const dims = (ai && ai.dimensions) || [];
  const durationSec = Number(fileInfo.durationSec || 180);

  return {
    analysisId: `ai_${Date.now()}`,
    createdAt: ai.time || new Date().toLocaleString(),
    sourceType: fileInfo.name ? 'audio' : 'text',
    fileInfo: {
      name: fileInfo.name || '手动输入文本',
      sizeMB: fileInfo.sizeMB || 0,
      durationSec,
      format: fileInfo.format || 'txt'
    },
    summary: {
      coreConclusion: ai.desc || '已完成 AI 分析',
      keywords: [ai.level, typeof ai.totalScore === 'number' ? `总分 ${ai.totalScore}` : '']
        .filter(Boolean)
    },
    metrics: {
      turnCount: items.length,
      parentQuestionTypes: dims.map((d) => ({ type: d.title, count: d.score })),
      childResponse: { activeReply: 0, imitationReply: 0, shortReply: 0, noReply: 0 },
      languageStimulus: {
        totalCount: 0,
        frequencyText: '由 AI 维度评分'
      }
    },
    suggestions: dims.length
      ? dims.map((d) => `${d.title}：${d.desc}`)
      : [ai.desc || '建议继续增加开放式提问与描述性语言。'],
    optimizedExamples: [],
    transcriptPreview: items.slice(0, 10),
    ui: {
      parentMetricSuffix: '分',
      hideChildBlock: true,
      hideLanguageBlock: true,
      analysisSource: 'ai'
    }
  };
}

module.exports = {
  buildReportFromAi,
  analyzeDialogueText,
  parseDialogueText
};
