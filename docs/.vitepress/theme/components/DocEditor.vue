<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

type UserInfo = {
  authenticated: boolean
  allowed?: boolean
  login?: string
  avatarUrl?: string
  htmlUrl?: string
  repo?: {
    owner: string
    repo: string
    branch: string
    allowedPrefixes: string[]
  }
}

const categories = [
  { label: 'Linux', prefix: 'docs/src/docs/linux/linux/' },
  { label: 'MySQL', prefix: 'docs/src/docs/db/mysql/' },
  { label: 'Redis', prefix: 'docs/src/docs/db/redis/' },
  { label: 'Docker', prefix: 'docs/src/docs/linux/docker/' },
  { label: 'Kubernetes', prefix: 'docs/src/docs/linux/k8s/' },
  { label: 'Nginx', prefix: 'docs/src/docs/linux/nginx/' },
  { label: 'Jenkins', prefix: 'docs/src/docs/devops/jenkins/' },
  { label: 'Java', prefix: 'docs/src/docs/java/' }
]

const user = ref<UserInfo>({ authenticated: false })
const mode = ref<'edit' | 'create'>('edit')
const editorView = ref<'edit' | 'split' | 'preview'>('split')
const apiReady = ref(true)
const loading = ref(false)
const saving = ref(false)
const saveCompleted = ref(false)
const notice = ref('')
const error = ref('')
const path = ref('')
const sha = ref('')
const content = ref('')
const title = ref('新文档')
const slug = ref('new-note')
const categoryPrefix = ref(categories[0].prefix)
const commitMessage = ref('')
const lastCommitUrl = ref('')
const loadedPath = ref('')
let redirectTimer: number | undefined

const githubEditUrl = computed(() => {
  const target = path.value || `${categoryPrefix.value}${normalizeSlug(slug.value)}.md`
  const repo = user.value.repo || {
    owner: 'chizhang977',
    repo: 'justin',
    branch: 'master'
  }

  return `https://github.com/${repo.owner}/${repo.repo}/edit/${repo.branch}/${encodeURIComponent(target).replace(/%2F/g, '/')}`
})

const canSave = computed(() => {
  return Boolean(apiReady.value &&
    user.value.authenticated &&
    user.value.allowed !== false &&
    path.value.endsWith('.md') &&
    content.value.trim())
})

const docViewUrl = computed(() => {
  return repoPathToSiteUrl(path.value)
})

const editorStats = computed(() => {
  const text = content.value || ''
  const trimmed = text.trim()

  return {
    chars: text.length,
    lines: text ? text.split('\n').length : 0,
    words: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  }
})

const previewHtml = computed(() => {
  return renderMarkdown(content.value)
})

function normalizeSlug(value: string) {
  return String(value || 'new-note')
    .trim()
    .replace(/\.md$/i, '')
    .replace(/[\\/:*?"<>|#]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '') || 'new-note'
}

function setNotice(message: string) {
  notice.value = message
  error.value = ''
}

function setError(message: string) {
  error.value = message
  notice.value = ''
}

function buildTemplate(force = false) {
  if (!force && content.value.trim()) {
    return
  }

  const docTitle = title.value.trim() || '新文档'

  content.value = `# ${docTitle}

## 背景

这里写清楚这个知识点解决什么问题、通常出现在什么场景。

## 核心概念

- 概念一：
- 概念二：
- 概念三：

## 操作流程

1. 准备环境。
2. 执行关键命令或配置。
3. 验证结果。
4. 记录排障点。

## 常用命令

\`\`\`bash
# 在这里放可直接复制的命令
\`\`\`

## 排障记录

| 现象 | 原因 | 处理方式 |
| --- | --- | --- |
|  |  |  |
`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

function isSafeAssetUrl(value: string) {
  return /^(https?:\/\/|\/|\.{1,2}\/|[A-Za-z0-9_.-]+\/)[^\s"'<>]*$/i.test(value)
}

function renderInlineMarkdown(value: string) {
  const placeholders: string[] = []
  const assetPattern = '(?:https?:\\/\\/|\\/|\\.{1,2}\\/|[A-Za-z0-9_.-]+\\/)[^\\s)]+'
  const store = (html: string) => {
    const key = `JUSTINMDTOKEN${placeholders.length}END`

    placeholders.push(html)
    return key
  }

  let source = value

  source = source.replace(/`([^`]+)`/g, (_match, code) => {
    return store(`<code>${escapeHtml(code)}</code>`)
  })
  source = source.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    if (!isSafeAssetUrl(src)) {
      return match
    }

    const altMatch = /alt=["']([^"']*)["']/i.exec(match)
    const alt = altMatch ? altMatch[1] : ''

    return store(`<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" />`)
  })
  source = source.replace(new RegExp(`!\\[([^\\]]*)\\]\\((${assetPattern})(?:\\s+"[^"]*")?\\)`, 'g'), (_match, alt, src) => {
    return store(`<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" />`)
  })
  source = source.replace(new RegExp(`\\[([^\\]]+)\\]\\((${assetPattern}|#[^\\s)]*)\\)`, 'g'), (_match, label, url) => {
    const external = /^https?:\/\//.test(url)
    const target = external ? ' target="_blank" rel="noreferrer"' : ''

    return store(`<a href="${escapeAttr(url)}"${target}>${escapeHtml(label)}</a>`)
  })

  let html = escapeHtml(source)

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')

  placeholders.forEach((placeholder, index) => {
    html = html.replace(new RegExp(`JUSTINMDTOKEN${index}END`, 'g'), placeholder)
  })

  return html
}

function isFenceStart(line: string) {
  return /^```/.test(line.trim())
}

function isTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderTable(lines: string[]) {
  const header = splitTableRow(lines[0])
  const body = lines.slice(2).map(splitTableRow)

  return `<table><thead><tr>${header
    .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
    .join('')}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (isFenceStart(line)) {
      const language = trimmed.replace(/^```/, '').trim().split(/\s+/)[0] || 'text'
      const codeLines: string[] = []

      index += 1
      while (index < lines.length && !isFenceStart(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }
      index += index < lines.length ? 1 : 0

      html.push(`<div class="language-${escapeAttr(language)}"><span class="lang">${escapeHtml(language)}</span><pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre></div>`)
      continue
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed)
    if (heading) {
      const level = heading[1].length
      const text = heading[2].replace(/\s+#+$/, '')

      html.push(`<h${level}>${renderInlineMarkdown(text)}</h${level}>`)
      index += 1
      continue
    }

    if (index + 1 < lines.length && line.includes('|') && isTableSeparator(lines[index + 1])) {
      const tableLines = [line, lines[index + 1]]

      index += 2
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        tableLines.push(lines[index])
        index += 1
      }

      html.push(renderTable(tableLines))
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = []

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }

      html.push(`<blockquote><p>${renderInlineMarkdown(quoteLines.join(' '))}</p></blockquote>`)
      continue
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = []

      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ''))
        index += 1
      }

      html.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''))
        index += 1
      }

      html.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ol>`)
      continue
    }

    const paragraph: string[] = []

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isFenceStart(lines[index]) &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^>\s?/.test(lines[index].trim()) &&
      !/^[-*+]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }

    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`)
  }

  return html.join('\n') || '<p class="doc-editor__preview-empty">开始写 Markdown 后，这里会实时显示预览。</p>'
}

function repoPathToSiteUrl(repoPath: string) {
  const normalized = repoPath.replace(/\\/g, '/')

  if (!normalized.startsWith('docs/src/')) {
    return withBase('/')
  }

  let routePath = normalized.slice('docs/src'.length)

  if (routePath === '/index.md') {
    return withBase('/')
  }

  routePath = routePath
    .replace(/\/index\.md$/i, '/')
    .replace(/\.md$/i, '')

  return withBase(routePath.startsWith('/') ? routePath : `/${routePath}`)
}

function scheduleRedirectToDoc() {
  window.clearTimeout(redirectTimer)
  saveCompleted.value = true
  redirectTimer = window.setTimeout(() => {
    window.location.href = docViewUrl.value
  }, 1800)
}

function updateCreatePath() {
  path.value = `${categoryPrefix.value}${normalizeSlug(slug.value)}.md`
  sha.value = ''
}

async function requestJson(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  const text = await response.text()
  let payload: any = {}

  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    if (response.status === 404) {
      apiReady.value = false
      throw new Error('当前部署环境没有启用 Vercel API，无法直接写入 GitHub')
    }

    throw new Error('接口返回不是合法 JSON')
  }

  if (!response.ok) {
    throw new Error(payload.message || `请求失败：${response.status}`)
  }

  return payload
}

async function checkLogin() {
  try {
    user.value = await requestJson('/api/github/me')

    if (user.value.authenticated && user.value.allowed === false) {
      setError(`当前 GitHub 用户 ${user.value.login} 不在允许提交名单中。`)
    }
  } catch (err) {
    user.value = { authenticated: false }

    if (!apiReady.value) {
      setError((err as Error).message)
    }
  }
}

async function loadFile() {
  if (!path.value) {
    return
  }

  loading.value = true
  setNotice('正在读取 GitHub 文档...')

  try {
    const file = await requestJson(`/api/github/file?path=${encodeURIComponent(path.value)}`)
    content.value = file.content || ''
    sha.value = file.sha || ''
    loadedPath.value = path.value
    mode.value = file.exists ? 'edit' : 'create'

    if (!file.exists && !content.value) {
      buildTemplate(true)
    }

    setNotice(file.exists ? '文档已载入，可以编辑。' : '这是新文档，保存后会创建到仓库。')
  } catch (err) {
    setError((err as Error).message)
  } finally {
    loading.value = false
  }
}

async function saveFile() {
  if (!canSave.value) {
    setError('请先登录 GitHub，并确认路径和内容不为空。')
    return
  }

  saving.value = true
  lastCommitUrl.value = ''
  setNotice('正在提交到 GitHub...')

  try {
    const result = await requestJson('/api/github/file', {
      method: 'PUT',
      body: JSON.stringify({
        path: path.value,
        content: content.value,
        sha: sha.value,
        createOnly: mode.value === 'create',
        message: commitMessage.value || `docs: update ${path.value.split('/').pop()}`
      })
    })

    sha.value = result.sha || sha.value
    loadedPath.value = path.value
    lastCommitUrl.value = result.commitUrl || ''
    mode.value = 'edit'
    setNotice('提交成功，正在返回文档页。新文档需要等待 Vercel 重新构建后才会显示最新内容。')
    scheduleRedirectToDoc()
  } catch (err) {
    setError((err as Error).message)
  } finally {
    saving.value = false
  }
}

function login() {
  const returnTo = `${window.location.pathname}${window.location.search}`

  window.location.href = `/api/github/oauth/start?returnTo=${encodeURIComponent(returnTo)}`
}

async function logout() {
  await requestJson('/api/github/logout', { method: 'POST' })
  user.value = { authenticated: false }
  setNotice('已退出 GitHub 登录。')
}

function switchToCreate() {
  mode.value = 'create'
  updateCreatePath()
  buildTemplate(true)
  commitMessage.value = `docs: add ${normalizeSlug(slug.value)}`
}

onMounted(async () => {
  if (window.innerWidth < 1100) {
    editorView.value = 'edit'
  }

  const search = new URLSearchParams(window.location.search)
  const sourcePath = search.get('path')

  if (sourcePath) {
    path.value = decodeURIComponent(sourcePath)
    mode.value = 'edit'
  } else {
    switchToCreate()
  }

  await checkLogin()

  if (user.value.authenticated && path.value) {
    await loadFile()
  }
})

onBeforeUnmount(() => {
  window.clearTimeout(redirectTimer)
})

watch([categoryPrefix, slug], () => {
  if (mode.value === 'create') {
    updateCreatePath()
    commitMessage.value = `docs: add ${normalizeSlug(slug.value)}`
  }
})

watch(path, (nextPath) => {
  if (nextPath !== loadedPath.value) {
    sha.value = ''
    lastCommitUrl.value = ''
    saveCompleted.value = false
  }
})
</script>

<template>
  <main class="doc-editor">
    <section class="doc-editor__hero">
      <div>
        <p>Online Writer</p>
        <h1>在线写文档</h1>
        <span>通过 GitHub OAuth 写入仓库，提交后由 Vercel 或 GitHub Pages 自动重新构建。</span>
      </div>
      <div class="doc-editor__account">
        <template v-if="user.authenticated">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" />
          <strong>{{ user.login }}</strong>
          <button type="button" @click="logout">退出</button>
        </template>
        <button v-else type="button" class="primary" :disabled="!apiReady" @click="login">
          GitHub 登录
        </button>
      </div>
    </section>

    <section v-if="!apiReady" class="doc-editor__fallback">
      <strong>当前环境不支持站内提交</strong>
      <p>
        GitHub Pages 是纯静态托管，不能安全保存 GitHub 密钥。要使用站内提交，请部署到 Vercel，
        并配置 GitHub OAuth 环境变量。你也可以直接使用 GitHub 网页编辑。
      </p>
      <a :href="githubEditUrl" target="_blank" rel="noreferrer">打开 GitHub 编辑</a>
    </section>

    <section class="doc-editor__shell">
      <aside class="doc-editor__side">
        <div class="doc-editor__mode">
          <button type="button" :class="{ active: mode === 'edit' }" @click="mode = 'edit'">编辑</button>
          <button type="button" :class="{ active: mode === 'create' }" @click="switchToCreate">新建</button>
        </div>

        <label>
          <span>文档路径</span>
          <input v-model="path" type="text" :readonly="mode === 'create'" />
        </label>

        <template v-if="mode === 'create'">
          <label>
            <span>分类目录</span>
            <select v-model="categoryPrefix">
              <option v-for="category in categories" :key="category.prefix" :value="category.prefix">
                {{ category.label }}
              </option>
            </select>
          </label>

          <label>
            <span>文件名</span>
            <input v-model="slug" type="text" placeholder="linux-network-note" />
          </label>

          <label>
            <span>标题</span>
            <input v-model="title" type="text" @change="buildTemplate()" />
          </label>
        </template>

        <label>
          <span>提交说明</span>
          <input v-model="commitMessage" type="text" placeholder="docs: update linux note" />
        </label>

        <div class="doc-editor__side-actions">
          <button type="button" :disabled="loading || !user.authenticated" @click="loadFile">
            读取
          </button>
          <button type="button" class="primary" :disabled="saving || !canSave" @click="saveFile">
            {{ saving ? '提交中...' : '提交' }}
          </button>
        </div>

        <a class="doc-editor__github" :href="githubEditUrl" target="_blank" rel="noreferrer">
          GitHub 网页编辑
        </a>
      </aside>

      <section class="doc-editor__main">
        <div class="doc-editor__toolbar">
          <div class="doc-editor__view-tabs" aria-label="编辑视图">
            <button
              type="button"
              :class="{ active: editorView === 'edit' }"
              @click="editorView = 'edit'"
            >
              编辑
            </button>
            <button
              type="button"
              :class="{ active: editorView === 'split' }"
              @click="editorView = 'split'"
            >
              分屏
            </button>
            <button
              type="button"
              :class="{ active: editorView === 'preview' }"
              @click="editorView = 'preview'"
            >
              预览
            </button>
          </div>
          <div class="doc-editor__quick-stats">
            <span>{{ editorStats.chars }} 字符</span>
            <span>{{ editorStats.lines }} 行</span>
          </div>
        </div>

        <div v-if="notice || error" :class="['doc-editor__message', { error }]">
          {{ error || notice }}
        </div>

        <div v-if="saveCompleted" class="doc-editor__done">
          <strong>提交已经写入 GitHub</strong>
          <span>页面会自动离开编辑器。新建文档如果暂时打不开，等 Vercel 构建完成后刷新即可。</span>
          <a :href="docViewUrl">立即查看文档</a>
        </div>

        <div :class="['doc-editor__workspace', `is-${editorView}`]">
          <textarea
            v-show="editorView !== 'preview'"
            v-model="content"
            spellcheck="false"
            placeholder="在这里写 Markdown 文档..."
          />
          <article
            v-show="editorView !== 'edit'"
            class="doc-editor__preview vp-doc"
            v-html="previewHtml"
          />
        </div>

        <div class="doc-editor__footer">
          <span>{{ editorStats.words }} 词段</span>
          <a v-if="lastCommitUrl" :href="lastCommitUrl" target="_blank" rel="noreferrer">查看提交</a>
          <a :href="docViewUrl">查看当前文档</a>
          <a :href="withBase('/')" target="_blank">返回首页</a>
        </div>
      </section>
    </section>
  </main>
</template>
