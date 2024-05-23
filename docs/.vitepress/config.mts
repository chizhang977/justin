import { defineConfig } from 'vitepress'
import  navbar  from './nav.ts'
import  sidebar  from './sidebar.ts'
export default defineConfig({

  
  base: '/justin/',
  lang: 'en-US',
  title: "成的技术航行记",
  description: "全栈深入探索",
  head: [
    ['link', { rel: 'icon', href: '/justin/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
  ],

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
    //广告   
    // carbonAds: {
    //   code: 'your-carbon-code',
    //   placement: 'your-carbon-placement'
    // },


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
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    
    nav: navbar,
    sidebar: sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chizhang977' },
      {
        icon: {
          svg: '<svg t="1715074198762" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5234" width="200" height="200"><path d="M512 1024C229.234 1024 0 794.766 0 512S229.234 0 512 0s512 229.234 512 512-229.234 512-512 512z m259.157-568.889l-290.759 0.014c-13.966 0-25.287 11.321-25.287 25.273l-0.028 63.218c0 13.966 11.306 25.287 25.273 25.287H657.38c13.966 0 25.287 11.307 25.287 25.273v12.644a75.847 75.847 0 0 1-75.847 75.847H366.606a25.287 25.287 0 0 1-25.287-25.273v-240.2a75.847 75.847 0 0 1 75.847-75.846l353.92-0.015c13.966 0 25.273-11.306 25.287-25.273l0.071-63.189c0-13.966-11.306-25.287-25.272-25.301l-353.992 0.014c-104.718-0.014-189.624 84.892-189.624 189.61v353.963c0 13.967 11.32 25.287 25.287 25.287h372.935c94.265 0 170.666-76.401 170.666-170.666v-145.38c0-13.952-11.32-25.273-25.287-25.273z" p-id="5235"></path></svg>'
        },
        link: 'https://gitee.com/boycheng',
        // 也可以为无障碍添加一个自定义标签 (可选但推荐):
        ariaLabel: 'cool link'
      }
      
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present chizhang977'
    },
    editLink: {
      pattern: 'https://github.com/chizhang977/justin/tree/master/docs/src/:path',
      text: '😁我要纠错'
    },
    sitemap: {
      hostname: 'https://chizhang977.github.io/justin/'
    },
    
  }
})
