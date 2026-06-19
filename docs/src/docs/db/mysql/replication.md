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

| 角色 | IP | 端口 |
| --- | --- | --- |
| master | 192.168.56.10 | 3306 |
| slave | 192.168.56.11 | 3306 |

两台机器需要：

- MySQL 版本尽量一致。
- 网络互通。
- server_id 不同。
- 主库开启 binlog。
- 从库能访问主库。

## 主库配置

编辑 MySQL 配置文件：

```ini
[mysqld]
server-id=1
log-bin=mysql-bin
binlog_format=ROW
```

重启 MySQL：

```bash
systemctl restart mysqld
```

创建复制账号：

```sql
CREATE USER 'repl'@'192.168.56.%' IDENTIFIED BY 'repl_password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'192.168.56.%';
FLUSH PRIVILEGES;
```

查看主库状态：

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

编辑配置：

```ini
[mysqld]
server-id=2
read_only=ON
```

重启：

```bash
systemctl restart mysqld
```

配置主库信息：

```sql
CHANGE MASTER TO
  MASTER_HOST='192.168.56.10',
  MASTER_PORT=3306,
  MASTER_USER='repl',
  MASTER_PASSWORD='repl_password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;
```

MySQL 8.0.23 以后也可以使用 `CHANGE REPLICATION SOURCE TO`，语义更清晰。

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
