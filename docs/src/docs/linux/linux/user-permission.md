---
title: 用户、权限与 sudo
---

# 用户、权限与 sudo

Linux 是多用户系统。权限管理的目的不是增加操作复杂度，而是避免普通用户误改系统文件，避免应用之间互相影响，降低服务器被入侵后的破坏范围。

## 用户和用户组

查看当前用户：

```bash
whoami
id
```

查看系统用户：

```bash
cat /etc/passwd
```

查看用户组：

```bash
cat /etc/group
```

`id` 输出示例：

```text
uid=1000(app) gid=1000(app) groups=1000(app),10(wheel)
```

含义：

- `uid`：用户 ID。
- `gid`：主用户组 ID。
- `groups`：用户所属的所有组。

## 创建用户

创建用户：

```bash
useradd app
passwd app
```

创建用户并指定家目录：

```bash
useradd -m -d /home/app app
```

删除用户：

```bash
userdel app
```

连同家目录删除：

```bash
userdel -r app
```

生产建议：

- 不建议直接用 root 运行业务服务。
- 可以为每个应用创建独立用户，例如 `app`、`nginx`、`mysql`。
- 应用用户只授予必要目录权限。

## 文件权限结构

查看文件权限：

```bash
ls -l app.log
```

示例：

```text
-rw-r--r-- 1 app app 1024 Jun 20 10:00 app.log
```

拆解：

```text
-        文件类型
rw-      属主权限
r--      属组权限
r--      其他用户权限
app      属主
app      属组
```

权限含义：

| 权限 | 文件 | 目录 |
| --- | --- | --- |
| `r` | 读取文件内容 | 查看目录列表 |
| `w` | 修改文件内容 | 在目录中创建、删除、重命名文件 |
| `x` | 执行文件 | 进入目录 |

目录的 `x` 权限非常重要。没有目录执行权限，即使有读权限也无法进入目录。

## chmod 修改权限

数字权限：

| 数字 | 权限 |
| --- | --- |
| 4 | read |
| 2 | write |
| 1 | execute |

常见权限：

```bash
chmod 644 app.conf
chmod 755 start.sh
chmod 700 private-key
```

含义：

| 权限 | 说明 |
| --- | --- |
| `644` | 属主可读写，其他人只读，适合普通配置文件 |
| `755` | 属主可读写执行，其他人可读执行，适合脚本或目录 |
| `700` | 只有属主可读写执行，适合私钥目录 |

符号方式：

```bash
chmod u+x start.sh
chmod g+w logs
chmod o-r app.conf
```

生产中不要随意使用：

```bash
chmod 777 file
```

`777` 表示所有用户都可读、可写、可执行，风险很高。正确做法是调整属主、用户组或最小权限。

## chown 修改属主

修改文件属主：

```bash
chown app app.log
```

修改属主和属组：

```bash
chown app:app app.log
```

递归修改目录：

```bash
chown -R app:app /opt/app
```

业务部署常见操作：

```bash
mkdir -p /opt/app /var/log/app
chown -R app:app /opt/app /var/log/app
```

这样应用用户可以读写自己的程序目录和日志目录，不需要 root 权限。

## sudo

`sudo` 用来让普通用户临时以更高权限执行命令。

查看用户是否有 sudo 权限：

```bash
sudo -l
```

执行命令：

```bash
sudo systemctl restart nginx
```

CentOS 常见 sudo 组是 `wheel`：

```bash
usermod -aG wheel app
```

编辑 sudo 配置建议使用：

```bash
visudo
```

不要直接编辑 `/etc/sudoers`，语法写错可能导致 sudo 不可用。

## umask

`umask` 决定新建文件和目录的默认权限。

查看：

```bash
umask
```

常见值：

```text
0022
```

默认文件权限通常从 `666` 减去 umask，目录权限从 `777` 减去 umask。

例如 `022`：

- 新文件默认 `644`。
- 新目录默认 `755`。

## 特殊权限

### SUID

让用户执行文件时临时拥有文件属主权限。

典型例子：

```bash
ls -l /usr/bin/passwd
```

普通用户能修改自己的密码，就是因为 `passwd` 程序具备特殊权限。

### SGID

用于目录时，新建文件会继承目录属组。团队共享目录中常用。

```bash
chmod g+s /data/share
```

### Sticky Bit

常见于 `/tmp`，任何人可以创建文件，但只能删除自己的文件。

```bash
ls -ld /tmp
```

## 权限排查流程

遇到 `Permission denied`，按顺序排查：

1. 当前用户是谁：`whoami`。
2. 文件权限是什么：`ls -l file`。
3. 上级目录是否有执行权限：`ls -ld dir`。
4. 文件属主和用户组是否正确。
5. 是否需要 sudo。
6. SELinux 是否拦截。

查看 SELinux 状态：

```bash
getenforce
```

如果是 SELinux 引起，需要查看审计日志，而不是简单永久关闭。

## 常见场景

### 应用无法写日志

```bash
ls -ld /var/log/app
ls -l /var/log/app
chown -R app:app /var/log/app
chmod 755 /var/log/app
```

应用进程用哪个用户启动，就要确保这个用户能写日志目录。

### 脚本无法执行

```bash
ls -l deploy.sh
chmod u+x deploy.sh
./deploy.sh
```

如果仍然无法执行，检查脚本第一行解释器是否存在：

```bash
head -n 1 deploy.sh
which bash
```
