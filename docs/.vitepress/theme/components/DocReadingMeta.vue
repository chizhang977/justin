<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

const { page, frontmatter } = useData()
const route = useRoute()
const wordCount = ref(0)

const category = computed(() => {
  const path = route.path

  if (path.includes('/docs/linux/linux/')) return 'Linux'
  if (path.includes('/docs/db/mysql/')) return 'MySQL'
  if (path.includes('/docs/db/redis/')) return 'Redis'
  if (path.includes('/docs/linux/docker/')) return 'Docker'
  if (path.includes('/docs/linux/k8s/')) return 'Kubernetes'
  if (path.includes('/docs/linux/nginx/')) return 'Nginx'
  if (path.includes('/docs/devops/')) return 'DevOps'
  if (path.includes('/docs/java/')) return 'Java'
  if (path.includes('/docs/front/')) return 'Frontend'
  if (path.includes('/docs/method/')) return 'Method'

  return 'Docs'
})

const headingsCount = computed(() => {
  return (page.value.headers || []).filter((heading: any) => heading.level === 2 || heading.level === 3).length
})

const readingMinutes = computed(() => Math.max(1, Math.ceil(wordCount.value / 420)))

const updatedAt = computed(() => {
  const lastUpdated = page.value.lastUpdated

  if (!lastUpdated) {
    return '持续维护'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(lastUpdated)
})

const shouldShow = computed(() => {
  const pageClass = String(frontmatter.value.pageClass || '')

  return !pageClass.includes('home-workbench-page') &&
    !pageClass.includes('doc-editor-page') &&
    Boolean(page.value.title)
})

const sourcePath = computed(() => {
  const routePath = route.path
    .replace(/^\//, '')
    .replace(/\.html$/, '')

  if (!routePath) {
    return 'docs/src/index.md'
  }

  if (routePath.endsWith('/')) {
    return `docs/src/${routePath}index.md`
  }

  return `docs/src/${routePath}.md`
})

const writeUrl = computed(() => {
  return withBase(`/write?path=${encodeURIComponent(sourcePath.value)}`)
})

function updateWordCount() {
  const doc = document.querySelector<HTMLElement>('.vp-doc')
  const text = doc?.innerText || ''

  wordCount.value = text.replace(/\s+/g, '').length
}

onMounted(() => {
  updateWordCount()
})

watch(() => route.path, async () => {
  await nextTick()
  updateWordCount()
})
</script>

<template>
  <section v-if="shouldShow" class="doc-reading-meta" aria-label="文章信息">
    <span>{{ category }}</span>
    <span>约 {{ readingMinutes }} 分钟</span>
    <span>{{ headingsCount }} 个小节</span>
    <span>更新于 {{ updatedAt }}</span>
    <a :href="writeUrl">在线编辑</a>
  </section>
</template>
