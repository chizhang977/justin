const { getAuthenticatedUser, getRepoConfig, requireToken, sendJson } = require('./_shared')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method Not Allowed' })
    return
  }

  const token = requireToken(req, res)

  if (!token) {
    return
  }

  try {
    const payload = await getAuthenticatedUser(token)
    const { owner, repo, branch, allowedUsers, allowedPrefixes } = getRepoConfig()
    const allowed = allowedUsers.length === 0 || allowedUsers.includes(String(payload.login || '').toLowerCase())

    sendJson(res, 200, {
      authenticated: true,
      allowed,
      login: payload.login,
      avatarUrl: payload.avatarUrl,
      htmlUrl: payload.htmlUrl,
      repo: { owner, repo, branch, allowedPrefixes }
    })
  } catch (error) {
    sendJson(res, error.statusCode || 401, { authenticated: false, allowed: false, message: error.message || 'GitHub 登录失效' })
  }
}
