# java 13新特性

[Java 13](https://openjdk.java.net/projects/jdk/13/)引入了一系列新特性和改进，如文本块、增强的ZGC、动态CDS档案、重新实现的旧版套接字API以及改进的switch表达式等。这些特性不仅提高了开发效率和代码质量，还增强了Java应用程序的性能和稳定性。通过这些改进，Java 继续在现代编程语言中保持其强大的功能性和灵活性，为开发者提供了更强大的工具和功能。

:::warning java13 新特性
> - 350: [Dynamic CDS Archives](https://openjdk.java.net/jeps/350) 动态CDS档案
> - 351: [ZGC: Uncommit Unused Memory](https://openjdk.java.net/jeps/351) ZGC:取消使用未使用的内存
> - 353: [Reimplement the Legacy Socket API](https://openjdk.java.net/jeps/353) 重新实现旧版套接字API
> - 354: [Switch Expressions (Preview)](https://openjdk.java.net/jeps/354) switch表达式（预览）
> - 355: [Text Blocks (Preview)](https://openjdk.java.net/jeps/355) 文本块（预览）
:::
## 1. 文本块 (Text Blocks) (预览)
:::danger 问题
在Java中，通常需要使用String类型表达HTML，XML，SQL或JSON等格式的字符串，在进行字符串赋值时需要进行转义和连接操作，然后才能编译该代码，这种表达方式难以阅读并且难以维护。
:::
文本块引入了一种新的字符串字面量形式，使多行字符串的编写更加简单和直观。文本块用三个双引号 (`"""`) 包围，可以包含多行字符，并且支持常见的字符串操作，如自动删除不必要的空白和一致的缩进。在编写包含多行的HTML、JSON、SQL等字符串，减少样板代码和错误。提高了代码的可读性和可维护性。
****主要特性:****

- 简化多行字符串的编写和格式化。
- 自动删除不必要的空白。
- 支持嵌入特殊字符和表达式。


基本使用：

```java
"""
line1
line2
line3
"""
```

相当于：

```java
"line1\nline2\nline3\n"
```

或者一个连接的字符串：

```java
"line1\n" +
"line2\n" +
"line3\n"
```

如果字符串末尾不需要行终止符，则结束分隔符可以放在最后一行内容上。例如：

```java
"""
line1
line2
line3"""
```

相当于

```java
"line1\nline2\nline3"
```

文本块可以表示空字符串，但不建议这样做，因为它需要两行源代码：

```java
String empty = """
""";
```

```
举例1：普通文本

原有写法：

```java
 String text1 = "The Sound of silence\n" +
                "Hello darkness, my old friend\n" +
                "I've come to talk with you again\n" +
                "Because a vision softly creeping\n" +
                "Left its seeds while I was sleeping\n" +
                "And the vision that was planted in my brain\n" +
                "Still remains\n" +
                "Within the sound of silence";

System.out.println(text1);
```

使用新特性：

```java
String text2 = """
                The Sound of silence
                Hello darkness, my old friend
                I've come to talk with you again
                Because a vision softly creeping
                Left its seeds while I was sleeping
                And the vision that was planted in my brain
                Still remains
                Within the sound of silence
                """;
System.out.println(text2);
```

举例2：HTML语句

```html
<html>
  <body>
      <p>Hello, 尚硅谷</p>
  </body>
</html>
```

将其复制到Java的字符串中，会展示成以下内容：

```java
"<html>\n" +
"    <body>\n" +
"        <p>Hello, 尚硅谷</p>\n" +
"    </body>\n" +
"</html>\n";
```

即被自动进行了转义，这样的字符串看起来不是很直观，在JDK 13中：

```java
"""
<html>
  <body>
      <p>Hello, world</p>
  </body>
</html>
""";
```

举例3：SQL语句

```sql
select employee_id,last_name,salary,department_id
from employees
where department_id in (40,50,60)
order by department_id asc
```

原有方式：

```java
String sql = "SELECT id,NAME,email\n" +
                "FROM customers\n" +
                "WHERE id > 4\n" +
                "ORDER BY email DESC";
```

使用新特性：

```java
String sql1 = """
                SELECT id,NAME,email
                FROM customers
                WHERE id > 4
                ORDER BY email DESC
                """;
```

举例4：JSON字符串

原有方式：

```java
String myJson = "{\n" +
                "    \"name\":\"Song Hongkang\",\n" +
                "     \"address\":\"www.atguigu.com\",\n" +
                "    \"email\":\"shkstart@126.com\"\n" +
                "}";
System.out.println(myJson);
```

使用新特性：

```java
String myJson1 = """
                {
                    "name":"Song Hongkang",
                     "address":"www.atguigu.com",
                    "email":"shkstart@126.com"
                }""";
System.out.println(myJson1);
```


## 2. 增强的ZGC: 并发类卸载 
ZGC（Z Garbage Collector）在Java 13中得到了增强，支持并发类卸载。这意味着垃圾收集器可以在后台并发地卸载未使用的类，从而减少堆内存的占用，并提高应用程序的性能。

主要特性:

- 并发卸载未使用的类。
- 减少堆内存占用，提高性能。
- 改进垃圾收集效率，适合大型应用程序。
配置方式：

```sh
java -XX:+UseZGC -Xmx4g MyApp
```

## 3. 动态CDS档案 

动态CDS（Class Data Sharing）档案允许在应用程序启动时动态地将类存储到CDS档案中。这减少了应用程序的启动时间，并提高了内存的使用效率。

主要特性:

- 启动时动态生成和使用CDS档案。
- 减少应用程序启动时间。
- 提高内存使用效率。
## 4. 重新实现旧版套接字API

Java 13重新实现了旧版的套接字API，使得网络I/O更高效和可维护。新的实现使用现代的NIO（非阻塞I/O）机制，并优化了性能和可靠性。

主要特性:

- 基于NIO的现代实现，提高了性能。
- 提高了代码的可维护性和可靠性。
- 改进了错误处理和诊断信息。
实际应用:

提高了网络应用程序的性能和稳定性，特别是在高并发场景下。
## 5. Switch表达式 (第二次预览)
Java 13对switch表达式进行了进一步的改进和预览。与Java 12中的第一次预览相比，新的switch表达式增加了一些语法和功能上的改进。JDK13中引入了yield语句，用于返回值。这意味着，switch表达式(返回值)应该使用yield，switch语句(不返回值)应该使用break。yield和return的区别在于：return会直接跳出当前循环或者方法，而yield只会跳出当前switch块。
```java
public class ComplexSwitchExample {
    public static void main(String[] args) {
        int day = 4;

        String season = switch (day) {
            case 1, 2, 3 -> {
                yield "Spring";
            }
            case 4, 5, 6 -> {
                yield "Summer";
            }
            case 7, 8, 9 -> {
                yield "Autumn";
            }
            case 10, 11, 12 -> {
                yield "Winter";
            }
            default -> {
                yield "Unknown";
            }
        };

        System.out.println("The season for day " + day + " is " + season + ".");
    }
}


