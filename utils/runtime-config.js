const COMMON_CONFIG = {
  cloudbaseEnv: 'cloud1-1gu5xrfwd5ca8920',
  traceUser: true
}

const ENVIRONMENT_CONFIG = {
  develop: {
    apiBaseUrl: 'http://localhost:8000/api/v1',
    mcpServerUrl: ''
  },
  trial: {
    apiBaseUrl: 'https://replace-with-your-backend-cloudrun-domain/api/v1',
    mcpServerUrl: 'https://replace-with-your-mcp-cloudrun-domain'
  },
  release: {
    apiBaseUrl: 'https://replace-with-your-backend-cloudrun-domain/api/v1',
    mcpServerUrl: 'https://replace-with-your-mcp-cloudrun-domain'
  }
}

function normalizeUrl(url) {
  return String(url || '').replace(/\/+$/, '')
}

function getEnvVersion() {
  try {
    if (wx.getAccountInfoSync) {
      const accountInfo = wx.getAccountInfoSync()
      const envVersion = accountInfo &&
        accountInfo.miniProgram &&
        accountInfo.miniProgram.envVersion

      if (envVersion) {
        return envVersion
      }
    }
  } catch (error) {
    console.warn('读取小程序环境版本失败，回退到 develop:', error)
  }

  return 'develop'
}

function getRuntimeConfig() {
  const envVersion = getEnvVersion()
  const envConfig = ENVIRONMENT_CONFIG[envVersion] || ENVIRONMENT_CONFIG.develop

  return {
    envVersion,
    ...COMMON_CONFIG,
    ...envConfig,
    apiBaseUrl: normalizeUrl(envConfig.apiBaseUrl),
    mcpServerUrl: normalizeUrl(envConfig.mcpServerUrl)
  }
}

function getApiBaseUrl() {
  return getRuntimeConfig().apiBaseUrl
}

function getApiUrl(path) {
  const baseUrl = getApiBaseUrl()
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path || ''}`
  return `${baseUrl}${normalizedPath}`
}

function isLocalApiBaseUrl() {
  return getApiBaseUrl().includes('localhost')
}

function isPlaceholderApiBaseUrl() {
  return getApiBaseUrl().includes('replace-with-your-backend-cloudrun-domain')
}

module.exports = {
  COMMON_CONFIG,
  ENVIRONMENT_CONFIG,
  getEnvVersion,
  getRuntimeConfig,
  getApiBaseUrl,
  getApiUrl,
  isLocalApiBaseUrl,
  isPlaceholderApiBaseUrl
}
