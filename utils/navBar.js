// utils/navBar.js
function getWindowMetrics() {
  if (typeof wx.getWindowInfo === 'function') {
    const win = wx.getWindowInfo();
    return { windowWidth: win.windowWidth, statusBarHeight: win.statusBarHeight };
  }
  const legacy = wx.getSystemInfoSync();
  return { windowWidth: legacy.windowWidth, statusBarHeight: legacy.statusBarHeight };
}

/**
 * 获取导航栏+状态栏总高度（适配不同设备）
 */
export const getNavBarHeight = () => {
  const { windowWidth, statusBarHeight } = getWindowMetrics();
  const navBarHeight = 88;
  const totalHeight = (statusBarHeight * 750) / windowWidth + navBarHeight;

  return {
    statusBarHeight: (statusBarHeight * 750) / windowWidth,
    navBarHeight,
    totalHeight
  };
};

/**
 * 仅获取状态栏高度（rpx）
 */
export const getStatusBarHeight = () => {
  const { windowWidth, statusBarHeight } = getWindowMetrics();
  return (statusBarHeight * 750) / windowWidth;
};