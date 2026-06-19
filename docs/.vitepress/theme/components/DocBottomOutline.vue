<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()

const headings = computed(() => {
  const headers = page.value.headers || []

  return headers
    .filter((heading: any) => heading.level === 2 || heading.level === 3)
    .map((heading: any, index: number) => {
      const link = heading.link || (heading.slug ? `#${heading.slug}` : '')

      return {
        index: String(index + 1).padStart(2, '0'),
        level: heading.level,
        link,
        title: String(heading.title || '').replace(/<[^>]+>/g, '')
      }
    })
    .filter((heading) => heading.link && heading.title)
    .slice(0, 20)
})

const shouldShow = computed(() => {
  const pageClass = String(frontmatter.value.pageClass || '')

  return !pageClass.includes('home-workbench-page') &&
    !pageClass.includes('doc-editor-page') &&
    headings.value.length > 1
})
</script>

<template>
  <section v-if="shouldShow" class="doc-bottom-outline" aria-label="本文章节">
    <div class="doc-bottom-outline__head">
      <span>本文脉络</span>
      <strong>{{ page.title }}</strong>
    </div>
    <div class="doc-bottom-outline__grid">
      <a
        v-for="heading in headings"
        :key="heading.link"
        :class="['doc-bottom-outline__item', `level-${heading.level}`]"
        :href="heading.link"
      >
        <span>{{ heading.index }}</span>
        <strong>{{ heading.title }}</strong>
      </a>
    </div>
  </section>
</template>
