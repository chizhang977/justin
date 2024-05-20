# Java8新特性-类型注解
Java 8 引入了一项重要的新特性——类型注解(Type Annotations)，这是对注解系统的一次扩展，允许注解出现在代码中的更多位置。这一特性为开发者提供了更强大的类型检查工具，从而提高代码的健壮性和可维护性。本文将详细介绍类型注解的概念、应用场景、相关工具、优缺点，以及类型注解规范 JSR 308。

## 什么是类型注解？
类型注解是指可以应用在任何使用类型的地方的注解形式。在 Java 8 之前，注解只能应用在声明的地方，例如类、方法和属性。类型注解则可以应用在以下地方：
- 泛型参数注解：可以在泛型类型参数上使用注解，比如集合的元素类型。
- 方法返回类型注解：直接在方法的返回类型前添加注解，表明返回值的预期类型特征。
- 局部变量注解：甚至可以对局部变量的声明类型应用注解，增强局部作用域内的类型检查。
- 类型cast注解：在类型转换操作上使用注解，说明转换的目的类型信息。
## 类型注解的作用
类型注解的主要作用是支持在 Java 程序中进行更严格的类型检查，以便在编译时捕获潜在的运行时错误。例如，使用类型注解可以检测出可能导致 NullPointerException 的代码，从而提高代码的安全性和质量。

## 应用场景

:::tip 注解

1. **@NonNull**：表示对象或变量不能为 null。它告诉编译器在这些地方不允许出现空指针异常。
2. **@Readonly**：表示对象或变量是只读的，不允许修改。通常用于标记不可变对象或方法。
3. **@Critical**：表示方法可能会抛出严重的异常或错误。这种注解有助于提醒开发者对于这些方法需要更加谨慎地处理异常。

:::

类型注解可以应用于多种场景，以下是一些常见的应用场景及示例：

**对象创建**：在创建对象时指定其类型

```java
MyObject obj = new @NonNull MyObject();
```

**类型转换**：在进行类型转换时添加注解

```java
String str = (@NonNull String) nullableStr;
```

**泛型类型参数**：在泛型类型参数中添加注解。

```java
List<@NonNull String> strings = new ArrayList<>();
```

**继承和实现**：在类和接口的声明中添加注解。

```java
class MyClass implements @NonNull MyInterface { }
```

**方法接收器**：在方法定义中为参数添加注解。

```java
public class MyClass {
    public void myMethod() @Readonly { }
}
```
**方法返回值**：为方法的返回值添加注解。

```java
@NonNull String getNonNullString(){
    return "hello typeAnnoation";
}
```

**方法调用**：在调用方法时为参数添加注解。

```java
void process(@NonNull String ){}
process((@NonNull) String nullableStre); 
```

**throws 子句**：在方法声明中指定可能抛出的异常类型。

```java
void myMethod() throws @Critical MyException { }
```
**Lambda 表达式**：在 Lambda 表达式中为参数和返回值添加注解。

```java
MyFunction<String, Integer> func = (@NonNull String str) -> str.length();
```

**数组**：在数组声明和初始化时为元素添加注解。

```java
@NonNull String[] strings = new @NonNull String[10];
```

**类型测试**：在类型测试表达式中添加注解。

```java
if (obj instanceof @NonNull MyClass) { }
```

**对象创建**：在对象创建时为构造函数参数添加注解。

```java
MyClass obj = new MyClass((@NonNull String) str);
```

**类型参数绑定**：在泛型类型参数绑定中添加注解。

```java
<T extends @NonNull MyInterface> void process(T obj) { }
```

**方法引用**：在方法引用中添加注解。

```java
MyFunction<String, Integer> func = MyClass::getInt;
```

## 类型注解的优点

- 提高代码质量：在编译时检测潜在的运行时错误，减少代码中的 bug。
- 增强文档性：类型注解可以明确表达代码的设计意图，增强代码的可读性和可维护性。
- 向下兼容：类型注解可以通过注释来实现向下兼容，使得老版本的 Java 编译器能够忽略这些注解。
## 类型注解的缺点
- 代码复杂度增加：类型注解的使用会增加代码的复杂度，对于不熟悉这一特性的新手可能不太友好。
- 学习成本：开发者需要花时间学习和理解类型注解及其相关工具的使用。

## Cheker Framework

::: danger [Checker Framework](http://types.cs.washington.edu/checker-framework/)
Checker Framework 是一个强大的工具，它通过插件的形式嵌入到 javac 编译器中，支持使用类型注解进行更严格的类型检查。通过 Checker Framework，开发者可以在编译时检测出潜在的运行时错误，提高代码的健壮性。
:::

## JSR 308
JSR 308 是 Java 8 引入类型注解的规范，它扩展了 Java 语言的句法，允许注解出现在更多的位置上，如方法接收器、泛型参数、数组、类型转换、类型测试、对象创建、类型参数绑定、类继承和 throws 子句。

JSR 308 的目标包括：

扩展注解的使用范围：允许注解出现在更多的位置上，从而提供更强的类型检查。
引入可插拔的类型系统：通过可插拔的类型系统创建功能更强大的注解处理器。
实战应用
以下是一个完整的实战示例，展示如何使用类型注解和 Checker Framework 进行更严格的类型检查：

```java
import org.checkerframework.checker.nullness.qual.NonNull;
import org.checkerframework.checker.nullness.qual.Nullable;

public class Example {
    public static void main(String[] args) {
        @NonNull String nonNullString = getNonNullString();
        // @NonNull String shouldBeNonNull = getNullableString(); // 会在编译时报错
    }

    static @NonNull String getNonNullString() {
        return "Hello, World!";
    }

    static @Nullable String getNullableString() {
        return null;
    }
}
```
使用 Checker Framework 进行编译：

```sh
javac -processor org.checkerframework.checker.nullness.NullnessChecker Example.java
```
如果尝试将 getNullableString 的返回值赋给 @NonNull 变量，编译时会报错：

```typescript
Example.java:6: error: [assignment.type.incompatible] incompatible types in assignment.
  @NonNull String shouldBeNonNull = getNullableString();
                                    ^
  found   : @Nullable String
  required: @NonNull String
1 error
```
## 总结
类型注解是 Java 8 中一项重要的新特性，它使得注解可以应用在任何使用类型的地方，从而提供更强的类型检查和更清晰的代码文档化。虽然这一特性增加了代码的复杂性，但通过使用 Checker Framework 等工具，可以显著提高代码的质量和健壮性。开发者可以根据需要选择使用类型注解，以在编译时检测潜在的运行时错误，减少代码中的 bug。

