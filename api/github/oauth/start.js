const {
  appendCookies,
  createState,
  getBaseUrl,
  isSecureRequest,
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

  if (!clientId) {
    sendJson(res, 500, { message: '缺少 GITHUB_CLIENT_ID 环境变量' })
    return
  }

  const state = createState()
  const returnTo = safeReturnTo(new URL(req.url, getBaseUrl(req)).searchParams.get('returnTo'))
  const secure = isSecureRequest(req)

  appendCookies(res, [
    serializeCookie('justin_docs_oauth_state', state, { maxAge: 600, secure }),
    serializeCookie('justin_docs_return_to', returnTo, { maxAge: 600, secure })
  ])

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', `${getBaseUrl(req)}/api/github/oauth/callback`)
  authorizeUrl.searchParams.set('scope', process.env.GITHUB_OAUTH_SCOPE || 'public_repo')
  authorizeUrl.searchParams.set('state', state)

  res.writeHead(302, { Location: authorizeUrl.toString() })
  res.end()
}
