---
icon: docker
---
# 9_0_Docker 网络

### 理解

docker启动后，会产生一个`docker0`的虚拟网桥，容器之间以及容器与主机系统之间通信的关键部分

容器ip变动时候可以通过服务名直接网络通信而不受影响

### 基本命令

```bash
docker network --help #帮助信息
docker network ls xxx    #查看网络
docker network inspect xxx网络名字 #查看网络源数据
docker netwrok rm xxx网络名字 # 删除网络
connect/create/disconnect/inspect/ls/prune/rm
```

### 网络模式

- **Bridge网络（默认）**

  - Docker在安装时创建一个名为`bridge`的默认网络。在这个网络模式下，***<u>Docker会为每个新创建的容器分配一个唯一的IP地址，并通过虚拟网桥连接容器和主机</u>***。容器间可以直接通过IP地址通信，也可以通过容器名称相互通信。

  - 查看bridge网络详细信息

  ```bash
  docker network inspect bridge | grep name
  ifconfig | grep docker
  ```

    ![bridge](/assets/image/docker/bridge.png)

- **Host网络模式**

  - 当容器使用`--net=host`启动时，它将共享宿主机的网络栈，这意味着容器将不会获得独立的Network Namespace，而是直接***<u>使用宿主机的网络接口，拥有宿主机的IP地址和端口</u>***。

- **None网络模式**

  - 在`--net=none`模式下，***<u>容器没有任何网络功能，不能联网</u>***，通常用于运行那些不需要网络通信的应用程序。

- **Container网络模式**

  - 当使用`--net=container:<容器ID或名字>`启动容器时，***<u>新容器将与指定容器共享相同的Network Namespace</u>***，意味着它们将共享同一个网络堆栈，包括IP地址和端口。
  - ![Container](/assets/image/docker/Container.png)

- **自定义网络（User-defined networks）**

  - 用户可以创建自己的网络，例如通过`docker network create`命令创建overlay网络、macvlan网络、host网络等多种类型，以便更灵活地控制容器间的网络通信和隔离。

自定义网络的优点包括：

- 可以实现多主机通信（在overlay网络中）。
- 更细粒度的网络策略控制，如子网划分、网络隔离、端口映射等。
- DNS服务，容器加入网络后可以自动为其分配域名，容器间可通过容器名称进行通信。

在Docker守护程序的配置文件`/etc/docker/daemon.json`中，可以对Docker网络进行全局的配置调整，例如默认的网络驱动、DNS服务器等。配置变更后需重启Docker服务才能生效。