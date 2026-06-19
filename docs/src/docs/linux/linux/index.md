---
title: Linux 学习路线
---

# Linux 学习路线

Linux 是后端开发、运维、容器、Kubernetes、数据库部署的共同底座。学 Linux 不能只背命令，而要理解系统如何组织文件、如何管理用户权限、如何运行进程、如何暴露端口、如何记录日志、如何安装软件、如何定位故障。

## 学习目标

这套 Linux 文档按“能使用、能部署、能排障”的顺序组织。

| 阶段 | 目标 | 需要掌握 |
| --- | --- | --- |
| 基础使用 | 能在服务器上安全操作文件和目录 | `pwd`、`cd`、`ls`、`cp`、`mv`、`rm`、`find`、`grep`、`tar` |
| 权限管理 | 能理解用户、用户组、文件权限 | `useradd`、`passwd`、`chown`、`chmod`、`sudo` |
| 进程服务 | 能启动、停止、查看服务 | `ps`、`top`、`kill`、`systemctl`、`journalctl` |
| 网络排障 | 能定位服务访问失败 | `ip`、`ss`、`ping`、`curl`、`traceroute`、防火墙 |
| 磁盘日志 | 能处理磁盘占满和日志问题 | `df`、`du`、`lsblk`、`mount`、`logrotate` |
| 软件部署 | 能安装软件并配置开机自启 | `rpm`、`yum`、`dnf`、源码安装、systemd |

## Linux 系统结构

Linux 可以理解成几个核心部分：

```text
用户命令
  -> Shell
  -> 系统调用
  -> Linux 内核
  -> CPU / 内存 / 磁盘 / 网络
```

常见组件：

- **Kernel**：内核，负责进程调度、内存管理、文件系统、网络协议栈、设备驱动。
- **Shell**：命令解释器，常见有 bash、zsh。
- **File System**：文件系统，Linux 中一切皆文件，设备、目录、普通文件都在统一目录树中。
- **Process**：进程，运行中的程序。
- **systemd**：现代 Linux 常用的系统和服务管理器。

## 登录服务器后的第一组命令

拿到一台新服务器，先不要急着安装软件，应该先确认系统状态。

```bash
# 查看系统版本
cat /etc/os-release

# 查看内核版本
uname -r

# 查看 CPU
lscpu

# 查看内存
free -h

# 查看磁盘
df -h
lsblk

# 查看 IP
ip addr

# 查看当前登录用户
whoami

# 查看负载
uptime
```

这组命令能快速判断服务器是什么系统、资源是否够用、网络是否正常。

## 目录结构

Linux 目录不是随便放的，常见目录有固定含义。

| 目录 | 作用 |
| --- | --- |
| `/` | 根目录，所有文件和目录的起点 |
| `/bin` | 基础命令 |
| `/sbin` | 系统管理命令 |
| `/etc` | 系统和软件配置文件 |
| `/home` | 普通用户家目录 |
| `/root` | root 用户家目录 |
| `/var` | 经常变化的数据，如日志、缓存、队列 |
| `/var/log` | 系统和服务日志 |
| `/usr` | 用户级程序和库 |
| `/opt` | 第三方软件安装目录 |
| `/tmp` | 临时文件 |
| `/proc` | 进程和内核信息的虚拟文件系统 |

部署软件时常见约定：

- 配置文件放 `/etc/软件名/`。
- 应用程序放 `/opt/应用名/` 或 `/usr/local/应用名/`。
- 日志放 `/var/log/应用名/`。
- 数据文件放 `/data/应用名/` 或单独挂载磁盘。

## 命令学习方法

学习命令不要只背参数，建议按这四点理解：

1. 命令解决什么问题。
2. 默认操作对象是什么。
3. 常用参数有哪些。
4. 误操作风险是什么。

例如 `rm`：

```bash
rm file.txt
rm -r dir
rm -f file.txt
```

它解决的是删除文件问题，但风险很高。生产服务器中执行删除前应该先 `ls` 确认路径，涉及递归删除时尤其谨慎。

## 排障通用流程

Linux 排障不要一上来就改配置，先判断问题范围。

```text
现象确认
  -> 资源是否异常
  -> 进程是否存在
  -> 端口是否监听
  -> 日志是否报错
  -> 配置是否正确
  -> 最近是否变更
```

常用命令组合：

```bash
uptime
free -h
df -h
top
ps -ef | grep java
ss -lntp
journalctl -xe
tail -f /var/log/messages
```

## 文档阅读顺序

建议按这个顺序学习：

1. [文件与目录操作](/docs/linux/linux/file-directory)
2. [用户、权限与 sudo](/docs/linux/linux/user-permission)
3. [进程、服务与日志](/docs/linux/linux/process-service-log)
4. [网络配置与排障](/docs/linux/linux/network-troubleshooting)
5. [磁盘、挂载与软件包](/docs/linux/linux/storage-package)
6. [Linux 命令清单](/docs/linux/linux/Linux命令)

## 参考资料

- [Linux 就该这么学](https://www.linuxprobe.com/)
- `man` 手册，例如 `man ls`、`man systemctl`
- 各发行版官方文档，例如 Red Hat、Ubuntu、Debian
