---
icon: docker
date: 2024-03-25
---
# 2_Docker常用命令

### 一、帮助命令

```bash
docker version
docker info 
docker --help
```

### 二、镜像命令

```bash
docker images
# -a：列出本地所有的镜像
# -q：只显示出镜像ID
# --digests：显示镜像的摘要信息
# --no-trunc：显示完整的镜像信息
```

```bash
docker search 镜像名 #搜素镜像
# --no-trunc：显示完整镜像描述
# -s： 列出收藏数不小于之指定的镜像
# --automated： 只列出automated build 类型的镜像
```

```bash
docker pull 镜像名:tag #下载镜像
```

```bash
docker rmi 镜像名 #删除镜像
# -f 镜像ID    删除单个
# -f 镜像1:tag 镜像2:tag 删除多个
# -f $(docker images -qa) 删除全部
```

### 三、容器命令

```bash
docker run 【options】 image  #新建容器启动镜像
# --name="":为容器指定一个名称
# -d：后台运行容器，并返回容器的ID，启动守护式容器
# -i：交互模式运行容器
# -t：为容器分配一个伪输入终端
# -P：随检端口映射
# -p：ip：hostport：containerPort
#			ip：containerPort
#			hostPort：containerPort
#			containerPort
			
```

```bash
docker ps # 列出当前运行的容器
# -a：列出当前所有正在运行的容器+历史上运行过的
# -l：显示最近创建的容器
# -n：显示最精n个创建的容器
# -q： 静默模式，只显示容器的编号
# --no-trunc：不断输出
```

```bash
exit #容器停止推出
ctrl+P+Q # 容器不停止推出
```

```bash
docker start xxx # 启动容器
docker restart xxx # 重启
docker stop xxx # 停止
docker kill xxx # 强制停止容器
docker rm xxx #删除
docker rm -f $(docker ps -q -a)
docker ps -a -q | xargs docker rm
```

### 三、其他命令

查看日志
```bash
docker logs -f -t --tail #查看容器日志
# -t：时间戳
# -f：日志打印
# --tail：数字 显示最后多少条
```
查看容器细节
```bash
docker top xxx # 查看容器内运行的进程
docker inspect xxx # 查看容器内部的细节
```


进入容器内
```bash
# attach 直接进入容器启动命令的终端，不会启动新的进程
# exec 是在容器中打开的新的终端，启动新的进程
docker exec - it xxx bash
docker attach xxx
```

宿主机和容器文件的复制
```bash
docker cp 容器id：容器内路径 目的主机路径
```

提交改变 将自己修改好的镜像提交
```bash
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
docker commit -m "修改" -a "作者" 容器id 新的镜像名
```

镜像传输
```bash
# 将镜像保存成压缩包,这个镜像要写成 镜像名:tag，写成镜像id，会出现《none》
docker save -o myredis.tar redis:6.2.14

# 别的机器加载这个镜像
docker load -i myredis.tar
```

