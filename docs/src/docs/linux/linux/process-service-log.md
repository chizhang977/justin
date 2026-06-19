---
title: 进程、服务与日志
---

# 进程、服务与日志

部署应用后，最常见的问题是服务没启动、端口没监听、进程异常退出、日志报错。掌握进程、systemd 和日志，是 Linux 排障的核心。

## 进程是什么

程序是磁盘上的文件，进程是运行中的程序实例。

查看进程：

```bash
ps -ef
```

按关键字过滤：

```bash
ps -ef | grep java
```

查看进程树：

```bash
pstree -p
```

查看某个进程详情：

```bash
ps -fp <pid>
```

## top 和资源观察

动态查看系统资源：

```bash
top
```

常关注：

- load average：系统负载。
- CPU 使用率。
- 内存使用率。
- 进程 CPU、内存占用。
- 僵尸进程数量。

更易读的工具：

```bash
htop
```

如果系统没有安装，可以用包管理器安装。

## kill 信号

优雅终止：

```bash
kill <pid>
```

强制终止：

```bash
kill -9 <pid>
```

常见信号：

| 信号 | 名称 | 作用 |
| --- | --- | --- |
| 15 | TERM | 请求进程正常退出 |
| 9 | KILL | 强制杀死进程 |
| 1 | HUP | 常用于重新加载配置 |

生产中优先使用 `kill` 或服务自带停止命令，不要一上来 `kill -9`。强制杀进程可能导致临时文件、锁、事务状态没有正确清理。

## 后台运行

临时后台运行：

```bash
nohup java -jar app.jar > app.log 2>&1 &
```

查看后台任务：

```bash
jobs
```

但生产环境不建议长期用 `nohup` 管理服务，更推荐 systemd。

## systemd 服务管理

查看服务状态：

```bash
systemctl status nginx
```

启动服务：

```bash
systemctl start nginx
```

停止服务：

```bash
systemctl stop nginx
```

重启服务：

```bash
systemctl restart nginx
```

重新加载配置：

```bash
systemctl reload nginx
```

设置开机自启：

```bash
systemctl enable nginx
```

取消开机自启：

```bash
systemctl disable nginx
```

## 自定义 systemd 服务

以 Spring Boot 应用为例，创建：

```bash
sudo vi /etc/systemd/system/justin-app.service
```

内容：

```ini
[Unit]
Description=Justin Spring Boot Application
After=network.target

[Service]
User=app
Group=app
WorkingDirectory=/opt/justin-app
ExecStart=/usr/bin/java -jar /opt/justin-app/app.jar --spring.profiles.active=prod
Restart=always
RestartSec=5
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

加载配置：

```bash
systemctl daemon-reload
systemctl enable justin-app
systemctl start justin-app
systemctl status justin-app
```

修改 service 文件后必须执行：

```bash
systemctl daemon-reload
```

## journalctl 日志

查看服务日志：

```bash
journalctl -u justin-app
```

实时查看：

```bash
journalctl -u justin-app -f
```

查看最近 100 行：

```bash
journalctl -u justin-app -n 100
```

查看今天日志：

```bash
journalctl -u justin-app --since today
```

查看某时间段：

```bash
journalctl -u justin-app --since "2026-06-20 10:00:00" --until "2026-06-20 11:00:00"
```

## 系统日志

常见日志路径：

| 文件 | 作用 |
| --- | --- |
| `/var/log/messages` | CentOS/RHEL 系统综合日志 |
| `/var/log/syslog` | Debian/Ubuntu 系统综合日志 |
| `/var/log/secure` | 登录和认证日志 |
| `/var/log/dmesg` | 内核启动日志 |
| `/var/log/cron` | 定时任务日志 |

查看实时日志：

```bash
tail -f /var/log/messages
```

查看错误：

```bash
grep -i "error" /var/log/messages
grep -i "failed" /var/log/messages
```

## 日志轮转

日志无限增长会打满磁盘。Linux 常用 `logrotate` 管理日志切割。

配置示例：

```text
/var/log/justin-app/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
    copytruncate
}
```

含义：

- `daily`：每天轮转。
- `rotate 14`：保留 14 份。
- `compress`：压缩旧日志。
- `missingok`：日志不存在也不报错。
- `notifempty`：空日志不轮转。
- `copytruncate`：复制后截断原文件，适合进程持续写同一个日志文件的场景。

测试配置：

```bash
logrotate -d /etc/logrotate.conf
```

强制执行：

```bash
logrotate -f /etc/logrotate.conf
```

## 服务启动失败排查

排查顺序：

```bash
systemctl status justin-app
journalctl -u justin-app -n 200
ls -l /opt/justin-app
ss -lntp
df -h
free -h
```

常见原因：

- Jar 包路径不正确。
- Java 路径不正确。
- 端口已被占用。
- 配置文件缺失。
- 权限不足。
- 数据库或 Redis 连接失败。
- 磁盘满。

## 端口占用

查看监听端口：

```bash
ss -lntp
```

查看某端口：

```bash
ss -lntp | grep :8080
```

或：

```bash
lsof -i:8080
```

处理时不要直接杀进程，先确认进程是什么服务：

```bash
ps -fp <pid>
```
