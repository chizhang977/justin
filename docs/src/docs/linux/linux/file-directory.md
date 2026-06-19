---
title: 文件与目录操作
---

# 文件与目录操作

Linux 中一切从目录开始。熟练掌握文件和目录操作，是后续部署应用、查看日志、修改配置、排查故障的基础。

## 当前目录

查看当前所在目录：

```bash
pwd
```

切换目录：

```bash
cd /etc
cd ..
cd ~
cd -
```

含义：

| 命令 | 作用 |
| --- | --- |
| `cd /etc` | 切换到 `/etc` |
| `cd ..` | 返回上一级目录 |
| `cd ~` | 返回当前用户家目录 |
| `cd -` | 返回上一次所在目录 |

## 查看目录内容

```bash
ls
ls -l
ls -a
ls -lh
ls -ltr
```

常用参数：

| 参数 | 作用 |
| --- | --- |
| `-l` | 长格式显示权限、属主、大小、时间 |
| `-a` | 显示隐藏文件 |
| `-h` | 以易读单位显示大小 |
| `-t` | 按修改时间排序 |
| `-r` | 反向排序 |

查看最新修改的文件：

```bash
ls -ltr /var/log
```

这在排查日志时很常用，因为最新变动的日志往往最接近问题发生时间。

## 创建目录和文件

创建目录：

```bash
mkdir app
mkdir -p /data/app/logs
```

创建空文件：

```bash
touch app.log
```

查看文件类型：

```bash
file app.log
```

## 复制、移动和删除

复制文件：

```bash
cp source.txt target.txt
```

复制目录：

```bash
cp -r app app-backup
```

移动或重命名：

```bash
mv app.log app.log.bak
mv app /opt/app
```

删除文件：

```bash
rm app.log
```

删除目录：

```bash
rm -r app
```

生产注意：

- 删除前先确认路径：`ls -lh 要删除的路径`。
- 不要在不确定路径时使用 `rm -rf *`。
- 删除日志文件前先确认是否被进程占用，必要时使用日志截断而不是删除。

截断日志：

```bash
: > app.log
```

或：

```bash
truncate -s 0 app.log
```

## 查看文件内容

小文件：

```bash
cat app.conf
```

分页查看：

```bash
less app.log
```

查看前几行：

```bash
head -n 50 app.log
```

查看最后几行：

```bash
tail -n 100 app.log
```

实时追踪日志：

```bash
tail -f app.log
```

按关键字过滤：

```bash
grep "ERROR" app.log
grep -n "Exception" app.log
grep -i "timeout" app.log
```

递归搜索：

```bash
grep -R "server.port" /opt/app
```

## 查找文件

按文件名：

```bash
find /etc -name "nginx.conf"
```

按类型：

```bash
find /var/log -type f
find /var/log -type d
```

按大小：

```bash
find /var/log -type f -size +500M
```

按修改时间：

```bash
find /var/log -type f -mtime -1
```

含义：

- `-mtime -1`：一天内修改过。
- `-mtime +7`：七天前修改过。

## 压缩和解压

打包：

```bash
tar -cf app.tar app/
```

打包并 gzip 压缩：

```bash
tar -zcf app.tar.gz app/
```

解压：

```bash
tar -xf app.tar
tar -zxf app.tar.gz
```

查看压缩包内容：

```bash
tar -tf app.tar.gz
```

常见备份：

```bash
tar -zcf app-$(date +%F).tar.gz /opt/app
```

## 软链接和硬链接

软链接类似快捷方式：

```bash
ln -s /opt/app/current/app.jar /usr/local/bin/app.jar
```

查看链接：

```bash
ls -l
```

软链接常用于版本切换：

```text
/opt/app/releases/1.0.0
/opt/app/releases/1.0.1
/opt/app/current -> /opt/app/releases/1.0.1
```

发布新版本时只需要切换 `current` 指向，回滚也更方便。

## 实用组合

查找大文件：

```bash
du -ah /var | sort -rh | head -n 20
```

查看日志中错误次数：

```bash
grep "ERROR" app.log | wc -l
```

查看最近 200 行错误：

```bash
tail -n 200 app.log | grep "ERROR"
```

查找并压缩旧日志：

```bash
find /var/log/app -type f -name "*.log" -mtime +7 -exec gzip {} \;
```

## 常见问题

### Permission denied

表示当前用户没有权限。先查看权限：

```bash
ls -l file
```

不要一遇到权限问题就 `chmod 777`。应该判断是属主不对、用户组不对，还是确实需要授权。

### No such file or directory

常见原因：

- 路径写错。
- 当前目录不是你以为的目录。
- 文件名大小写不一致。
- 脚本中使用了相对路径。

排查：

```bash
pwd
ls -lah
```
