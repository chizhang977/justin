import { defineConfig } from 'vitepress'
import navbar from './nav'
import sidebar from './sidebar'

const isVercel = process.env.VERCEL === '1'
const base = process.env.VITEPRESS_BASE ?? (isVercel ? '/' : '/justin/')
const siteUrl = isVercel && process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://chizhang977.github.io/justin/'

const withBase = (path: string) => `${base}${path.replace(/^\//, '')}`

function stripCopiedLineNumbers(code: string) {
  const lines = code.split(/\r?\n/)
  const hasTrailingLine = lines.length > 0 && lines[lines.length - 1] === ''
  const checkLines = hasTrailingLine ? lines.slice(0, -1) : lines

  if (checkLines.length < 3) {
    return code
  }

  const numbered = checkLines.every((line, index) => {
    const expected = String(index + 1)
    const looksLikeMarkdownList = line.startsWith(`${expected}.`) ||
      line.startsWith(`${expected})`) ||
      line.startsWith(`${expected}、`)

    return !looksLikeMarkdownList && (line === expected || line.startsWith(expected))
  })

  if (!numbered) {
    return code
  }

  const cleaned = checkLines.map((line, index) => {
    const prefixLength = String(index + 1).length

    return line.slice(prefixLength).replace(/^\s?/, '')
  })

  return `${cleaned.join('\n')}${hasTrailingLine ? '\n' : ''}`
}

export default defineConfig({
  base,
  srcDir: './src',
  lang: 'zh-CN',
  title: 'Justin 技术文档库',
  description: '面向求职与生产实践的个人技术文档库',
  appearance: false,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: withBase('/favicon.ico') }],
    ['meta', { name: 'theme-color', content: '#0f766e' }],
    ['meta', { name: 'author', content: 'chizhang977' }],
    [
      'script',
      {},
      `;(() => {
        const mode = localStorage.getItem('justin-docs-mode-v2') || 'dark'
        const accent = localStorage.getItem('justin-docs-accent-v2') || 'blue'
        document.documentElement.classList.toggle('dark', mode === 'dark')
        document.documentElement.dataset.accent = accent
      })()`
    ]
  ],

  markdown: {
    lineNumbers: false,
    config(md) {
      md.core.ruler.after('block', 'strip_copied_line_numbers', (state) => {
        for (const token of state.tokens) {
          if (token.type === 'fence') {
            token.content = stripCopiedLineNumbers(token.content)
          }
        }
      })
    }
  },

  sitemap: {
    hostname: siteUrl
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Justin Docs',
    outline: {
      level: [2, 4],
      label: '本文目录'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    nav: navbar,
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chizhang977' }
    ],
    footer: {
      message: '以工程实践沉淀知识，以文档复盘成长。',
      copyright: 'Copyright © 2024-present chizhang977'
    },
    editLink: {
      pattern: 'https://github.com/chizhang977/justin/edit/master/docs/src/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
})
