# Java 9 新特性

[OpenJDK Java9 新特性](https://openjdk.java.net/projects/jdk9/)

Java 9 引入了许多新特性，这些特性不仅增强了 Java 语言和平台的功能，还为未来的 Java 版本奠定了基础。以下是 Java 9 的一些重要新特性，特别是那些在以后的版本中会持续沿用的特性。

## 模块化系统

### 模块定义和模块描述符
- 模块定义
一个模块是一个 Java 程序的独立部分，它包含了相关的代码和资源，并且有明确的边界。模块由模块描述符（module-info.java 文件）定义，放置在模块的根目录下。

- 模块描述符
模块描述符是一个 module-info.java 文件，用于声明模块的名称、依赖关系以及导出的包。示例如下：

```java
module com.example.myapp {
    requires java.base; // 隐式依赖，无需显式声明
    requires com.example.utils; // 依赖的其他模块

    exports com.example.myapp.api; // 导出的包
    opens com.example.myapp.internal to com.example.framework; // 反射开放包
}
```
### 模块的关键概念
- 依赖关系
通过 requires 关键字声明模块依赖。例如：

```java
requires java.sql;
requires com.example.utils;
```
- 导出包
通过 exports 关键字声明导出的包，这些包中的类和接口可以被其他模块访问。例如：

```java
exports com.example.myapp.api;
```
- 开放包
通过 opens 关键字声明开放包，允许其他模块通过反射访问这些包。例如：

```java
opens com.example.myapp.internal to com.example.framework;
```
- 使用服务
通过 uses 和 provides 关键字声明模块的服务使用和提供。例如：

```java
uses com.example.myapp.spi.MyService;
provides com.example.myapp.spi.MyService with com.example.myapp.impl.MyServiceImpl;
```
### 模块系统的主要优点
- **强封装**:模块系统提供了强封装，模块的内部实现细节不会泄露到外部，只有明确导出的包才能被其他模块访问。

- **明确的依赖关系**:模块描述符中清晰地声明了模块的依赖关系，使得依赖关系更加透明和可管理。

- **更好的安全性**:模块化系统提高了应用程序的安全性，通过限制未导出包的访问。

- **减少类路径问题**:模块系统通过模块路径（module path）取代了类路径（classpath），避免了类路径中的版本冲突和依赖管理问题。

### JDK 模块化
Java 9 将整个 JDK 模块化，将原来的 rt.jar 分成了几十个模块，例如：

- `java.base`：包含 Java 核心库（java.lang、java.util 等）。
- `java.sql`：包含 JDBC API。
- `java.xml`：包含 XML 处理 API。
- `java.logging`：包含日志 API。
- `java.desktop`：包含 GUI API（java.awt、javax.swing 等）。
示例：查看模块 java.base 的导出包和依赖

```bash

java --describe-module java.base
```
### 自定义运行时镜像
模块化系统允许创建自定义的 JRE，包含应用程序所需的模块，而不是整个 JDK。使用 jlink 工具可以生成自定义的运行时镜像，减少应用程序的内存占用和启动时间。

示例：使用 jlink 创建自定义 JRE

```bash
jlink --module-path $JAVA_HOME/jmods --add-modules java.base,java.sql --output custom-runtime
```
### 示例项目
创建模块
假设有两个模块：`com.example.app` 和 `com.example.utils`。

创建模块目录结构：
```arduino
project-root/
├── com.example.app/
│   ├── module-info.java
│   └── com/example/app/Main.java
└── com.example.utils/
    ├── module-info.java
    └── com/example/utils/Utils.java
```    
编写 module-info.java 文件：
com.example.app/module-info.java：

```java
module com.example.app {
    requires com.example.utils;
    exports com.example.app;
}
```
com.example.utils/module-info.java：

```java
module com.example.utils {
    exports com.example.utils;
}
```
编写类文件：
com.example.app/com/example/app/Main.java：

```java
package com.example.app;

import com.example.utils.Utils;

public class Main {
    public static void main(String[] args) {
        System.out.println(Utils.sayHello());
    }
}
```
com.example.utils/com/example/utils/Utils.java：

```java
package com.example.utils;

public class Utils {
    public static String sayHello() {
        return "Hello, Module System!";
    }
}
```
编译模块：
```bash
javac -d out --module-source-path . $(find . -name "*.java")
```
运行模块：
```bash
java --module-path out -m com.example.app/com.example.app.Main
```
总结
Java 9 的模块化系统是一个重要的改进，它提供了强大的模块化功能，解决了大型应用程序和库的维护和部署问题。通过模块描述符，可以明确声明模块的依赖关系和导出的包，增强了封装性和安全性。模块化系统还允许创建自定义的运行时镜像，减少应用程序的内存占用和启动时间。通过合理使用模块化系统，可以提高代码的可维护性和可扩展性。
## **JShell：交互式编程工具**

Java 9 引入了 JShell，这是一个交互式的 REPL（Read-Eval-Print Loop）工具，可以快速测试和执行 Java 代码片段。

- **即时反馈**：适合快速原型设计和测试。
- **简单易用**：提供了一个方便的环境来学习和探索 Java 语言特性。

## 改进的 API

Java 9 对现有 API 进行了许多增强和改进，这些改进在未来版本中也会继续使用。

集合工厂方法：新增了静态工厂方法，可以更方便地创建不可变集合。

```java
List<String> list = List.of("a", "b", "c");
Set<String> set = Set.of("x", "y", "z");
Map<String, Integer> map = Map.of("a", 1, "b", 2);

```

Optional API：增强了 Optional 类，增加了许多实用方法。
 -  ifPresentOrElse
 - or 
 - stream 

```java
Optional<String> optional = Optional.of("value");
optional.ifPresentOrElse(System.out::println, () -> System.out.println("No value"));
```



## 流（Streams）API 增强

Java 9 对 Streams API 进行了增强，增加了几个有用的新方法：

takeWhile 和 dropWhile：

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);
//takeWhile
List<Integer> taken = numbers.stream().takeWhile(n -> n<4 ).collect(Collectors.toList());
//dropWhile
Stream.iterate(1,i->i<20,i->i+1).dropWhile(i->i<10).forEach(System.out::println);
```

iterate 方法的增强：

```java
//以前
 Stream.iterate(1,i->i+2).limit(10).forEach(System.out::println);
//9之后
Stream.iterate(0, n -> n < 10, n -> n + 1).forEach(System.out::println);
```
ofNullable的使用：

Java 8 中 Stream 不能完全为null，否则会报空指针异常。而 Java 9 中的 ofNullable 方法允许我们创建一个单元素 Stream，可以包含一个非空元素，也可以创建一个空 Stream。


## 私有接口方法

Java 9 允许在接口中定义私有方法，增强了接口的灵活性和可维护性。

私有方法：可以将公共方法中重复的代码抽取到私有方法中，从而提高代码的可读性和可维护性。
```java
interface MyInterface {
    private void log(String message) {
        System.out.println("LOG: " + message);
    }
     default void show() {
        log("show method");
    }  
}    
```



## 多版本兼容 JAR 文件

Java 9 允许创建多版本兼容的 JAR 文件，支持不同版本的 Java 平台。

多版本 JAR：可以在同一个 JAR 文件中包含针对不同 Java 版本的类文件，使得库的开发者能够提供对新特性的支持，同时保持对旧版本的兼容性。
## HTTP/2 客户端

Java 9 引入了新的 HTTP/2 客户端 API（在 Java 11 中正式稳定），用于替代旧的 HttpURLConnection。

简化的 API：提供了更简洁和现代的 API，用于发送 HTTP 请求和处理响应。
```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://example.com"))
        .build();
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());
```
## try-catch 中可以定义流对象
try的前面可以定义流对象，try后面的()中可以直接引用流对象的名称。在try代码执行完毕后，流对象也可以释放掉，也不用写finally了。

格式：

```java
A a = new A();
B b = new B();
try(a;b){
    可能产生的异常代码
}catch(异常类名 变量名){
    异常处理的逻辑
}
```

举例：

```java
@Test
public void test04() {
    InputStreamReader reader = new InputStreamReader(System.in);
    OutputStreamWriter writer = new OutputStreamWriter(System.out);
    try (reader; writer) {
        //reader是final的，不可再被赋值
        //   reader = null;

    } catch (IOException e) {
        e.printStackTrace();
    }
}
```



## 其它增强

进程 API：增强了进程管理，增加了 ProcessHandle 类，可以获取当前进程的信息和控制进程。

```java
ProcessHandle currentProcess = ProcessHandle.current();
System.out.println("Process ID: " + currentProcess.pid());
```

多版本兼容 JAR 文件：可以在一个 JAR 文件中包含不同 Java 版本的类文件，支持库的逐步升级。

Java 9 引入的这些新特性为 Java 语言和平台带来了显著的改进，不仅提高了开发效率和代码质量，还为未来的 Java 版本奠定了坚实的基础。这些特性中，尤其是模块化系统、JShell、集合工厂方法、流 API 增强、HTTP/2 客户端和多版本兼容 JAR 文件，在后续的 Java 版本中将持续发挥重要作用。