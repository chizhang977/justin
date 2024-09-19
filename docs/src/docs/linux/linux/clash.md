# `Linux`环境下安装`clash`
### `config.yaml`
`https://xn--4gq62f52gdss.ink/#/login`
### `docker-compose.yaml`
```yaml
version: "3"

services:
  clash:
    image: dreamacro/clash-premium
    container_name: clash
    hostname: clash
    privileged: true
    restart: unless-stopped
    ports:
      - 7890:7890
      - 7891:7891
      - 7892:7892
      - 9090:9090
    volumes:
      - /home/justin-ubuntu/clash/config.yaml:/root/.config/clash/config.yaml
    environment:
      - TZ=Asia/Shanghai

  yacd:
    image: haishanh/yacd:latest
    container_name: yacd
    hostname: yacd
    restart: unless-stopped
    ports:
      - 9091:80
    environment:
      - TZ=Asia/Shanghai
    depends_on:
      - clash
```
### 软件包
[clash-premium和yacd](/software/clash.zip)
### 启动
```bash
docker-compose up -d
```
### 测试
```bash
export https_proxy=http://127.0.0.1:7890 
export http_proxy=http://127.0.0.1:7890 
export all_proxy=socks5://127.0.0.1:7891
```
```bash
curl https://www.google.com
```
### 停止
```bash
unset https_proxy    
unset  http_proxy
unset all_proxy
```
