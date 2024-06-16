export default {
  'docs/front/res/':[
    {
      text: '资源导航',link: '/docs/front/res/index',
      items: [
        {text: '前端常用',link: '/docs/front/res/CommandFront'},
        {text: '后端资源', collapsed: true,
            items: [
              {text: 'Node',link: '/docs/front/res/Node'},
            ]
        }, 
        {text: '运维工具',link: '/docs/front/res/Operation'},
        {text: 'Mac 软件',link: '/docs/front/res/Mac'},
        {text: 'Google 插件',link: '/docs/front/res/GooglePlugin'},
        {text: '实用工具',link: '/docs/front/res/UtilityTools'},
      ],
    },
  ],
  '/docs/front/vue/': [
    {
      text: 'Vue.js详解',
      items: [
        {text:'vue基础',link: '/docs/front/vue/vue基础'},
        {text: 'Vue2',link: '/docs/front/vue/'},
        {text: 'Vue3',link: '/docs/front/vue/vue3'},
      ],
    },
  ],
  '/docs/java/newfeatures':[
    {
      text: 'Java新特性',
      items: [
        {text: 'Java8新特性',collapsed: true,
         items: [
           {text: 'Java8-新特性',link: '/docs/java/newfeatures/java8/Java8-newfeatures'},
           {text: 'Lambda表达式',link: '/docs/java/newfeatures/java8/Java8-Lambda'},
           {text: 'Stream流',link: '/docs/java/newfeatures/java8/Java8-StreamAPI'},
           {text: 'Optional',link: '/docs/java/newfeatures/java8/Java8-optional'},
           {text: '默认方法',link: '/docs/java/newfeatures/java8/Java8-defaultMethod'},
           {text: '日期时间',link: '/docs/java/newfeatures/java8/Java8-datetime'},
           {text: '类型注解',link: '/docs/java/newfeatures/java8/Java8-typeAnno'},
           {text: '重复注解',link: '/docs/java/newfeatures/java8/Java8-repeatAnno'},
           {text:'类型推断',link:'/docs/java/newfeatures/java8/Java8-typeInference'}
          ]
        },
        {text: 'Java9新特性',link: '/docs/java/newfeatures/java9/README'},
        {text: 'Java10新特性',link: '/docs/java/newfeatures/java10/README'},
        {text: 'Java11新特性',link: '/docs/java/newfeatures/java11/README'},
        {text: 'Java12新特性',link: '/docs/java/newfeatures/java12/README'},
        {text: 'Java13新特性',link: '/docs/java/newfeatures/java13/README'},
        {text: 'Java14新特性',link: '/docs/java/newfeatures/java14/README'},
        {text: 'Java15新特性',link: '/docs/java/newfeatures/java15/README'},
        {text: 'Java16新特性',link: '/docs/java/newfeatures/java16/README'},
        {text: 'Java17新特性',link: '/docs/java/newfeatures/java17/README'},
        
      ],
    },

  ],
  '/docs/method/codestrand':[
    {
      text: '开发规范',
      items: [
        {
          text: '阿里巴巴 Java开发手册',
          link: '/docs/method/codestrand/alibaba-java-specification',
        },
        {
          text: 'Google Java 编程风格指南',
          link: '/docs/method/codestrand/google-java',
        },
      
      ],
    },
  ],
  'docs/method/devtheory':[
    {
      text: '开发理论',
      items: [
        {
          text: 'CAP',
          link: '/docs/method/devtheory/cap',
        },
        {
          text: 'ACID',
          link: '/docs/method/devtheory/transaction',
        },
      ],
    },
  ],
  '/docs/method/dp':[
    {
      text: '设计模式详解',
      items: [
          {text: '前置知识',link: '/docs/method/dp/七大原则'},
          {text:'创建型模式',collapsed: true, 
            items:[
            {text: '单例模式',link: '/docs/method/dp/单例模式'},
            {text: '工厂模式',link: '/docs/method/dp/工厂模式'},
            {text: '建造者模式',link: '/docs/method/dp/建造者模式'},
            {text: '原型模式',link: '/docs/method/dp/原型模式'},
            ]
          },
          {text: '结构型模式',collapsed: true,
            items:[
            {text: '外观模式',link: '/docs/method/dp/外观模式'},
            {text: '适配器模式',link: '/docs/method/dp/适配器模式'},
            {text: '桥接模式',link: '/docs/method/dp/桥接模式'},
            {text: '组合模式',link: '/docs/method/dp/组合模式'},
            {text: '代理模式',link: '/docs/method/dp/代理模式'},
            {text: '装饰模式',link: '/docs/method/dp/装饰模式'},
            {text: '享元模式',link: '/docs/method/dp/享元模式'},
                ]
          },
          {text: '行为型模式',collapsed: true,
            items:[
            {text: '策略模式',link: '/docs/method/dp/策略模式'},
            {text: '模板方法模式',link: '/docs/method/dp/模板方法模式'},
            {text: '责任链模式',link: '/docs/method/dp/责任链模式'},
            {text: '命令模式',link: '/docs/method/dp/命令模式'},
            {text: '解释器模式',link: '/docs/method/dp/解释器模式'},
            {text: '访问者模式',link: '/docs/method/dp/访问者模式'},
            {text: '中介者模式',link: '/docs/method/dp/中介者模式'},
            {text: '备忘录模式',link: '/docs/method/dp/备忘录模式'},
            {text: '迭代器模式',link: '/docs/method/dp/迭代器模式'},
            {text: '状态模式',link: '/docs/method/dp/状态模式'},
            {text: '观察者模式',link: '/docs/method/dp/观察者模式'},
          ]
          }
      ]
    }
  ],
  
  '/docs/db/redis/': [
    {
      text: 'Redis详解',
      items: [
        {text: 'Redis初识',link: '/docs/db/redis/1_Redis基础', },
        {text: 'Redis基础',link: '/docs/db/redis/2_Redis基础'},
        {text: 'Redis缓存',link: '/docs/db/redis/3_缓存详解'},
        {text: 'Redis多级缓存',link: '/docs/db/redis/4_多级缓存'},
        {text: 'Redis分布式缓存',link: '/docs/db/redis/5_分布式缓存'},
        {text: 'Redis最佳实践',link: '/docs/db/redis/6_最佳实践'},
        {text: 'Redis集群',link: '/docs/db/redis/7_Redis集群'},
        {text: 'Redis & OpenResty',link: '/docs/db/redis/8_安装OpenResty'},
        {text: 'Redis & Canal',link: '/docs/db/redis/9_安装Canal'},
      ],
    },
  ],
  '/docs/linux/': [
    {
      text: 'Linux',
      items: [
        {text: 'Linux常见的命令',link: '/docs/linux/linux/Linux命令'},
      ],
    },
    {
      text: 'Git',
      items: [
        {text: 'Git详解',link: '/docs/linux/git/git'},
      ],
    },
    {
      text: '系统安装',
      items: [
        {text: 'CentOS',link: '/docs/linux/system/centos.md'},
        {text: 'MacOS',link: '/docs/linux/system/macos.md'},
        {text: 'rEFInd',link: '/docs/linux/system/rEFInd.md'},
      ],
    },
  ],
  
  '/docs/linux/k8s/': [
    {
      text: 'Kubernetes',
      items:[
        {text: 'k8s安装',link: '/docs/linux/k8s/k8s安装'},
        {text: 'k8s入门',link: '/docs/linux/k8s/k8s初识'},
        {text: 'kubesphere安装',link: '/docs/linux/k8s/kubesphere'},
        {text: 'kubesphere入门',link: '/docs/linux/k8s/kubesphere1'},
        {text: 'kubesphere基础',link: '/docs/linux/k8s/kubesphere2'},
        {text: 'k8s出现的bug总结',link: '/docs/linux/k8s/ingress安装问题'},
        
        
      ]
    },
  ],
  '/docs/linux/docker/': [
    {
      text: 'Docker',
      items: [
        { text: 'Docker初识', link: '/docs/linux/docker/Docker初识' },
        { text: 'Docker常用命令', link: '/docs/linux/docker/Docker常用命令.md' },
        { text: 'Docker镜像', link: '/docs/linux/docker/Docker镜像概念' },
        { text: 'Docker数据卷', link: '/docs/linux/docker/Dokcer数据卷' },
        { text: 'Docker命令系列', link: '/docs/linux/docker/Docker常见命令' },
        { text: 'Docker之数据库主从复制', link: '/docs/linux/docker/主从复制' },
        { text: 'Docker常见软件安装', link: '/docs/linux/docker/Docker软件安装' },
        { text: 'Dockerfile详解', link: '/docs/linux/docker/Dockerfile详解' },
        { text: 'Docker网络', link: '/docs/linux/docker/Docker网络.md' },
        { text: 'DockerCompose', link: '/docs/linux/docker/DockerCompose' },
        { text: 'Docker可视化', link: '/docs/linux/docker/Docker可视化.md' }
      ]
    }
  ],
}
