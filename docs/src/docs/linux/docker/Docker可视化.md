---
icon: docker
---
# 9_2_docker Portainer

## **引言**

在容器化技术的世界中，Docker已成为构建、部署和运行应用程序的标准工具。然而，对于复杂环境下的容器管理和运维，一个直观、易用的图形界面往往能极大地提升工作效率。Portainer正是这样一个轻量级且功能强大的Docker管理工具，它提供了一站式的解决方案，帮助用户轻松地在单个主机或集群环境中部署和管理Docker容器和服务。

## **一、Portainer简介**

Portainer（官方网站：https://www.portainer.io/ ）是一个开源项目，专为简化Docker和Kubernetes的日常管理工作而设计。它通过简洁明了的Web UI，使得无论是初学者还是经验丰富的开发者都能方便地进行镜像管理、容器生命周期操作、网络配置、卷管理以及用户权限控制等任务。

## **二、Portainer的安装**

1. **拉取Portainer镜像** 在命令行中输入以下命令来获取最新版本的Portainer CE（Community Edition）：

   Bash

   ```bash
   docker pull portainer/portainer-ce:latest
   ```

2. **创建数据卷持久化存储** 为了持久保存Portainer的服务数据（如设置、凭据等），可以创建并挂载数据卷：

   Bash

   ```bash
   docker volume create portainer_data
   ```

3. **启动Portainer容器** 使用以下命令运行Portainer容器，并将本地Docker守护进程套接字映射到容器内，同时挂载上一步创建的数据卷：

   Bash

   ```bash
   docker run -d -p 8000:8000 -p 9000:9000 --name=portainer \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v portainer_data:/data \
     --restart=always \
     portainer/portainer-ce
   ```

   这个命令做了以下几件事：

   - `-d` 表示在后台运行容器。
   - `-p 8000:8000` 将宿主机的8000端口映射到容器的8000端口，用于HTTP连接。
   - `-p 9000:9000` （可选）如果需要HTTPS连接，则映射9000端口。
   - `--name=portainer` 给容器命名。
   - `-v /var/run/docker.sock:/var/run/docker.sock` 把Docker守护进程的套接字文件挂载到容器内。
   - `-v portainer_data:/data` 创建一个数据卷挂载点，持久化Portainer的数据。
   - `-restart=always` 设置容器总是重启策略，确保服务持续可用。
   - 最后指定了要运行的镜像名称。

4. **访问Portainer Web界面** 在浏览器中输入 `http://localhost:8000` 或宿主机IP及端口即可打开Portainer登录页面。首次访问时，需要设置管理员账户信息以初始化环境。

## **三、Portainer的主要功能特性**

- **资源管理**：Portainer提供对主机上的所有Docker资源进行统一视图管理，包括容器、镜像、网络、卷和插件等。
- **容器操作**：支持一键创建、启动、停止、重启、迁移和删除容器，还可以查看容器日志和执行终端命令。
- **服务管理**：在Docker Swarm模式下，可便捷地创建、更新和删除服务。
- **模板应用**：内置应用模板库，支持快速部署预配置的应用栈。
- **安全性与权限控制**：支持多用户登录和基于角色的访问控制（RBAC），确保不同团队成员仅能访问自己负责的部分。
- **远程连接**：不仅限于本机Docker实例，还可连接至远程Docker主机或者Swarm集群进行管理。
- **备份与恢复**：通过简单的UI操作实现对Portainer自身配置和关联Docker资源的备份和恢复。

## **四、进阶使用**

对于高级用户，Portainer还支持自定义API端点、TLS加密连接、以及集成其他云提供商等功能。通过细致的配置，Portainer可以在复杂的IT架构中发挥重要作用，有效降低容器管理的复杂性。

## **结语**

Portainer作为一款全面的Docker管理工具，以其友好的界面和强大的功能赢得了广大开发者的青睐。掌握Portainer的使用都将使您的容器管理工作事半功倍。只需几步简单的操作，即可开启您的可视化Docker之旅，让容器管理变得更加简单高效。