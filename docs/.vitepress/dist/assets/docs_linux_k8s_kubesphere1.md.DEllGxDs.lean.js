import{_ as s,c as a,o as n,a4 as i,cF as e,cG as l,cH as p,cI as t,cJ as h,cK as r,cL as c,cM as k,cN as o,cO as d,cP as g,cQ as y,cR as u,cS as A,cT as D}from"./chunks/framework.Dcf-1z4i.js";const S=JSON.parse('{"title":"kubesphere 入门","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"docs/linux/k8s/kubesphere1.md","filePath":"docs/linux/k8s/kubesphere1.md","lastUpdated":1718108650000}'),m={name:"docs/linux/k8s/kubesphere1.md"},E=i(`<h1 id="kubesphere-入门" tabindex="-1">kubesphere 入门 <a class="header-anchor" href="#kubesphere-入门" aria-label="Permalink to &quot;kubesphere 入门&quot;">​</a></h1><h2 id="多租户" tabindex="-1">多租户 <a class="header-anchor" href="#多租户" aria-label="Permalink to &quot;多租户&quot;">​</a></h2><h2 id="中间件部署" tabindex="-1">中间件部署 <a class="header-anchor" href="#中间件部署" aria-label="Permalink to &quot;中间件部署&quot;">​</a></h2><div class="tip custom-block"><p class="custom-block-title">部署三要素</p><p>应用部署需要关注的信息【应用部署三要素】</p><ul><li>应用的部署方式</li><li>应用的数据挂载（数据，配置文件）</li><li>应用的可访问性</li></ul></div><ul><li>有状态副本集 - Deployment（中间件）</li><li>无状态副本集 - StatefulSet （微服务）</li><li>守护进程 - DaemonSet （日志采集）</li></ul><h2 id="若依框架上云部署" tabindex="-1"><a href="https://gitee.com/upjustin/RuoYi-Cloud" target="_blank" rel="noreferrer">若依</a>框架上云部署 <a class="header-anchor" href="#若依框架上云部署" aria-label="Permalink to &quot;[若依](https://gitee.com/upjustin/RuoYi-Cloud)框架上云部署&quot;">​</a></h2><h3 id="_1、有状态副本集部署-mysql-redis-nacos" tabindex="-1">1、有状态副本集部署（mysql，redis，nacos） <a class="header-anchor" href="#_1、有状态副本集部署-mysql-redis-nacos" aria-label="Permalink to &quot;1、有状态副本集部署（mysql，redis，nacos）&quot;">​</a></h3><h4 id="mysql" tabindex="-1">MYSQL <a class="header-anchor" href="#mysql" aria-label="Permalink to &quot;MYSQL&quot;">​</a></h4><p>1、创建ConfigMap（也就是配置文件）</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[client]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">default-character-set=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">utf8mb4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[mysql]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">default-character-set=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">utf8mb4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[mysqld]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">init_connect</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SET collation_connection = utf8mb4_unicode_ci&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">init_connect</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SET NAMES utf8mb4&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">character-set-server=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">utf8mb4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">collation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-server=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">utf8mb4_unicode_ci</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">skip-character-set-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">client</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">handshake</span></span></code></pre></div><p>2、创建持久卷申明</p><p>持久卷声明定义了存储需求，系统根据持久卷声明创建持久卷</p><p>3、创建持久卷</p><p>持久卷定义了存储资源，系统根据持久卷创建持久卷 <img src="`+e+'" alt=""></p><p>4、创建有状态副本集（deployment）</p><p>5、创建服务</p><p>服务（Service）提供一种抽象的方法，将运行在容器组（Pod）上的应用程序公开为网络服务。</p><ul><li>集群内访问</li><li>集群外访问</li></ul><p><img src="'+l+'" alt=""></p><p>6、导入数据 <img src="'+p+`" alt=""> 数据库</p><ul><li>ruoyi-cloud</li><li>ruoyi-seata</li><li>ruoyi-config</li></ul><h4 id="redis-大部分同上" tabindex="-1">REDIS（大部分同上） <a class="header-anchor" href="#redis-大部分同上" aria-label="Permalink to &quot;REDIS（大部分同上）&quot;">​</a></h4><p>1、创建ConfigMap（也就是配置文件）</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">appendonly</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> yes</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">port</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 6379</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bind</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0.0.0.0</span></span></code></pre></div><p>2、创建有状态副本集（deployment） 3、创建服务</p><h4 id="nacos" tabindex="-1">NACOS <a class="header-anchor" href="#nacos" aria-label="Permalink to &quot;NACOS&quot;">​</a></h4><p>1、创建ConfigMap（也就是配置文件）</p><ul><li>application.properties</li></ul><div class="language-properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">properties</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Copyright 1999-2021 Alibaba Group Holding Ltd.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># you may not use this file except in compliance with the License.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># You may obtain a copy of the License at</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#      http://www.apache.org/licenses/LICENSE-2.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Unless required by applicable law or agreed to in writing, software</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># distributed under the License is distributed on an &quot;AS IS&quot; BASIS,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># See the License for the specific language governing permissions and</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># limitations under the License.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Spring Boot Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Default web context path:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.servlet.contextPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=/nacos</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Include message field</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.error.include-message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=ALWAYS</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Default web server port:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.port</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=8848</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Network Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If prefer hostname over ip for Nacos server addresses in cluster.conf:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.inetutils.prefer-hostname-over-ip=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Specify local server&#39;s IP:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.inetutils.ip-address=</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Config Module Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If use MySQL as datasource:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Deprecated configuration property, it is recommended to use \`spring.sql.init.platform\` replaced.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> spring.datasource.platform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=mysql</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> spring.sql.init.platform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=mysql</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Count of DB:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> db.num</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=1</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Connect URL of DB:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> db.url.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=jdbc:mysql://mall-mysql.mall:3306/ry-config?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">characterEncoding</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=utf8&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">connectTimeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=1000&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">socketTimeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=3000&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">autoReconnect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">useUnicode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">useSSL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">serverTimezone</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=UTC</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> db.user.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=root</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> db.password.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=root</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Connection pool configuration: hikariCP</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db.pool.config.connectionTimeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=30000</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db.pool.config.validationTimeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=10000</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db.pool.config.maximumPoolSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=20</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db.pool.config.minimumIdle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=2</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### the maximum retry times for push</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.config.push.maxRetryTime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=50</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Naming Module Related Configurations ***************#</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If enable data warmup. If set to false, the server would accept request without local data preparation:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.data.warmup=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If enable the instance auto expiration, kind like of health check of instance:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.expireInstance=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Add in 2.0.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The interval to clean empty service, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.clean.empty-service.interval=60000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The expired time to clean empty service, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.clean.empty-service.expired-time=60000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The interval to clean expired metadata, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.clean.expired-metadata.interval=5000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The expired time to clean metadata, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.clean.expired-metadata.expired-time=60000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The delay time before push task to execute from service changed, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.push.pushTaskDelay=500</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The timeout for push task execute, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.push.pushTaskTimeout=5000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The delay time for retrying failed push task, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.push.pushTaskRetryDelay=1000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Since 2.0.3</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The expired time for inactive client, unit: milliseconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.naming.client.expired.time=180000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** CMDB Module Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The interval to dump external CMDB in seconds:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.cmdb.dumpTaskInterval=3600</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The interval of polling data change event in seconds:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.cmdb.eventTaskInterval=10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The interval of loading labels in seconds:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.cmdb.labelTaskInterval=300</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If turn on data loading task:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.cmdb.loadDataAtStart=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#***********Metrics for tomcat **************************#</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.tomcat.mbeanregistry.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#***********Expose prometheus and health **************************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.endpoints.web.exposure.include=prometheus,health</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Metrics for elastic search</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">management.metrics.export.elastic.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.metrics.export.elastic.host=http://localhost:9200</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Metrics for influx</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">management.metrics.export.influx.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.metrics.export.influx.db=springboot</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.metrics.export.influx.uri=http://localhost:8086</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.metrics.export.influx.auto-create-db=true</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.metrics.export.influx.consistency=one</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#management.metrics.export.influx.compressed=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Access Log Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If turn on the access log:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.tomcat.accesslog.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### file name pattern, one file per hour</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.tomcat.accesslog.rotate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.tomcat.accesslog.file-date-format</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=.yyyy-MM-dd-HH</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The access log pattern:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.tomcat.accesslog.pattern</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=%h %l %u %t </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;%r&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> %s %b %D %{User-Agent}i %{Request-Source}i</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The directory of access log:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server.tomcat.basedir</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=file:.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Access Control Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If enable spring security, this option is deprecated in 1.2.0:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#spring.security.enabled=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The ignore urls of auth</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.security.ignore.urls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=/,/error,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-ui/public/**,/v1/auth/**,/v1/console/health/**,/actuator/**,/v1/console/server/**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The auth system to use, currently only &#39;nacos&#39; and &#39;ldap&#39; is supported:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.system.type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=nacos</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If turn on auth system:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Turn on/off caching of auth information. By turning on this switch, the update of auth information would have a 15 seconds delay.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.caching.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Since 1.4.1, Turn on/off white auth for user-agent: nacos-server, only for upgrade from old version.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.enable.userAgentAuthWhite</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Since 1.4.1, worked when nacos.core.auth.enabled=true and nacos.core.auth.enable.userAgentAuthWhite=false.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The two properties is the white list for auth and used by identity the request from other server.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.server.identity.key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.server.identity.value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### worked when nacos.core.auth.system.type=nacos</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The token expiration in seconds:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.plugin.nacos.token.cache.enable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.plugin.nacos.token.expire.seconds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=18000</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### The default token (Base64 String):</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.core.auth.plugin.nacos.token.secret.key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### worked when nacos.core.auth.system.type=ldap，{0} is Placeholder,replace login username</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.url=ldap://localhost:389</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.basedc=dc=example,dc=org</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.userDn=cn=admin,\${nacos.core.auth.ldap.basedc}</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.password=admin</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.userdn=cn={0},dc=example,dc=org</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.filter.prefix=uid</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.case.sensitive=true</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.auth.ldap.ignore.partial.result.exception=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Control Plugin Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># plugin type</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.plugin.control.manager.type=nacos</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># local control rule storage dir, default \${nacos.home}/data/connection and \${nacos.home}/data/tps</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.plugin.control.rule.local.basedir=\${nacos.home}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># external control rule storage type, if exist</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.plugin.control.rule.external.storage=</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Config Change Plugin Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># webhook</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.config.plugin.webhook.enabled=false</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># It is recommended to use EB https://help.aliyun.com/document_detail/413974.html</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.config.plugin.webhook.url=http://localhost:8080/webhook/send?token=***</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The content push max capacity ,byte</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.config.plugin.webhook.contentMaxCapacity=102400</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># whitelist</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.config.plugin.whitelist.enabled=false</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The import file suffixs</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.config.plugin.whitelist.suffixs=xml,text,properties,yaml,html</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># fileformatcheck,which validate the import file of type and content</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.core.config.plugin.fileformatcheck.enabled=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Istio Related Configurations ***************#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### If turn on the MCP server:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">nacos.istio.mcp.server.enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Core Related Configurations ***************#</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### set the WorkerID manually</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.snowflake.worker-id=</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Member-MetaData</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.member.meta.site=</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.member.meta.adweight=</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.member.meta.weight=</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### MemberLookup</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Addressing pattern category, If set, the priority is highest</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.member.lookup.type=[file,address-server]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Set the cluster list with a configuration file or command-line argument</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.member.list=192.168.16.101:8847?raft_port=8807,192.168.16.101?raft_port=8808,192.168.16.101:8849?raft_port=8809</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## for AddressServerMemberLookup</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Maximum number of retries to query the address server upon initialization</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.address-server.retry=5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Server domain name address of [address-server] mode</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># address.server.domain=jmenv.tbsite.net</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Server port of [address-server] mode</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># address.server.port=8080</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Request address of [address-server] mode</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># address.server.url=/nacos/serverlist</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** JRaft Related Configurations ***************#</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Sets the Raft cluster election timeout, default value is 5 second</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.raft.data.election_timeout_ms=5000</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Sets the amount of time the Raft snapshot will execute periodically, default is 30 minute</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.raft.data.snapshot_interval_secs=30</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### raft internal worker threads</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.raft.data.core_thread_num=8</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Number of threads required for raft business request processing</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.raft.data.cli_service_thread_num=4</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### raft linear read strategy. Safe linear reads are used by default, that is, the Leader tenure is confirmed by heartbeat</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.raft.data.read_index_type=ReadOnlySafe</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### rpc request timeout, default 5 seconds</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.raft.data.rpc_request_timeout_ms=5000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Distro Related Configurations ***************#</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Distro data sync delay time, when sync task delayed, task will be merged for same data key. Default 1 second.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.distro.data.sync.delayMs=1000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Distro data sync timeout for one sync data, default 3 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.distro.data.sync.timeoutMs=3000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Distro data sync retry delay time when sync data failed or timeout, same behavior with delayMs, default 3 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.distro.data.sync.retryDelayMs=3000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Distro data verify interval time, verify synced data whether expired for a interval. Default 5 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.distro.data.verify.intervalMs=5000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Distro data verify timeout for one verify, default 3 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.distro.data.verify.timeoutMs=3000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Distro data load retry delay when load snapshot data failed, default 30 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># nacos.core.protocol.distro.data.load.retryDelayMs=30000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### enable to support prometheus service discovery</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.prometheus.metrics.enabled=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">### Since 2.3</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#*************** Grpc Configurations ***************#</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## sdk grpc(between nacos server and client) configuration</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets the maximum message size allowed to be received on the server.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.sdk.max-inbound-message-size=10485760</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets the time(milliseconds) without read activity before sending a keepalive ping. The typical default is two hours.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.sdk.keep-alive-time=7200000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets a time(milliseconds) waiting for read activity after sending a keepalive ping. Defaults to 20 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.sdk.keep-alive-timeout=20000</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets a time(milliseconds) that specify the most aggressive keep-alive time clients are permitted to configure. The typical default is 5 minutes</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.sdk.permit-keep-alive-time=300000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## cluster grpc(inside the nacos server) configuration</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.cluster.max-inbound-message-size=10485760</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets the time(milliseconds) without read activity before sending a keepalive ping. The typical default is two hours.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.cluster.keep-alive-time=7200000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets a time(milliseconds) waiting for read activity after sending a keepalive ping. Defaults to 20 seconds.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.cluster.keep-alive-timeout=20000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## Sets a time(milliseconds) that specify the most aggressive keep-alive time clients are permitted to configure. The typical default is 5 minutes</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.remote.server.grpc.cluster.permit-keep-alive-time=300000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">## open nacos default console ui</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#nacos.console.ui.enabled=true</span></span></code></pre></div><ul><li>cluster.conf</li></ul><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>#</span></span>
<span class="line"><span># Copyright 1999-2021 Alibaba Group Holding Ltd.</span></span>
<span class="line"><span>#</span></span>
<span class="line"><span># Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);</span></span>
<span class="line"><span># you may not use this file except in compliance with the License.</span></span>
<span class="line"><span># You may obtain a copy of the License at</span></span>
<span class="line"><span>#</span></span>
<span class="line"><span>#      http://www.apache.org/licenses/LICENSE-2.0</span></span>
<span class="line"><span>#</span></span>
<span class="line"><span># Unless required by applicable law or agreed to in writing, software</span></span>
<span class="line"><span># distributed under the License is distributed on an &quot;AS IS&quot; BASIS,</span></span>
<span class="line"><span># WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.</span></span>
<span class="line"><span># See the License for the specific language governing permissions and</span></span>
<span class="line"><span># limitations under the License.</span></span>
<span class="line"><span>#</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#it is ip</span></span>
<span class="line"><span>#example</span></span>
<span class="line"><span></span></span>
<span class="line"><span>mall-nacos-0.mall-nacos.mall.svc.cluster.local:8848</span></span>
<span class="line"><span>mall-nacos-1.mall-nacos.mall.svc.cluster.local:8848</span></span></code></pre></div><p><img src="`+t+`" alt=""></p><ul><li>如果想以单节点部署，则需要修改配置文件，将<code>cluster.conf</code>文件删除，创建<code>deploy</code>的时候增加环境变量 <code>MODE=standalone</code></li></ul><h3 id="_2、无状态副本集部署" tabindex="-1">2、无状态副本集部署 <a class="header-anchor" href="#_2、无状态副本集部署" aria-label="Permalink to &quot;2、无状态副本集部署&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>com.ruoyi     </span></span>
<span class="line"><span>├── ruoyi-ui              // 前端框架 [80]</span></span>
<span class="line"><span>├── ruoyi-gateway         // 网关模块 [8080]</span></span>
<span class="line"><span>├── ruoyi-auth            // 认证中心 [9200]</span></span>
<span class="line"><span>├── ruoyi-api             // 接口模块</span></span>
<span class="line"><span>│       └── ruoyi-api-system                          // 系统接口</span></span>
<span class="line"><span>├── ruoyi-common          // 通用模块</span></span>
<span class="line"><span>│       └── ruoyi-common-core                         // 核心模块</span></span>
<span class="line"><span>│       └── ruoyi-common-datascope                    // 权限范围</span></span>
<span class="line"><span>│       └── ruoyi-common-datasource                   // 多数据源</span></span>
<span class="line"><span>│       └── ruoyi-common-log                          // 日志记录</span></span>
<span class="line"><span>│       └── ruoyi-common-redis                        // 缓存服务</span></span>
<span class="line"><span>│       └── ruoyi-common-seata                        // 分布式事务</span></span>
<span class="line"><span>│       └── ruoyi-common-security                     // 安全模块</span></span>
<span class="line"><span>│       └── ruoyi-common-swagger                      // 系统接口</span></span>
<span class="line"><span>├── ruoyi-modules         // 业务模块</span></span>
<span class="line"><span>│       └── ruoyi-system                              // 系统模块 [9201]</span></span>
<span class="line"><span>│       └── ruoyi-gen                                 // 代码生成 [9202]</span></span>
<span class="line"><span>│       └── ruoyi-job                                 // 定时任务 [9203]</span></span>
<span class="line"><span>│       └── ruoyi-file                                // 文件服务 [9300]</span></span>
<span class="line"><span>├── ruoyi-visual          // 图形化管理模块</span></span>
<span class="line"><span>│       └── ruoyi-visual-monitor                      // 监控中心 [9100]</span></span>
<span class="line"><span>├──pom.xml                // 公共依赖</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">基本的步骤</p><ul><li>打jar包，上传服务器(maven)</li><li>制作镜像（dockerfile）</li><li>推送镜像至镜像仓库(aliyun hub)</li><li>应用部署(k8s)</li></ul></div><h4 id="ruoyi-auth" tabindex="-1">ruoyi-auth <a class="header-anchor" href="#ruoyi-auth" aria-label="Permalink to &quot;ruoyi-auth&quot;">​</a></h4><ul><li>打jar包，上传服务器(maven) 直接使用maven工具打包，没啥说的</li><li>制作镜像（dockerfile）</li></ul><div class="language-dockerfile vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> openjdk:8-jdk</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">LABEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> maintainer=justin</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ENV</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PARAMS=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;--server.port=9200 --spring.profiles.active=prod --spring.cloud.nacos.discovery.server-addr=mall-nacos.mall:8848 --spring.cloud.nacos.config.server-addr=mall-nacos.mall:8848 </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">--spring.cloud.nacos.config.namespace=prod </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">--spring.cloud.nacos.config.file-extension=yml&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime &amp;&amp; echo </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Asia/Shanghai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &gt;/etc/timezone</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> target/*.jar /app.jar</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">EXPOSE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 9200</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ENTRYPOINT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/bin/sh&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;-c&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;java -Dfile.encoding=utf8 -Djava.security.egd=file:/dev/./urandom -jar app.jar \${PARAMS}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre></div><p>目录</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker     </span></span>
<span class="line"><span>├── ruoyi-ui   </span></span>
<span class="line"><span>|      └── dockerfile</span></span>
<span class="line"><span>|      └── config</span></span>
<span class="line"><span>|        └── nginx.conf</span></span>
<span class="line"><span>|      └── html </span></span>
<span class="line"><span>|        └── dist         </span></span>
<span class="line"><span>├── ruoyi-gateway   </span></span>
<span class="line"><span>|      └── dockerfile     </span></span>
<span class="line"><span>|      └── target</span></span>
<span class="line"><span>|        └── ruoyi-gateway.jar </span></span>
<span class="line"><span>├── ruoyi-auth           </span></span>
<span class="line"><span>├── ruoyi-system              </span></span>
<span class="line"><span>├── ruoyi-visual-monitor          </span></span>
<span class="line"><span>├── rruoyi-file        </span></span>
<span class="line"><span>├── ruoyi-job</span></span></code></pre></div><p>使用docker制作镜像</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ruoyi-auth:v1</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -f</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dockerfile</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> .</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tag</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ruoyi-gateway:v1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> registry.cn-hangzhou.aliyuncs.com/justin-ruoyi/ruoyi-auth:v1</span></span></code></pre></div><ul><li>推送镜像至镜像仓库(aliyun hub)</li></ul><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> login</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> registry.cn-hangzhou.aliyuncs.com/justin-ruoyi/ruoyi-auth:v1</span></span></code></pre></div><ul><li>应用部署(k8s) 很简答没啥记录的</li></ul><h4 id="ruoyi-ui" tabindex="-1">ruoyi-ui <a class="header-anchor" href="#ruoyi-ui" aria-label="Permalink to &quot;ruoyi-ui&quot;">​</a></h4><p>配置文件修改<code>vue.config.js</code>文件</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span> devServer: {</span></span>
<span class="line"><span>    host: &#39;0.0.0.0&#39;,</span></span>
<span class="line"><span>    port: port,</span></span>
<span class="line"><span>    open: true,</span></span>
<span class="line"><span>    proxy: {</span></span>
<span class="line"><span>      // detail: https://cli.vuejs.org/config/#devserver-proxy</span></span>
<span class="line"><span>      [process.env.VUE_APP_BASE_API]: {</span></span>
<span class="line"><span>        target: \`http://ruoyi-gateway.mall:8080\`, # 云网关地址</span></span>
<span class="line"><span>        changeOrigin: true,</span></span>
<span class="line"><span>        pathRewrite: {</span></span>
<span class="line"><span>          [&#39;^&#39; + process.env.VUE_APP_BASE_API]: &#39;&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    },</span></span></code></pre></div><p>dockerfile文件</p><div class="language-dockerfile vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 基础镜像</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> nginx</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># author</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">MAINTAINER</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ruoyi</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 挂载目录</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VOLUME</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /home/ruoyi/projects/ruoyi-ui</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 创建目录</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mkdir -p /home/ruoyi/projects/ruoyi-ui</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 指定路径</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WORKDIR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /home/ruoyi/projects/ruoyi-ui</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 复制conf文件到路径</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ./conf/nginx.conf /etc/nginx/nginx.conf</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 复制html文件到路径</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ./html/dist /home/ruoyi/projects/ruoyi-ui</span></span></code></pre></div><p>配置文件修改<code>nginx.conf</code>文件</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>worker_processes  1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>events {</span></span>
<span class="line"><span>    worker_connections  1024;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>http {</span></span>
<span class="line"><span>    include       mime.types;</span></span>
<span class="line"><span>    default_type  application/octet-stream;</span></span>
<span class="line"><span>    sendfile        on;</span></span>
<span class="line"><span>    keepalive_timeout  65;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    server {</span></span>
<span class="line"><span>        listen       80;</span></span>
<span class="line"><span>        server_name  _;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        location / {</span></span>
<span class="line"><span>            root   /home/ruoyi/projects/ruoyi-ui;</span></span>
<span class="line"><span>            try_files $uri $uri/ /index.html;</span></span>
<span class="line"><span>            index  index.html index.htm;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        location /prod-api/{</span></span>
<span class="line"><span>            proxy_set_header Host $http_host;</span></span>
<span class="line"><span>            proxy_set_header X-Real-IP $remote_addr;</span></span>
<span class="line"><span>            proxy_set_header REMOTE-HOST $remote_addr;</span></span>
<span class="line"><span>            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;</span></span>
<span class="line"><span>            proxy_pass http://ruoyi-gateway.mall:8080/;# 网关的集群内地址</span></span>
<span class="line"><span>            </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        # 避免actuator暴露</span></span>
<span class="line"><span>        if ($request_uri ~ &quot;/actuator&quot;) {</span></span>
<span class="line"><span>            return 403;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        error_page   500 502 503 504  /50x.html;</span></span>
<span class="line"><span>        location = /50x.html {</span></span>
<span class="line"><span>            root   html;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>上传服务器，制作镜像，推送阿里云，应用部署</p><h4 id="ruoyi-system" tabindex="-1">ruoyi-system <a class="header-anchor" href="#ruoyi-system" aria-label="Permalink to &quot;ruoyi-system&quot;">​</a></h4><h4 id="ruoyi-file" tabindex="-1">ruoyi-file <a class="header-anchor" href="#ruoyi-file" aria-label="Permalink to &quot;ruoyi-file&quot;">​</a></h4><h4 id="ruoyi-job" tabindex="-1">ruoyi-job <a class="header-anchor" href="#ruoyi-job" aria-label="Permalink to &quot;ruoyi-job&quot;">​</a></h4><h4 id="ruoyi-gateway" tabindex="-1">ruoyi-gateway <a class="header-anchor" href="#ruoyi-gateway" aria-label="Permalink to &quot;ruoyi-gateway&quot;">​</a></h4><h4 id="ruoyi-visual-monitor" tabindex="-1">ruoyi-visual-monitor <a class="header-anchor" href="#ruoyi-visual-monitor" aria-label="Permalink to &quot;ruoyi-visual-monitor&quot;">​</a></h4><h3 id="_3、截图" tabindex="-1">3、截图 <a class="header-anchor" href="#_3、截图" aria-label="Permalink to &quot;3、截图&quot;">​</a></h3><ul><li><p>阿里云镜像仓库 <img src="`+h+'" alt=""></p></li><li><p>Nacos的注册中心和配置中心</p></li></ul><p><img src="'+r+'" alt=""></p><p><img src="'+c+'" alt=""></p><ul><li><p>kubesphere <img src="'+k+'" alt=""><img src="'+o+'" alt=""><img src="'+d+'" alt=""></p></li><li><p>若依上云成功 <img src="'+g+`" alt=""></p></li></ul><h3 id="_4、总结" tabindex="-1">4、总结 <a class="header-anchor" href="#_4、总结" aria-label="Permalink to &quot;4、总结&quot;">​</a></h3><p>此次上云部署遇到了很多的问题，大概说一下</p><h4 id="问题1-kubesphere-的安装问题" tabindex="-1"><strong>问题1：kubesphere 的安装问题：</strong> <a class="header-anchor" href="#问题1-kubesphere-的安装问题" aria-label="Permalink to &quot;**问题1：kubesphere 的安装问题：**&quot;">​</a></h4><p><strong>描述：</strong></p><p>一直无法拉取相关的镜像，即使配置了阿里云的加速地址，还是无法成功，真的很头疼</p><p><strong>解决：</strong></p><p>自己电脑安装docker，通过科学上网的方式进行拉取，然后再上传服务器即可解决。也有可能下载不下来原因是我安装的黑苹果对网卡的兼容不是很好，所以下载失败。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> save</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -o</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubesphere-all-v3.1.0.tar</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubespheredev/ks-installer:v3.1.0</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> load</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kubesphere-all-v3.1.0.tar</span></span></code></pre></div><h4 id="问题2-资源不足" tabindex="-1"><strong>问题2：资源不足</strong> <a class="header-anchor" href="#问题2-资源不足" aria-label="Permalink to &quot;**问题2：资源不足**&quot;">​</a></h4><p><strong>描述：</strong></p><p>在部署微服务的时候 <code>0/1 nodes are available: 1 Insufficient cpu.</code>,<code>0/1 nodes are available: 1 Insufficient memory.</code>出现这个问题导致部署失败</p><p><strong>解决：</strong></p><p>因为我是用的是虚拟机，并且使用<code>All-in-One</code>模式安装kubesphere，只有单节点，没有部署集群模式，所以在后期部署的时候不是cpu不够就是内存不够，还有硬盘不足，幸好另一台电脑是16G+1t,只能继续给虚拟机加资源了。所以在部署前还是要有一定的规划的。虽然此次的中间件和微服务不算多，也用掉了7G多一点。</p><p><img src="`+y+'" alt=""></p><h4 id="问题3-前端ruoyi-ui" tabindex="-1"><strong>问题3：前端ruoyi-ui</strong> <a class="header-anchor" href="#问题3-前端ruoyi-ui" aria-label="Permalink to &quot;**问题3：前端ruoyi-ui**&quot;">​</a></h4><p><strong>描述：</strong></p><p>部署完成之后，浏览器总是报错<code>内部服务错误</code>,验证码也不显示。</p><p><strong>解决：</strong></p><p>观看<code>ruoyi-ui</code>的日志，没有发现什么错误，然后转念一想发请求首先会通过<code>ruoyi-gateway</code>网关，那么我去看了一下他的日志，果然找到了问题。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">17:13:15.897</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [reactor-http-epoll-2] ERROR c.r.g.h.GatewayExceptionHandler - [handle,52] - [网关异常处理]请求路径:/code,异常信息:Unable to connect to Redis; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">nested</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> exception</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> is</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> io.lettuce.core.RedisConnectionException:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Unable</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> to</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> connect</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> to</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> localhost:6379</span></span></code></pre></div><p>错误提示是说无法连接redis，并且无法访问<code>localhost:6379</code>，所以问题出在redis上，我查看了<code>ruoyi-gateway</code>的配置文件，发现redis配置正确啊，并没有什么<code>localhost:6379</code>，此时就卡住了。喝了口水之后，想了一下到底哪里出问题了，<code>ruoyi-ui</code>没问题，<code>gateway</code>连接redis没有问题，那我重新将gateway副本减为0，重新部署一下，成功了。就很奇怪，可能是我修改了配置文件后，没有重新部署，所以才出问题。</p><h4 id="问题4-服务器重启-微服务失败" tabindex="-1"><strong>问题4：服务器重启，微服务失败</strong> <a class="header-anchor" href="#问题4-服务器重启-微服务失败" aria-label="Permalink to &quot;**问题4：服务器重启，微服务失败**&quot;">​</a></h4><p><strong>描述：</strong></p><p>机器重启后，微服务一部分失败，微服务连接nacos失败，nacos日志<code>No Datasource set</code>，主要就是数据库没有准备好，nacos连接数据失败，从而导致微服务启动失败。</p><p><strong>解决：</strong></p><p>等待mysql启动成功，然后nacos重新启动，最后微服务启动即可。 k8s健康检查机制：</p><ol><li>livenessProbe：存活探针，用于检测应用是否存活，如果应用存活则继续运行，否则重启应用。</li><li>readinessProbe：就绪探针，用于检测应用是否就绪，如果应用就绪则允许接收请求，否则拒绝请求。</li><li>startupProbe：启动探针，用于检测应用是否启动完成，如果应用启动完成则继续运行，否则重启应用。</li></ol><p><img src="'+u+'" alt=""><img src="'+A+'" alt=""><img src="'+D+'" alt=""></p>',92),f=[E];function b(v,F,C,x,_,q){return n(),a("div",null,f)}const B=s(m,[["render",b]]);export{S as __pageData,B as default};
