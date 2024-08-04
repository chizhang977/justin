import{_ as s,c as i,o as a,a4 as n}from"./chunks/framework.Dcf-1z4i.js";const y=JSON.parse('{"title":"Java11新特性","description":"","frontmatter":{},"headers":[],"relativePath":"docs/java/newfeatures/java11/README.md","filePath":"docs/java/newfeatures/java11/README.md","lastUpdated":1716722500000}'),t={name:"docs/java/newfeatures/java11/README.md"},l=n(`<h1 id="java11新特性" tabindex="-1">Java11新特性 <a class="header-anchor" href="#java11新特性" aria-label="Permalink to &quot;Java11新特性&quot;">​</a></h1><p>Java 11，是2018年9月发布的，是继Java 8之后的又一个长期支持版本（LTS）。它引入了许多新特性和改进，以下是Java 11中一些重要的新特性和改进. <a href="https://openjdk.java.net/projects/jdk/11/" target="_blank" rel="noreferrer">Java11新特性</a></p><div class="warning custom-block"><p class="custom-block-title">Java11 新特性</p><blockquote><ul><li>181: <a href="https://openjdk.java.net/jeps/181" target="_blank" rel="noreferrer">Nest-Based Access Control</a> 基于嵌套的访问控制</li><li>309: <a href="https://openjdk.java.net/jeps/309" target="_blank" rel="noreferrer">Dynamic Class-File Constants</a> 动态类文件常量</li><li>315: <a href="https://openjdk.java.net/jeps/315" target="_blank" rel="noreferrer">Improve Aarch64 Intrinsics</a> 改进 Aarch64 Intrinsics</li><li>318: <a href="https://openjdk.java.net/jeps/318" target="_blank" rel="noreferrer">Epsilon: A No-Op Garbage Collector</a> Epsilon — 一个No-Op（无操作）的垃圾收集器</li><li>320: <a href="https://openjdk.java.net/jeps/320" target="_blank" rel="noreferrer">Remove the Java EE and CORBA Modules</a> 删除 Java EE 和 CORBA 模块</li><li>321: <a href="https://openjdk.java.net/jeps/321" target="_blank" rel="noreferrer">HTTP Client (Standard)</a> HTTPClient API</li><li>323: <a href="https://openjdk.java.net/jeps/323" target="_blank" rel="noreferrer">Local-Variable Syntax for Lambda Parameters</a> 用于 Lambda 参数的局部变量语法</li><li>324: <a href="https://openjdk.java.net/jeps/324" target="_blank" rel="noreferrer">Key Agreement with Curve25519 and Curve448</a> Curve25519 和 Curve448 算法的密钥协议</li><li>327: <a href="https://openjdk.java.net/jeps/327" target="_blank" rel="noreferrer">Unicode 10</a></li><li>328: <a href="https://openjdk.java.net/jeps/328" target="_blank" rel="noreferrer">Flight Recorder</a> 飞行记录仪</li><li>329: <a href="https://openjdk.java.net/jeps/329" target="_blank" rel="noreferrer">ChaCha20 and Poly1305 Cryptographic Algorithms</a> ChaCha20 和 Poly1305 加密算法</li><li>330: <a href="https://openjdk.java.net/jeps/330" target="_blank" rel="noreferrer">Launch Single-File Source-Code Programs</a> 启动单一文件的源代码程序</li><li>331: <a href="https://openjdk.java.net/jeps/331" target="_blank" rel="noreferrer">Low-Overhead Heap Profiling</a> 低开销的 Heap Profiling</li><li>332: <a href="https://openjdk.java.net/jeps/332" target="_blank" rel="noreferrer">Transport Layer Security (TLS) 1.3</a> 支持 TLS 1.3</li><li>333: <a href="https://openjdk.java.net/jeps/333" target="_blank" rel="noreferrer">ZGC: A Scalable Low-Latency Garbage Collector(Experimental)</a> 可伸缩低延迟垃圾收集器</li><li>335: <a href="https://openjdk.java.net/jeps/335" target="_blank" rel="noreferrer">Deprecate the Nashorn JavaScript Engine</a> 弃用 Nashorn JavaScript 引擎</li><li>336: <a href="https://openjdk.java.net/jeps/336" target="_blank" rel="noreferrer">Deprecate the Pack200 Tools and API</a> 弃用 Pack200 工具和 API</li></ul></blockquote></div><h2 id="_1、新的httpclient-api" tabindex="-1">1、新的<code>HttpClient</code> API <a class="header-anchor" href="#_1、新的httpclient-api" aria-label="Permalink to &quot;1、新的\`HttpClient\` API&quot;">​</a></h2><p>Java 11正式引入了新的HttpClient API，它最初在Java 9中作为孵化器模块引入，在Java 10中作为孵化器模块更新，并在Java 11中变成标准。这个API用于发送HTTP请求和接收HTTP响应。</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.net.http.HttpClient;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.net.http.HttpRequest;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.net.http.HttpResponse;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.net.URI;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.time.Duration;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HttpClientExample</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">args</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        HttpClient client </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HttpClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">newBuilder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">version</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(HttpClient.Version.HTTP_2)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">followRedirects</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(HttpClient.Redirect.NORMAL)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">connectTimeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Duration.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ofSeconds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        HttpRequest request </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HttpRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">newBuilder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">uri</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> URI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://httpbin.org/get&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">timeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Duration.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ofMinutes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">header</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Content-Type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;application/json&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        HttpResponse&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; response </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> client.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request, HttpResponse.BodyHandlers.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ofString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(response.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">statusCode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(response.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="主要特性包括" tabindex="-1">主要特性包括： <a class="header-anchor" href="#主要特性包括" aria-label="Permalink to &quot;主要特性包括：&quot;">​</a></h3><ul><li>支持同步和异步模式</li><li>支持HTTP/1.1和HTTP/2</li><li>内置的WebSocket支持</li><li>更好的API设计和易用性</li></ul><h2 id="_2、新的字符串方法" tabindex="-1">2、新的字符串方法 <a class="header-anchor" href="#_2、新的字符串方法" aria-label="Permalink to &quot;2、新的字符串方法&quot;">​</a></h2><p>Java 11为String类添加了一些非常有用的新方法，使得字符串操作更加方便和高效：</p><ul><li><code>isBlank()</code>: 判断字符串是否为空白</li><li><code>lines()</code>: 将字符串按行分割为流</li><li><code>strip()</code>: 去除首尾空白</li><li><code>stripLeading()</code>: 去除首部空白</li><li><code>stripTrailing()</code>: 去除尾部空白</li><li><code>repeat(int count)</code>: 重复字符串</li></ul><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String str </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;  Hello World  &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(str.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isBlank</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isBlank</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String multiLineStr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Line1</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Line2</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Line3&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">multiLineStr.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lines</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">forEach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(System.out</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">println);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(str.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">strip</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// &quot;Hello World&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(str.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stripLeading</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// &quot;Hello World  &quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(str.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stripTrailing</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// &quot;  Hello World&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String repeated </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;abc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">repeat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// &quot;abcabcabc&quot;</span></span></code></pre></div><h2 id="_3、新的文件方法" tabindex="-1">3、新的文件方法 <a class="header-anchor" href="#_3、新的文件方法" aria-label="Permalink to &quot;3、新的文件方法&quot;">​</a></h2><p>Java 11引入了两个新的方法，用于更简洁地读取和写入文件：</p><ul><li><code>Files.writeString()</code></li><li><code>Files.readString()</code></li></ul><p>这些方法可以大大简化文件操作代码，提高代码的可读性和维护性。</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.nio.file.Files;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.nio.file.Path;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> java.nio.file.Paths;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> FileExample</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">args</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Path path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Paths.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;example.txt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Files.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">writeString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(path, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Hello, Java 11!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String content </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Files.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">readString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(path);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(content);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_4、epsilon-gc" tabindex="-1">4、Epsilon GC <a class="header-anchor" href="#_4、epsilon-gc" aria-label="Permalink to &quot;4、Epsilon GC&quot;">​</a></h2><p>Epsilon 是一种不执行任何垃圾收集操作的垃圾收集器。它的主要用途是性能测试和对比分析。</p><h3 id="主要特性" tabindex="-1">主要特性 <a class="header-anchor" href="#主要特性" aria-label="Permalink to &quot;主要特性&quot;">​</a></h3><ul><li>不进行垃圾收集操作。</li><li>用于测试和性能调优，分析GC的影响。</li></ul><h3 id="配置方式" tabindex="-1">配置方式 <a class="header-anchor" href="#配置方式" aria-label="Permalink to &quot;配置方式&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">java</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -XX:+UnlockExperimentalVMOptions</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -XX:+UseEpsilonGC</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -Xmx2g</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -Xms2g</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span></span></code></pre></div><h2 id="_5、zgc" tabindex="-1">5、ZGC <a class="header-anchor" href="#_5、zgc" aria-label="Permalink to &quot;5、ZGC&quot;">​</a></h2><p>ZGC是一个可扩展的低延迟垃圾收集器，设计用于处理大内存堆。</p><h3 id="主要特性-1" tabindex="-1">主要特性 <a class="header-anchor" href="#主要特性-1" aria-label="Permalink to &quot;主要特性&quot;">​</a></h3><ul><li>极低的暂停时间（通常小于10ms）。</li><li>支持从几百MB到数TB的堆内存。</li><li>对应用性能影响最小。</li></ul><h3 id="配置方式-1" tabindex="-1">配置方式： <a class="header-anchor" href="#配置方式-1" aria-label="Permalink to &quot;配置方式：&quot;">​</a></h3><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">java</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -XX:+UnlockExperimentalVMOptions</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -XX:+UseZGC</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -Xmx2g</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -Xms2g</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MyApp</span></span></code></pre></div><h2 id="_6、运行java文件" tabindex="-1">6、运行Java文件 <a class="header-anchor" href="#_6、运行java文件" aria-label="Permalink to &quot;6、运行Java文件&quot;">​</a></h2><p>Java 11允许你直接运行Java源文件，而不需要显式地编译。这使得开发和测试小的程序片段更加方便。</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">java</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> HelloWorld.java</span></span></code></pre></div><p>这意味着你可以直接执行包含main方法的Java文件，简化了开发者的工作流。</p><h2 id="_7、改进的nest-based访问控制" tabindex="-1">7、改进的Nest-Based访问控制 <a class="header-anchor" href="#_7、改进的nest-based访问控制" aria-label="Permalink to &quot;7、改进的Nest-Based访问控制&quot;">​</a></h2><p>Java 11引入了Nest-Based的访问控制，以更好地支持嵌套类的访问控制。这一改进使得嵌套类可以更方便地访问彼此的私有成员，而不需要生成额外的桥接方法。</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OuterClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String outerField </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;outer&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> InnerClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String innerField </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;inner&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> printFields</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(outerField); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 访问外部类的私有字段</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(innerField); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 访问内部类的私有字段</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_8、动态类文件常量" tabindex="-1">8、动态类文件常量 <a class="header-anchor" href="#_8、动态类文件常量" aria-label="Permalink to &quot;8、动态类文件常量&quot;">​</a></h2><p>动态类文件常量允许在Java类文件中定义常量池的常量值，这些值在类加载时动态计算，而不是在编译时确定。这为将来的优化和增强提供了基础。</p><h3 id="主要特性-2" tabindex="-1">主要特性 <a class="header-anchor" href="#主要特性-2" aria-label="Permalink to &quot;主要特性&quot;">​</a></h3><p>通过invokedynamic指令支持新的常量类型。 提高了虚拟机处理动态语言的能力。</p><h2 id="_9、lambda表达式中使用var关键字" tabindex="-1">9、Lambda表达式中使用var关键字 <a class="header-anchor" href="#_9、lambda表达式中使用var关键字" aria-label="Permalink to &quot;9、Lambda表达式中使用var关键字&quot;">​</a></h2><p>Java 11允许在Lambda表达式中使用var关键字来声明参数类型，并且支持变量的注解。</p><h3 id="主要特性-3" tabindex="-1">主要特性 <a class="header-anchor" href="#主要特性-3" aria-label="Permalink to &quot;主要特性&quot;">​</a></h3><ul><li>使用var关键字简化Lambda表达式参数的声明。</li><li>支持对Lambda参数进行注解。 示例代码：</li></ul><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> list </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> List.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">of</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Java&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Kotlin&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Scala&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">list.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">forEach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nonnull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> var element) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(element));</span></span></code></pre></div><h2 id="_10、-unicode-10-支持" tabindex="-1">10、 Unicode 10 支持 <a class="header-anchor" href="#_10、-unicode-10-支持" aria-label="Permalink to &quot;10、 Unicode 10 支持&quot;">​</a></h2><ul><li>支持最新的Unicode字符和表情符号。</li><li>改进字符处理能力。</li></ul>`,47),h=[l];function e(p,k,r,E,d,o){return a(),i("div",null,h)}const c=s(t,[["render",e]]);export{y as __pageData,c as default};
