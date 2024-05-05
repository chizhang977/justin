

# 1_Docker初识

### 一、Docker简介

1.  理念：一次封装，到处运行（通过对应用组件的封装、分发、运行等生命周期的管理）

2.  理解：解决了运行环境和配置问题的软件容器，方便做持续集成并有助于整体发布的容器虚拟化技术

3.  虚拟化技术：

   - 虚拟机：带环境安装解决方案，虚拟硬件，运行操作系统，在运行进程
   - 容器虚拟化：模拟一个完整的操作系统，软件运行所需要的所有资源打包到一个隔离的容器中。应用进程直接运行与宿主的内核，容器内没有自己的内核，没有对硬件进行虚拟，容器之间相互隔离，不相互影响。

4. 官网：     http://www.docker.com 

   ​		http://www.docker-cn.com 

   ​		http://hub.docker.com

### 二、Docker安装

1、确定linux版本

```bash
cat /etc/redhat-release
```

2、安装gcc

```bash
yum -y install gcc 
yum -y install gcc-c++
```

3、卸载旧版本（24/3/16官网）

```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

卸载docker映像，容器，卷，网络不会自动删除`/var/lib/docker`下

4、安装方式（设置docker存储库/手动安装/便利脚本）存储库安装

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum makecache fast  #更新yum软件包索引
```

5、安装docker

```bash
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

6、启动docker

```bash
sudo systemctl start docker
```

7、测试

```bash
docker version
docker run hello-world		
```

8、卸载

```bash
systemctl stop docker
yum -y remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
rm -rf /var/lib/docker
```

9、加速器地址

直接用：（https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors）

阿里开发者平台 ：https://dev.aliyun.com/search.html

10、配置镜像加速器（centos/Mac）

- 针对Docker客户端版本大于 1.10.0 的用户

您可以通过修改daemon配置文件/etc/docker/daemon.json来使用加速器

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": 你的地址
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

11、重新启动

```bash
systemctl restart docker
ps-fe | grep docker
```

### 三、docker原理

Docker是一个cs结构的系统，Docker守护进程运行在主机上，然后通过Socket连接从客户端访问，守护进程从客户端接受命令并管理运行在主机上的容器。容器是一个运行时环境。

客户端发送命令------->Docker守护进程------->容器

