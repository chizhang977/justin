# Java11新特性
Java 11，是2018年9月发布的，是继Java 8之后的又一个长期支持版本（LTS）。它引入了许多新特性和改进，以下是Java 11中一些重要的新特性和改进.
[Java11新特性](https://openjdk.java.net/projects/jdk/11/)
:::warning Java11 新特性
>-  181: [Nest-Based Access Control](https://openjdk.java.net/jeps/181)  基于嵌套的访问控制
>-  309: [Dynamic Class-File Constants](https://openjdk.java.net/jeps/309) 动态类文件常量
>-  315: [Improve Aarch64 Intrinsics](https://openjdk.java.net/jeps/315) 改进 Aarch64 Intrinsics
>-  318: [Epsilon: A No-Op Garbage Collector](https://openjdk.java.net/jeps/318) Epsilon — 一个No-Op（无操作）的垃圾收集器
>-  320: [Remove the Java EE and CORBA Modules](https://openjdk.java.net/jeps/320) 删除 Java EE 和 CORBA 模块
>-  321: [HTTP Client (Standard)](https://openjdk.java.net/jeps/321)  HTTPClient API
>-  323: [Local-Variable Syntax for Lambda Parameters](https://openjdk.java.net/jeps/323)  用于 Lambda 参数的局部变量语法
>-  324: [Key Agreement with Curve25519 and Curve448](https://openjdk.java.net/jeps/324) Curve25519 和 Curve448 算法的密钥协议
>-  327: [Unicode 10](https://openjdk.java.net/jeps/327)
>-  328: [Flight Recorder](https://openjdk.java.net/jeps/328) 飞行记录仪
>-  329: [ChaCha20 and Poly1305 Cryptographic Algorithms](https://openjdk.java.net/jeps/329) ChaCha20 和 Poly1305 加密算法
>-  330: [Launch Single-File Source-Code Programs](https://openjdk.java.net/jeps/330) 启动单一文件的源代码程序
>-  331: [Low-Overhead Heap Profiling](https://openjdk.java.net/jeps/331) 低开销的 Heap Profiling
>-  332: [Transport Layer Security (TLS) 1.3](https://openjdk.java.net/jeps/332) 支持 TLS 1.3
>-  333: [ZGC: A Scalable Low-Latency Garbage Collector(Experimental)](https://openjdk.java.net/jeps/333) 可伸缩低延迟垃圾收集器
>-  335: [Deprecate the Nashorn JavaScript Engine](https://openjdk.java.net/jeps/335) 弃用 Nashorn JavaScript 引擎
>-  336: [Deprecate the Pack200 Tools and API](https://openjdk.java.net/jeps/336)  弃用 Pack200 工具和 API
:::


## 1、新的`HttpClient` API
Java 11正式引入了新的HttpClient API，它最初在Java 9中作为孵化器模块引入，在Java 10中作为孵化器模块更新，并在Java 11中变成标准。这个API用于发送HTTP请求和接收HTTP响应。
```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;

public class HttpClientExample {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("https://httpbin.org/get"))
                .timeout(Duration.ofMinutes(2))
                .header("Content-Type", "application/json")
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.statusCode());
        System.out.println(response.body());
    }
}


```
### 主要特性包括：

- 支持同步和异步模式
- 支持HTTP/1.1和HTTP/2
- 内置的WebSocket支持
- 更好的API设计和易用性
## 2、新的字符串方法
Java 11为String类添加了一些非常有用的新方法，使得字符串操作更加方便和高效：
- `isBlank()`: 判断字符串是否为空白
- `lines()`: 将字符串按行分割为流
- `strip()`: 去除首尾空白
- `stripLeading()`: 去除首部空白
- `stripTrailing()`: 去除尾部空白
- `repeat(int count)`: 重复字符串
```java
String str = "  Hello World  ";
System.out.println(str.isBlank()); // false
System.out.println("".isBlank()); // true

String multiLineStr = "Line1\nLine2\nLine3";
multiLineStr.lines().forEach(System.out::println);

System.out.println(str.strip()); // "Hello World"
System.out.println(str.stripLeading()); // "Hello World  "
System.out.println(str.stripTrailing()); // "  Hello World"

String repeated = "abc".repeat(3); // "abcabcabc"

```
## 3、新的文件方法
Java 11引入了两个新的方法，用于更简洁地读取和写入文件：

- `Files.writeString()`
- `Files.readString()`

这些方法可以大大简化文件操作代码，提高代码的可读性和维护性。
```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FileExample {
    public static void main(String[] args) throws Exception {
        Path path = Paths.get("example.txt");
        Files.writeString(path, "Hello, Java 11!");
        String content = Files.readString(path);
        System.out.println(content);
    }
}

```
## 4、Epsilon GC
Epsilon 是一种不执行任何垃圾收集操作的垃圾收集器。它的主要用途是性能测试和对比分析。
### 主要特性
- 不进行垃圾收集操作。
- 用于测试和性能调优，分析GC的影响。
### 配置方式
```bash
java -XX:+UnlockExperimentalVMOptions -XX:+UseEpsilonGC -Xmx2g -Xms2g MyApp
```

## 5、ZGC
ZGC是一个可扩展的低延迟垃圾收集器，设计用于处理大内存堆。

### 主要特性
- 极低的暂停时间（通常小于10ms）。
- 支持从几百MB到数TB的堆内存。
- 对应用性能影响最小。
### 配置方式：

```sh
java -XX:+UnlockExperimentalVMOptions -XX:+UseZGC -Xmx2g -Xms2g MyApp
```
## 6、运行Java文件
Java 11允许你直接运行Java源文件，而不需要显式地编译。这使得开发和测试小的程序片段更加方便。

```sh
java HelloWorld.java
```
这意味着你可以直接执行包含main方法的Java文件，简化了开发者的工作流。
## 7、改进的Nest-Based访问控制
Java 11引入了Nest-Based的访问控制，以更好地支持嵌套类的访问控制。这一改进使得嵌套类可以更方便地访问彼此的私有成员，而不需要生成额外的桥接方法。

```java
public class OuterClass {
    private String outerField = "outer";

    class InnerClass {
        private String innerField = "inner";

        public void printFields() {
            System.out.println(outerField); // 访问外部类的私有字段
            System.out.println(innerField); // 访问内部类的私有字段
        }
    }
}
```

## 8、动态类文件常量
动态类文件常量允许在Java类文件中定义常量池的常量值，这些值在类加载时动态计算，而不是在编译时确定。这为将来的优化和增强提供了基础。

### 主要特性
通过invokedynamic指令支持新的常量类型。
提高了虚拟机处理动态语言的能力。



## 9、Lambda表达式中使用var关键字
Java 11允许在Lambda表达式中使用var关键字来声明参数类型，并且支持变量的注解。

### 主要特性

- 使用var关键字简化Lambda表达式参数的声明。
- 支持对Lambda参数进行注解。
示例代码：

```java
var list = List.of("Java", "Kotlin", "Scala");
list.forEach((@Nonnull var element) -> System.out.println(element));
```
## 10、 Unicode 10 支持


- 支持最新的Unicode字符和表情符号。
- 改进字符处理能力。

