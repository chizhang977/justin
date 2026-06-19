---
title: 查询进阶：过滤、分组、排序、分页
---

# 查询进阶：过滤、分组、排序、分页

业务开发中大量需求不是简单查一行，而是按条件筛选、统计、排序、分页、关联多张表。写这类 SQL 时要同时关注正确性和性能。

## ORDER BY 排序

按创建时间倒序：

```sql
SELECT id, username, created_at
FROM users
ORDER BY created_at DESC;
```

多字段排序：

```sql
SELECT id, user_id, amount, created_at
FROM orders
ORDER BY user_id ASC, created_at DESC;
```

注意：

- 排序字段如果没有合适索引，可能产生 `filesort`。
- 大数据量排序很消耗 CPU 和内存。
- 分页排序必须稳定，最好带上主键作为兜底排序。

稳定分页排序：

```sql
SELECT id, user_id, amount, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

## LIMIT 分页

第一页：

```sql
SELECT id, order_no, amount
FROM orders
ORDER BY id DESC
LIMIT 0, 10;
```

第二页：

```sql
SELECT id, order_no, amount
FROM orders
ORDER BY id DESC
LIMIT 10, 10;
```

`LIMIT offset, size` 的问题是 offset 越大，数据库需要跳过的数据越多。

深分页示例：

```sql
SELECT id, order_no, amount
FROM orders
ORDER BY id DESC
LIMIT 100000, 20;
```

这类 SQL 在大表上会很慢。

## 深分页优化

如果按自增主键倒序，可以改成游标分页：

```sql
SELECT id, order_no, amount
FROM orders
WHERE id < 100000
ORDER BY id DESC
LIMIT 20;
```

前端或接口保存上一页最后一条记录的 `id`，下一页从这个 `id` 继续查。

优点：

- 避免扫描并丢弃大量 offset 数据。
- 适合信息流、日志列表、订单列表。

限制：

- 不适合任意跳页。
- 排序字段要稳定。

## 聚合函数

常用聚合：

```sql
SELECT COUNT(*) FROM orders;
SELECT SUM(amount) FROM orders;
SELECT AVG(amount) FROM orders;
SELECT MAX(amount) FROM orders;
SELECT MIN(amount) FROM orders;
```

按条件统计：

```sql
SELECT COUNT(*)
FROM orders
WHERE status = 1;
```

注意：`COUNT(*)` 是统计行数，`COUNT(column)` 不统计该列为 NULL 的行。

## GROUP BY 分组

按用户统计订单数：

```sql
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id;
```

按用户统计订单金额：

```sql
SELECT user_id, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id;
```

分组后过滤使用 `HAVING`：

```sql
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

`WHERE` 和 `HAVING` 区别：

| 子句 | 执行位置 | 用途 |
| --- | --- | --- |
| `WHERE` | 分组前 | 过滤原始行 |
| `HAVING` | 分组后 | 过滤聚合结果 |

能写在 `WHERE` 的条件不要放到 `HAVING`，因为越早过滤数据，参与分组的数据越少。

## JOIN 连接查询

查询订单及用户名：

```sql
SELECT
  o.id,
  o.order_no,
  o.amount,
  u.username
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 1;
```

常见连接：

| 类型 | 说明 |
| --- | --- |
| `INNER JOIN` | 两边都匹配才返回 |
| `LEFT JOIN` | 返回左表全部，右表没有则为 NULL |
| `RIGHT JOIN` | 返回右表全部，左表没有则为 NULL |

业务中最常用的是 `INNER JOIN` 和 `LEFT JOIN`。

## LEFT JOIN 示例

查询所有用户及订单数，即使没有订单也返回：

```sql
SELECT
  u.id,
  u.username,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

注意：`LEFT JOIN` 右表条件如果写在 `WHERE` 里，可能把左连接变成类似内连接。

```sql
SELECT *
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 1;
```

如果希望保留没有订单的用户，应把右表条件放到 `ON`：

```sql
SELECT *
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 1;
```

## 子查询

查询下过订单的用户：

```sql
SELECT id, username
FROM users
WHERE id IN (
  SELECT user_id FROM orders
);
```

也可以用 `EXISTS`：

```sql
SELECT id, username
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

大数据量场景下，要结合执行计划判断 `IN`、`EXISTS`、`JOIN` 哪种更合适。

## CASE WHEN

把状态码转成文本：

```sql
SELECT
  id,
  order_no,
  CASE status
    WHEN 0 THEN '未支付'
    WHEN 1 THEN '已支付'
    WHEN 2 THEN '已取消'
    ELSE '未知'
  END AS status_text
FROM orders;
```

复杂统计：

```sql
SELECT
  COUNT(*) AS total_count,
  SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS paid_count,
  SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS canceled_count
FROM orders;
```

## 查询执行顺序

SQL 书写顺序：

```text
SELECT
FROM
JOIN
WHERE
GROUP BY
HAVING
ORDER BY
LIMIT
```

逻辑执行顺序大致是：

```text
FROM / JOIN
WHERE
GROUP BY
HAVING
SELECT
ORDER BY
LIMIT
```

理解执行顺序有助于判断别名能不能使用、过滤条件放在哪里更合适。

## 查询优化习惯

- 只查需要的字段。
- 大表必须带条件。
- 排序和分组字段尽量有索引支撑。
- 分页避免过大的 offset。
- JOIN 字段类型要一致，并建立索引。
- 避免在索引列上使用函数。
- 使用 `EXPLAIN` 检查执行计划。
