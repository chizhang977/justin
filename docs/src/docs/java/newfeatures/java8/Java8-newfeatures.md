# Java8新特性
- [Lambda表达式](./Java8-Lambda.md):
Lambda表达式是Java对函数式编程的引入，允许以简洁的语法定义匿名函数。它使得开发者可以直接以函数作为参数传递给其他方法，或作为变量存储。这极大简化了集合操作和事件监听等场景的代码。

- [方法引用](./Java8-Lambda.md#方法引用):
方法引用提供了一种更简洁的方式来引用已有方法的实现，与Lambda表达式紧密相关，是Lambda的一种特殊情况，比如ClassName::methodName。

- [Stream API](./Java8-StreamAPI.md):
Stream API提供了一种高效处理集合的方式，支持高级函数式编程操作，如map、filter、reduce、sort等。它可以并行处理数据，提高了性能，并且使得代码更加简洁、可读性强。

- [默认方法和静态方法在接口中](./Java8-defaultMethod.md):
接口现在可以包含具有默认实现的方法（使用default关键字），以及静态方法，这有助于接口的进化而不破坏现有的实现类，同时提供公共行为的默认实现。



- [Optional类](./Java8-optional.md):
Optional是一个可以为null的容器对象，用于避免空指针异常，鼓励更干净、更安全的编程习惯。它迫使开发者思考潜在的空值情况，并提供了优雅的处理方式。

- [新的日期/时间API（java.time包）](Java8-datetime.md):
引入了新的日期和时间类，如LocalDate、LocalTime、LocalDateTime、ZonedDateTime、Instant等，以及Duration和Period来处理时间和日期间隔，提供了更丰富的日期时间操作，解决了旧API（如java.util.Date和Calendar）的许多问题。
- [类型注解:](./Java8-typeAnno.md)
这是对注解系统的一次扩展，允许注解出现在代码中的更多位置。
- [重复注解:](./Java8-repeatAnno.md)
现在可以在同一地方多次应用相同的注解，增加了注解的灵活性和用途。

- [类型推断的改进:](./Java8-typeInference.md)
Java 8增强了类型推断，尤其是在使用Lambda表达式时，使得代码更加简洁，减少了类型声明的需要。

- Base64编码解码:
Java 8在java.util.Base64包中加入了Base64编解码的支持，提供了更便捷的数据编码处理方式。