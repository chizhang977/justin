<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

type EditorView = 'write' | 'edit' | 'split' | 'preview'

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
const editorView = ref<EditorView>('write')
const previewFirst = ref(true)
const sideCollapsed = ref(true)
const uploadInput = ref<HTMLInputElement | null>(null)
const milkdownRoot = ref<HTMLElement | null>(null)
const apiReady = ref(true)
const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const draggingImport = ref(false)
const milkdownLoading = ref(false)
const milkdownError = ref('')
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
const importedFileName = ref('')
let redirectTimer: number | undefined
let milkdownEditor: any
let milkdownTicket = 0
const maxImportBytes = 3 * 1024 * 1024

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

function normalizeTitle(value: string) {
  return String(value || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\s+#+$/g, '')
    .trim()
}

function filenameWithoutMarkdownExt(fileName: string) {
  return fileName.replace(/\.(md|markdown|mdown)$/i, '')
}

function extractFrontmatter(markdown: string) {
  return /^---\s*\n([\s\S]*?)\n---/.exec(markdown)
}

function extractFrontmatterTitle(markdown: string) {
  const match = extractFrontmatter(markdown)

  if (!match) {
    return ''
  }

  const titleLine = /^title\s*:\s*(.+)$/m.exec(match[1])

  return titleLine ? normalizeTitle(titleLine[1]) : ''
}

function extractFirstHeading(markdown: string) {
  const match = /(?:^|\n)#\s+(.+?)(?=\n|$)/.exec(markdown)

  return match ? normalizeTitle(match[1]) : ''
}

function resolveImportedTitle(markdown: string, fileName: string) {
  return extractFrontmatterTitle(markdown) ||
    extractFirstHeading(markdown) ||
    normalizeTitle(filenameWithoutMarkdownExt(fileName).replace(/[-_]+/g, ' ')) ||
    '新文档'
}

function formatFrontmatterTitle(value: string) {
  const normalized = normalizeTitle(value).replace(/\r?\n/g, ' ')

  return `"${normalized.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function ensureMarkdownTitle(markdown: string, docTitle: string) {
  const normalizedTitle = normalizeTitle(docTitle) || '新文档'

  if (extractFrontmatterTitle(markdown) || extractFirstHeading(markdown)) {
    return markdown
  }

  const frontmatter = extractFrontmatter(markdown)

  if (frontmatter) {
    const firstLineEnd = markdown.indexOf('\n', frontmatter.index)
    const insertAt = firstLineEnd === -1 ? frontmatter.index + frontmatter[0].length : firstLineEnd + 1

    return `${markdown.slice(0, insertAt)}title: ${formatFrontmatterTitle(normalizedTitle)}\n${markdown.slice(insertAt)}`
  }

  return `# ${normalizedTitle}\n\n${markdown.trimStart()}`
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

function syncContentFromMilkdown() {
  if (milkdownEditor && typeof milkdownEditor.getMarkdown === 'function') {
    content.value = milkdownEditor.getMarkdown()
  }
}

async function destroyMilkdownEditor() {
  if (!milkdownEditor) {
    return
  }

  const editor = milkdownEditor
  milkdownEditor = null
  await Promise.resolve(editor.destroy?.())
}

async function rebuildMilkdownEditor(markdown = content.value) {
  if (typeof window === 'undefined') {
    return
  }

  const root = milkdownRoot.value

  if (!root) {
    return
  }

  const currentTicket = ++milkdownTicket
  milkdownLoading.value = true
  milkdownError.value = ''

  try {
    await destroyMilkdownEditor()

    if (currentTicket !== milkdownTicket) {
      return
    }

    root.innerHTML = ''

    const { Crepe } = await import('@milkdown/crepe')
    const crepe = new Crepe({
      root,
      defaultValue: markdown || '',
      features: {
        [Crepe.Feature.TopBar]: true
      }
    })

    if (typeof crepe.on === 'function') {
      crepe.on((listener: any) => {
        if (typeof listener.markdownUpdated === 'function') {
          listener.markdownUpdated((_ctx: unknown, nextMarkdown: string) => {
            content.value = nextMarkdown
          })
        }

        if (typeof listener.blur === 'function') {
          listener.blur(() => {
            syncContentFromMilkdown()
          })
        } else if (typeof listener.updated === 'function') {
          listener.updated(() => {
            syncContentFromMilkdown()
          })
        }
      })
    } else {
      window.setTimeout(() => {
        if (currentTicket === milkdownTicket) {
          syncContentFromMilkdown()
        }
      }, 0)
    }

    milkdownEditor = crepe
    await crepe.create()

    if (currentTicket !== milkdownTicket) {
      await Promise.resolve(crepe.destroy?.())
    }
  } catch (err) {
    milkdownError.value = `Milkdown 编辑器加载失败：${(err as Error).message || '请确认依赖已经安装'}`
  } finally {
    if (currentTicket === milkdownTicket) {
      milkdownLoading.value = false
    }
  }
}

async function refreshMilkdownEditor(markdown = content.value) {
  if (editorView.value === 'write') {
    await rebuildMilkdownEditor(markdown)
  }
}

async function switchEditorView(view: EditorView) {
  if (editorView.value === 'write') {
    syncContentFromMilkdown()
  }

  editorView.value = view

  if (view === 'write') {
    await rebuildMilkdownEditor(content.value)
  }
}

function openImporter() {
  if (importing.value) {
    return
  }

  uploadInput.value?.click()
}

function isMarkdownFile(file: File) {
  return /\.(md|markdown|mdown)$/i.test(file.name) ||
    file.type === 'text/markdown' ||
    file.type === 'text/plain' ||
    file.type === ''
}

function readFileAsText(file: File) {
  if (typeof file.text === 'function') {
    return file.text()
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取本地文件失败'))
    reader.readAsText(file, 'utf-8')
  })
}

async function importMarkdownFile(file: File) {
  if (!isMarkdownFile(file)) {
    setError('请选择 .md 或 .markdown 文档。')
    return
  }

  if (file.size > maxImportBytes) {
    setError('文档超过 3MB，建议拆分后再上传。')
    return
  }

  importing.value = true
  setNotice('正在读取本地 Markdown 文档...')

  try {
    const rawContent = (await readFileAsText(file)).replace(/^\uFEFF/, '')
    const importedTitle = resolveImportedTitle(rawContent, file.name)
    const importedSlug = normalizeSlug(filenameWithoutMarkdownExt(file.name)) ||
      normalizeSlug(importedTitle)

    mode.value = 'create'
    title.value = importedTitle
    slug.value = importedSlug
    content.value = ensureMarkdownTitle(rawContent, importedTitle)
    importedFileName.value = file.name
    commitMessage.value = `docs: add ${importedSlug}`
    sha.value = ''
    loadedPath.value = ''
    lastCommitUrl.value = ''
    saveCompleted.value = false
    updateCreatePath()
    sideCollapsed.value = false
    await switchEditorView('write')
    setNotice(`已导入 ${file.name}，请选择目录并确认标题后提交。`)
  } catch (err) {
    setError((err as Error).message)
  } finally {
    importing.value = false
  }
}

async function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''
  draggingImport.value = false

  if (!file) {
    return
  }

  await importMarkdownFile(file)
}

async function handleImportDrop(event: DragEvent) {
  draggingImport.value = false
  const file = event.dataTransfer?.files?.[0]

  if (!file) {
    return
  }

  await importMarkdownFile(file)
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
    importedFileName.value = ''
    title.value = resolveImportedTitle(content.value, path.value.split('/').pop() || '新文档.md')

    if (!file.exists && !content.value) {
      buildTemplate(true)
    }

    await refreshMilkdownEditor(content.value)
    setNotice(file.exists ? '文档已载入，可以编辑。' : '这是新文档，保存后会创建到仓库。')
  } catch (err) {
    setError((err as Error).message)
  } finally {
    loading.value = false
  }
}

async function saveFile() {
  syncContentFromMilkdown()

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
  importedFileName.value = ''
  updateCreatePath()
  buildTemplate(true)
  commitMessage.value = `docs: add ${normalizeSlug(slug.value)}`
  void refreshMilkdownEditor(content.value)
}

onMounted(async () => {
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

  await refreshMilkdownEditor(content.value)
})

onBeforeUnmount(() => {
  window.clearTimeout(redirectTimer)
  void destroyMilkdownEditor()
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
    <input
      ref="uploadInput"
      class="doc-editor__file-input"
      type="file"
      accept=".md,.markdown,.mdown,text/markdown,text/plain"
      @change="handleFileImport"
    />

    <header class="doc-editor__topbar">
      <div class="doc-editor__doc-info">
        <a :href="withBase('/')" class="doc-editor__brand">Justin Docs</a>
        <span class="doc-editor__divider"></span>
        <input
          v-model="title"
          class="doc-editor__title-input"
          type="text"
          placeholder="未命名文档"
          @change="buildTemplate()"
        />
        <span class="doc-editor__sync-state">
          {{ saving ? '保存中' : saveCompleted ? '已提交' : milkdownLoading ? '加载中' : '编辑中' }}
        </span>
      </div>

      <div class="doc-editor__top-actions">
        <template v-if="user.authenticated">
          <span class="doc-editor__user">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" />
            {{ user.login }}
          </span>
          <button type="button" class="ghost" @click="logout">退出</button>
        </template>
        <button v-else type="button" class="ghost" :disabled="!apiReady" @click="login">
          GitHub 登录
        </button>
        <button type="button" class="ghost" :disabled="importing" @click="openImporter">
          导入
        </button>
        <button type="button" class="ghost" @click="sideCollapsed = !sideCollapsed">
          {{ sideCollapsed ? '设置' : '收起' }}
        </button>
        <button type="button" class="primary" :disabled="saving || !canSave" @click="saveFile">
          {{ saving ? '提交中...' : '提交' }}
        </button>
      </div>
    </header>

    <section v-if="!apiReady" class="doc-editor__fallback">
      <strong>当前环境不支持站内提交</strong>
      <p>
        GitHub Pages 是纯静态托管，不能安全保存 GitHub 密钥。要使用站内提交，请部署到 Vercel，
        并配置 GitHub OAuth 环境变量。你也可以直接使用 GitHub 网页编辑。
      </p>
      <a :href="githubEditUrl" target="_blank" rel="noreferrer">打开 GitHub 编辑</a>
    </section>

    <section :class="['doc-editor__shell', { 'side-collapsed': sideCollapsed }]">
      <aside class="doc-editor__rail" aria-label="编辑器快捷操作">
        <button type="button" title="新建文档" @click="switchToCreate">+</button>
        <button type="button" title="导入 Markdown" :disabled="importing" @click="openImporter">↥</button>
        <button type="button" title="读取文档" :disabled="loading || !user.authenticated" @click="loadFile">↻</button>
        <button type="button" title="文档设置" @click="sideCollapsed = !sideCollapsed">☰</button>
        <a :href="githubEditUrl" title="GitHub 网页编辑" target="_blank" rel="noreferrer">GH</a>
      </aside>

      <aside v-show="!sideCollapsed" :class="['doc-editor__side', { collapsed: sideCollapsed }]">
        <div class="doc-editor__side-panel">
          <div class="doc-editor__side-head">
            <strong>文档设置</strong>
            <button type="button" @click="sideCollapsed = true">收起</button>
          </div>

          <div class="doc-editor__mode">
            <button type="button" :class="{ active: mode === 'edit' }" @click="mode = 'edit'">编辑</button>
            <button type="button" :class="{ active: mode === 'create' }" @click="switchToCreate">新建</button>
          </div>

          <div
            :class="['doc-editor__import', { dragging: draggingImport }]"
            @dragenter.prevent="draggingImport = true"
            @dragover.prevent="draggingImport = true"
            @dragleave.prevent="draggingImport = false"
            @drop.prevent="handleImportDrop"
          >
            <div>
              <strong>导入 Markdown</strong>
              <span v-if="importedFileName">{{ importedFileName }}</span>
              <span v-else>选择本地 .md 文件</span>
            </div>
            <button type="button" :disabled="importing" @click="openImporter">
              {{ importing ? '导入中...' : '选择文件' }}
            </button>
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

          <details class="doc-editor__advanced">
            <summary>提交设置</summary>
            <label>
              <span>提交说明</span>
              <input v-model="commitMessage" type="text" placeholder="docs: update linux note" />
            </label>
          </details>

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
        </div>
      </aside>

      <section class="doc-editor__main">
        <div class="doc-editor__toolbar">
          <div class="doc-editor__view-tabs" aria-label="编辑视图">
            <button
              type="button"
              :class="{ active: editorView === 'write' }"
              @click="switchEditorView('write')"
            >
              写作
            </button>
            <button
              type="button"
              :class="{ active: editorView === 'edit' }"
              @click="switchEditorView('edit')"
            >
              编辑
            </button>
            <button
              type="button"
              :class="{ active: editorView === 'split' }"
              @click="switchEditorView('split')"
            >
              分屏
            </button>
            <button
              type="button"
              :class="{ active: editorView === 'preview' }"
              @click="switchEditorView('preview')"
            >
              预览
            </button>
          </div>
          <div class="doc-editor__toolbar-actions">
            <button
              type="button"
              :disabled="editorView !== 'split'"
              @click="previewFirst = !previewFirst"
            >
              交换
            </button>
            <button type="button" @click="sideCollapsed = !sideCollapsed">
              {{ sideCollapsed ? '设置' : '收起' }}
            </button>
            <div class="doc-editor__quick-stats">
              <span>{{ editorStats.chars }} 字符</span>
              <span>{{ editorStats.lines }} 行</span>
            </div>
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

        <div :class="['doc-editor__workspace', `is-${editorView}`, { 'preview-first': previewFirst }]">
          <section
            v-show="editorView === 'write'"
            class="doc-editor__milkdown"
            @keydown.ctrl.s.prevent="saveFile"
            @keydown.meta.s.prevent="saveFile"
          >
            <div v-if="milkdownLoading" class="doc-editor__milkdown-state">
              正在加载写作编辑器...
            </div>
            <div v-if="milkdownError" class="doc-editor__milkdown-error">
              <span>{{ milkdownError }}</span>
              <button type="button" @click="rebuildMilkdownEditor(content)">重试</button>
            </div>
            <div ref="milkdownRoot" class="doc-editor__milkdown-root" />
          </section>
          <textarea
            v-show="editorView === 'edit' || editorView === 'split'"
            v-model="content"
            spellcheck="false"
            placeholder="在这里写 Markdown 文档..."
          />
          <article
            v-show="editorView === 'split' || editorView === 'preview'"
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
