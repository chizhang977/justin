---
icon: docker
---
# 7_Docker 安装常见软件集合

# Docker 安装常见软件集合

## MYSQL

```bash
docker run -p 3307:3306 --name mysql-master \
-v /justin/mysql-master/log:/var/log/mysql  \
-v /justin/mysql-master/data:/var/lib/mysql \
-v /justin/mysql-master/conf:/etc/mysql			\
-e MYSQL_ROOT_PASSWORD=linux -d mysql:5.7
```

```bash
#新建 my.cnf，解决不能插入中文
[client]
default_character_set=utf8
[mysqld]
collation_server=utf8_general_ci
character_set_server=utf8
```

```bash
#重启 mysql
dokcer restart mysql
```

## Redis

```bash
docker run -p 6379:6379 --name myredis \
--privileged=true \
-v /root/app/redis/redis.conf:/etc/redis/redis.conf \
-v /root/app/redis/data:/data -d  \
redis:6.2.6 redis-server /etc/redis/redis.conf
```

在/root/app/redis/下复制一个redis.conf，修改配置

```bash
requirepass xxx
bind 127.0.0.1 注释 后redis可以外地连接
daemonize no#将daemonize yes注释起来或者 daemonize no设置，因为该配置和docker #run中-d参数冲突，会导致容器一直启动失败
```

**连接Redis并认证**： 当Redis服务器要求密码认证时，任何尝试连接到它的客户端都必须先进行身份验证。在命令行客户端 `redis-cli` 中，您可以这样做：

Bash

```bash
redis-cli -h host -p port -a your_password_here
```

如果已经连接但未验证身份，可以在客户端内执行 `AUTH` 命令：

Bash

```bash
1127.0.0.1:6379> AUTH your_password_here
```

成功验证后，您将收到 `OK` 响应，然后可以继续执行其他Redis命令。

## Nginx安装

- 下载Nginx`1.22`的docker镜像：

```bash
docker pull nginx:1.22
```

- 先运行一次容器（为了拷贝配置文件）：

```bash
docker run -p 80:80 --name nginx \
-v /Volumes/MacData/Dokcer/mydata/nginx/html:/usr/share/nginx/html \
-v /Volumes/MacData/Dokcer/mydata/nginx/logs:/var/log/nginx  \
-d nginx:1.22
```

- 将容器内的配置文件拷贝到指定目录：

```bash
docker container cp nginx:/etc/nginx /mydata/nginx/
```

- 修改文件名称：

```bash
mv nginx conf
```

- 终止并删除容器：

```bash
docker stop nginx
docker rm nginx
```

- 使用如下命令启动Nginx服务：

```bash
docker run -p 80:80 --name nginx \
-v /Volumes/MacData/Dokcer/mydata/nginx/html:/usr/share/nginx/html \
-v /Volumes/MacData/Dokcer/mydata/nginx/logs:/var/log/nginx  \
-v /Volumes/MacData/Dokcer/mydata/nginx/conf:/etc/nginx \
-d nginx:1.22
```

## RabbitMQ安装

- 下载rabbitmq`3.9-management`的docker镜像：

```bash
docker pull rabbitmq:3.9-management
```

- 使用如下命令启动RabbitMQ服务：

```bash
docker run -p 5672:5672 -p 15672:15672 --name rabbitmq \
-v /Volumes/MacData/Docker/mydata/rabbitmq/data:/var/lib/rabbitmq \
-d rabbitmq:3.9-management
```

- 开启防火墙：

```bash
firewall-cmd --zone=public --add-port=15672/tcp --permanent
firewall-cmd --reload
```

- 访问地址查看是否安装成功：http://192.168.10.122:15672

## Elasticsearch安装

- 下载Elasticsearch`7.17.3`的docker镜像：

```bash
docker pull elasticsearch:7.17.3
```

- 修改虚拟内存区域大小，否则会因为过小而无法启动:

```bash
sysctl -w vm.max_map_count=262144
```

- 使用如下命令启动Elasticsearch服务，内存小的服务器可以通过`ES_JAVA_OPTS`来设置占用内存大小：

```bash
docker run -p 9200:9200 -p 9300:9300 --name elasticsearch \
-e "discovery.type=single-node" \
-e "cluster.name=elasticsearch" \
-e "ES_JAVA_OPTS=-Xms512m -Xmx1024m" \
-v /Volumes/MacData/Dokcer/mydata/elasticsearch/plugins:/usr/share/elasticsearch/plugins \
-v /Volumes/MacData/Dokcer/mydata/elasticsearch/data:/usr/share/elasticsearch/data \
-d elasticsearch:7.17.3
```

- 启动时会发现`/usr/share/elasticsearch/data`目录没有访问权限，只需要修改`/mydata/elasticsearch/data`目录的权限，再重新启动即可；

```bash
chmod 777 /mydata/elasticsearch/data/
```

- 安装中文分词器IKAnalyzer，注意下载与Elasticsearch对应的版本，下载地址：https://github.com/medcl/elasticsearch-analysis-ik/releases

- 下载完成后解压到Elasticsearch的`/mydata/elasticsearch/plugins`目录下；

![img](https://www.macrozheng.com/assets/mall_linux_deploy_new_03-d123512a.png)

- 重新启动服务：

```bash
docker restart elasticsearch
```

- 开启防火墙：

```bash
firewall-cmd --zone=public --add-port=9200/tcp --permanent
firewall-cmd --reload
```

- 访问会返回版本信息：http://192.168.3.101:9200

```json
{
  "name": "708f1d885c16",
  "cluster_name": "elasticsearch",
  "cluster_uuid": "mza51wT-QvaZ5R0NmE183g",
  "version": {
    "number": "7.17.3",
    "build_flavor": "default",
    "build_type": "docker",
    "build_hash": "5ad023604c8d7416c9eb6c0eadb62b14e766caff",
    "build_date": "2022-04-19T08:11:19.070913226Z",
    "build_snapshot": false,
    "lucene_version": "8.11.1",
    "minimum_wire_compatibility_version": "6.8.0",
    "minimum_index_compatibility_version": "6.0.0-beta1"
  },
  "tagline": "You Know, for Search"
}
```

## Logstash安装

- 下载Logstash`7.17.3`的docker镜像：

```bash
docker pull logstash:7.17.3
```

- 修改Logstash的配置文件`logstash.conf`中`output`节点下的Elasticsearch连接地址为`es:9200`，配置文件地址：https://github.com/macrozheng/mall/blob/master/document/elk/logstash.conf

```text
output {
  elasticsearch {
    hosts => "es:9200"
    index => "mall-%{type}-%{+YYYY.MM.dd}"
  }
}
```

- 创建`/mydata/logstash`目录，并将Logstash的配置文件`logstash.conf`拷贝到该目录；

```bash
mkdir /mydata/logstash
```

- 使用如下命令启动Logstash服务；

```bash
docker run --name logstash -p 4560:4560 -p 4561:4561 -p 4562:4562 -p 4563:4563 \
--link elasticsearch:es \
-v /Volumes/MacData/Dokcer/mydata/logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
-d logstash:7.17.3
```

- 进入容器内部，安装`json_lines`插件。

```bash
logstash-plugin install logstash-codec-json_lines
```

## Kibana安装

- 下载Kibana`7.17.3`的docker镜像：

```bash
docker pull kibana:7.17.3
```

- 使用如下命令启动Kibana服务：

```bash
docker run --name kibana -p 5601:5601 \
--link elasticsearch:es \
-e "elasticsearch.hosts=http://es:9200" \
-d kibana:7.17.3
```

- 开启防火墙：

```bash
firewall-cmd --zone=public --add-port=5601/tcp --permanent
firewall-cmd --reload
```

- 访问地址进行测试：http://192.168.10.122:5601

## MongoDB安装

- 下载MongoDB`4`的docker镜像：

```bash
docker pull mongo:4
```

- 使用docker命令启动：

```bash
docker run -p 27017:27017 --name mongo \
-v /Volumes/MacData/Dokcer/mydata/mongo/db:/data/db \
-d mongo:4
```

## [MinIO安装](https://www.macrozheng.com/mall/deploy/mall_deploy_docker.html#minio安装)
- 下载MinIO的Docker镜像；

```bash
docker pull minio/minio
```

- 下载完成后使用如下命令运行MinIO服务，注意使用`--console-address`指定MinIO Console的运行端口（否则会随机端口运行）：

```bash
docker run -p 9090:9000 -p 9001:9001 --name minio \
-v /Volumes/MacData/Dokcer/mydata/minio/data:/data \
-e MINIO_ROOT_USER=minioadmin \
-e MINIO_ROOT_PASSWORD=minioadmin \
-d minio/minio server /data --console-address ":9001"
```

- 运行成功后就可访问MinIO Console的管理界面了，输入账号密码`minioadmin:minioadmin`即可登录，访问地址：http://192.168.10.122:9090

