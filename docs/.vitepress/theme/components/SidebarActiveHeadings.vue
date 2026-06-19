<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, frontmatter } = useData()
const route = useRoute()
const markerClass = 'sidebar-active-headings'
let ticking = false
let rendering = false
let renderTimer: number | undefined
let observer: MutationObserver | undefined

const pageHeadings = computed(() => {
  return (page.value.headers || [])
    .filter((heading: any) => heading.level >= 2 && heading.level <= 4)
    .map((heading: any) => {
      const link = heading.link || (heading.slug ? `#${heading.slug}` : '')

      return {
        level: heading.level,
        link,
        title: String(heading.title || '').replace(/<[^>]+>/g, '')
      }
    })
    .filter((heading) => heading.link && heading.title)
    .slice(0, 40)
})

const shouldShow = computed(() => {
  const pageClass = String(frontmatter.value.pageClass || '')
  const path = normalizePath(route.path)

  return path.includes('/docs/') &&
    !pageClass.includes('home-workbench-page') &&
    !pageClass.includes('doc-editor-page') &&
    collectHeadings().length > 0
})

function normalizePath(value: string) {
  let path = value

  try {
    path = new URL(value, window.location.origin).pathname
  } catch {
    path = value
  }

  try {
    path = decodeURIComponent(path)
  } catch {
    // Keep the original value when a path cannot be decoded.
  }

  return path
    .replace(/\/index(?:\.html)?$/i, '/')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '')
}

function collectHeadings() {
  if (pageHeadings.value.length > 0) {
    return pageHeadings.value
  }

  return Array.from(document.querySelectorAll<HTMLElement>('.vp-doc h2[id], .vp-doc h3[id], .vp-doc h4[id]'))
    .map((element) => ({
      level: Number(element.tagName.slice(1)),
      link: `#${element.id}`,
      title: element.textContent?.replace('#', '').trim() || ''
    }))
    .filter((heading) => heading.link && heading.title)
    .slice(0, 40)
}

function removeInjectedHeadings() {
  document.querySelectorAll(`.${markerClass}`).forEach((element) => {
    element.remove()
  })
}

function getHeadingElement(link: string) {
  const id = link.startsWith('#') ? link.slice(1) : ''

  if (!id) {
    return null
  }

  try {
    return document.getElementById(decodeURIComponent(id)) || document.getElementById(id)
  } catch {
    return document.getElementById(id)
  }
}

function resolveActiveHeading() {
  const headings = collectHeadings()

  if (!shouldShow.value || headings.length === 0) {
    return ''
  }

  const offset = 104
  let active = headings[0].link

  for (const heading of headings) {
    const element = getHeadingElement(heading.link)

    if (!element) {
      continue
    }

    if (element.getBoundingClientRect().top <= offset) {
      active = heading.link
    } else {
      break
    }
  }

  return active
}

function syncActiveHeading() {
  ticking = false
  const active = resolveActiveHeading()

  document.querySelectorAll<HTMLAnchorElement>(`.${markerClass}__link`).forEach((link) => {
    link.classList.toggle('active', Boolean(active) && link.getAttribute('href') === active)
  })
}

function requestActiveSync() {
  if (ticking) {
    return
  }

  ticking = true
  window.requestAnimationFrame(syncActiveHeading)
}

function findActiveSidebarItem() {
  const activeByClass = document.querySelector<HTMLElement>('.VPSidebarItem.is-link.is-active')

  if (activeByClass) {
    return activeByClass
  }

  const routePath = normalizePath(route.path)
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.VPSidebar .VPSidebarItem.is-link a[href]'))

  for (const link of links) {
    const linkPath = normalizePath(link.getAttribute('href') || link.href)

    if (linkPath === routePath || routePath.endsWith(linkPath) || linkPath.endsWith(routePath)) {
      return link.closest<HTMLElement>('.VPSidebarItem.is-link')
    }
  }

  return null
}

function createHeadingLink(heading: { level: number; link: string; title: string }) {
  const link = document.createElement('a')

  link.className = `${markerClass}__link level-${heading.level}`
  link.href = heading.link
  link.textContent = heading.title

  return link
}

function renderSidebarHeadings() {
  if (rendering) {
    return
  }

  rendering = true
  observer?.disconnect()
  removeInjectedHeadings()

  if (!shouldShow.value) {
    finishRender()
    return
  }

  const activeDoc = findActiveSidebarItem()
  const headings = collectHeadings()

  if (!activeDoc || headings.length === 0) {
    finishRender()
    return
  }

  const nav = document.createElement('nav')
  nav.className = markerClass
  nav.setAttribute('aria-label', '当前文档标题')

  const list = document.createElement('div')
  list.className = `${markerClass}__list`

  headings.forEach((heading) => {
    list.appendChild(createHeadingLink(heading))
  })

  nav.appendChild(list)
  activeDoc.querySelector(':scope > .item')?.after(nav)
  requestActiveSync()
  finishRender()
}

function finishRender() {
  rendering = false
  window.setTimeout(observeSidebar, 0)
}

async function scheduleRender() {
  window.clearTimeout(renderTimer)
  await nextTick()
  window.requestAnimationFrame(renderSidebarHeadings)
  renderTimer = window.setTimeout(renderSidebarHeadings, 140)
}

function scheduleRenderSeries() {
  scheduleRender()
  window.setTimeout(scheduleRender, 280)
  window.setTimeout(scheduleRender, 700)
}

function observeSidebar() {
  observer?.disconnect()

  const sidebar = document.querySelector('.VPSidebar')

  if (!sidebar) {
    return
  }

  observer = new MutationObserver(() => {
    if (!rendering) {
      scheduleRender()
    }
  })
  observer.observe(sidebar, {
    childList: true,
    subtree: true
  })
}

onMounted(() => {
  scheduleRenderSeries()
  observeSidebar()
  window.setTimeout(observeSidebar, 300)
  window.addEventListener('scroll', requestActiveSync, { passive: true })
  window.addEventListener('resize', requestActiveSync)
})

onBeforeUnmount(() => {
  window.clearTimeout(renderTimer)
  observer?.disconnect()
  removeInjectedHeadings()
  window.removeEventListener('scroll', requestActiveSync)
  window.removeEventListener('resize', requestActiveSync)
})

watch(
  () => [route.path, pageHeadings.value.map((heading) => heading.link).join('|')],
  () => {
    scheduleRenderSeries()
    window.setTimeout(observeSidebar, 180)
  }
)
</script>

<template>
  <span hidden />
</template>
