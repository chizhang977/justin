---
title: mysql备份恢复
---

# MySQL 备份恢复学习与工作手册

> 来源基础：本地资料 `MySQL备份恢复.pdf`。原资料环境是 CentOS 7.9 + MySQL 5.7.36，本文在保留原文主线的基础上，补充了 MySQL 8.x / Percona XtraBackup 的常见差异。
>
> 版本提醒：截至 2026-07-20，Percona XtraBackup 8.0 官方文档已提示 8.0 在 2026-06 EOL。新环境优先使用与数据库大版本匹配的 XtraBackup 8.4；如果公司仍是 MySQL 8.0，则按兼容版本使用 XtraBackup 8.0，并规划升级。

本文目标不是背命令，而是形成一套能在工作中使用的思路：

* 知道什么时候用 `mysqldump + mysqlbinlog`。
* 知道什么时候用 XtraBackup。
* 知道备份文件是否真的可用。
* 遇到误删库、误删表、误更新、数据目录损坏时，能判断恢复路径。
* 能看懂 `--single-transaction`、`--master-data` / `--source-data`、`--apply-log`、`--redo-only` / `--apply-log-only`、`--copy-back` 这些参数的意义。

## 0. 先纠正几个容易混淆的概念

### 0.1 冷备份、热备份、逻辑备份、物理备份不是同一个分类


| 维度       | 类型     | 含义                      | 典型方式                                      |
| ---------- | -------- | ------------------------- | --------------------------------------------- |
| 按是否停库 | 冷备份   | 停止 MySQL 后拷贝数据目录 | `systemctl stop mysqld`后拷贝`/var/lib/mysql` |
| 按是否停库 | 热备份   | MySQL 运行中备份          | `mysqldump --single-transaction`、XtraBackup  |
| 按备份内容 | 逻辑备份 | 导出 SQL 语句             | `mysqldump`                                   |
| 按备份内容 | 物理备份 | 复制数据库底层数据文件    | XtraBackup、停库拷贝数据目录                  |

注意：

* `mysqldump + mysqlbinlog` **不是冷备份**。
* `mysqldump` 是逻辑备份，InnoDB 表配合 `--single-transaction` 可以在线做一致性备份。
* XtraBackup 是物理热备，适合大库和恢复时间要求更高的场景。

### 0.2 主从复制不是备份

主从复制依赖 binlog 同步数据，常用于读写分离、高可用切换、灾备基础架构。

但是主库执行了：

```
DROP DATABASE prod;
```

这个误操作也会同步到从库。从库不是天然备份，除非你有延迟从库、快照、binlog、全量备份等额外措施。

## 1. 工作中先判断：我应该用哪种方案

### 1.1 选择建议


| 场景                             | 推荐方案                  | 原因                                     |
| -------------------------------- | ------------------------- | ---------------------------------------- |
| 小库、几十 GB 以内、恢复时间不紧 | `mysqldump + mysqlbinlog` | 简单、可读、容易迁移、恢复逻辑清楚       |
| 大库、几百 GB 或 TB、要求恢复快  | XtraBackup                | 物理备份恢复更快，备份过程对业务影响较小 |
| 临时迁移一张表或一个库           | `mysqldump`               | 导出的 SQL 可以人工检查和编辑            |
| 误删数据，需要恢复到指定时间点   | 全量备份 + binlog         | binlog 可以按时间或 position 回放        |
| 整个数据目录损坏，需要尽快恢复   | XtraBackup                | 物理恢复比执行大量 SQL 更快              |
| 测试环境快速复制生产少量数据     | `mysqldump`               | 灵活、可控、成本低                       |

### 1.2 工作前必须确认的 4 个问题

* [ ]  备份对象是什么：全实例、单库、单表，还是部分数据？
* [ ]  恢复目标是什么：恢复到最新、恢复到误操作前、还是恢复到某个时间点？
* [ ]  允许停机多久：决定能不能停库、能不能做物理恢复。
* [ ]  最近一次全量备份和 binlog 是否完整：决定能不能做增量恢复。

## 2. 方案一：mysqldump + mysqlbinlog

### 2.1 核心理解

`mysqldump + mysqlbinlog` 可以拆成两句话：

```
mysqldump 负责恢复到全量备份那一刻。
mysqlbinlog 负责把全量备份之后的变化补回来。
```

全量备份：

```
2026-07-20 02:00:00 做了一次 mysqldump
```

之后业务继续写入：

```
02:00 到 10:00 的 INSERT / UPDATE / DELETE 都在 binlog 里
```

如果 10:00 出现误删：

```
先恢复 02:00 的全量备份
再用 mysqlbinlog 回放 02:00 到 09:59:59 的 binlog
```

这就是 PITR，Point In Time Recovery，按时间点恢复。

## 2.2 前置检查

### 2.2.1 确认 MySQL 版本

```
mysql -uroot -p -e "SELECT VERSION();"
```

### 2.2.2 确认是否开启 binlog

```
mysql -uroot -p -e "SHOW VARIABLES LIKE 'log_bin';"
mysql -uroot -p -e "SHOW VARIABLES LIKE 'log_bin_basename';"
mysql -uroot -p -e "SHOW BINARY LOGS;"
```

预期：

```
log_bin = ON
```

如果是 `OFF`，只能做普通全量恢复，不能做全量之后的增量恢复。

### 2.2.3 查看当前 binlog 位置

MySQL 5.7 常用：

```
SHOW MASTER STATUS;
```

MySQL 8 新版本也可能使用：

```
SHOW BINARY LOG STATUS;
```

你要关注两列：

```
File: mysql-bin.000003
Position: 154
```

它表示“从哪个 binlog 文件、哪个 position 开始记录后续变化”。

## 2.3 开启 binlog 的配置参考

Linux 原生安装常见位置：

```
/etc/my.cnf
/etc/mysql/mysql.conf.d/mysqld.cnf
```

配置示例：

```
[mysqld]
server-id=1
log-bin=mysql-bin
binlog_format=ROW
expire_logs_days=7
max_binlog_size=100M
```

MySQL 8 更推荐：

```
[mysqld]
server-id=1
log-bin=mysql-bin
binlog_format=ROW
binlog_expire_logs_seconds=604800
max_binlog_size=100M
```

说明：


| 配置                         | 作用                                          |
| ---------------------------- | --------------------------------------------- |
| `server-id`                  | MySQL 实例唯一 ID，主从复制和 binlog 场景常用 |
| `log-bin`                    | 开启二进制日志                                |
| `binlog_format=ROW`          | 记录行级变化，恢复更准确                      |
| `expire_logs_days`           | MySQL 5.7 常见 binlog 保留配置                |
| `binlog_expire_logs_seconds` | MySQL 8 推荐的 binlog 保留配置                |
| `max_binlog_size`            | 单个 binlog 文件最大大小，到达后自动滚动      |

修改后通常需要重启 MySQL：

```
systemctl restart mysqld
```

## 2.4 mysqldump 全量备份

### 2.4.1 MySQL 5.7 写法

这是 PDF 中使用的主线写法：

```
mkdir -p /data/backup/mysql/full

mysqldump -uroot -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --master-data=2 \
  --set-gtid-purged=OFF \
  --all-databases \
  | gzip > /data/backup/mysql/full/full_$(date +%F_%H%M%S).sql.gz
```

### 2.4.2 MySQL 8 推荐写法

MySQL 新版本中，`--master-data` 已逐渐被 `--source-data` 替代。

```
mkdir -p /data/backup/mysql/full

mysqldump -uroot -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --source-data=2 \
  --set-gtid-purged=OFF \
  --all-databases \
  | gzip > /data/backup/mysql/full/full_$(date +%F_%H%M%S).sql.gz
```

如果你的 MySQL 客户端不支持 `--source-data`，就退回使用：

```
--master-data=2
```

### 2.4.3 参数解释


| 参数                    | 作用                                     | 要点                              |
| ----------------------- | ---------------------------------------- | --------------------------------- |
| `--single-transaction`  | 开启一致性读                             | 适合 InnoDB，备份期间不长时间锁表 |
| `--routines`            | 备份存储过程和函数                       | 工作中建议加                      |
| `--triggers`            | 备份触发器                               | 工作中建议加                      |
| `--events`              | 备份事件调度器                           | 如果库中有 event 必须加           |
| `--master-data=2`       | 把 binlog 文件和 position 写入 dump 注释 | MySQL 5.7 常见                    |
| `--source-data=2`       | 新版本替代`--master-data`                | MySQL 8 新写法                    |
| `--set-gtid-purged=OFF` | 避免导入时写 GTID 信息                   | 不熟 GTID 时更稳                  |
| `--all-databases`       | 备份所有数据库                           | 全实例恢复用                      |
| `--databases db1 db2`   | 备份指定库                               | 迁移或局部恢复用                  |

注意：

* `--single-transaction` 只保证 InnoDB 表一致。
* 备份期间尽量避免 DDL，例如 `ALTER TABLE`、`DROP TABLE`、`TRUNCATE TABLE`。
* `mysqldump` 是逻辑备份，恢复时要重新执行 SQL，大库恢复会慢。

## 2.5 检查全量备份是否有效

### 2.5.1 检查文件大小

```
ls -lh /data/backup/mysql/full/
```

异常情况：

```
文件只有几 KB，可能备份失败或者只导出了错误信息。
```

### 2.5.2 检查 gzip 是否损坏

```
gzip -t /data/backup/mysql/full/full_2026-07-20_020000.sql.gz
echo $?
```

返回 `0` 表示压缩包结构正常。

### 2.5.3 查看备份中的 binlog 坐标

MySQL 5.7：

```
zcat /data/backup/mysql/full/full_2026-07-20_020000.sql.gz \
  | grep -m 1 "CHANGE MASTER TO"
```

MySQL 8：

```
zcat /data/backup/mysql/full/full_2026-07-20_020000.sql.gz \
  | grep -m 1 -E "CHANGE MASTER TO|CHANGE REPLICATION SOURCE TO"
```

你可能看到：

```
-- CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000003', MASTER_LOG_POS=154;
```

这说明：

```
全量备份恢复后，要从 mysql-bin.000003 的 154 位置开始继续回放 binlog。
```

## 2.6 binlog 增量备份

### 2.6.1 为什么需要 flush logs

`FLUSH LOGS` 或 `mysqladmin flush-logs` 会让 MySQL 关闭当前 binlog，并打开一个新的 binlog。

比如原来正在写：

```
mysql-bin.000003
```

执行刷新后：

```
mysql-bin.000003 变成已关闭文件
mysql-bin.000004 成为当前正在写入的文件
```

工作中备份 binlog 时，一般复制已经关闭的 binlog 文件，避免复制一个仍在写入的文件。

### 2.6.2 刷新 binlog

```
mysqladmin -uroot -p flush-logs
```

### 2.6.3 查看所有 binlog

```
mysql -uroot -p -e "SHOW BINARY LOGS;"
```

### 2.6.4 备份 binlog 文件

假设 binlog 在 `/var/lib/mysql/mysql-bin.00000*`：

```
mkdir -p /data/backup/mysql/binlog/$(date +%F)

cp -a /var/lib/mysql/mysql-bin.00000* /data/backup/mysql/binlog/$(date +%F)/
cp -a /var/lib/mysql/mysql-bin.index /data/backup/mysql/binlog/$(date +%F)/
```

更稳的做法：

* 先 `flush-logs`。
* 复制除了当前正在写入的最新 binlog 之外的文件。
* 保留 `mysql-bin.index`。
* 备份后同步到远端/NFS/对象存储。

## 2.7 恢复场景一：只恢复全量备份

适用场景：

```
只需要恢复到全量备份那一刻。
```

操作：

```
gunzip -c /data/backup/mysql/full/full_2026-07-20_020000.sql.gz \
  | mysql -uroot -p
```

验证：

```
mysql -uroot -p -e "SHOW DATABASES;"
mysql -uroot -p -e "SELECT COUNT(*) FROM db_name.table_name;"
```

## 2.8 恢复场景二：全量 + binlog 恢复到最新

适用场景：

```
全量备份之后的数据也要恢复。
```

步骤：

1. 恢复全量备份。
2. 找到全量备份里的 binlog 文件和 position。
3. 从该 position 开始回放后续 binlog。

示例：

```
mysqlbinlog --no-defaults \
  --start-position=154 \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000003 \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000004 \
  | mysql -uroot -p
```

如果 binlog 中有特殊二进制字符，MySQL 官方建议导入时加 `--binary-mode`：

```
mysqlbinlog --no-defaults \
  --start-position=154 \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000003 \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000004 \
  | mysql --binary-mode -uroot -p
```

## 2.9 恢复场景三：恢复到误操作之前

假设：

```
02:00 做了全量备份
10:15 执行了误删
目标：恢复到 10:14:59
```

先恢复全量：

```
gunzip -c /data/backup/mysql/full/full_2026-07-20_020000.sql.gz \
  | mysql -uroot -p
```

再按时间回放 binlog：

```
mysqlbinlog --no-defaults \
  --start-datetime="2026-07-20 02:00:00" \
  --stop-datetime="2026-07-20 10:14:59" \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000003 \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000004 \
  | mysql -uroot -p
```

也可以按 position：

```
mysqlbinlog --no-defaults \
  --start-position=154 \
  --stop-position=987654 \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000003 \
  | mysql -uroot -p
```

### 2.9.1 怎么找误操作的时间或 position

先只看 binlog，不导入：

```
mysqlbinlog --no-defaults \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000003 \
  | less
```

搜索关键字：

```
DROP
DELETE
TRUNCATE
UPDATE
表名
数据库名
```

如果是 ROW 格式，看起来不一定是原始 SQL，可以加：

```
mysqlbinlog --no-defaults -vv \
  /data/backup/mysql/binlog/2026-07-20/mysql-bin.000003 \
  | less
```

## 2.10 恢复前后的工作检查清单

恢复前：

* [ ]  确认这次是恢复全实例、单库还是单表。
* [ ]  备份现有现场，避免二次破坏。
* [ ]  找到最近一次可用全量备份。
* [ ]  找到对应的 binlog 文件。
* [ ]  明确恢复终点：最新、指定时间、指定 position。
* [ ]  在测试库先演练一遍。
* [ ]  记录所有命令和时间点。

恢复后：

* [ ]  `SHOW DATABASES;`
* [ ]  核心表 `COUNT(*)` 是否符合预期。
* [ ]  抽查关键业务数据。
* [ ]  应用能否连接数据库。
* [ ]  慢查询、错误日志是否异常。
* [ ]  备份恢复过程是否写入复盘记录。

## 2.11 mysqldump 备份脚本模板

文件名建议：

```
/data/scripts/mysql_full_backup.sh
```

脚本：

```
#!/usr/bin/env bash
set -euo pipefail

MYSQL_USER="root"
MYSQL_PASSWORD="你的密码"
BACKUP_ROOT="/data/backup/mysql/full"
RETENTION_DAYS=7
TIME="$(date +%F_%H%M%S)"
BACKUP_FILE="${BACKUP_ROOT}/full_${TIME}.sql.gz"
LOG_FILE="${BACKUP_ROOT}/backup_${TIME}.log"

mkdir -p "$BACKUP_ROOT"

echo "[$(date '+%F %T')] start full backup" >> "$LOG_FILE"

MYSQL_PWD="$MYSQL_PASSWORD" mysqldump -u"$MYSQL_USER" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --master-data=2 \
  --set-gtid-purged=OFF \
  --all-databases \
  | gzip > "$BACKUP_FILE"

gzip -t "$BACKUP_FILE"

find "$BACKUP_ROOT" -type f -name "full_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "[$(date '+%F %T')] full backup success: $BACKUP_FILE" >> "$LOG_FILE"
```

关键点：

* `set -o pipefail` 很重要，否则 `mysqldump | gzip` 中 `mysqldump` 失败时，脚本可能误判成功。
* 生产中不建议把密码明文写脚本，可以使用 `.my.cnf`、凭据管理或受限权限用户。
* 脚本生成备份后必须校验，不能只看文件存在。

## 2.12 binlog 备份脚本模板

文件名建议：

```
/data/scripts/mysql_binlog_backup.sh
```

脚本：

```
#!/usr/bin/env bash
set -euo pipefail

MYSQL_USER="root"
MYSQL_PASSWORD="你的密码"
MYSQL_DATA_DIR="/var/lib/mysql"
BINLOG_PREFIX="mysql-bin"
BACKUP_ROOT="/data/backup/mysql/binlog/$(date +%F)"
RETENTION_DAYS=14
LOG_FILE="/data/backup/mysql/binlog/binlog_backup_$(date +%F_%H%M%S).log"

mkdir -p "$BACKUP_ROOT"

echo "[$(date '+%F %T')] flush logs" >> "$LOG_FILE"
MYSQL_PWD="$MYSQL_PASSWORD" mysqladmin -u"$MYSQL_USER" flush-logs

CURRENT_BINLOG="$(MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER" -Nse 'SHOW MASTER STATUS' | awk '{print $1}')"

echo "[$(date '+%F %T')] current binlog: $CURRENT_BINLOG" >> "$LOG_FILE"

for file in "$MYSQL_DATA_DIR"/${BINLOG_PREFIX}.[0-9]*; do
  base="$(basename "$file")"
  if [[ "$base" != "$CURRENT_BINLOG" ]]; then
    cp -a "$file" "$BACKUP_ROOT/"
    echo "copied $base" >> "$LOG_FILE"
  fi
done

cp -a "$MYSQL_DATA_DIR/${BINLOG_PREFIX}.index" "$BACKUP_ROOT/" 2>/dev/null || true

find /data/backup/mysql/binlog -mindepth 1 -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} \;

echo "[$(date '+%F %T')] binlog backup success: $BACKUP_ROOT" >> "$LOG_FILE"
```

注意：

* 不要随便删除 MySQL 正在使用的 binlog。
* 如果设置了 MySQL 自动过期时间，要确保远端备份先完成，再让本地过期清理。
* 如果有主从复制，还要考虑从库是否还需要旧 binlog。

## 3. 方案二：XtraBackup

### 3.1 核心理解

XtraBackup 可以用一句话理解：

```
mysqldump 是把数据导成 SQL；XtraBackup 是把 MySQL 的物理数据文件复制出来。
```

它备份的不是 SQL，而是类似这些文件：

```
ibdata1
*.ibd
redo log
undo log
xtrabackup_checkpoints
xtrabackup_binlog_info
```

所以 XtraBackup 的恢复不是执行 SQL，而是：

```
准备备份目录 -> 停 MySQL -> 清空 datadir -> copy-back -> 修权限 -> 启动 MySQL
```

### 3.2 为什么 XtraBackup 备份后不能立刻直接用

备份时 MySQL 仍在运行，数据文件可能处在不同时间点：

```
table_a.ibd 是 10:00:01 拷贝的
table_b.ibd 是 10:00:05 拷贝的
redo log 还记录了 10:00:01 到 10:00:05 之间的变化
```

这些文件直接放回去，MySQL 可能认为数据不一致。

所以要先执行：

```
prepare / apply-log
```

作用是：

```
把 redo log 应用到数据文件，让备份目录变成一个一致的、可以启动的 MySQL 数据目录。
```

## 3.3 版本差异：innobackupex 和 xtrabackup


| MySQL 版本      | XtraBackup 版本        | 常见命令                                      |
| --------------- | ---------------------- | --------------------------------------------- |
| MySQL 5.6 / 5.7 | Percona XtraBackup 2.4 | `innobackupex`                                |
| MySQL 8.0       | Percona XtraBackup 8.0 | `xtrabackup`，旧环境可能仍在用，但 8.0 已 EOL |
| MySQL 8.4       | Percona XtraBackup 8.4 | `xtrabackup`，新环境优先                      |

本文本地 PDF 使用的是：

```
MySQL 5.7.36 + XtraBackup 2.4 + innobackupex
```

如果你当前是 MySQL 8，不要直接照抄 `innobackupex`，应该看 `xtrabackup` 写法。

## 3.4 XtraBackup 全量备份

### 3.4.1 MySQL 5.7 / PDF 写法

```
mkdir -p /data/backup/xtrabackup/full

innobackupex \
  --defaults-file=/etc/my.cnf \
  --user=root \
  --password=你的密码 \
  /data/backup/xtrabackup/full
```

成功标志：

```
completed OK!
```

备份目录里常见文件：

```
xtrabackup_checkpoints
xtrabackup_info
xtrabackup_binlog_info
xtrabackup_logfile
```

### 3.4.2 MySQL 8.x / 推荐写法

```
mkdir -p /data/backup/xtrabackup/full/base

xtrabackup \
  --backup \
  --target-dir=/data/backup/xtrabackup/full/base \
  --user=root \
  --password=你的密码
```

成功标志：

```
completed OK!
```

## 3.5 XtraBackup 全量恢复

### 3.5.1 MySQL 5.7 / PDF 写法

第一步，prepare：

```
innobackupex \
  --defaults-file=/etc/my.cnf \
  --user=root \
  --password=你的密码 \
  --apply-log \
  /data/backup/xtrabackup/full/2026-07-20_020000/
```

第二步，停止 MySQL：

```
systemctl stop mysqld
```

第三步，清空数据目录。更稳的做法是先移动，不是直接删除：

```
mkdir -p /data/mysql_old_$(date +%F_%H%M%S)
mv /var/lib/mysql/* /data/mysql_old_$(date +%F_%H%M%S)/
```

第四步，copy-back：

```
innobackupex \
  --defaults-file=/etc/my.cnf \
  --user=root \
  --password=你的密码 \
  --copy-back \
  /data/backup/xtrabackup/full/2026-07-20_020000/
```

第五步，修权限：

```
chown -R mysql:mysql /var/lib/mysql
```

第六步，启动并验证：

```
systemctl start mysqld
mysql -uroot -p -e "SHOW DATABASES;"
```

### 3.5.2 MySQL 8.x / 推荐写法

第一步，prepare：

```
xtrabackup \
  --prepare \
  --target-dir=/data/backup/xtrabackup/full/base
```

第二步，停止 MySQL：

```
systemctl stop mysqld
```

第三步，清空数据目录：

```
mkdir -p /data/mysql_old_$(date +%F_%H%M%S)
mv /var/lib/mysql/* /data/mysql_old_$(date +%F_%H%M%S)/
```

第四步，copy-back：

```
xtrabackup \
  --copy-back \
  --target-dir=/data/backup/xtrabackup/full/base
```

第五步，修权限并启动：

```
chown -R mysql:mysql /var/lib/mysql
systemctl start mysqld
```

## 3.6 XtraBackup 增量备份

### 3.6.1 增量备份靠什么判断变化

XtraBackup 增量备份依赖 LSN，Log Sequence Number。

你可以把 LSN 理解成 InnoDB 的日志进度号：

```
全量备份到 LSN=5867760
第一次增量从 LSN=5867760 开始，到 LSN=5870345
第二次增量从 LSN=5870345 开始，到 LSN=5880000
```

每个备份目录里都有：

```
xtrabackup_checkpoints
```

查看：

```
cat /data/backup/xtrabackup/full/base/xtrabackup_checkpoints
cat /data/backup/xtrabackup/inc/inc1/xtrabackup_checkpoints
```

你要关注：

```
backup_type
from_lsn
to_lsn
last_lsn
```

### 3.6.2 第一次增量备份

基于全量备份：

```
xtrabackup \
  --backup \
  --target-dir=/data/backup/xtrabackup/inc/inc1 \
  --incremental-basedir=/data/backup/xtrabackup/full/base \
  --user=root \
  --password=你的密码
```

### 3.6.3 第二次增量备份

基于第一次增量备份：

```
xtrabackup \
  --backup \
  --target-dir=/data/backup/xtrabackup/inc/inc2 \
  --incremental-basedir=/data/backup/xtrabackup/inc/inc1 \
  --user=root \
  --password=你的密码
```

核心规则：

```
每次增量都要基于上一次备份，不一定永远基于全量。
```

## 3.7 XtraBackup 增量恢复

假设你有：

```
/data/backup/xtrabackup/full/base
/data/backup/xtrabackup/inc/inc1
/data/backup/xtrabackup/inc/inc2
```

恢复目标：

```
恢复到 inc2 的时间点
```

### 3.7.1 合并备份目录

第一步，prepare 全量，但不要做最终回滚：

```
xtrabackup \
  --prepare \
  --apply-log-only \
  --target-dir=/data/backup/xtrabackup/full/base
```

第二步，合并 inc1，也不要做最终回滚：

```
xtrabackup \
  --prepare \
  --apply-log-only \
  --target-dir=/data/backup/xtrabackup/full/base \
  --incremental-dir=/data/backup/xtrabackup/inc/inc1
```

第三步，合并最后一个增量 inc2，这次不加 `--apply-log-only`：

```
xtrabackup \
  --prepare \
  --target-dir=/data/backup/xtrabackup/full/base \
  --incremental-dir=/data/backup/xtrabackup/inc/inc2
```

注意：

```
最终可恢复的数据在 full/base 目录里，不是在 inc1 或 inc2 目录里。
```

### 3.7.2 为什么前面要加 --apply-log-only

普通 prepare 会做两件事：

```
1. redo：把已经提交的事务应用到数据文件
2. undo：回滚未提交的事务
```

增量恢复时，前面还有后续增量要继续合并。如果你过早回滚未提交事务，后面的增量可能就接不上。

所以：

```
不是最后一次合并：加 --apply-log-only
最后一次合并：不加 --apply-log-only
```

PDF 里的 `--redo-only` 和 MySQL 8 的 `--apply-log-only` 可以按这个关系理解：


| PDF / XtraBackup 2.4      | XtraBackup 8.0               | 含义                         |
| ------------------------- | ---------------------------- | ---------------------------- |
| `--apply-log --redo-only` | `--prepare --apply-log-only` | 只做 redo，不做最终 rollback |
| `--apply-log`             | `--prepare`                  | 做完整 prepare，备份可恢复   |
| `--copy-back`             | `--copy-back`                | 把准备好的备份复制回 datadir |

### 3.7.3 停库恢复

```
systemctl stop mysqld

mkdir -p /data/mysql_old_$(date +%F_%H%M%S)
mv /var/lib/mysql/* /data/mysql_old_$(date +%F_%H%M%S)/

xtrabackup \
  --copy-back \
  --target-dir=/data/backup/xtrabackup/full/base

chown -R mysql:mysql /var/lib/mysql
systemctl start mysqld
```

验证：

```
mysql -uroot -p -e "SHOW DATABASES;"
mysql -uroot -p -e "SELECT COUNT(*) FROM db_name.table_name;"
```

## 3.8 XtraBackup 常见问题


| 现象                      | 常见原因                                           | 处理                                                 |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| `completed OK!`没出现     | 备份失败                                           | 看完整日志，不要只看目录是否生成                     |
| restore 后 MySQL 启动失败 | 没有 prepare、datadir 不为空、权限不对、版本不兼容 | 检查 error log、重新按流程恢复                       |
| `Permission denied`       | 文件属主不是`mysql:mysql`                          | `chown -R mysql:mysql /var/lib/mysql`                |
| `file exists`             | 目标备份目录不为空                                 | 换空目录或清理旧目录                                 |
| 增量无法合并              | 前一步没用`--apply-log-only`或增量链断了           | 检查`xtrabackup_checkpoints`的 LSN                   |
| 恢复后少数据              | 恢复到了较早时间点                                 | 确认全量、增量、binlog 的时间范围                    |
| 工具命令不存在            | 版本差异                                           | MySQL 5.7 常见`innobackupex`，MySQL 8 用`xtrabackup` |

## 4. 工作中的备份体系应该怎么设计

### 4.1 文件存放原则

不建议只放在数据库服务器本机。

推荐：

```
本机临时目录 -> 备份服务器 / NFS / NAS / 对象存储 -> 定期恢复验证
```

示例：

```
/data/backup/mysql/full      本地全量备份暂存
/data/backup/mysql/binlog    本地 binlog 暂存
/mnt/backup/mysql            NFS 备份目录
oss://company-backup/mysql   对象存储
```

### 4.2 常见备份策略

小中型库：

```
每天凌晨 mysqldump 全量
每小时或每天备份 binlog
保留 7 到 30 天
每周做一次恢复演练
```

大库：

```
每周 XtraBackup 全量
每天 XtraBackup 增量
持续保留 binlog
备份文件同步到远端
定期抽样恢复验证
```

关键指标：


| 指标 | 含义                 | 例子                           |
| ---- | -------------------- | ------------------------------ |
| RPO  | 最多能接受丢多少数据 | RPO=1小时，最多丢 1 小时数据   |
| RTO  | 最多能接受停机多久   | RTO=30分钟，必须 30 分钟内恢复 |

### 4.3 日常巡检项

* [ ]  昨天全量备份文件是否生成。
* [ ]  文件大小是否明显异常。
* [ ]  `gzip -t` 或校验是否通过。
* [ ]  binlog 是否持续生成。
* [ ]  binlog 是否被同步到远端。
* [ ]  本地磁盘空间是否足够。
* [ ]  备份保留策略是否生效。
* [ ]  最近一次恢复演练是否成功。

## 5. 恢复决策流程

### 5.1 误删单库或单表

```
1. 立即停止相关业务写入，避免覆盖现场。
2. 确认误操作时间。
3. 找最近一次全量备份。
4. 找全量备份后的 binlog。
5. 恢复到临时库验证。
6. 验证无误后，再决定回灌生产。
```

优先方案：

```
mysqldump 全量 + mysqlbinlog 恢复到误操作前
```

### 5.2 整个 MySQL 数据目录损坏

```
1. 保护现场，拷贝 error log。
2. 停止 MySQL。
3. 准备 XtraBackup 备份。
4. 清空 datadir。
5. copy-back。
6. chown。
7. 启动并验证。
```

优先方案：

```
XtraBackup 物理恢复
```

### 5.3 只想恢复一部分数据

优先考虑：

```
恢复到临时实例 -> 导出需要的数据 -> 导回生产
```

不要直接在生产库上反复试恢复命令。

## 6. 实验计划

### 实验 A：mysqldump 全量恢复

目标：

* [ ]  会生成 `.sql.gz`。
* [ ]  会验证压缩包。
* [ ]  会 drop 一个测试库再恢复。
* [ ]  会确认数据恢复成功。

建议环境：

```
普通 Ubuntu 服务器 + Docker MySQL 实验容器
```

不要一开始就用生产库或业务库练。

### 实验 B：mysqldump + binlog 按时间点恢复

目标：

* [ ]  会查看 `SHOW BINARY LOGS`。
* [ ]  会查看 `SHOW MASTER STATUS` 或 `SHOW BINARY LOG STATUS`。
* [ ]  会从 dump 文件中找到 binlog 坐标。
* [ ]  会用 `mysqlbinlog --start-position` 恢复。
* [ ]  会用 `mysqlbinlog --stop-datetime` 跳过误操作。

### 实验 C：XtraBackup 全量恢复

目标：

* [ ]  会完成一次物理全量备份。
* [ ]  会执行 prepare。
* [ ]  会停库、清空 datadir、copy-back、chown。
* [ ]  会启动 MySQL 并验证数据。

### 实验 D：XtraBackup 增量恢复

目标：

* [ ]  会看懂 `xtrabackup_checkpoints`。
* [ ]  会确认 `from_lsn` 和 `to_lsn` 是否接得上。
* [ ]  会按顺序合并 full、inc1、inc2。
* [ ]  会理解为什么最后一次不加 `--apply-log-only`。

## 7. 自检题

用来检查自己是否真的理解。

* [ ]  `mysqldump` 为什么叫逻辑备份？
* [ ]  `mysqldump --single-transaction` 是完全不锁表吗？
* [ ]  为什么要加 `--master-data=2` 或 `--source-data=2`？
* [ ]  全量备份后新增的数据在哪里？
* [ ]  `mysqladmin flush-logs` 做了什么？
* [ ]  为什么不要复制正在写入的最新 binlog？
* [ ]  恢复 binlog 时，为什么要先恢复全量？
* [ ]  XtraBackup 为什么叫物理备份？
* [ ]  XtraBackup 为什么备份完还要 prepare？
* [ ]  `--apply-log-only` / `--redo-only` 为什么不能乱用？
* [ ]  为什么 `/var/lib/mysql` 必须为空？
* [ ]  为什么恢复后要 `chown -R mysql:mysql /var/lib/mysql`？
* [ ]  备份成功和恢复成功有什么区别？

## 8. 一句话记忆

```
mysqldump 是导 SQL。
binlog 是补变化。
mysqlbinlog 是重放变化。
XtraBackup 是搬物理文件。
prepare / apply-log 是把备份文件整理到一致状态。
copy-back 是把整理好的文件放回 MySQL 数据目录。
备份不验证恢复，就不能算真正可靠。
```

## 9. 参考资料

* 本地文件：`C:\DevCode\devops\MySQL备份恢复.pdf`
* MySQL 5.7 官方文档：[mysqldump](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html)
* MySQL 8.0 官方文档：[mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
* MySQL 8.0 官方文档：[Point-in-Time Recovery](https://dev.mysql.com/doc/refman/8.0/en/point-in-time-recovery.html)
* Percona XtraBackup 8.4 官方文档：[Create a full backup](https://docs.percona.com/percona-xtrabackup/8.4/create-full-backup.html)
* Percona XtraBackup 8.4 官方文档：[Restore a backup](https://docs.percona.com/percona-xtrabackup/8.4/restore-a-backup.html)
* Percona XtraBackup 8.4 官方文档：[Create an incremental backup](https://docs.percona.com/percona-xtrabackup/8.4/create-incremental-backup.html)
* Percona XtraBackup 8.0 官方文档：[Create a full backup](https://docs.percona.com/percona-xtrabackup/8.0/create-full-backup.html)
