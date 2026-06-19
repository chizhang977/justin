# Docker 初识

Docker 是一种容器化技术，用来把应用程序及其运行依赖打包成镜像，再用容器运行。它解决的核心问题是：**开发环境、测试环境、生产环境不一致导致应用无法稳定运行**。

一句话理解：

> Docker 把应用、依赖、配置和启动方式封装成标准镜像，让应用可以在不同服务器上用相同方式运行。

## Docker 解决什么问题

传统部署常见问题：

- 开发环境能跑，服务器上跑不起来。
- 本地 JDK、MySQL、Redis 版本和生产不一致。
- 新服务器部署要手工安装大量依赖。
- 回滚困难，不知道上一个版本环境是什么。
- 多个应用部署在同一台机器上，端口、依赖、配置容易冲突。

Docker 的思路是把运行环境标准化。

```text
应用代码
  + JDK / Node / Nginx 等运行依赖
  + 配置文件
  + 启动命令
  -> 构建成镜像
  -> 在服务器上用容器运行
```

## Docker 和虚拟机区别

| 对比项 | 虚拟机 | Docker 容器 |
| --- | --- | --- |
| 隔离方式 | 虚拟硬件和完整操作系统 | 进程级隔离，共享宿主机内核 |
| 启动速度 | 通常较慢 | 秒级启动 |
| 资源占用 | 较高 | 较低 |
| 镜像体积 | 通常较大 | 通常较小 |
| 适合场景 | 强隔离、多系统环境 | 应用交付、弹性部署、CI/CD |

容器不是虚拟机。容器里的进程本质上仍然运行在宿主机内核上，只是通过 namespace、cgroups、文件系统等机制实现隔离和资源限制。

## 核心概念

### 镜像 Image

镜像是应用运行环境的只读模板。

可以理解为：

```text
镜像 = 应用代码 + 运行时 + 依赖库 + 配置 + 启动命令
```

常用命令：

```bash
docker images
docker pull nginx:1.25
docker rmi nginx:1.25
```

### 容器 Container

容器是镜像运行起来后的实例。

同一个镜像可以启动多个容器：

```bash
docker run -d --name nginx-1 -p 8080:80 nginx:1.25
docker run -d --name nginx-2 -p 8081:80 nginx:1.25
```

常用命令：

```bash
docker ps
docker ps -a
docker stop nginx-1
docker start nginx-1
docker rm nginx-1
```

### 仓库 Registry

仓库用来保存和分发镜像。

常见仓库：

- Docker Hub。
- 阿里云镜像仓库。
- Harbor 私有镜像仓库。
- GitHub Container Registry。

企业生产环境一般不会直接依赖 Docker Hub，而是使用私有仓库或云厂商镜像仓库。

## 安装 Docker

以下以 CentOS 为例。

### 1. 查看系统版本

```bash
cat /etc/redhat-release
uname -r
```

### 2. 卸载旧版本

```bash
sudo yum remove -y docker \
  docker-client \
  docker-client-latest \
  docker-common \
  docker-latest \
  docker-latest-logrotate \
  docker-logrotate \
  docker-engine
```

### 3. 安装依赖

```bash
sudo yum install -y yum-utils
```

### 4. 添加 Docker 仓库

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

国内服务器如果访问慢，可以改用云厂商镜像源。

### 5. 安装 Docker

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 6. 启动并设置开机自启

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 7. 验证安装

```bash
docker version
docker run hello-world
```

## 常用命令

### 镜像命令

```bash
docker pull redis:7
docker images
docker inspect redis:7
docker rmi redis:7
```

### 容器命令

```bash
docker run -d --name redis -p 6379:6379 redis:7
docker ps
docker logs -f redis
docker exec -it redis bash
docker stop redis
docker rm redis
```

### 清理命令

```bash
docker system df
docker system prune
docker image prune
docker container prune
```

生产注意：清理命令不要随便在生产执行，尤其是 `docker system prune -a`，可能删除未运行但仍需要保留的镜像。

## 端口映射

容器内部端口默认只能在容器网络中访问，要暴露给宿主机需要端口映射。

```bash
docker run -d --name nginx -p 8080:80 nginx
```

含义：

```text
宿主机 8080 端口 -> 容器 80 端口
```

访问：

```bash
curl http://localhost:8080
```

如果访问失败，排查顺序：

1. 容器是否运行：`docker ps`。
2. 端口是否映射：`docker port nginx`。
3. 宿主机防火墙是否放行。
4. 应用是否监听容器内正确端口。

## 数据卷

容器删除后，容器内部数据也会丢失。数据库、上传文件、日志等需要持久化的数据应该挂载到数据卷或宿主机目录。

```bash
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -v mysql-data:/var/lib/mysql \
  mysql:8
```

查看数据卷：

```bash
docker volume ls
docker volume inspect mysql-data
```

生产建议：

- 数据库必须挂载数据卷。
- 配置文件可以挂载到容器中。
- 日志可以输出到 stdout，由日志系统统一采集。

## Dockerfile

Dockerfile 用来描述如何构建镜像。

一个 Spring Boot 示例：

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建镜像：

```bash
docker build -t justin-app:1.0.0 .
```

运行容器：

```bash
docker run -d --name justin-app -p 8080:8080 justin-app:1.0.0
```

生产建议：

- 镜像 tag 不要只用 `latest`，要带版本号。
- 构建镜像时减少无用文件，可以使用 `.dockerignore`。
- 基础镜像尽量选择稳定版本，不要随意漂移。
- 容器中不要写死生产密码，敏感配置用环境变量或配置中心注入。

## Docker Compose

当一个项目需要同时启动应用、MySQL、Redis、Nginx 时，用一条条 `docker run` 管理会很乱。Docker Compose 可以用一个 YAML 文件描述多个服务。

```yaml
services:
  app:
    image: justin-app:1.0.0
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      - redis

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

启动：

```bash
docker compose up -d
```

查看：

```bash
docker compose ps
docker compose logs -f app
```

停止：

```bash
docker compose down
```

## 生产部署流程

一个比较完整的流程：

```text
1. 开发提交代码
2. CI 拉取代码
3. 执行测试
4. 打包 Jar 或前端 dist
5. 构建 Docker 镜像
6. 推送镜像仓库
7. 服务器拉取新镜像
8. 启动新容器
9. 健康检查
10. 失败则回滚旧版本
```

生产环境重点不是“能启动”，而是：

- 能重复部署。
- 能查看日志。
- 能限制资源。
- 能健康检查。
- 能回滚。
- 能定位问题。

## 常见问题排查

### 容器启动后立刻退出

```bash
docker ps -a
docker logs <container>
```

常见原因：

- 启动命令错误。
- 配置文件缺失。
- 端口冲突。
- 应用启动报错。
- 容器主进程退出。

### 端口访问不到

```bash
docker ps
docker port <container>
ss -lntp
firewall-cmd --list-ports
```

排查重点：

- `-p` 是否写对。
- 应用是否监听 `0.0.0.0`，而不是只监听 `127.0.0.1`。
- 云服务器安全组是否开放。

### 容器内无法访问外网

```bash
docker exec -it <container> sh
ping 8.8.8.8
cat /etc/resolv.conf
```

可能原因：

- DNS 配置异常。
- 宿主机网络异常。
- Docker 网桥异常。
- 公司或云环境限制出网。

## 实践总结

Docker 的核心是镜像和容器。镜像封装应用和运行依赖，容器是镜像运行后的实例。它和虚拟机不同，容器共享宿主机内核，启动更快、资源占用更低，适合应用交付和 CI/CD。

生产中使用 Docker 时，应重点关注：

- Dockerfile 是否稳定、可复现。
- 镜像版本是否明确。
- 配置是否通过环境变量或挂载注入。
- 数据是否通过数据卷持久化。
- 日志是否可采集、可轮转。
- 容器健康状态是否可检查。
- 发布失败时是否能回滚到旧镜像。
