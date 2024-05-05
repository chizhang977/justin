---
icon: docker
---
# 4_Dokcer容器的数据卷

### 数据卷

- 就是为了保存数据，因为容器中的数据，不提交成为镜像，容器删除后，数据也就没了
- 做持久化的

### 数据卷目的

 卷的设计目的就是数据的持久化，完全独立于容器的生存周期，因此Docker不会在容器删除时删除其挂载的数据卷 

### 特点：

1：数据卷可在容器之间共享或重用数据 

2：卷中的更改可以直接生效 

3：数据卷中的更改不会包含在镜像的更新中 

4：数据卷的生命周期一直持续到没有容器使用它为止 

### 添加数据卷

```
docker run -it -v /宿主机绝对路径目录：/容器内目录 --privileged=true 镜像名
```

是否挂在成功，成功后容器和宿主机之间数据共享，容器停止推出后，主机修改后数据依然同步

```
docker inspect 容器id
```

### 带权限的数据卷

```
docker run -it /宿主机绝对路径目录：/容器内目录:ro/rw 镜像名
```

### 卷的继承和共享

```
docker run -it  --privileged=true -v /mydocker/u:/tmp --name u1 ubuntu 
```

```
docker run -it  --privileged=true --volumes-from 父类  --name u2 ubuntu
```

