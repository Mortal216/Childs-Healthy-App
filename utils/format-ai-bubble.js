/**
 * 将 AI 纯文本转为 rich-text 可用的 HTML（换行、**粗体**），改善气泡阅读体验。
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildAiContentHtml(plain) {
  if (typeof plain !== 'string' || !plain.trim()) {
    return ''
  }
  let t = plain.replace(/\r\n/g, '\n')
  // 文内「；- xxx」伪列表（后端也会拆，双保险）
  t = t.replace(/([。；])\s*-\s+/g, '$1\n- ')
  // 流式拼接：标点与 ** 标题粘连
  t = t.replace(/\.\s*(\*\*)/g, '\n$1')
  t = t.replace(/([。；!?？!])\s*(\*\*)/g, '$1\n$2')
  // 非行首出现的 **标题**：前补空行，形成段落感
  t = t.replace(/([^\n])\*\*([^*\n]+)\*\*[：:]/g, '$1\n\n**$2**：')
  // 行首 markdown / 文内短横列表
  t = t.replace(/^\s*-\s+/gm, '• ')
  t = t.replace(/\n-\s+/g, '\n• ')

  const escaped = escapeHtml(t)
  const withBold = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  let withBr = withBold.replace(/\n/g, '<br/>')
  withBr = withBr.replace(/(<br\/>){3,}/gi, '<br/><br/>')
  return `<div style="font-size:28rpx;line-height:1.75;color:#2a3138;">${withBr}</div>`
}

module.exports = {
  buildAiContentHtml
}
