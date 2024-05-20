# Java8新特性-Optional

Java 8引入了`Optional`类，这是一个容器类，它可能包含或者不包含非`null`值。`Optional`的设计目的是尽可能避免空指针异常（`NullPointerException`），鼓励程序员更好地设计代码，避免`null`值的滥用，从而提高代码的健壮性。

## Optional的特性
- **避免空指针**：通过使用`Optional`，可以避免直接返回`null`，减少`NullPointerException`的风险。
- **链式调用**：支持优雅的链式调用，便于进行一系列可能为空的值的处理。
- **明确意图**：代码阅读者可以清楚地看到某个值可能是不存在的。
- **静态工厂方法**：提供了多种静态方法来创建`Optional`实例，如`ofNullable`、`of`等。

## 常用方法

:::tip optional

![optional](/assets/image/java/newfeatures/optional.png)

:::

**创建Optional**
- `Optional.of(T value)`: 创建一个Optional实例，value必须非null。
- `Optional.ofNullable(T value)`: 创建一个Optional实例，value可以为null。
- `Optional.empty()`: 创建一个空的Optional实例。

**判断是否存在**
- `isPresent()`: 判断是否有值存在。
- `isEmpty()`<Badge type="danger" text="Java9" />: 判断是否为空。

**获取值**
- `get()`: 如果Optional有值则返回，否则抛出NoSuchElementException异常。
- `orElse(T other)`: 如果Optional有值则返回，否则返回other。
- `orElseGet(Supplier<? extends T> supplier)`: 如果Optional有值则返回，否则返回supplier的get方法结果。

**转换与映射**
- `map(Function<? super T, ? extends U> mapper)`: 如果有值，则对其应用提供的mapping函数(返回任意类型)，否则返回Optional.empty()。
- `flatMap(Function<? super T, Optional<U>> mapper)`: 如果有值，则对其应用提供的mapping函数并平坦化结果（只能返回Optional），否则返回Optional.empty()。

**过滤**
- `filter(Predicate<? super T> predicate)`: 如果值存在并且满足predicate，则返回Optional包含该值，否则返回Optional.empty()。

```Java
import java.util.Optional;

public class OptionalDemo {

    public static void main(String[] args) {
        // 创建Optional实例
        Optional<String> optionalWithValue = Optional.of("Hello World");
        Optional<String> optionalEmpty = Optional.empty();
        
        // 判断是否存在
        System.out.println(optionalWithValue.isPresent()); // 输出: true
        System.out.println(optionalEmpty.isEmpty());      // 输出: true
        
        // 获取值
        System.out.println(optionalWithValue.get());       // 输出: Hello World
        System.out.println(optionalEmpty.orElse("默认值")); // 输出: 默认值
        
        // 转换与映射
        Optional<Integer> length = optionalWithValue.map(String::length);
        System.out.println(length.get()); // 输出: 11
        
        // 过滤
        Optional<String> filtered = optionalWithValue.filter(s -> s.length() > 5);
        System.out.println(filtered.get()); // 输出: Hello World
        
        // 扁平化
        Optional<String> flatMapped = optionalWithValue.flatMap(OptionalDemo::toUppercase);
        System.out.println(flatMapped.get()); // 输出: HELLO WORLD
    }

    // 示例方法，返回Optional
    static Optional<String> toUppercase(String str) {
        return Optional.ofNullable(str).map(String::toUpperCase);
    }
}
```
