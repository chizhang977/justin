---
title: Docker 生产部署与排障
---

# Docker 生产部署与排障

Docker 真正有价值的地方不是本地运行一个容器，而是让应用交付变得稳定、可重复、可回滚。生产部署要关注镜像版本、配置注入、数据持久化、日志、健康检查和故障排查。

## 部署流程

一个 Spring Boot 应用的 Docker 部署流程：

```text
代码提交
  -> Maven 打包
  -> 构建镜像
  -> 打镜像版本
  -> 推送镜像仓库
  -> 服务器拉取镜像
  -> 停旧容器
  -> 启新容器
  -> 健康检查
  -> 保留旧版本用于回滚
```

## Dockerfile 示例

```dockerfile
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY target/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建：

```bash
docker build -t registry.example.com/justin/app:1.0.0 .
```

推送：

```bash
docker push registry.example.com/justin/app:1.0.0
```

生产建议：

- 镜像必须带明确版本号，例如 `1.0.0`、`20260620-001`。
- 不要只依赖 `latest`。
- 基础镜像使用稳定版本。
- 使用 `.dockerignore` 排除无关文件。

`.dockerignore` 示例：

```text
.git
node_modules
target
logs
*.md
```

如果构建 Java 镜像，需要注意不要把本地临时文件、日志、IDE 配置都复制进镜像。

## 环境变量注入

运行容器时传入配置：

```bash
docker run -d \
  --name justin-app \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e MYSQL_HOST=192.168.1.10 \
  registry.example.com/justin/app:1.0.0
```

敏感配置不要写死在镜像里。镜像应该可以在测试、预发布、生产环境复用，环境差异通过环境变量、配置文件挂载或配置中心解决。

## 配置文件挂载

```bash
docker run -d \
  --name justin-app \
  -p 8080:8080 \
  -v /etc/justin-app/application-prod.yml:/app/application-prod.yml \
  registry.example.com/justin/app:1.0.0 \
  --spring.config.location=/app/application-prod.yml
```

注意：

- 宿主机文件路径必须存在。
- 容器内路径要和应用启动参数一致。
- 配置文件权限要控制，避免泄露数据库密码。

## 日志处理

容器推荐把日志输出到标准输出：

```bash
docker logs -f justin-app
```

查看最近 200 行：

```bash
docker logs --tail 200 justin-app
```

带时间：

```bash
docker logs -t --tail 200 justin-app
```

生产环境可以由日志采集器统一收集 Docker stdout，也可以挂载日志目录：

```bash
docker run -d \
  --name justin-app \
  -v /var/log/justin-app:/app/logs \
  registry.example.com/justin/app:1.0.0
```

如果挂载日志目录，要配合 logrotate，避免日志打满磁盘。

## 数据持久化

数据库类容器必须挂载数据卷。

MySQL 示例：

```bash
docker run -d \
  --name mysql8 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -v mysql8-data:/var/lib/mysql \
  mysql:8.0
```

Redis 示例：

```bash
docker run -d \
  --name redis7 \
  -p 6379:6379 \
  -v redis7-data:/data \
  redis:7 redis-server --appendonly yes
```

查看数据卷：

```bash
docker volume ls
docker volume inspect mysql8-data
```

生产中删除容器不等于删除数据卷，但执行清理命令时仍要非常谨慎。

## Docker Compose 部署

`docker-compose.yml`：

```yaml
services:
  app:
    image: registry.example.com/justin/app:1.0.0
    container_name: justin-app
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      MYSQL_HOST: mysql
      REDIS_HOST: redis
    depends_on:
      - mysql
      - redis
    restart: always

  mysql:
    image: mysql:8.0
    container_name: mysql8
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: justin
    volumes:
      - mysql-data:/var/lib/mysql
    restart: always

  redis:
    image: redis:7
    container_name: redis7
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    restart: always

volumes:
  mysql-data:
  redis-data:
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

更新应用：

```bash
docker compose pull app
docker compose up -d app
```

## 健康检查

Dockerfile 中可以加健康检查：

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

查看健康状态：

```bash
docker ps
docker inspect justin-app --format='{{json .State.Health}}'
```

Spring Boot 可以开启 actuator：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

## 回滚

假设当前版本 `1.0.1` 有问题，回滚到 `1.0.0`：

```bash
docker stop justin-app
docker rm justin-app

docker run -d \
  --name justin-app \
  -p 8080:8080 \
  registry.example.com/justin/app:1.0.0
```

Compose 回滚：

```yaml
services:
  app:
    image: registry.example.com/justin/app:1.0.0
```

然后：

```bash
docker compose up -d app
```

回滚前要确认数据库变更是否兼容。代码回滚容易，数据库结构和数据回滚更复杂。

## 常见故障排查

### 容器不断重启

```bash
docker ps -a
docker logs --tail 200 justin-app
docker inspect justin-app --format='{{.State.ExitCode}}'
```

常见原因：

- 应用启动异常。
- 配置文件缺失。
- 数据库连接失败。
- 端口配置不正确。
- 启动命令写错。

### 端口访问不到

```bash
docker ps
docker port justin-app
ss -lntp | grep 8080
curl -v http://127.0.0.1:8080
```

如果容器内服务只监听 `127.0.0.1`，外部可能访问不到。应用应监听 `0.0.0.0`。

### 容器内 DNS 异常

```bash
docker exec -it justin-app sh
cat /etc/resolv.conf
ping mysql
```

Compose 中服务名可以作为 DNS 名称，例如应用访问 `mysql:3306`。

### 磁盘占用过大

```bash
docker system df
docker images
docker ps -a
```

清理不用的容器：

```bash
docker container prune
```

清理悬空镜像：

```bash
docker image prune
```

谨慎使用：

```bash
docker system prune -a
```

它可能删除当前没有运行但后续回滚需要的镜像。
