---
title: DevOps 运维面试主线
---

# DevOps 运维面试主线

DevOps 方向的核心不是“会几个命令”，而是能把代码从开发环境稳定地送到生产环境，并在出问题时快速定位、回滚和复盘。

## 能力地图

| 能力 | 必备知识 | 面试关注点 |
| --- | --- | --- |
| Linux | 进程、端口、日志、权限、磁盘、systemd | 能不能排查服务异常 |
| 网络 | DNS、HTTP、TCP、端口、防火墙 | 能不能定位访问失败 |
| Docker | 镜像、容器、数据卷、网络、Compose | 能不能容器化部署 |
| Kubernetes | Pod、Deployment、Service、Ingress、ConfigMap、Secret | 能不能理解容器编排 |
| CI/CD | GitHub Actions、Jenkins、构建、发布、回滚 | 能不能自动化交付 |
| 监控 | 指标、日志、告警、链路 | 能不能发现和定位故障 |

## Linux 排障流程

### 服务无法访问

按从外到内排查：

```bash
# 1. 域名是否解析
nslookup example.com

# 2. 网络是否通
ping example.com

# 3. 端口是否开放
telnet example.com 80

# 4. 服务是否监听
ss -lntp

# 5. 进程是否存在
ps -ef | grep java

# 6. 日志是否报错
journalctl -u app.service -f
```

面试回答要强调顺序：先判断是网络、端口、服务、配置还是应用自身异常。

### 磁盘打满

常用命令：

```bash
df -h
du -sh /*
du -sh /var/log/*
find /var/log -type f -size +500M
```

生产注意点：

- 不要直接删除正在被进程占用的日志文件，否则磁盘空间可能不会释放。
- 大日志应该先确认来源，再做日志轮转。
- 可以用 `lsof | grep deleted` 查看已删除但仍被进程占用的文件。

## Docker 部署流程

一个基本部署流程：

```bash
# 1. 构建镜像
docker build -t app:1.0.0 .

# 2. 查看镜像
docker images

# 3. 运行容器
docker run -d --name app -p 8080:8080 app:1.0.0

# 4. 查看日志
docker logs -f app

# 5. 进入容器排查
docker exec -it app sh
```

实际项目里，不建议手工一个个运行容器，可以用 Docker Compose 管理多个服务。

```yaml
services:
  app:
    image: app:1.0.0
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
    restart: always
```

## Kubernetes 排障流程

### Pod 一直重启

常用命令：

```bash
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
```

重点看：

- 镜像是否拉取失败。
- 配置文件或环境变量是否缺失。
- 探针是否配置过严。
- 应用启动是否报错。
- 资源限制是否导致 OOMKilled。

### Service 无法访问

排查顺序：

1. Pod 是否 Ready。
2. Service selector 是否匹配 Pod label。
3. Service 端口和 targetPort 是否正确。
4. Ingress 规则是否正确。
5. 应用是否监听了正确端口。

## CI/CD 面试表达

可以按这个流程讲一次完整发布：

1. 开发提交代码到 GitHub。
2. GitHub Actions 或 Jenkins 拉取代码。
3. 安装依赖并执行测试。
4. 构建前端静态文件或后端 Jar 包。
5. 构建 Docker 镜像并打版本号。
6. 推送镜像到镜像仓库。
7. 服务器或 K8s 拉取新镜像。
8. 健康检查通过后完成发布。
9. 如果失败，回滚到上一个版本。

关键点是版本可追踪、发布可回滚、失败可定位。

## 高频面试题

### Docker 和虚拟机有什么区别

虚拟机虚拟的是整套硬件和操作系统，隔离性更强但资源开销大。Docker 容器共享宿主机内核，隔离的是进程、文件系统、网络和资源限制，启动快、占用低，更适合应用交付和弹性部署。

### 为什么要做 CI/CD

手工发布容易出错，且每个人操作习惯不同。CI/CD 可以把构建、测试、打包、发布流程固化，减少人为失误，并让每次发布都有日志、版本和回滚依据。

### 生产环境如何回滚

常见方式：

- 前端静态资源回滚到上一次构建产物。
- 后端 Docker 镜像回滚到上一个 tag。
- K8s 使用 Deployment rollout undo。
- 数据库变更要提前设计回滚脚本，避免只回滚代码不回滚数据导致异常。

回滚不是最后才想的事，应该在上线方案里提前设计。
