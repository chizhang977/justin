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
#### 安装 Docker Registry
- 首先，确保你的服务器上已经安装了 Docker。你可以通过官方文档或者包管理工具安装 Docker。
- 使用以下命令运行 Docker Registry 容器：

```bash
docker run -d -p 5000:5000  -v /justin/myregistry/:/tmp/registry --privileged=true registry 
```
- 验证安装：

打开浏览器并访问 `http://<your-server-ip>:5000/v2/_catalog`，如果看到类似以下输出，说明安装成功：
```json
{"repositories":[]}
```
- 或者使用curl查看私有库镜像
```bash
curl -XGET http://ip:port/v2/_catalog
```  
#### 配置 Docker 客户端
- 修改 Docker 配置以使用私有仓库：
编辑 Docker 配置文件 /etc/docker/daemon.json（如果不存在则创建），添加以下内容：
```bash
vim /etc/docker/daemon.json
{
  "insecure-registries": ["your-server-ip:5000"]
}
```
#### 重启 Docker 服务
- 重启 Docker 服务使配置生效：
```bash
systemctl restart docker
```
#### 推送镜像到私有仓库
- 构建并推送镜像到私有仓库：

在构建 Docker 镜像时，使用私有仓库地址作为镜像的目标地址：
```bash
docker tag 镜像:tag Host:port/Repository:Tag
docker build -t your-server-ip:5000/my-image .
docker push your-server-ip:5000/my-image
```
替换 your-server-ip 和 my-image 为你的服务器 IP 和镜像名称。
#### 从私有仓库拉取镜像：

使用以下命令从私有仓库拉取镜像：
```bash
docker pull your-server-ip:5000/my-image
```
#### 可选增强安全性和管理
- 使用 TLS 加密：

 对于企业环境，建议使用 TLS/SSL 加密保护 Docker Registry 的通信。可以使用反向代理（如 Nginx 或 Apache）来实现这一点。
- 添加访问控制：

可以通过基本认证、OAuth 或其他认证措施来限制谁可以访问和操作私有仓库。
- 监控和日志：

配置日志记录和监控以便及时发现问题并进行故障排除。


### 推荐本地云的可视化插件  
- Portainer:

Portainer 是一个轻量级的 Docker 管理界面，支持管理本地或远程的 Docker 环境，包括私有仓库。你可以通过 Portainer 来可视化地管理你的 Docker 镜像、容器、网络等。
::: details 配置
安装 Portainer：

使用以下命令来安装 Portainer：
```bash
docker volume create portainer_data
docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
```
该命令将下载最新的 Portainer 镜像并启动 Portainer 容器。
访问 Portainer：

打开浏览器，访问 `https://<your-server-ip>:9443`。
1、 首次访问时需要创建一个管理员账号。
2、 配置 Portainer 连接私有库：
登录 Portainer 后，点击左侧菜单中的 “Registries”。
点击 “Add registry” 按钮，输入你的私有库信息：
- Name: 取一个易于识别的名称。
- Registry URL: 输入你的私有库地址。
- Username: 输入你的私有库用户名。
- Password: 输入你的私有库密码。
配置完成后，点击 “Add registry” 按钮保存。
使用私有库中的镜像：

在 Portainer 中，点击左侧菜单中的 “Images”。
点击 “Pull image” 按钮，选择你刚刚添加的私有库作为来源，然后输入镜像名称。
点击 “Pull the image” 按钮下载镜像。
:::

- Rancher:

Rancher 是一个开源的容器管理平台，可以用来管理多个 Kubernetes 集群，同时也支持 Docker 管理和私有仓库管理。
官方网站：Rancher
- Docker Registry UI:

Docker Registry UI 是一个简单的基于 Web 的用户界面，用于管理和浏览 Docker Registry。它可以让你通过 Web 界面查看镜像仓库、标签和镜像详情。
- GitLab Container Registry:

如果你在使用 GitLab 进行代码托管，GitLab 的 Container Registry 提供了内置的镜像仓库管理功能，可以直接在 GitLab 中进行可视化管理镜像。
- Harbor:

Harbor 是一个开源的企业级 Docker Registry 管理平台，提供了高级的安全性、标签管理、复制同步和多租户支持等功能。它有一个现代化的用户界面，支持管理和操作私有仓库。

  
