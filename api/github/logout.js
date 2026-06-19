const { appendCookies, clearCookie, requireSameOrigin, sendJson } = require('./_shared')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method Not Allowed' })
    return
  }

  if (req.method === 'POST' && !requireSameOrigin(req, res)) {
    return
  }

  appendCookies(res, [clearCookie('justin_docs_token', req)])
  sendJson(res, 200, { authenticated: false })
}
