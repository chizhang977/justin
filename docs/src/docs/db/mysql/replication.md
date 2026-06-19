---
title: MySQL 主从复制
---

# MySQL 主从复制

MySQL 主从复制用于把主库的数据变更同步到从库。它常用于读写分离、报表查询隔离、备份卸载、故障切换演练和容灾架构建设。

这篇文档以 **MySQL 8.0 + GTID 复制** 为主线。MySQL 5.7 仍然可以参考，差异主要在命令命名上：

| MySQL 8.0.23+ | MySQL 5.7 / 较早 8.0 | 含义 |
| --- | --- | --- |
| source | master | 主库 |
| replica | slave | 从库 |
| `CHANGE REPLICATION SOURCE TO` | `CHANGE MASTER TO` | 配置复制源 |
| `START REPLICA` | `START SLAVE` | 启动复制 |
| `SHOW REPLICA STATUS\G` | `SHOW SLAVE STATUS\G` | 查看复制状态 |
| `--source-data=2` | `--master-data=2` | 备份时记录 binlog 位点 |

## 复制架构

```text
应用写入
  -> 主库 source
      -> binlog
          -> 从库 IO 线程拉取
              -> relay log
                  -> SQL 线程重放
                      -> 从库 replica
```

核心组件：

- **binlog**：主库二进制日志，记录数据变更。
- **relay log**：从库中继日志，从主库拉取 binlog 后先落到本地。
- **IO thread**：从库连接主库并拉取 binlog。
- **SQL thread**：从库重放 relay log，把数据变更应用到本地。
- **GTID**：全局事务 ID，用事务编号追踪复制进度，避免手工维护 `binlog file + position`。

## 使用场景

### 读写分离

```text
写请求 -> 主库
读请求 -> 从库
```

复制通常是异步的，从库可能存在延迟。刚写完就要立刻强一致读取的业务，例如支付、订单详情、库存扣减结果，应读主库或做一致性策略。

### 备份卸载

可以在从库执行备份，降低主库压力。但主从复制不能替代备份，因为误删、误更新也会同步到从库。

### 报表隔离

复杂统计 SQL 可以放到从库执行，避免影响主库写入链路。

### 故障切换

主库故障时，可以把从库提升为新主库。但这需要明确的切换流程、数据一致性检查和应用连接切换，不是“搭了主从就自动高可用”。

## 实验环境

建议用两台云服务器放在同一个 VPC 中，复制流量走私网。

| 角色 | 主机名 | 私网 IP | 端口 |
| --- | --- | --- | --- |
| 主库 | mysql-source | `10.0.0.10` | 3306 |
| 从库 | mysql-replica | `10.0.0.11` | 3306 |

下文所有 IP 都是示例，实际操作时替换成你腾讯云服务器的 **私网 IP**。不要用公网 IP 做主从复制，公网链路更慢，也更容易暴露数据库端口。

安全组建议：

| 方向 | 协议端口 | 来源 | 说明 |
| --- | --- | --- | --- |
| 入站 | TCP:22 | 你的公网 IP/32 | SSH 登录 |
| 入站 | TCP:3306 | 从库私网 IP/32 | 主库允许从库连接 |
| 入站 | TCP:3306 | 运维机或内网网段 | 可选，从库需要远程管理时才放通 |

不要把 `3306` 长期开放给 `0.0.0.0/0` 或 `::/0`。如果只是临时排查，排查完立刻收回。

## 操作总览

```text
1. 准备两台服务器和安全组
2. 两台机器安装 MySQL
3. 主库开启 binlog 和 GTID
4. 从库设置 server-id、relay log、只读
5. 主库创建复制账号
6. 如果主库已有数据，先做一致性备份并导入从库
7. 从库配置复制源
8. 启动复制并验证
9. 做延迟、断连、误写等排障演练
10. 练习结束后销毁云资源，避免继续计费
```

## 系统准备

以下命令在两台机器都执行。

### 基础工具

Ubuntu 22.04：

```bash
sudo apt update
sudo apt install -y mysql-server wget vim net-tools chrony
```

CentOS 7：

```bash
sudo yum install -y wget vim net-tools chrony
```

> CentOS 7 已进入生命周期末期，新环境更建议使用 Ubuntu 22.04、Rocky Linux、AlmaLinux 或腾讯云 TencentOS。

### 时间同步

```bash
sudo systemctl enable --now chrony
timedatectl
```

如果时间不同步，证书、日志排查、复制延迟判断都会变得混乱。

### 文件句柄

小实验不一定需要改，生产环境建议评估后配置：

```bash
cat <<'EOF' | sudo tee /etc/security/limits.d/mysql.conf
mysql soft nofile 65535
mysql hard nofile 65535
mysql soft nproc 65535
mysql hard nproc 65535
EOF
```

### 防火墙说明

云服务器优先用安全组控制访问。不要为了省事长期关闭所有防火墙。

如果是实验环境且系统防火墙拦住了端口，可以临时放通：

Ubuntu：

```bash
sudo ufw allow from 10.0.0.11 to any port 3306 proto tcp
sudo ufw status
```

CentOS：

```bash
sudo firewall-cmd --permanent --add-rich-rule="rule family=ipv4 source address=10.0.0.11/32 port protocol=tcp port=3306 accept"
sudo firewall-cmd --reload
```

## 安装 MySQL

### Ubuntu 22.04 推荐方式

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo systemctl status mysql --no-pager
```

登录：

```bash
sudo mysql
```

查看版本：

```sql
SELECT VERSION();
```

### CentOS 7 旧环境安装 MySQL 5.7

如果必须使用旧 CentOS 7 和 MySQL 5.7，可以下载官方归档 RPM 包。这里统一使用 `wget`，避免混用下载工具。

```bash
sudo yum remove -y mariadb-libs
wget https://cdn.mysql.com/archives/mysql-5.7/mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar
mkdir -p mysql-5.7-rpms
tar xf mysql-5.7.36-1.el7.x86_64.rpm-bundle.tar -C mysql-5.7-rpms
sudo yum localinstall -y mysql-5.7-rpms/*.rpm
sudo systemctl enable --now mysqld
```

查看临时密码：

```bash
sudo grep -i 'temporary password' /var/log/mysqld.log
```

登录后先修改 root 密码：

```bash
mysql -uroot -p --connect-expired-password
```

```sql
ALTER USER USER() IDENTIFIED BY 'Root_ChangeMe_123!';
```

## 一键安装脚本

这是 Ubuntu 22.04 实验环境脚本。它只负责安装 MySQL 和基础工具，不自动修改主从配置，避免误把主库和从库配置混在一起。

```bash
#!/usr/bin/env bash
set -euo pipefail

if ! command -v apt >/dev/null 2>&1; then
  echo "当前脚本只适用于 Ubuntu/Debian 系统"
  exit 1
fi

sudo apt update
sudo apt install -y mysql-server wget vim net-tools chrony
sudo systemctl enable --now chrony
sudo systemctl enable --now mysql

mysql_version=$(mysql --version)
echo "MySQL 安装完成：${mysql_version}"
echo "登录方式：sudo mysql"
```

保存为 `install-mysql8-ubuntu.sh`：

```bash
chmod +x install-mysql8-ubuntu.sh
./install-mysql8-ubuntu.sh
```

## 主库配置

主库示例 IP：`10.0.0.10`。

先确认主库私网 IP：

```bash
ip addr show
```

编辑配置文件：

```bash
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

加入或调整：

```ini
[mysqld]
server-id=1
bind-address=10.0.0.10

log_bin=mysql-bin
binlog_format=ROW
binlog_expire_logs_seconds=604800

gtid_mode=ON
enforce_gtid_consistency=ON

character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci

slow_query_log=ON
long_query_time=2
```

说明：

- `server-id` 必须全局唯一。
- `bind-address` 建议绑定私网 IP，不建议为了省事直接暴露到所有网卡。
- `log_bin` 是主库作为复制源的关键。
- `binlog_format=ROW` 更适合生产复制，避免 statement 模式下函数、时间、非确定性 SQL 带来的不一致。
- `gtid_mode=ON` 和 `enforce_gtid_consistency=ON` 用于 GTID 复制。
- 不建议默认配置 `slave_skip_errors` 或 `replica_skip_errors`，跳过错误可能掩盖数据不一致。

重启 MySQL：

```bash
sudo systemctl restart mysql
sudo systemctl status mysql --no-pager
```

验证主库配置：

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'gtid_mode';
```

查看 binlog 状态：

```sql
SHOW BINARY LOGS;
SHOW MASTER STATUS;
```

> MySQL 8.0.26 以后部分文档开始使用 source/replica 术语，但 `SHOW MASTER STATUS` 在很多 8.0 环境仍然可用。生产环境以当前版本实际支持的语句为准。

## 创建复制账号

在主库执行：

```sql
CREATE USER 'repl'@'10.0.0.11' IDENTIFIED BY 'Repl_Strong_123!';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'10.0.0.11';
FLUSH PRIVILEGES;
```

如果后面要接多台从库，可以放宽到整个内网网段：

```sql
CREATE USER 'repl'@'10.0.0.%' IDENTIFIED BY 'Repl_Strong_123!';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'10.0.0.%';
FLUSH PRIVILEGES;
```

生产更推荐精确到从库私网 IP。复制账号只给复制权限，不要给 `ALL PRIVILEGES`。

测试从库能否连接主库：

```bash
mysql -h10.0.0.10 -P3306 -urepl -p
```

如果连接失败，优先检查：

- 主库安全组是否允许从库私网 IP 访问 `3306`。
- 主库 `bind-address` 是否监听外部地址。
- 复制账号 host 是否匹配。
- 密码是否正确。

## 从库配置

从库示例 IP：`10.0.0.11`。

先确认从库私网 IP：

```bash
ip addr show
```

编辑配置文件：

```bash
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

加入或调整：

```ini
[mysqld]
server-id=2
bind-address=10.0.0.11

relay_log=mysql-relay-bin
read_only=ON
super_read_only=ON

gtid_mode=ON
enforce_gtid_consistency=ON

log_replica_updates=ON
binlog_format=ROW

character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
```

说明：

- `server-id` 不能和主库重复。
- `read_only=ON` 防止普通账号误写从库。
- `super_read_only=ON` 可以进一步限制具备高级权限的账号误写。
- `log_replica_updates=ON` 表示从库重放的事务也写入自己的 binlog，后续做级联复制或故障切换更方便。

重启：

```bash
sudo systemctl restart mysql
sudo systemctl status mysql --no-pager
```

验证：

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'read_only';
SHOW VARIABLES LIKE 'super_read_only';
SHOW VARIABLES LIKE 'gtid_mode';
```

### MySQL 5.7 配置兼容

如果安装的是 MySQL 5.7，不要原样复制所有 8.0 参数，需要做这些替换：

| MySQL 8.0 参数 | MySQL 5.7 写法 | 说明 |
| --- | --- | --- |
| `binlog_expire_logs_seconds=604800` | `expire_logs_days=7` | binlog 保留时间 |
| `log_replica_updates=ON` | `log_slave_updates=ON` | 从库重放事务写入自己的 binlog |
| `collation-server=utf8mb4_0900_ai_ci` | `collation-server=utf8mb4_unicode_ci` | 5.7 不支持 8.0 的 `0900` 排序规则 |

MySQL 5.7 的启动、停止、状态命令也使用旧术语，例如 `START SLAVE`、`SHOW SLAVE STATUS\G`。如果只是新环境练习，优先使用 MySQL 8.0，少踩一些旧版本兼容坑。

## 初始化数据

### 场景一：主库是空库

如果两台机器都是刚安装好的空库，可以直接配置 GTID 复制，不需要先导入备份。

跳到“配置复制源”即可。

### 场景二：主库已有数据

如果主库已经有业务数据，必须先把主库某个一致性时间点的数据导入从库，再从这个时间点之后继续追 binlog。

在主库执行备份：

```bash
sudo mysqldump \
  --all-databases \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=ON \
  --source-data=2 \
  > /tmp/mysql-full.sql
```

MySQL 8.0.25 及更早版本，使用：

```bash
sudo mysqldump \
  --all-databases \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=ON \
  --master-data=2 \
  > /tmp/mysql-full.sql
```

参数说明：

- `--single-transaction`：对 InnoDB 表做一致性快照，减少锁表影响。
- `--routines`：导出存储过程和函数。
- `--triggers`：导出触发器。
- `--events`：导出事件。
- `--set-gtid-purged=ON`：把主库已执行 GTID 写入备份文件，用于从库追 GTID。
- `--source-data=2` / `--master-data=2`：把备份时间点的 binlog 位点写入备份文件注释中，便于排查和回退到位点复制。

拷贝到从库：

```bash
scp /tmp/mysql-full.sql root@10.0.0.11:/tmp/
```

在从库导入：

```bash
sudo mysql -e "SET GLOBAL super_read_only=OFF; SET GLOBAL read_only=OFF;"
sudo mysql < /tmp/mysql-full.sql
sudo mysql -e "SET GLOBAL read_only=ON; SET GLOBAL super_read_only=ON;"
```

导入前确认从库是干净实例。如果从库已有测试数据，建议先重建从库或清空后再导入，避免 `GTID_PURGED` 和已有数据冲突。这里临时关闭只读，是为了允许初始化数据导入；导入完成后要立刻恢复只读。

## 配置复制源

在从库执行。

MySQL 8.0.23+：

```sql
STOP REPLICA;

CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='10.0.0.10',
  SOURCE_PORT=3306,
  SOURCE_USER='repl',
  SOURCE_PASSWORD='Repl_Strong_123!',
  SOURCE_AUTO_POSITION=1,
  GET_SOURCE_PUBLIC_KEY=1;

START REPLICA;
```

说明：

- `SOURCE_AUTO_POSITION=1` 表示使用 GTID 自动定位，不再手动填写 binlog 文件和 position。
- `GET_SOURCE_PUBLIC_KEY=1` 用于 MySQL 8 默认 `caching_sha2_password` 在非 SSL 连接下交换公钥。生产环境更推荐配置 TLS 复制。

MySQL 5.7 或旧版本：

```sql
STOP SLAVE;

CHANGE MASTER TO
  MASTER_HOST='10.0.0.10',
  MASTER_PORT=3306,
  MASTER_USER='repl',
  MASTER_PASSWORD='Repl_Strong_123!',
  MASTER_AUTO_POSITION=1;

START SLAVE;
```

## 查看复制状态

MySQL 8.0：

```sql
SHOW REPLICA STATUS\G
```

MySQL 5.7：

```sql
SHOW SLAVE STATUS\G
```

重点看：

```text
Replica_IO_Running: Yes
Replica_SQL_Running: Yes
Seconds_Behind_Source: 0
Last_IO_Error:
Last_SQL_Error:
```

旧版本字段名可能是：

```text
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
Seconds_Behind_Master: 0
Last_IO_Error:
Last_SQL_Error:
```

两个线程都为 `Yes`，并且错误字段为空，说明复制链路正常。

## 验证复制

在主库执行：

```sql
CREATE DATABASE repl_test;
USE repl_test;

CREATE TABLE t_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_user(name) VALUES ('source-write-001');
```

在从库查询：

```sql
SELECT * FROM repl_test.t_user;
```

如果能看到 `source-write-001`，说明复制成功。

继续测试更新和删除：

```sql
UPDATE repl_test.t_user SET name = 'source-update-001' WHERE id = 1;
DELETE FROM repl_test.t_user WHERE id = 1;
```

从库再次查询确认变化是否同步。

## 常用运维命令

查看主库 binlog：

```sql
SHOW BINARY LOGS;
SHOW MASTER STATUS;
```

查看从库复制状态：

```sql
SHOW REPLICA STATUS\G
```

停止复制：

```sql
STOP REPLICA;
```

启动复制：

```sql
START REPLICA;
```

重置复制配置，谨慎执行：

```sql
STOP REPLICA;
RESET REPLICA ALL;
```

查看 GTID：

```sql
SHOW VARIABLES LIKE 'gtid_mode';
SHOW GLOBAL VARIABLES LIKE 'gtid_executed';
SHOW GLOBAL VARIABLES LIKE 'gtid_purged';
```

查看复制线程：

```sql
SHOW PROCESSLIST;
```

## 主从延迟

查看：

```sql
SHOW REPLICA STATUS\G
```

重点看：

```text
Seconds_Behind_Source
```

旧版本字段：

```text
Seconds_Behind_Master
```

常见原因：

- 主库写入压力大。
- 大事务，例如一次删除或更新几百万行。
- 从库 SQL 线程重放慢。
- 从库硬件性能弱于主库。
- 从库上跑了复杂查询，抢占 IO 或 CPU。
- 网络抖动或跨地域复制。

优化方向：

- 避免大事务，批量更新按主键分页分批执行。
- 从库避免跑超大报表 SQL。
- 主从机器规格不要差距过大。
- 开启并行复制，结合业务测试效果。
- 强一致读走主库，不能无脑读从库。

MySQL 8.0 可参考配置：

```ini
[mysqld]
replica_parallel_workers=4
replica_parallel_type=LOGICAL_CLOCK
```

MySQL 5.7 对应旧参数：

```ini
[mysqld]
slave_parallel_workers=4
slave_parallel_type=LOGICAL_CLOCK
```

## 常见故障排查

### IO 线程不是 Yes

表现：

```text
Replica_IO_Running: No
```

常见原因：

- 主库 IP、端口写错。
- 主库安全组没有放通 `3306`。
- 主库 `bind-address` 只监听 `127.0.0.1`。
- 复制账号 host 不匹配。
- 复制账号密码错误。
- 主库没有开启 binlog。

排查：

```bash
ping 10.0.0.10
nc -vz 10.0.0.10 3306
mysql -h10.0.0.10 -P3306 -urepl -p
```

查看错误：

```sql
SHOW REPLICA STATUS\G
```

关注：

```text
Last_IO_Error
```

### SQL 线程不是 Yes

表现：

```text
Replica_SQL_Running: No
```

常见原因：

- 从库被手工写入过，和主库数据不一致。
- 主库执行了从库无法重放的 SQL。
- 表结构不一致。
- 主键冲突或数据缺失。

排查：

```sql
SHOW REPLICA STATUS\G
```

关注：

```text
Last_SQL_Error
```

不要上来就配置跳过错误。跳过错误可能让复制恢复为 `Yes`，但数据已经不一致。正确流程是先判断错误类型，再决定修数据、重建从库，或在明确风险后跳过单个事务。

### 认证失败

常见错误：

```text
Access denied for user 'repl'
Authentication plugin 'caching_sha2_password' reported error
```

处理：

```sql
SHOW GRANTS FOR 'repl'@'10.0.0.%';
```

MySQL 8 如果没有配置 SSL，可以在 `CHANGE REPLICATION SOURCE TO` 中加：

```sql
GET_SOURCE_PUBLIC_KEY=1
```

或者创建复制账号时使用兼容认证插件：

```sql
CREATE USER 'repl'@'10.0.0.%'
  IDENTIFIED WITH mysql_native_password BY 'Repl_Strong_123!';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'10.0.0.%';
```

生产环境更推荐配置 TLS 复制，而不是长期明文传输密码和复制流量。

### 主库 binlog 被清理

如果主库 binlog 已经清理，而从库还没追到对应 GTID，复制会启动失败。

表现可能类似：

```text
The source has purged binary logs containing GTIDs that the replica requires
```

处理方式通常是重新从主库做全量备份，再重建从库。

## 重建从库流程

当从库数据已经不可信、复制错误难以修复、binlog 被清理，或者你练习时操作乱了，最稳的方式是重建从库。

流程：

```text
1. 从库停止复制
2. 清理或重建从库实例
3. 主库重新导出一致性备份
4. 拷贝备份到从库
5. 从库导入备份
6. 重新配置 GTID 复制源
7. 启动复制并检查状态
8. 做增删改验证
```

从库停止并清理复制配置：

```sql
STOP REPLICA;
RESET REPLICA ALL;
```

如果只是练习环境，最省心的做法是直接重装从库 MySQL 或重新创建云服务器。生产环境不要随便删库，需要先确认备份、业务影响和回滚方案。

## 上线前检查清单

- 主从都使用私网 IP 通信。
- 安全组只允许必要来源访问 `22` 和 `3306`。
- 主库 `log_bin`、`gtid_mode`、`enforce_gtid_consistency` 已开启。
- 主库和从库 `server-id` 不重复。
- 从库开启 `read_only` 和 `super_read_only`。
- 复制账号只授予 `REPLICATION SLAVE`。
- `SHOW REPLICA STATUS\G` 中 IO 和 SQL 线程都是 `Yes`。
- `Last_IO_Error` 和 `Last_SQL_Error` 为空。
- 已在主库做插入、更新、删除测试，并在从库验证同步。
- 已验证备份文件能在测试库恢复。
- 已确认云硬盘、快照、弹性公网 IP 的计费规则。

## 生产建议

- 主从复制走私网，不要把 MySQL 暴露到公网。
- 主库必须开启 binlog，并合理设置保留时间。
- 从库开启 `read_only` 和 `super_read_only`，避免误写。
- 复制账号只授予复制权限，不要给 `ALL PRIVILEGES`。
- 默认使用 `binlog_format=ROW`。
- 不要长期配置 `slave_skip_errors` / `replica_skip_errors`。
- 定期监控复制线程、复制延迟、磁盘空间、binlog 保留时间。
- 备份和恢复要定期演练。
- 主从不是备份的替代品，误删数据会同步到从库。
- 故障切换前要确认从库是否追平、是否有数据丢失、应用连接如何切换。
- 云上按量练习结束后及时销毁 CVM、云硬盘、快照和弹性公网 IP，避免继续计费。

## 主从和备份的关系

主从复制不能替代备份。

```text
主库误删数据
  -> binlog 记录 DELETE
  -> 从库重放 DELETE
  -> 从库也删除
```

所以仍然需要：

- 定期全量备份。
- 保留足够时间的 binlog。
- 定期恢复演练。
- 关键操作前做备份或快照。

## 参考资料

- [MySQL 8.0 CHANGE REPLICATION SOURCE TO](https://dev.mysql.com/doc/refman/8.0/en/change-replication-source-to.html)
- [MySQL 8.0 使用 GTID 搭建复制](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids-howto.html)
- [mysqldump 官方参数说明](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
