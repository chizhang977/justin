import type { DefaultTheme } from 'vitepress'

const group = (
  text: string,
  items: DefaultTheme.SidebarItem[],
  collapsed = false
): DefaultTheme.SidebarItem => ({
  text,
  collapsed,
  items
})

const sidebar: DefaultTheme.Sidebar = {
  '/docs/interview/': [
    group('求职路线', [
      { text: '路线总览', link: '/docs/interview/' },
      { text: 'Java 后端', link: '/docs/interview/java-backend' },
      { text: 'DevOps 运维', link: '/docs/interview/devops' }
    ])
  ],

  '/docs/java/springboot/': [
    group('Spring Boot', [
      { text: '生产实践指南', link: '/docs/java/springboot/production-guide' }
    ])
  ],

  '/docs/java/': [
    group('Java 基础', [
      { text: '学习地图', link: '/docs/java/' },
      { text: '反射机制', link: '/docs/java/reflect/README' },
      { text: 'Spring Boot', link: '/docs/java/springboot/production-guide' }
    ]),
    group('Java 新特性', [
      { text: 'Java 8 总览', link: '/docs/java/newfeatures/java8/Java8-newfeatures' },
      { text: 'Lambda', link: '/docs/java/newfeatures/java8/Java8-Lambda' },
      { text: 'Stream', link: '/docs/java/newfeatures/java8/Java8-StreamAPI' },
      { text: 'Optional', link: '/docs/java/newfeatures/java8/Java8-optional' },
      { text: '默认方法', link: '/docs/java/newfeatures/java8/Java8-defaultMethod' },
      { text: '日期时间', link: '/docs/java/newfeatures/java8/Java8-datetime' },
      { text: 'Java 9', link: '/docs/java/newfeatures/java9/README' },
      { text: 'Java 11', link: '/docs/java/newfeatures/java11/README' },
      { text: 'Java 17', link: '/docs/java/newfeatures/java17/README' }
    ], true)
  ],

  '/docs/db/mysql/': [
    group('入门基础', [
      { text: '学习路线', link: '/docs/db/mysql/' },
      { text: 'SQL 基础', link: '/docs/db/mysql/sql-basic' },
      { text: '查询进阶', link: '/docs/db/mysql/query-advanced' },
      { text: '存储引擎', link: '/docs/db/mysql/存储引擎' }
    ]),
    group('性能优化', [
      { text: '索引优化', link: '/docs/db/mysql/索引优化' },
      { text: 'SQL 优化', link: '/docs/db/mysql/SQL语句优化' },
      { text: '慢查询与 EXPLAIN', link: '/docs/db/mysql/slow-query-explain' }
    ]),
    group('生产运维', [
      { text: '主从复制', link: '/docs/db/mysql/replication' },
      { text: '备份恢复', link: '/docs/db/mysql/backup-restore' }
    ], true)
  ],

  '/docs/db/redis/': [
    group('入门安装', [
      { text: '安装说明', link: '/docs/db/redis/00.Redis安装说明' },
      { text: '快速入门', link: '/docs/db/redis/01.快速入门' },
      { text: 'Redis 基础', link: '/docs/db/redis/02.Redis基础' }
    ]),
    group('业务实战', [
      { text: 'Redis 实战篇', link: '/docs/db/redis/03.Redis实战篇' },
      { text: '最佳实践', link: '/docs/db/redis/06.最佳实践' }
    ]),
    group('架构与原理', [
      { text: '分布式缓存', link: '/docs/db/redis/04.分布式缓存' },
      { text: '多级缓存', link: '/docs/db/redis/05.多级缓存' },
      { text: 'Redis 集群', link: '/docs/db/redis/07.Redis集群' },
      { text: '原理篇', link: '/docs/db/redis/10.原理篇' }
    ], true),
    group('组件集成', [
      { text: 'Canal', link: '/docs/db/redis/08.安装Canal' },
      { text: 'OpenResty', link: '/docs/db/redis/09安装OpenResty' }
    ], true)
  ],

  '/docs/linux/docker/': [
    group('Docker 基础', [
      { text: 'Docker 入门', link: '/docs/linux/docker/intro' },
      { text: '命令速查', link: '/docs/linux/docker/commands' },
      { text: '命令参考', link: '/docs/linux/docker/command-reference' },
      { text: '镜像概念', link: '/docs/linux/docker/image' },
      { text: '数据卷', link: '/docs/linux/docker/volume' }
    ]),
    group('构建与运行', [
      { text: 'Docker 网络', link: '/docs/linux/docker/network' },
      { text: 'Dockerfile', link: '/docs/linux/docker/dockerfile' },
      { text: 'Docker Compose', link: '/docs/linux/docker/compose' },
      { text: '常见软件安装', link: '/docs/linux/docker/software-install' },
      { text: 'Portainer 可视化', link: '/docs/linux/docker/portainer' }
    ]),
    group('生产实践', [
      { text: '生产部署与排障', link: '/docs/linux/docker/production-deploy' },
      { text: '数据库主从实验', link: '/docs/linux/docker/replication-lab' }
    ], true)
  ],

  '/docs/linux/nginx/': [
    group('Nginx', [
      { text: '入门与反向代理', link: '/docs/linux/nginx/Nginx入门与反向代理' }
    ])
  ],

  '/docs/linux/k8s/': [
    group('基础安装', [
      { text: 'Kubernetes 入门', link: '/docs/linux/k8s/intro' },
      { text: 'kubeadm 安装集群', link: '/docs/linux/k8s/kubeadm-install' }
    ]),
    group('KubeSphere', [
      { text: '安装 KubeSphere', link: '/docs/linux/k8s/kubesphere-install' },
      { text: '应用部署实践', link: '/docs/linux/k8s/kubesphere-practice' },
      { text: '中间件地址记录', link: '/docs/linux/k8s/kubesphere-services' }
    ], true),
    group('排障记录', [
      { text: 'Ingress 与 Dashboard', link: '/docs/linux/k8s/ingress-troubleshooting' }
    ], true)
  ],

  '/docs/linux/': [
    group('Linux 基础', [
      { text: '学习路线', link: '/docs/linux/linux/' },
      { text: '文件与目录', link: '/docs/linux/linux/file-directory' },
      { text: '用户与权限', link: '/docs/linux/linux/user-permission' },
      { text: '进程服务日志', link: '/docs/linux/linux/process-service-log' },
      { text: '网络排障', link: '/docs/linux/linux/network-troubleshooting' },
      { text: '磁盘与软件包', link: '/docs/linux/linux/storage-package' },
      { text: '命令速查', link: '/docs/linux/linux/Linux命令' }
    ]),
    group('系统工具', [
      { text: 'Git', link: '/docs/linux/git/git' },
      { text: 'CentOS', link: '/docs/linux/system/centos' },
      { text: 'MacOS', link: '/docs/linux/system/macos' },
      { text: 'rEFInd', link: '/docs/linux/system/rEFInd' }
    ], true)
  ],

  '/docs/devops/': [
    group('部署发布', [
      { text: 'VitePress 部署', link: '/docs/devops/deploy/vitepress-github-vercel' },
      { text: 'EdgeOne Pages', link: '/docs/devops/deploy/edgeone-pages' },
      { text: '在线写作配置', link: '/docs/devops/deploy/online-editor-vercel-github' }
    ]),
    group('CI/CD', [
      { text: 'Jenkins 流水线', link: '/docs/devops/jenkins/Jenkins流水线入门' }
    ])
  ],

  '/docs/front/vue/': [
    group('Vue', [
      { text: 'Vue2', link: '/docs/front/vue/' },
      { text: 'Vue 基础', link: '/docs/front/vue/vue基础' },
      { text: 'Vue3', link: '/docs/front/vue/vue3' }
    ])
  ],

  '/docs/front/res/': [
    group('资源导航', [
      { text: '资源首页', link: '/docs/front/res/index' },
      { text: '友情链接', link: '/docs/front/res/friend' }
    ]),
    group('工具资源', [
      { text: '前端常用', link: '/docs/front/res/CommandFront' },
      { text: 'Node', link: '/docs/front/res/Node' },
      { text: '运维工具', link: '/docs/front/res/Operation' },
      { text: 'Mac 软件', link: '/docs/front/res/Mac' },
      { text: 'Google 插件', link: '/docs/front/res/GooglePlugin' },
      { text: '实用工具', link: '/docs/front/res/UtilityTools' }
    ], true)
  ],

  '/docs/method/': [
    group('设计模式总览', [
      { text: '总览与原则', link: '/docs/method/dp/七大原则' }
    ]),
    group('创建型模式', [
      { text: '单例模式', link: '/docs/method/dp/单例模式' },
      { text: '工厂模式', link: '/docs/method/dp/工厂模式' },
      { text: '建造者模式', link: '/docs/method/dp/建造者模式' },
      { text: '原型模式', link: '/docs/method/dp/原型模式' }
    ]),
    group('结构型模式', [
      { text: '适配器模式', link: '/docs/method/dp/适配器模式' },
      { text: '桥接模式', link: '/docs/method/dp/桥接模式' },
      { text: '装饰器模式', link: '/docs/method/dp/装饰器模式' },
      { text: '组合模式', link: '/docs/method/dp/组合模式' },
      { text: '外观模式', link: '/docs/method/dp/外观模式' },
      { text: '享元模式', link: '/docs/method/dp/享元模式' },
      { text: '代理模式', link: '/docs/method/dp/代理模式' },
    ], true),
    group('行为型模式', [
      { text: '责任链模式', link: '/docs/method/dp/责任链模式' },
      { text: '命令模式', link: '/docs/method/dp/命令模式' },
      { text: '解释器模式', link: '/docs/method/dp/解释器模式' },
      { text: '迭代器模式', link: '/docs/method/dp/迭代器模式' },
      { text: '中介者模式', link: '/docs/method/dp/中介者模式' },
      { text: '备忘录模式', link: '/docs/method/dp/备忘录模式' },
      { text: '观察者模式', link: '/docs/method/dp/观察者模式' },
      { text: '状态模式', link: '/docs/method/dp/状态模式' },
      { text: '策略模式', link: '/docs/method/dp/策略模式' },
      { text: '模板方法模式', link: '/docs/method/dp/模板方法模式' },
      { text: '访问者模式', link: '/docs/method/dp/访问者模式' }
    ], true),
    group('工程规范', [
      { text: '阿里 Java 规范', link: '/docs/method/codestrand/alibaba-java-specification' },
      { text: 'Google Java 风格', link: '/docs/method/codestrand/google-java' },
      { text: 'CAP 理论', link: '/docs/method/devtheory/cap' },
      { text: 'ACID 事务', link: '/docs/method/devtheory/transaction' }
    ], true)
  ]
}

export default sidebar
