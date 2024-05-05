---
title: 2_Redis基本数据类型
icon: Redis
deep: 3
date: 2024-04-10
---
# 2_Redis基础

### 1、五大数据类型

#### 1、1 String

#####  介绍

- 字符串（Value 可以是String，int，float）
- 字节数组形式存储，不能超过512M
- 可以存储对象

#####  命令

- `添加` 

```bash
# 添加或者修改
set 
# 批量添加多个String类型的键值对
mset 
# 不存在就添加
setnx
# 添加键值对的时候指定有效期
setex
```

- 获取 

```bash
get key
mget key ...
strlen key
```

- 增加/减少：

```bash
 incr/decr key | incrby/decrby key 
```

#### 1、2 Hash

##### 介绍

- Hash类型，也叫散列，其value是一个无序字典，类似于Java中的HashMap结构
- 推荐存储对象

##### 命令(类似于string命令)

- 添加

```bash
HSET key field value
HMSET
HSETNX
```

- 获取

```bash
HGET key field
HMGET
HGETALL
HKEYS
HVALS
```

- 增加/减少

```bash
HINCRBY
```

#### 1、3 列表List

##### 介绍

- 底层为一个双向链表，类似于Java中LinkedList
- 单键多值
- 有序，元素可以重复
- 插入和删除较快

##### 命令

```bash
#从左/右插入一个或多个值
LPUSH/RPUSH key  value value.......
# 在value后边插入newvalue
LINSERT key before/after value newvalue  

# 从左/右弹出一个值
LPOP/RPOP key
# 与LPOP和RPOP类似，只不过在没有元素时等待指定时间，而不是直接返回nil
BLPOP和BRPOP
# 从左边删除n个value值
LREM key  n value 

# 获取 按照索引获取
LRANGE key  start end  
# 获取列表长度
LLEN key 
# 将列表key下标为index值替换成value
lset key index value 
```

#### 1、4  集合set

##### 介绍

Redis的Set结构与Java中的HashSet类似，可以看做是一个value为null的HashMap。

* 无序
* 元素不可重复
* 查找快
* 支持交集.并集.差集等功能

##### 命令

```bash
# 向set中添加一个或多个元素
SADD key member ... 
# 移除set中的指定元素
SREM key member ... 
# 返回set中元素的个数
SCARD key
# 判断一个元素是否存在于set中
SISMEMBER key member
# 获取set中的所有元素
SMEMBERS：
# 交集、差集、并集
SINTER key1 key2 
SDIFF key1 key2
SUNION key1 key2 
```

#### 1、5 有序集合zset（sorted set）

##### 介绍

Redis 的 SortedSet（有序集合）是一个具有独特特性的数据结构，它结合了两种数据结构的优势：Map 和 TreeSet。SortedSet 中的元素带有 score 属性，能基于 score 进行排序，并且不包含重复元素。其底层采用跳表和哈希表实现，保证了高效查询、排序和访问中间元素的能力。

SortedSet 主要特性包括：

1. 元素不重复且可排序，排序依据为元素所关联的 score。
2. 支持快速根据 score 或者位置查询特定范围内的元素。
3. 适用于实现排行榜、索引列表等场景，可以同时获取元素及其对应的权重或排名。

zset底层使用了两个数据结构

（1）hash，hash的作用就是关联元素value和权重score，保障元素value的唯一性，可以通过元素value找到相应的score值。

（2）跳跃表，跳跃表的目的在于给元素value排序，根据score的范围获取元素列表。

##### 命令

```bash
# 添加一个或多个元素到sorted set ，如果已经存在则更新其score值
ZADD key score member
# 删除sorted set中的一个指定元素
ZREM key member
# 获取指定元素的 score
ZSCORE key member
# 获取指定元素的 排名
ZRANK key member
# 获取zset 元素的个数
ZCARD key
# 获取指定范围score内元素的个数
ZCOUNT key min max
# 指定元素分数增加 increment
ZINCRBY key increment member
# 按照score排序后，获取指定排名范围内的元素（index）
ZRANGE key min max
# 按照score排序后，获取指定score范围内的元素 （score）
ZRANGEBYSCORE key min max
#差集.交集.并集
ZDIFF
ZINTER
ZUNION
```

