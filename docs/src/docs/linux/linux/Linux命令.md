# Linux命令
::: tip
- [Linux就该这么学](https://www.linuxprobe.com/)阅读笔记
- [Linux命令大全(手册)](https://www.linuxcool.com/)
:::

## 常用工作命令

- echo
  - 在终端设备上输出字符串或变量提取后的值，语法格式为“echo [字符串] [$变量]”。
- date
  - 显示或设置系统的时间与日期，语法格式为“date [+指定的格式]”

| 参数 | 作用                             |
| ---- | -------------------------------- |
| %S   | 秒（00～59）                     |
| %M   | 分钟（00～59）                   |
| %H   | 小时（00～23）                   |
| %I   | 小时（00～12）                   |
| %m   | 月份（1~12）                     |
| %p   | 显示出AM或PM                     |
| %a   | 缩写的工作日名称（例如：Sun）    |
| %A   | 完整的工作日名称（例如：Sunday） |
| %b   | 缩写的月份名称（例如：Jan）      |
| %B   | 完整的月份名称（例如：January）  |
| %q   | 季度（1~4）                      |
| %y   | 简写年份（例如：20）             |
| %Y   | 完整年份（例如：2020）           |
| %d   | 本月中的第几天                   |
| %j   | 今年中的第几天                   |
| %n   | 换行符（相当于按下回车键）       |
| %t   | 跳格（相当于按下Tab键）          |

- reboot
- poweroff
- wget 
  - -b 后台下载
  - -P 下载指定目录
- ps
  - 查看系统中的进程状态
- pstree
  - 树状图的形式展示进程之间的关系
- top
  - 动态地监视进程活动及系统负载等信息
::: tip
- 第1行：系统时间、运行时间、登录终端数、系统负载（3个数值分别为1分钟、5分钟、15分钟内的平均值，数值越小意味着负载越低）。

- 第2行：进程总数、运行中的进程数、睡眠中的进程数、停止的进程数、僵死的进程数。

- 第3行：用户占用资源百分比、系统内核占用资源百分比、改变过优先级的进程资源百分比、空闲的资源百分比等。其中数据均为CPU数据并以百分比格式显示，例如“99.9 id”意味着有99.9%的CPU处理器资源处于空闲。

- 第4行：物理内存总量、内存空闲量、内存使用量、作为内核缓存的内存量。

- 第5行：虚拟内存总量、虚拟内存空闲量、虚拟内存使用量、已被提前加载的内存量。
:::
- pidof
  - idof命令用于查询某个指定服务进程的PID号码值，语法格式为“pidof [参数] 服务名称”
- kill
- killall

## 系统状态检测命令

- **ifconfig**
  - 获取网卡配置与网络状态
- uname
  - 查看系统内核版本与系统架构
- uptime
  - 查看系统的负载信息
  - 显示当前系统时间、系统已运行时间、启用终端数量以及平均负载值等信息。平均负载值指的是系统在最近1分钟、5分钟、15分钟内的压力情况
- **free**
  - 内存
  - -h
- who
  - 查看当前登入主机的用户终端信息
- last
  - 调取主机的被访记录
- **ping**
  - 网络连通检测
- tracepath
  - 显示数据包到达目的主机时途中经过的所有路由信息，语法格式为“tracepath [参数] 域名”
- **netstat**
  - netstat命令用于显示如网络连接、路由表、接口状态等的网络相关信息

| -a   | 显示所有连接中的Socket   |
| ---- | :----------------------- |
| -p   | 显示正在使用的Socket信息 |
| -t   | 显示TCP协议的连接状态    |
| -u   | 显示UDP协议的连接状态    |
| -n   | 使用IP地址，不使用域名   |
| -l   | 仅列出正在监听的服务状态 |
| -i   | 显示网卡列表信息         |
| -r   | 显示路由表信息           |

- **history**
  - 显示执行过的命令历史
  - 自定义`/etc/profile`文件中的HISTSIZE变量值
  - 保存到了` ~/.bash_history`
  - 清空 -c
- sosreport
  - 收集系统配置及架构信息并输出诊断文档

## 查找定位文件命令

- pwd
  - 当前目录
- cd
  - cd .. ：返回到上级目录
  - cd ~ :返回到家目录
  - cd -  :返回到上一次目录
- ls
  - 显示目录中的文件信息
- tree
  - 树状图的形式列出目录内容及结构
- **find**
  - 指定条件来查找文件所对应的位置，语法格式为“find [查找范围] 寻找条件”

| 参数              | 作用                                                         |
| ----------------- | ------------------------------------------------------------ |
| -name             | 匹配名称                                                     |
| -perm             | 匹配权限（mode为完全匹配，-mode为包含即可）                  |
| -user             | 匹配所有者                                                   |
| -group            | 匹配所有组                                                   |
| -mtime -n +n      | 匹配修改内容的时间（-n指n天以内，+n指n天以前）               |
| -atime -n +n      | 匹配访问文件的时间（-n指n天以内，+n指n天以前）               |
| -ctime -n +n      | 匹配修改文件权限的时间（-n指n天以内，+n指n天以前）           |
| -nouser           | 匹配无所有者的文件                                           |
| -nogroup          | 匹配无所有组的文件                                           |
| -newer f1 !f2     | 匹配比文件f1新但比f2旧的文件                                 |
| -type b/d/c/p/l/f | 匹配文件类型（后面的字幕字母依次表示块设备、目录、字符设备、管道、链接文件、文本文件） |
| -size             | 匹配文件的大小（+50KB为查找超过50KB的文件，而-50KB为查找小于50KB的文件） |
| -prune            | 忽略某个目录                                                 |
| -exec …… {}\;     | 后面可跟用于进一步处理搜索结果的命令（下文会有演             |

- locate
  - 按照名称快速搜索文件所对应的位置，语法格式为“locate文件名称”
  - updatedb 配合 locate使用
- whereis
  - 按照名称快速搜索二进制程序（命令）、源代码以及帮助文件所对应的位置，语法格式为“whereis命令名称”
  - where ls / pwd
- which
  - 指定名称快速搜索二进制程序（命令）所对应的位置，语法格式为“which命令名称”
  - which命令是在PATH变量所指定的路径中，按照指定条件搜索命令所在的路径。也就是说，如果我们既不关心同名文件（find与locate），也不关心命令所对应的源代码和帮助文件（whereis），仅仅是想找到命令本身所在的路径，那么这个which命令就太合适了

## 文本文件编辑命令

- cat
  - 查看纯文本文件（内容较少）
  - -n
- more
  - 查看纯文本文件（内容较多）
- head
  - 查看纯文本文件的前*N*行，语法格式为“head [参数] 文件名称”
- tail
  - 查看纯文本文件的后*N*行或持续刷新文件的最新内容，语法格式为“tail [参数] 文件名称”
  - -f 持续
  - -n 行数
- tr
  - 替换文本内容中的字符 语法格式为“tr [原始字符] [目标字符]”
  - cat readme.txt | tr [a-z] [A-Z]
- wc
  - 统计指定文本文件的行数、字数或字节数,语法格式为“wc [参数] 文件名称”

| 参数 | 作用         |
| ---- | ------------ |
| -l   | 只显示行数   |
| -w   | 只显示单词数 |
| -c   | 只显示字节数 |

- stat
- stat
  - 查看文件的具体存储细节和时间等信息
- **grep**
  - 用于按行提取文本内容，语法格式为“grep [参数] 文件名称
  - ps -ef | grep xxx(redis/nginx)

| 参数 | 作用                                           |
| ---- | ---------------------------------------------- |
| -b   | 将可执行文件(binary)当作文本文件（text）来搜索 |
| -c   | 仅显示找到的行数                               |
| -i   | 忽略大小写                                     |
| -n   | 显示行号                                       |
| -v   | 反向选择——仅列出没有“关键词”的行。             |

- cut

  - 用于按“列”提取文本内容，语法格式为“cut [参数] 文件名称”

  - 使用-f参数设置需要查看的列数，还需要使用-d参数来设置间隔符号

  - ```
    cut -d : -f 1 /etc/passwd
    ```

- diff
  - 比较多个文件之间内容的差异
  - 使用--brief参数来确认两个文件是否相同，
  - 还可以使用-c参数来详细比较出多个文件的差异之处
- **uniq**
  - 去除文本中连续的重复行，语法格式为“uniq [参数] 文件名称”
- **sort**
  - 对文本内容进行再排序

| 参数 | 作用           |
| ---- | -------------- |
| -f   | 忽略大小写     |
| -b   | 忽略缩进与空格 |
| -n   | 以数值型排序   |
| -r   | 反向排序       |
| -u   | 去除重复行     |
| -t   | 指定间隔符     |
| -k   | 设置字段范围   |

## 文件目录管理命令

- touch
  - 创建空白文件或设置文件的时间

| 参数 | 作用                      |
| ---- | ------------------------- |
| -a   | 仅修改“读取时间”（atime） |
| -m   | 仅修改“修改时间”（mtime） |
| -d   | 同时修改atime与mtime      |

- **mkdir**
  - 创建空白的目录
  - -p 
- cp
  - 复制文件或目录

>如果目标文件是目录，则会把源文件复制到该目录中；
>
>如果目标文件也是普通文件，则会询问是否要覆盖它；
>
>如果目标文件不存在，则执行正常的复制操作。

| 参数 | 作用                                         |
| ---- | -------------------------------------------- |
| -p   | 保留原始文件的属性                           |
| -d   | 若对象为“链接文件”，则保留该“链接文件”的属性 |
| -r   | 递归持续复制（用于目录）                     |
| -i   | 若目标文件存在则询问是否覆盖                 |
| -a   | 相当于-pdr（p、d、r为上述参数）              |

- mv
  - 剪切或重命名文件
- rm
  - -f 
  - -r
- dd 
  - 按照指定大小和个数的数据块来复制文件或转换文件，语法格式为“dd if=参数值of=参数值count=参数值bs=参数值”。

| 参数  | 作用                 |
| ----- | -------------------- |
| if    | 输入的文件名称       |
| of    | 输出的文件名称       |
| bs    | 设置每个“块”的大小   |
| count | 设置要复制“块”的个数 |

```
dd if=/dev/cdrom of=RHEL-server-8.0-x86_64-LinuxProbe.Com.iso
 dd if=/dev/zero of=560_file count=1 bs=560M
```

- file

  - 查看文件的类型

- tar

  - ```bash
    # 解压到指定目录
    tar xzvf etc.tar.gz -C /root/etc 
    ```

  - ```bash
    tar czvf etc.tar.gz /etc
    ```

## 输入输出重定向

- 输入重定向是指把文件导入到命令中
- 输出重定向则是指把原本要输出到屏幕的数据信息写入到指定文件中

| 符号                 | 作用                                         |
| -------------------- | -------------------------------------------- |
| 命令 < 文件          | 将文件作为命令的标准输入                     |
| 命令 << 分界符       | 从标准输入中读入，直到遇见分界符才停止       |
| 命令 < 文件1 > 文件2 | 将文件1作为命令的标准输入并将标准输出到文件2 |

| 符号                               | 作用                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| 命令 > 文件                        | 将标准输出重定向到一个文件中（清空原有文件的数据）           |
| 命令 2> 文件                       | 将错误输出重定向到一个文件中（清空原有文件的数据）           |
| 命令 >> 文件                       | 将标准输出重定向到一个文件中（追加到原有内容的后面）         |
| 命令 2>> 文件                      | 将错误输出重定向到一个文件中（追加到原有内容的后面）         |
| 命令 >> 文件 2>&1 或 命令 &>> 文件 | 将标准输出与错误输出共同写入到文件中（追加到原有内容的后面） |

## 管道

**把前一个命令原本要输出到屏幕的信息当作后一个命令的标准输入**

```
grep /sbin/nologin /etc/passwd | wc -l
echo "linuxprobe" | passwd --stdin root
ps aux | grep bash
```

## 通配符

| 通配符      | 含义           |
| ----------- | -------------- |
| *           | 任意字符       |
| ?           | 单个任意字符   |
| [a-z]       | 单个小写字母   |
| [A-Z]       | 单个大写字母   |
| [a-Z]       | 单个字母       |
| [0-9]       | 单个数字       |
| [[:alpha:]] | 任意字母       |
| [[:upper:]] | 任意大写字母   |
| [[:lower:]] | 任意小写字母   |
| [[:digit:]] | 所有数字       |
| [[:alnum:]] | 任意字母加数字 |
| [[:punct:]] | 标点符号       |

## 转义字符

**反斜杠（\）**：使反斜杠后面的一个变量变为单纯的字符。

**单引号（' '）**：转义其中所有的变量为单纯的字符串。

**双引号（" "）**：保留其中的变量属性，不进行转义处理。

**反引号（\` \`）**：把其中的命令执行后返回结果。

## 环境变量

| 变量名称     | 作用                             |
| ------------ | -------------------------------- |
| HOME         | 用户的主目录（即家目录）         |
| SHELL        | 用户在使用的Shell解释器名称      |
| HISTSIZE     | 输出的历史命令记录条数           |
| HISTFILESIZE | 保存的历史命令记录条数           |
| MAIL         | 邮件保存路径                     |
| LANG         | 系统语言、语系名称               |
| RANDOM       | 生成一个随机数字                 |
| PS1          | Bash解释器的提示符               |
| PATH         | 定义解释器搜索用户执行命令的路径 |
| EDITOR       | 用户默认的文本编辑器             |

## 用户相关
::: tip
>**管理员UID为0**：系统的管理员用户。
>
>**系统用户UID为1～999**：Linux系统为了避免因某个服务程序出现漏洞而被黑客提权至整台服务器，默认服务程序会由独立的系统用户负责运行，进而有效控制被破坏范围。
>
>**普通用户UID从1000开始**：是由管理员创建的用于日常工作的用户。
:::
- id
  - 显示用户的详细信息,用户ID、基本组与扩展组GID
- useradd
  - 创建新的用户账户

| 参数 | 作用                                     |
| ---- | ---------------------------------------- |
| -d   | 指定用户的家目录（默认为/home/username） |
| -e   | 账户的到期时间，格式为YYYY-MM-DD.        |
| -u   | 指定该用户的默认UID                      |
| -g   | 指定一个初始的用户基本组（必须已存在）   |
| -G   | 指定一个或多个扩展用户组                 |
| -N   | 不创建与用户同名的基本用户组             |
| -s   | 指定该用户的默认Shell解释器              |

- groupadd
  - 创建新的用户组
- usermod
  - 用于修改用户的属性

| 参数  | 作用                                                         |
| ----- | ------------------------------------------------------------ |
| -c    | 填写用户账户的备注信息                                       |
| -d -m | 参数-m与参数-d连用，可重新指定用户的家目录并自动把旧的数据转移过去 |
| -e    | 账户的到期时间，格式为YYYY-MM-DD                             |
| -g    | 变更所属用户组                                               |
| -G    | 变更扩展用户组                                               |
| -L    | 锁定用户禁止其登录系统                                       |
| -U    | 解锁用户，允许其登录系统                                     |
| -s    | 变更默认终端                                                 |
| -u    | 修改用户的UID                                                |

- **passwd**
  - 修改用户的密码、过期时间

| 参数    | 作用                                                         |
| ------- | ------------------------------------------------------------ |
| -l      | 锁定用户，禁止其登录                                         |
| -u      | 解除锁定，允许用户登录                                       |
| --stdin | 允许通过标准输入修改用户密码，如echo "NewPassWord" \| passwd --stdin Username |
| -d      | 使该用户可用空密码登录系统                                   |
| -e      | 强制用户在下次登录时修改密码                                 |
| -S      | 显示用户的密码是否被锁定，以及密码所采用的加密算法名称       |

- **userdel**
  - 删除已有的用户账户

| 参数 | 作用                     |
| ---- | ------------------------ |
| -f   | 强制删除用户             |
| -r   | 同时删除用户及用户家目录 |

## 文件权限和归属

![读写执行权限对于文件与目录可执行命令的区别](https://www.linuxprobe.com/wp-content/uploads/2020/05/%E8%AF%BB%E5%86%99%E6%89%A7%E8%A1%8C%E6%9D%83%E9%99%90%E5%AF%B9%E4%BA%8E%E6%96%87%E4%BB%B6%E4%B8%8E%E7%9B%AE%E5%BD%95%E7%9A%84%E4%BD%9C%E7%94%A8-1536x252.png)

![文件权限的字符与数字表示](https://www.linuxprobe.com/wp-content/uploads/2020/05/%E6%96%87%E4%BB%B6%E6%9D%83%E9%99%90%E7%9A%84%E5%AD%97%E7%AC%A6%E4%B8%8E%E6%95%B0%E5%AD%97%E8%A1%A8%E7%A4%BA-1536x302.png)

常见的文件类型包括

- 普通文件（-）
- 目录文件（d）
- 链接文件（l）
- 管道文件（p）
- 块设备文件（b）
- 字符设备文件（c）

## 文件的特殊权限

- **SUID**
  - SUID是一种对二进制程序进行设置的特殊权限，能够让二进制程序的执行者临时拥有所有者的权限（仅对拥有执行权限的二进制程序有效）

```
[root@linuxprobe ~]# ls -l /etc/shadow
----------. 1 root root 1312 Jul 21 05:08 /etc/shadow
[root@linuxprobe ~]# ls -l /bin/passwd 
-rwsr-xr-x. 1 root root 34512 Aug 13 2018 /bin/passwd
```

- **SGID**
  - 当对二进制程序进行设置时，能够让执行者临时获取文件所属组的权限；
  - 当对目录进行设置时，则是让目录内新创建的文件自动继承该目录原有用户组的名称。

```
ot@linuxprobe tmp]# mkdir testdir
[root@linuxprobe tmp]# ls -ald testdir
drwxr-xr-x. 2 root root 6 Oct 27 23:44 testdir
[root@linuxprobe tmp]# chmod -R 777 testdir
[root@linuxprobe tmp]# chmod -R g+s testdir
[root@linuxprobe tmp]# ls -ald testdir
drwxrwsrwx. 2 root root 6 Oct 27 23:44 testdir
```

- chmod
  - 设置文件的一般权限及特殊权限

| 参数 | 作用         |
| ---- | ------------ |
| u+s  | 设置SUID权限 |
| u-s  | 取消SUID权限 |
| g+s  | 设置SGID权限 |
| g-s  | 取消SGID权限 |
| o+t  | 设置SBIT权限 |
| o-t  | 取消SBIT权限 |

- chown

  - 设置文件的所有者和所有组,chown 所有者:所有组 文件名

  - ```
    chown linuxprobe:linuxprobe anaconda-ks.cfg
    ```

- SBIT

  - 某个目录设置了SBIT粘滞位权限后，那么该目录中的文件就只能被其所有者执行删除操作了。

  - /tmp默认有SBIT权限

  - 文件的其他用户权限部分的x执行权限就会被替换成t或者T—原本有x执行权限则会写成t，原本没有x执行权限则会被写成T。

  - ```
    [root@linuxprobe ~]# ls -ald /tmp
    drwxrwxrwt. 17 root root 4096 Oct 28 00:29 /tmp
    ```

## 文件的隐藏权限

- **chattr**
  - 设置文件的隐藏权限

| 参数 | 作用                                                         |
| ---- | ------------------------------------------------------------ |
| i    | 无法对文件进行修改；若对目录设置了该参数，则仅能修改其中的子文件内容而不能新建或删除文件 |
| a    | 仅允许补充（追加）内容，无法覆盖/删除内容（Append Only）     |
| S    | 文件内容在变更后立即同步到硬盘（sync）                       |
| s    | 彻底从硬盘中删除，不可恢复（用0填充原文件所在硬盘区域）      |
| A    | 不再修改这个文件或目录的最后访问时间（atime）                |
| b    | 不再修改文件或目录的存取时间                                 |
| D    | 检查压缩文件中的错误                                         |
| d    | 使用dump命令备份时忽略本文件/目录                            |
| c    | 默认将文件或目录进行压缩                                     |
| u    | 当删除该文件后依然保留其在硬盘中的数据，方便日后恢复         |
| t    | 让文件系统支持尾部合并（tail-merging）                       |
| x    | 可以直接访问压缩文件中的内容                                 |

- **lsattr**
  - 查看文件的隐藏权限

## 文件访问控制列表

一般权限、特殊权限、隐藏权限其实有一个共性—权限是针对某一类用户设置的，能够对很多人同时生效。如果希望对某个指定的用户进行单独的权限控制，就需要用到文件的访问控制列表（ACL）了。通俗来讲，基于普通文件或目录设置ACL其实就是针对指定的用户或用户组设置文件或目录的操作权限，更加精准地派发权限。另外，如果针对某个目录设置了ACL，则目录中的文件会继承其ACL权限；若针对文件设置了ACL，则文件不再继承其所在目录的ACL权限

- **setfacl**

  - 管理文件的ACL权限规则

  - **针对单一用户或用户组、单一文件或目录来进行读/写/执行权限的控制**

| 参数 | 作用             |
| ---- | ---------------- |
| -m   | 修改权限         |
| -M   | 从文件中读取权限 |
| -x   | 删除某个权限     |
| -b   | 删除全部权限     |
| -R   | 递归子目录       |

```bash
[root@linuxprobe ~]# setfacl -Rm u:linuxprobe:rwx /root
```

```bash
#文件权限的最后一个点（.）变成了加号（+），这就意味着该文件已经设置了ACL
[root@linuxprobe ~]# ls -ld /root
dr-xrwx---+ 14 root root 4096 May 4 2020 /root
```

- **getfacl**
  - 查看文件的ACL权限规则

```
[root@linuxprobe /]# setfacl --restore backup.acl
```

## su命令和sudo 服务

- su命令
  - 可以解决切换用户身份的需求，使得当前用户在不退出登录的情况下，顺畅地切换到其他用户
- sudo命令
  - 用于给普通用户提供额外的权限，语法格式为“sudo [参数] 用户名”。

| 参数             | 作用                                                   |
| ---------------- | ------------------------------------------------------ |
| -h               | 列出帮助信息                                           |
| -l               | 列出当前用户可执行的命令                               |
| -u 用户名或UID值 | 以指定的用户身份执行命令                               |
| -k               | 清空密码的有效时间，下次执行sudo时需要再次进行密码验证 |
| -b               | 在后台执行指定的命令                                   |
| -p               | 更改询问密码的提示语                                   |

使用sudo命令提供的visudo命令来配置用户权限

按照下面的格式在第101行（大约）填写上指定的信息。
::: warning

 **谁可以使用 允许使用的主机 = （以谁的身份） 可执行命令的列表**

 **谁可以使用：**稍后要为哪位用户进行命令授权。

 **允许使用的主机：**可以填写ALL表示不限制来源的主机，亦可填写如192.168.10.0/24这样的网段限制来源地址，使得只有从允许网段登录时才能使用sudo命令。

 **以谁的身份：**可以填写ALL表示系统最高权限，也可以是另外一位用户的名字。

 **可执行命令的列表：**可以填写ALL表示不限制命令，亦可填写如/usr/bin/cat这样的文件名称来限制命令列表，多个命令文件之间用逗号（,）间隔。
:::
```
[root@linuxprobe ~]# visudo
 99 ## Allow root to run any commands anywhere
100 root ALL=(ALL) ALL
101 linuxprobe ALL=(ALL) ALL
```

```bash
[root@linuxprobe ~]# visudo
 99 ## Allow root to run any commands anywhere
100 root ALL=(ALL) ALL
101 linuxprobe ALL=(ALL) /usr/bin/cat,/usr/sbin/reboot
# 或
101 linuxprobe ALL=(ALL) NOPASSWD:/usr/bin/cat,/usr/sbin/reboot
```

## Vim文本编辑器
::: tip
**命令模式**：控制光标移动，可对文本进行复制、粘贴、删除和查找

**输入模式**：文本录入

**末行模式**：保存或退出文档，以及设置编辑环境
:::
- 命令模式命令

  | 命令 | 作用                                               |
  | ---- | -------------------------------------------------- |
  | dd   | 删除（剪切）光标所在的行                           |
  | 5dd  | 删除（剪切）光标处开始的行                         |
  | yy   | 复制光标所在整行                                   |
  | 5dd  | 复制从光标处开始的5行                              |
  | n    | 显示搜索命令定位到的下一个字符串                   |
  | N    | 显示搜索命令定位到的上一个字符串                   |
  | u    | 撤销上一步的操作                                   |
  | p    | 将之前删除（dd）或复制（yy）过的数据粘贴到光标后面 |

- 末行模式（命令行输入一个冒号）命令

  | 命令          | 作用                                 |
  | ------------- | ------------------------------------ |
  | :w            | 保存                                 |
  | :q            | 退出                                 |
  | :q!           | 强制退出（放弃对文档的修改内容）     |
  | :wq!          | 强制保存退出                         |
  | :set nu       | 显示行号                             |
  | :set nonu     | 不显示行号                           |
  | :命令         | 执行该命令                           |
  | :整数         | 跳转到该行                           |
  | \:s/one/two    | 将当前光标所在行的第一个one替换成two |
  | \:s/one/two/g  | 将当前光标所在行的所有one替换成two   |
  | :%s/one/two/g | 将全文中的所有one替换成two           |
  | ?字符串       | 在文本中从下至上搜索该字符串         |
  | /字符串       | 在文本中从上至下搜索该字符串-        |

## 防火墙（iptables 和 firewalld）

- 防火墙按照从上至下顺序读取配置信息，找到匹配就去`放行` 和`阻止`
- 如果在读取完所有的策略规则之后没有匹配项，就去执行默认的策略

### iptables

`iptables`服务把用于处理或过滤流量的策略条目称之为规则，多条规则可以组成一个规则链，而规则链则依据数据包处理位置的不同进行分类，具体如下：
::: tip
 在进行路由选择前处理数据包（`PREROUTING`）；

 处理流入的数据包（`INPUT`）；

 处理流出的数据包（`OUTPUT`）；

 处理转发的数据包（`FORWARD`）；

 在进行路由选择后处理数据包（`POSTROUTING`）。
:::
`iptables`服务的术语中分别是

- ACCEPT（允许流量通过）
- REJECT（拒绝流量通过,拒绝流量后再回复一条“信息已经收到，但是被扔掉了）
- LOG（记录日志信息）
- DROP（拒绝流量通过,直接将流量丢弃而且不响应）

` iptables`中常用的参数以及作用

| 参数        | 作用                                         |
| ----------- | -------------------------------------------- |
| -P          | 设置默认策略                                 |
| -F          | 清空规则链                                   |
| -L          | 查看规则链                                   |
| -A          | 在规则链的末尾加入新规则                     |
| -I num      | 在规则链的头部加入新规则                     |
| -D num      | 删除某一条规则                               |
| -s          | 匹配来源地址IP/MASK，加叹号“!”表示除这个IP外 |
| -d          | 匹配目标地址                                 |
| -i 网卡名称 | 匹配从这块网卡流入的数据                     |
| -o 网卡名称 | 匹配从这块网卡流出的数据                     |
| -p          | 匹配协议，如TCP、UDP、ICMP                   |
| --dport num | 匹配目标端口号                               |
| --sport num | 匹配来源端口号                               |

### 命令

1. **查看防火墙规则链**

```bash
iptables -L
```

2. **清除防火墙规则链**

```bash
iptables -F
```

3. **把INPUT规则链的默认策略设置为拒绝**

```bash
# INPUT链设置为默认拒绝后，就要往里面写入允许策略,否则流入所有数据包默认被拒绝
iptables -P INPUT DROP
```

4. **向INPUT链中添加允许ICMP流量进入的策略规则**

```bash
# 添加允许ping
iptables -I INPUT -p icmp -j ACCEPT
ping -c www.baidu.com
```

5. **删除INPUT规则链中刚刚加入的那条策略（允许ICMP流量），并把默认策略设置为允许**

使用-F参数会清空已有的所有防火墙策略；使用-D参数可以删除某一条指定的策略，因此更加安全和准确

```bash
iptables -D INPUT 1
iptables -P INPUT ACCEPT
```

6. **将INPUT规则链设置为只允许指定网段的主机访问本机的22端口，拒绝来自其他所有主机的流量。**

要对某台主机进行匹配，可直接写出它的IP地址；如需对网段进行匹配，则需要写为子网掩码的形式（比如192.168.10.0/24）。

```
iptables -I INPUT -s 192.168.10.0/24 -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j REJECT
iptables -L
```

再次重申，防火墙策略规则是按照从上到下的顺序匹配的，因此一定要把允许动作放到拒绝动作前面，否则所有的流量就将被拒绝掉，从而导致任何主机都无法访问我们的服务。

在设置完上述INPUT规则链之后，使用IP地址在192.168.10.0/24网段内的主机访问服务器（即前面提到的设置了INPUT规则链的主机）的22端口，效果如下：

```
[root@Client A ~]# ssh 192.168.10.10
The authenticity of host '192.168.10.10 (192.168.10.10)' can't be established.
ECDSA key fingerprint is SHA256:5d52kZi1la/FJK4v4jibLBZhLqzGqbJAskZiME6ZXpQ.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '192.168.10.10' (ECDSA) to the list of known hosts.
root@192.168.10.10's password: 此处输入服务器密码
Activate the web console with: systemctl enable --now cockpit.socket

Last login: Wed Jan 20 16:30:28 2021 from 192.168.10.1
```

然后，再使用IP地址在192.168.20.0/24网段内的主机访问服务器的22端口（虽网段不同，但已确认可以相互通信），效果如下：

```
[root@Client B ~]# ssh 192.168.10.10
Connecting to 192.168.10.10:22...
Could not connect to '192.168.10.10' (port 22): Connection failed.
```

由上可以看到，提示连接请求被拒绝了（Connection failed）。

7. **向INPUT规则链中添加拒绝所有人访问本机12345端口的策略规则。**

```
iptables -I INPUT -p tcp --dport 12345 -j REJECT
iptables -I INPUT -p udp --dport 12345 -j REJECT
iptables -L
```

8. **向INPUT规则链中添加拒绝192.168.10.5主机访问本机80端口（Web服务）的策略规则。**

```
iptables -I INPUT -p tcp -s 192.168.10.5 --dport 80 -j REJECT
iptables -L
```

8. **向INPUT规则链中添加拒绝所有主机访问本机1000～1024端口的策略规则。**

前面在添加防火墙策略时，使用的是-I参数，它默认会把规则添加到最上面的位置，因此优先级是最高的。如果工作中需要添加一条最后“兜底”的规则，那就用-A参数吧。这两个参数的效果差别还是很大的：

```
iptables -A INPUT -p tcp --dport 1000:1024 -j REJECT
iptables -A INPUT -p udp --dport 1000:1024 -j REJECT
iptables -L
```

但是请特别注意，使用iptables命令配置的防火墙规则默认会在系统下一次重启时失效，如果想让配置的防火墙策略永久生效，还要执行保存命令：

```
iptables-save 
```

对了，如果公司服务器是5/6/7版本的话，对应的保存命令应该是：

```
service iptables save
```

### firewalld

firewalld支持动态更新技术并加入了区域（zone）的概念。区域就是firewalld预先准备了几套防火墙策略集合（策略模板），用户可以根据生产场景的不同而选择合适的策略集合，从而实现防火墙策略之间的快速切换。

| 区域     | 默认规则策略                                                 |
| -------- | ------------------------------------------------------------ |
| trusted  | 允许所有的数据包                                             |
| home     | 拒绝流入的流量，除非与流出的流量相关；而如果流量与ssh、mdns、ipp-client、amba-client与dhcpv6-client服务相关，则允许流量 |
| internal | 等同于home区域                                               |
| work     | 拒绝流入的流量，除非与流出的流量相关；而如果流量与ssh、ipp-client与dhcpv6-client服务相关，则允许流量 |
| public   | 拒绝流入的流量，除非与流出的流量相关；而如果流量与ssh、dhcpv6-client服务相关，则允许流量 |
| external | 拒绝流入的流量，除非与流出的流量相关；而如果流量与ssh服务相关，则允许流量 |
| dmz      | 拒绝流入的流量，除非与流出的流量相关；而如果流量与ssh服务相关，则允许流量 |
| block    | 拒绝流入的流量，除非与流出的流量相关                         |
| drop     | 拒绝流入的流量，除非与流出的流量相关                         |

  firewall-cmd命令中使用的参数以及作用

| 参数                          | 作用                                                 |
| ----------------------------- | ---------------------------------------------------- |
| --get-default-zone            | 查询默认的区域名称                                   |
| --set-default-zone=<区域名称> | 设置默认的区域，使其永久生效                         |
| --get-zones                   | 显示可用的区域                                       |
| --get-services                | 显示预先定义的服务                                   |
| --get-active-zones            | 显示当前正在使用的区域与网卡名称                     |
| --add-source=                 | 将源自此IP或子网的流量导向指定的区域                 |
| --remove-source=              | 不再将源自此IP或子网的流量导向某个指定区域           |
| --add-interface=<网卡名称>    | 将源自该网卡的所有流量都导向某个指定区域             |
| --change-interface=<网卡名称> | 将某个网卡与区域进行关联                             |
| --list-all                    | 显示当前区域的网卡配置参数、资源、端口以及服务等信息 |
| --list-all-zones              | 显示所有区域的网卡配置参数、资源、端口以及服务等信息 |
| --add-service=<服务名>        | 设置默认区域允许该服务的流量                         |
| --add-port=<端口号/协议>      | 设置默认区域允许该端口的流量                         |
| --remove-service=<服务名>     | 设置默认区域不再允许该服务的流量                     |
| --remove-port=<端口号/协议>   | 设置默认区域不再允许该端口的流量                     |
| --reload                      | 让“永久生效”的配置规则立即生效，并覆盖当前的配置规则 |
| --panic-on                    | 开启应急状况模式                                     |
| --panic-off                   | 关闭应急状况模式                                     |

>与Linux系统中其他的防火墙策略配置工具一样，使用firewalld配置的防火墙策略默认为运行时（Runtime）模式，又称为当前生效模式，而且会随着系统的重启而失效。如果想让配置策略一直存在，就需要使用永久（Permanent）模式了，方法就是在用firewall-cmd命令正常设置防火墙策略时添加--permanent参数，这样配置的防火墙策略就可以永久生效了。但是，永久生效模式有一个“不近人情”的特点，就是使用它设置的策略只有在系统重启之后才能自动生效。如果想让配置的策略立即生效，需要手动执行firewall-cmd --reload命令。

Runtime：当前立即生效，重启后失效。

Permanent：当前不生效，重启后生效。

**1．查看firewalld服务当前所使用的区域。**

在配置防火墙策略前，必须查看当前生效的是哪个区域，否则配置的防火墙策略将不会立即生效。

```
[root@linuxprobe ~]# firewall-cmd --get-default-zone
public
```

**2．查询指定网卡在firewalld服务中绑定的区域。**

可以根据网卡针对的流量来源，为网卡绑定不同的区域，实现对防火墙策略的灵活管控。

```
[root@linuxprobe ~]# firewall-cmd --get-zone-of-interface=ens160
public
```

**3．把网卡默认区域修改为external，并在系统重启后生效。**

```
[root@linuxprobe ~]# firewall-cmd --permanent --zone=external --change-interface=ens160
The interface is under control of NetworkManager, setting zone to 'external'.
success
[root@linuxprobe ~]# firewall-cmd --permanent --get-zone-of-interface=ens160
external
```

**4．把firewalld服务的默认区域设置为public。**

默认区域也叫全局配置，指的是对所有网卡都生效的配置，优先级较低

```
[root@linuxprobe ~]# firewall-cmd --set-default-zone=public
Warning: ZONE_ALREADY_SET: public
success
[root@linuxprobe ~]# firewall-cmd --get-default-zone 
public
[root@linuxprobe ~]# firewall-cmd --get-zone-of-interface=ens160
externa
```

**5．启动和关闭firewalld防火墙服务的应急状况模式。**

使用--panic-on参数会立即切断一切网络连接，而使用--panic-off则会恢复网络连接。切记，紧急模式会切断一切网络连接，因此在远程管理服务器时，在按下回车键前一定要三思。

```
[root@linuxprobe ~]# firewall-cmd --panic-on
success
[root@linuxprobe ~]# firewall-cmd --panic-off
success
```

**6．查询SSH和HTTPS协议的流量是否允许放行。**

在工作中可以不使用--zone参数指定区域名称，firewall-cmd命令会自动依据默认区域进行查询，从而减少用户输入量。但是，如果默认区域与网卡所绑定的不一致时，就会发生冲突，因此规范写法的zone参数是一定要加的。

```
[root@linuxprobe ~]# firewall-cmd --zone=public --query-service=ssh
yes
[root@linuxprobe ~]# firewall-cmd --zone=public --query-service=https
no
```

**7．把HTTPS协议的流量设置为永久允许放行，并立即生效。**

```
[root@linuxprobe ~]# firewall-cmd --permanent --zone=public --add-service=https
success
[root@linuxprobe ~]# firewall-cmd --zone=public --query-service=https
no
```

不想重启服务器的话，就用--reload参数吧：

```
[root@linuxprobe ~]# firewall-cmd --reload
success
[root@linuxprobe ~]# firewall-cmd --zone=public --query-service=https
yes
```

**8．把HTTP协议的流量设置为永久拒绝，并立即生效。**

由于在默认情况下HTTP协议的流量就没有被允许，所以会有“Warning: NOT_ENABLED: http”这样的提示信息，因此对实际操作没有影响。

```
[root@linuxprobe ~]# firewall-cmd --permanent --zone=public --remove-service=http
Warning: NOT_ENABLED: http
success
[root@linuxprobe ~]# firewall-cmd --reload 
success
```

**9．把访问8080和8081端口的流量策略设置为允许，但仅限当前生效。**

```
[root@linuxprobe ~]# firewall-cmd --zone=public --add-port=8080-8081/tcp
success
[root@linuxprobe ~]# firewall-cmd --zone=public --list-ports
8080-8081/tcp
```

**10．把原本访问本机888端口的流量转发到22端口，要且求当前和长期均有效。**

通过这项技术，新的端口号在收到用户请求后会自动转发到原本服务的端口上，使得用户能够通过新的端口访问到原本的服务。

> firewall-cmd --permanent --zone=**<区域>** --add-forward-port=port=<源端口号>:proto=**<协议>**:toport=**<目标端口号>**:toaddr=**<目标IP地址>**

上述命令中的目标IP地址一般是服务器本机的IP地址：

```
[root@linuxprobe ~]# firewall-cmd --permanent --zone=public --add-forward-port=port=888:proto=tcp:toport=22:toaddr=192.168.10.10
success
[root@linuxprobe ~]# firewall-cmd --reload
success
```

在客户端使用ssh命令尝试访问192.168.10.10主机的888端口，访问成功：

```
[root@client A ~]# ssh -p 888 192.168.10.10
The authenticity of host '[192.168.10.10]:888 ([192.168.10.10]:888)' can't be established.
ECDSA key fingerprint is b8:25:88:89:5c:05:b6:dd:ef:76:63:ff:1a:54:02:1a.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '[192.168.10.10]:888' (ECDSA) to the list of known hosts.
root@192.168.10.10's password:此处输入远程root管理员的密码
Last login: Sun Jul 19 21:43:48 2021 from 192.168.10.10
```

**11．**富规则的设置。

富规则也叫复规则，表示更细致、更详细的防火墙策略配置，它可以针对系统服务、端口号、源地址和目标地址等诸多信息进行更有针对性的策略配置。它的优先级在所有的防火墙策略中也是最高的。比如，我们可以在firewalld服务中配置一条富规则，使其拒绝192.168.10.0/24网段的所有用户访问本机的ssh服务（22端口）：

```
[root@linuxprobe ~]# firewall-cmd --permanent --zone=public --add-rich-rule="rule family="ipv4" source address="192.168.10.0/24" service name="ssh" reject"
success
[root@linuxprobe ~]# firewall-cmd --reload
success
```

在客户端使用ssh命令尝试访问192.168.10.10主机的ssh服务（22端口）：

```
[root@client A ~]# ssh 192.168.10.10
Connecting to 192.168.10.10:22...
Could not connect to '192.168.10.10' (port 22): Connection failed.
```