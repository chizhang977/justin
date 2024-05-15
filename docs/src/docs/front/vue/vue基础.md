# Vue基础

## 事件修饰符

1. **.stop**

   - **作用**: 阻止事件冒泡。当一个事件发生时，它通常会从最深的嵌套元素开始，逐级向上（向父元素）传播，直到文档根部。`.stop`修饰符可以立即终止这一传播过程，防止事件继续向上冒泡到父元素的事件监听器中。

   ```vue
   <!-- 单击事件将停止传递 -->
   <a @click.stop="doThis"></a>
   ```

2. **.prevent**

   - **作用**: 阻止事件的默认行为。很多DOM元素都有默认行为，比如点击链接``会跳转、表单提交``会刷新页面等。`.prevent`修饰符可以阻止这些默认行为的发生，让你有机会在处理函数中自定义逻辑。

   ```vue
   <!-- 提交事件将不再重新加载页面 -->
   <form @submit.prevent="onSubmit"></form>
   ```

3. **.self**

   - **作用**: 只有当事件是从当前元素本身（而不是子元素）触发时，事件处理函数才会被调用。这在你想阻止子元素触发的事件冒泡到父元素时非常有用。
   - 假设你有一个包含按钮的卡片组件，你只想在点击卡片本身时触发一个动作，而不是点击卡片内的按钮或其他子元素时触发。

   ```vue
   <div class="card" @click.self="showDetails()">
     <h3>Card Title</h3>
     <p>Some content...</p>
     <button>Click Me</button>
   </div>
   <script>
       function  showDetails() {
           alert('Card details shown');
         }
   </script>
   ```

   在这个例子中，只有当直接点击.card元素（而不是它的子元素，比如按钮）时，showDetails方法才会被调用。

4. **.capture**

   - **作用**: 改变事件的传播模式为捕获阶段触发。默认情况下，事件监听器在冒泡阶段触发，而使用`.capture`修饰符可以让事件在捕获阶段就被监听器捕获，即从外向内（从祖先元素到目标元素）传播的过程中处理事件。

   - 假设你有一个嵌套的结构，你希望在点击任何一个子元素之前，先在最外层的容器上执行一些逻辑。

   ```vue
   <div id="outer" @click.capture="outerClick()">
     <div id="middle">
       <button id="inner">Click Me</button>
     </div>
   </div>
   <scrip>
   function outerClick() {
       console.log('Outer click captured');
   }
   </scrip>
   
   ```

   在这个例子中，点击`#inner`按钮时，首先触发的是`#outer`上的`outerClick`方法，因为使用了`.capture`修饰符。如果没有`.capture`，事件会在冒泡阶段到达`#outer`，即先触发按钮自身的点击事件，然后向上冒泡。

5. **.once**

   - **作用**: 事件处理函数只会被执行一次，之后该事件监听器会被自动移除。这对于只需要响应一次的交互非常有用，如初始化设置、弹窗确认等。

6. **.passive**

   - **作用**: 提升性能，告诉浏览器你不会在事件处理函数中调用`preventDefault()`。这允许浏览器提前做出优化，比如对于滚动事件，即使事件处理函数还在队列中等待执行，浏览器也可以立即执行默认的滚动行为，减少卡顿。

   - 在一个长列表滚动的场景中，你可能有一个监听滚动事件的处理函数，但并不想阻止滚动的默认行为。

   ```vue
   <div class="scrollable-list" @scroll.passive="logScrollPosition()">
     <!-- 列表项... -->
   </div>
   <scrip>
     function logScrollPosition() {
       console.log('Scroll position:', window.scrollY);
     }
   </scrip>
   ```

   在这个例子中，`logScrollPosition`方法会在用户滚动列表时被调用，但由于使用了`.passive`，即使函数内部没有调用`preventDefault()`，浏览器也会预先知道并优化滚动性能。