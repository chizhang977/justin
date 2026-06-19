const {
  encodeGitHubPath,
  getRepoConfig,
  githubRequest,
  readJsonBody,
  requireAllowedUser,
  requireSameOrigin,
  requireToken,
  sendJson
} = require('./_shared')

const allowedTypes = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/svg+xml', 'svg']
])

const maxAssetBytes = 4 * 1024 * 1024

function sanitizeBaseName(fileName) {
  const raw = String(fileName || 'image')
    .replace(/\.[^.]+$/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return raw || 'image'
}

function resolveExtension(fileName, contentType) {
  const normalizedType = String(contentType || '').toLowerCase()

  if (allowedTypes.has(normalizedType)) {
    return allowedTypes.get(normalizedType)
  }

  const match = /\.([a-z0-9]+)$/i.exec(String(fileName || ''))
  const ext = match ? match[1].toLowerCase() : ''

  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }

  return ''
}

function buildAssetPath(fileName, contentType) {
  const ext = resolveExtension(fileName, contentType)

  if (!ext) {
    const error = new Error('只支持上传 png、jpg、jpeg、webp、gif、svg 图片')
    error.statusCode = 400
    throw error
  }

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const stamp = [
    year,
    month,
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0')
  ].join('')
  const random = Math.random().toString(36).slice(2, 8)
  const name = `${stamp}-${sanitizeBaseName(fileName)}-${random}.${ext}`

  return {
    repoPath: `docs/src/public/assets/uploads/${year}/${month}/${name}`,
    publicUrl: `/assets/uploads/${year}/${month}/${name}`
  }
}

function decodeBase64Image(value) {
  const base64 = String(value || '')
    .replace(/^data:image\/[a-z0-9.+-]+;base64,/i, '')
    .replace(/\s/g, '')

  if (!base64) {
    const error = new Error('图片内容不能为空')
    error.statusCode = 400
    throw error
  }

  const buffer = Buffer.from(base64, 'base64')

  if (!buffer.length || buffer.length > maxAssetBytes) {
    const error = new Error('图片大小不能超过 4MB')
    error.statusCode = 400
    throw error
  }

  return buffer
}

async function handlePut(req, res, token) {
  if (!requireSameOrigin(req, res)) {
    return
  }

  const body = await readJsonBody(req, 7 * 1024 * 1024)
  const { owner, repo, branch } = getRepoConfig()
  const buffer = decodeBase64Image(body.contentBase64 || body.dataUrl)
  const { repoPath, publicUrl } = buildAssetPath(body.fileName, body.contentType)
  const apiPath = encodeGitHubPath(repoPath)
  const response = await githubRequest(`/repos/${owner}/${repo}/contents/${apiPath}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message: `docs: upload ${repoPath.split('/').pop()}`,
      content: buffer.toString('base64'),
      branch
    })
  })
  const result = await response.json()

  if (!response.ok) {
    sendJson(res, response.status, {
      message: result.message || '上传图片失败',
      errors: result.errors || []
    })
    return
  }

  sendJson(res, 200, {
    path: repoPath,
    publicUrl,
    contentUrl: result.content?.html_url || '',
    commitUrl: result.commit?.html_url || '',
    commitSha: result.commit?.sha || ''
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

    if (req.method === 'PUT') {
      await handlePut(req, res, token)
      return
    }

    sendJson(res, 405, { message: 'Method Not Allowed' })
  } catch (error) {
    sendJson(res, error.statusCode || 500, { message: error.message || '服务器处理失败' })
  }
}
