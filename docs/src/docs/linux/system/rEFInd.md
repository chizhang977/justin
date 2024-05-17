# reFInd
`rEFInd（rod EFI Finder）`是一个开源的 `UEFI` 启动管理器，它的功能类似于 `GRUB`，但专为 `UEFI` 固件设计。rEFInd 可以帮助用户在启动时选择操作系统，并且支持多种操作系统，包括 `Linux`、`Windows` 和 `macOS`。它的图形化界面和丰富的功能使得管理多重引导配置变得更加容易。

## `rEFInd` 的特点
- 图形化界面：`rEFInd` 提供一个易于使用的图形化启动界面，支持图标和背景图片。
- 多操作系统支持：`rEFInd` 支持多种操作系统，包括 `Linux`、`Windows` 和 `macOS`。
- 自动检测内核：`rEFInd` 可以自动检测和启动 `Linux` 内核，无需手动配置。
- 模块化配置：`rEFInd` 的配置文件使用简洁的文本格式，易于编辑和定制。
- 主题支持：`rEFInd` 支持自定义主题和图标，用户可以根据自己的喜好进行定制。
## 安装 `rEFInd`
- 下载 `rEFInd`
  首先，从`rEFInd`的 [官方网站](https://www.rodsbooks.com/refind/) 或其 `GitHub` 仓库 下载最新版本的 [rEFInd](https://sourceforge.net/projects/refind/)。
- 安装 `rEFInd`
在 `Linux` 上安装
假设你的系统已经使用 UEFI 启动，并且已经安装了 `Linux` 和其他操作系统。

解压下载的 `rEFInd` 压缩包：
```sh
unzip refind-bin-*.zip
```
进入解压后的目录：
```sh
cd refind-bin-*/refind
```
安装 `rEFInd`：
```sh
sudo ./refind-install
```
该命令会自动检测你的 `EFI` 系统分区并将 `rEFInd` 安装到该分区。

## 在 `Windows` 上安装
解压下载的 `rEFInd` 压缩包。

进入解压后的目录。

将 `rEFInd` 文件复制到 `EFI` 系统分区：
```sh
xcopy /s refind-bin-*/refind "Z:\EFI\refind"
```
假设 Z: 是你的 `EFI` 系统分区的驱动器号。

设置 `rEFInd` 为默认启动项：
在管理员模式下运行命令提示符并执行以下命令：

```sh
bcdedit /set {bootmgr} path \EFI\refind\refind_x64.efi
```
## 配置 rEFInd
rEFInd 的配置文件是 refind.conf，通常位于 /boot/efi/EFI/refind/ 目录下。你可以编辑该文件以定制启动菜单和其他选项。

-  配置示例
以下是一个基本的 refind.conf 配置文件示例：

```sh
# Enable menu screen saver.
screensaver 30

# Hide the user interface unless a key is pressed.
scan_delay 5

# Enable scanning for Linux and Windows.
scanfor manual,external,hdbios

# Icons for the loaders.
default_selection 1

# Timeout to auto-boot.
timeout 20

# Text-mode font for screen.
textonly off

# Add a manual boot entry for a Linux kernel.
menuentry "Linux" {
    loader vmlinuz-5.4.0-26-generic
    initrd initrd.img-5.4.0-26-generic
    options "root=/dev/sda2 ro"
    icon /EFI/refind/icons/os_linux.png
}

# Add a manual boot entry for Windows.
menuentry "Windows" {
    loader \EFI\Microsoft\Boot\bootmgfw.efi
    icon /EFI/refind/icons/os_win.png
}
```
## 使用 `rEFInd` 启动多个系统
启动 `rEFInd`：重启计算机，进入 `UEFI` 设置界面，选择 `rEFInd` 作为启动项。`rEFInd` 会显示一个图形化界面，列出所有可用的操作系统。
选择操作系统：使用键盘箭头键选择要启动的操作系统，然后按回车键启动。
## 维护和更新
更新 `rEFInd`：当有新的版本发布时，可以下载并覆盖旧的文件，然后重新运行安装脚本。
添加新的内核或操作系统：当安装新的操作系统或更新 `Linux` 内核时，`rEFInd` 通常可以自动检测，但你也可以手动编辑 `refind.conf` 添加新的启动项。
## `rEFInd` 的高级功能
主题和图标：可以自定义 `rEFInd` 的主题和图标，创建一个更加美观和个性化的启动界面。
内核参数传递：可以在 `refind.conf` 中为每个内核条目指定特定的内核参数。
分区扫描和隐藏：可以控制 `rEFInd` 扫描和显示哪些分区和操作系统，避免显示不必要的条目。
## 总结
`rEFInd` 是一个功能强大且易于使用的 `UEFI` 启动管理器，它支持多种操作系统并提供图形化界面，使得管理多重引导配置变得简单直观。通过合理配置 `rEFInd`，可以方便地在多操作系统环境下启动和切换，极大地提升了用户体验。






