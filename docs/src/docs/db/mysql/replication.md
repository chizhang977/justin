---
title: MySQL 主从复制
---
# MySQL 主从复制

MySQL 主从复制用于把主库的数据变更同步到从库。常见用途是读写分离、数据备份、故障切换、报表查询隔离。

## 基本架构

```text
应用写入
  -> 主库 master
      -> binlog
          -> 从库 IO 线程拉取
              -> relay log
                  -> SQL 线程重放
                      -> 从库 slave
```

核心日志：

- **binlog**：主库二进制日志，记录数据变更。
- **relay log**：从库中继日志，从主库拉取后先保存到本地。

核心线程：

- **IO 线程**：从主库拉取 binlog。
- **SQL 线程**：在从库重放 relay log。

## 主从复制用途

### 1. 读写分离

主库负责写，从库负责读。

```text
写请求 -> master
读请求 -> slave
```

注意：主从复制通常是异步的，从库可能有延迟。对一致性要求高的读请求，例如刚提交订单后立刻查询订单详情，应该读主库或做一致性处理。

### 2. 备份

可以在从库上执行备份，减少对主库的影响。

### 3. 报表查询

复杂统计 SQL 可以放到从库，避免影响主库写入。

### 4. 故障切换

主库故障时，可以提升从库为新的主库。但故障切换需要配合高可用组件或人工流程。

## 搭建准备

示例：


| 角色   | IP            | 端口 |
| ------ | ------------- | ---- |
| master | 192.168.56.10 | 3306 |
| slave  | 192.168.56.11 | 3306 |

两台机器需要：

- 关闭`selinux`和`firewalld`
- 设置默认文件句柄
- 时间同步
- 更换yum 仓库文件
- MySQL 版本尽量一致。
- 网络互通。
- server_id 不同。
- 主库开启 binlog。
- 从库能访问主库。

### 关闭`selinux`和`firewalld

```shell
root@localhost(192.168.199.107)~>sed -i 's@SELINUX=enforcing@SELINUX=disabled@g' 
/etc/selinux/config
```

### 设置文件句柄

```shell
cat >> /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF

```

### 时间同步

```shell
root@localhost(192.168.199.107)~>yum install -y ntpdate
root@localhost(192.168.199.107)~>ntpdate ntp1.aliyun.com
#设置每天4点同步一次
root@localhost(192.168.199.107)~>crontab -e
0 4 * * * /usr/sbin/ntpdate -s ntp1.aliyun.com
```

### 更换yum仓库文件

```shell
root@localhost(192.168.199.107)/root> mkdir -pv /etc/yum.repos.d/bak
mkdir: created directory ‘/etc/yum.repos.d/bak’
root@localhost(192.168.199.107)/root> mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/bak/
root@localhost(192.168.199.107)/root> curl http://mirrors.aliyun.com/repo/Centos-7.repo -o 
/etc/yum.repos.d/Centos-7.repo
root@localhost(192.168.199.107)/root> curl http://mirrors.aliyun.com/repo/epel-7.repo -o 
/etc/yum.repos.d/epel-7.repo
root@localhost(192.168.199.107)/root> sed -i '/aliyuncs/d' /etc/yum.repos.d/Centos-7.repo
root@localhost(192.168.199.107)/root> yum clean all
root@localhost(192.168.199.107)/root> yum repolist all
```

### 安装MySQL

#### 下载安装包

国内下载地址：[http://mirrors.sohu.com/mysql/MySQL-5.7/mysql-5.7.36-1.el7.x86\_64.rpm-bundle.tar](http://mirrors.sohu.com/mysql/MySQL-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar)

官网下载地址：[https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.36-1.el7.x86\_64.rpm-bundle.tar](https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar)

#### 安装程序包

```
#卸载mariadb-libs
root@localhost(192.168.199.107)/root> rpm -qa | egrep mariadb
root@localhost(192.168.199.107)/root> yum remove -y mariadb-libs
```

```
#安装MySQL程序包
root@localhost(192.168.199.107)/root> mkdir -pv mysql
mkdir: created directory 'mysql'
root@localhost(192.168.199.107)/root> tar xf mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar -C mysql
root@localhost(192.168.199.107)/root> cd mysql/
root@localhost(192.168.199.107)/root/mysql> yum localinstall *.rpm -y

```

#### 启动服务

```
root@localhost(192.168.199.107)/root> systemctl enable mysqld ; systemctl start mysqld
root@localhost(192.168.199.107)/root> netstat -ntplu | egrep 3306
```

#### 登录MySQL

MySQL启动后，初始化密码存放在 日志文件中

```shell
root@localhost(192.168.199.107)/root> egrep -ri password /var/log/mysqld.log
2023-07-06T02:48:50.170275Z 1 [Note] A temporary password is generated for root@localhost: 
bsI,9pJ)JQ1o
#登录mysql
root@localhost(192.168.199.107)/root> mysql -uroot -p
Enter password: #密码为：bsI,9pJ)JQ1o
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.7.36
Copyright (c) 2000, 2021, Oracle and/or its affiliates.
mysql>
Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement
```

#### 修改初始密码

MySQL登录后第一件事是修改初始密码，否则任何操作都受限

```shell
#提示需要使用 alter user 修改密码再进行操作
mysql> show databases;
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before 
executing this statement.
#修改密码，密码要求大小写+数字
mysql> alter user user() identified by 'Root@123';
Query OK, 0 rows affected (0.00 sec)
#修改后就可直接进行操作
mysql> show databases
```

> 如果需要修改为任意简单的密码，可进行如下操作

```shell
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
# dest: MySQL 5.7 自动安装脚本（适用于 CentOS 7）

set -e  # 遇到错误即退出，避免后续执行无意义

# 1. 检查系统版本（仅支持 CentOS 7）
function Check_linux_system() {
    if [[ -f /etc/redhat-release ]]; then
        local linux_version=$(cat /etc/redhat-release)
        if [[ ${linux_version} =~ "CentOS" ]] && [[ ${linux_version} =~ "7." ]]; then
            echo -e "\033[32;32m 系统为 ${linux_version}，符合要求 \033[0m\n"
        else
            echo -e "\033[31;31m 该脚本仅支持 CentOS 7，当前系统: ${linux_version} \033[0m\n"
            exit 1
        fi
    else
        echo -e "\033[31;31m 无法识别系统版本，脚本退出 \033[0m\n"
        exit 1
    fi
}

# 2. 关闭 SELinux 和 firewalld
function Disable_ip_se() {
    systemctl stop firewalld && systemctl disable firewalld
    if [[ $(getenforce) != "Disabled" ]]; then
        setenforce 0
        sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
    else
        echo -e "\033[32;32m SELinux 已关闭 \033[0m\n"
    fi
}

# 3. 配置 limits.conf 和 yum 源
function Ulimit_yum() {
    # 正确写入 limits.conf（格式：<domain> <type> <item> <value>）
    cat >> /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF

    # 立即生效（当前会话）
    ulimit -SHn 65535

    # 备份原有 repo，并下载阿里云 CentOS 7 源
    mkdir -pv /etc/yum.repos.d/bak
    mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/bak/ 2>/dev/null || true
    curl -o /etc/yum.repos.d/Centos-7.repo http://mirrors.aliyun.com/repo/Centos-7.repo
    sed -i '/aliyuncs/d' /etc/yum.repos.d/Centos-7.repo

    # 清理缓存并更新
    yum clean all
    yum repolist all

    # 安装工具（时间同步）
    yum install -y ntpdate wget &> /dev/null
    # 修正 ntpdate 参数（-u 使用非特权端口）
    ntpdate -u ntp1.aliyun.com &> /dev/null || echo "时间同步失败，请检查网络"
}

# 4. 安装 MySQL 5.7
function Install_mysql() {
    # 下载 bundle 包（若已存在则跳过）
    if [[ ! -f mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar ]]; then
        wget https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar
    fi
    mkdir -p mysql
    tar xf mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar -C mysql --skip-old-files

    # 使用 localinstall 安装所有 rpm（--nodeps 可避免依赖问题，但更推荐 yum 自动解决）
    yum localinstall mysql/*.rpm -y

    # 启动并设置开机自启
    systemctl enable mysqld
    systemctl start mysqld

    # 等待 MySQL 完全启动（最多 30 秒）
    local timeout=30
    while ! systemctl is-active --quiet mysqld && [[ $timeout -gt 0 ]]; do
        sleep 1
        ((timeout--))
    done

    if systemctl is-active --quiet mysqld; then
        # 从日志中提取临时密码
        local MYSQL_PWD=$(grep -i 'temporary password' /var/log/mysqld.log | tail -1 | awk '{print $NF}')
        echo -e "\033[32;32m MySQL 安装完成并启动成功！\033[0m"
        echo -e "\033[32;32m 初始 root 密码: ${MYSQL_PWD} \033[0m"
        echo -e "\033[33;33m 请立即执行以下命令修改 root 密码（否则无法执行 SQL）：\033[0m"
        echo "mysql -uroot -p'${MYSQL_PWD}' --connect-expired-password -e \"ALTER USER USER() IDENTIFIED BY '你的新密码';\""
        echo -e "\033[33;33m 建议同时设置 validate_password_policy 等参数以满足安全要求。\033[0m"
    else
        echo -e "\033[31;31m MySQL 启动失败，请检查日志: /var/log/mysqld.log \033[0m"
        exit 1
    fi
}

# 主流程
Check_linux_system
Disable_ip_se
Ulimit_yum
Install_mysql
```

## 主库配置

1.编辑 MySQL 配置文件：

```ini
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

2.重启 MySQL：

```bash
systemctl restart mysqld
```

3.修改root密码

```bash
egrep -ri password /var/log/mysqld.log egrep -ri password /var/log/mysqld.log

mysql -uroot -

set global validate_password_policy=0;
set global validate_password_length=1;
alter user user() identified by '123123'
```

4.创建测试数据

```bash
mysql> create database school;
Query OK, 1 row affected (0.01 sec)
mysql> create table school.user_info(id int,name varchar(32));
Query OK, 0 rows affected (0.03 sec)
mysql> INSERT INTO school.user_info-> VALUES-> (1, '1'),(2, '2'),(3, '3'),(4, '4'),(5, '5'),(6, '6'),(7, '7'),(8, '8'),(9, '9'),
(10, '10');
Query OK, 10 rows affected (0.05 sec)
Records: 10  Duplicates: 0  Warnings: 0
mysql> select count(1) from school.user_info;
```

5.进行master的全备

```bash
root@localhost(192.168.199.106)/root> mysqldump -uroot -p --routines --single_transaction --master-data=2 --all-databases > backup-all-databses.sql
Enter password:
root@localhost(192.168.199.106)/root> ll backup-all-databses.sql
856K -rw-r--r-- 1 root root 856K Jul  6 14:27 backup-all-databses.sql
#将全备拷贝到slave节点，待会需要导入到 slave 库
root@localhost(192.168.199.106)/root> scp backup-all-databses.sql 192.168.199.107:/root/
root@192.168.199.107's password:
参数说明：--routines 导出存储过程和函数--single_transaction 导出开始时设置事务隔离状态，并使用一致性快照事务，然后unlock tables;
而 lock-tables是锁住一张表不能写操作，直到dump完毕。--master-data=2 默认等于1，将dump起始（change master to） binlog点和pos值写到结果中，等于
2是将change master to写到结果中并注释
```

6.创建复制账号：

```sql
CREATE USER 'repl'@'192.168.56.%' IDENTIFIED BY 'repl_password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'192.168.56.%';
FLUSH PRIVILEGES;
```

7.继续在主库中添加数据，该数据是全备后新增的数据，模拟生产库实时新增数据

```bash
mysql> INSERT INTO school.user_info-> VALUES-> (11, '11'),(12, '12'),(13, '13'),(14, '14'),(15, '15'),(16, '16'),(17, '17'),(18, 
'18'),(19, '19'),(20, '20');
```

8.查看主库状态：

```sql
SHOW MASTER STATUS;
```

记录：

- `File`
- `Position`

例如：

```text
mysql-bin.000001
154
```

## 从库配置

1.编辑配置：

```ini
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

2.重启：

```bash
systemctl restart mysqld
```

3.修改 root 密码

```bash
root@localhost(192.168.199.107)/root> systemctl restart mysqld
root@localhost(192.168.199.107)/root> egrep -ri password /var/log/mysqld.log
2023-07-06T06:22:22.285976Z 1 [Note] A temporary password is generated for root@localhost: 
dP4qob(K(piB
root@localhost(192.168.199.107)/root> mysql -uroot -p
Enter password:
mysql> set global validate_password_policy=0;
Query OK, 0 rows affected (0.00 sec)
mysql> set global validate_password_length=1;
Query OK, 0 rows affected (0.00 sec)
mysql> alter user user() identified by '123123';
Query OK, 0 rows affected (0.01 sec)
```

4.导入master节点的全备

```bash
root@localhost(192.168.199.107)/root> mysql -uroot -p123123 < backup-all-databses.sql
mysql: [Warning] Using a password on the command line interface can be insecure.
```

5.查看全备导入后的数据,通过以上查询得知，数据量和目前master节点的数据量是不匹配的。

6.通过全备文件查看  binlog 日志和  pos 值，这两可以明确一个时间点,接下来，在  slave 节点开启同步master库时，就从这个时间点开始

7.备库设置日志点同步，并启动

8.配置主库信息：

```sql
root@localhost(192.168.199.107)/root> mysql -uroot -p123123
mysql> start slave;
Query OK, 0 rows affected (0.00 sec)
mysql> change master to 
master_host='192.168.199.106',master_user='repl',master_password='repl',master_log_file='m
aster-bin.000002',master_log_pos=1142;
Query OK, 0 rows affected, 2 warnings (0.03 sec)
mysql> show slave status\G;
*************************** 1. row ***************************
Slave_IO_State: Waiting for master to send event
Master_Host: 192.168.199.106
Master_User: repl
Master_Port: 3306
Connect_Retry: 60
Master_Log_File: master-bin.000002
Read_Master_Log_Pos: 198
```

MySQL 8.0.23 以后也可以使用 `CHANGE REPLICATION SOURCE TO`，语义更清晰。

IO和SQL线程均为：Yes 状态，说明主从配置成功。

再次查看数据量是否与主库同步

同步测试 通过在master 上删除10条数据进行测试，查看 slave 是否同步

slave查看数据量是否同

确认无误，master 和 slave 完全同步。

启动复制：

```sql
START SLAVE;
```

查看状态：

```sql
SHOW SLAVE STATUS\G
```

重点看：

```text
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
Seconds_Behind_Master: 0
```

两个线程都为 `Yes`，说明复制正常。

## 验证复制

主库执行：

```sql
CREATE DATABASE repl_test;
USE repl_test;
CREATE TABLE t_user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50)
);
INSERT INTO t_user (name) VALUES ('justin');
```

从库查询：

```sql
SELECT * FROM repl_test.t_user;
```

如果能看到数据，说明复制链路正常。

## 主从延迟

查看：

```sql
SHOW SLAVE STATUS\G
```

关注：

```text
Seconds_Behind_Master
```

主从延迟常见原因：

- 主库写入压力大。
- 从库 SQL 线程重放慢。
- 大事务。
- 从库硬件性能差。
- 从库执行复杂查询影响复制。
- 网络抖动。

降低延迟：

- 避免大事务。
- 从库避免复杂慢查询。
- 合理配置并行复制。
- 主从机器性能不要差距过大。
- 对强一致读走主库。

## 常见故障

### IO 线程不是 Yes

可能原因：

- 主库 IP 或端口不通。
- 复制账号密码错误。
- 主库防火墙或安全组未开放。
- 主库 binlog 未开启。

排查：

```bash
ping 192.168.56.10
telnet 192.168.56.10 3306
```

查看从库错误：

```sql
SHOW SLAVE STATUS\G
```

关注 `Last_IO_Error`。

### SQL 线程不是 Yes

可能原因：

- 从库重放 SQL 报错。
- 主从数据不一致。
- 从库被手工写入过数据。

查看：

```sql
SHOW SLAVE STATUS\G
```

关注 `Last_SQL_Error`。

不要轻易跳过错误，应该先确认数据一致性和错误原因。

## 生产注意事项

- 从库设置 `read_only=ON`，避免误写。
- 复制账号只授予复制权限。
- 定期监控主从延迟。
- 备份和恢复流程要定期演练。
- 应用读写分离要考虑延迟。
- 主从不是备份的替代品，误删数据会同步到从库。

## 主从和备份的关系

主从复制不能替代备份。

原因：

```text
主库误删数据
  -> binlog 记录 DELETE
  -> 从库重放 DELETE
  -> 从库也删除
```

所以仍然需要定期备份，并保留 binlog，用于恢复到指定时间点。
