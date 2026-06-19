const crypto = require('crypto')

const defaultAllowedPrefixes = 'docs/src/docs/,docs/src/index.md'

function splitHeaderValue(value) {
  return String(value || '').split(',')[0].trim()
}

function getRepoConfig() {
  return {
    owner: process.env.GITHUB_OWNER || 'chizhang977',
    repo: process.env.GITHUB_REPO || 'justin',
    branch: process.env.GITHUB_BRANCH || 'master',
    allowedUsers: (process.env.GITHUB_ALLOWED_USERS || process.env.GITHUB_OWNER || 'chizhang977')
      .split(',')
      .map((user) => user.trim().toLowerCase())
      .filter(Boolean),
    allowedPrefixes: (process.env.GITHUB_ALLOWED_PREFIXES || defaultAllowedPrefixes)
      .split(',')
      .map((prefix) => prefix.trim())
      .filter(Boolean)
  }
}

function getBaseUrl(req) {
  const host = splitHeaderValue(req.headers['x-forwarded-host'] || req.headers.host)
  const forwardedProto = splitHeaderValue(req.headers['x-forwarded-proto'])
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(String(host))
  const proto = forwardedProto || (isLocal ? 'http' : 'https')

  return `${proto}://${host}`
}

function isSecureRequest(req) {
  const proto = splitHeaderValue(req.headers['x-forwarded-proto'])
  const host = splitHeaderValue(req.headers.host)
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(String(host))

  return proto === 'https' || !isLocal
}

function parseCookies(cookieHeader = '') {
  return String(cookieHeader)
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const index = item.indexOf('=')

      if (index === -1) {
        return cookies
      }

      cookies[item.slice(0, index)] = decodeURIComponent(item.slice(index + 1))
      return cookies
    }, {})
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax']

  if (options.httpOnly !== false) {
    parts.push('HttpOnly')
  }

  if (options.secure) {
    parts.push('Secure')
  }

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${options.maxAge}`)
  }

  return parts.join('; ')
}

function appendCookies(res, cookies) {
  const existing = res.getHeader('Set-Cookie')
  const values = Array.isArray(existing) ? existing : existing ? [existing] : []

  res.setHeader('Set-Cookie', [...values, ...cookies])
}

function clearCookie(name, req) {
  return serializeCookie(name, '', {
    maxAge: 0,
    secure: isSecureRequest(req)
  })
}

function safeReturnTo(value) {
  const fallback = '/write'
  const returnTo = String(value || fallback)

  if (!returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) {
    return fallback
  }

  return returnTo
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function isSameOriginRequest(req) {
  const base = new URL(getBaseUrl(req))
  const origin = req.headers.origin

  if (origin) {
    try {
      return new URL(origin).host === base.host
    } catch {
      return false
    }
  }

  const referer = req.headers.referer

  if (referer) {
    try {
      return new URL(referer).host === base.host
    } catch {
      return false
    }
  }

  return true
}

function requireSameOrigin(req, res) {
  if (isSameOriginRequest(req)) {
    return true
  }

  sendJson(res, 403, { message: '请求来源不可信，已拒绝提交' })
  return false
}

function getToken(req) {
  return parseCookies(req.headers.cookie).justin_docs_token
}

function requireToken(req, res) {
  const token = getToken(req)

  if (!token) {
    sendJson(res, 401, { authenticated: false, message: '需要先登录 GitHub' })
    return ''
  }

  return token
}

function normalizeDocPath(input) {
  const value = decodeURIComponent(String(input || ''))
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .trim()

  if (!value || value.includes('\0') || value.split('/').some((part) => part === '..')) {
    throw new Error('文档路径不合法')
  }

  if (!value.endsWith('.md')) {
    throw new Error('只能编辑 Markdown 文档')
  }

  const { allowedPrefixes } = getRepoConfig()
  const allowed = allowedPrefixes.some((prefix) => {
    return prefix.endsWith('/') ? value.startsWith(prefix) : value === prefix
  })

  if (!allowed) {
    throw new Error('该路径不在允许编辑的文档目录内')
  }

  return value
}

function encodeGitHubPath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function createState() {
  return crypto.randomBytes(16).toString('hex')
}

function readJsonBody(req, limit = 1024 * 1024 * 4) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk

      if (Buffer.byteLength(body) > limit) {
        reject(new Error('提交内容过大'))
        req.destroy()
      }
    })

    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('请求体不是合法 JSON'))
      }
    })

    req.on('error', reject)
  })
}

async function githubRequest(path, token, options = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  })
}

async function getAuthenticatedUser(token) {
  const response = await githubRequest('/user', token)
  const payload = await response.json()

  if (!response.ok) {
    const error = new Error(payload.message || 'GitHub 登录失效')
    error.statusCode = response.status
    throw error
  }

  return {
    login: payload.login,
    avatarUrl: payload.avatar_url,
    htmlUrl: payload.html_url
  }
}

async function requireAllowedUser(req, res, token) {
  try {
    const user = await getAuthenticatedUser(token)
    const { allowedUsers } = getRepoConfig()

    if (allowedUsers.length > 0 && !allowedUsers.includes(String(user.login || '').toLowerCase())) {
      sendJson(res, 403, {
        authenticated: true,
        allowed: false,
        login: user.login,
        message: `当前 GitHub 用户 ${user.login} 不在允许提交名单中`
      })
      return null
    }

    return user
  } catch (error) {
    sendJson(res, error.statusCode || 401, {
      authenticated: false,
      allowed: false,
      message: error.message || 'GitHub 登录失效'
    })
    return null
  }
}

module.exports = {
  appendCookies,
  clearCookie,
  createState,
  encodeGitHubPath,
  getAuthenticatedUser,
  getBaseUrl,
  getRepoConfig,
  githubRequest,
  isSecureRequest,
  normalizeDocPath,
  parseCookies,
  readJsonBody,
  requireAllowedUser,
  requireSameOrigin,
  requireToken,
  safeReturnTo,
  sendJson,
  serializeCookie
}
