const { getRuntimeConfig } = require('./utils/runtime-config.js')

App({
  globalData: {
    runtimeConfig: getRuntimeConfig()
  },

  onLaunch() {
    const runtimeConfig = getRuntimeConfig()
    this.globalData.runtimeConfig = runtimeConfig

    wx.cloud.init({
      env: runtimeConfig.cloudbaseEnv,
      traceUser: runtimeConfig.traceUser
    })
  }
})
