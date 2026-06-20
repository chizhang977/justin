import type { DefaultTheme } from 'vitepress'

export default [
  { text: '首页', link: '/' },
  {
    text: 'Linux',
    items: [
      {
        text: '基础主线',
        items: [
          { text: '学习路线', link: '/docs/linux/linux/' },
          { text: '文件与目录', link: '/docs/linux/linux/file-directory' },
          { text: '用户与权限', link: '/docs/linux/linux/user-permission' },
          { text: '进程服务日志', link: '/docs/linux/linux/process-service-log' },
          { text: '网络排障', link: '/docs/linux/linux/network-troubleshooting' },
          { text: '磁盘与软件包', link: '/docs/linux/linux/storage-package' },
          { text: '命令速查', link: '/docs/linux/linux/Linux命令' }
        ]
      },
      {
        text: '系统工具',
        items: [
          { text: 'Git', link: '/docs/linux/git/git' },
          { text: 'CentOS', link: '/docs/linux/system/centos' },
          { text: 'MacOS', link: '/docs/linux/system/macos' },
          { text: 'rEFInd', link: '/docs/linux/system/rEFInd' }
        ]
      }
    ]
  },
  {
    text: 'Java',
    items: [
      {
        text: '语言基础',
        items: [
          { text: '学习地图', link: '/docs/java/' },
          { text: '反射机制', link: '/docs/java/reflect/README' },
          { text: 'Java 8', link: '/docs/java/newfeatures/java8/Java8-newfeatures' },
          { text: 'Java 17', link: '/docs/java/newfeatures/java17/README' }
        ]
      },
      {
        text: '工程设计',
        items: [
          { text: 'Spring Boot', link: '/docs/java/springboot/production-guide' },
          { text: '设计模式', link: '/docs/method/dp/七大原则' },
          { text: 'CAP', link: '/docs/method/devtheory/cap' },
          { text: 'ACID', link: '/docs/method/devtheory/transaction' }
        ]
      }
    ]
  },
  {
    text: '数据库',
    items: [
      {
        text: 'MySQL',
        items: [
          { text: '学习路线', link: '/docs/db/mysql/' },
          { text: 'SQL 基础', link: '/docs/db/mysql/sql-basic' },
          { text: '查询进阶', link: '/docs/db/mysql/query-advanced' },
          { text: '索引优化', link: '/docs/db/mysql/索引优化' },
          { text: '慢查询', link: '/docs/db/mysql/slow-query-explain' },
          { text: '主从复制', link: '/docs/db/mysql/replication' },
          { text: '备份恢复', link: '/docs/db/mysql/backup-restore' }
        ]
      },
      {
        text: 'Redis',
        items: [
          { text: '安装说明', link: '/docs/db/redis/00.Redis安装说明' },
          { text: '快速入门', link: '/docs/db/redis/01.快速入门' },
          { text: 'Redis 基础', link: '/docs/db/redis/02.Redis基础' },
          { text: 'Redis 实战', link: '/docs/db/redis/03.Redis实战篇' },
          { text: '分布式缓存', link: '/docs/db/redis/04.分布式缓存' },
          { text: '最佳实践', link: '/docs/db/redis/06.最佳实践' },
          { text: 'Redis 集群', link: '/docs/db/redis/07.Redis集群' }
        ]
      }
    ]
  },
  {
    text: '云原生',
    items: [
      {
        text: 'Docker',
        items: [
          { text: 'Docker 入门', link: '/docs/linux/docker/intro' },
          { text: '命令速查', link: '/docs/linux/docker/commands' },
          { text: 'Dockerfile', link: '/docs/linux/docker/dockerfile' },
          { text: '网络模型', link: '/docs/linux/docker/network' },
          { text: 'Compose', link: '/docs/linux/docker/compose' },
          { text: '生产部署', link: '/docs/linux/docker/production-deploy' }
        ]
      },
      {
        text: 'Kubernetes',
        items: [
          { text: 'K8s 入门', link: '/docs/linux/k8s/intro' },
          { text: 'kubeadm 安装', link: '/docs/linux/k8s/kubeadm-install' },
          { text: 'KubeSphere 安装', link: '/docs/linux/k8s/kubesphere-install' },
          { text: 'KubeSphere 实践', link: '/docs/linux/k8s/kubesphere-practice' },
          { text: 'Ingress 排障', link: '/docs/linux/k8s/ingress-troubleshooting' }
        ]
      }
    ]
  },
  {
    text: 'DevOps',
    items: [
      {
        text: '部署链路',
        items: [
          { text: 'Nginx', link: '/docs/linux/nginx/Nginx入门与反向代理' },
          { text: 'Jenkins', link: '/docs/devops/jenkins/Jenkins流水线入门' },
          { text: 'VitePress 部署', link: '/docs/devops/deploy/vitepress-github-vercel' },
          { text: 'EdgeOne Pages', link: '/docs/devops/deploy/edgeone-pages' },
          { text: '在线写作配置', link: '/docs/devops/deploy/online-editor-vercel-github' }
        ]
      },
      {
        text: '常用工具',
        items: [
          { text: 'Git', link: '/docs/linux/git/git' },
          { text: '运维工具', link: '/docs/front/res/Operation' },
          { text: '实用工具', link: '/docs/front/res/UtilityTools' }
        ]
      }
    ]
  },
  {
    text: '资源',
    items: [
      {
        text: '前端',
        items: [
          { text: 'Vue', link: '/docs/front/vue/' },
          { text: 'Vue 基础', link: '/docs/front/vue/vue基础' },
          { text: 'Vue3', link: '/docs/front/vue/vue3' },
          { text: '资源导航', link: '/docs/front/res/index' }
        ]
      },
      {
        text: '规范',
        items: [
          { text: '阿里 Java 规范', link: '/docs/method/codestrand/alibaba-java-specification' },
          { text: 'Google Java 风格', link: '/docs/method/codestrand/google-java' },
          { text: '设计模式', link: '/docs/method/dp/七大原则' }
        ]
      }
    ]
  }
] satisfies DefaultTheme.NavItem[]
