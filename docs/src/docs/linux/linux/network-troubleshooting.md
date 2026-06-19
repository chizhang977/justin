---
title: 网络配置与排障
---

# 网络配置与排障

Linux 网络排障要按层次进行。一个服务访问失败，可能是域名解析、网络连通、端口监听、防火墙、安全组、反向代理、应用配置中的任意一环出了问题。

## 查看网卡和 IP

查看 IP 地址：

```bash
ip addr
```

简写：

```bash
ip a
```

查看路由：

```bash
ip route
```

查看网卡统计：

```bash
ip -s link
```

旧命令 `ifconfig` 很多系统默认不再安装，可以用 `ip` 命令替代。

## DNS 解析

查看 DNS 配置：

```bash
cat /etc/resolv.conf
```

解析域名：

```bash
nslookup www.baidu.com
```

或：

```bash
dig www.baidu.com
```

如果域名访问失败，先确认是 DNS 解析失败还是服务本身不可达。

## 连通性测试

测试主机是否可达：

```bash
ping 8.8.8.8
```

测试路由路径：

```bash
traceroute www.baidu.com
```

有些服务器禁 ping，ping 不通不一定表示服务不可访问。Web 服务更建议用 `curl` 测试。

## curl 测试 HTTP

查看响应内容：

```bash
curl http://localhost:8080
```

查看响应头：

```bash
curl -I http://localhost:8080
```

显示详细过程：

```bash
curl -v http://localhost:8080
```

带 Host 头测试 Nginx 虚拟主机：

```bash
curl -H "Host: example.com" http://127.0.0.1
```

测试接口耗时：

```bash
curl -o /dev/null -s -w "time_connect=%{time_connect} time_total=%{time_total}\n" http://localhost:8080
```

## 端口监听

查看 TCP 监听：

```bash
ss -lntp
```

查看 UDP 监听：

```bash
ss -lnup
```

查看连接状态：

```bash
ss -ant
```

常见 TCP 状态：

| 状态 | 含义 |
| --- | --- |
| `LISTEN` | 服务正在监听 |
| `ESTABLISHED` | 连接已建立 |
| `TIME-WAIT` | 连接关闭后的等待状态 |
| `SYN-SENT` | 正在发起连接 |
| `SYN-RECV` | 收到连接请求，等待确认 |

## 防火墙

CentOS/RHEL 常见 firewalld：

```bash
systemctl status firewalld
firewall-cmd --state
firewall-cmd --list-all
```

开放端口：

```bash
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload
```

移除端口：

```bash
firewall-cmd --permanent --remove-port=8080/tcp
firewall-cmd --reload
```

Ubuntu 常见 ufw：

```bash
ufw status
ufw allow 8080/tcp
ufw delete allow 8080/tcp
```

云服务器还要检查安全组。系统防火墙放行了，但云厂商安全组没放行，外部依然访问不到。

## 服务无法访问排查

以外部访问 `http://server:8080` 失败为例：

### 1. 服务是否启动

```bash
ps -ef | grep java
systemctl status justin-app
```

### 2. 端口是否监听

```bash
ss -lntp | grep :8080
```

如果没有监听，说明应用没有成功启动或监听端口不是 8080。

### 3. 本机是否能访问

```bash
curl -v http://127.0.0.1:8080
```

本机能访问，外部不能访问，重点查防火墙、安全组、监听地址。

### 4. 是否只监听 127.0.0.1

`ss` 结果如果是：

```text
127.0.0.1:8080
```

表示只允许本机访问。需要让应用监听 `0.0.0.0` 或通过 Nginx 转发。

### 5. 防火墙和安全组

```bash
firewall-cmd --list-ports
```

云服务器还要到控制台检查安全组入站规则。

## 常见问题

### Connection refused

通常表示目标机器可达，但端口没有服务监听，或服务拒绝连接。

排查：

```bash
ss -lntp | grep :端口
systemctl status 服务名
```

### Connection timed out

通常表示网络链路不通、防火墙拦截、安全组未开放、目标主机不可达。

排查：

```bash
ping 目标IP
traceroute 目标IP
firewall-cmd --list-all
```

### No route to host

通常是路由、防火墙或网络配置问题。

查看路由：

```bash
ip route
```

## 抓包

安装 tcpdump：

```bash
yum install -y tcpdump
```

抓某端口：

```bash
tcpdump -i any port 8080
```

抓某主机：

```bash
tcpdump -i any host 192.168.1.10
```

写入文件：

```bash
tcpdump -i any port 8080 -w app.pcap
```

抓包适合定位“请求有没有到服务器”“服务器有没有响应”。生产抓包要控制时间和范围，避免生成巨大文件。
