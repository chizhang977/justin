// vitepress导航栏的配置
export default [
    { text: '首页', link: '/' },
    {
      text: '资源导航', link: '/docs/front/res/index'
    },
    {
        text: '前端',
        items: [
          {
            text: 'javascript', link: '...' 
          },
          {
            text: 'typescript',link:'...',
          },  
          {
            text: 'Vue', link: '/docs/front/vue/'
          },
          
        ]
    },
      
    {
        text: 'Java',
        items: [
          {
            items: [
                { text: '面向对象', link: '...' },
                { text: '集合框架', link: '...' },
                { text: 'IO框架', link: '...' },
                { text: '反射', link: '/docs/java/reflect/README' },
                { text: '并发框架', link: '...' },
                { text: '新特性', link: '/docs/java/newfeatures/java8/Java8-newfeatures' },
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
                { text: 'Spring MVC', link: '...' },
                { text: 'Spring Boot实战', link: '...' },
                { text: 'Spring Cloud', link: '...' },
                { text: 'Spring AI', link: '...' },
            ],
          },
        ]
      },
    {
        text: 'Linux',
        items: [
          {
            items: [
                { text: 'Linux', link: '/docs/linux/linux/Linux命令' },
                { text: 'Git详解', link: '/docs/linux/git/git' },
                { text: '系统安装', link: '/docs/linux/system/macos' },
            ],
          },
        ]
    },
    {
      text: '云原生',
      items: [
        {
          items: [
            { text: 'Docker', link: '/docs/linux/docker/Docker初识' },
            { text: 'Kubernetes', link: '/docs/linux/k8s/k8s初识.md' },
          ],
        },
      ]
  },
    {
      text: '算法', link: '/docs/data-structure-and-algorithm/1_数据结构'
    },
    { text: '方法论', 
      items:[
        { text: '设计模式', link: '/docs/method/dp/七大原则' },
        { text: '代码规范', link: '/docs/method/codestrand/alibaba-java-specification' },
        { text: '开发理论', link: '/docs/method/devtheory/cap' },
      ]
    },
    
        
]