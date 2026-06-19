---
title: Nginx 入门与反向代理
---

# Nginx 入门与反向代理

Nginx 常用于静态资源托管、反向代理、负载均衡、HTTPS 入口、接口转发。对于个人博客、前后端分离项目、Java 服务部署，Nginx 是非常常见的生产组件。

## Nginx 能做什么

| 能力 | 说明 |
| --- | --- |
| 静态资源服务 | 托管 HTML、CSS、JS、图片 |
| 反向代理 | 把外部请求转发到后端服务 |
| 负载均衡 | 将请求分发到多个后端实例 |
| HTTPS | 配置证书，提供 TLS 加密 |
| 路由转发 | 根据域名、路径转发到不同服务 |
| 限流 | 控制请求频率，保护后端 |

## 安装

CentOS：

```bash
yum install -y nginx
systemctl enable nginx
systemctl start nginx
systemctl status nginx
```

Ubuntu：

```bash
apt update
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

查看版本：

```bash
nginx -v
```

检查配置：

```bash
nginx -t
```

重新加载配置：

```bash
nginx -s reload
```

或：

```bash
systemctl reload nginx
```

## 配置文件结构

常见路径：

| 路径 | 说明 |
| --- | --- |
| `/etc/nginx/nginx.conf` | 主配置 |
| `/etc/nginx/conf.d/*.conf` | 子配置 |
| `/usr/share/nginx/html` | 默认静态目录 |
| `/var/log/nginx/access.log` | 访问日志 |
| `/var/log/nginx/error.log` | 错误日志 |

主配置大致结构：

```nginx
user nginx;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name example.com;

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
```

## 静态资源托管

创建配置：

```nginx
server {
    listen 80;
    server_name example.com;

    root /opt/site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

适合 Vue、React 等 SPA 项目。`try_files` 的作用是：如果请求的文件不存在，就返回 `index.html`，让前端路由接管。

部署流程：

```bash
mkdir -p /opt/site/dist
cp -r dist/* /opt/site/dist/
nginx -t
systemctl reload nginx
```

## 反向代理 Spring Boot

后端服务监听本机 8080：

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

请求流程：

```text
浏览器
  -> Nginx:80
  -> Spring Boot:8080
```

后端日志里如果需要真实客户端 IP，要读取 `X-Forwarded-For` 或配合框架配置。

## 前后端分离部署

同一个域名下：

```nginx
server {
    listen 80;
    server_name example.com;

    root /opt/site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

注意 `proxy_pass` 后面是否带 `/` 会影响路径转发。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/;
}
```

请求 `/api/users` 会转发到后端 `/users`。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
}
```

请求 `/api/users` 会转发到后端 `/api/users`。

## 负载均衡

```nginx
upstream app_backend {
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

常见策略：

- 默认轮询。
- `weight` 权重。
- `ip_hash` 按客户端 IP 固定后端。

权重示例：

```nginx
upstream app_backend {
    server 127.0.0.1:8081 weight=3;
    server 127.0.0.1:8082 weight=1;
}
```

## 日志

访问日志：

```bash
tail -f /var/log/nginx/access.log
```

错误日志：

```bash
tail -f /var/log/nginx/error.log
```

常见状态码：

| 状态码 | 含义 |
| --- | --- |
| 200 | 成功 |
| 301/302 | 重定向 |
| 403 | 无权限或目录不可访问 |
| 404 | 资源不存在 |
| 499 | 客户端主动断开 |
| 500 | 后端或 Nginx 内部错误 |
| 502 | 后端不可用或网关错误 |
| 504 | 后端响应超时 |

## 常见故障

### 403 Forbidden

排查：

```bash
ls -ld /opt/site /opt/site/dist
ls -l /opt/site/dist
```

常见原因：

- Nginx 用户没有目录权限。
- `index.html` 不存在。
- SELinux 限制。

### 404 Not Found

常见原因：

- `root` 路径不正确。
- 文件没有部署到目标目录。
- SPA 没有配置 `try_files`。

### 502 Bad Gateway

常见原因：

- 后端服务没启动。
- `proxy_pass` 地址错误。
- 后端端口未监听。
- 防火墙阻断。

排查：

```bash
ss -lntp | grep 8080
curl -v http://127.0.0.1:8080
tail -f /var/log/nginx/error.log
```

### 504 Gateway Timeout

后端响应超时。

可以临时调整：

```nginx
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
proxy_send_timeout 60s;
```

但根本上要排查后端为什么慢，例如数据库慢查询、线程池满、外部接口慢。
