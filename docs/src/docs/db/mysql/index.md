---
title: MySQL 学习路线
---

# MySQL 学习路线

MySQL 不是只会写 `select` 就算掌握。真正能在项目里使用 MySQL，需要理解 SQL 基础、表设计、索引、事务、慢查询、备份恢复、主从复制和日常运维。

## 学习顺序

| 阶段 | 内容 | 目标 |
| --- | --- | --- |
| SQL 基础 | 增删改查、条件过滤、排序、分页 | 能完成业务数据读写 |
| 查询进阶 | 聚合、分组、连接、子查询 | 能写复杂业务查询 |
| 表设计 | 字段类型、约束、范式、索引 | 能设计可维护的数据表 |
| 性能优化 | 执行计划、慢查询、索引优化 | 能定位 SQL 慢的原因 |
| 高可用基础 | 主从复制、读写分离 | 能理解生产数据库架构 |
| 备份恢复 | 逻辑备份、恢复演练、binlog | 能在误删或故障时恢复数据 |

## 一条 SQL 的执行链路

```text
客户端发送 SQL
  -> 连接器认证
  -> 解析器检查语法
  -> 优化器选择执行计划
  -> 执行器调用存储引擎
  -> InnoDB 读写数据和索引
  -> 返回结果
```

写 SQL 时不能只看语法是否正确，还要考虑：

- 是否使用了索引。
- 返回数据量是否过大。
- 是否产生锁等待。
- 是否影响主从延迟。
- 是否能通过备份恢复。

## 推荐文档顺序

1. [SQL 基础：增删改查](/docs/db/mysql/sql-basic)
2. [查询进阶：过滤、分组、排序、分页](/docs/db/mysql/query-advanced)
3. [MySQL 存储引擎](/docs/db/mysql/存储引擎)
4. [MySQL 索引优化](/docs/db/mysql/索引优化)
5. [慢查询与执行计划](/docs/db/mysql/slow-query-explain)
6. [主从复制](/docs/db/mysql/replication)
7. [备份与恢复演练](/docs/db/mysql/backup-restore)

## 实验环境建议

本地学习可以用 Docker 启动 MySQL：

```bash
docker run -d \
  --name mysql8 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -v mysql8-data:/var/lib/mysql \
  mysql:8.0
```

连接：

```bash
mysql -h 127.0.0.1 -P 3306 -uroot -p
```

创建练习库：

```sql
CREATE DATABASE justin_study DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE justin_study;
```

## 示例表

后续 SQL 示例可以使用这几张表。

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_no VARCHAR(64) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TINYINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_name VARCHAR(128) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 学习原则

- 所有 SQL 都要能解释数据从哪里来、过滤条件是什么、返回多少行。
- 涉及更新和删除时必须先写 `select` 确认影响范围。
- 大表查询必须关注索引和返回行数。
- 备份恢复必须做演练，不能只写命令。
- 主从复制要理解延迟、binlog、relay log 和只读从库。
