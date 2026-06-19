const {
  encodeGitHubPath,
  getBaseUrl,
  getRepoConfig,
  githubRequest,
  normalizeDocPath,
  readJsonBody,
  requireAllowedUser,
  requireSameOrigin,
  requireToken,
  sendJson
} = require('./_shared')

async function readFileFromGitHub(token, docPath) {
  const { owner, repo, branch } = getRepoConfig()
  const apiPath = encodeGitHubPath(docPath)
  const response = await githubRequest(`/repos/${owner}/${repo}/contents/${apiPath}?ref=${encodeURIComponent(branch)}`, token)
  const payload = await response.json()

  if (response.status === 404) {
    return {
      exists: false,
      path: docPath,
      content: '',
      sha: '',
      htmlUrl: ''
    }
  }

  if (!response.ok) {
    const error = new Error(payload.message || '读取 GitHub 文件失败')
    error.statusCode = response.status
    throw error
  }

  if (Array.isArray(payload) || payload.type !== 'file') {
    const error = new Error('目标路径不是 Markdown 文件')
    error.statusCode = 400
    throw error
  }

  return {
    exists: true,
    path: docPath,
    content: Buffer.from(String(payload.content || '').replace(/\n/g, ''), 'base64').toString('utf8'),
    sha: payload.sha,
    htmlUrl: payload.html_url
  }
}

async function handleGet(req, res, token) {
  const url = new URL(req.url, getBaseUrl(req))
  const docPath = normalizeDocPath(url.searchParams.get('path'))
  const file = await readFileFromGitHub(token, docPath)

  sendJson(res, 200, file)
}

async function handlePut(req, res, token) {
  const body = await readJsonBody(req)
  const docPath = normalizeDocPath(body.path)
  const { owner, repo, branch } = getRepoConfig()
  const content = String(body.content || '')
  const message = String(body.message || '').trim() || `docs: update ${docPath.split('/').pop()}`
  let sha = String(body.sha || '')

  if (!content.trim()) {
    sendJson(res, 400, { message: '文档内容不能为空' })
    return
  }

  if (body.createOnly) {
    const existing = await readFileFromGitHub(token, docPath)

    if (existing.exists) {
      sendJson(res, 409, { message: '该文档已经存在，请切换为编辑模式' })
      return
    }
  } else if (!sha) {
    const existing = await readFileFromGitHub(token, docPath)
    sha = existing.sha
  }

  const payload = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
    ...(sha ? { sha } : {})
  }

  const apiPath = encodeGitHubPath(docPath)
  const response = await githubRequest(`/repos/${owner}/${repo}/contents/${apiPath}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
  const result = await response.json()

  if (!response.ok) {
    sendJson(res, response.status, {
      message: result.message || '提交 GitHub 失败',
      errors: result.errors || []
    })
    return
  }

  sendJson(res, 200, {
    path: docPath,
    contentUrl: result.content?.html_url || '',
    commitUrl: result.commit?.html_url || '',
    commitSha: result.commit?.sha || '',
    sha: result.content?.sha || ''
  })
}

module.exports = async function handler(req, res) {
  const token = requireToken(req, res)

  if (!token) {
    return
  }

  try {
    const user = await requireAllowedUser(req, res, token)

    if (!user) {
      return
    }

    if (req.method === 'GET') {
      await handleGet(req, res, token)
      return
    }

    if (req.method === 'PUT') {
      if (!requireSameOrigin(req, res)) {
        return
      }

      await handlePut(req, res, token)
      return
    }

    sendJson(res, 405, { message: 'Method Not Allowed' })
  } catch (error) {
    sendJson(res, error.statusCode || 500, { message: error.message || '服务器处理失败' })
  }
}
