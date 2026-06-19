<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const palettes = [
  { name: 'blue', label: '蓝色', color: '#2563eb' },
  { name: 'teal', label: '青绿', color: '#0f766e' },
  { name: 'orange', label: '橙色', color: '#ea580c' },
  { name: 'slate', label: '石墨', color: '#475569' }
]

const activeAccent = ref('blue')
const activeMode = ref<'light' | 'dark'>('dark')
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const activePalette = computed(() => {
  return palettes.find((palette) => palette.name === activeAccent.value) || palettes[0]
})

function applyAccent(name: string) {
  activeAccent.value = name
  document.documentElement.dataset.accent = name
  localStorage.setItem('justin-docs-accent-v2', name)
}

function applyMode(mode: 'light' | 'dark') {
  activeMode.value = mode
  document.documentElement.classList.toggle('dark', mode === 'dark')
  localStorage.setItem('justin-docs-mode-v2', mode)
}

function closeOnOutsideClick(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  applyAccent(localStorage.getItem('justin-docs-accent-v2') || 'blue')
  applyMode((localStorage.getItem('justin-docs-mode-v2') as 'light' | 'dark') || 'dark')
  window.addEventListener('click', closeOnOutsideClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeOnOutsideClick)
})
</script>

<template>
  <div ref="root" class="theme-palette compact" aria-label="主题设置">
    <button
      class="theme-palette__trigger"
      type="button"
      title="主题设置"
      aria-label="主题设置"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <span class="theme-palette__trigger-dot" :style="{ '--swatch-color': activePalette.color }" />
      <span class="theme-palette__trigger-mode" :class="activeMode" />
    </button>

    <div v-if="open" class="theme-palette__panel compact" @click.stop>
      <div class="theme-palette__segmented" aria-label="显示模式">
        <button
          type="button"
          :class="{ active: activeMode === 'light' }"
          @click="applyMode('light')"
        >
          浅色
        </button>
        <button
          type="button"
          :class="{ active: activeMode === 'dark' }"
          @click="applyMode('dark')"
        >
          深色
        </button>
      </div>

      <div class="theme-palette__swatches compact">
        <button
          v-for="palette in palettes"
          :key="palette.name"
          class="theme-palette__swatch"
          :class="{ active: activeAccent === palette.name }"
          :style="{ '--swatch-color': palette.color }"
          type="button"
          :title="palette.label"
          :aria-label="`切换为${palette.label}主题`"
          @click="applyAccent(palette.name)"
        />
      </div>
    </div>
  </div>
</template>
