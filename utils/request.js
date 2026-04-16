const {
  getApiBaseUrl,
  getApiUrl,
  isLocalApiBaseUrl,
  isPlaceholderApiBaseUrl
} = require('./runtime-config.js')

function getNetworkErrorMessage(err) {
  const errMsg = (err && err.errMsg) || ''

  if (isPlaceholderApiBaseUrl()) {
    return '请先在 utils/runtime-config.js 中配置 CloudBase 云端后端域名'
  }

  if (isLocalApiBaseUrl()) {
    return '无法连接后端，请先启动本地 8000 端口服务；真机调试不要使用 localhost'
  }

  if (errMsg) {
    return `网络请求失败：${errMsg}`
  }

  return '网络请求失败'
}

function request(options) {
  const token = wx.getStorageSync('token')
  const requestUrl = getApiUrl(options.url)

  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }

        if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')
          wx.removeStorageSync('babyId')
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(res.data)
          return
        }

        wx.showToast({
          title: (res.data && res.data.detail) || '请求失败',
          icon: 'none'
        })
        reject(res.data)
      },
      fail: (err) => {
        wx.showToast({
          title: getNetworkErrorMessage(err),
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  getBaseUrl: getApiBaseUrl,
  getNetworkErrorMessage,
  request
}
