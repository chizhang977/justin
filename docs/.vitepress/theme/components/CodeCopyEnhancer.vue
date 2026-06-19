<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const toast = ref('')
let toastTimer: number | undefined

function stripSequentialLineNumbers(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const hasTrailingLine = lines.length > 0 && lines[lines.length - 1] === ''
  const checkLines = hasTrailingLine ? lines.slice(0, -1) : lines

  if (checkLines.length < 3) {
    return text
  }

  const numbered = checkLines.every((line, index) => {
    const expected = String(index + 1)
    const looksLikeMarkdownList = line.startsWith(`${expected}.`) ||
      line.startsWith(`${expected})`) ||
      line.startsWith(`${expected}、`)

    return !looksLikeMarkdownList && (line === expected || line.startsWith(expected))
  })

  if (!numbered) {
    return text
  }

  const cleaned = checkLines.map((line, index) => {
    const prefixLength = String(index + 1).length

    return line.slice(prefixLength).replace(/^\s?/, '')
  })

  return `${cleaned.join('\n')}${hasTrailingLine ? '\n' : ''}`
}

function extractCode(block: HTMLElement) {
  const lines = Array.from(block.querySelectorAll<HTMLElement>('pre code .line'))

  if (lines.length > 0) {
    return lines.map((line) => line.innerText).join('\n')
  }

  return block.querySelector('pre code')?.textContent || ''
}

async function copyCode(block: HTMLElement) {
  const code = stripSequentialLineNumbers(extractCode(block)).replace(/\n$/, '')

  await writeClipboard(code)
  showToast('已复制干净代码')
}

async function writeClipboard(code: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(code)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = code
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function showToast(message: string) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1600)
}

function bindCopyButtons() {
  document.querySelectorAll<HTMLElement>('.vp-doc div[class*="language-"]').forEach((block) => {
    const button = block.querySelector<HTMLButtonElement>('button.copy')

    if (!button || button.dataset.cleanCopy === 'true') {
      return
    }

    button.dataset.cleanCopy = 'true'
    button.title = '复制代码'
    button.setAttribute('aria-label', '复制代码')
    button.addEventListener('click', async (event) => {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      try {
        await copyCode(block)
      } catch {
        showToast('复制失败，请手动选择')
      }
    }, true)
  })
}

function handleManualCopy(event: ClipboardEvent) {
  const selection = window.getSelection()

  if (!selection || selection.isCollapsed || !event.clipboardData) {
    return
  }

  const anchorNode = selection.anchorNode
  const focusNode = selection.focusNode
  const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement
  const focusElement = focusNode instanceof Element ? focusNode : focusNode?.parentElement
  const anchorBlock = anchorElement?.closest('.vp-doc div[class*="language-"]')
  const focusBlock = focusElement?.closest('.vp-doc div[class*="language-"]')

  if (!anchorBlock || anchorBlock !== focusBlock) {
    return
  }

  const cleaned = stripSequentialLineNumbers(selection.toString())

  event.clipboardData.setData('text/plain', cleaned)
  event.preventDefault()
  showToast('已复制干净代码')
}

onMounted(() => {
  bindCopyButtons()
  document.addEventListener('copy', handleManualCopy, true)
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
  document.removeEventListener('copy', handleManualCopy, true)
})

watch(() => route.path, async () => {
  await nextTick()
  bindCopyButtons()
})
</script>

<template>
  <div v-if="toast" class="code-copy-toast" role="status">{{ toast }}</div>
</template>
