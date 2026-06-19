<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
const apiReady = ref(true)
const loading = ref(false)
const saving = ref(false)
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
    setNotice('提交成功，Vercel/GitHub Pages 重新构建后线上会更新。')
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
        <div v-if="notice || error" :class="['doc-editor__message', { error }]">
          {{ error || notice }}
        </div>

        <textarea
          v-model="content"
          spellcheck="false"
          placeholder="在这里写 Markdown 文档..."
        />

        <div class="doc-editor__footer">
          <span>{{ content.length }} 字符</span>
          <span>{{ content.split('\n').length }} 行</span>
          <a v-if="lastCommitUrl" :href="lastCommitUrl" target="_blank" rel="noreferrer">查看提交</a>
          <a :href="withBase('/')" target="_blank">返回首页</a>
        </div>
      </section>
    </section>
  </main>
</template>
