# Stream API

Java Stream API 是Java 8引入的一个核心特性，它为处理集合数据提供了新的思维方式和工具集。Stream API 支持函数式编程风格，允许以声明式的方式处理数据，使代码更加简洁、高效且易于理解。 **使用Stream API 对集合数据进行操作，就类似于使用 SQL 执行的数据库查询**。下面详细介绍Stream API的主要知识点：

###  Stream 概念

- **流（Stream）**：不是集合数据结构，而是一种数据处理的高级抽象，它代表了数据源的计算操作序列。
- **数据源**：可以是集合（如List、Set）、数组、输入/输出通道或是生成器函数等。
- **中间操作**：不会执行任何处理，而是在流的生命周期中构建一个执行计划，如filter、map、sorted等，它们是延迟执行的。
- **终端操作**：触发实际计算，执行中间操作链，并产生结果或副作用，如forEach、collect、reduce、anyMatch等，执行后流无法再被使用。
:::tip Stream API
![stream](/assets/image/java/newfeatures/stream.png)
:::
### 创建Stream

- 从集合创建：
  - `Collection.stream()` **顺序流**
  - `Collection.parallelStream()`**并行流**
- 数组创建：`Arrays.stream(array)`
- 静态工厂方法：
  - `IntStream.of(int... values)`
  - `Stream.of(T... values)`
  - `Stream.iterate(seed, f)`
  - `Stream.generate(supplier)`

### 中间操作

- **filter(Predicate)**：根据条件过滤元素。
- **map(Function)**：对每个元素应用函数，转换元素类型。
- **flatMap(Function)**：与map相似，但应用于一对多映射，扁平化结果。
- **distinct()**：去除重复元素。
- **sorted(Comparator)**：排序，自然排序或自定义比较器排序。
- **peek(Consumer)**：对每个元素应用操作并传递下去，主要用于调试。
- **limit(long)**：限制流中的元素数量。
- **skip(long)**：跳过流中的前n个元素。

### 终端操作

- **forEach(Consumer)**：对每个元素执行操作。
- **toArray()**：将流转换为数组。
- **reduce(T, BinaryOperator)**：通过二元操作累积流的元素，如求和、求积等。
- **collect(Collector)**：归约操作，如收集到List、Set、Map等。
- **min(Comparator)**：找到最小值。
- **max(Comparator)**：找到最大值。
- **count()**：统计流中元素的数量。
- **anyMatch(Predicate)**、**allMatch(Predicate)**、**noneMatch(Predicate)**：检查是否满足条件。
- **findFirst()**、**findAny()**：找到第一个或任意一个元素。

### 并行处理

- Stream API 支持并行处理，通过`parallelStream()`方法或中间操作`.parallel()`开启，可以自动利用多核CPU，提升性能。

### 短路操作

- 一些终端操作如`findFirst()`、`anyMatch()`等，一旦找到满足条件的元素就会立即停止处理，称为短路操作。

### 函数式接口与Lambda表达式

- Stream API 使用函数式接口（如Predicate、Function、Consumer等）和Lambda表达式来定义操作逻辑，使得代码更简洁。

### 状态与无状态操作

- 无状态操作：操作的结果仅依赖于当前元素，如map。
- 状态操作：操作可能依赖于之前处理过的元素，如sorted。

### 错误处理

- Stream API 在处理过程中遇到错误会抛出异常，如NullPointerException。可以通过try-with-resources或自定义Collector等方式处理异常。

### 性能考量

- 虽然Stream API 提供了简洁的编程模型，但不当使用可能影响性能，如过度的中间操作、不必要的并行处理等。
