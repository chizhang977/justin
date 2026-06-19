import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomeWorkbench from './components/HomeWorkbench.vue'
import DocEditor from './components/DocEditor.vue'
import ThemePalette from './components/ThemePalette.vue'
import DocReadingMeta from './components/DocReadingMeta.vue'
import DocBottomOutline from './components/DocBottomOutline.vue'
import CodeCopyEnhancer from './components/CodeCopyEnhancer.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-top': () => h(ReadingProgress),
    'nav-bar-content-after': () => h(ThemePalette),
    'doc-before': () => h(DocReadingMeta),
    'doc-after': () => h(DocBottomOutline),
    'layout-bottom': () => h(CodeCopyEnhancer)
  }),
  enhanceApp({ app }) {
    app.component('HomeWorkbench', HomeWorkbench)
    app.component('DocEditor', DocEditor)
  }
} satisfies Theme
