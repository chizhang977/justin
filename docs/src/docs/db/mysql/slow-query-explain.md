---
title: 慢查询与执行计划
---

# 慢查询与执行计划

慢查询优化是 MySQL 生产运维中最常见的工作。优化 SQL 不能靠猜，要通过慢查询日志、执行计划、索引和数据分布一步步定位。

## 开启慢查询日志

查看配置：

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
SHOW VARIABLES LIKE 'slow_query_log_file';
```

临时开启：

```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;
```

查看慢查询日志路径：

```sql
SHOW VARIABLES LIKE 'slow_query_log_file';
```

配置文件中持久化：

```ini
[mysqld]
slow_query_log=ON
long_query_time=1
slow_query_log_file=/var/log/mysql/mysql-slow.log
```

参数说明：

- `slow_query_log`：是否开启慢查询日志。
- `long_query_time`：超过多少秒记录为慢查询。
- `slow_query_log_file`：慢查询日志文件位置。

生产环境要注意日志文件大小，并配置日志轮转。

## 慢查询日志内容

慢查询日志通常包含：

- 执行时间。
- 锁等待时间。
- 返回行数。
- 扫描行数。
- 执行 SQL。

重点关注：

- `Query_time`：SQL 执行耗时。
- `Lock_time`：锁等待时间。
- `Rows_examined`：扫描行数。
- `Rows_sent`：返回行数。

如果扫描行数远大于返回行数，通常说明过滤效率低或索引不合理。

## EXPLAIN

查看执行计划：

```sql
EXPLAIN SELECT id, order_no, amount
FROM orders
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 20;
```

常见字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 查询序号 |
| `select_type` | 查询类型 |
| `table` | 访问的表 |
| `type` | 访问类型 |
| `possible_keys` | 可能使用的索引 |
| `key` | 实际使用的索引 |
| `key_len` | 使用索引长度 |
| `rows` | 预计扫描行数 |
| `filtered` | 过滤比例 |
| `Extra` | 额外信息 |

## type 访问类型

常见访问类型从好到差：

```text
system > const > eq_ref > ref > range > index > ALL
```

重点理解：

| type | 含义 |
| --- | --- |
| `const` | 通过主键或唯一索引查一行 |
| `ref` | 使用非唯一索引等值查询 |
| `range` | 范围扫描 |
| `index` | 扫描整个索引 |
| `ALL` | 全表扫描 |

`ALL` 不一定永远错误，小表全表扫描可以接受。但大表出现 `ALL` 要重点关注。

## Extra 常见信息

| Extra | 含义 |
| --- | --- |
| `Using index` | 使用覆盖索引 |
| `Using where` | 存储引擎返回数据后还需要过滤 |
| `Using filesort` | 需要额外排序 |
| `Using temporary` | 使用临时表 |

`Using filesort` 和 `Using temporary` 在大数据量下通常需要优化。

## 索引失效常见原因

### 1. 在索引列上使用函数

```sql
SELECT * FROM orders WHERE DATE(created_at) = '2026-06-20';
```

优化：

```sql
SELECT * FROM orders
WHERE created_at >= '2026-06-20 00:00:00'
  AND created_at < '2026-06-21 00:00:00';
```

### 2. 隐式类型转换

字段是字符串，却用数字查询：

```sql
SELECT * FROM users WHERE phone = 13800000001;
```

应写：

```sql
SELECT * FROM users WHERE phone = '13800000001';
```

### 3. 前置模糊查询

```sql
SELECT * FROM users WHERE username LIKE '%tin';
```

普通 B+Tree 索引难以利用前置 `%`。

### 4. 联合索引不满足最左前缀

索引：

```sql
KEY idx_user_created (user_id, created_at)
```

能较好使用：

```sql
WHERE user_id = 1 ORDER BY created_at DESC
```

不一定能充分使用：

```sql
WHERE created_at >= '2026-01-01'
```

因为跳过了联合索引的第一列 `user_id`。

## 慢 SQL 优化流程

1. 从慢查询日志找到 SQL。
2. 确认 SQL 执行频率和业务场景。
3. 使用 `EXPLAIN` 查看执行计划。
4. 查看表结构和已有索引。
5. 估算数据量和过滤比例。
6. 判断是否存在索引失效、深分页、排序、临时表。
7. 优化 SQL 或增加合适索引。
8. 在测试环境验证执行计划和耗时。
9. 上线后观察慢查询日志。

## 示例：订单列表优化

慢 SQL：

```sql
SELECT id, order_no, amount, created_at
FROM orders
WHERE user_id = 1001
ORDER BY created_at DESC
LIMIT 20;
```

如果只有 `user_id` 单列索引，MySQL 可能先找到该用户所有订单，再排序。

更合适的联合索引：

```sql
CREATE INDEX idx_user_created ON orders (user_id, created_at);
```

这样可以按用户定位订单，并利用索引顺序减少排序成本。

## 示例：深分页优化

慢 SQL：

```sql
SELECT id, order_no
FROM orders
ORDER BY id DESC
LIMIT 100000, 20;
```

优化为游标分页：

```sql
SELECT id, order_no
FROM orders
WHERE id < 900000
ORDER BY id DESC
LIMIT 20;
```

如果业务必须跳页，可以先用覆盖索引查主键，再回表：

```sql
SELECT o.id, o.order_no, o.amount
FROM orders o
JOIN (
  SELECT id
  FROM orders
  ORDER BY id DESC
  LIMIT 100000, 20
) t ON o.id = t.id;
```

这能减少回表的数据量。

## 不要盲目加索引

索引不是越多越好。

索引的成本：

- 占用磁盘空间。
- 插入、更新、删除时要维护索引。
- 优化器选择索引的成本增加。
- 冗余索引会让维护复杂。

加索引前要明确：

- 这条 SQL 是否高频。
- 过滤字段是否有区分度。
- 是否能同时支持过滤、排序、分组。
- 是否已有相似联合索引。
