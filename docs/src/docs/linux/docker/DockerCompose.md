---
icon: docker
---
# 9_1_Docker Compose
------

### 引言

Docker Compose，作为一个强大的工具，极大地简化了多容器应用程序的定义和管理。本文将全面介绍Docker Compose的知识点，涵盖其基础概念、核心功能、配置详解以及实战应用，帮助你更好地管理和部署基于容器的应用程序。

http://docs.docker.com/compose

#### 一、Docker Compose简介

Docker Compose是Docker官方推出的用于定义和运行多容器Docker应用程序的工具。通过YAML文件（通常命名为`docker-compose.yml`），您可以一次性定义一组相关的服务、网络和卷，然后通过一个简单的命令即可启动和停止整个应用程序的所有服务。

安装步骤就不说了，直接按照官方的来更加方便。https://docs.docker.com/compose/install/linux/#install-using-the-repository

#### 二、Docker Compose的核心概念

1. **服务(Service)** 在Docker Compose中，服务代表一个容器（Mysql，Redis，库存微服务等），定义了镜像、环境变量、端口映射、依赖关系等内容。您可以指定服务的数量（副本数）和启动顺序。
2. **网络(Network)** Docker Compose允许创建自定义网络，服务可以通过网络相互通信。默认情况下，Compose会创建一个名为`default`的网络，将所有服务连接到此网络。
3. **卷(Volumes)** 卷用来持久化存储数据，即使容器被删除，数据也能得以保留。在Compose文件中，可以声明哪些目录或文件需要挂载为持久化卷。
4. **依赖(Dependencies)** 可以设置服务之间的依赖关系，确保在启动或重启时，先启动依赖的服务，后启动依赖于它的服务。

#### 三、Docker Compose三步骤

- 编写Dockerfile定义各个微服务应用并构建出对应的镜像文件
- 使用docker-compose.yaml定义一个完整的业务单元，各个容器服务
- 最后执行docker-compose up命令来启动并运行整个应用程序，完成一键部署

#### 四、Docker Compose命令

类似于docker命令，比较学习

```bash
Compose常用命令
docker-compose -h                           # 查看帮助
docker-compose up                           # 启动所有docker-compose服务
docker-compose up -d                        # 启动所有docker-compose服务并后台运行
docker-compose down                         # 停止并删除容器、网络、卷、镜像。
docker-compose exec  yml里面的服务id               
# 进入容器实例内部  docker-compose exec docker-compose.yml文件中写的服务id /bin/bash
docker-compose ps                      # 展示当前docker-compose编排过的运行的所有容器
docker-compose top                     # 展示当前docker-compose编排过的容器进程
 
docker-compose logs  yml里面的服务id     # 查看容器输出日志
docker-compose config     # 检查配置
docker-compose config -q  # 检查配置，有问题才有输出
docker-compose restart   # 重启服务
docker-compose start     # 启动服务
docker-compose stop      # 停止服务
```



#### 三、Docker Compose文件详解

一个典型的`docker-compose.yml`文件结构如下：

Yaml

```yaml
1version: '3' # Compose文件版本
2
3services:
4  web:
5    image: nginx:latest
6    ports:
7      - "80:80"
8    networks:
9      - mynetwork
10    depends_on:
11      - db
12  db:
13    image: mysql:5.7
14    environment:
15      MYSQL_ROOT_PASSWORD: example
16    volumes:
17      - db_data:/var/lib/mysql
18    networks:
19      - mynetwork
20
21networks:
22  mynetwork:
23
24volumes:
25  db_data:
```

- `version`: 指定Compose文件格式版本。
- `services`: 定义了两个服务，分别是web和db，分别对应Nginx和MySQL容器。
- `ports`: 映射容器内部端口到宿主机端口。
- `environment`: 设置环境变量，如MySQL的root密码。
- `volumes`: 将宿主机目录或命名卷挂载到容器内。
- `depends_on`: 表明web服务依赖于db服务。
- `networks`: 自定义网络mynetwork，让web和db服务都连接到此网络。

#### 四、Docker Compose常用命令

- `docker-compose up`：根据compose文件创建并启动所有服务。
- `docker-compose down`：停止并移除所有容器、网络、卷。
- `docker-compose ps`：查看当前所有服务的状态。
- `docker-compose restart`：重启所有服务。
- `docker-compose build`：重新构建服务的镜像。

#### 五、实战应用举例

在开发环境中，Docker Compose常用于快速搭建包含多种服务（如Web服务器、数据库、缓存服务等）的应用栈，方便团队成员一键启动整个项目环境，极大提高了协作效率。

#### 六、高级特性及最佳实践

- **多环境配置**：利用`.env`文件或环境变量覆盖Compose文件中的变量，实现多环境下的差异化配置。
- **扩展Compose模板**：通过`extends`关键字在多个Compose文件之间共享通用配置。
- **健康检查**：配置服务健康检查，确保服务在启动后能够正常工作。
- **编排复杂应用**：通过Compose文件可以轻松编排大规模、复杂的微服务架构。

总结，Docker Compose不仅简化了多容器应用程序的部署和管理，而且有助于提升开发、测试和生产环境的一致性，是现代云原生应用开发的重要工具之一。熟练掌握Docker Compose的各项功能和用法，将使你在容器化应用的道路上更加得心应手。

#### 七、实例实现容器监控**CAdvisor+InfluxDB+Granfana**

```bash
version: '3.1' # 使用的 Docker Compose 版本为 3.1

# 定义名为 grafana_data 的持久化数据卷，用于存储 Grafana 的配置和数据
volumes:
  grafana_data: {}

services:
  influxdb: # 定义 InfluxDB 服务容器
    image: tutum/influxdb:0.9 # 使用基于 Tutum 的 InfluxDB 镜像版本 0.9
    restart: always # 确保服务在退出时自动重启
    environment: # 设置环境变量以预先创建名为 cadvisor 的数据库
      - PRE_CREATE_DB=cadvisor
    ports: # 映射宿主机与容器间的端口
      - "8083:8083" # InfluxDB 管理界面
      - "8086:8086" # InfluxDB API 端口
    volumes: # 挂载宿主机目录到容器内作为数据存储路径
      - ./data/influxdb:/data # 将当前目录下的 data/influxdb 挂载到容器内的 /data 目录

  cadvisor: # 定义 cAdvisor 服务容器
    image: google/cadvisor # 使用 Google 提供的 cAdvisor 镜像
    links: # 建立容器间连接（依赖关系）
      - influxdb:influxsrv # 将 influxdb 容器别名设置为 influxsrv
    command: # 设置启动命令参数，配置 cAdvisor 数据输出至 InfluxDB
      - "-storage_driver=influxdb"
      - "-storage_driver_db=cadvisor"
      - "-storage_driver_host=influxsrv:8086"
    restart: always # 确保服务在退出时自动重启
    ports: # 映射宿主机与容器间的端口
      - "8080:8080" # cAdvisor Web UI 端口
    volumes: # 挂载宿主机系统资源给 cAdvisor 监控使用
      - /:/rootfs:ro # 只读挂载根文件系统
      - /var/run:/var/run:rw # 可读写挂载 var/run 目录
      - /sys:/sys:ro # 只读挂载 sys 文件系统
      - /var/lib/docker/:/var/lib/docker:ro # 只读挂载 Docker 数据目录

  grafana: # 定义 Grafana 服务容器
    user: "104" # 设置运行 Grafana 容器的用户 ID（可能用于特定权限需求）
    image: grafana/grafana # 使用官方提供的 Grafana 镜像
    restart: always # 确保服务在退出时自动重启
    links: # 建立容器间连接
      - influxdb:influxsrv # 将 influxdb 容器别名设置为 influxsrv
    ports: # 映射宿主机与容器间的端口
      - "3000:3000" # Grafana Web UI 端口
    volumes: # 挂载持久化数据卷到容器内部指定路径
      - grafana_data:/var/lib/grafana # 使用之前定义的 grafana_data 卷存储 Grafana 数据
    environment: # 设置环境变量配置 Grafana 连接 InfluxDB
      - HTTP_USER=admin # 设置 Grafana Web UI 默认用户名
      - HTTP_PASS=admin # 设置 Grafana Web UI 默认密码
      - INFLUXDB_HOST=influxsrv # 设置 InfluxDB 服务地址，通过容器别名引用
      - INFLUXDB_PORT=8086 # 设置 InfluxDB 服务端口
      - INFLUXDB_NAME=cadvisor # 设置要连接的 InfluxDB 数据库名称
      - INFLUXDB_USER=root # 设置 InfluxDB 用户名
      - INFLUXDB_PASS=root # 设置 InfluxDB 密码
```

