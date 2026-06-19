---
title: SQL 基础：增删改查
---

# SQL 基础：增删改查

SQL 是操作关系型数据库的语言。日常业务开发中最常用的是 DML，也就是 `INSERT`、`DELETE`、`UPDATE`、`SELECT`。

## 创建数据库

```sql
CREATE DATABASE justin_study DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

选择数据库：

```sql
USE justin_study;
```

查看数据库：

```sql
SHOW DATABASES;
```

删除数据库：

```sql
DROP DATABASE justin_study;
```

删除数据库是高风险操作，生产环境必须确认备份、权限和执行对象。

## 创建表

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

字段解释：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `BIGINT` | 主键，自增 |
| `username` | `VARCHAR(64)` | 用户名 |
| `phone` | `VARCHAR(20)` | 手机号，唯一 |
| `status` | `TINYINT` | 状态，例如 1 正常、0 禁用 |
| `created_at` | `DATETIME` | 创建时间 |

查看表结构：

```sql
DESC users;
SHOW CREATE TABLE users\G
```

## INSERT 插入数据

插入一行：

```sql
INSERT INTO users (username, phone, status)
VALUES ('justin', '13800000001', 1);
```

插入多行：

```sql
INSERT INTO users (username, phone, status)
VALUES
  ('alice', '13800000002', 1),
  ('bob', '13800000003', 1),
  ('tom', '13800000004', 0);
```

不建议省略字段名：

```sql
INSERT INTO users VALUES (1, 'justin', '13800000001', 1, NOW());
```

这种写法依赖字段顺序，表结构变化后容易出错。生产中应明确写字段名。

## SELECT 查询数据

查询所有列：

```sql
SELECT * FROM users;
```

查询指定列：

```sql
SELECT id, username, phone FROM users;
```

生产中不建议长期使用 `SELECT *`：

- 会返回不需要的字段，增加网络传输。
- 表字段增加后可能影响接口。
- 不利于覆盖索引。

## WHERE 条件过滤

等值查询：

```sql
SELECT id, username FROM users WHERE phone = '13800000001';
```

多条件：

```sql
SELECT id, username FROM users
WHERE status = 1 AND created_at >= '2026-01-01';
```

范围查询：

```sql
SELECT id, username FROM users
WHERE id BETWEEN 1 AND 100;
```

集合查询：

```sql
SELECT id, username FROM users
WHERE status IN (0, 1);
```

模糊查询：

```sql
SELECT id, username FROM users
WHERE username LIKE 'ju%';
```

注意：`LIKE '%stin'` 这种前置百分号通常无法使用普通 B+Tree 索引。

## UPDATE 更新数据

更新一行：

```sql
UPDATE users
SET username = 'justin_new'
WHERE id = 1;
```

更新状态：

```sql
UPDATE users
SET status = 0
WHERE phone = '13800000001';
```

生产更新前先查影响范围：

```sql
SELECT id, username, status FROM users WHERE phone = '13800000001';
```

确认后再执行 `UPDATE`。

没有 `WHERE` 的更新非常危险：

```sql
UPDATE users SET status = 0;
```

它会更新整张表。

## DELETE 删除数据

删除一行：

```sql
DELETE FROM users WHERE id = 1;
```

删除前先查：

```sql
SELECT * FROM users WHERE id = 1;
```

没有 `WHERE` 的删除非常危险：

```sql
DELETE FROM users;
```

它会删除表中所有数据。

如果是业务数据，很多系统不会物理删除，而是使用逻辑删除：

```sql
UPDATE users SET status = 0 WHERE id = 1;
```

## TRUNCATE 和 DELETE 区别

```sql
TRUNCATE TABLE users;
```

| 对比项 | DELETE | TRUNCATE |
| --- | --- | --- |
| 是否可带 WHERE | 可以 | 不可以 |
| 删除范围 | 可部分删除 | 清空整表 |
| 自增 ID | 通常不重置 | 通常重置 |
| 日志 | 逐行删除记录更多日志 | 更像 DDL，速度快 |
| 风险 | 高 | 极高 |

生产环境清表必须谨慎，优先确认备份和影响范围。

## NULL

查询 NULL：

```sql
SELECT * FROM users WHERE phone IS NULL;
```

不能写：

```sql
SELECT * FROM users WHERE phone = NULL;
```

`NULL` 表示未知值，不等于任何值，也不等于自己。

设计字段时尽量使用 `NOT NULL` 和默认值，减少三值逻辑带来的复杂度。

## 常见约束

| 约束 | 作用 |
| --- | --- |
| `PRIMARY KEY` | 主键，唯一且非空 |
| `UNIQUE` | 唯一约束 |
| `NOT NULL` | 非空 |
| `DEFAULT` | 默认值 |
| `FOREIGN KEY` | 外键 |

互联网业务中外键不一定大量使用，因为会增加数据库层耦合和写入检查成本。但逻辑上的关联关系仍然要在表设计和业务代码中保证。

## 安全操作习惯

更新和删除生产数据时建议：

1. 先写 `SELECT` 确认条件。
2. 确认影响行数。
3. 开启事务。
4. 执行更新或删除。
5. 再次查询确认结果。
6. 没问题再提交。

示例：

```sql
START TRANSACTION;

SELECT * FROM users WHERE id = 1;

UPDATE users SET status = 0 WHERE id = 1;

SELECT * FROM users WHERE id = 1;

COMMIT;
```

如果发现不对：

```sql
ROLLBACK;
```
