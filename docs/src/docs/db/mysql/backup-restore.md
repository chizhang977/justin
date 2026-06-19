---
title: 备份与恢复演练
---

# 备份与恢复演练

数据库备份不是“有一个 dump 文件”就结束了。真正可靠的备份必须能恢复，必须知道恢复到哪里、恢复需要多久、恢复后如何验证数据。

## 备份类型

| 类型 | 说明 | 常见工具 |
| --- | --- | --- |
| 逻辑备份 | 导出 SQL 语句 | `mysqldump` |
| 物理备份 | 复制数据库物理文件 | Percona XtraBackup、文件系统快照 |
| 全量备份 | 备份全部数据 | `mysqldump --all-databases` |
| 增量备份 | 只备份变化部分 | binlog、增量备份工具 |

小型项目可以先掌握 `mysqldump + binlog`。数据量大后，再考虑物理备份和专业备份系统。

## mysqldump 备份

备份单库：

```bash
mysqldump -uroot -p --single-transaction --routines --triggers justin_study > justin_study.sql
```

备份所有库：

```bash
mysqldump -uroot -p --all-databases --single-transaction --routines --triggers > all.sql
```

常用参数：

| 参数 | 作用 |
| --- | --- |
| `--single-transaction` | InnoDB 下开启一致性快照，减少锁表 |
| `--routines` | 导出存储过程和函数 |
| `--triggers` | 导出触发器 |
| `--master-data=2` | 记录 binlog 位点，常用于主从或恢复 |
| `--databases` | 指定多个库 |

备份文件压缩：

```bash
mysqldump -uroot -p --single-transaction justin_study | gzip > justin_study.sql.gz
```

## 恢复备份

恢复 SQL 文件：

```bash
mysql -uroot -p justin_study < justin_study.sql
```

恢复压缩文件：

```bash
gunzip < justin_study.sql.gz | mysql -uroot -p justin_study
```

恢复前建议：

1. 确认目标库是否正确。
2. 确认备份文件大小和生成时间。
3. 在测试库先恢复验证。
4. 生产恢复前暂停相关写入或进入维护窗口。

## 备份演练

创建演练库：

```sql
CREATE DATABASE backup_lab DEFAULT CHARSET utf8mb4;
USE backup_lab;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username) VALUES ('justin'), ('alice'), ('bob');
```

备份：

```bash
mysqldump -uroot -p --single-transaction backup_lab > backup_lab.sql
```

模拟误删：

```sql
DROP DATABASE backup_lab;
```

恢复：

```bash
mysql -uroot -p < backup_lab.sql
```

验证：

```sql
USE backup_lab;
SELECT * FROM users;
```

如果恢复后数据完整，说明这次备份文件可用。

## binlog

binlog 记录数据库变更，可以用于主从复制，也可以用于按时间点恢复。

查看是否开启：

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
```

推荐格式：

```ini
binlog_format=ROW
```

查看 binlog 文件：

```sql
SHOW BINARY LOGS;
SHOW MASTER STATUS;
```

查看 binlog 内容：

```bash
mysqlbinlog mysql-bin.000001
```

## 恢复到指定时间点

假设：

- 凌晨 02:00 做了全量备份。
- 上午 10:30 误删数据。
- 需要恢复到 10:29。

流程：

1. 找一台临时 MySQL 实例。
2. 恢复 02:00 全量备份。
3. 使用 binlog 重放 02:00 到 10:29 的变更。
4. 验证数据。
5. 导出需要恢复的数据或切换实例。

示例：

```bash
mysqlbinlog \
  --start-datetime="2026-06-20 02:00:00" \
  --stop-datetime="2026-06-20 10:29:00" \
  mysql-bin.000001 | mysql -uroot -p
```

注意：不要直接在原生产库上尝试恢复，应该先恢复到临时库验证。

## 定时备份脚本

示例：

```bash
#!/usr/bin/env bash
set -e

BACKUP_DIR=/data/backup/mysql
DB_NAME=justin_study
DATE=$(date +%F_%H%M%S)

mkdir -p "$BACKUP_DIR"

mysqldump -uroot -p'password' \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
```

生产注意：

- 密码不要明文写在脚本中，可以使用配置文件或安全变量。
- 备份目录要有权限控制。
- 备份要复制到异机或对象存储，不能只放在数据库本机。
- 删除旧备份前确认保留策略。

## 备份检查清单

- 是否每天自动备份。
- 是否保留足够天数。
- 是否异地保存。
- 是否监控备份失败。
- 是否定期恢复演练。
- 是否记录恢复步骤。
- 是否知道恢复一个库大概需要多久。

## 常见问题

### 备份文件很小

可能原因：

- 备份命令失败。
- 账号权限不足。
- 备份的是空库。
- 管道压缩出错。

应检查命令退出码和备份日志。

### 恢复很慢

可能原因：

- 数据量大。
- 目标机器性能弱。
- 有大量索引需要维护。
- binlog 重放时间长。

恢复时间也是系统可用性的一部分，必须通过演练得到真实数据。
