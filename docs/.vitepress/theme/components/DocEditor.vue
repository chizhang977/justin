<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

type WriterMode = 'create' | 'edit'

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

type DraftPayload = {
  title: string
  slug: string
  categoryPrefix: string
  content: string
  commitMessage: string
  importedFileName: string
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

const draftKey = 'justin-docs-online-writer-draft-v3'
const maxImportBytes = 3 * 1024 * 1024
const maxImageBytes = 4 * 1024 * 1024

const user = ref<UserInfo>({ authenticated: false })
const mode = ref<WriterMode>('create')
const sideCollapsed = ref(true)
const previewOpen = ref(true)
const previewFirst = ref(false)
const markdownInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const editorRef = ref<HTMLTextAreaElement | null>(null)
const apiReady = ref(true)
const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const uploadingImage = ref(false)
const draggingImport = ref(false)
const saveCompleted = ref(false)
const notice = ref('')
const error = ref('')
const path = ref('')
const sha = ref('')
const content = ref('')
const originalContent = ref('')
const title = ref('新文档')
const slug = ref('new-note')
const categoryPrefix = ref(categories[0].prefix)
const commitMessage = ref('')
const lastCommitUrl = ref('')
const loadedPath = ref('')
const importedFileName = ref('')
const hasSourcePath = ref(false)
const draftReady = ref(false)

let redirectTimer: number | undefined
let draftTimer: number | undefined

const isEditingCurrentDoc = computed(() => mode.value === 'edit' && hasSourcePath.value)
const showCreateTools = computed(() => !isEditingCurrentDoc.value)
const hasUnsavedChanges = computed(() => content.value !== originalContent.value)

const entryLabel = computed(() => {
  if (isEditingCurrentDoc.value) return '编辑当前文档'
  if (importedFileName.value) return '导入文档'
  return '新建文档'
})

const entryDescription = computed(() => {
  if (isEditingCurrentDoc.value) return '从文档页进入，只修改当前这篇 Markdown。'
  if (importedFileName.value) return '已读取本地 Markdown，确认目录和文件名后提交。'
  return '从首页进入，用来创建一篇新的技术文档。'
})

const statusText = computed(() => {
  if (saving.value) return '提交中'
  if (uploadingImage.value) return '上传图片'
  if (loading.value) return '读取中'
  if (saveCompleted.value) return '已提交'
  if (hasUnsavedChanges.value) return '有未提交修改'
  return '编辑中'
})

const currentCategory = computed(() => {
  return categories.find((item) => item.prefix === categoryPrefix.value)?.label || '文档'
})

const needsLoginToLoad = computed(() => {
  return isEditingCurrentDoc.value && !user.value.authenticated
})

const canSave = computed(() => {
  return Boolean(
    apiReady.value &&
    user.value.authenticated &&
    user.value.allowed !== false &&
    path.value.endsWith('.md') &&
    content.value.trim() &&
    !saveCompleted.value
  )
})

const githubEditUrl = computed(() => {
  const target = path.value || `${categoryPrefix.value}${normalizeSlug(slug.value)}.md`
  const repo = user.value.repo || {
    owner: 'chizhang977',
    repo: 'justin',
    branch: 'master'
  }

  return `https://github.com/${repo.owner}/${repo.repo}/edit/${repo.branch}/${encodeURIComponent(target).replace(/%2F/g, '/')}`
})

const docViewUrl = computed(() => repoPathToSiteUrl(path.value))

const editorStats = computed(() => {
  const text = content.value || ''
  const trimmed = text.trim()
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_\-[\]()`|]/g, ' ')
    .trim()

  return {
    chars: text.length,
    lines: text ? text.split('\n').length : 0,
    words: plain ? plain.split(/\s+/).filter(Boolean).length : 0,
    headings: (text.match(/^#{1,6}\s+/gm) || []).length
  }
})

const previewHtml = computed(() => renderMarkdown(content.value))

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

function stripFrontmatter(markdown: string) {
  return markdown.replace(/^---\s*\n[\s\S]*?\n---\s*/, '')
}

function extractFrontmatterTitle(markdown: string) {
  const match = extractFrontmatter(markdown)

  if (!match) return ''

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

function upsertMarkdownTitle(markdown: string, docTitle: string) {
  const normalizedTitle = normalizeTitle(docTitle) || '新文档'
  const frontmatter = extractFrontmatter(markdown)

  if (frontmatter) {
    const nextFrontmatter = /^title\s*:\s*.+$/m.test(frontmatter[1])
      ? frontmatter[1].replace(/^title\s*:\s*.+$/m, `title: ${formatFrontmatterTitle(normalizedTitle)}`)
      : `title: ${formatFrontmatterTitle(normalizedTitle)}\n${frontmatter[1]}`

    return markdown.replace(frontmatter[0], `---\n${nextFrontmatter}\n---`)
  }

  if (/(^|\n)#\s+.+(?=\n|$)/.test(markdown)) {
    return markdown.replace(/(^|\n)#\s+.+(?=\n|$)/, (_match, prefix) => `${prefix}# ${normalizedTitle}`)
  }

  return `# ${normalizedTitle}\n\n${markdown.trimStart()}`
}

function syncTitleFromContent(markdown: string) {
  const nextTitle = extractFrontmatterTitle(markdown) || extractFirstHeading(markdown)

  if (nextTitle && nextTitle !== title.value) {
    title.value = nextTitle
  }
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

function renderInlineMarkdown(value: string) {
  const placeholders: string[] = []
  const store = (html: string) => {
    const key = `JUSTIN_MD_${placeholders.length}_END`

    placeholders.push(html)
    return key
  }

  let source = value

  source = source.replace(/`([^`]+)`/g, (_match, code) => {
    return store(`<code>${escapeHtml(code)}</code>`)
  })
  source = source.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_match, alt, src) => {
    return store(`<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" />`)
  })
  source = source.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|#[^)\s]+)\)/g, (_match, label, url) => {
    const external = /^https?:\/\//.test(url)
    const target = external ? ' target="_blank" rel="noreferrer"' : ''

    return store(`<a href="${escapeAttr(url)}"${target}>${escapeHtml(label)}</a>`)
  })

  let html = escapeHtml(source)

  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')

  placeholders.forEach((placeholder, index) => {
    html = html.replace(new RegExp(`JUSTIN_MD_${index}_END`, 'g'), placeholder)
  })

  return html
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
  const lines = stripFrontmatter(markdown).replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (/^```/.test(trimmed)) {
      const language = trimmed.replace(/^```/, '').trim().split(/\s+/)[0] || 'text'
      const codeLines: string[] = []

      index += 1
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index])
        index += 1
      }
      index += index < lines.length ? 1 : 0

      html.push(`<div class="doc-editor-preview-code"><span>${escapeHtml(language)}</span><pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre></div>`)
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

    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      html.push('<hr />')
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

    if (/^[-*+]\s+\[[ xX]\]\s+/.test(trimmed)) {
      const items: string[] = []

      while (index < lines.length && /^[-*+]\s+\[[ xX]\]\s+/.test(lines[index].trim())) {
        const item = lines[index].trim()
        const checked = /^[-*+]\s+\[[xX]\]\s+/.test(item)
        const text = item.replace(/^[-*+]\s+\[[ xX]\]\s+/, '')

        items.push(`<li class="task-list-item"><input type="checkbox" disabled${checked ? ' checked' : ''} /> ${renderInlineMarkdown(text)}</li>`)
        index += 1
      }

      html.push(`<ul class="task-list">${items.join('')}</ul>`)
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
      !/^```/.test(lines[index].trim()) &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^(---|\*\*\*|___)$/.test(lines[index].trim()) &&
      !/^>\s?/.test(lines[index].trim()) &&
      !/^[-*+]\s+\[[ xX]\]\s+/.test(lines[index].trim()) &&
      !/^[-*+]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }

    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`)
  }

  return html.join('\n') || '<p class="doc-editor-preview-empty">开始写作后，这里会显示预览。</p>'
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
  if (!force && content.value.trim()) return

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

function updateCreatePath() {
  path.value = `${categoryPrefix.value}${normalizeSlug(slug.value)}.md`
  sha.value = ''
}

function getSelectionRange() {
  const editor = editorRef.value

  return {
    start: editor?.selectionStart ?? content.value.length,
    end: editor?.selectionEnd ?? content.value.length
  }
}

async function focusEditor(position?: number) {
  await nextTick()
  const editor = editorRef.value

  if (!editor) return

  editor.focus()

  if (typeof position === 'number') {
    editor.setSelectionRange(position, position)
  }
}

function replaceSelection(value: string, cursorOffset = value.length) {
  const { start, end } = getSelectionRange()
  const before = content.value.slice(0, start)
  const after = content.value.slice(end)

  content.value = `${before}${value}${after}`
  void focusEditor(start + cursorOffset)
}

function replaceRange(start: number, end: number, value: string, selectStart?: number, selectEnd?: number) {
  const before = content.value.slice(0, start)
  const after = content.value.slice(end)

  content.value = `${before}${value}${after}`

  void nextTick(() => {
    const editor = editorRef.value

    if (!editor) return

    editor.focus()
    editor.setSelectionRange(selectStart ?? start, selectEnd ?? start + value.length)
  })
}

function wrapSelection(prefix: string, suffix = prefix, placeholder = '内容') {
  const { start, end } = getSelectionRange()
  const selected = content.value.slice(start, end) || placeholder
  const next = `${prefix}${selected}${suffix}`
  const before = content.value.slice(0, start)
  const after = content.value.slice(end)

  content.value = `${before}${next}${after}`
  void focusEditor(start + prefix.length + selected.length)
}

function ensureBlockPrefix(start: number) {
  return start > 0 && !content.value.slice(0, start).endsWith('\n') ? '\n' : ''
}

function getSelectedLineRange() {
  const { start, end } = getSelectionRange()
  const value = content.value
  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  let lineEnd = end

  if (lineEnd < value.length && value[lineEnd] !== '\n') {
    const nextBreak = value.indexOf('\n', lineEnd)
    lineEnd = nextBreak === -1 ? value.length : nextBreak
  }

  return {
    start,
    end,
    lineStart,
    lineEnd,
    text: value.slice(lineStart, lineEnd)
  }
}

function stripBlockPrefix(line: string) {
  return line
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .replace(/^\s{0,3}>\s?/, '')
    .replace(/^\s{0,3}-\s+\[[ xX]\]\s+/, '')
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/, '')
}

function replaceSelectedLines(formatLine: (line: string, index: number) => string, placeholder: string) {
  const range = getSelectedLineRange()
  const hasSelection = range.start !== range.end
  const shouldFormatCurrentLine = !hasSelection && range.text.trim()
  const source = hasSelection || shouldFormatCurrentLine ? range.text : placeholder
  const lines = source.split('\n')
  const formatted = lines
    .map((line, index) => {
      if (!line.trim()) return line

      return formatLine(line, index)
    })
    .join('\n')

  if (hasSelection || shouldFormatCurrentLine) {
    replaceRange(range.lineStart, range.lineEnd, formatted, range.lineStart, range.lineStart + formatted.length)
    return
  }

  insertBlock(formatted, formatted.length)
}

function insertBlock(markdown: string, cursorOffset = markdown.length) {
  const { start } = getSelectionRange()
  const prefix = ensureBlockPrefix(start)
  const value = `${prefix}${markdown}${markdown.endsWith('\n') ? '' : '\n'}`

  replaceSelection(value, prefix.length + cursorOffset)
}

function insertHeading(level: number) {
  const hashes = '#'.repeat(level)
  const range = getSelectedLineRange()
  const selected = content.value.slice(range.start, range.end)

  if (selected.includes('\n')) {
    replaceSelectedLines((line) => `${hashes} ${stripBlockPrefix(line)}`, '标题')
    return
  }

  if (!selected && range.text.trim()) {
    const text = stripBlockPrefix(range.text)
    const value = `${hashes} ${text}`

    replaceRange(range.lineStart, range.lineEnd, value, range.lineStart + hashes.length + 1, range.lineStart + value.length)
    return
  }

  const text = stripBlockPrefix(selected || '标题')
  const prefix = ensureBlockPrefix(range.start)
  const value = `${prefix}${hashes} ${text}\n`

  replaceSelection(value, prefix.length + hashes.length + 1 + text.length)
}

function insertCodeBlock() {
  const { start, end } = getSelectionRange()
  const selected = content.value.slice(start, end) || '# 在这里写命令或代码'
  const prefix = ensureBlockPrefix(start)
  const value = `${prefix}\`\`\`bash\n${selected}\n\`\`\`\n`

  replaceSelection(value, prefix.length + 8)
}

function insertTable() {
  insertBlock('| 字段 | 说明 | 示例 |\n| --- | --- | --- |\n|  |  |  |', 42)
}

function insertQuote() {
  replaceSelectedLines((line) => `> ${line.replace(/^\s{0,3}>\s?/, '')}`, '这里写引用或提示')
}

function insertUnorderedList() {
  replaceSelectedLines((line) => `- ${stripBlockPrefix(line)}`, '第一项\n第二项\n第三项')
}

function insertOrderedList() {
  replaceSelectedLines((line, index) => `${index + 1}. ${stripBlockPrefix(line)}`, '第一项\n第二项\n第三项')
}

function insertTaskList() {
  replaceSelectedLines((line) => `- [ ] ${stripBlockPrefix(line)}`, '待办事项\n继续补充')
}

function insertHorizontalRule() {
  insertBlock('---')
}

function insertLink() {
  const { start, end } = getSelectionRange()
  const selected = content.value.slice(start, end) || '链接文字'
  const value = `[${selected}](https://example.com)`

  replaceSelection(value, selected.length + 3)
}

function indentSelectedLines(reverse = false) {
  const range = getSelectedLineRange()
  const lines = range.text.split('\n')
  const formatted = lines
    .map((line) => {
      if (!line) return line

      return reverse ? line.replace(/^ {1,2}/, '') : `  ${line}`
    })
    .join('\n')

  replaceRange(range.lineStart, range.lineEnd, formatted, range.lineStart, range.lineStart + formatted.length)
}

function handleEditorKeydown(event: KeyboardEvent) {
  const withModifier = event.ctrlKey || event.metaKey

  if (event.key === 'Tab') {
    event.preventDefault()
    indentSelectedLines(event.shiftKey)
    return
  }

  if (!withModifier) return

  const key = event.key.toLowerCase()

  if (key === 's') {
    event.preventDefault()
    void saveFile()
    return
  }

  if (key === 'b') {
    event.preventDefault()
    wrapSelection('**', '**', '重点内容')
    return
  }

  if (key === 'i') {
    event.preventDefault()
    wrapSelection('*', '*', '强调内容')
    return
  }

  if (key === 'k') {
    event.preventDefault()
    insertLink()
  }
}

function openImagePicker() {
  imageInput.value?.click()
}

async function insertImageFromFile(file: File) {
  try {
    uploadingImage.value = true
    const url = await uploadImageAsset(file)
    const alt = normalizeTitle(file.name.replace(/\.[^.]+$/, '')) || '图片'

    insertBlock(`![${alt}](${url})`, alt.length + 4)
    setNotice('图片已上传并插入到文档，记得提交文档让引用生效。')
  } catch (err) {
    setError((err as Error).message)
  } finally {
    uploadingImage.value = false
  }
}

async function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) return

  await insertImageFromFile(file)
}

async function handleEditorPaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files || []).filter(isImageFile)

  if (!files.length) return

  event.preventDefault()

  for (const file of files) {
    await insertImageFromFile(file)
  }
}

async function handleEditorDrop(event: DragEvent) {
  const files = Array.from(event.dataTransfer?.files || []).filter(isImageFile)

  if (!files.length) return

  event.preventDefault()

  for (const file of files) {
    await insertImageFromFile(file)
  }
}

async function uploadImageAsset(file: File) {
  if (!apiReady.value || !user.value.authenticated || user.value.allowed === false) {
    throw new Error('请先登录 GitHub 后再上传图片')
  }

  if (!isImageFile(file)) {
    throw new Error('只支持上传 png、jpg、jpeg、webp、gif、svg 图片')
  }

  if (file.size > maxImageBytes) {
    throw new Error('单张图片不能超过 4MB，建议压缩后再上传')
  }

  const dataUrl = await readFileAsDataUrl(file)
  const contentBase64 = dataUrl.split(',')[1] || ''
  const result = await requestJson('/api/github/asset', {
    method: 'PUT',
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      contentBase64
    })
  })

  return result.publicUrl
}

function isMarkdownFile(file: File) {
  return /\.(md|markdown|mdown)$/i.test(file.name) ||
    file.type === 'text/markdown' ||
    file.type === 'text/plain' ||
    file.type === ''
}

function isImageFile(file: File) {
  return /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.type) ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

function openImporter() {
  if (importing.value) return

  if (!showCreateTools.value) {
    setNotice('当前正在编辑已有文档。导入 Markdown 只用于新建文档，不会覆盖当前文档。')
    return
  }

  markdownInput.value?.click()
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
    hasSourcePath.value = false
    title.value = importedTitle
    slug.value = importedSlug
    categoryPrefix.value ||= categories[0].prefix
    content.value = ensureMarkdownTitle(rawContent, importedTitle)
    originalContent.value = ''
    importedFileName.value = file.name
    commitMessage.value = `docs: add ${importedSlug}`
    sha.value = ''
    loadedPath.value = ''
    lastCommitUrl.value = ''
    saveCompleted.value = false
    updateCreatePath()
    sideCollapsed.value = false
    setNotice(`已导入 ${file.name}，确认目录、文件名和标题后提交。`)
    void focusEditor()
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

  if (!file) return

  await importMarkdownFile(file)
}

async function handleImportDrop(event: DragEvent) {
  draggingImport.value = false

  if (!showCreateTools.value) return

  const file = event.dataTransfer?.files?.[0]

  if (!file) return

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
  if (!path.value || !user.value.authenticated) return

  loading.value = true
  setNotice('正在读取 GitHub 文档...')

  try {
    const file = await requestJson(`/api/github/file?path=${encodeURIComponent(path.value)}`)
    content.value = file.content || ''
    originalContent.value = content.value
    sha.value = file.sha || ''
    loadedPath.value = path.value
    mode.value = file.exists ? 'edit' : 'create'
    importedFileName.value = ''
    title.value = resolveImportedTitle(content.value, path.value.split('/').pop() || '新文档.md')

    if (!file.exists && !content.value) {
      buildTemplate(true)
      originalContent.value = content.value
    }

    setNotice(file.exists ? '文档已载入，可以编辑。' : '这是新文档，保存后会创建到仓库。')
    void focusEditor()
  } catch (err) {
    setError((err as Error).message)
  } finally {
    loading.value = false
  }
}

async function saveFile() {
  syncTitleFromContent(content.value)

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
    hasSourcePath.value = true
    originalContent.value = content.value
    clearDraft()
    setNotice('提交成功，正在返回文档页。新文档需要等待 Vercel 重新构建后才会显示最新内容。')
    scheduleRedirectToDoc()
  } catch (err) {
    setError((err as Error).message)
  } finally {
    saving.value = false
  }
}

function scheduleRedirectToDoc() {
  window.clearTimeout(redirectTimer)
  saveCompleted.value = true
  redirectTimer = window.setTimeout(() => {
    window.location.href = docViewUrl.value
  }, 1600)
}

function login() {
  syncTitleFromContent(content.value)
  saveDraftNow()

  const returnTo = `${window.location.pathname}${window.location.search}`

  window.location.href = `/api/github/oauth/start?returnTo=${encodeURIComponent(returnTo)}`
}

async function logout() {
  await requestJson('/api/github/logout', { method: 'POST' })
  user.value = { authenticated: false }
  setNotice('已退出 GitHub 登录。')
}

function applyTitleChange() {
  const nextTitle = normalizeTitle(title.value) || '新文档'

  title.value = nextTitle
  content.value = upsertMarkdownTitle(content.value, nextTitle)

  if (mode.value === 'create' && slug.value === 'new-note') {
    slug.value = normalizeSlug(nextTitle)
  }

  void focusEditor()
}

function switchToCreate(restoreDraft = false) {
  mode.value = 'create'
  hasSourcePath.value = false
  importedFileName.value = ''
  sha.value = ''
  loadedPath.value = ''
  lastCommitUrl.value = ''
  saveCompleted.value = false
  previewOpen.value = true
  sideCollapsed.value = false

  if (restoreDraft && restoreDraftState()) {
    updateCreatePath()
    setNotice('已恢复上次未提交的新建文档草稿。')
    void focusEditor()
    return
  }

  title.value = '新文档'
  slug.value = 'new-note'
  categoryPrefix.value = categories[0].prefix
  updateCreatePath()
  buildTemplate(true)
  originalContent.value = content.value
  commitMessage.value = `docs: add ${normalizeSlug(slug.value)}`
  void focusEditor()
}

function startNewDocument() {
  switchToCreate(false)
  clearDraft()
  setNotice('已切换到新建文档，选择目录和文件名后即可提交。')
}

function restoreDraftState() {
  if (typeof window === 'undefined') return false

  try {
    const raw = window.localStorage.getItem(draftKey)
    const draft = raw ? JSON.parse(raw) as Partial<DraftPayload> : null

    if (!draft?.content?.trim()) return false

    title.value = draft.title || resolveImportedTitle(draft.content, draft.slug || '新文档.md')
    slug.value = normalizeSlug(draft.slug || title.value)
    categoryPrefix.value = categories.some((item) => item.prefix === draft.categoryPrefix)
      ? String(draft.categoryPrefix)
      : categories[0].prefix
    content.value = draft.content
    originalContent.value = ''
    commitMessage.value = draft.commitMessage || `docs: add ${normalizeSlug(slug.value)}`
    importedFileName.value = draft.importedFileName || ''
    return true
  } catch {
    return false
  }
}

function saveDraftNow() {
  if (typeof window === 'undefined' || mode.value !== 'create' || saveCompleted.value) return

  const payload: DraftPayload = {
    title: title.value,
    slug: slug.value,
    categoryPrefix: categoryPrefix.value,
    content: content.value,
    commitMessage: commitMessage.value,
    importedFileName: importedFileName.value
  }

  window.localStorage.setItem(draftKey, JSON.stringify(payload))
}

function scheduleDraftSave() {
  if (!draftReady.value || mode.value !== 'create' || saveCompleted.value) return

  window.clearTimeout(draftTimer)
  draftTimer = window.setTimeout(saveDraftNow, 450)
}

function clearDraft() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(draftKey)
  }
}

onMounted(async () => {
  const search = new URLSearchParams(window.location.search)
  const sourcePath = search.get('path')
  const wantsImport = search.get('import') === '1'

  if (sourcePath) {
    path.value = sourcePath
    hasSourcePath.value = true
    mode.value = 'edit'
    sideCollapsed.value = true
    title.value = resolveImportedTitle('', path.value.split('/').pop() || '文档.md')
    originalContent.value = ''
  } else {
    switchToCreate(true)
  }

  await checkLogin()

  if (hasSourcePath.value && path.value) {
    if (user.value.authenticated) {
      await loadFile()
    } else {
      setNotice('登录 GitHub 后会自动读取当前文档内容。')
    }
  } else {
    void focusEditor()
  }

  if (wantsImport && !hasSourcePath.value) {
    sideCollapsed.value = false
    setNotice('请选择本地 Markdown 文件，确认目录和标题后提交。')
  }

  draftReady.value = true
})

onBeforeUnmount(() => {
  window.clearTimeout(redirectTimer)
  window.clearTimeout(draftTimer)
})

watch([categoryPrefix, slug], () => {
  if (mode.value === 'create') {
    updateCreatePath()
    commitMessage.value = `docs: add ${normalizeSlug(slug.value)}`
  }
})

watch(content, (nextContent) => {
  syncTitleFromContent(nextContent)

  if (nextContent !== originalContent.value) {
    saveCompleted.value = false
  }

  scheduleDraftSave()
})

watch([title, categoryPrefix, slug, commitMessage, importedFileName], scheduleDraftSave)
</script>

<template>
  <main class="doc-editor">
    <input
      ref="markdownInput"
      class="doc-editor__file-input"
      type="file"
      accept=".md,.markdown,.mdown,text/markdown,text/plain"
      @change="handleFileImport"
    />
    <input
      ref="imageInput"
      class="doc-editor__file-input"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
      @change="handleImageSelect"
    />

    <header class="doc-editor__topbar">
      <div class="doc-editor__doc-info">
        <a :href="withBase('/')" class="doc-editor__brand">Justin Docs</a>
        <span class="doc-editor__divider"></span>
        <span class="doc-editor__entry">{{ entryLabel }}</span>
        <input
          v-model="title"
          class="doc-editor__title-input"
          type="text"
          placeholder="未命名文档"
          @change="applyTitleChange"
        />
        <span class="doc-editor__sync-state">{{ statusText }}</span>
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
        <button v-if="showCreateTools" type="button" class="ghost" :disabled="importing" @click="openImporter">
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
      <aside class="doc-editor__rail" aria-label="写作快捷操作">
        <a :href="withBase('/')" title="返回首页">⌂</a>
        <button type="button" class="doc-editor__rail-primary" title="新建文档" @click="startNewDocument">+</button>
        <button v-if="showCreateTools" type="button" title="导入 Markdown" :disabled="importing" @click="openImporter">
          ↥
        </button>
        <button type="button" title="上传图片" :disabled="uploadingImage" @click="openImagePicker">图</button>
        <button type="button" title="文档设置" @click="sideCollapsed = !sideCollapsed">☰</button>
        <a :href="githubEditUrl" title="GitHub 网页编辑" target="_blank" rel="noreferrer">GH</a>
      </aside>

      <aside v-show="!sideCollapsed" class="doc-editor__side">
        <div class="doc-editor__side-panel">
          <div class="doc-editor__side-head">
            <strong>文档设置</strong>
            <button type="button" @click="sideCollapsed = true">收起</button>
          </div>

          <div class="doc-editor__entry-card">
            <span>{{ entryLabel }}</span>
            <strong>{{ isEditingCurrentDoc ? path : currentCategory }}</strong>
            <p>{{ entryDescription }}</p>
          </div>

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
          </template>

          <label>
            <span>文档路径</span>
            <input v-model="path" type="text" readonly />
          </label>

          <div
            v-if="showCreateTools"
            :class="['doc-editor__import', { dragging: draggingImport }]"
            @dragenter.prevent="draggingImport = true"
            @dragover.prevent="draggingImport = true"
            @dragleave.prevent="draggingImport = false"
            @drop.prevent="handleImportDrop"
          >
            <div>
              <strong>导入 Markdown</strong>
              <span v-if="importedFileName">{{ importedFileName }}</span>
              <span v-else>选择或拖入本地 .md 文件</span>
            </div>
            <button type="button" :disabled="importing" @click="openImporter">
              {{ importing ? '导入中...' : '选择文件' }}
            </button>
          </div>

          <details class="doc-editor__advanced">
            <summary>提交设置</summary>
            <label>
              <span>提交说明</span>
              <input v-model="commitMessage" type="text" placeholder="docs: update linux note" />
            </label>
          </details>

          <div class="doc-editor__side-actions">
            <button v-if="isEditingCurrentDoc" type="button" :disabled="loading || !user.authenticated" @click="loadFile">
              重新读取
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
          <div class="doc-editor__formatbar" aria-label="Markdown 工具栏">
            <button type="button" title="一级标题" @click="insertHeading(1)">H1</button>
            <button type="button" title="二级标题" @click="insertHeading(2)">H2</button>
            <button type="button" title="三级标题" @click="insertHeading(3)">H3</button>
            <button type="button" title="加粗" @click="wrapSelection('**', '**', '重点内容')">B</button>
            <button type="button" title="斜体" @click="wrapSelection('*', '*', '强调内容')">I</button>
            <button type="button" title="删除线" @click="wrapSelection('~~', '~~', '删除内容')">S</button>
            <button type="button" title="链接" @click="insertLink">链接</button>
            <button type="button" title="行内代码" @click="wrapSelection('`', '`', 'code')">`</button>
            <button type="button" title="代码块" @click="insertCodeBlock">代码</button>
            <button type="button" title="无序列表" @click="insertUnorderedList">无序</button>
            <button type="button" title="有序列表" @click="insertOrderedList">有序</button>
            <button type="button" title="任务列表" @click="insertTaskList">任务</button>
            <button type="button" title="表格" @click="insertTable">表格</button>
            <button type="button" title="引用" @click="insertQuote">引用</button>
            <button type="button" title="分割线" @click="insertHorizontalRule">分割线</button>
            <button type="button" title="图片" :disabled="uploadingImage" @click="openImagePicker">图片</button>
          </div>
          <div class="doc-editor__toolbar-actions">
            <button type="button" class="ghost" @click="previewOpen = !previewOpen">
              {{ previewOpen ? '隐藏预览' : '显示预览' }}
            </button>
            <button v-if="previewOpen" type="button" class="ghost" @click="previewFirst = !previewFirst">
              交换位置
            </button>
            <div class="doc-editor__quick-stats">
              <span>{{ editorStats.chars }} 字符</span>
              <span>{{ editorStats.lines }} 行</span>
              <span>{{ editorStats.headings }} 标题</span>
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

        <div v-if="needsLoginToLoad" class="doc-editor__login-panel">
          <strong>登录后编辑当前文档</strong>
          <span>{{ path }}</span>
          <button type="button" class="primary" :disabled="!apiReady" @click="login">
            GitHub 登录
          </button>
        </div>

        <div v-else :class="['doc-editor__workspace', { 'has-preview': previewOpen, 'preview-first': previewOpen && previewFirst }]">
          <section class="doc-editor__writer">
            <div class="doc-editor__pane-head doc-editor__writer-head">
              <strong>Markdown 编辑</strong>
              <span>支持粘贴图片、拖入图片、Ctrl/⌘ + S 提交</span>
            </div>
            <textarea
              ref="editorRef"
              v-model="content"
              class="doc-editor__textarea"
              spellcheck="false"
              placeholder="在这里写 Markdown 文档。可以粘贴图片、拖入图片，或用左侧导入本地 Markdown。"
              @blur="syncTitleFromContent(content)"
              @drop="handleEditorDrop"
              @paste="handleEditorPaste"
              @keydown="handleEditorKeydown"
            />
            <div class="doc-editor__drop-hint">
              Markdown 源文档会直接写入 GitHub。图片上传会先生成静态资源路径，提交文档后线上生效。
            </div>
          </section>

          <aside v-show="previewOpen" class="doc-editor__preview-panel">
            <div class="doc-editor__pane-head doc-editor__preview-head">
              <strong>实时预览</strong>
              <button type="button" @click="previewOpen = false">隐藏</button>
            </div>
            <article class="doc-editor__preview-body" v-html="previewHtml"></article>
          </aside>
        </div>

        <div class="doc-editor__footer">
          <span>{{ editorStats.words }} 词段</span>
          <a v-if="lastCommitUrl" :href="lastCommitUrl" target="_blank" rel="noreferrer">查看提交</a>
          <a :href="docViewUrl">查看当前文档</a>
          <a :href="withBase('/')">返回首页</a>
        </div>
      </section>
    </section>
  </main>
</template>
