# Dockerfile 指令与镜像优化学习笔记

## 1. Dockerfile 是什么

Dockerfile 是用来构建 Docker 镜像的文本文件。

它描述了：

```text
使用什么基础镜像
应用文件放在哪里
需要安装什么依赖
暴露什么端口
容器启动时执行什么命令
```

基本流程：

```text
Dockerfile
  -> docker build
  -> Docker 镜像
  -> docker run
  -> 容器
```

示例：

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 2. Dockerfile 执行阶段

Dockerfile 里有两类动作：

```text
构建阶段执行：FROM、WORKDIR、COPY、ADD、RUN、ARG
容器运行阶段生效：CMD、ENTRYPOINT、ENV、EXPOSE、VOLUME、USER
```

简单理解：

```text
RUN 是 docker build 时执行。
CMD / ENTRYPOINT 是 docker run 时执行。
```

---

## 3. 常见 Dockerfile 指令

## 3.1 FROM

作用：指定基础镜像。

```dockerfile
FROM eclipse-temurin:17-jre
```

说明：

```text
所有镜像都必须基于一个基础镜像。
基础镜像越大，最终镜像通常也越大。
```

常见基础镜像：

```text
openjdk
eclipse-temurin
debian
ubuntu
alpine
nginx
mysql
redis
```

Java 项目常见选择：

```text
构建阶段：maven + jdk
运行阶段：jre
```

---

## 3.2 WORKDIR

作用：设置工作目录。

```dockerfile
WORKDIR /app
```

后续指令会在这个目录下执行。

例如：

```dockerfile
WORKDIR /app
COPY app.jar .
```

等价于把 `app.jar` 复制到 `/app/app.jar`。

---

## 3.3 COPY

作用：把宿主机构建上下文里的文件复制到镜像中。

```dockerfile
COPY target/app.jar /app/app.jar
```

常见用法：

```dockerfile
COPY pom.xml .
COPY src ./src
COPY target/*.jar app.jar
```

特点：

```text
行为简单明确。
推荐优先使用 COPY。
```

---

## 3.4 ADD

作用：复制文件到镜像。

和 COPY 的区别：

```text
ADD 可以自动解压 tar 文件。
ADD 可以从 URL 下载文件。
COPY 只是单纯复制。
```

示例：

```dockerfile
ADD app.tar.gz /app/
```

注意：

```text
一般优先用 COPY。
只有明确需要自动解压 tar 文件时再考虑 ADD。
```

---

## 3.5 RUN

作用：构建镜像时执行命令。

常用于：

```text
安装软件
创建目录
修改权限
清理缓存
编译项目
```

示例：

```dockerfile
RUN mkdir -p /app/logs
```

安装软件示例：

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

注意：

```text
RUN 会产生镜像层。
安装和清理最好放在同一个 RUN 里。
```

---

## 3.6 CMD

作用：指定容器启动时的默认命令。

```dockerfile
CMD ["java", "-jar", "app.jar"]
```

特点：

```text
CMD 可以被 docker run 后面的命令覆盖。
一个 Dockerfile 中只有最后一个 CMD 生效。
```

例如：

```bash
docker run app-image echo hello
```

如果镜像中有 CMD，`echo hello` 会覆盖原来的 CMD。

---

## 3.7 ENTRYPOINT

作用：指定容器固定入口命令。

```dockerfile
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

特点：

```text
ENTRYPOINT 更适合作为固定启动命令。
docker run 后面的参数通常会追加到 ENTRYPOINT 后面。
```

Java 应用常用：

```dockerfile
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

---

## 3.8 CMD 和 ENTRYPOINT 区别


| 对比           | CMD          | ENTRYPOINT       |
| -------------- | ------------ | ---------------- |
| 作用           | 默认启动命令 | 固定入口命令     |
| 是否容易被覆盖 | 容易         | 不容易           |
| 常见用途       | 提供默认参数 | 固定应用启动方式 |
| Java 应用推荐  | 可以用       | 更常用           |

组合使用示例：

```dockerfile
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
CMD ["--spring.profiles.active=prod"]
```

运行时：

```bash
docker run app-image --spring.profiles.active=test
```

此时会把 CMD 默认参数替换成新的参数。

---

## 3.9 EXPOSE

作用：声明容器内部服务端口。

```dockerfile
EXPOSE 8080
```

注意：

```text
EXPOSE 只是声明端口。
它不会真正把端口发布到宿主机。
真正映射端口要在 docker run 时使用 -p。
```

示例：

```bash
docker run -p 8080:8080 app-image
```

---

## 3.10 ENV

作用：设置环境变量。

```dockerfile
ENV JAVA_OPTS="-Xms512m -Xmx512m"
ENV SPRING_PROFILES_ACTIVE=prod
```

特点：

```text
ENV 在镜像构建后仍然存在。
容器运行时可以读取 ENV。
```

---

## 3.11 ARG

作用：设置构建时变量。

```dockerfile
ARG APP_VERSION=1.0.0
```

构建时传参：

```bash
docker build --build-arg APP_VERSION=1.0.1 -t app:1.0.1 .
```

ARG 和 ENV 区别：

```text
ARG 主要用于构建阶段。
ENV 会进入镜像，容器运行时也能读取。
```

---

## 3.12 VOLUME

作用：声明数据挂载点。

```dockerfile
VOLUME ["/app/logs"]
```

常见用途：

```text
日志目录
上传文件目录
数据库数据目录
```

注意：

```text
实际挂载通常在 docker run 或 docker-compose.yml 中配置。
```

---

## 3.13 USER

作用：指定容器运行用户。

```dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```

作用：

```text
避免容器默认使用 root 用户运行。
提高安全性。
```

---

## 3.14 LABEL

作用：给镜像添加元信息。

```dockerfile
LABEL maintainer="ops@example.com"
LABEL version="1.0.0"
LABEL description="user service"
```

常用于：

```text
版本
维护者
构建时间
项目名称
```

---

## 3.15 HEALTHCHECK

作用：定义容器健康检查。

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

说明：

```text
Docker 单机环境可以用 HEALTHCHECK。
Kubernetes 中更常用 readinessProbe 和 livenessProbe。
```

---

## 4. 镜像层和缓存

## 4.1 镜像层是什么

Docker 镜像是由多层只读层组成的。

常见会产生新层的指令：

```text
RUN
COPY
ADD
```

例如：

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

这会产生多层。

如果前一层产生了缓存文件，后一层再删除，不一定能真正减少镜像历史层大小。

更好的写法：

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

---

## 4.2 Docker 构建缓存

Docker 构建时会复用之前构建过的层。

如果某一层内容没变，就可以使用缓存。

如果某一层变了，它后面的层通常都要重新构建。

示例：

```dockerfile
COPY . .
RUN mvn clean package
```

问题：

```text
只要任意源码文件变化，COPY . . 这一层就变化。
后面的 mvn clean package 就要重新执行。
```

优化：

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package
```

好处：

```text
pom.xml 不变时，Maven 依赖下载层可以复用。
只有 src 变化时，重新编译代码即可。
```

---

## 5. 镜像变大的常见原因

```text
1. 基础镜像太大。
2. 使用完整 JDK 或 Maven 镜像作为最终运行镜像。
3. 把源码、.git、日志、文档、测试文件都复制进镜像。
4. 没有使用 .dockerignore。
5. 构建缓存、包管理缓存没有清理。
6. 安装了运行不需要的软件。
7. 没有使用多阶段构建。
8. 删除文件和生成文件不在同一个镜像层。
9. 指令顺序不合理，导致缓存频繁失效。
```

---

## 6. 镜像优化策略

## 6.1 使用更小的基础镜像

不推荐：

```dockerfile
FROM maven:3.9-eclipse-temurin-17
```

如果它作为最终镜像，会包含 Maven、JDK 和很多构建工具。

推荐：

```dockerfile
FROM eclipse-temurin:17-jre
```

或者：

```dockerfile
FROM eclipse-temurin:17-jre-alpine
```

选择基础镜像时要考虑：

```text
镜像大小
系统兼容性
字体/时区/证书
glibc/musl 差异
安全漏洞数量
运维排查便利性
```

---

## 6.2 使用多阶段构建

多阶段构建把“构建环境”和“运行环境”分开。

结构：

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
# 编译打包

FROM eclipse-temurin:17-jre
# 只复制 jar 运行
```

好处：

```text
最终镜像不包含 Maven。
最终镜像不包含源码。
最终镜像不包含构建缓存。
最终镜像只包含运行需要的文件。
```

---

## 6.3 使用 .dockerignore

示例：

```dockerignore
.git
.idea
.vscode
target
*.log
tmp
docs
node_modules
```

作用：

```text
减少构建上下文。
防止无关文件进入镜像。
减少构建时间。
防止敏感信息误打进镜像。
```

---

## 6.4 清理包管理缓存

Debian / Ubuntu：

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

Alpine：

```dockerfile
RUN apk add --no-cache curl
```

重点：

```text
安装和清理放在同一个 RUN。
减少缓存文件进入镜像层。
```

---

## 6.5 减少无用软件

镜像中不要随便安装：

```text
vim
gcc
make
wget
curl
net-tools
```

除非运行或排查确实需要。

原则：

```text
最终镜像只放应用运行必需内容。
构建工具放在 build 阶段。
```

---

## 6.6 减少镜像层数

可以合并相关 RUN：

```dockerfile
RUN mkdir -p /app/logs \
    && addgroup -S app \
    && adduser -S app -G app
```

不要写成：

```dockerfile
RUN mkdir -p /app/logs
RUN addgroup -S app
RUN adduser -S app -G app
```

注意：

```text
减少层数不是唯一目标。
Dockerfile 也要保持可读性。
```

---

## 6.7 优化指令顺序

原则：

```text
变化少的放前面。
变化多的放后面。
```

Maven 项目：

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package
```

原因：

```text
pom.xml 变化少。
src 代码变化多。
先下载依赖可以提高缓存复用。
```

---

## 6.8 不把敏感信息写进镜像

不要在 Dockerfile 中写：

```dockerfile
ENV DB_PASSWORD=123456
ENV ACCESS_KEY=xxx
```

原因：

```text
镜像历史层可能泄露敏感信息。
镜像仓库中的镜像可能被多人拉取。
```

推荐：

```text
运行时通过环境变量传入。
Kubernetes 使用 Secret。
Docker Compose 使用 env_file 或环境变量。
```

---

## 7. Java Maven 项目案例

## 7.1 未优化版本

```dockerfile
FROM maven:3.9-eclipse-temurin-17

WORKDIR /app
COPY . .

RUN mvn clean package -DskipTests
RUN apt-get update
RUN apt-get install -y vim curl

EXPOSE 8080
CMD java -jar target/app.jar
```

问题：

```text
1. 最终镜像包含 Maven 和完整 JDK。
2. 源码、.git、测试文件可能都进入镜像。
3. 安装了 vim 等运行时不需要的软件。
4. apt 缓存没有清理。
5. COPY . . 导致缓存容易失效。
6. 没有使用多阶段构建。
7. CMD 使用 shell 形式，不如 exec 形式清晰。
```

---

## 7.2 优化版本

```dockerfile
# syntax=docker/dockerfile:1.7

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /src

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /src/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
```

优化点：

```text
1. 使用多阶段构建。
2. build 阶段负责 Maven 编译。
3. runtime 阶段只保留 JRE 和 jar。
4. 最终镜像不包含源码、Maven 和构建缓存。
5. 先复制 pom.xml，再复制 src，提高缓存命中率。
6. 使用 ENTRYPOINT exec 格式启动 Java 应用。
```

---

## 7.3 加非 root 用户

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /src/target/*.jar app.jar

USER app

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
```

作用：

```text
避免容器使用 root 用户运行。
降低容器逃逸或误操作风险。
```

---

## 8. docker build 相关命令

构建镜像：

```bash
docker build -t app:v1 .
```

指定 Dockerfile：

```bash
docker build -f Dockerfile.prod -t app:v1 .
```

传入构建参数：

```bash
docker build --build-arg APP_VERSION=1.0.1 -t app:1.0.1 .
```

不使用缓存构建：

```bash
docker build --no-cache -t app:v1 .
```

查看镜像：

```bash
docker images
```

查看镜像历史层：

```bash
docker history app:v1
```

查看 Docker 占用：

```bash
docker system df
```

---

## 9. Jenkins 中的构建流程对应

```text
1. Jenkins 从 GitLab 拉代码。
2. Maven 打包生成 jar。
3. Docker 根据 Dockerfile 构建镜像。
4. 镜像打 tag。
5. 推送到私有镜像仓库。
6. 部署环境拉取镜像并启动。
```

示例命令：

```bash
mvn clean package -DskipTests
docker build -t registry.example.com/project/app:v1 .
docker push registry.example.com/project/app:v1
```

Kubernetes 更新：

```bash
kubectl set image deployment/app app=registry.example.com/project/app:v1
kubectl rollout status deployment/app
```

Docker Compose 更新：

```bash
docker compose pull
docker compose up -d
```

---

## 10. 总结

Dockerfile 优化主要看这些点：

```text
1. 基础镜像是否过大。
2. 是否使用多阶段构建。
3. 是否把源码、日志、.git、临时文件打进镜像。
4. 是否使用 .dockerignore。
5. 是否清理包管理缓存。
6. 是否安装了运行时不需要的软件。
7. Dockerfile 指令顺序是否利于缓存。
8. 是否避免敏感信息进入镜像。
9. 是否只保留应用运行必需内容。
```

一句话：

```text
镜像优化的目标不是盲目追求最小，而是在保证应用稳定运行的前提下，减少无关文件、构建工具、缓存和不必要依赖。
```
