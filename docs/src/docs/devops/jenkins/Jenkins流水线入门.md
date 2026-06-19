---
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

| 方式 | 说明 |
| --- | --- |
| rpm/deb 安装 | 适合传统服务器 |
| Docker 安装 | 部署方便，环境隔离 |
| Kubernetes 安装 | 适合云原生环境 |

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
