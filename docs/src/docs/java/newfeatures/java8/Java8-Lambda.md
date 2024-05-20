# 函数编程（Lambda）



## 面向对象编程（OOP）与函数式编程（FP）

:::tip 面向对象和函数式编程

> 面向对象编程是对数据进行抽象，而函数式编程是对行为进行抽象。

::::

Java作为一种面向对象编程语言，传统上强调通过对象来解决问题。然而，自Java 8引入Lambda表达式后，Java也开始支持函数式编程，使得Java不仅支持OOP，还支持函数式编程（FP）。

- **OOP**：在OOP中，解决问题的思路是通过找到一个能解决这个问题的对象，并调用该对象的方法来完成任务。

- **FP**/OOF：在FP中，关注的是结果而不是过程。只要能够得到结果，谁来做的，怎么做的并不重要。在FP中，我们更关心的是如何通过函数的组合和应用来获得结果，而不是通过对象的方法来实现。

## 匿名内部类

匿名内部类在Java中是一种方便的语法，可以用来快速定义并创建一个接口或抽象类的实例。然而，它们也有一些显著的缺点，这些缺点正是引入Lambda表达式的动因之一

1. **冗长和复杂的语法**： 匿名内部类需要写大量的样板代码，包括类声明、构造方法和接口方法的实现。这些代码往往很冗长，使得代码难以阅读和维护。

   ```java
   Runnable runnable = new Runnable() {
       @Override
       public void run() {
           System.out.println("运行一个匿名内部类");
       }
   };
   new Thread(runnable).start();
   ```

2. **可读性差**： 由于匿名内部类的语法过于冗长，当我们需要定义简单的行为时，代码的可读性会大大降低。特别是在需要多次使用匿名内部类的情况下，代码显得非常混乱。

3. **灵活性不足**： 匿名内部类只能用于有名称的类或接口实现，不适用于方法或表达式，使得某些情况下的代码

## Lambda表达式的引入

为了克服匿名内部类的这些缺点，Lambda表达式(又称**闭包**或**匿名函数**)是Java 8引入的一个新特性，它允许将函数作为参数传递，使代码更简洁和可读。Lambda表达式主要用于替代匿名内部类，特别是在需要实现单一抽象方法的场景中。

### 语法

Lambda表达式的基本语法形式如下：

- 左侧： Lambda 表达式参数列表
- 右侧： Lambda 体，是抽象方法的实现，即 Lambda 表达式要执行的功能。

```java
(parameters) -> expression
或
(parameters) -> { statements; }
```

### 详细语法

```java
//1、无参数，无返回值
() -> System.out.println("lambda");

//2、单参数，无返回值(省略参数小括号)
x -> System.out.println(x);
Consumer<String> consumer = s -> System.out.println(s);

//3、多参数，有返回值
(x, y) -> x + y;
Comparator<Integer> comparator = (x, y) -> Integer.compare(x, y);

//4、多参数，有返回值，带代码块
(x, y) -> {
    int sum = x + y;
    return sum;
};
BinaryOperator<Integer> add = (a, b) -> {
    int result = a + b;
    System.out.println("Result: " + result);
    return result;
};

//5、单条语句，省略return和大括号
BinaryOperator<Integer> multiply = (a, b) -> a * b;
```

### 类型推断

Lambda表达式中的参数类型可以由编译器根据上下文推断出来，无需显式声明。

```java
// 带有显式类型的Lambda表达式
Comparator<Integer> comparator = (Integer x, Integer y) -> Integer.compare(x, y);

// 使用类型推断
Comparator<Integer> comparator = (x, y) -> Integer.compare(x, y);
```



## 函数式(Functional)接口

### 简单介绍

Lambda表达式只能用于函数式接口，这些接口有且仅有一个抽象方法。函数式接口可以通过`@FunctionalInterface`注解来显式声明，但即使没有这个注解，只要接口符合条件，编译器也会自动识别它为函数式接口。常见的函数式接口包括`Runnable`、`Callable`、`Comparator`，以及位于`java.util.function`包中的`Predicate`、`Function`、`Consumer`、`Supplier`等。

### 常见函数式接口

| 函数式接口         | 称谓       | 参数类型 | 用途                                                         |
| ------------------ | ---------- | -------- | ------------------------------------------------------------ |
| `Consumer<T>  `    | 消费型接口 | T        | 对类型为T的对象应用操作，包含方法：  `void accept(T t)  `    |
| `Supplier<T>  `    | 供给型接口 | 无       | 返回类型为T的对象，包含方法：`T get()  `                     |
| `Function<T, R>  ` | 函数型接口 | T        | 对类型为T的对象应用操作，并返回结果。结果是R类型的对象。包含方法：`R apply(T t)  ` |
| `Predicate<T>  `   | 判断型接口 | T        | 确定类型为T的对象是否满足某约束，并返回 boolean 值。包含方法：`boolean test(T t)  ` |

### 扩展

在函数式编程范式里，"函数作为一等公民"意味着函数可以被赋值给变量、作为参数传递给其他函数、从其他函数返回，就像对待基本数据类型（如整数、字符串）一样自由。在这种环境下，Lambda表达式直接代表函数本身，拥有函数的特性。

然而，在Java 8中，情况略有不同，尽管Lambda表达式引入了函数式编程的特性，但它们在Java中不是直接作为“函数”存在的。具体来说：

::: details **Lambda表达式视为对象**

在Java 8中，Lambda表达式实际上是对象的实例，而非纯粹的函数。这一点区别于某些其他函数式编程语言直接将Lambda视为函数类型。

:::

::: details **函数式接口的必要性**

Java中的Lambda表达式需要基于一个被称为“函数式接口”的特定类型。函数式接口是指只有一个抽象方法的接口（加上默认方法和静态方法）。这样的接口定义了Lambda表达式的行为规范。换句话说，Lambda表达式是用来实现这类接口中唯一抽象方法的具体实现。

:::

::: details **关系概括**

 因此，在Java 8及以后版本中，Lambda表达式实质上是函数式接口的一个实例化形式。当你定义一个Lambda表达式时，编译器会自动将其匹配到合适的函数式接口上。这意味着，任何可以用Lambda表达式表示的逻辑，本质上都是在实现一个函数式接口的抽象方法。

:::

简而言之，Java通过函数式接口作为桥梁，使得Lambda表达式能够以一种类型安全的方式扮演函数的角色，即使它们在Java中底层表现为对象。这种设计既保留了Java的静态类型系统特性，又引入了函数式编程的便捷和灵活性。

## 方法引用

**方法引用**是Lambda表达式的简洁替代形式，用于引用已有方法，其实质仍然是函数式接口的实例。当操作可通过现有方法实现时，使用`ClassOrInstance::methodName`语法，无需显式编写Lambda，从而提高代码的清晰度和简洁性。这种方法引用机制是对Lambda的一种优化，或称为“语法糖”。

### 使用

- **格式**:使用方法引用操作符 “`::`” 将类(或对象) 与 方法名分隔开来。

- **分类**

  - **静态方法引用**: 当你想要引用一个静态方法时，格式为 `ClassName::staticMethodName`。

  ```java
  Function<String, Integer> parseInt = Integer::parseInt;
  //等同于：
  Function<String, Integer> parseInt = s -> Integer.parseInt(s);
  ```

  - **实例方法引用**: 当引用一个对象的实例方法，并且该对象是函数式接口参数的一部分时，格式为 `ClassName::methodName`。

  ```java
  BiPredicate<String, String> equalsIgnoreCase = String::equalsIgnoreCase;
  //等同于：
  BiPredicate<String, String> equalsIgnoreCase = (str1, str2) -> str1.equalsIgnoreCase(str2);
  ```

  - **特定对象的实例方法引用**: 如果你有一个特定对象，并且想要引用它的实例方法，格式为 `instance::methodName`。但是，这种形式较为少见，因为通常我们直接调用实例方法就足够了。

  ```java
  String str = "Hello";
  Supplier<String> stringSupplier = str::toUpperCase;
  //等同于：
  Supplier<String> stringSupplier = () -> str.toUpperCase();
  ```

## 构造器引用

**构造器引用**是方法引用的一个特例，专门用于引用类的构造函数。其语法 `ClassName::new`，与类构造器引用相同。构造器引用主要用于与函数式接口（如`Supplier`、`Function`、`BiFunction`等）结合使用，以更简洁地创建和初始化对象。

### 使用

- **超类构造器引用**: 通过 `super::new` 引用超类构造器，实际应用中更多见于内部类构造器引用。
- **类构造器引用**: 格式为 `ClassName::new`,它引用了一个类的构造方法，常用于创建对象的场景。

```java
//无参构造器
//语法：ClassName::new
Supplier<Person> personSupplier = Person::new;
//等同于：
Supplier<Person> personSupplier = () -> new Person();

//带参构造器
Function<String, Person> personCreator = Person::new;
//等同于：
Function<String, Person> personCreator = name -> new Person(name);
```






































