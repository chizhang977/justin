<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import 'vditor/dist/index.css'

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

type VditorInstance = {
  getValue(): string
  setValue(markdown: string, clearStack?: boolean): void
  insertValue(markdown: string, render?: boolean): void
  focus(): void
  blur(): void
  destroy(): void
  setTheme(theme: 'classic' | 'dark', contentTheme?: string, codeTheme?: string, contentThemePath?: string): void
  tip?: {
    show(text: string, timeout?: number): void
  }
}

type VditorConstructor = new (element: HTMLElement, options: Record<string, any>) => VditorInstance

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

const draftKey = 'justin-docs-online-writer-draft-v4'
const maxImportBytes = 3 * 1024 * 1024
const maxImageBytes = 4 * 1024 * 1024

const user = ref<UserInfo>({ authenticated: false })
const mode = ref<WriterMode>('create')
const sideCollapsed = ref(true)
const markdownInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const editorHost = ref<HTMLDivElement | null>(null)
const editor = ref<VditorInstance | null>(null)
const editorReady = ref(false)
const editorLoading = ref(false)
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
let themeObserver: MutationObserver | undefined

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
  return '创建新技术笔记，选择目录和文件名后提交到仓库。'
})

const statusText = computed(() => {
  if (saving.value) return '提交中'
  if (uploadingImage.value) return '上传图片'
  if (loading.value) return '读取中'
  if (editorLoading.value) return '编辑器加载中'
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

function buildTemplate() {
  const docTitle = title.value.trim() || '新文档'

  return `# ${docTitle}

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

function setNotice(message: string) {
  notice.value = message
  error.value = ''
}

function setError(message: string) {
  error.value = message
  notice.value = ''
}

function updateCreatePath() {
  path.value = `${categoryPrefix.value}${normalizeSlug(slug.value)}.md`
  sha.value = ''
}

function isDarkTheme() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

function applyEditorTheme() {
  if (!editor.value) return

  const dark = isDarkTheme()

  editor.value.setTheme(
    dark ? 'dark' : 'classic',
    dark ? 'dark' : 'light',
    dark ? 'native' : 'github'
  )
}

function setEditorContent(markdown: string, clearStack = false) {
  content.value = markdown

  if (editor.value && editorReady.value && editor.value.getValue() !== markdown) {
    editor.value.setValue(markdown, clearStack)
  }
}

function getEditorContent() {
  const latest = editor.value?.getValue() ?? content.value

  if (latest !== content.value) {
    content.value = latest
  }

  return latest
}

async function focusEditor() {
  await nextTick()
  editor.value?.focus()
}

function openImporter() {
  if (!showCreateTools.value) {
    setError('编辑当前文档时不能导入为新文档，请从首页新建文档后再导入。')
    return
  }

  markdownInput.value?.click()
}

function openImagePicker() {
  if (!user.value.authenticated) {
    setError('请先登录 GitHub 后再上传图片。')
    return
  }

  imageInput.value?.click()
}

function isMarkdownFile(file: File) {
  return /\.(md|markdown|mdown)$/i.test(file.name) ||
    ['text/markdown', 'text/plain', ''].includes(file.type)
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取文件失败'))
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

async function importMarkdownFile(file: File) {
  if (!isMarkdownFile(file)) {
    setError('只能导入 .md、.markdown 或 .mdown 文件。')
    return
  }

  if (file.size > maxImportBytes) {
    setError('Markdown 文件不能超过 3MB。')
    return
  }

  importing.value = true

  try {
    const markdown = await readFileAsText(file)
    const nextTitle = resolveImportedTitle(markdown, file.name)

    mode.value = 'create'
    hasSourcePath.value = false
    importedFileName.value = file.name
    title.value = nextTitle
    slug.value = normalizeSlug(filenameWithoutMarkdownExt(file.name) || nextTitle)
    sha.value = ''
    loadedPath.value = ''
    lastCommitUrl.value = ''
    saveCompleted.value = false
    sideCollapsed.value = false
    updateCreatePath()
    setEditorContent(ensureMarkdownTitle(markdown, nextTitle), true)
    originalContent.value = ''
    setNotice(`已导入 ${file.name}，确认目录、文件名和标题后提交。`)
    await focusEditor()
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

function isSupportedImage(file: File) {
  return /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.type) ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)
}

async function uploadImageFile(file: File) {
  if (!user.value.authenticated) {
    throw new Error('请先登录 GitHub 后再上传图片。')
  }

  if (!isSupportedImage(file)) {
    throw new Error('只支持上传 png、jpg、jpeg、webp、gif、svg 图片。')
  }

  if (file.size > maxImageBytes) {
    throw new Error('单张图片不能超过 4MB。')
  }

  const dataUrl = await readFileAsDataUrl(file)

  return requestJson('/api/github/asset', {
    method: 'PUT',
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      dataUrl
    })
  }) as Promise<{ publicUrl: string }>
}

async function uploadImages(files: File[]) {
  if (!files.length) return

  uploadingImage.value = true

  try {
    const markdown: string[] = []

    for (const file of files) {
      const result = await uploadImageFile(file)
      const alt = filenameWithoutMarkdownExt(file.name) || 'image'

      markdown.push(`![${alt}](${result.publicUrl})`)
    }

    if (markdown.length) {
      editor.value?.insertValue(`${markdown.join('\n\n')}\n`, true)
      content.value = editor.value?.getValue() || content.value
      setNotice(`已上传 ${markdown.length} 张图片。提交文档后线上内容会引用这些图片。`)
    }
  } finally {
    uploadingImage.value = false
  }
}

async function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  input.value = ''

  if (!files.length) return

  try {
    await uploadImages(files)
  } catch (err) {
    setError((err as Error).message)
  }
}

async function handleVditorUpload(files: File[]) {
  try {
    await uploadImages(files)
    return null
  } catch (err) {
    const message = (err as Error).message

    setError(message)
    return message
  }
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
    const nextContent = file.content || ''

    setEditorContent(nextContent, true)
    originalContent.value = nextContent
    sha.value = file.sha || ''
    loadedPath.value = path.value
    mode.value = file.exists ? 'edit' : 'create'
    importedFileName.value = ''
    title.value = resolveImportedTitle(nextContent, path.value.split('/').pop() || '新文档.md')

    if (!file.exists && !nextContent) {
      const template = buildTemplate()

      setEditorContent(template, true)
      originalContent.value = template
    }

    setNotice(file.exists ? '文档已载入，可以编辑。' : '这是新文档，保存后会创建到仓库。')
    await focusEditor()
  } catch (err) {
    setError((err as Error).message)
  } finally {
    loading.value = false
  }
}

async function saveFile() {
  const latest = mode.value === 'create'
    ? ensureMarkdownTitle(getEditorContent(), title.value)
    : getEditorContent()

  setEditorContent(latest)
  syncTitleFromContent(latest)

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
        content: latest,
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
    originalContent.value = latest
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
  content.value = getEditorContent()
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
  setEditorContent(upsertMarkdownTitle(getEditorContent(), nextTitle))

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
  const template = buildTemplate()

  setEditorContent(template, true)
  originalContent.value = template
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
    setEditorContent(draft.content, true)
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
    content: getEditorContent(),
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

async function initEditor() {
  if (!editorHost.value || editor.value || needsLoginToLoad.value) return

  editorLoading.value = true

  try {
    const { default: Vditor } = await import('vditor') as { default: VditorConstructor }
    const dark = isDarkTheme()

    editor.value = new Vditor(editorHost.value, {
      value: content.value,
      mode: 'ir',
      lang: 'zh_CN',
      icon: 'ant',
      theme: dark ? 'dark' : 'classic',
      width: '100%',
      height: '100%',
      minHeight: 420,
      cache: {
        enable: false
      },
      counter: {
        enable: true,
        type: 'markdown'
      },
      toolbarConfig: {
        pin: true
      },
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'line',
        'quote',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'code',
        'inline-code',
        'link',
        'table',
        'upload',
        '|',
        'undo',
        'redo',
        '|',
        'edit-mode',
        'both',
        'preview',
        'fullscreen',
        'outline'
      ],
      preview: {
        delay: 300,
        maxWidth: 920,
        mode: 'both',
        theme: {
          current: dark ? 'dark' : 'light'
        },
        hljs: {
          enable: true,
          lineNumber: false,
          style: dark ? 'native' : 'github'
        },
        markdown: {
          toc: true,
          footnotes: true,
          mark: true,
          codeBlockPreview: true,
          mathBlockPreview: true
        }
      },
      upload: {
        accept: 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml',
        multiple: true,
        handler: handleVditorUpload
      },
      input(value: string) {
        content.value = value
        syncTitleFromContent(value)
      },
      blur(value: string) {
        content.value = value
        syncTitleFromContent(value)
      },
      keydown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault()
          void saveFile()
        }
      },
      after() {
        editorReady.value = true
        editorLoading.value = false
        applyEditorTheme()
        void focusEditor()
      }
    })
  } catch (err) {
    editorLoading.value = false
    setError(`编辑器加载失败：${(err as Error).message}`)
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
  await nextTick()
  await initEditor()

  if (hasSourcePath.value && path.value) {
    if (user.value.authenticated) {
      await loadFile()
    } else {
      setNotice('登录 GitHub 后会自动读取当前文档内容。')
    }
  } else {
    await focusEditor()
  }

  if (wantsImport && !hasSourcePath.value) {
    sideCollapsed.value = false
    setNotice('请选择本地 Markdown 文件，确认目录和标题后提交。')
  }

  themeObserver = new MutationObserver(applyEditorTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  draftReady.value = true
})

onBeforeUnmount(() => {
  window.clearTimeout(redirectTimer)
  window.clearTimeout(draftTimer)
  themeObserver?.disconnect()
  editor.value?.destroy()
})

watch([categoryPrefix, slug], () => {
  if (mode.value === 'create') {
    updateCreatePath()
    commitMessage.value = `docs: add ${normalizeSlug(slug.value)}`
  }
})

watch(content, (nextContent) => {
  if (editor.value && editorReady.value && editor.value.getValue() !== nextContent) {
    editor.value.setValue(nextContent)
  }

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
      multiple
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
        <a :href="withBase('/')" title="返回首页">首页</a>
        <button type="button" class="doc-editor__rail-primary" title="新建文档" @click="startNewDocument">+</button>
        <button v-if="showCreateTools" type="button" title="导入 Markdown" :disabled="importing" @click="openImporter">
          导入
        </button>
        <button type="button" title="上传图片" :disabled="uploadingImage" @click="openImagePicker">图片</button>
        <button type="button" title="文档设置" @click="sideCollapsed = !sideCollapsed">设置</button>
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

        <div v-else class="doc-editor__workspace is-vditor">
          <div class="doc-editor__vditor-card">
            <div class="doc-editor__vditor-head">
              <div>
                <strong>Markdown 写作器</strong>
                <span>默认即时渲染，工具栏可切换所见即所得、分屏预览、全屏和大纲。</span>
              </div>
              <div class="doc-editor__quick-stats">
                <span>{{ editorStats.chars }} 字符</span>
                <span>{{ editorStats.lines }} 行</span>
                <span>{{ editorStats.headings }} 标题</span>
              </div>
            </div>
            <div ref="editorHost" class="doc-editor__vditor"></div>
            <div v-if="editorLoading" class="doc-editor__editor-loading">正在加载编辑器...</div>
          </div>
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
