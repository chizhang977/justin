# Java12新特性
[java12新特性](https://openjdk.java.net/projects/jdk/12/)
:::warning java12新特性
> - 189：[Shenandoah: A Low-Pause-Time Garbage Collector (Experimental)](https://openjdk.java.net/jeps/189) 低暂停时间的GC
> - 230: [Microbenchmark Suite](https://openjdk.java.net/jeps/230) 微基准测试套件
> - 325: [Switch Expressions (Preview)](https://openjdk.java.net/jeps/325) switch表达式
> - 334: [JVM Constants API ](https://openjdk.java.net/jeps/334) JVM常量API
> - 340: [One AArch64 Port, Not Two](https://openjdk.java.net/jeps/340) 只保留一个AArch64实现
> - 341: [Default CDS Archives](https://openjdk.java.net/jeps/341) 默认类数据共享归档文件
> - 344: [Abortable Mixed Collections for G1](https://openjdk.java.net/jeps/344) 可中止的G1 Mixed GC
> - 346: [Promptly Return Unused Committed Memory from G1](https://openjdk.java.net/jeps/346) G1及时返回未使用的已分配内存
:::
## 1、switch表达式
Java 12引入了switch表达式的预览特性，使得switch语句可以用于表达式，从而简化了代码结构和提高了可读性。这个特性引入了一种新的语法，允许switch语句返回值，并支持lambda风格的case标签。
- Java 12将会对switch声明语句进行扩展，使用`case L ->`来替代以前的`break;`，省去了 break 语句，避免了因少写 break 而出错。

- 同时将多个 case 合并到一行，显得简洁、清晰，也更加优雅的表达逻辑分支。

- 为了保持兼容性，case 条件语句中依然可以使用字符` :` ，但是同一个 switch 结构里不能混用` ->` 和` :` ，否则编译错误。


示例代码：

```java
public class SwitchExpressionExample {
    public static void main(String[] args) {
        int day = 3;
        String dayName = switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            case 4 -> "Thursday";
            case 5 -> "Friday";
            case 6 -> "Saturday";
            case 7 -> "Sunday";
            default -> throw new IllegalArgumentException("Invalid day: " + day);
        };
        System.out.println(dayName);
    }
}
```
## 2、JVM常量API

引入JVM常量API，使得访问和操作类文件常量池中的常量更加容易。这个API提供了一种标准方式来描述和处理类文件中的各种常量，从而支持更多高级的字节码处理和生成工具。

**主要特性:**

- 提供对常量池中常量的标准化访问。
- 使字节码生成和操作工具更加健壮和灵活。


```java
import java.lang.constant.*;

public class JVMConstantsExample {
    public static void main(String[] args) {
        MethodTypeDesc methodTypeDesc = MethodTypeDesc.ofDescriptor("(Ljava/lang/String;)V");
        System.out.println("Method Type Descriptor: " + methodTypeDesc.descriptorString());
    }
}
```

## 3、默认类数据共享归档文件
Class Data Sharing（CDS）技术在Java 12中得到了改进，默认情况下启用并包含了基础模块的默认CDS存档。这显著减少了Java应用程序的启动时间，并且改善了内存占用。

## 4、可中止的G1 Mixed GC
改进了G1垃圾收集器，允许在混合收集过程中中止垃圾收集任务。这提高了垃圾收集器的响应能力和性能，使得应用程序能够更好地应对高负载和低延迟的需求。

主要特性:

提高了G1垃圾收集器的响应能力。
允许在混合收集中中止垃圾收集任务，提高了GC的灵活性。
实际应用:

适用于对延迟敏感的应用程序，如实时系统和高频交易系统。
提高了GC性能，使应用程序在高负载下也能保持良好的响应时间。
## 5、 及时返回未使用的已分配内存
G1垃圾收集器现在可以及时返回未使用的已提交内存给操作系统，从而提高了内存利用率，并减少了内存浪费。

**主要特性:**

提高内存利用率，减少内存浪费。
使得未使用的内存能够及时返回给操作系统。

## 6、低暂停时间的GC
`Shenandoah`是一种低暂停时间的垃圾收集器，设计用于减少GC暂停时间，适用于高响应性和低延迟要求的应用程序。`Shenandoah`通过并行执行标记和压缩阶段，实现了极低的暂停时间。

**主要特性:**

极低的GC暂停时间。
适用于需要高响应性和低延迟的应用程序。
**配置方式：**

```sh
java -XX:+UnlockExperimentalVMOptions -XX:+UseShenandoahGC -Xmx2g -Xms2g MyApp
```

## 7、微基准测试套件
引入了一套基于OpenJDK的微基准测试套件，方便开发者对Java代码进行性能测试和优化。这套基准测试套件基于Java Microbenchmark Harness (JMH)，提供了标准化的性能测试框架。
**主要特性:**


- 提供标准化的性能测试工具。
- 基于JMH，支持细粒度的性能测试。


```java
import org.openjdk.jmh.annotations.*;

@BenchmarkMode(Mode.AverageTime)
@Warmup(iterations = 5)
@Measurement(iterations = 10)
@Fork(1)
@State(Scope.Benchmark)
public class MyBenchmark {
    
    @Benchmark
    public void testMethod() {
        // 测试代码
    }
}
```

## 8、 只保留一个AArch64实现
Java 12合并了两个AArch64平台的端口，简化了JDK的构建和维护。这一更改提高了对AArch64平台的支持，并减少了维护成本。

**主要特性:**

合并了两个AArch64端口。
简化了JDK的构建和维护。







