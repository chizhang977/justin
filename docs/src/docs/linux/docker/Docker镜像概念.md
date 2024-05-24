---
icon: docker
---
# Docker镜像概念

### UnionFS(联合文件系统)：

 一种分层、轻量级、高性能的文件系统，支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂在到同一个虚拟文件系统下。作为Docker镜像的基础，镜像通过分层来继承，基于基础镜像，制作各种具体的应用镜像。

### Docker镜像加载的原理：

- 当拉取或创建一个新的Docker镜像时，实际上是从远程仓库下载各层的元数据和实际数据，或者根据Dockerfile指令逐步构建各个层。
- 启动容器时，Docker会依据镜像的层次结构，从最底层开始逐层挂载，并最后挂载可写层。

### 分层结构的优点

::: details 资源共享
   - 多个容器可以共享相同的镜像层，这意味着存储空间得以高效利用。比如，多个基于相同操作系统基础镜像的容器只需在磁盘上保留一份该操作系统的副本。
:::
::: details 存储效率
   - 当对一个已存在的镜像进行修改时，只需要添加一个新的层来记录这些更改，而不是复制整个镜像。这样极大地节省了磁盘空间，尤其是在大型应用环境中，这种差异性存储策略非常有效。
:::   
::: details 镜像构建和传输速度
   - 分层结构使得镜像构建过程中，只有新增或更新的部分需要重新构建。在传输镜像时，如果目标环境已有部分层，则只需传输新的层即可，大大加快了镜像的分发和部署速度。
:::   
::: details 易维护与升级
   - 镜像的每一层代表了一个独立的操作或配置步骤，这使得更新和回滚变得非常方便。开发者可以针对某一特定层进行修改或替换，而不会影响到其他层的内容。
:::
::: details 复用性和模块化
   - 分层设计鼓励模块化和组件化，允许开发人员通过组合不同的层来创建新的镜像，实现代码和依赖项的复用，简化了复杂应用程序的容器化过程。
:::
::: details 安全性与隔离性 
   - 每一层的不可变特性增强了容器的安全性，因为底层镜像即使存在漏洞，在不影响其他层的情况下也可以单独修复。
:::   
### Docker镜像的特点：

- Docker镜像层都是只读的，容器层可写的
- Docker镜像有容器层和镜像层
- 当容器启动时，一个新的可写层被加载到镜像的顶部

### Docker镜像提交

```bash
docker commit #提交容器副本成为一个新的镜像
docker commit -m a="author" 容器id 目标镜像名：tag
```

### Docker镜像发布到阿里云

1. [阿里云开发平台](https://promotion.aliyun.com/ntms/act/kubernetes.html)

2. 容器镜像服务ACR

3. 开通，选择个人实例

4. 创建命名空间

5. 创建名称，点击管理

6. 推送或拉取

```bash
docker login --username=aliyun6765066895 registry.cn-hangzhou.aliyuncs.com  #登陆
```

   用于登录的用户名为阿里云账号全名，密码为开通服务时设置的密码。

   您可以在访问凭证页面修改凭证密码。

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/upjustin/justinubuntu:[镜像版本号]   #拉取	
```

```bash
docker login --username=aliyun6765066895 registry.cn-hangzhou.aliyuncs.com
docker tag [ImageId] registry.cn-hangzhou.aliyuncs.com/upjustin/justinubuntu:[镜像版本号]
docker push registry.cn-hangzhou.aliyuncs.com/upjustin/justinubuntu:[镜像版本号]

#推送
```

### Docker镜像发布到本地云

-  [DockerHub](http://hub.docker.com) 访问太慢，被阿里云网易云取代，这些又不方便，机密的东西不可能发布到公网，所以要创建一个本地私人仓库使用

- Docker Registry是官方提供的工具，用于构建私有镜像仓库

- 如何做？

  - 下载镜像Docker Registry

```bash
docker pull registry
```

  

  - 运行私有库，相当本地的docker hub

```bash
docker run -d -p 5000:5000  -v /justin/myregistry/:/tmp/registry --privileged=true registry 
```

  - curl查看私有库镜像

```bash
curl -XGET http://ip:port/v2/_catalog
```

  

  - 修改符合规范tag

```bash
# docker tag 镜像:tag Host:port/Repository:Tag
```

  

  - 修改配置文件支持http

```bash
vim /etc/docker/daemon.json
"insecure-registries":["ip:port"]
```

  重启docker

  - push推送至私有库

```bash
docker push 符合规范的tag
#验证
```

### 推荐本地云的可视化插件  
```bash
docker pull joxit/docker-registry-ui:1.5-static
```

  - pull拉取到本地

```bash
docker pull 符合规范的tag
```

  
