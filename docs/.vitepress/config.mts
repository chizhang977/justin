import { defineConfig } from 'vitepress'
import  navbar  from './nav.ts'
import  sidebar  from './sidebar.ts'
export default defineConfig({
  
  base: '/doc',
  lang: 'en-US',
  title: "成的技术航行记",
  description: "全栈深入探索",


  vite: {
    // Vite 配置选项
  },

  // markdown配置
  markdown: {
    
  },

  vue: {
    // @vitejs/plugin-vue 选项
  },
  

  srcDir: './src',



  // appearance: 'dark',
  lastUpdated: true,
  themeConfig: {    
    logo: '/logo.svg',
    // siteTitle: 'Hello World',

    outline: [2, 3],
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    lastUpdated: {
      text: '最后更新于:',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },

  
    nav: navbar,
    sidebar: sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chizhang977/docs' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present chizhang977'
    },
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '在Github上编辑此页'
    }
  }
})
