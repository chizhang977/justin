---
title: Java 反射机制
---

# Java 反射机制

反射是 Java 在运行期认识和操作类的一套机制。普通代码是在编译期就确定“创建哪个类、调用哪个方法”；反射则允许程序在运行时根据类名、方法名、字段名、注解等信息动态完成这些操作。

## 反射解决什么问题

如果没有反射，很多框架能力会很难实现。

例如 Spring Boot 中：

- 扫描 `@Controller`、`@Service`、`@Repository` 创建对象。
- 读取 `@Autowired` 完成依赖注入。
- 读取 `@RequestMapping` 把 URL 映射到方法。
- AOP 根据方法和注解生成代理逻辑。

MyBatis 中：

- 通过 Mapper 接口生成代理对象。
- 根据方法和 SQL 映射执行数据库操作。

JUnit 中：

- 扫描 `@Test` 注解并执行测试方法。

反射的核心价值是：**让框架能在不知道具体业务类的情况下，读取类的信息并调用它**。

## Class 对象

Java 中每个被 JVM 加载的类，都会对应一个 `Class` 对象。这个对象保存了类的结构信息，包括类名、父类、接口、字段、方法、构造器、注解等。

获取 `Class` 对象常见方式：

```java
Class<?> c1 = User.class;
Class<?> c2 = new User().getClass();
Class<?> c3 = Class.forName("com.example.User");
```

区别：

| 方式 | 特点 | 使用场景 |
| --- | --- | --- |
| `User.class` | 编译期已知道类 | 普通业务代码 |
| `obj.getClass()` | 已经有对象实例 | 判断运行期真实类型 |
| `Class.forName()` | 通过完整类名加载 | 框架、插件、配置化加载 |

## 创建对象

通过无参构造创建对象：

```java
Class<?> clazz = Class.forName("com.example.User");
Object obj = clazz.getDeclaredConstructor().newInstance();
```

如果构造器不是 public，需要打开访问权限：

```java
Constructor<?> constructor = clazz.getDeclaredConstructor(String.class);
constructor.setAccessible(true);
Object obj = constructor.newInstance("justin");
```

生产注意点：

- 反射创建对象比普通 `new` 更慢。
- 私有构造器被强制访问会破坏封装。
- 新版本 JDK 对强反射访问有更多限制。

## 读取和修改字段

```java
User user = new User();
Field field = User.class.getDeclaredField("name");
field.setAccessible(true);
field.set(user, "justin");
Object value = field.get(user);
```

字段反射常用于：

- ORM 框架把数据库列映射到对象字段。
- JSON 框架把 JSON 属性写入对象。
- 配置框架给字段注入配置值。

注意：

- 不要在业务代码里大量用反射修改私有字段。
- 反射绕过编译期检查，字段名写错要运行时才报错。
- 对性能敏感的循环里要避免重复查找字段，可以做缓存。

## 调用方法

```java
Method method = User.class.getDeclaredMethod("setName", String.class);
method.invoke(user, "justin");
```

如果目标方法抛出异常，反射调用通常会包装成 `InvocationTargetException`。排查时要看它的 `getCause()`，真正的业务异常在里面。

```java
try {
    method.invoke(user, "justin");
} catch (InvocationTargetException e) {
    Throwable cause = e.getCause();
    cause.printStackTrace();
}
```

## 读取注解

定义注解：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogRecord {
    String value();
}
```

读取注解：

```java
Method method = OrderService.class.getDeclaredMethod("createOrder");
LogRecord logRecord = method.getAnnotation(LogRecord.class);
if (logRecord != null) {
    System.out.println(logRecord.value());
}
```

关键点是 `@Retention(RetentionPolicy.RUNTIME)`。如果注解只保留到源码或 class 文件，运行期反射就读不到。

## 反射和 Spring 的关系

Spring 启动时会做几件事：

1. 扫描指定包路径下的 class。
2. 找到带有组件注解的类。
3. 读取构造器、字段、方法和注解。
4. 创建 Bean。
5. 根据依赖关系注入其他 Bean。
6. 必要时生成代理对象。

例如：

```java
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
}
```

Spring 会通过反射发现 `UserService` 是组件，再发现 `userMapper` 需要注入，最后从容器中找到对应 Bean 赋值。

## 优点和缺点

优点：

- 提高框架扩展性。
- 可以根据配置或注解动态处理类。
- 支撑 IoC、AOP、ORM、测试框架等能力。

缺点：

- 性能比直接调用低。
- 破坏封装。
- 编译期无法检查字段名和方法名。
- 安全和权限控制更复杂。

## 实践总结

反射是 Java 在运行期获取类信息并动态操作对象的机制。通过 `Class` 对象可以获取构造器、字段、方法和注解，也可以创建对象、调用方法。

它常用于 Spring 的 Bean 创建和依赖注入、MyBatis 的 Mapper 代理、JUnit 的测试方法扫描。反射提高了框架扩展性，但也有性能开销，并且会绕过一部分封装和编译期检查，所以业务代码里不建议滥用。
