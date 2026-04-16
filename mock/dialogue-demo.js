const DEMO_TRANSCRIPT = `家长：宝宝，你看桌子上放着什么呀？
孩子：苹果。
家长：对，是一个红红的苹果。你觉得它闻起来怎么样？
孩子：香。
家长：香香的，对吗？那你想不想摸一摸？
孩子：想。
家长：摸起来是什么感觉呀？
孩子：圆圆的。
家长：真棒，圆圆的、滑滑的。那苹果可以做成什么呢？
孩子：吃。
家长：对，可以直接吃，也可以榨成果汁。你觉得我们先洗苹果还是先切苹果？
孩子：先洗。
家长：太好了，你已经会自己想步骤了。那你来告诉妈妈，苹果是什么颜色的？
孩子：红色。
家长：说得真好，是红色的苹果。`;

function getDemoTranscript() {
  return DEMO_TRANSCRIPT;
}

function getDefaultFileInfo(fileName = 'demo-dialogue.m4a', sizeMB = 3.2, durationSec = 286) {
  return {
    name: fileName,
    sizeMB,
    durationSec,
    format: fileName.split('.').pop().toLowerCase()
  };
}

module.exports = {
  DEMO_TRANSCRIPT,
  getDemoTranscript,
  getDefaultFileInfo
};
