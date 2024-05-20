# Java8新特性-时间日期

Java 8 引入了全新的日期和时间 API，该 API 位于 `java.time `包中，旨在解决旧的 java.util.Date 和 java.util.Calendar 类的诸多问题。新的日期和时间 API 提供了**强类型、不可变**的日期和时间操作，同时简化了日期和时间的计算和格式化。

## 主要类和接口

1. **LocalDate**
  表示没有时间的日期，例如：2024-05-19。

    - **now()**：获取当前日期。

    - **of()**：创建特定日期。

    - **plusDays(long daysToAdd)**：在当前日期基础上加指定天数。

    - **minusDays(long daysToSubtract)**：在当前日期基础上减指定天数。

    - **getDayOfWeek()**：获取当前日期是星期几。

    - **isLeapYear()**：判断当前年份是否是闰年。

    - **format(DateTimeFormatter formatter)**：格式化日期。

    ```java
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    String formattedDate = LocalDate.now().format(formatter);
    ```

2. **LocalTime**
  表示没有日期的时间，例如：13:45:30。

3. **LocalDateTime**
  表示日期和时间，例如：2024-05-19T13:45:30。

4. **ZonedDateTime**
  表示带有时区的日期和时间，例如：2024-05-19T13:45:30+01:00[Europe/Paris]。

5. **Instant**
  表示时间戳，例如：2024-05-19T13:45:30Z。

6. **Duration**
  表示时间段，以秒和纳秒为基准。

7. **Period**
  表示时间段，以年、月和日为基准。


## 示例

创建日期和时间对象

```java
import java.time.*;

public class DateTimeExample {
    public static void main(String[] args) {
        // 创建当前日期对象
        LocalDate today = LocalDate.now();
        System.out.println("Today's date: " + today);//2024-05-19

        // 创建特定日期对象
        LocalDate specificDate = LocalDate.of(2020, Month.JANUARY, 1);
        System.out.println("Specific date: " + specificDate);// 2020-01-01

        // 创建当前时间对象
        LocalTime currentTime = LocalTime.now();
        System.out.println("Current time: " + currentTime);// 23:35:45.851272400

        // 创建特定时间对象
        LocalTime specificTime = LocalTime.of(14, 30, 15);
        System.out.println("Specific time: " + specificTime);// 14:30:15

        // 创建当前日期时间对象
        LocalDateTime currentDateTime = LocalDateTime.now();
        // 2024-05-19T23:35:45.851272400
        System.out.println("Current date and time: " + currentDateTime);

        // 创建特定日期时间对象
        LocalDateTime specificDateTime = LocalDateTime.of(2020, Month.JANUARY, 1, 14, 30, 15);
        ////2020-01-01T14:30:15
        System.out.println("Specific date and time: " + specificDateTime);

        // 创建当前带时区的日期时间对象
        ZonedDateTime currentZonedDateTime = ZonedDateTime.now();
        //2024-05-19T23:35:45.855817300+08:00[Asia/Shanghai]
        System.out.println("Current date and time with zone: " + currentZonedDateTime);

        // 创建特定时区的日期时间对象
        ZonedDateTime specificZonedDateTime = ZonedDateTime.of(2020, 1, 1, 14, 30, 15, 0, ZoneId.of("Europe/Paris"));
        //2020-01-01T14:30:15+01:00[Europe/Paris]
        System.out.println("Specific date and time with zone: " + specificZonedDateTime);

        // 创建时间戳
        Instant timestamp = Instant.now();
        //2024-05-19T15:35:45.863394600Z
        System.out.println("Current timestamp: " + timestamp);
    }
}

```

日期和时间计算

```java
public class DateTimeCalculation {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        System.out.println("Today's date: " + today);//Today's date: 2024-05-19

        // 加减日期
        LocalDate nextWeek = today.plusWeeks(1);
        System.out.println("Next week: " + nextWeek);//Next week: 2024-05-26

        
        LocalDate previousMonthSameDay = today.minusMonths(1);
        //Previous month same day: 2024-04-19
        System.out.println("Previous month same day: " + previousMonthSameDay);

        // 加减时间
        LocalTime now = LocalTime.now();
        System.out.println("Current time: " + now);//Current time: 23:45:34.543283100

        LocalTime inTwoHours = now.plusHours(2);
        System.out.println("In two hours: " + inTwoHours);//In two hours: 01:45:34.543283100

        LocalTime thirtyMinutesAgo = now.minusMinutes(30);
        System.out.println("Thirty minutes ago: " + thirtyMinutesAgo);//Thirty minutes ago: 23:15:34.543283100
    }
}

```

时间段表示

```java
import java.time.*;

public class DurationPeriodExample {
    public static void main(String[] args) {
        LocalTime startTime = LocalTime.of(14, 0);
        LocalTime endTime = LocalTime.of(16, 30);

        Duration duration = Duration.between(startTime, endTime);
        System.out.println("Duration: " + duration);

        LocalDate startDate = LocalDate.of(2020, Month.JANUARY, 1);
        LocalDate endDate = LocalDate.of(2021, Month.JANUARY, 1);

        Period period = Period.between(startDate, endDate);
        System.out.println("Period: " + period);
    }
}

```

格式化和解析日期时间

```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateTimeFormatParse {
    public static void main(String[] args) {
        LocalDateTime dateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 格式化日期时间
        String formattedDateTime = dateTime.format(formatter);
        //Formatted date and time: 2024-05-19 23:49:39
        System.out.println("Formatted date and time: " + formattedDateTime);

        // 解析日期时间
        String dateTimeString = "2024-05-19 14:30:15";
        LocalDateTime parsedDateTime = LocalDateTime.parse(dateTimeString, formatter);
        //Parsed date and time: 2024-05-19T14:30:15
        System.out.println("Parsed date and time: " + parsedDateTime);
    }
}

```

