<script setup lang="ts">
import { withBase } from 'vitepress'

const docModules = import.meta.glob('../../../src/docs/**/*.md')
const docPaths = Object.keys(docModules)
const docCount = docPaths.length

function countDocs(segment: string) {
  return docPaths.filter((path) => path.includes(segment)).length
}

const tracks = [
  {
    title: 'Linux 系统基础',
    desc: '目录、权限、服务、日志、网络、磁盘、软件包和故障定位，先把生产环境最常用的底层能力打牢。',
    href: '/docs/linux/linux/',
    icon: '/icon/工具箱.svg',
    count: countDocs('/linux/linux/'),
    status: '当前主线'
  },
  {
    title: 'MySQL 数据能力',
    desc: '从 SQL 增删改查到索引、慢查询、主从复制、备份恢复，形成可复习、可演练的数据库手册。',
    href: '/docs/db/mysql/',
    icon: '/icon/中间件.svg',
    count: countDocs('/db/mysql/'),
    status: '重点补强'
  },
  {
    title: 'Docker 部署实践',
    desc: '围绕镜像、容器、网络、数据卷、Compose、日志和回滚，把服务部署流程整理成闭环。',
    href: '/docs/linux/docker/Docker初识',
    icon: '/icon/云原生.svg',
    count: countDocs('/linux/docker/'),
    status: '生产实践'
  },
  {
    title: 'Java 后端工程',
    desc: '保留 Java 基础、反射、新特性、Spring Boot 和工程设计，长期沉淀后端开发能力。',
    href: '/docs/java/',
    icon: '/icon/springboot.svg',
    count: countDocs('/java/'),
    status: '长期沉淀'
  }
]

const quickLinks = [
  ['Linux 路线', '/docs/linux/linux/'],
  ['MySQL SQL', '/docs/db/mysql/sql-basic'],
  ['Docker Compose', '/docs/linux/docker/DockerCompose'],
  ['Nginx 代理', '/docs/linux/nginx/Nginx入门与反向代理'],
  ['Jenkins', '/docs/devops/jenkins/Jenkins流水线入门'],
  ['VitePress 部署', '/docs/devops/deploy/vitepress-github-vercel']
]

const flow = [
  ['01', '先建立系统视角', 'Linux 文件、权限、进程、服务、日志、网络和磁盘。'],
  ['02', '再补齐数据能力', 'MySQL 查询、索引、慢查询、主从复制、备份恢复。'],
  ['03', '最后串成工程闭环', 'Docker、Nginx、Jenkins、Vercel/GitHub Pages 部署。']
]
</script>

<template>
  <main class="home-workbench">
    <section class="hw-hero">
      <div class="hw-hero-copy">
        <p class="hw-kicker">Justin Docs</p>
        <h1>把零散技术笔记整理成可复用的工程手册</h1>
        <p class="hw-lead">
          这里会优先沉淀 Linux、MySQL、Docker 这些真正能支撑开发、部署和排障的基础能力。
          页面不做花架子，入口清楚、阅读舒服、以后也方便扩展成完整知识库。
        </p>

        <div class="hw-actions">
          <a class="hw-button primary" :href="withBase('/docs/linux/linux/')">从 Linux 开始</a>
          <a class="hw-button" :href="withBase('/docs/db/mysql/')">进入 MySQL</a>
          <a class="hw-button ghost" :href="withBase('/write')">在线写文档</a>
        </div>

        <div class="hw-stats" aria-label="文档统计">
          <span><strong>{{ docCount }}</strong>篇文档</span>
          <span><strong>4</strong>条主线</span>
          <span><strong>2</strong>个平台部署</span>
        </div>
      </div>

      <div class="hw-map-panel" aria-label="知识地图">
        <div class="hw-map-head">
          <span>knowledge.map</span>
          <strong>focused</strong>
        </div>
        <div class="hw-map">
          <a class="hw-map-node linux" :href="withBase('/docs/linux/linux/')">Linux</a>
          <a class="hw-map-node mysql" :href="withBase('/docs/db/mysql/')">MySQL</a>
          <a class="hw-map-node docker" :href="withBase('/docs/linux/docker/Docker初识')">Docker</a>
          <a class="hw-map-node ops" :href="withBase('/docs/devops/jenkins/Jenkins流水线入门')">CI/CD</a>
        </div>
        <div class="hw-terminal" aria-label="常用排障命令">
          <p><span>$</span> journalctl -u nginx -f</p>
          <p><span>$</span> explain select * from orders where user_id = ?</p>
          <p><span>$</span> docker compose ps</p>
        </div>
      </div>
    </section>

    <section class="hw-section">
      <div class="hw-section-title">
        <p>Current Focus</p>
        <h2>当前优先沉淀</h2>
      </div>

      <div class="hw-track-grid">
        <a v-for="track in tracks" :key="track.title" :href="withBase(track.href)">
          <img :src="withBase(track.icon)" :alt="track.title" />
          <span>{{ track.status }} · {{ track.count }} 篇</span>
          <strong>{{ track.title }}</strong>
          <p>{{ track.desc }}</p>
        </a>
      </div>
    </section>

    <section class="hw-section hw-flow-section">
      <div class="hw-flow-copy">
        <div class="hw-section-title">
          <p>Reading Flow</p>
          <h2>推荐阅读顺序</h2>
        </div>
        <div class="hw-flow-list">
          <div v-for="item in flow" :key="item[0]" class="hw-flow-item">
            <span>{{ item[0] }}</span>
            <div>
              <strong>{{ item[1] }}</strong>
              <p>{{ item[2] }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="hw-quick-panel">
        <div class="hw-section-title compact">
          <p>Quick Entry</p>
          <h2>快速入口</h2>
        </div>
        <div class="hw-quick-links">
          <a v-for="link in quickLinks" :key="link[0]" :href="withBase(link[1])">
            <span>{{ link[0] }}</span>
            <strong>OPEN</strong>
          </a>
        </div>
      </div>
    </section>
  </main>
</template>
