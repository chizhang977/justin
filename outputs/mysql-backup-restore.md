---
title: MySQL 备份恢复
---

# MySQL 备份恢复

> 本文由 PDF《MySQL备份恢复.pdf》整理为 Markdown，内容覆盖 MySQL 5.7 安装、主备复制、mysqldump 全备恢复、binlog 增量恢复以及 xtrabackup 物理备份恢复。

## MySQL 安装

### 环境介绍

| 操作系统 | MySQL 版本 |
| --- | --- |
| CentOS 7.9 x64 | 5.7.36 |

要求：服务器可访问公网。
### 环境初始化

初始化操作主要包括：

- 关闭 Selinux 和 Firewalld。
- 设置默认文件句柄。
- 配置时间同步。
- 更换 yum 仓库文件。

#### 关闭Selinux 和 Firewalld

```bash
root@localhost(192.168.199.107)~>sed -i 's@SELINUX=enforcing@SELINUX=disabled@g' /etc/selinux/config
```

#### 设置文件句柄

```bash
root@localhost(192.168.199.107)~>cat << EOF >> /etc/security/limits.conf
* soft nproc 65535
* hard nproc 65535
* soft nofile 65535
* hard nofile 65535
EOF
```

#### 时间同步

```bash
root@localhost(192.168.199.107)~>yum install -y ntpdate
root@localhost(192.168.199.107)~>ntpdate ntp1.aliyun.com
#设置每天4点同步一次
root@localhost(192.168.199.107)~>crontab -e
0 4 * * * /usr/sbin/ntpdate -s ntp1.aliyun.com
```

#### 更换yum仓库文件

```bash
root@localhost(192.168.199.107)/root> mkdir -pv /etc/yum.repos.d/bak
mkdir: created directory '/etc/yum.repos.d/bak'
root@localhost(192.168.199.107)/root> mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/bak/
root@localhost(192.168.199.107)/root> curl http://mirrors.aliyun.com/repo/Centos-7.repo -o /etc/yum.repos.d/Centos-7.repo
root@localhost(192.168.199.107)/root> curl http://mirrors.aliyun.com/repo/epel-7.repo -o /etc/yum.repos.d/epel-7.repo
root@localhost(192.168.199.107)/root> sed -i '/aliyuncs/d' /etc/yum.repos.d/Centos-7.repo
root@localhost(192.168.199.107)/root> yum clean all
root@localhost(192.168.199.107)/root> yum repolist all
```

### 安装MySQL

#### 下载安装包

国内下载地址：http://mirrors.sohu.com/mysql/MySQL-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar
官网下载地址：https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar
#### 安装程序包

```bash
#卸载mariadb-libs
root@localhost(192.168.199.107)/root> rpm -qa | egrep mariadb
```

mariadb-libs-5.5.68-1.el7.x86_64
```bash
root@localhost(192.168.199.107)/root> yum remove -y mariadb-libs
#安装MySQL程序包
root@localhost(192.168.199.107)/root> mkdir -pv mysql
mkdir: created directory 'mysql'
root@localhost(192.168.199.107)/root> tar xf mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar -C mysql/
```bash
root@localhost(192.168.199.107)/root> cd mysql/
root@localhost(192.168.199.107)/root/mysql> yum localinstall *.rpm -y


```

#### 启动服务

```bash
root@localhost(192.168.199.107)/root> systemctl enable mysqld ; systemctl start mysqld
root@localhost(192.168.199.107)/root> netstat -ntplu | egrep 3306
tcp6 0 0 :::3306 :::* LISTEN
```

3689/mysqld
#### 登录MySQL

MySQL启动后，初始化密码存放在 日志文件中。
```bash
root@localhost(192.168.199.107)/root> egrep -ri password /var/log/mysqld.log
```

2023-07-06T02:48:50.170275Z 1 [Note] A temporary password is generated for root@localhost:
bsI,9pJ)JQ1o
```bash
#登录mysql
root@localhost(192.168.199.107)/root> mysql -uroot -p
Enter password: #密码为：bsI,9pJ)JQ1o
Welcome to the MySQL monitor. Commands end with ; or \g.
```

Your MySQL connection id is 2
```bash
Server version: 5.7.36
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql>
```

#### 修改初始密码

MySQL登录后第一件事是修改初始密码，否则任何操作都受限。
```bash
#提示需要使用 alter user 修改密码再进行操作
mysql> show databases;
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before
```

executing this statement.
```bash
#修改密码，密码要求大小写+数字
mysql> alter user user() identified by 'Root@123';
Query OK, 0 rows affected (0.00 sec)
#修改后就可直接进行操作
mysql> show databases;


+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| sys |
+--------------------+
4 rows in set (0.00 sec)
```

使用技巧：如果需要修改为任意简单的密码，可进行如下操作
```bash
#密码过于简单会提示不安全不符合当前要求策略
mysql> alter user user() identified by '123123';
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
#修改策略
mysql> set global validate_password_policy=0;
Query OK, 0 rows affected (0.00 sec)
mysql> set global validate_password_length=1;
Query OK, 0 rows affected (0.00 sec)
#再次使用简单密码进行修改，修改成功
mysql> alter user user() identified by '123123';
Query OK, 0 rows affected (0.00 sec)
```

### 一键安装脚本

```bash
#!/bin/bash
# dest: MySQL自动安装脚本
# 检查系统版本
function Check_linux_system(){
linux_version=`cat /etc/redhat-release`
if [[ ${linux_version} =~ "CentOS" ]];then
echo -e "\033[32;32m 系统为 ${linux_version} \033[0m \n"
else
echo -e "\033[32;32m 系统不是CentOS,该脚本只支持CentOS环境\033[0m \n"
exit 1
fi
```

}
```bash
# 关闭selinux 和 firwalld
function Disable_ip_se() {


systemctl stop firewalld && systemctl disable firewalld
res=$(getenforce)
if [ $res != 'Disabled' ];then
```

setenforce 0 && sed -i "s/^SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config
```bash
else
echo -e "\033[32;32m Selinux 已关闭. \033[0m \n" && return
fi
```

}
```bash
# 配置文件句柄及yum
function Ulimit_yum(){
cat << EOF >> /etc/security/limits.conf
* soft nproc 65535
* hard nproc 65535
* soft nofile 65535
* hard nofile 65535
EOF
```

ulimit -SHn 65535
```bash
mkdir -pv /etc/yum.repos.d/bak && mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/bak/
curl http://mirrors.aliyun.com/repo/Centos-7.repo -o /etc/yum.repos.d/Centos-7.repo
curl http://mirrors.aliyun.com/repo/Centos-7.repo -o /etc/yum.repos.d/Centos-7.repo
sed -i '/aliyuncs/d' /etc/yum.repos.d/Centos-7.repo
yum clean all && yum repolist all
yum install -y ntpdate wget &> /dev/null
ntpdate -s ntp1.aliyun.com &> /dev/null
```

}
```bash
function Install_mysql(){
wget https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar
mkdir -p mysql && tar xf mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar -C mysql
yum localinstall mysql/*.rpm -y
systemctl enable mysqld && systemctl start mysqld
netstat -ntplu | egrep -q 3306
MYSQL_PWD=$(egrep -ri password /var/log/mysqld.log | awk '{print $NF}')
if [ $? -eq 0 ]; then
echo -e "\033[32;32m MySQL安装完成且启动成功, root用户密码: $MYSQL_PWD \033[0m \n"
else
echo -e "\033[31;32m MySQL启动失败，请检查. \033[0m \n"
exit 1
fi
```

}
Check_linux_system && \
Disable_ip_se && \
Ulimit_yum && \
Install_mysql
## MySQL 主备复制

### 主备复制说明

MySQL 最为常见的备份机制就是主从复制，基本原则如下：
1. 每个 slave 只有对应的一个 master
2. 每个slave只能有一个唯一的服务器ID
3. 每个master可以有多个slave
基于上述的基本原则，MySQL主备复制的形式包括有：
1. 一主一备
2. 一主多备
3. 双主复制：双主复制，也就是可以互做主从复制，每个 master 既是 master，又是另外一台服务器的
salve。这样任何一方所做的变更，都会通过复制应用到另外一方的数据库中。
### 主备复制原理

主备复制的工作原理就是slave从库会从master主库读取binlog来进行数据同步。
上图说明，MySQL主从复制过程分成四步：
1. 从库生成两个线程，一个 I/O 线程，一个 SQL 线程
2. 当从库连接主库时，主库会生成一个 二进制转储(binlog dump) 线程，用来给从库 I/O 线程传 binlog
3. I/O 线程去请求主库的 binlog，并将得到的 binlog 日志写到 relay log(中继日志) 文件中。（在读取
binlog 的内容的操作中，会对主库的 binlog 加锁，当binlog读取完成并发送给从库后解锁。）

4. 从SQL 线程会读取 relay log 文件中的日志，并解析成具体操作，来实现主从的操作一致，最终实现
主从的数据一致。
复制过程有一个很重要的限制，就是复制在从库上是串行化的，也就是说主库上的并行更新操作不能在 从
库上并行操作。
### 主备配置示例

操作系统 MySQL版本 主机IP 角色
CentOS 7.9 5.7.36 192.168.199.106 master
CentOS 7.9 5.7.36 192.168.199.107 slave
MySQL安装上文已经阐述，两台节点都需要安装MySQL。
生产场景：大多数情况下，MySQL处于运行状态并且存储业务数据。如果新增备
节点，前提是不能影响线上业务使用，也就是说不能重启主节点MySQL服务。
#### master 配置

1. 修改配置文件
```bash
root@localhost(192.168.199.106)~>vim /etc/my.cnf
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html
[mysqld]
# 设置3306端口
port=3306
# server-id 服务器唯一标识
server_id=1
# log_bin 启动MySQL二进制日志，即数据同步语句，从数据库会一条一条的执行这些语句。
log-bin=master-bin
# 其中需要注意的是，binlog_do_db和binlog_ignore_db为互斥选项，一般只需要一个即可。
# binlog每个日志文件大小
max_binlog_size=100M


# 设置二进制日志使用内存大小（事务）
binlog_cache_size=1M
# 设置使用的二进制日志格式（mixed,statement,row）
binlog_format=mixed
# 二进制日志过期清理时间。默认值为0，表示不自动清理。
expire_logs_days=7
# 设置mysql数据库的数据的存放目录
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
#查询日志,对所有执行语句进行记录
general_log=on
general_log_file=/var/log/mysql_general.log
#开启慢查询
slow_query_log = on
#慢查询中记录没有使用索引的query
log-queries-not-using-indexes=on
#返回较慢的日志mysql5.6版本以上，取消了参数log-slow-queries，更改为slow-query-log-file
slow-query-log-file= /var/log/mysql_slowquery.log
#慢查询时间,这里为2秒,超过2秒会被记录
long_query_time=2
# 跳过主从复制中遇到的所有错误或指定类型的错误，避免slave端复制中断。
# 如：1062错误是指一些主键重复，1032错误是因为主从数据库数据不一致
slave_skip_errors=1062
#忽视大小写
lower-case-table-names=1
#不解析主机名,该项会引发本地无法连接到MySQL
#skip-name-resolve
# 允许最大连接数
max_connections=1000
# 允许连接失败的次数。这是为了防止有人从该主机试图攻击数据库系统
max_connect_errors=10
# 服务端使用的字符集默认为UTF8


character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
# 字符集
character-set-server=utf8mb4
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4
[client]
# 设置mysql客户端连接服务端时默认使用的端口
port=3306
default-character-set=utf8mb4
```

2. 修改完成，重启MySQL
```bash
root@localhost(192.168.199.106)~>systemctl restart mysqld
```

3. 修改 root 密码
```bash
root@localhost(192.168.199.106)/root> egrep -ri password /var/log/mysqld.log
```

2023-07-06T05:56:38.198238Z 1 [Note] A temporary password is generated for root@localhost:
*YPUcdh2JQ5!
```bash
root@localhost(192.168.199.106)/root> mysql -uroot -p
Enter password:
mysql> set global validate_password_policy=0;
Query OK, 0 rows affected (0.00 sec)
mysql> set global validate_password_length=1;
Query OK, 0 rows affected (0.00 sec)
mysql> alter user user() identified by '123123';
Query OK, 0 rows affected (0.01 sec)
```

4. 创建测试数据
```bash
mysql> create database school;
Query OK, 1 row affected (0.01 sec)
mysql> create table school.user_info(id int,name varchar(32));
Query OK, 0 rows affected (0.03 sec)
mysql> INSERT INTO school.user_info
-> VALUES
-> (1, '1'),(2, '2'),(3, '3'),(4, '4'),(5, '5'),(6, '6'),(7, '7'),(8, '8'),(9, '9'),
```

(10, '10');
```bash
Query OK, 10 rows affected (0.05 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;


+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

5. 进行master库的全备
```bash
root@localhost(192.168.199.106)/root> mysqldump -uroot -p --routines --single_transaction
--master-data=2 --all-databases > backup-all-databses.sql
Enter password:
root@localhost(192.168.199.106)/root> ll backup-all-databses.sql
856K -rw-r--r-- 1 root root 856K Jul 6 14:27 backup-all-databses.sql
#将全备拷贝到slave节点，待会需要导入到 slave 库
root@localhost(192.168.199.106)/root> scp backup-all-databses.sql 192.168.199.107:/root/
root@192.168.199.107's password:
```

参数说明：
--routines 导出存储过程和函数
--single_transaction 导出开始时设置事务隔离状态，并使用一致性快照事务，然后unlock tables;
而 lock-tables是锁住一张表不能写操作，直到dump完毕。
```bash
--master-data=2 默认等于1，将dump起始（change master to） binlog点和pos值写到结果中，等于
```

2是将change master to写到结果中并注释
6. 创建主备同步帐号
```bash
root@localhost(192.168.199.106)/root> mysql -uroot -p
Enter password:
mysql> GRANT REPLICATION SLAVE,REPLICATION CLIENT ON *.* to 'repl'@'%' identified by
```

'repl';
```bash
Query OK, 0 rows affected, 1 warning (0.01 sec)
mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

7. 继续在主库中添加数据，该数据是全备后新增的数据，模拟生产库实时新增数据
```bash
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
mysql> INSERT INTO school.user_info
-> VALUES
-> (11, '11'),(12, '12'),(13, '13'),(14, '14'),(15, '15'),(16, '16'),(17, '17'),(18,
```

'18'),(19, '19'),(20, '20');

```bash
Query OK, 10 rows affected (0.01 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 20 |
+----------+
1 row in set (0.00 sec)
```

#### slave配置

1. 修改配置文件
```bash
root@localhost(192.168.199.107)/root> vim /etc/my.cnf
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html
[mysqld]
#
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
server-id=2
relay-log=slave-relay-bin
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
# 设置二进制日志使用内存大小（事务）
binlog_cache_size=1M
# 设置使用的二进制日志格式（mixed,statement,row）
binlog_format=mixed
# 二进制日志过期清理时间。默认值为0，表示不自动清理。
expire_logs_days=7
# 跳过主从复制中遇到的所有错误或指定类型的错误，避免slave端复制中断。
# 如：1062错误是指一些主键重复，1032错误是因为主从数据库数据不一致
slave_skip_errors=1062
# relay_log配置中继日志
relay_log=mall-mysql-relay-bin
# log_slave_updates表示slave将复制事件写进自己的二进制日志
log_slave_updates=1
# slave设置为只读（具有super权限的用户除外）
read_only=1
```

2. 修改完成，重启MySQL
```bash
root@localhost(192.168.199.107)/root> systemctl restart mysqld


```

3. 修改 root 密码
```bash
root@localhost(192.168.199.107)/root> systemctl restart mysqld
root@localhost(192.168.199.107)/root> egrep -ri password /var/log/mysqld.log
```

2023-07-06T06:22:22.285976Z 1 [Note] A temporary password is generated for root@localhost:
dP4qob(K(piB
```bash
root@localhost(192.168.199.107)/root> mysql -uroot -p
Enter password:
mysql> set global validate_password_policy=0;
Query OK, 0 rows affected (0.00 sec)
mysql> set global validate_password_length=1;
Query OK, 0 rows affected (0.00 sec)
mysql> alter user user() identified by '123123';
Query OK, 0 rows affected (0.01 sec)
```

4. 导入master节点的全备
```bash
root@localhost(192.168.199.107)/root> mysql -uroot -p123123 < backup-all-databses.sql
mysql: [Warning] Using a password on the command line interface can be insecure.
```

5. 查看全备导入后的数据
```bash
root@localhost(192.168.199.107)/root> mysql -uroot -p123123
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| school |
| sys |
+--------------------+
5 rows in set (0.00 sec)
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

通过以上查询得知，数据量和目前master节点的数据量是不匹配的。
6. 通过全备文件查看 binlog 日志和 pos 值，这两可以明确一个时间点

-- MySQL dump 10.13 Distrib 5.7.36, for Linux (x86_64)
--- Host: localhost Database:
-- ------------------------------------------------------- Server version 5.7.36-log
```bash
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
```

--- Position to start replication or point-in-time recovery from
--- CHANGE MASTER TO MASTER_LOG_FILE='master-bin.000002', MASTER_LOG_POS=1142; # 通过该注
释就可以知道，全备结束的点是在: MASTER_LOG_FILE='master-bin.000002', MASTER_LOG_POS=1142
--- Current Database: `mysql`
-CREATE DATABASE /*!32312 IF NOT EXISTS*/ `mysql` /*!40100 DEFAULT CHARACTER SET utf8mb4
*/;
```bash
...
```

接下来，在 slave 节点开启同步master库时，就从这个时间点开始。
7. 备库设置日志点同步，并启动
```bash
root@localhost(192.168.199.107)/root> mysql -uroot -p123123
mysql> change master to
master_host='192.168.199.106',master_user='repl',master_password='repl',master_log_file='master-bin.000002',master_log_pos=1142;
```bash
Query OK, 0 rows affected, 2 warnings (0.03 sec)
mysql> start slave;
Query OK, 0 rows affected (0.00 sec)
mysql> show slave status\G;
*************************** 1. row ***************************
Slave_IO_State: Waiting for master to send event
Master_Host: 192.168.199.106
Master_User: repl
Master_Port: 3306
Connect_Retry: 60
Master_Log_File: master-bin.000002
Read_Master_Log_Pos: 1987


Relay_Log_File: mall-mysql-relay-bin.000002
Relay_Log_Pos: 1166
Relay_Master_Log_File: master-bin.000002
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
...
...
```

IO和SQL线程均为：Yes 状态，说明主从配置成功。
8. 再次查看数据量是否与主库同步
```bash
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 20 |
+----------+
1 row in set (0.00 sec)
```

数据同步完成，master 和 slave 数据一致。
9. 同步测试
通过在master 上删除10条数据进行测试，查看 slave 是否同步
master操作：
```bash
mysql> delete from school.user_info
-> where id in
-> (11,12,13,14,15,16,17,18,19,20);
Query OK, 10 rows affected (0.01 sec)
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

slave查看数据量是否同步

```bash
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.01 sec)
```

确认无误，master 和 slave 完全同步。
## MySQL 全备及恢复

在Linux 环境中，全备可以采用两种方式：
mysqldump
xtrabackup
### mysqldump 简介

优点
mysqldump是MySQL官方提供的备份工具，易于使用和部署。
它可以生成SQL脚本文件，包括表结构和数据，方便进行人工恢复或导入到其他数据库中。
支持备份指定数据库、表或特定的数据查询结果。
可以通过参数设置备份的级别（完整备份或增量备份）。
缺点
在备份大型数据库时，mysqldump的性能可能较低，备份过程较慢。
备份期间，可能会对生产数据库的性能产生一定的影响。
对于大型数据库的恢复过程，可能需要较长的时间。
具体命令
完整备份： mysqldump -u username -p password --all-databases > backup.sql
备份指定数据库： mysqldump -u username -p password --databases database_name > backup.sql
指定表: mysqldump -u username -p password database_name table_name > backup.sql

### mysqldump 全备演示

其实在进行主备配置时，已经使用到了 mysqldump 进行全备
```bash
root@localhost(192.168.199.106)/root> mysqldump -uroot -p --routines --single_transaction
--master-data=2 --all-databases > backup-all-databses.sql
Enter password:
```

### mysqldump 恢复演示

通过删除数据库来进行数据的恢复演示
```bash
root@localhost(192.168.199.106)/root> mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor. Commands end with ; or \g.
```

Your MySQL connection id is 9
```bash
Server version: 5.7.36-log MySQL Community Server (GPL)
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| school |
| sys |
+--------------------+
5 rows in set (0.00 sec)
mysql> drop database school;
Query OK, 1 row affected (0.01 sec)
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| sys |
+--------------------+


4 rows in set (0.00 sec)
```

通过 drop database school 删除了数据库，接下来通过全备进行恢复操作。
```bash
#全备恢复
root@localhost(192.168.199.106)/root> mysql -uroot -p123123 < backup-all-databses.sql
mysql: [Warning] Using a password on the command line interface can be insecure.
root@localhost(192.168.199.106)/root> mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| school |
| sys |
+--------------------+
5 rows in set (0.00 sec)
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

恢复成功。
### mysqldump 备份脚本

```bash
root@localhost(192.168.199.106)/root> mkdir -pv /mnt/scripts
mkdir: created directory '/mnt/scripts'
root@localhost(192.168.199.106)/root> cd /mnt/scripts
root@localhost(192.168.199.106)/mnt/scripts> vim mysql_fullbak.sh
#!/bin/bash
#dest: MySQL全备，仅保留最近4次的全备
PASSWD=123123
BAKDIR=/data/backup/mysql_full_backup
PORT=$(netstat -lanp | grep LISTEN | grep "mysqld"|awk -F ":" 'NR==1{print $4}')
TIME=$(date +"%Y%m%d_%H%M%S")
LOG_DIR=$BAKDIR/logs
if [ ! -d $LOG_DIR ]; then
mkdir -p $LOG_DIR
```

elif [ ! -d $BAKDIR ];then

```bash
mkdir -p $BAKDIR
fi
if ! ps -ef | grep -v "grep"|grep -q "mysqld ";then
echo "$TIME ERROR 未检测到mysql进程" >> $LOG_DIR/$TIME.log
exit 1
fi
mysqldump -uroot -p$PASSWD --routines --single_transaction \
--master-data=2 --all-databases | gzip > $BAKDIR/backup-all-databses-$TIME.tar.gz
if [ $? -eq 0 ]; then
echo "$TIME INFO $BAKDIR/backup-all-databses-$TIME.tar.gz 备份成功." >>
```

$LOG_DIR/$TIME.log
```bash
fi
COUNT=$(ls -lrt $BAKDIR/*.tar.gz |wc -l)
if [ $COUNT -gt 4 ]; then
FILE=$(ls -lrt $BAKDIR/*.tar.gz |awk 'NR==1{print $NF}')
mkdir -p /tmp/mysql_bak && mv $FILE /tmp/mysql_bak
echo "$TIME INFO $FILE move /tmp/mysql_bak" &> $LOG_DIR/$TIME.log
fi
root@localhost(192.168.199.106)/mnt/scripts>chmod +x mysql_fullbak.sh
```

添加到计划任务，每周天5点执行
```bash
root@localhost(192.168.199.106)~>crontab -e
0 4 * * 7 /mnt/scripts/mysql_fullbak.sh
```

## MySQL 增量备份及恢复

MySQL 的增备都是基于全量备份基础之上的增量备份。也就是说，首先需要定时做全备而后才会产生增
倍。
MySQL的增量有两种方式：
通过二进制备份进行增备
通过专用工具xtrabackup 进行增倍
### 二进制文件增量备份及恢复

如果要做增量备份，MySQL必须开启 log-bin 配置项。二进制日志保存了所有更新数据库的操作。二进制
日志在启动 MySQL 服务器后开始记 录，并在文件达到二进制日志所设置的最大值或者接收到 flushlogs
命令后重新创建新的日志文件，生成二进制文件序列，并及时把这些日志保存到安全的存储位置，即可完
成一个时间段的增量备份。
使用 max_binlog_size 配置项可以设置二进制日志文件的最大值，达到最大值，它就会自动创建新的二进
制文件。要进行 MySQL 的增量备份，首先要开启二进制日志功能。开启 MySQL 的二进制日志功能的实
现方法有很多种，最常用的是在 MySQL 配置文件的 mysqld 项下加入"log-bin=/ 文件路径/文件名"前缀，
如 log-bin=/usr/local/mysql/mysql-bin，然后重启 MySQL 服务就可以在指定路径下查看二进制日志文件
了。默认情况下，二进制日志文件的扩展名是一个六位的数字，如 mysql-bin.000001。
查看是否开启binlog
```bash
root@localhost(192.168.199.106)~>mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> show variables like "%log_bin%";
+---------------------------------+---------------------------------+
| Variable_name | Value |
+---------------------------------+---------------------------------+
| log_bin | ON |
| log_bin_basename | /var/lib/mysql/master-bin |
| log_bin_index | /var/lib/mysql/master-bin.index |
| log_bin_trust_function_creators | OFF |
| log_bin_use_v1_row_events | OFF |
| sql_log_bin | ON |
+---------------------------------+---------------------------------+
6 rows in set (0.00 sec)
```

查看当前正在使用的 log_bin 日志文件名
```bash
mysql> show master status \G;
*************************** 1. row ***************************
```

File: master-bin.000002 #log-bin文件名
Position: 888355
Binlog_Do_DB:
Binlog_Ignore_DB:
Executed_Gtid_Set:
```bash
1 row in set (0.00 sec)
```

ERROR:
No query specified

二进制日志增备演示
1. 创建测试库和数据
```bash
mysql> drop database school;
Query OK, 1 row affected (0.02 sec)
mysql> create database school;
Query OK, 1 row affected (0.00 sec)
mysql> create table school.user_info(id int,name varchar(32));
Query OK, 0 rows affected (0.02 sec)
mysql> INSERT INTO school.user_info
-> VALUES
-> (1, '1'),(2, '2'),(3, '3'),(4, '4'),(5, '5'),(6, '6'),(7, '7'),(8, '8'),(9, '9'),
```

(10, '10');
```bash
Query OK, 10 rows affected (0.00 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

2. 进行全备
增量备份一定是建立在全量备份基础之上的操作。所以可以指定，全量备份一周做一次，增量可每天执
行。
全量备份操作：
```bash
mkdir -pv /data/backup/mysqlbinlog/
mysqldump -uroot -p123123 --single-transaction --master-data=2 --set-gtid-purged=OFF -hex-blob --opt --routines --triggers --flush-logs --all-databases >
/data/backup/mysqlbinlog/full_backup.sql
```

3. 新增数据
模拟生产环境实时新增数据
```bash
root@localhost(192.168.199.106)~>mysql -uroot -p123123
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.


mysql> INSERT INTO school.user_info
-> VALUES
-> (11, '11'),(12, '12'),(13, '13'),(14, '14'),(15, '15'),(16, '16'),(17, '17'),(18,
```

'18'),(19, '19'),(20, '20');
```bash
Query OK, 10 rows affected (0.00 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 20 |
+----------+
1 row in set (0.00 sec)
```

4. 备份二进制文件
注意：在进行二进制文件备份时，需要先对其进行刷新
```bash
root@localhost(192.168.199.106)~>mysqladmin -uroot -p123123 flush-logs
```

mysqladmin: [Warning] Using a password on the command line interface can be insecure.
拷贝 二进制文件进行备份
```bash
root@localhost(192.168.199.106)~>mkdir -pv /data/backup/mysqlbinlog/2023-07-06
mkdir: created directory '/data/backup/mysqlbinlog/2023-07-06'
root@localhost(192.168.199.106)~>ll /var/lib/mysql/master-bin.00000*
4.0K -rw-r----- 1 mysql mysql 154 Jul 6 16:30 /var/lib/mysql/master-bin.000004
4.0K -rw-r----- 1 mysql mysql 593 Jul 6 16:30 /var/lib/mysql/master-bin.000003
872K -rw-r----- 1 mysql mysql 869K Jul 6 16:27 /var/lib/mysql/master-bin.000002
4.0K -rw-r----- 1 mysql mysql 177 Jul 6 14:25 /var/lib/mysql/master-bin.000001
root@localhost(192.168.199.106)~>cp -a /var/lib/mysql/master-bin.00000* /data/backup/mysqlbinlog/2023-07-06/
```

到此，二进制方式的增量备份已经完成。
二进制日志恢复演示
接下来演示对二进制增备进行恢复，这里直接模拟误删库进行恢复。

```bash
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 20 |
+----------+
1 row in set (0.00 sec)
```

删除前有20条数据，看恢复增备后的效果。
```bash
mysql> drop database school;
Query OK, 1 row affected (0.02 sec)
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| sys |
+--------------------+
4 rows in set (0.00 sec)
```

模拟删除库进行恢复。
1. 首先进行全备的恢复
```bash
root@localhost(192.168.199.106)~>mysql -uroot -p123123 < /data/backup/mysqlbinlog/full_backup.sql
mysql: [Warning] Using a password on the command line interface can be insecure.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

通过 全备恢复，只恢复了全备前的所有数据，全备后的数据需要用增备进行恢复。
2. 通过 binlog 恢复增备数据

首先，全备 full_backup.sql 文件记录了全备结束的位置点
-- MySQL dump 10.13 Distrib 5.7.36, for Linux (x86_64)
--- Host: localhost Database:
-- ------------------------------------------------------- Server version 5.7.36-log
```bash
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
```

--- Position to start replication or point-in-time recovery from
--- CHANGE MASTER TO MASTER_LOG_FILE='master-bin.000003', MASTER_LOG_POS=154; #这里就记
录了全备结束的位置点
知道了位置点，就可以使用 binlog 从这个位置点向后进行恢复就行。
```bash
root@localhost(192.168.199.106)~>mysqlbinlog --no-defaults --start-position=154 /data/backup/mysqlbinlog/2023-07-06/master-bin.000003 | mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
root@localhost(192.168.199.106)~>mysqlbinlog /data/backup/mysqlbinlog/2023-07-06/masterbin.000004 | mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
```

3. 查看数据进行验证
```bash
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| school |
| sys |
+--------------------+
5 rows in set (0.00 sec)
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+


| 20 |
+----------+
1 row in set (0.00 sec)
```

数据恢复完成。
二进制日志增备脚本
请配合上面的全量备份脚本一起使用。
```bash
root@localhost(192.168.199.106)~>cd /mnt/scripts/
root@localhost(192.168.199.106)/mnt/scripts>vim mysql_binlogbak.sh
#!/bin/bash
# dest: 二进制文件增量备份
PASSWD=123123
BAKDIR=/data/backup/mysqlbinlog/$(date +%F)
PORT=$(netstat -lanp | grep LISTEN | grep "mysqld"|awk -F ":" 'NR==1{print $4}')
TIME=$(date +"%Y%m%d_%H%M%S")
LOG_FILE=$BAKDIR/mysql_fullbak.log
BIN_FILE=/var/lib/mysql/master-bin.index
if [ ! -d $BAKDIR ]; then
mkdir -p $BAKDIR
fi
if ! ps -ef | grep -v "grep"|grep -q "mysqld ";then
echo "$TIME ERROR 未检测到mysql进程" >> $LOG_FILE
exit 1
fi
mysqladmin -uroot -p$PASSWD flush-logs
Counter=`wc -l $BIN_FILE |awk '{print $1}'`
NUM=0
```

for file in `cat $BIN_FILE`
do
```bash
base=`basename $file`
#basename用于截取mysql-bin.00000*文件名，去掉./mysql-bin.000005前面的./
NUM=`expr $NUM + 1`
if [ $NUM -eq $Counter ]
```

then
```bash
echo "$TIME INFO $base skip!" >> $LOG_FILE
else
dest=$BAKDIR/$base
```

if(test -e $dest)
```bash
#test -e用于检测目标文件是否存在，存在就写exist!到$LogFile去。
```

then
```bash
echo "$TIME INFO $base exist!" >> $LOG_FILE
else
```

cp /var/lib/mysql/$base $BAKDIR
```bash
echo "$TIME INFO $base copying" >> $LOG_FILE
fi
fi


```

done
```bash
#保留最近8份数据
COUNT=$(ls -ldtr /data/backup/mysqlbinlog/* | wc -l)
if [ $COUNT -gt 8 ]; then
MV_DIR=$(ls -dltr /data/backup/mysqlbinlog/* | awk 'NR==1{print $NF}')
mkdir -p /tmp/mysql_binlog_backup && mv $MV_DIR /tmp/mysql_binlog_backup
fi
```

添加到计划任务，周1 - 周6 每天 4点整执行
```bash
root@localhost(192.168.199.106)~>crontab -e
0 4 * * 1-6 /mnt/scripts/mysql_fullbak.sh
```

## xtrabackup 增量备份及恢复

### xtrabackup 介绍

Xtrabackup是一个对InnoDB做数据备份的工具，支持在线热备份（备份时不影响数据读写），是商业备份
工具InnoDB Hotbackup的一个很好的替代品。
简要说明：
Xtrabackup2.4有两个主要的工具：xtrabackup、innobackupex
1. xtrabackup只能备份InnoDB和XtraDB两种数据表，而不能备份MyISAM数据表
2. innobackupex则封装了xtrabackup，是一个脚本封装，所以能同时备份处理innodb和myisam，但在处
理myisam时需要加一个读锁（推荐）
### xtrabackup 常用工具说明

```bash
xtrabackup ：是用于热备 innodb ， xtradb 表中数据的工具，不能备份其他类型的表，也不能备份数
```

据表结构 ；
```bash
innobackupex ：是将 xtrabackup 进行封装的 perl 脚本，提供了备份 myisam 表的能力。
```

常用选项:
```bash
--defaults-file=：指定my.cnf配置文件路径，如/etc/my.cnf。该选项必须是第一个选项，它会
```

根据配置文件查找数据路径
```bash
--user=：执行备份操作的MySQL用户（非系统用户），该用户需要有MySQL的相关权限
--password=：MySQL用户的密码
```

--databases：指定要备份的数据库，多个数据库以空格隔开，如"db1 db2"，在指定某数据库时也
可以只指定其中的某张表（MySQL需要配置innodb_file_per_table = 1）
--incremental：增量备份
--incremental-basedir：指定增量备份所依赖的上一次备份
--use-memory：指定恢复数据时使用的内存大小
--port 指定端口
--apply-log 对备份进行预处理操作

一般情况下，在备份完成后，数据尚且不能用于恢复操作，因为备份的数据中可能会包含尚未提
交的事务或已经提交但尚未同步至数据文件中的事务。因此，此时数据文件仍处理不一致状态。"准
备"的主要作用正是通过回滚未提交的事务及同步已经提交的事务至数据文件也使得数据文件处于一致
性状态。
--redo-only 不回滚未提交事务。在xtrabackup8.0里是--apply-log-only
--copy-back 恢复备份目录
### xtrabackup 版本兼容性

Percona -xtraBackup 8.0 是 Percona XtraBackup 新 推 出 了 一 个 针 对 MySQL8.0 的 版 本 ， 主 要 是
MySQL8.0 在 Redo 和 数据库字典方面有了新的改进。
```bash
XtraBackup 2.4 继续支持 MySQL 5.6 和 5.7
```

1. xtrabackup 8.0 移除了innobackupex 命令；
2. 由于新的MySQL 重做日志和数据字典格式， 8.0 版本只支持 mysql8.0 和 percona8.0 ；
3. 早于mysql8.0 的版本需要使用 xtrabackup2.4 备份和恢复 .
### MySQLdump 和 xtrabackup 备份对比

Xtrabackup是由percona开源的免费数据库热备份软件，它能对InnoDB数据库和XtraDB存储引擎的数据库
非阻塞地备份（对于MyISAM的备份同样需要加表锁）；
mysqldump备份方式是采用的逻辑备份，其最大的缺陷是备份和恢复速度较慢，如果数据大于50G，
mysqldump备份就不太适合。 （说白了就是如果数据量很大就用xtrabackup来备份数据）
### xtrabackup 优点

1. 备份速度快，物理备份可靠；
2. 备份过程不会打断正在执行的事务（无需锁表）；
3. 能够基于压缩等功能节约磁盘空间和流量；
4. 自动备份校验；
5. 还原速度快；
6. 可以流传将备份传输到另外一台机器上；
7. 在不增加服务器负载的情况备份数据
### xtrabackup 备份原理

备份开始时首先会开启一个后台检测进程，实时检测 mysql redo 的变化，一旦发现有新的日志写入，立
刻将日志记入后台日志文件 xtrabackup_log 中，之后复制innodb的数据文件一系统表空间文件
ibdatax ，复制结束后，将执行 flush tables with readlock ,然后复制 .frm MYI MYD 等文
件，最后执行 unlock tables ,最终停止 xtrabackup_log 。

使用xtrabackup2.4备份mysql5.7.x， xtrabackup8.0备份mysql8.0.x
根据上文 Linux 系统安装 MySQL，查看MySQL版本：
```bash
mysql> select version();
+------------+
| version() |
+------------+
| 5.7.36-log |
+------------+
```

### 使用xtrabackup2.4备份mysql5.7.x

请确认MySQL 采用的是 InnoDB 存储引擎。
```bash
mysql> show engines;
+--------------------+---------+---------------------------------------------------------------+--------------+------+------------+
| Engine | Support | Comment
| Transactions | XA | Savepoints |
+--------------------+---------+---------------------------------------------------------------+--------------+------+------------+
| InnoDB | DEFAULT | Supports transactions, row-level locking, and foreign
```

keys | YES | YES | YES |
```bash
| MRG_MYISAM | YES | Collection of identical MyISAM tables
| NO | NO | NO |
| MEMORY | YES | Hash based, stored in memory, useful for temporary tables
| NO | NO | NO |
| BLACKHOLE | YES | /dev/null storage engine (anything you write to it
```

disappears) | NO | NO | NO |
```bash
| MyISAM | YES | MyISAM storage engine
| NO | NO | NO |
| CSV | YES | CSV storage engine
| NO | NO | NO |
| ARCHIVE | YES | Archive storage engine
| NO | NO | NO |
| PERFORMANCE_SCHEMA | YES | Performance Schema
| NO | NO | NO |
| FEDERATED | NO | Federated MySQL storage engine
| NULL | NULL | NULL |
+--------------------+---------+---------------------------------------------------------------+--------------+------+------------+
```

InnoDB 为默认存储引擎，没有问题。

### xtrabackup 下载及安装

本次安装的MySQL版本： 5.7.36 ，需要下载对应的 xtrabackup 版本： 2.4
下载链接：https://www.percona.com/downloads/XtraBackup/Percona-XtraBackup-2.4.4/binary/red
hat/7/x86_64/percona-xtrabackup-24-2.4.4-1.el7.x86_64.rpm ， 可通过浏览器下载上传到Linux
安装：
```bash
yum localinstall percona-xtrabackup-24-2.4.4-1.el7.x86_64.rpm -y
```

创建测试数据
为了展示全备的功能，模拟生产环境添加一些简单的数据。
```bash
#创建数据库
create database school;
#创建表
create table school.user_info(id int,name varchar(32));
#插入表数据
INSERT INTO school.user_info
```

VALUES
(1, '1'),(2, '2'),(3, '3'),(4, '4'),(5, '5'),(6, '6'),(7, '7'),(8, '8'),(9, '9'),(10,
'10');
```bash
#查看数据
mysql> select * from school.user_info;
+------+------+
| id | name |
+------+------+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |
| 8 | 8 |
| 9 | 9 |
| 10 | 10 |
+------+------+
10 rows in set (0.00 sec)


```

### xtrabackup 全备

使用 xtrabackup 全备一条命令搞定：
```bash
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 /data
```

开始操作：
```bash
#创建备份目录
mkdir /data
#执行全备
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 /data
```

230706 08:37:41 innobackupex: Starting the backup operation
IMPORTANT: Please check that the backup run completes successfully.
At the end of a successful backup run innobackupex
prints "completed OK!".
```bash
... ...
```

xtrabackup: Transaction log of lsn (2758494) to (2758503) was copied.
230706 08:37:44 completed OK!
打印日志最后出现 completed OK! 表示备份完毕。
ll /data/2023-07-06_08-37-41/
```bash
total 13M
4.0K -rw-r----- 1 root root 491 Jul 6 08:37 xtrabackup_info
4.0K -rw-r----- 1 root root 425 Jul 6 08:37 backup-my.cnf
4.0K -rw-r----- 1 root root 436 Jul 6 08:37 ib_buffer_pool
4.0K -rw-r----- 1 root root 113 Jul 6 08:37 xtrabackup_checkpoints
4.0K -rw-r----- 1 root root 2.5K Jul 6 08:37 xtrabackup_logfile
4.0K -rw-r----- 1 root root 23 Jul 6 08:37 xtrabackup_binlog_info
```

0 drwxr-x--- 2 root root 62 Jul 6 08:37 school/
12K drwxr-x--- 2 root root 8.0K Jul 6 08:37 sys/
12K drwxr-x--- 2 root root 8.0K Jul 6 08:37 performance_schema/
4.0K drwxr-x--- 2 root root 4.0K Jul 6 08:37 mysql/
```bash
12M -rw-r----- 1 root root 12M Jul 6 08:37 ibdata1
```

模拟数据丢失
通过模拟数据丢失，然后来恢复全备。
停止数据库服务 systemctl stop mysqld
删除数据文件和日志文件
1. 停止数据库服务
```bash
systemctl stop mysqld


```

2. 删除数据文件和日志文件
```bash
mkdir -p /tmp/mysql/data
mv /var/lib/mysql /tmp/mysql/data
```

rm -rf /var/log/mysqld.log
### xtrabackup 恢复全备

通过 xtrabackup 恢复数据
赋予数据文件 mysql 权限
启动数据库服务验证
1. 恢复准备，数据文件达到一致性
```bash
root@localhost(192.168.199.106)/root> innobackupex --defaults-file=/etc/my.cnf --user=root
--password=123123 --apply-log /data/2023-07-06_08-37-41/
...
```

230706 08:44:31 completed OK!
```bash
#说明：
#--apply-log: 准备恢复的准备工作：从指定的选项中读取配置信息并应用日志等。
root@localhost(192.168.199.106)/root> innobackupex --defaults-file=/etc/my.cnf --user=root
--password=123123 --apply-log --redo-only /data/2023-07-06_08-37-41/
#说明：
#--redo-only: 准备工作完成后:还有其他增量备份集待处理，那么就必须指定本参数。强制
```

xtrabackup只应用redo而不回滚。如果没有增量备份，那么就不用指定此参数
```bash
root@localhost(192.168.199.106)/root> innobackupex --defaults-file=/etc/my.cnf --user=root
--password=123123 --copy-back /data/2023-07-06_08-37-41/
...
```

230706 08:46:13 completed OK!
```bash
#说明：
#--copy-back: 数据保持一致。
```

2. 修改数据文件权限
该步骤是最容易遗忘的，如果不做该步骤，MySQL是无法启动的。
```bash
root@localhost(192.168.199.106)/root> id mysql
uid=27(mysql) gid=27(mysql) groups=27(mysql)
root@localhost(192.168.199.106)/root> chown -R mysql:mysql /var/lib/mysql
```

3. 启动MySQL并验证

```bash
root@localhost(192.168.199.106)/root> systemctl start mysqld
root@localhost(192.168.199.106)/root> mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor. Commands end with ; or \g.
```

Your MySQL connection id is 2
```bash
Server version: 5.7.36-log MySQL Community Server (GPL)
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> select * from school.user_info;
+------+------+
| id | name |
+------+------+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |
| 8 | 8 |
| 9 | 9 |
| 10 | 10 |
+------+------+
10 rows in set (0.04 sec)
```

全备恢复正常。
### xtrabackup定期全备脚本

```bash
root@localhost(192.168.199.106)/root> mkdir -p /mnt/scripts/
root@localhost(192.168.199.106)/root> cd /mnt/scripts/
root@localhost(192.168.199.106)/mnt/scripts> vim xtrabackup_full_backup.sh
#!/bin/bash
#dest: xtrabackup 全备脚本
TIME=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/data/mysql_full_xtrabackup
if [ ! -d $BACKUP_DIR/logs ]; then
mkdir -p $BACKUP_DIR/logs
fi
if [ -e /usr/bin/innobackupex ] && [ -f /etc/my.cnf ]; then
/usr/bin/innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123
```

$BACKUP_DIR &> $BACKUP_DIR/logs/xtrabackup-${TIME}.log
```bash
else


echo "ERROR $TIME 请检查xtrabackup是否安装或MySQL是否启动." &>
/data/logs/xtrabackup-${TIME}.log
fi
COUNT=$(ls -ldtr $BACKUP_DIR/* | wc -l)
if [ $COUNT -gt 5 ]; then
MV_DIR=$(ls -dltr $BACKUP_DIR/* | awk 'NR==1{print $NF}')
mkdir -p /tmp/mysql_full_backup && mv $MV_DIR /tmp/mysql_full_backup
fi
root@localhost(192.168.199.106)/mnt/scripts> chmod +x xtrabackup_full_backup.sh
xtrabackup 全备可设定 1 周进行 1 次
#每周天4点执行
root@localhost(192.168.199.106)/root> crontab -e
0 4 * * 7 /mnt/scripts/xtrabackup_full_backup.sh
```

### xtrabackup备份恢复总结

全备
```bash
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 /data
```

恢复
前提：/var/lib/mysql 必须为空
```bash
systemctl stop mysqld
mv /var/lib/mysql /tmp
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log /data/2023-07-06_08-37-41/
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log --redo-only /data/2023-07-06_08-37-41/
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --copy-back /data/2023-07-06_08-37-41/
systemctl start mysqld


```

### xtrabackup增量备份

注意： innobackupex 增量备份仅针对InnoDB这类事务的引擎，对于MyISAM等引擎，则仍然是全
备。
增量备份需要基于全量备份来操作。
1. 创建库和测试数据
```bash
root@localhost(192.168.199.106)~>mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> drop database school;
Query OK, 1 row affected (0.01 sec)
mysql> create database school;
Query OK, 1 row affected (0.00 sec)
mysql> create table school.user_info(id int,name varchar(32));
Query OK, 0 rows affected (0.02 sec)
mysql> INSERT INTO school.user_info
-> VALUES
-> (1, '1'),(2, '2'),(3, '3'),(4, '4'),(5, '5'),(6, '6'),(7, '7'),(8, '8'),(9, '9'),
```

(10, '10');
```bash
Query OK, 10 rows affected (0.05 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
```

2. 进行全备
```bash
root@localhost(192.168.199.106)~>mkdir -pv /data/full_backup
mkdir: created directory '/data'
mkdir: created directory '/data/full_backup'
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 /data/full_backup
```

3. 添加数据
模拟生产环境实时新增数据
```bash
mysql> select count(1) from school.user_info;


+----------+
| count(1) |
+----------+
| 10 |
+----------+
1 row in set (0.00 sec)
mysql> INSERT INTO school.user_info
-> VALUES
-> (11, '11'),(12, '12'),(13, '13'),(14, '14'),(15, '15'),(16, '16'),(17, '17'),(18,
```

'18'),(19, '19'),(20, '20');
```bash
Query OK, 10 rows affected (0.01 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 20 |
+----------+
1 row in set (0.00 sec)
```

4. 进行增量备份
```bash
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --incremental-basedir=/data/full_backup/2023-07-06_18-26-37/ --incremental
/data/days1
...
```

230706 18:30:23 completed OK!
其中：
--incremental-basedir 指向全量备份目录 --incremental 指向增量备份的目录
上面语句执行成功之后，会在--incremental执行的目录下创建一个时间戳子目录（本例中
为：/data/days1/2023-05-14_09-08-20），在该目录下存放着增量备份的所有文件。
在备份目录下，有一个文件xtrabackup_checkpoints记录着备份信息，其中可以查出
```bash
#全量备份的信息如下：
root@localhost(192.168.199.106)~>cat /data/full_backup/2023-07-06_18-2637/xtrabackup_checkpoints
backup_type = full-backuped
from_lsn = 0
to_lsn = 5867760
last_lsn = 5867769
compact = 0
recover_binlog_info = 0
root@localhost(192.168.199.106)~>cat /data/days1/2023-07-06_18-3021/xtrabackup_checkpoints
backup_type = incremental
from_lsn = 5867760 # 从这里可以看出，增量备份的from_lsn正好等于全备的to_lsn。
to_lsn = 5870345
last_lsn = 5870354
compact = 0
recover_binlog_info = 0


```

从 上 面 可 以 看 出 ， 增 量 备 份 的 from_lsn 正 好 等 于 全 备 的 to_lsn ， 如 果 再 次 进 行 备 份 只 需 要 将 -incremental-basedir 指向第一次增备即可。
5. 再第1次增备完成后，又新增数据，然后进行第二次增量备份
```bash
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 20 |
+----------+
1 row in set (0.00 sec)
mysql> INSERT INTO school.user_info
-> VALUES
-> (21, '21'),(22, '22'),(23, '23'),(24, '24'),(25, '25'),(26, '26'),(27, '27'),(28,
```

'28'),(29, '29'),(30, '30');
```bash
Query OK, 10 rows affected (0.01 sec)
Records: 10 Duplicates: 0 Warnings: 0
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 30 |
+----------+
1 row in set (0.00 sec)
```

6. 进行第二次增备
```bash
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --incremental-basedir=/data/days1/2023-07-06_18-30-21/ --incremental
/data/days2
...
```

230706 19:15:01 completed OK!
### xtrabackup 增量备份脚本

```bash
xtrabackup 增备不仅基于全备，而且对于增备是环环相扣的。
###全备###
root@localhost(192.168.199.106)~/mnt/scripts>vim xtra_full_backup.sh
#!/bin/bash
# dest: xtrabackup全备脚本
USER=root
PASSWD=123123
BACKUP_DIR=/data/mysql/full_backup
#DATE=$(date +"%Y%m%d_%H%M%S")


DATE=$(date +"%F_%T")
LOG_DIR=$BACKUP_DIR/logs
```

[[ -d $LOG_DIR ]] || mkdir -p $LOG_DIR
```bash
innobackupex --user=$USER --password=$PASSWD $BACKUP_DIR &> $LOG_DIR/${DATE}.log
# 增备通过complete.info 文件确定--incremental-basedir 的指向
egrep ".* Backup created in directory.*" $LOG_DIR/${DATE}.log >> $LOG_DIR/complete.info
# 保存最近的4份备份数据，其他的移动至 /tmp目录下，/tmp目录下文件10天没修改自动删除
COUNT=$(ls -ldtr $BACKUP_DIR/* | wc -l)
if [ $COUNT -gt 5 ]; then
MV_DIR=$(ls -dltr $BACKUP_DIR/* | awk 'NR==1{print $NF}')
mkdir -p /tmp/mysql_full_backup && mv $MV_DIR /tmp/mysql_full_backup
fi
root@localhost(192.168.199.106)~/mnt/scripts>vim xtra_inc_backup.sh
#!/bin/bash
# dest: xtrabackup增备脚本
USER=root
PASSWD=123123
BACKUP_DIR=/data/mysql/inc_backup
DATE=$(date +"%F_%T")
LOG_DIR=$BACKUP_DIR/logs
# 读取全备目录
BASE_DIR=$(tail -1 /data/mysql/full_backup/logs/complete.info | cut -d\' -f2)
```

[[ -d $LOG_DIR ]] || mkdir -p $LOG_DIR
```bash
innobackupex --user=$USER --password=$PASSWD --incremental $BACKUP_DIR --incremental-basedir=$BASE_DIR &> $LOG_DIR/${DATE}.log
# 该文件是为了记录该增备是基于哪个全备进行的
egrep ".* Backup created in directory.*" $LOG_DIR/${DATE}.log >> $LOG_DIR/backup.info
# 保存最近的4份备份数据，其他的移动至 /tmp目录下，/tmp目录下文件10天没修改自动删除
COUNT=$(ls -ldtr $BACKUP_DIR/* | wc -l)
if [ $COUNT -gt 8 ]; then
MV_DIR=$(ls -dltr $BACKUP_DIR/* | awk 'NR==1{print $NF}')
mkdir -p /tmp/mysql_inc_backup && mv $MV_DIR /tmp/mysql_inc_backup
fi
```

赋予脚本权限
```bash
root@localhost(192.168.199.106)~/mnt/scripts> chmod +x *.sh
```

设定计划任务
```bash
#全备周天4点执行，增倍周1-6 4点执行
root@localhost(192.168.199.106)/root> crontab -e
0 4 * * 7 /mnt/scripts/xtra_full_backup.sh
0 4 * * 1-6 /mnt/scripts/xtra_inc_backup.sh


```

### xtrabackup 增量恢复

1. 模拟误操作，删除数据库
```bash
root@localhost(192.168.199.106)~>mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> drop database school;
Query OK, 1 row affected (0.02 sec)
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| sys |
+--------------------+
4 rows in set (0.01 sec)
```

2. 准备预恢复数据
接下来进行数据恢复,此选项--redo-only 阻止回滚未完成的事务,（注意最后一个不需要加--redo-only参数）
```bash
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log --redo-only /data/full_backup/2023-07-06_18-26-37/
...
```

230706 19:24:31 completed OK!
```bash
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log --redo-only /data/full_backup/2023-07-06_18-26-37/ --
incremental-dir=/data/days1/2023-07-06_18-30-21/
...
```

230706 19:24:57 completed OK!
```bash
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log /data/full_backup/2023-07-06_18-26-37/ --incremental-
dir=/data/days2/2023-07-06_19-14-59/
...
```

230706 19:25:33 completed OK!
3. 停止mysql服务，并移除mysql存放目录下的文件
```bash
root@localhost(192.168.199.106)~>systemctl stop mysqld
root@localhost(192.168.199.106)~>mkdir -pv /tmp/mysql
mkdir: created directory '/tmp/mysql'
root@localhost(192.168.199.106)~>mv /var/lib/mysql/* /tmp/mysql/
```

4. 恢复数据

注意： 复制到数据库目录，数据库目录必须为空，MySQL服务不能启动
```bash
root@localhost(192.168.199.106)~>innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --copy-back /data/full_backup/2023-07-06_18-26-37/
...
```

230706 19:29:49 completed OK!
5. 修改数据文件权限
注意： 该步骤不能省略，否则MySQL无法启动
```bash
root@localhost(192.168.199.106)~>chown -R mysql:mysql /var/lib/mysql
```

6. 启动MySQL并验证
```bash
root@localhost(192.168.199.106)~>systemctl start mysqld
root@localhost(192.168.199.106)~>mysql -uroot -p123123
mysql: [Warning] Using a password on the command line interface can be insecure.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| mysql |
| performance_schema |
| school |
| sys |
+--------------------+
5 rows in set (0.00 sec)
mysql> select count(1) from school.user_info;
+----------+
| count(1) |
+----------+
| 30 |
+----------+
1 row in set (0.04 sec)
```

数据恢复成功。

### xtrabackup使用总结

#### xtrabackup全备

```bash
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 /data
```

### xtrabackup增量备份

```bash
#第一次增量备份 --incremental-basedir 指定全备的位置
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --incremental-basedir=/data/full_backup/2023-07-06_18-26-37/ --incremental /data/days1
#第二次增量备份 --incremental-basedir 指定第一次增量备份的位置
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --incremental-basedir=/data/days1/2023-07-06_18-30-21/ --incremental /data/days2
### 以此类推 ###
```

#### xtrabackup增量备份恢复

注意： 在进行 xtrabackup 恢复时，无论是全量还是增量，/var/lib/mysql 都必须为空，且恢复完成后
记得修改权限。
1. 关闭MySQL服务
```bash
systemctl stop mysqld
```

2. 移除数据文件
```bash
mv /var/lib/mysql/* /tmp
```

3. 准备预恢复数据
```bash
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log --redo-only /data/full_backup/2023-07-06_18-26-37/
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log --redo-only /data/full_backup/2023-07-06_18-26-37/ --incremental-dir=/data/days1/2023-07-06_18-
```

30-21/
```bash
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --apply-log /data/full_backup/2023-07-06_18-26-37/ --incremental-dir=/data/days2/2023-07-06_19-14-59/
innobackupex --defaults-file=/etc/my.cnf --user=root --password=123123 --copy-back /data/full_backup/2023-07-06_18-26-37/


```

4. 修改为mysql权限
```bash
chown -R mysql:mysql /var/lib/mysql
```

5. 启动数据库服务查看数据
```bash
systemctl start mysqld
```
