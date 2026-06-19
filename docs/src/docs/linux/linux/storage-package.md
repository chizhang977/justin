---
title: 磁盘、挂载与软件包
---

# 磁盘、挂载与软件包

服务器运行一段时间后，最常见的基础设施问题之一就是磁盘空间不足。部署软件时，也经常需要理解包管理、源码安装、服务目录规划。

## 查看磁盘空间

查看文件系统空间：

```bash
df -h
```

查看 inode：

```bash
df -i
```

磁盘没满但无法创建文件，可能是 inode 用完了。大量小文件会消耗 inode。

查看目录大小：

```bash
du -sh /var/log
du -sh /var/log/*
```

查找大文件：

```bash
find / -type f -size +1G 2>/dev/null
```

按大小排序：

```bash
du -ah /var | sort -rh | head -n 20
```

## 磁盘打满处理流程

1. `df -h` 找到哪个挂载点满了。
2. `du -sh /*` 找到大目录。
3. 继续进入大目录逐层排查。
4. 判断文件是否能删除、压缩、迁移。
5. 如果是日志，配置日志轮转。
6. 如果是业务数据，评估扩容或归档。

不要直接执行危险命令：

```bash
rm -rf /*
```

不要删除不认识的系统目录。尤其是 `/usr`、`/bin`、`/lib`、`/etc`。

## 删除文件后空间不释放

如果进程正在写一个文件，即使文件被删除，空间也可能不释放，因为进程还持有文件句柄。

查看被删除但仍被占用的文件：

```bash
lsof | grep deleted
```

处理方式：

- 重启对应服务。
- 或让服务重新打开日志文件。
- 对日志优先使用截断：`truncate -s 0 file.log`。

## 查看磁盘和分区

查看块设备：

```bash
lsblk
```

查看分区：

```bash
fdisk -l
```

查看文件系统类型：

```bash
blkid
```

## 挂载磁盘

创建挂载目录：

```bash
mkdir -p /data
```

临时挂载：

```bash
mount /dev/sdb1 /data
```

查看挂载：

```bash
mount | grep /data
df -h
```

卸载：

```bash
umount /data
```

如果提示 busy，说明有进程正在使用：

```bash
lsof +D /data
```

## 开机自动挂载

编辑：

```bash
vi /etc/fstab
```

建议使用 UUID：

```text
UUID=xxxx-xxxx /data xfs defaults 0 0
```

测试配置：

```bash
mount -a
```

生产注意：`/etc/fstab` 写错可能导致系统启动异常，修改前建议备份。

```bash
cp /etc/fstab /etc/fstab.bak
```

## swap

查看 swap：

```bash
free -h
swapon --show
```

创建 swap 文件：

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

写入 `/etc/fstab`：

```text
/swapfile swap swap defaults 0 0
```

数据库服务器是否开启 swap 要谨慎评估。swap 可以避免瞬时 OOM，但频繁使用 swap 会导致性能明显下降。

## 软件包管理

CentOS/RHEL：

```bash
yum install -y nginx
yum remove -y nginx
yum update -y
yum list installed
yum info nginx
```

较新的系统可能使用：

```bash
dnf install -y nginx
```

Ubuntu/Debian：

```bash
apt update
apt install -y nginx
apt remove -y nginx
apt list --installed
```

## rpm

安装 rpm 包：

```bash
rpm -ivh package.rpm
```

升级：

```bash
rpm -Uvh package.rpm
```

查询：

```bash
rpm -qa | grep nginx
rpm -ql nginx
rpm -qi nginx
```

`rpm` 不会像 `yum` 那样自动处理依赖，手动安装时更容易遇到依赖缺失。

## 源码安装

源码安装常见流程：

```bash
tar -zxf app.tar.gz
cd app
./configure --prefix=/usr/local/app
make
make install
```

源码安装适合需要自定义编译参数的场景。普通业务部署优先用包管理器或容器，减少维护成本。

## 应用目录规划

建议：

```text
/opt/app                 程序目录
/opt/app/releases        历史版本
/opt/app/current         当前版本软链接
/etc/app                 配置文件
/var/log/app             日志
/data/app                数据
```

示例：

```bash
mkdir -p /opt/justin-app/releases /var/log/justin-app /data/justin-app
chown -R app:app /opt/justin-app /var/log/justin-app /data/justin-app
```

这种规划方便备份、回滚、排障和权限控制。
