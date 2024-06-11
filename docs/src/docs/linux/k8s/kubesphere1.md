---
outline: [1,4]
---
# kubesphere 入门
## 多租户
## 中间件部署
:::tip 部署三要素
应用部署需要关注的信息【应用部署三要素】
- 应用的部署方式
- 应用的数据挂载（数据，配置文件）
- 应用的可访问性
:::

- 有状态副本集 - Deployment（中间件）
- 无状态副本集 - StatefulSet （微服务）
- 守护进程     - DaemonSet （日志采集）

## [若依](https://gitee.com/upjustin/RuoYi-Cloud)框架上云部署
### 1、有状态副本集部署（mysql，redis，nacos）
#### MYSQL
1、创建ConfigMap（也就是配置文件）
```sql
[client]
default-character-set=utf8mb4
 
[mysql]
default-character-set=utf8mb4
 
[mysqld]
init_connect='SET collation_connection = utf8mb4_unicode_ci'
init_connect='SET NAMES utf8mb4'
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
skip-character-set-client-handshake
```

2、创建持久卷申明

持久卷声明定义了存储需求，系统根据持久卷声明创建持久卷

3、创建持久卷

持久卷定义了存储资源，系统根据持久卷创建持久卷
![](/assets/image/docker/mysqlpvc.png)

4、创建有状态副本集（deployment）

5、创建服务

服务（Service）提供一种抽象的方法，将运行在容器组（Pod）上的应用程序公开为网络服务。
- 集群内访问
- 集群外访问

![](/assets/image/docker/mysql-svc.png)

6、导入数据
![](/assets/image/docker/sql.png)
数据库
- ruoyi-cloud
- ruoyi-seata
- ruoyi-config
#### REDIS（大部分同上）

1、创建ConfigMap（也就是配置文件）
```bash
appendonly yes
port 6379
bind 0.0.0.0
```
2、创建有状态副本集（deployment）
3、创建服务
#### NACOS
1、创建ConfigMap（也就是配置文件）
- application.properties
```properties
#
# Copyright 1999-2021 Alibaba Group Holding Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#*************** Spring Boot Related Configurations ***************#
### Default web context path:
server.servlet.contextPath=/nacos
### Include message field
server.error.include-message=ALWAYS
### Default web server port:
server.port=8848

#*************** Network Related Configurations ***************#
### If prefer hostname over ip for Nacos server addresses in cluster.conf:
# nacos.inetutils.prefer-hostname-over-ip=false

### Specify local server's IP:
# nacos.inetutils.ip-address=


#*************** Config Module Related Configurations ***************#
### If use MySQL as datasource:
### Deprecated configuration property, it is recommended to use `spring.sql.init.platform` replaced.
 spring.datasource.platform=mysql
 spring.sql.init.platform=mysql

### Count of DB:
 db.num=1

### Connect URL of DB:
 db.url.0=jdbc:mysql://mall-mysql.mall:3306/ry-config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
 db.user.0=root
 db.password.0=root

### Connection pool configuration: hikariCP
db.pool.config.connectionTimeout=30000
db.pool.config.validationTimeout=10000
db.pool.config.maximumPoolSize=20
db.pool.config.minimumIdle=2

### the maximum retry times for push
nacos.config.push.maxRetryTime=50

#*************** Naming Module Related Configurations ***************#

### If enable data warmup. If set to false, the server would accept request without local data preparation:
# nacos.naming.data.warmup=true

### If enable the instance auto expiration, kind like of health check of instance:
# nacos.naming.expireInstance=true

### Add in 2.0.0
### The interval to clean empty service, unit: milliseconds.
# nacos.naming.clean.empty-service.interval=60000

### The expired time to clean empty service, unit: milliseconds.
# nacos.naming.clean.empty-service.expired-time=60000

### The interval to clean expired metadata, unit: milliseconds.
# nacos.naming.clean.expired-metadata.interval=5000

### The expired time to clean metadata, unit: milliseconds.
# nacos.naming.clean.expired-metadata.expired-time=60000

### The delay time before push task to execute from service changed, unit: milliseconds.
# nacos.naming.push.pushTaskDelay=500

### The timeout for push task execute, unit: milliseconds.
# nacos.naming.push.pushTaskTimeout=5000

### The delay time for retrying failed push task, unit: milliseconds.
# nacos.naming.push.pushTaskRetryDelay=1000

### Since 2.0.3
### The expired time for inactive client, unit: milliseconds.
# nacos.naming.client.expired.time=180000

#*************** CMDB Module Related Configurations ***************#
### The interval to dump external CMDB in seconds:
# nacos.cmdb.dumpTaskInterval=3600

### The interval of polling data change event in seconds:
# nacos.cmdb.eventTaskInterval=10

### The interval of loading labels in seconds:
# nacos.cmdb.labelTaskInterval=300

### If turn on data loading task:
# nacos.cmdb.loadDataAtStart=false

#***********Metrics for tomcat **************************#
server.tomcat.mbeanregistry.enabled=true

#***********Expose prometheus and health **************************#
#management.endpoints.web.exposure.include=prometheus,health

### Metrics for elastic search
management.metrics.export.elastic.enabled=false
#management.metrics.export.elastic.host=http://localhost:9200

### Metrics for influx
management.metrics.export.influx.enabled=false
#management.metrics.export.influx.db=springboot
#management.metrics.export.influx.uri=http://localhost:8086
#management.metrics.export.influx.auto-create-db=true
#management.metrics.export.influx.consistency=one
#management.metrics.export.influx.compressed=true

#*************** Access Log Related Configurations ***************#
### If turn on the access log:
server.tomcat.accesslog.enabled=true

### file name pattern, one file per hour
server.tomcat.accesslog.rotate=true
server.tomcat.accesslog.file-date-format=.yyyy-MM-dd-HH
### The access log pattern:
server.tomcat.accesslog.pattern=%h %l %u %t "%r" %s %b %D %{User-Agent}i %{Request-Source}i

### The directory of access log:
server.tomcat.basedir=file:.

#*************** Access Control Related Configurations ***************#
### If enable spring security, this option is deprecated in 1.2.0:
#spring.security.enabled=false

### The ignore urls of auth
nacos.security.ignore.urls=/,/error,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-ui/public/**,/v1/auth/**,/v1/console/health/**,/actuator/**,/v1/console/server/**

### The auth system to use, currently only 'nacos' and 'ldap' is supported:
nacos.core.auth.system.type=nacos

### If turn on auth system:
nacos.core.auth.enabled=false

### Turn on/off caching of auth information. By turning on this switch, the update of auth information would have a 15 seconds delay.
nacos.core.auth.caching.enabled=true

### Since 1.4.1, Turn on/off white auth for user-agent: nacos-server, only for upgrade from old version.
nacos.core.auth.enable.userAgentAuthWhite=false

### Since 1.4.1, worked when nacos.core.auth.enabled=true and nacos.core.auth.enable.userAgentAuthWhite=false.
### The two properties is the white list for auth and used by identity the request from other server.
nacos.core.auth.server.identity.key=
nacos.core.auth.server.identity.value=

### worked when nacos.core.auth.system.type=nacos
### The token expiration in seconds:
nacos.core.auth.plugin.nacos.token.cache.enable=false
nacos.core.auth.plugin.nacos.token.expire.seconds=18000
### The default token (Base64 String):
nacos.core.auth.plugin.nacos.token.secret.key=

### worked when nacos.core.auth.system.type=ldap，{0} is Placeholder,replace login username
#nacos.core.auth.ldap.url=ldap://localhost:389
#nacos.core.auth.ldap.basedc=dc=example,dc=org
#nacos.core.auth.ldap.userDn=cn=admin,${nacos.core.auth.ldap.basedc}
#nacos.core.auth.ldap.password=admin
#nacos.core.auth.ldap.userdn=cn={0},dc=example,dc=org
#nacos.core.auth.ldap.filter.prefix=uid
#nacos.core.auth.ldap.case.sensitive=true
#nacos.core.auth.ldap.ignore.partial.result.exception=false

#*************** Control Plugin Related Configurations ***************#
# plugin type
#nacos.plugin.control.manager.type=nacos

# local control rule storage dir, default ${nacos.home}/data/connection and ${nacos.home}/data/tps
#nacos.plugin.control.rule.local.basedir=${nacos.home}

# external control rule storage type, if exist
#nacos.plugin.control.rule.external.storage=

#*************** Config Change Plugin Related Configurations ***************#
# webhook
#nacos.core.config.plugin.webhook.enabled=false
# It is recommended to use EB https://help.aliyun.com/document_detail/413974.html
#nacos.core.config.plugin.webhook.url=http://localhost:8080/webhook/send?token=***
# The content push max capacity ,byte
#nacos.core.config.plugin.webhook.contentMaxCapacity=102400

# whitelist
#nacos.core.config.plugin.whitelist.enabled=false
# The import file suffixs
#nacos.core.config.plugin.whitelist.suffixs=xml,text,properties,yaml,html
# fileformatcheck,which validate the import file of type and content
#nacos.core.config.plugin.fileformatcheck.enabled=false

#*************** Istio Related Configurations ***************#
### If turn on the MCP server:
nacos.istio.mcp.server.enabled=false

#*************** Core Related Configurations ***************#

### set the WorkerID manually
# nacos.core.snowflake.worker-id=

### Member-MetaData
# nacos.core.member.meta.site=
# nacos.core.member.meta.adweight=
# nacos.core.member.meta.weight=

### MemberLookup
### Addressing pattern category, If set, the priority is highest
# nacos.core.member.lookup.type=[file,address-server]
## Set the cluster list with a configuration file or command-line argument
# nacos.member.list=192.168.16.101:8847?raft_port=8807,192.168.16.101?raft_port=8808,192.168.16.101:8849?raft_port=8809
## for AddressServerMemberLookup
# Maximum number of retries to query the address server upon initialization
# nacos.core.address-server.retry=5
## Server domain name address of [address-server] mode
# address.server.domain=jmenv.tbsite.net
## Server port of [address-server] mode
# address.server.port=8080
## Request address of [address-server] mode
# address.server.url=/nacos/serverlist

#*************** JRaft Related Configurations ***************#

### Sets the Raft cluster election timeout, default value is 5 second
# nacos.core.protocol.raft.data.election_timeout_ms=5000
### Sets the amount of time the Raft snapshot will execute periodically, default is 30 minute
# nacos.core.protocol.raft.data.snapshot_interval_secs=30
### raft internal worker threads
# nacos.core.protocol.raft.data.core_thread_num=8
### Number of threads required for raft business request processing
# nacos.core.protocol.raft.data.cli_service_thread_num=4
### raft linear read strategy. Safe linear reads are used by default, that is, the Leader tenure is confirmed by heartbeat
# nacos.core.protocol.raft.data.read_index_type=ReadOnlySafe
### rpc request timeout, default 5 seconds
# nacos.core.protocol.raft.data.rpc_request_timeout_ms=5000

#*************** Distro Related Configurations ***************#

### Distro data sync delay time, when sync task delayed, task will be merged for same data key. Default 1 second.
# nacos.core.protocol.distro.data.sync.delayMs=1000

### Distro data sync timeout for one sync data, default 3 seconds.
# nacos.core.protocol.distro.data.sync.timeoutMs=3000

### Distro data sync retry delay time when sync data failed or timeout, same behavior with delayMs, default 3 seconds.
# nacos.core.protocol.distro.data.sync.retryDelayMs=3000

### Distro data verify interval time, verify synced data whether expired for a interval. Default 5 seconds.
# nacos.core.protocol.distro.data.verify.intervalMs=5000

### Distro data verify timeout for one verify, default 3 seconds.
# nacos.core.protocol.distro.data.verify.timeoutMs=3000

### Distro data load retry delay when load snapshot data failed, default 30 seconds.
# nacos.core.protocol.distro.data.load.retryDelayMs=30000

### enable to support prometheus service discovery
#nacos.prometheus.metrics.enabled=true

### Since 2.3
#*************** Grpc Configurations ***************#

## sdk grpc(between nacos server and client) configuration
## Sets the maximum message size allowed to be received on the server.
#nacos.remote.server.grpc.sdk.max-inbound-message-size=10485760

## Sets the time(milliseconds) without read activity before sending a keepalive ping. The typical default is two hours.
#nacos.remote.server.grpc.sdk.keep-alive-time=7200000

## Sets a time(milliseconds) waiting for read activity after sending a keepalive ping. Defaults to 20 seconds.
#nacos.remote.server.grpc.sdk.keep-alive-timeout=20000


## Sets a time(milliseconds) that specify the most aggressive keep-alive time clients are permitted to configure. The typical default is 5 minutes
#nacos.remote.server.grpc.sdk.permit-keep-alive-time=300000

## cluster grpc(inside the nacos server) configuration
#nacos.remote.server.grpc.cluster.max-inbound-message-size=10485760

## Sets the time(milliseconds) without read activity before sending a keepalive ping. The typical default is two hours.
#nacos.remote.server.grpc.cluster.keep-alive-time=7200000

## Sets a time(milliseconds) waiting for read activity after sending a keepalive ping. Defaults to 20 seconds.
#nacos.remote.server.grpc.cluster.keep-alive-timeout=20000

## Sets a time(milliseconds) that specify the most aggressive keep-alive time clients are permitted to configure. The typical default is 5 minutes
#nacos.remote.server.grpc.cluster.permit-keep-alive-time=300000

## open nacos default console ui
#nacos.console.ui.enabled=true
```
- cluster.conf
```text
#
# Copyright 1999-2021 Alibaba Group Holding Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#it is ip
#example

mall-nacos-0.mall-nacos.mall.svc.cluster.local:8848
mall-nacos-1.mall-nacos.mall.svc.cluster.local:8848
```
![](/assets/image/docker/nacos-pvc.png)

- 如果想以单节点部署，则需要修改配置文件，将`cluster.conf`文件删除，创建`deploy`的时候增加环境变量
`MODE=standalone`

### 2、无状态副本集部署

```
com.ruoyi     
├── ruoyi-ui              // 前端框架 [80]
├── ruoyi-gateway         // 网关模块 [8080]
├── ruoyi-auth            // 认证中心 [9200]
├── ruoyi-api             // 接口模块
│       └── ruoyi-api-system                          // 系统接口
├── ruoyi-common          // 通用模块
│       └── ruoyi-common-core                         // 核心模块
│       └── ruoyi-common-datascope                    // 权限范围
│       └── ruoyi-common-datasource                   // 多数据源
│       └── ruoyi-common-log                          // 日志记录
│       └── ruoyi-common-redis                        // 缓存服务
│       └── ruoyi-common-seata                        // 分布式事务
│       └── ruoyi-common-security                     // 安全模块
│       └── ruoyi-common-swagger                      // 系统接口
├── ruoyi-modules         // 业务模块
│       └── ruoyi-system                              // 系统模块 [9201]
│       └── ruoyi-gen                                 // 代码生成 [9202]
│       └── ruoyi-job                                 // 定时任务 [9203]
│       └── ruoyi-file                                // 文件服务 [9300]
├── ruoyi-visual          // 图形化管理模块
│       └── ruoyi-visual-monitor                      // 监控中心 [9100]
├──pom.xml                // 公共依赖
```
:::tip 基本的步骤
- 打jar包，上传服务器(maven)
- 制作镜像（dockerfile）
- 推送镜像至镜像仓库(aliyun hub)
- 应用部署(k8s)
:::
#### ruoyi-auth
- 打jar包，上传服务器(maven)
直接使用maven工具打包，没啥说的
- 制作镜像（dockerfile）
```dockerfile
FROM openjdk:8-jdk
LABEL maintainer=justin


ENV PARAMS="--server.port=9200 --spring.profiles.active=prod --spring.cloud.nacos.discovery.server-addr=mall-nacos.mall:8848 --spring.cloud.nacos.config.server-addr=mall-nacos.mall:8848 
--spring.cloud.nacos.config.namespace=prod 
--spring.cloud.nacos.config.file-extension=yml"

RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

COPY target/*.jar /app.jar

EXPOSE 9200


ENTRYPOINT ["/bin/sh","-c","java -Dfile.encoding=utf8 -Djava.security.egd=file:/dev/./urandom -jar app.jar ${PARAMS}"]
```
目录
```
docker     
├── ruoyi-ui   
|      └── dockerfile
|      └── config
|        └── nginx.conf
|      └── html 
|        └── dist         
├── ruoyi-gateway   
|      └── dockerfile     
|      └── target
|        └── ruoyi-gateway.jar 
├── ruoyi-auth           
├── ruoyi-system              
├── ruoyi-visual-monitor          
├── rruoyi-file        
├── ruoyi-job          

```

使用docker制作镜像
```bash
docker build -t ruoyi-auth:v1 -f dockerfile .
docker tag ruoyi-gateway:v1 registry.cn-hangzhou.aliyuncs.com/justin-ruoyi/ruoyi-auth:v1
```
- 推送镜像至镜像仓库(aliyun hub)
```bash
docker login
docker push registry.cn-hangzhou.aliyuncs.com/justin-ruoyi/ruoyi-auth:v1
``` 
- 应用部署(k8s)
很简答没啥记录的
#### ruoyi-ui
配置文件修改`vue.config.js`文件
```text
 devServer: {
    host: '0.0.0.0',
    port: port,
    open: true,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_BASE_API]: {
        target: `http://ruoyi-gateway.mall:8080`, # 云网关地址
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    },
```
dockerfile文件
```dockerfile
# 基础镜像
FROM nginx
# author
MAINTAINER ruoyi

# 挂载目录
VOLUME /home/ruoyi/projects/ruoyi-ui
# 创建目录
RUN mkdir -p /home/ruoyi/projects/ruoyi-ui
# 指定路径
WORKDIR /home/ruoyi/projects/ruoyi-ui
# 复制conf文件到路径
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
# 复制html文件到路径
COPY ./html/dist /home/ruoyi/projects/ruoyi-ui
```
配置文件修改`nginx.conf`文件
```text
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  _;

        location / {
            root   /home/ruoyi/projects/ruoyi-ui;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;
        }

        location /prod-api/{
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header REMOTE-HOST $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://ruoyi-gateway.mall:8080/;# 网关的集群内地址
            
        }

        # 避免actuator暴露
        if ($request_uri ~ "/actuator") {
            return 403;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```
上传服务器，制作镜像，推送阿里云，应用部署
#### ruoyi-system
#### ruoyi-file
#### ruoyi-job
#### ruoyi-gateway
#### ruoyi-visual-monitor
### 3、截图
- 阿里云镜像仓库
![](/assets/image/docker/alihub.png)

- Nacos的注册中心和配置中心

![](/assets/image/docker/register.png)

![](/assets/image/docker/nacos-yaml.png)

- kubesphere 
![](/assets/image/docker/有状态.png)
![](/assets/image/docker/无状态.png)
![](/assets/image/docker/svc.png)

- 若依上云成功
![](/assets/image/docker/ruoyi.png)

### 4、总结
此次上云部署遇到了很多的问题，大概说一下

#### **问题1：kubesphere 的安装问题：**

**描述：**

一直无法拉取相关的镜像，即使配置了阿里云的加速地址，还是无法成功，真的很头疼

**解决：**

自己电脑安装docker，通过科学上网的方式进行拉取，然后再上传服务器即可解决。也有可能下载不下来原因是我安装的黑苹果对网卡的兼容不是很好，所以下载失败。
```bash
docker save -o kubesphere-all-v3.1.0.tar kubespheredev/ks-installer:v3.1.0
docker load -i kubesphere-all-v3.1.0.tar
```

#### **问题2：资源不足**

**描述：**

在部署微服务的时候 `0/1 nodes are available: 1 Insufficient cpu.`,`0/1 nodes are available: 1 Insufficient memory.`出现这个问题导致部署失败

**解决：**

因为我是用的是虚拟机，并且使用`All-in-One`模式安装kubesphere，只有单节点，没有部署集群模式，所以在后期部署的时候不是cpu不够就是内存不够，还有硬盘不足，幸好另一台电脑是16G+1t,只能继续给虚拟机加资源了。所以在部署前还是要有一定的规划的。虽然此次的中间件和微服务不算多，也用掉了7G多一点。

![](/assets/image/docker/res.png)

#### **问题3：前端ruoyi-ui**

**描述：**

部署完成之后，浏览器总是报错`内部服务错误`,验证码也不显示。

**解决：**

观看`ruoyi-ui`的日志，没有发现什么错误，然后转念一想发请求首先会通过`ruoyi-gateway`网关，那么我去看了一下他的日志，果然找到了问题。
```bash
17:13:15.897 [reactor-http-epoll-2] ERROR c.r.g.h.GatewayExceptionHandler - [handle,52] - [网关异常处理]请求路径:/code,异常信息:Unable to connect to Redis; nested exception is io.lettuce.core.RedisConnectionException: Unable to connect to localhost:6379
```
错误提示是说无法连接redis，并且无法访问`localhost:6379`，所以问题出在redis上，我查看了`ruoyi-gateway`的配置文件，发现redis配置正确啊，并没有什么`localhost:6379`，此时就卡住了。喝了口水之后，想了一下到底哪里出问题了，`ruoyi-ui`没问题，`gateway`连接redis没有问题，那我重新将gateway副本减为0，重新部署一下，成功了。就很奇怪，可能是我修改了配置文件后，没有重新部署，所以才出问题。

#### **问题4：服务器重启，微服务失败**

**描述：**

机器重启后，微服务一部分失败，微服务连接nacos失败，nacos日志`No Datasource set`，主要就是数据库没有准备好，nacos连接数据失败，从而导致微服务启动失败。

**解决：**

等待mysql启动成功，然后nacos重新启动，最后微服务启动即可。
k8s健康检查机制：
1. livenessProbe：存活探针，用于检测应用是否存活，如果应用存活则继续运行，否则重启应用。
2. readinessProbe：就绪探针，用于检测应用是否就绪，如果应用就绪则允许接收请求，否则拒绝请求。
3. startupProbe：启动探针，用于检测应用是否启动完成，如果应用启动完成则继续运行，否则重启应用。

![](/assets/image/docker/就绪检查.png)
![](/assets/image/docker/存活检查.png)
![](/assets/image/docker/探针.png)