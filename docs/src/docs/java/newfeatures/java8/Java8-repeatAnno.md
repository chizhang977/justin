# Java8新特性-重复注解
重复注解（Repeatable Annotations）是Java语言从Java 8开始正式支持的一项特性，它允许在相同的程序元素上多次使用同一个注解。在此之前，如果想要达到类似的效果，往往需要创建包含多个属性的复合注解或者定义注解数组来绕过这一限制。重复注解简化了这一过程，使得注解的使用更加灵活和直观。下面是关于重复注解的详细知识介绍：

## 引入原因
重复注解的设计初衷是为了满足某些场景下需要在同一地方多次应用相同注解的需求，比如标记多个测试用例的预期结果，或者在多个地方标记日志级别等。

## 如何定义重复注解
要创建一个可重复的注解，你需要遵循以下步骤：

### 定义容器注解
首先，定义一个包含@Repeatable元注解的容器注解。这个容器注解是一个数组类型，用于存放重复的注解实例。
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// 容器注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotations {
    MyAnnotation[] value();
}
```
### 定义可重复的注解
接下来，定义实际的注解，该注解将被包含在上面定义的容器注解中。
```java
@MyAnnotation("justin")
@MyAnnotation("justin2")
public void myMethod(String name){
    System.out.println("myMethod invoked with name: " + name);
}
```
注意，在MyAnnotation的定义中不需要任何特殊的标记，只需正常定义即可。

### 应用重复注解
现在可以在方法上多次使用MyAnnotation注解了，它们会自动被收集到MyAnnotations容器注解中。
```java
public class MyClass {
    @MyAnnotations({@MyAnnotation("first"),@MyAnnotation("second")})
    public void myMethod(String name){
        System.out.println("myMethod invoked with name: " + name);
    }
}
```
### 访问重复注解
在运行时，可以通过反射获取这些重复注解并进行处理：
```java
public class MyClass {
    public static void main(String[] args) throws NoSuchMethodException {
        Method myMethod = MyClass.class.getMethod("myMethod", String.class);
        MyAnnotations annotation = myMethod.getAnnotation(MyAnnotations.class);
        for (MyAnnotation myAnnotation : annotation.value()) {
            System.out.println(myAnnotation.value());
        }
    }
}
```
## 注意事项
重复注解是 Java 注解系统的一个重要扩展，它增强了注解的灵活性和表现力，使得注解能够更好地适应复杂多变的软件需求。以下是关于重复注解的一些注意事项和总结：

- **重复注解的定义**：在定义重复注解时，需要在其声明上使用 @Repeatable 元注解，并指定其容器注解。容器注解的值应该是指向可重复注解的类。

- **使用方式**：在使用重复注解时，不需要再次指定容器注解，可以直接多次使用相同的注解。

- **反射获取信息**：使用反射获取重复注解信息时，应该通过容器注解来访问这些注解的实例，而不是直接获取单个注解。可以使用 getAnnotationsByType 方法来获取重复注解的数组。
