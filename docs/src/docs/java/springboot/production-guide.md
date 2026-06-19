---
title: Spring Boot 生产实践指南
---

# Spring Boot 生产实践指南

Spring Boot 的价值不是“快速启动一个接口”，而是把配置、依赖、日志、异常、监控、部署等工程能力统一起来。学习 Spring Boot 时，应该把它放到真实生产流程里理解。

## 项目结构

推荐结构：

```text
src/main/java/com/example/app
  ├── AppApplication.java
  ├── common
  │   ├── Result.java
  │   ├── PageResult.java
  │   └── ErrorCode.java
  ├── config
  ├── controller
  ├── service
  │   └── impl
  ├── mapper
  ├── domain
  │   ├── entity
  │   ├── dto
  │   └── vo
  └── exception
```

分层的核心原则：

- Controller 只处理 HTTP 层：参数接收、校验、响应。
- Service 处理业务流程和事务。
- Mapper 只负责数据库访问。
- DTO 面向请求入参，VO 面向响应结果，Entity 面向数据库表。

## 统一响应

接口返回结构要统一，方便前端处理和排查问题。

```java
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.code = 200;
        result.message = "success";
        result.data = data;
        return result;
    }

    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.code = code;
        result.message = message;
        return result;
    }
}
```

生产注意点：

- 不要把 Java 异常堆栈直接返回给用户。
- 错误码要稳定，便于前端和日志系统识别。
- 成功、失败、分页结构保持一致。

## 参数校验

使用 Bean Validation 可以减少重复判断。

```java
public class UserCreateRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "手机号不能为空")
    private String phone;
}
```

Controller 中使用：

```java
@PostMapping("/users")
public Result<Long> create(@RequestBody @Valid UserCreateRequest request) {
    return Result.success(userService.create(request));
}
```

注意：

- 前端校验只能提升体验，不能替代后端校验。
- 重要业务规则应在 Service 层再次确认。
- 参数校验失败要进入统一异常处理。

## 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        return Result.fail(500, "系统异常，请稍后重试");
    }
}
```

生产环境要补充日志：

```java
log.error("system error, requestId={}", requestId, e);
```

日志里建议包含：

- requestId。
- 用户 id。
- 请求路径。
- 关键参数。
- 异常堆栈。

敏感信息如密码、token、身份证号不能直接写入日志。

## 事务管理

事务一般放在 Service 层。

```java
@Transactional(rollbackFor = Exception.class)
public Long createOrder(CreateOrderRequest request) {
    Long orderId = orderMapper.insert(request);
    stockService.reduce(request.getSkuId(), request.getCount());
    return orderId;
}
```

常见事务失效场景：

| 场景 | 原因 | 处理 |
| --- | --- | --- |
| 方法不是 public | Spring AOP 默认代理 public 方法 | 事务方法保持 public |
| 同类内部方法调用 | 没有经过代理对象 | 拆到另一个 Service 或通过代理调用 |
| 异常被 catch 后吞掉 | Spring 感知不到异常 | catch 后重新抛出或手动标记回滚 |
| 默认检查异常不回滚 | 默认只回滚 RuntimeException | 设置 `rollbackFor = Exception.class` |

生产建议：

- 事务范围尽量小。
- 不要在事务中做远程调用。
- 不要在事务中处理大文件。
- 批量操作要控制数量，避免长事务。

## 配置分环境

推荐使用多环境配置：

```text
application.yml
application-dev.yml
application-prod.yml
```

启动时指定：

```bash
java -jar app.jar --spring.profiles.active=prod
```

生产环境敏感配置不要提交到 Git 仓库，可以通过环境变量、配置中心或部署平台注入。

## 日志配置

日志级别建议：

| 环境 | 级别 | 说明 |
| --- | --- | --- |
| dev | DEBUG / INFO | 方便开发调试 |
| test | INFO | 接近生产 |
| prod | INFO / WARN | 避免日志过多影响性能 |

接口日志要记录关键链路，但不能无脑打印所有请求体。大对象、文件内容、敏感字段都要过滤。

## 部署流程

Jar 包部署：

```bash
mvn clean package -DskipTests
java -jar target/app.jar --spring.profiles.active=prod
```

Docker 部署：

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建和运行：

```bash
docker build -t app:1.0.0 .
docker run -d --name app -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod app:1.0.0
```

## 实践总结

搭建 Spring Boot 项目时，先确定分层结构：Controller 负责请求和参数校验，Service 负责业务和事务，Mapper 负责数据访问。

然后配置统一响应、全局异常处理、日志、参数校验和多环境配置。数据库访问要关注事务边界和 SQL 性能，缓存要考虑一致性和异常降级。最后通过 Docker 或 CI/CD 发布，并保留日志、健康检查和回滚方案。
