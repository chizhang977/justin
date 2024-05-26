# Java10新特性

[OpenJDK-Java10-新特性](https://openjdk.java.net/projects/jdk/10/)

:::warning Java10 新特性

- 286: [Local-Variable Type Inference](http://openjdk.java.net/jeps/286) 局部变量类型推断
- 296: [Consolidate the JDK Forest into a Single Repository](http://openjdk.java.net/jeps/296) JDK库的合并
- 304: [Garbage-Collector Interface](http://openjdk.java.net/jeps/304) 统一的垃圾回收接口
- 307: [Parallel Full GC for G1](http://openjdk.java.net/jeps/307) 为G1提供并行的Full GC
- 310: [Application Class-Data Sharing](http://openjdk.java.net/jeps/310) 应用程序类数据（AppCDS）共享
- 312: [Thread-Local Handshakes](http://openjdk.java.net/jeps/312) ThreadLocal握手交互
- 313: [Remove the Native-Header Generation Tool (javah)](http://openjdk.java.net/jeps/313) 移除JDK中附带的javah工具
- 314: [Additional Unicode Language-Tag Extensions](http://openjdk.java.net/jeps/314) 使用附加的Unicode语言标记扩展
- 316: [Heap Allocation on Alternative Memory Devices](http://openjdk.java.net/jeps/316) 能将堆内存占用分配给用户指定的备用内存设备
- 317: [Experimental Java-Based JIT Compiler](http://openjdk.java.net/jeps/317) 使用Graal基于Java的编译器

- 319: [Root Certificates](http://openjdk.java.net/jeps/319) 根证书

- 322: [Time-Based Release Versioning](http://openjdk.java.net/jeps/322) 基于时间定于的发布版本

  

:::

## 1、局部变量类型推断

Java 10 引入了局部变量类型推断特性，通过使用 `var` 关键字，可以在声明局部变量时省略显式的类型声明。编译器会根据右侧的表达式推断变量的类型。

```java
var list = List.of("Java", "Kotlin", "Scala"); // 推断为 List<String>
var stream = list.stream(); // 推断为 Stream<String>
for (var item : list) {
    System.out.println(item); // item 推断为 String
}
```

#### 注意事项：

- `var` 只能用于局部变量声明，不能用于成员变量、方法参数和返回类型。
- `var` 不能用于没有初始化的变量声明。
- 使用 `var` 要确保代码的可读性，避免滥用导致代码难以理解。

## 2、垃圾收集器接口（Garbage-Collector Interface）

Java 10 引入了一个新的垃圾收集器接口，允许更容易地添加、删除或替换垃圾收集器。这使得垃圾收集器的开发和实验变得更加灵活。

#### 示例：

- 引入新的 `-XX:+UseConcMarkSweepGC` 和 `-XX:+UseG1GC` 标志，用于启用不同的垃圾收集器。
- 使用新的接口可以更轻松地集成定制的垃圾收集器。

## 3、并行垃圾回收改进（Parallel Full GC for G1）

G1 垃圾收集器在 Java 10 中进行了改进，现在可以在并行模式下执行完全垃圾回收（Full GC），以提高性能。

#### 示例：

- 在启用 G1 垃圾收集器时，使用 `-XX:+UseG1GC` 选项，完全垃圾回收将自动并行执行。

##  4、合并 JDK 和 JRE 镜像（Consolidate the JDK and JRE Images）

Java 10 合并了 JDK 和 JRE 镜像，现在只有一个统一的 JDK 镜像。这简化了 JDK 和 JRE 的管理，减少了冗余。

#### 示例：

- 安装和使用 Java 10 时，不再区分 JDK 和 JRE，只有一个统一的 JDK 镜像。

##  5、应用类数据共享（Application Class-Data Sharing）

Java 10 扩展了类数据共享（Class-Data Sharing, CDS）特性，现在可以将应用程序的类数据预加载到共享存储区中，以提高启动时间和内存使用效率。

#### 示例：

```bash
# 创建类数据共享档案
java -Xshare:dump -XX:SharedArchiveFile=app-cds.jsa -cp app.jar MainClass

# 使用类数据共享档案启动应用程序
java -Xshare:on -XX:SharedArchiveFile=app-cds.jsa -cp app.jar MainClass
```

## 6、备用内存设备的实验性支持（Experimental Java-Based JIT Compiler）

Java 10 引入了 Graal 作为实验性的基于 Java 的 JIT 编译器。Graal 提供了高性能的动态编译和优化功能。

#### 示例：

```bash
# 使用 Graal 编译器
java -XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler -XX:+EnableJVMCI -XX:+UseGraal
```

## 7、根证书（Root Certificates）

Java 10 包含了默认的根证书集合，简化了开发和部署需要安全连接的应用程序。

#### 示例：

- 安装和使用 Java 10 时，根证书已经内置，不需要额外配置。

## 8、线程本地握手（Thread-Local Handshakes）

Java 10 引入了线程本地握手机制，允许 JVM 暂停单个线程而不是所有线程，以执行特定操作。这提高了调试和诊断的灵活性和性能。

#### 示例：

- 使用 JDK 内部 API，可以实现线程本地握手，但这是高级功能，通常用于 JVM 开发和优化。

## 其他改进

- **区域垃圾收集器改进（ZGC）**：优化了垃圾收集器的性能，尤其是针对大型内存的低延迟垃圾收集。
- **堆分段分配器（Heap Allocation on Alternative Memory Devices）**：允许 JVM 使用备用内存设备，例如非易失性内存（NVM），以提高性能和稳定性。