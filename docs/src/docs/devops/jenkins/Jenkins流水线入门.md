---
# Jenkins + GitLab 自动化部署全流程

------

## 1. 整体流程

Jenkins 自动化部署的完整链路可以理解为：

```text
开发提交代码
    ↓
GitLab Webhook 触发 Jenkins
    ↓
Jenkins 拉取 GitLab 代码
    ↓
Maven 编译打包生成 jar
    ↓
Dockerfile 构建镜像
    ↓
镜像推送到 Harbor 私有仓库
    ↓
部署到 Docker Compose 或 Kubernetes
    ↓
检查服务状态、日志、健康接口
    ↓
失败告警 / 异常回滚
```

各组件作用：

```text
GitLab：代码仓库，保存项目代码。
Webhook：代码提交后通知 Jenkins 开始构建。
Jenkins：自动化构建和部署平台。
Maven：Java 项目打包工具，生成 jar 包。
Dockerfile：把 jar 包构建成 Docker 镜像。
Harbor：企业内部 Docker 镜像仓库。
Docker Compose：单机或测试环境容器编排。
Kubernetes：生产或标准环境容器编排。
Nginx / Ingress：对外访问入口。
```

一句话：

> GitLab 管代码，Jenkins 管流水线，Maven 打 jar，Docker 做镜像，Harbor 存镜像，Compose 或 K8s 运行服务。

------

## 2. 开发提交代码

开发在本地完成代码修改后，提交到 GitLab：

```bash
git add .
git commit -m "fix user query bug"
git push origin dev
```

常见分支和环境对应关系：

```text
dev 分支：测试环境。
test 分支：测试 / 联调环境。
release 分支：预生产环境。
master/main 分支：生产环境。
```

实际生产中通常不会一提交代码就直接发布生产。比较常见的是：

```text
测试环境：push 后自动构建部署。
预生产环境：自动构建，可能人工确认部署。
生产环境：构建完成后人工确认发布。
```

这样做是为了避免错误代码直接上线。

------

## 3. GitLab Webhook 触发 Jenkins

GitLab 项目中配置 Webhook：

```text
Settings -> Webhooks
URL: http://jenkins.example.com/project/任务名
Trigger: Push events / Merge request events
Secret Token: xxxxx
```

开发 push 代码后，GitLab 会向 Jenkins 发送 HTTP 请求，通知 Jenkins：

```text
有新代码提交了，请开始构建。
```

注意区分：

```text
Webhook：负责触发 Jenkins。
SSH Key / Token：负责 Jenkins 拉代码认证。
```

Webhook 不负责拉代码，它只是“叫醒 Jenkins”。

Webhook 不触发时常见排查点：

```text
GitLab Webhook 最近请求记录是否成功。
Webhook URL 是否正确。
Secret Token 是否一致。
Jenkins 任务是否允许触发。
GitLab 到 Jenkins 网络是否通。
防火墙或安全组是否拦截。
```

------

## 4. Jenkins 拉取 GitLab 代码

Jenkins 被 Webhook 触发后，会根据任务配置去 GitLab 拉取代码。

常见认证方式有两种：

```text
SSH Key
HTTP Token
```

中小型项目中比较常见的是 SSH Key。

### SSH Key 方式

基本逻辑：

```text
公钥放 GitLab。
私钥放 Jenkins。
Jenkins 拉代码时用私钥认证。
```

常见仓库地址：

```text
git@gitlab.example.com:group/project.git
```

Jenkins 配置里会选择对应 Credentials。

> Jenkins 拉 GitLab 代码一般用 SSH Key 免密认证。GitLab Webhook 负责触发构建，Jenkins 收到触发后，用配置好的 SSH Key 去 GitLab 拉代码。SSH 私钥、token、密码不应该写在脚本里，应该放 Jenkins Credentials 统一管理。

拉代码失败常见原因：

```text
SSH Key 配错。
Jenkins Credentials 选错。
GitLab 仓库地址写错。
Jenkins 用户没有 GitLab 项目权限。
GitLab 网络不可达。
known_hosts 未确认导致 SSH 失败。
```

------

## 5. Maven 编译和打包

Jenkins 拉到代码后，会执行 Maven 构建。

常见命令：

```bash
mvn clean package -DskipTests
```

如果是多模块项目，可能指定某个模块构建：

```bash
mvn clean package -pl user-service -am -DskipTests
```

参数解释：

```text
clean：清理上一次构建产物。
package：打包。
-DskipTests：跳过测试。
-pl：指定构建模块。
-am：同时构建该模块依赖的其他模块。
```

构建产物一般在：

```text
target/xxx-service.jar
```

Maven 构建失败常见原因：

```text
代码编译错误。
单元测试失败。
依赖包下载失败。
Maven 私服不可用。
JDK 版本不匹配。
pom.xml 依赖冲突。
```

实际工作中排查：

```text
先看 Jenkins Console Output。
确认失败阶段是 checkout、compile、test 还是 package。
如果是依赖下载失败，检查 Maven 私服或网络。
如果是编译错误，通知开发处理。
```

------

## 6. Dockerfile 构建镜像

SpringBoot jar 包生成后，会通过 Dockerfile 构建镜像。

典型 Dockerfile：

```dockerfile
FROM openjdk:8-jre-alpine
WORKDIR /app
COPY target/app.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-jar","/app/app.jar"]
```

字段解释：

```text
FROM：基础镜像。
WORKDIR：容器工作目录。
COPY：把 jar 包复制到镜像中。
EXPOSE：声明容器服务端口。
ENTRYPOINT：容器启动命令。
```

Jenkins 构建镜像命令：

```bash
docker build -t harbor.example.com/project/user-service:v1.0.1 .
```

镜像 tag 不建议一直使用 `latest`。推荐使用：

```text
版本号：v1.0.1
构建号：build-128
日期：20260614-1030
Git commit：git-a8c32f1
```

这样便于定位和回滚。

实际工作口径：

> Dockerfile 一般会有统一模板，不是每个服务完全从零写。不同模块主要区别是 jar 包名称、服务端口、JVM 参数和镜像名称。

Docker build 失败常见原因：

```text
jar 包路径不对。
Dockerfile COPY 文件不存在。
基础镜像拉取失败。
Docker daemon 异常。
磁盘空间不足。
镜像 tag 格式错误。
```

------

## 7. 推送镜像到 Harbor

Harbor 是企业常用的私有 Docker 镜像仓库。

可以理解为：

```text
GitLab：存代码。
Harbor：存镜像。
```

Jenkins 登录 Harbor：

```bash
docker login harbor.example.com -u 用户名 -p 密码
```

生产中不能把密码明文写在脚本里，应该使用 Jenkins Credentials。

推送镜像：

```bash
docker push harbor.example.com/project/user-service:v1.0.1
```

Harbor 推送失败常见原因：

```text
账号密码错误。
Jenkins 没有 Harbor 项目权限。
Harbor 项目不存在。
镜像 tag 写错。
Harbor 磁盘满。
Jenkins 到 Harbor 网络不通。
```

------

## 8. 部署到 Docker Compose 环境

测试、演示或小规模环境可能用 Docker Compose。

部署服务器上维护 `docker-compose.yml`：

```yaml
services:
  user-service:
    image: harbor.example.com/project/user-service:v1.0.1
    container_name: user-service
    ports:
      - "8081:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      MYSQL_HOST: mysql
      REDIS_HOST: redis
    networks:
      - app-net

networks:
  app-net:
    driver: bridge
```

Jenkins 可以通过 SSH 到部署服务器执行：

```bash
docker login harbor.example.com
docker compose pull user-service
docker compose up -d user-service
docker compose ps
docker compose logs --tail=100 user-service
```

如果使用 `.env` 管理镜像 tag：

```env
USER_SERVICE_IMAGE=harbor.example.com/project/user-service:v1.0.1
```

Compose 中引用：

```yaml
image: ${USER_SERVICE_IMAGE}
```

发布后验证：

```bash
docker compose ps
docker compose logs -f --tail=100 user-service
curl http://127.0.0.1:8081/actuator/health
```

Compose 部署失败常见原因：

```text
镜像拉取失败。
容器启动后退出。
端口冲突。
环境变量错误。
数据库或 Redis 连接失败。
容器网络配置错误。
宿主机磁盘空间不足。
```

------

## 9. 部署到 Kubernetes 环境

生产或标准环境可能部署到 K8s。

Deployment 中原镜像：

```yaml
image: harbor.example.com/project/user-service:v1.0.0
```

Jenkins 更新镜像：

```bash
kubectl set image deployment/user-service \
user-service=harbor.example.com/project/user-service:v1.0.1 \
-n prod
```

查看滚动更新状态：

```bash
kubectl rollout status deployment/user-service -n prod
```

查看 Pod：

```bash
kubectl get pod -n prod
```

查看日志：

```bash
kubectl logs -f pod名 -n prod
```

常见发布异常：

```text
ImagePullBackOff：镜像拉取失败，检查镜像地址、tag、Harbor 权限、imagePullSecrets。
CrashLoopBackOff：应用启动后崩溃，检查日志、配置、依赖服务。
Pending：资源不足、调度失败、PVC 问题。
Readiness probe failed：健康检查失败，服务未准备好接流量。
ConfigMap / Secret 错误：环境变量或密码配置不正确。
```

K8s 发布后验证：

```bash
kubectl rollout status deployment/user-service -n prod
kubectl get pod -n prod -o wide
kubectl logs -f pod名 -n prod
kubectl describe pod pod名 -n prod
curl http://服务地址/actuator/health
```

------

## 10. 发布后验证

发布不是启动完就结束，还要验证。

常见验证点：

```text
容器或 Pod 是否 Running。
健康检查接口是否正常。
日志是否有 ERROR / Exception。
Nginx / Ingress 是否能访问。
核心接口是否正常。
数据库、Redis、RabbitMQ 连接是否正常。
监控是否有异常告警。
```

Docker Compose 常用命令：

```bash
docker compose ps
docker compose logs -f --tail=100 user-service
docker port user-service
curl http://127.0.0.1:8081/actuator/health
```

K8s 常用命令：

```bash
kubectl get pod -n prod
kubectl rollout status deployment/user-service -n prod
kubectl logs -f pod名 -n prod
kubectl describe pod pod名 -n prod
```

> 发布后我不会只看 Jenkins 成功，还会看服务实际状态、日志和健康接口。如果 Jenkins 成功但服务没起来，也算发布失败。

------

## 11. 构建失败告警

Jenkins 构建失败后可以通过邮件、企业微信、钉钉等方式通知。

邮件告警一般分两步：

```text
1. Jenkins 全局配置 SMTP 邮件服务器。
2. 具体任务里配置失败后发送邮件。
```

通知对象：

```text
提交代码的开发。
测试人员。
运维人员。
项目负责人。
```

邮件内容：

```text
项目名称。
构建编号。
分支。
提交人。
提交 commit。
失败阶段。
错误摘要。
Jenkins 控制台日志链接。
构建地址。
```

Pipeline 示例：

```groovy
post {
    failure {
        mail to: 'devops@example.com',
             subject: "构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
             body: "请查看日志: ${env.BUILD_URL}"
    }
}
```

------

## 12. 回滚流程

生产发布异常时，优先恢复业务。

### K8s 回滚

查看发布历史：

```bash
kubectl rollout history deployment/user-service -n prod
```

回滚到上一个版本：

```bash
kubectl rollout undo deployment/user-service -n prod
```

查看回滚状态：

```bash
kubectl rollout status deployment/user-service -n prod
```

如果要回滚到指定 revision：

```bash
kubectl rollout undo deployment/user-service --to-revision=2 -n prod
```

### Docker Compose 回滚

把镜像 tag 改回上一个稳定版本：

```yaml
image: harbor.example.com/project/user-service:v1.0.0
```

重新拉取并启动：

```bash
docker compose pull user-service
docker compose up -d user-service
docker compose logs -f --tail=100 user-service
```

回滚前提：

```text
镜像 tag 必须明确。
Harbor 中旧镜像不能被删除。
配置文件和数据库变更要兼容。
如果涉及数据库结构变更，回滚更复杂，不能只回滚应用镜像。
```

> 如果确认是新版本问题，生产上优先回滚恢复业务。回滚后再把日志、版本号、接口路径、错误时间点整理给开发分析。

------

## 13. 自由风格任务和 Jenkinsfile

Jenkins 常见任务类型：

```text
自由风格任务。
Pipeline / Jenkinsfile。
```

自由风格任务：

```text
在 Jenkins 页面上配置 Git 地址、触发器、构建命令、Shell 脚本、构建后操作。
上手简单，适合早期和简单任务。
缺点是不方便版本管理和审计。
```

Jenkinsfile：

```text
把流水线写成代码，放到 GitLab 仓库。
类似 GitHub Actions 的 .github/workflows。
可以版本管理、审计、复用。
```

> 我接触自由风格任务比较多，了解 Jenkinsfile 基本结构。自由风格任务简单，上手快；Jenkinsfile 更规范，适合流水线代码化和团队协作。

------

## 14. 常见故障排查

### Webhook 没触发 Jenkins

排查：

```text
GitLab Webhook 最近请求记录。
Jenkins URL 是否正确。
Token 是否一致。
Jenkins 任务是否开启触发器。
GitLab 到 Jenkins 网络是否通。
```

### Jenkins 拉代码失败

排查：

```text
Git 仓库地址是否正确。
SSH Key 是否配置。
Jenkins Credentials 是否选对。
GitLab 项目权限是否足够。
known_hosts 是否确认。
```

### Maven 构建失败

排查：

```text
Console Output。
JDK / Maven 版本。
依赖下载。
Maven 私服。
代码编译错误。
测试失败。
```

### Docker build 失败

排查：

```text
Dockerfile 路径。
jar 包是否存在。
基础镜像是否能拉取。
磁盘空间。
Docker daemon 是否正常。
```

### Harbor push 失败

排查：

```text
Harbor 账号权限。
docker login 是否成功。
项目是否存在。
镜像 tag 是否正确。
Harbor 磁盘是否满。
```

### 部署成功但服务不可用

排查：

```text
容器或 Pod 状态。
应用日志。
端口监听。
环境变量。
ConfigMap / Secret。
数据库 / Redis / RabbitMQ 连接。
Nginx / Ingress 转发。
健康检查接口。
```

title: Jenkins 流水线入门
---
# Jenkins 流水线入门

Jenkins 是常见的 CI/CD 工具，用来把拉代码、安装依赖、测试、构建、打包、部署这些步骤自动化。它的价值是让发布流程标准化、可重复、可追踪。

## CI/CD 是什么

CI：持续集成。开发提交代码后，系统自动拉取代码、安装依赖、运行测试、构建产物。

CD：持续交付或持续部署。构建完成后，把产物发布到测试、预发布或生产环境。

典型流程：

```text
Git push
  -> Jenkins 拉取代码
  -> 安装依赖
  -> 单元测试
  -> 构建 Jar / dist / Docker 镜像
  -> 推送制品
  -> 部署到服务器
  -> 健康检查
```

## Jenkins 安装方式

生产中常见三种方式：


| 方式            | 说明               |
| --------------- | ------------------ |
| rpm/deb 安装    | 适合传统服务器     |
| Docker 安装     | 部署方便，环境隔离 |
| Kubernetes 安装 | 适合云原生环境     |

Docker 启动示例：

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

查看初始密码：

```bash
docker logs jenkins
```

或：

```bash
docker exec -it jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 基础配置

常用插件：

- Git。
- Pipeline。
- Maven Integration。
- NodeJS。
- Docker Pipeline。
- SSH Agent。

常用全局工具：

- JDK。
- Maven。
- Node.js。
- Git。
- Docker。

Jenkins 服务器需要能访问：

- Git 仓库。
- 依赖仓库。
- 镜像仓库。
- 部署目标服务器。

## Freestyle 和 Pipeline

Freestyle 是图形化任务，适合简单构建。

Pipeline 用 `Jenkinsfile` 描述流水线，更适合团队协作和版本管理。

推荐使用 Pipeline，因为流水线配置跟随代码仓库，便于审查和回滚。

## Jenkinsfile 示例：Java 项目

```groovy
pipeline {
    agent any

    tools {
        jdk 'jdk17'
        maven 'maven3'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }
    }
}
```

## Jenkinsfile 示例：Docker 镜像

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'registry.example.com/justin/app'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Jar') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Build Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
            }
        }

        stage('Push Image') {
            steps {
                sh 'docker push $IMAGE_NAME:$IMAGE_TAG'
            }
        }
    }
}
```

生产中镜像仓库登录凭据应使用 Jenkins Credentials，不要写死在 Jenkinsfile。

## 部署到服务器

可以通过 SSH 执行远程部署脚本：

```groovy
stage('Deploy') {
    steps {
        sshagent(credentials: ['prod-server-ssh']) {
            sh '''
              ssh app@192.168.1.10 "
                docker pull registry.example.com/justin/app:${BUILD_NUMBER} &&
                docker stop justin-app || true &&
                docker rm justin-app || true &&
                docker run -d --name justin-app -p 8080:8080 registry.example.com/justin/app:${BUILD_NUMBER}
              "
            '''
        }
    }
}
```

更稳的方式是服务器上维护部署脚本，Jenkins 只传版本号：

```bash
ssh app@192.168.1.10 "/opt/deploy/deploy-app.sh ${BUILD_NUMBER}"
```

这样部署逻辑集中在服务器脚本中，Jenkinsfile 不会过长。

## 凭据管理

Jenkins Credentials 可以保存：

- Git 用户名密码。
- SSH 私钥。
- Docker Registry 账号。
- 密钥文本。

原则：

- 密码不要写进 Jenkinsfile。
- 不要把生产私钥放进代码仓库。
- 不同环境使用不同凭据。
- 定期清理不用的凭据。

## 构建失败排查

### 拉代码失败

检查：

- Git 地址是否正确。
- Jenkins 凭据是否正确。
- Jenkins 服务器是否能访问 Git。

### Maven 下载依赖失败

检查：

- Maven settings.xml。
- 私服地址。
- 网络代理。
- 依赖版本是否存在。

### Docker build 失败

检查：

- Jenkins 节点是否安装 Docker。
- Jenkins 用户是否有 Docker 权限。
- Dockerfile 路径是否正确。
- 构建上下文是否包含 Jar 包。

### 部署失败

检查：

- SSH 是否能连接服务器。
- 服务器 Docker 是否正常。
- 镜像是否推送成功。
- 端口是否冲突。
- 容器日志是否报错。

## 发布注意事项

- 每次构建都要有唯一版本号。
- 保留构建产物。
- 部署前备份关键配置。
- 发布后做健康检查。
- 保留回滚版本。
- 生产发布建议有审批或手动确认步骤。

手动确认示例：

```groovy
stage('Confirm Deploy') {
    steps {
        input message: 'Deploy to production?'
    }
}
```
