---
icon: docker
---
# 8_Dockerfile详解

## Dockerfile概述

Dockerfile是一种用于定义Docker镜像构建过程的文本文件，它由一系列构建镜像所必需的指令和参数组成。

### 官方文档地址

- [Dockerfile 构建规范](https://docs.docker.com/engine/reference/builder/)

### 构建步骤概览

1. **编写Dockerfile**
   - 创建包含Docker镜像构建指令的文本文件。
2. **构建镜像**
   - 使用 `docker build` 命令根据Dockerfile构建镜像。
3. **运行镜像**
   - 使用 `docker run` 命令运行构建好的镜像。

## Dockerfile构建流程

### 基础概念

- 指令格式
  - 每条指令必须大写，并且后跟至少一个参数。
  - 指令按顺序执行，从上到下。
  - 使用 `#` 表示注释，注释内容会被忽略。
  - 每条指令执行完后，都会创建一个新的镜像层并提交。

### 构建过程详情

1. **基于基础镜像创建容器**
2. **执行Dockerfile中的指令并修改容器**
3. **执行类似 `docker commit` 操作，提交新的镜像层**
4. **基于新提交的镜像创建新的容器**
5. **继续执行Dockerfile中的下一条指令，直至所有指令执行完毕**

### Dockerfile常用指令

#### FROM

- 作用：指定基础镜像，Dockerfile的第一条指令必须是 `FROM`，作为后续构建的基础模板。

#### MAINTAINER（已废弃）

- 作用：声明镜像维护者的信息，现推荐使用 `LABEL` 指令替代，例如 `LABEL maintainer="Your Name <email@example.com>"`。

#### RUN

- 作用：执行构建镜像过程中的命令。

  - 语法格式：
    - `RUN "<命令行命令>"`
    - `RUN [可执行文件, 参数1, 参数2]`
  - 注意：`RUN` 指令在 `docker build` 时执行。

#### EXPOSE

- 作用：声明当前容器对外暴露的端口。

#### WORKDIR

- 作用：指定在创建容器后，终端默认登录的工作目录。

#### USER

- 作用：指定镜像运行时的用户，默认为 `root` 用户。

#### ENV

- 作用：在构建镜像过程中设置环境变量。

#### ADD

- 作用：将宿主机目录下的文件或目录拷贝进镜像，支持URL和自动处理tar压缩包。

#### COPY

- 作用：类似于 `ADD`，拷贝文件和目录到镜像中，从构建上下文目录的源路径复制到镜像内目标路径。

#### VOLUME

- 作用：声明容器数据卷，用于数据持久化存储。

#### CMD

- 作用
  - 指定容器启动后的默认行为。
  - Dockerfile中可以有多个 `CMD` 指令，但最终只有最后一个 `CMD` 生效，且会被 `docker run` 后面的参数替换。
  - `CMD` 在 `docker run` 时执行，而 `RUN` 在 `docker build` 时执行。

#### ENTRYPOINT

- 作用：用于指定容器启动时运行的命令。

  - 不会被 `docker run` 后面的命令覆盖，其参数会被追加到 `ENTRYPOINT` 指定的程序。
  - `ENTRYPOINT` 可以和 `CMD` 一起使用，一般在需要动态参数的情况下使用 `CMD` 为 `ENTRYPOINT` 传参。
  - 当设置了 `ENTRYPOINT` 后，`CMD` 的内容将作为参数传递给 `ENTRYPOINT`，二者结合如同 `entrypoint cmd`。
  - 在执行 `docker run` 时可以指定 `ENTRYPOINT` 运行所需的参数。
  - 若 Dockerfile 中存在多个 `ENTRYPOINT` 指令，仅最后一个生效。

### 构建步骤重述

1. 编写Dockerfile文件。
2. 执行 `docker build -t 新镜像名字:tag .` 构建镜像。
3. 使用 `docker run -it 镜像名:tag` 运行构建好的镜像。

### 处理虚悬镜像

带有仓库名和标签均为 `<none>` 的镜像被称为“虚悬镜像”。

Bash

```bash
1# 查看虚悬镜像
2docker image ls -f dangling=true
3
4# 删除虚悬镜像
5docker image prune
```