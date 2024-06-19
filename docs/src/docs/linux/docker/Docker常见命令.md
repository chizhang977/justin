---
icon: docker
---
# 5_Docker 常见命令
::: tip docker
这个页面是 Docker 命令的详细说明，是通过`docker version`命令获取翻译的。
:::
## Docker 命令及说明

### 管理命令

- **builder**：管理构建任务
- **buildx**：Docker Buildx（多平台构建工具）
- **compose**：管理 Docker Compose 应用，定义和运行多容器 Docker 应用
- **config**：管理 Docker 配置
- **container**：管理 Docker 容器
- **context**：管理 Docker 上下文，允许在多个 Docker 环境之间切换
- **image**：管理 Docker 镜像
- **manifest**：管理 Docker 镜像清单和清单列表
- **network**：管理 Docker 网络
- **node**：管理 Swarm 节点（Swarm 是 Docker 的原生集群管理工具）
- **plugin**：管理 Docker 插件
- **secret**：管理 Swarm 机密，主要用于在 Swarm 服务中存储和分发敏感数据
- **service**：管理 Swarm 服务
- **stack**：管理 Docker 堆栈，堆栈是一个由多个服务组成的集合，可以通过 Compose 文件定义
- **swarm**：管理 Docker Swarm 集群
- **system**：管理 Docker 系统信息
- **trust**：管理镜像的内容信任
- **volume**：管理 Docker 卷

### Swarm 命令

- **swarm**：管理 Docker Swarm 集群，包括初始化、加入和更新集群配置

### 常规命令

- **attach**：附加本地标准输入、输出和错误流到一个运行中的容器
- **commit**：从容器的更改创建一个新的镜像
- **cp**：在容器和本地文件系统之间复制文件或文件夹
- **create**：创建一个新的容器但不启动它
- **diff**：检查容器文件系统上的更改
- **events**：从 Docker 守护进程获取实时事件
- **export**：将容器的文件系统导出为一个 tar 归档文件
- **history**：显示镜像的历史记录，包括每一层的创建历史
- **images**：列出本地所有 Docker 镜像
- **import**：从 tarball 文件创建一个新的文件系统镜像
- **info**：显示 Docker 系统的详细信息
- **inspect**：返回一个或多个 Docker 对象的低级信息（如容器、镜像、卷等）
- **kill**：通过发送 SIGKILL 信号来终止一个或多个运行中的容器
- **load**：从 tar 存档加载一个镜像
- **login**：登录到 Docker 注册表
- **logout**：登出 Docker 注册表
- **logs**：获取容器的日志输出
- **pause**：暂停一个或多个容器中的所有进程
- **port**：列出一个容器的端口映射
- **ps**：列出所有容器
- **pull**：从 Docker 注册表拉取镜像
- **push**：将镜像推送到 Docker 注册表
- **rename**：重命名一个容器
- **restart**：重启一个或多个容器
- **rm**：删除一个或多个容器
- **rmi**：删除一个或多个镜像
- **run**：在新容器中运行一个命令
- **save**：将镜像保存为一个 tar 归档文件
- **search**：在 Docker Hub 中搜索镜像
- **start**：启动一个或多个已停止的容器
- **stats**：显示容器的实时资源使用统计信息
- **stop**：停止一个或多个运行中的容器
- **tag**：为镜像添加标签
- **top**：显示一个容器中运行的进程
- **unpause**：取消暂停一个或多个容器中的所有进程
- **update**：更新一个或多个容器的配置
- **version**：显示 Docker 的版本信息
- **wait**：阻塞直到一个容器停止，然后打印其退出代码

### 全局选项

- **--config string**：指定客户端配置文件的路径（默认是 “/root/.docker”）
- **--context string**：指定用于连接到 Docker 守护进程的上下文名称，覆盖 `DOCKER_HOST` 环境变量并且与 `docker context use` 设置的默认上下文一致
- **-D, --debug**：启用调试模式，以便输出更多调试信息
- **--help**：显示命令的帮助信息
- **-H, --host list**：指定 Docker 守护进程连接的 Socket（例如 `unix:///var/run/docker.sock` 或 `tcp://host:port`）
- **-l, --log-level string**：设置日志级别（`debug`、`info`、`warn`、`error`、`fatal`），默认是 `info`
- **--tls**：启用 TLS 加密; 同时启用 `--tlsverify`
- **--tlscacert string**：指定可信任的 CA 证书的路径（默认是 “/root/.docker/ca.pem”）
- **--tlscert string**：指定客户端证书文件的路径（默认是 “/root/.docker/cert.pem”）
- **--tlskey string**：指定客户端密钥文件的路径（默认是 “/root/.docker/key.pem”）
- **--tlsverify**：使用 TLS 并验证远程服务器
- **-v, --version**：显示 Docker 的版本信息并退出

运行 `docker COMMAND --help` 以获得有关命令的更多详细信息。
