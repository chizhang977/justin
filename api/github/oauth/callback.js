const {
  appendCookies,
  clearCookie,
  getBaseUrl,
  isSecureRequest,
  parseCookies,
  safeReturnTo,
  sendJson,
  serializeCookie
} = require('../_shared')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method Not Allowed' })
    return
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    sendJson(res, 500, { message: '缺少 GitHub OAuth 环境变量' })
    return
  }

  const url = new URL(req.url, getBaseUrl(req))
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookies = parseCookies(req.headers.cookie)
  const expectedState = cookies.justin_docs_oauth_state
  const returnTo = safeReturnTo(cookies.justin_docs_return_to)

  if (!code || !state || !expectedState || state !== expectedState) {
    sendJson(res, 400, { message: 'GitHub 登录状态校验失败，请重新登录' })
    return
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${getBaseUrl(req)}/api/github/oauth/callback`
    })
  })

  const tokenPayload = await tokenResponse.json()

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    sendJson(res, 502, {
      message: 'GitHub token 获取失败',
      error: tokenPayload.error_description || tokenPayload.error || 'unknown'
    })
    return
  }

  const secure = isSecureRequest(req)

  appendCookies(res, [
    serializeCookie('justin_docs_token', tokenPayload.access_token, {
      maxAge: Number(process.env.GITHUB_SESSION_MAX_AGE || 60 * 60 * 8),
      secure
    }),
    clearCookie('justin_docs_oauth_state', req),
    clearCookie('justin_docs_return_to', req)
  ])

  res.writeHead(302, { Location: returnTo })
  res.end()
}
