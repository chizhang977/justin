---
title: 1_Redis介绍与使用
icon: Redis
date: 2024-04-09
---

# 1_Redis基础



### 1、认识NoSQL

- **NoSql**可以是Not Only Sql（不仅仅是SQL），也可以是No Sql（非Sql的）数据库 ，叫为**非关系型数据库**。
- 分类
  - 键值存储数据库:Redis、Memcached
  - 文档型数据库:MongoDB
  - 图形数据库:Neo4j
  - 列型数据库:HBase
- NoSQL不保证ACID原则

### 2、介绍 [Redis](https://redis.io)

- Redis是一个默认端口号`6379`键值型的`NoSql`数据库，go语言编写
- 基于内存，低延迟，速度快
- 键值（key-value）型，value支持多种不同数据结构
- 单线程，每个命令具备原子性
- 支持数据持久化
- 支持主从集群、分片集群
- 支持多语言客户端(Java,python等)

### 3、使用场景

::: details 缓存
   - Redis 最常见的用途之一是作为高速缓存层，用于存储热点数据，减少对后端数据库的压力。通过设置键的过期时间（TTL），可以自动刷新缓存中的数据。
:::    
::: details 实时排行榜与计数器
   - Redis 提供有序集合（Sorted Set）数据结构，可以轻松实现实时排名系统，如用户积分排行、文章热度排行等。
   - 利用 `INCR` 和 `DECR` 命令，Redis 可以作为高效的计数器服务，用于记录网页点击次数、商品库存数量、用户点赞数等。
:::    
::: details 会话存储（Session 存储）
   - 在大型分布式环境中，Redis 可以作为集中式会话存储服务，确保在多台服务器之间共享用户会话状态。
::: 
::: details 分布式锁
   - Redis 支持原生的分布式锁机制，如使用 `SETNX` 和 `EXPIRE` 实现乐观锁，用于协调多进程或分布式环境下的并发控制。
::: 
::: details 消息队列
   - Redis 列表（List）数据结构可以模拟队列或堆栈，实现简单的消息队列功能，比如通过 `LPUSH` 和 `BRPOP` 实现工作队列,也可以使用Stream。
::: 
::: details 社交网络功能
   - Redis 支持丰富的数据结构，如哈希（Hash）和集合（Sets），因此非常适合存储用户的社交关系，如关注/粉丝、共同好友、赞/踩等社交互动数据。
::: 
::: details 查找表
   - 对于一些需要快速查找的数据，如DNS记录、IP黑名单等，Redis可以提供近乎实时的查询能力。
::: 
::: details 实时数据分析与统计
   - Redis可以实时收集并聚合数据，对于实时计算如PV统计、UV统计等场景非常有效。（HyperLogLog）
::: 
::: details 地理空间索引
   - Redis支持地理空间索引功能，可用于附近地点搜索、地理位置分析等应用场景。（GEO）
::: details 多级缓存
::: 
### 4、Redis安装

- Linux环境安装

  - ```bash
    yum install -y gcc tcl
    tar -xzvf redis-6.2.14.tar.gz
    cd redis-6.2.14
    make && make install
    ```

- 使用Docker安装

  - ```bash
    #需要一份配置文件放到redis.conf,或者第一次启动之后从容器中拷贝
    docker run -p 6379:6379 --name myredis \
    --privileged=true \
    -v /root/app/redis/redis.conf:/etc/redis/redis.conf \
    -v /root/app/redis/data:/data -d  \
    redis:6.2.14 redis-server /etc/redis/redis.conf
    ```

### 5、启动

#### 5、1默认启动

```bash
#前台启动，会阻塞整个会话窗口，不推荐
redis-server
```

#### 5、2指定配置文件启动

```bash
#推荐，指定配置文件，启动前修改配置文件
redis-server /usr/local/redis/redis.conf
```

#### 5、3开机自启（linux）

首先，新建一个系统服务文件：

```sh
vim /etc/systemd/system/redis.service
```

```conf
[Unit]
Description=redis-server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/redis-server /usr/local/src/redis-6.2.14/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

重载系统服务：

```sh
systemctl daemon-reload
```

```sh
# 启动
systemctl start redis
# 停止
systemctl stop redis
# 重启
systemctl restart redis
# 查看状态
systemctl status redis
```

redis开机自启：

```sh
systemctl enable redis
```

### 6、配置文件详解

```properties
# 生产环境不要设置为0.0.0.0，指定Redis服务器绑定的IP地址，可以是单个IP或多个IP，留空则接受所有网络接口连接,默认情况bind=127.0.0.1只能接受本机的访问请求,不写的情况下，无限制接受任何ip地址的访问
bind 0.0.0.0
# 如果开启了protected-mode，那么在没有设定bind ip且没有设密码的情况下，Redis只允许接受	本机的响应
protected-mode yes
# 守护进程，修改为yes后即可后台运行
daemonize yes 
# 密码，设置后访问Redis必须输入密码，推荐设置
requirepass chengredis
# 监听的端口
port 6379
# 工作目录，默认是当前目录，也就是运行redis-server时的命令，日志、持久化等文件会保存在这个目录
dir .
# 数据库数量，设置为1，代表只使用1个库，默认有16个库，编号0~15
databases 15
# 设置redis能够使用的最大内存
maxmemory 512mb
# 日志文件，默认为空，不记录日志，可以指定日志文件名
logfile "redis.log"
# 日志级别，debug，verbos，**notice**，**warning**
loglevel
# 设置客户端空闲多少秒后关闭连接，默认0表示永不超时
timeout 300
# 设置TCP连接队列的大小，当大量并发连接请求到来时，有助于处理排队连接请求
tcp-backlog 511
# 对访问客户端的一种心跳检测，每隔n秒检测一次,单位为秒，如果设置为0，则不会进行Keepalive检测，建议设置成60 
tcp-keepalive
#存放pid文件的位置，每个实例会产生一个不同的pid文件
pidfile
# 定义RDB持久化的策略，即在满足给定时间内发生指定次数的数据更改时自动保存数据到磁盘。
save <seconds> <changes>
save 900 1
save 300 10
save 60 10000
# 是否启用RDB文件的压缩存储
rdbcompression yes/no
# 是否开启AOF（Append-only File）持久化模式
appendonly yes/no
# 设置AOF同步磁盘的频率，always表示每次写入都同步，everysec表示每秒同步一次，no表示由操作系统决定何时同步。
appendfsync always/everysec/no
# 设置Redis最大使用内存大小，达到这个限制后，需要配置相应的淘汰策略
maxmemory <bytes>
# 设置当内存达到maxmemory限制时如何淘汰数据的策略
maxmemory-policy noeviction/lru/ttl/volatile-lru/volatile-ttl/allkeys-lru/allkeys-random
# 包含其他配置文件，便于模块化配置
include other.conf
##### 配置文件

```

### 6、Redis命令

-  设置密码


```bash
config get requirepass
config set requirepass "linux"
```

- 连接与认证

```bash
# 连接
redis-cli -h [ip] -p [port]
# 检测与Redis服务器的连接状态
ping
# 如果Redis服务器启用了密码验证，则使用此命令进行身份验证
auth [password]
```

- 键操作

```bash
# 全世界都知道了，就不一个一个写解释了
set key value
get key
del key [key ...]
exists key
expire key seconds
ttl key
type key
select index
```

- 持久化

```bash
# rdb 同步和异步持久化 （阻塞和不阻塞）
save
bgsave
# 晴空当前和所有数据库key，慎用
flushdb
flushall
```

- **服务器信息**

```bash
# 提供服务器的信息和统计数据
info
# 慢日志
slowlog
```

