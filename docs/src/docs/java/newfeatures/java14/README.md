# java14新特性
[java14新特性](https://openjdk.java.net/projects/jdk/14/) 带来了许多令人兴奋的新特性和改进，包括 switch 表达式增强、Null 值操作符、Pattern Matching for instanceof 扩展、Packaging Tool、NUMA-Aware Memory Allocation for G1、Records 等。
:::warning java新特性
>- 305: [Pattern Matching for instanceof (Preview)](https://openjdk.java.net/jeps/305) instanceof的模式匹配
>- 343: [Packaging Tool (Incubator)](https://openjdk.java.net/jeps/343) 打包工具
>- 345: [NUMA-Aware Memory Allocation for G1](https://openjdk.java.net/jeps/345) G1的NUMA-Aware内存分配
>- 349: [JFR Event Streaming](https://openjdk.java.net/jeps/349) JFR事件流
>- 352: [Non-Volatile Mapped Byte Buffers](https://openjdk.java.net/jeps/352) 非易失性映射字节缓冲区
>- 358: [Helpful NullPointerExceptions](https://openjdk.java.net/jeps/358) 实用的NullPointerExceptions
>- 359: [Records (Preview)](https://openjdk.java.net/jeps/359) 
>- 361: [Switch Expressions (Standard)](https://openjdk.java.net/jeps/361) Switch表达式
>- 362: [Deprecate the Solaris and SPARC Ports](https://openjdk.java.net/jeps/362) 弃用Solaris和SPARC端口
>- 363: [Remove the Concurrent Mark Sweep (CMS) Garbage Collector](https://openjdk.java.net/jeps/363) 删除并发标记扫描（CMS）垃圾回收器
>- 364: [ZGC on macOS](https://openjdk.java.net/jeps/364) 
>- 365: [ZGC on Windows](https://openjdk.java.net/jeps/365) 
>- 366: [Deprecate the ParallelScavenge + SerialOld GC Combination](https://openjdk.java.net/jeps/366) 弃用ParallelScavenge + SerialOld GC组合
>- 367: [Remove the Pack200 Tools and API](https://openjdk.java.net/jeps/367) 删除Pack200工具和API
>- 368: [Text Blocks (Second Preview)](https://openjdk.java.net/jeps/368) 文本块
>- 370: [Foreign-Memory Access API (Incubator)](https://openjdk.java.net/jeps/370) 外部存储器访问API
:::
## 1. Switch 表达式增强 (转正)
Java 14 中增强了 switch 表达式，包括支持复杂的条件、多个标签、更简洁的语法等。这些改进使得 switch 表达式更加强大和灵活，同时提高了代码的可读性和可维护性。

主要特性：
- 支持使用 yield 关键字替代 break 返回值。
- 允许在 case 标签中直接使用复杂的条件。
- 允许在一个 case 中包含多个标签。
示例代码：

```java
public class EnhancedSwitchExample {
    public static void main(String[] args) {
        int day = 4;

        String season = switch (day) {
            case 1, 2, 3 -> "Spring";
            case 4, 5, 6 -> "Summer";
            case 7, 8, 9 -> "Autumn";
            case 10, 11, 12 -> "Winter";
            default -> {
                if (day < 1 || day > 12) {
                    yield "Invalid Day";
                } else {
                    yield "Unknown";
                }
            }
        };

        System.out.println("The season for day " + day + " is " + season + ".");
    }
}
```
## 2. Null 值操作符 
Java 14 中引入了 Null 值操作符（?），用于简化对空值的判断和处理。这个操作符可以在方法调用、属性访问和数组访问等场景中安全地处理可能为空的对象，避免了繁琐的空值检查和异常处理。

主要特性：

- 通过 `?.` 操作符安全地访问对象的属性或调用方法，如果对象为空则返回 `null`。
- 可以在链式调用中连续使用，避免了繁琐的空值检查。
示例代码：

```java
public class NullOperatorExample {
    public static void main(String[] args) {
        String name = null;
        int length = name?.length(); // 如果 name 为空则返回 null
        System.out.println("Length of name: " + length);
    }
}
```
## 3. `instanceof`的模式匹配
Java 14 对 `instanceof` 关键字进行了扩展，增加了对模式匹配的支持。这使得在使用 `instanceof` 进行类型检查时更加方便，同时也增加了代码的可读性和简洁性。

主要特性：

- 允许在 `instanceof` 关键字中使用模式匹配。
- 可以直接将匹配的对象转换为指定类型，无需进行强制类型转换。
示例代码：

```java
public class PatternMatchingExample {
    public static void main(String[] args) {
        Object obj = "Hello";

        if (obj instanceof String str) {
            // 在这个作用域内，str 被视为 String 类型
            System.out.println("Length of string: " + str.length());
        } else {
            System.out.println("Not a string");
        }
    }
}
```

Java 14之前旧写法：

```java
if(obj instanceof String){
    String str = (String)obj; //需要强转
    .. str.contains(..)..
}else{
    ...
}
```

Java 14新特性写法：

```java
if(obj instanceof String str){
    .. str.contains(..)..
}else{
    ...
}
```

举例：

```java

public class Feature01 {
    @Test
    public void test1(){

        Object obj = new String("hello,Java14");
        obj = null;//在使用null 匹配instanceof 时，返回都是false.
        if(obj instanceof String){
            String str = (String) obj;
            System.out.println(str.contains("Java"));
        }else{
            System.out.println("非String类型");
        }

        //举例1：
        if(obj instanceof String str){ //新特性：省去了强制类型转换的过程
            System.out.println(str.contains("Java"));
        }else{
            System.out.println("非String类型");
        }
    }
}

// 举例2
class InstanceOf{

    String str = "abc";

    public void test(Object obj){

        if(obj instanceof String str){//此时的str的作用域仅限于if结构内。
            System.out.println(str.toUpperCase());
        }else{
            System.out.println(str.toLowerCase());
        }

    }

}

//举例3：
class Monitor{
    private String model;
    private double price;

//    public boolean equals(Object o){
//        if(o instanceof Monitor other){
//            if(model.equals(other.model) && price == other.price){
//                return true;
//            }
//        }
//        return false;
//    }


    public boolean equals(Object o){
        return o instanceof Monitor other && model.equals(other.model) && price == other.price;
    }

}
```

## 4. 打包工具(Packaging Tool)
Java 14 中引入了新的打包工具，用于生成自包含的可执行 JAR 文件。这个工具简化了 Java 应用程序的分发和部署过程，使得开发者能够更轻松地创建和分享他们的应用。

主要特性：

- 允许将应用程序和其依赖项打包成一个自包含的可执行 JAR 文件。
- 提供了简单易用的命令行工具和 API。
示例代码：

```sh
jpackage --name MyApplication --input /path/to/input --output /path/to/output --main-jar myapp.jar
```
## 5. G1的NUMA-Aware内存分配
Java 14 中改进了 G1 垃圾收集器的内存分配策略，增加了对 NUMA（Non-Uniform Memory Access）架构的支持。这使得在 NUMA 系统上运行的 Java 应用程序能够更好地利用硬件资源，提高性能和可伸缩性。
主要特性：
- 在 NUMA 系统上使用更智能的内存分配策略，减少了内存访问延迟。
- 提高了 Java 应用程序在 NUMA 系统上的性能和可伸缩性。
实际应用：

适用于在 NUMA 架构上运行的大型 Java 应用程序，如大数据处理、虚拟化环境等。
## 6. Records (预览) 
`record` 是一种全新的类型，它本质上是一个 `final` 类，同时所有的属性都是 `final` 修饰，它会自动编译出 `public get` 、`hashcode` 、`equals`、`toString`、构造器等结构，减少了代码编写量。

具体来说：当你用`record` 声明一个类时，该类将自动拥有以下功能：

- 获取成员变量的简单方法，比如例题中的 name() 和 partner() 。注意区别于我们平常getter()的写法。
- 一个 equals 方法的实现，执行比较时会比较该类的所有成员属性。
- 重写 hashCode() 方法。
- 一个可以打印该类所有成员属性的 toString() 方法。
- 只有一个构造方法。
- 支持模式匹配和解构。
此外：
- 还可以在record声明的类中定义静态字段、静态方法、构造器或实例方法。
- 不能在record声明的类中定义实例字段；类不能声明为abstract；不能声明显式的父类等。


示例代码：

```java
public record Person(String name, int age) { }
```

举例1（旧写法）：

```java
class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int x() {
        return x;
    }

    int y() {
        return y;
    }

    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point other = (Point) o;
        return other.x == x && other.y == y;
    }

    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Point{" +
                "x=" + x +
                ", y=" + y +
                '}';
    }
}
```

举例1（新写法）：

```java
record Point(int x, int y) { }
```

举例1：

```java
public record Dog(String name, Integer age) {
}
```

```java
public class Java14Record {

    public static void main(String[] args) {
        Dog dog1 = new Dog("牧羊犬", 1);
        Dog dog2 = new Dog("田园犬", 2);
        Dog dog3 = new Dog("哈士奇", 3);
        System.out.println(dog1);
        System.out.println(dog2);
        System.out.println(dog3);
    }
}
```

举例2：

```java

public class Feature07 {
    @Test
    public void test1(){
        //测试构造器
        Person p1 = new Person("罗密欧",new Person("zhuliye",null));
        //测试toString()
        System.out.println(p1);
        //测试equals():
        Person p2 = new Person("罗密欧",new Person("zhuliye",null));
        System.out.println(p1.equals(p2));

        //测试hashCode()和equals()
        HashSet<Person> set = new HashSet<>();
        set.add(p1);
        set.add(p2);

        for (Person person : set) {
            System.out.println(person);
        }

        //测试name()和partner():类似于getName()和getPartner()
        System.out.println(p1.name());
        System.out.println(p1.partner());

    }

    @Test
    public void test2(){
        Person p1 = new Person("zhuyingtai");

        System.out.println(p1.getNameInUpperCase());

        Person.nation = "CHN";
        System.out.println(Person.showNation());

    }
}
```

```java

public record Person(String name,Person partner) {

    //还可以声明静态的属性、静态的方法、构造器、实例方法

    public static String nation;

    public static String showNation(){
        return nation;
    }

    public Person(String name){
        this(name,null);
    }

    public String getNameInUpperCase(){
        return name.toUpperCase();
    }
    //不可以声明非静态的属性
        //    private int id;//报错
    }

    //不可以将record定义的类声明为abstract的

    //abstract record Order(){
    
    //}

    //不可以给record定义的类声明显式的父类（非Record类）
    //record Order() extends Thread{
    
    //}
```

JDK15中第二次预览特性
JDK16中转正特性

`记录不适合哪些场景`

record的设计目标是提供一种将数据建模为数据的好方法。它也不是 JavaBeans 的直接替代品，因为record的方法不符合 JavaBeans 的 get 标准。另外 JavaBeans 通常是可变的，而记录是不可变的。尽管它们的用途有点像，但记录并不会以某种方式取代 JavaBean。