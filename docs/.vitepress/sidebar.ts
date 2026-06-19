import type { DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Sidebar = {
  '/docs/interview/': [
    {
      text: '求职与面试',
      items: [
        { text: '求职路线总览', link: '/docs/interview/' },
        { text: 'Java 后端面试主线', link: '/docs/interview/java-backend' },
        { text: 'DevOps 运维面试主线', link: '/docs/interview/devops' }
      ]
    }
  ],

  '/docs/java/springboot/': [
    {
      text: 'Spring Boot',
      items: [
        { text: '生产实践指南', link: '/docs/java/springboot/production-guide' }
      ]
    }
  ],

  '/docs/java/': [
    {
      text: 'Java 后端',
      items: [
        { text: 'Java 学习地图', link: '/docs/java/' },
        { text: '反射机制', link: '/docs/java/reflect/README' },
        { text: 'Spring Boot 生产实践', link: '/docs/java/springboot/production-guide' }
      ]
    },
    {
      text: 'Java 新特性',
      collapsed: true,
      items: [
        { text: 'Java8 新特性', link: '/docs/java/newfeatures/java8/Java8-newfeatures' },
        { text: 'Lambda 表达式', link: '/docs/java/newfeatures/java8/Java8-Lambda' },
        { text: 'Stream 流', link: '/docs/java/newfeatures/java8/Java8-StreamAPI' },
        { text: 'Optional', link: '/docs/java/newfeatures/java8/Java8-optional' },
        { text: '默认方法', link: '/docs/java/newfeatures/java8/Java8-defaultMethod' },
        { text: '日期时间', link: '/docs/java/newfeatures/java8/Java8-datetime' },
        { text: 'Java9 新特性', link: '/docs/java/newfeatures/java9/README' },
        { text: 'Java11 新特性', link: '/docs/java/newfeatures/java11/README' },
        { text: 'Java17 新特性', link: '/docs/java/newfeatures/java17/README' }
      ]
    }
  ],

  '/docs/db/mysql/': [
    {
      text: 'MySQL',
      items: [
        { text: '学习路线', link: '/docs/db/mysql/' },
        { text: 'SQL 基础：增删改查', link: '/docs/db/mysql/sql-basic' },
        { text: '查询进阶：过滤分组分页', link: '/docs/db/mysql/query-advanced' },
        { text: '存储引擎', link: '/docs/db/mysql/存储引擎' },
        { text: '索引优化', link: '/docs/db/mysql/索引优化' },
        { text: 'SQL 语句优化', link: '/docs/db/mysql/SQL语句优化' },
        { text: '慢查询与执行计划', link: '/docs/db/mysql/slow-query-explain' },
        { text: '主从复制', link: '/docs/db/mysql/replication' },
        { text: '备份与恢复演练', link: '/docs/db/mysql/backup-restore' }
      ]
    }
  ],

  '/docs/db/redis/': [
    {
      text: 'Redis',
      items: [
        { text: 'Redis 初识', link: '/docs/db/redis/1_Redis基础' },
        { text: 'Redis 基础', link: '/docs/db/redis/2_Redis基础' },
        { text: '缓存详解', link: '/docs/db/redis/3_缓存详解' },
        { text: '多级缓存', link: '/docs/db/redis/4_多级缓存' },
        { text: '分布式缓存', link: '/docs/db/redis/5_分布式缓存' },
        { text: '最佳实践', link: '/docs/db/redis/6_最佳实践' },
        { text: 'Redis 集群', link: '/docs/db/redis/7_Redis集群' },
        { text: 'OpenResty', link: '/docs/db/redis/8_安装OpenResty' },
        { text: 'Canal', link: '/docs/db/redis/9_安装Canal' }
      ]
    }
  ],

  '/docs/linux/docker/': [
    {
      text: 'Docker',
      items: [
        { text: 'Docker 初识', link: '/docs/linux/docker/Docker初识' },
        { text: '常用命令', link: '/docs/linux/docker/Docker常用命令' },
        { text: '镜像概念', link: '/docs/linux/docker/Docker镜像概念' },
        { text: '数据卷', link: '/docs/linux/docker/Dokcer数据卷' },
        { text: 'Dockerfile', link: '/docs/linux/docker/Dockerfile详解' },
        { text: 'Docker 网络', link: '/docs/linux/docker/Docker网络' },
        { text: 'Docker Compose', link: '/docs/linux/docker/DockerCompose' },
        { text: '软件安装', link: '/docs/linux/docker/Docker软件安装' },
        { text: '生产部署与排障', link: '/docs/linux/docker/production-deploy' }
      ]
    }
  ],

  '/docs/linux/nginx/': [
    {
      text: 'Nginx',
      items: [
        { text: '入门与反向代理', link: '/docs/linux/nginx/Nginx入门与反向代理' }
      ]
    }
  ],

  '/docs/linux/k8s/': [
    {
      text: 'Kubernetes',
      items: [
        { text: 'K8s 初识', link: '/docs/linux/k8s/k8s初识' },
        { text: 'K8s 安装', link: '/docs/linux/k8s/k8s安装' },
        { text: 'KubeSphere 安装', link: '/docs/linux/k8s/kubesphere' },
        { text: 'KubeSphere 入门', link: '/docs/linux/k8s/kubesphere1' },
        { text: 'KubeSphere 基础', link: '/docs/linux/k8s/kubesphere2' },
        { text: 'Ingress 问题', link: '/docs/linux/k8s/ingress安装问题' }
      ]
    }
  ],

  '/docs/linux/': [
    {
      text: 'Linux 与系统',
      items: [
        { text: 'Linux 学习路线', link: '/docs/linux/linux/' },
        { text: '文件与目录操作', link: '/docs/linux/linux/file-directory' },
        { text: '用户、权限与 sudo', link: '/docs/linux/linux/user-permission' },
        { text: '进程、服务与日志', link: '/docs/linux/linux/process-service-log' },
        { text: '网络配置与排障', link: '/docs/linux/linux/network-troubleshooting' },
        { text: '磁盘、挂载与软件包', link: '/docs/linux/linux/storage-package' },
        { text: 'Linux 命令', link: '/docs/linux/linux/Linux命令' },
        { text: 'Git 详解', link: '/docs/linux/git/git' },
        { text: 'CentOS', link: '/docs/linux/system/centos' },
        { text: 'MacOS', link: '/docs/linux/system/macos' },
        { text: 'rEFInd', link: '/docs/linux/system/rEFInd' }
      ]
    }
  ],

  '/docs/devops/': [
    {
      text: 'DevOps 实践',
      items: [
        { text: 'VitePress 双平台部署', link: '/docs/devops/deploy/vitepress-github-vercel' },
        { text: '在线写作与 GitHub 提交', link: '/docs/devops/deploy/online-editor-vercel-github' },
        { text: 'Jenkins 流水线入门', link: '/docs/devops/jenkins/Jenkins流水线入门' }
      ]
    }
  ],

  '/docs/front/vue/': [
    {
      text: 'Vue',
      items: [
        { text: 'Vue2', link: '/docs/front/vue/' },
        { text: 'Vue 基础', link: '/docs/front/vue/vue基础' },
        { text: 'Vue3', link: '/docs/front/vue/vue3' }
      ]
    }
  ],

  '/docs/front/res/': [
    {
      text: '资源导航',
      items: [
        { text: '资源首页', link: '/docs/front/res/index' },
        { text: '友情链接', link: '/docs/front/res/friend' },
        { text: '前端常用', link: '/docs/front/res/CommandFront' },
        { text: 'Node', link: '/docs/front/res/Node' },
        { text: '运维工具', link: '/docs/front/res/Operation' },
        { text: 'Mac 软件', link: '/docs/front/res/Mac' },
        { text: 'Google 插件', link: '/docs/front/res/GooglePlugin' },
        { text: '实用工具', link: '/docs/front/res/UtilityTools' }
      ]
    }
  ],

  '/docs/method/': [
    {
      text: '设计模式',
      items: [
        { text: '七大原则', link: '/docs/method/dp/七大原则' },
        { text: '单例模式', link: '/docs/method/dp/单例模式' },
        { text: '工厂模式', link: '/docs/method/dp/工厂模式' },
        { text: '建造者模式', link: '/docs/method/dp/建造者模式' },
        { text: '代理模式', link: '/docs/method/dp/代理模式' },
        { text: '策略模式', link: '/docs/method/dp/策略模式' },
        { text: '观察者模式', link: '/docs/method/dp/观察者模式' }
      ]
    },
    {
      text: '工程规范',
      items: [
        { text: '阿里 Java 开发手册', link: '/docs/method/codestrand/alibaba-java-specification' },
        { text: 'Google Java 风格', link: '/docs/method/codestrand/google-java' },
        { text: 'CAP 理论', link: '/docs/method/devtheory/cap' },
        { text: 'ACID 事务', link: '/docs/method/devtheory/transaction' }
      ]
    }
  ]
}

export default sidebar
