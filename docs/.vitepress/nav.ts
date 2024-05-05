// vitepress导航栏的配置
export default [
    { text: '首页', link: '/' },
    {
        text: '前端',
        items: [
          {
            text: 'javascript',
            items: [
                { text: '', link: '...' },
            ],
          }, 
          {
            text: 'typescript',
            items: [
                { text: '', link: '...' },
            ],
          },  
          {
            text: 'Vue.js', link: '/docs/front/vue/' },
          {
            text: '前端工具',
            items: [
              { text: 'Webpack', link: '...' },
              { text: 'Vite', link: '...' }
            ]
          }
        ]
      },
      {
        text: '算法', link: '/docs/data-structure-and-algorithm/1_数据结构'
      },
    {
        text: 'Java',
        items: [
          {
            items: [
                { text: '面向对象', link: '...' },
                { text: '集合框架', link: '...' },
                { text: 'IO框架', link: '...' },
                { text: '并发框架', link: '...' },
                { text: '新特性', link: '...' },
                { text: 'JVM', link: '...' },
            ],
          },
        ]
      },
    {
        text: '数据库',
        items: [
          {
            text: 'SQL数据库',
            items: [
                { text: 'MySQL', link: '...' },
            ],
          }, 
          {
            text: 'NoSQL数据库',
            items: [
                { 
                  text: 'Redis', link: '/docs/db/redis/1_Redis基础'
                   
                },
                { text: 'MongoDB', link: '...' },
                { text: 'ES', link: '...' },
            ],
          },  
        ]
      },
    {
        text: 'Spring',
        items: [
          {
            items: [
                { text: 'Spring', link: '...' },
                { text: 'Spring Boot实战', link: '...' },
                { text: 'Spring Cloud', link: '...' },
                { text: 'Spring AI', link: '...' },
            ],
          },
        ]
      },
    {
        text: '工具|部署',

        items: [
          {
            items: [
                { text: 'Linux', link: '/docs/linux/linux/Linux命令' },
                { text: 'Git学习', link: '/docs/linux/git/git' },
                { text: 'Docker', link: '/docs/linux/docker/Docker初识' },
                { text: 'K8s', link: '/docs/linux/k8s/k8s初识.md' },
                { text: '工具', link: '...' },
                { text: '系统', link: '/docs/linux/macos/' },
            ],
          },
        ]
      },
    { text: '方法论', 
      items:[
        { text: '设计模式', link: '...' },
        { text: '代码规范', link: '...' },
        { text: '开发理论', link: '...' },
      ]
    },
    {
        text: '关于',
        items: [
          {
            items: [
                { text: '个人简介', link: '...' },
                { text: '联系方式', link: '...' },
                { text: '本文档搭建', link: '...' },
            ],
          },
        ]
    },
        
]