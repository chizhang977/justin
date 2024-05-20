# Java8新特性-默认方法

Java 8 引入了许多重要的新特性，其中之一便是接口的**默认方法（Default Methods）**，这一特性极大地丰富了接口的功能，并为现有的API添加新功能提供了更好的途径，同时保持了向后兼容性。下面详细介绍默认方法的相关知识：

## 什么是默认方法？

默认方法，**允许在接口中定义具有实现的方法**。这意味着接口不仅可以定义抽象方法（没有方法体的方法），还可以提供默认的实现。这样一来，实现接口的类可以继承这些默认实现，也可以选择覆盖（重写）它们。

## 为什么需要默认方法？

- **向后兼容性**：接口的演化变得更加容易，可以在不破坏现有实现的情况下向接口中添加新方法。这解决了接口升级时的“破坏性改变”问题，即在接口中添加新方法会导致所有实现类必须实现这个新方法。

- **多重继承的解决方案**：虽然Java不支持类的多重继承，但默认方法让接口可以模拟某种形式的多重继承行为。一个类可以实现多个接口，每个接口都可以提供默认方法的实现，从而实现了行为的组合。

- **行为的标准化**：接口可以定义通用行为，例如日志记录、线程安全策略等，作为默认方法，让实现类可以专注于业务逻辑而不必重复实现这些通用操作。

## 默认方法的语法

要在接口中定义一个默认方法，需要使用default关键字：

```java
public interface MyInterface {
    default void myDefaultMethod() {
        // 方法实现
        System.out.println("This is a default method.");
    }
}
```

## 使用默认方法

- 继承默认实现：实现接口的类自动获得默认方法的实现，除非它选择重写该方法。

- 覆盖默认方法：实现类可以像覆盖抽象方法一样覆盖默认方法，提供自己的实现。

- 调用默认方法：
  - 在实现类中，可以通过this关键字调用默认方法；
  - 在接口的静态方法或其他默认方法中，可以使用接口名来调用默认方法。

## 注意事项

- 冲突解决：如果一个类实现了两个接口，而这两个接口都定义了同名的默认方法，那么这个类必须覆盖该方法以解决冲突，否则会导致编译错误。

- 静态方法：Java 8 同时也引入了接口中的静态方法，它与默认方法类似，但不能被子类继承或覆盖，只能通过接口直接调用。

- 默认方法的引入，使得Java接口设计更加灵活，为API的演进和扩展提供了强大的支持，同时也保持了代码的简洁和清晰。

## 示例

默认方法与抽象方法的结合
接口仍然可以包含抽象方法，子类必须实现这些抽象方法，但可以选择是否覆盖默认方法。

```java
public interface MyInterface {
    void abstractMethod();

    default void defaultMethod() {
        System.out.println("This is a default method");
    }

}

public class MyClass implements MyInterface {
    @Override
    public void abstractMethod() {
        System.out.println("Implementing abstract method");
    }

    public static void main(String[] args) {
        MyClass obj = new MyClass();
        obj.abstractMethod();  // 输出 "Implementing abstract method"
        obj.defaultMethod();  // 输出 "This is a default method"
    }

}
```

与静态方法的结合
Java 8 还允许在接口中定义静态方法。静态方法和默认方法一样，在接口中具有具体实现。

```java
public interface MyInterface {
    default void defaultMethod() {
        System.out.println("This is a default method");
    }
    static void staticMethod() {
    	System.out.println("This is a static method in the interface");
	}
}
public class MyClass implements MyInterface {
    public static void main(String[] args) {
        MyClass obj = new MyClass();
        obj.defaultMethod();  // 输出 "This is a default method"
        MyInterface.staticMethod();  // 输出 "This is a static method in the interface"
    }
}
```
## 实际应用场景

集合框架的增强：Java 8 的集合框架中添加了大量默认方法，如 forEach、spliterator 等，极大地增强了集合处理的能力。
接口演化：通过默认方法，可以在不破坏现有实现的前提下对接口进行扩展，提供新的功能。
多重继承：通过接口的默认方法，Java 实现了一定程度的多重继承，解决了传统单继承模型的局限性。






