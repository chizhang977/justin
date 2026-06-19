<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const progress = ref(0)

function updateProgress() {
  const root = document.documentElement
  const max = root.scrollHeight - root.clientHeight

  progress.value = max <= 0 ? 0 : Math.min(100, Math.max(0, (root.scrollTop / max) * 100))
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
})
</script>

<template>
  <div class="reading-progress" aria-hidden="true">
    <span :style="{ transform: `scaleX(${progress / 100})` }" />
  </div>
</template>
