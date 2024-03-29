# 教学系统指令一览表

详细文档见 [这里](https://koishi.js.org/v4/plugins/teach/) 。

### 新增问答

```
-> lorem ipsum               // 添加问题为 lorem，回答为 ipsum 的问答
-> "lorem ipsum" "dolor sit" // 添加问题或回答中含有空格的问答
-> ^lorem$ ipsum -x          // 添加问答，问题为正则表达式
-> l(.+)em $1 -x             // 添加问答，问题为带有捕获组的正则表达式
-> lorem ipsum -p 0.1        // 添加问答，触发概率为 0.1
-> lorem ipsum -P 1          // 添加问答，在句首带 2bot 的情况下触发概率为 1
-> dolor => lorem            // 问题 dolor 会被重定向至 lorem
-> dolor $(dialogue lorem)   // 与上面一行等价
-> lorem $(ipsum)            // 添加问答，回答为调用指令 ipsum 的结果
```

### 特殊字符

```
-> lorem $$            // $$: 单个 $ 字符
-> lorem ipsum$ndolor  // $n: 分条发送
-> lorem "$0 ipsum"    // $0: 指代原问题
-> l(.+)em $1 -x       // $1: 第一个捕获组，$2 及往后同理
-> lorem "$a: ipsum"   // $a: @说话人
-> lorem "$s: ipsum"   // $s: 说话人的名字
-> lorem "$m: ipsum"   // $m: @机器人
```

### 查看与编辑问答

`-p`, `-P` 也可以在此处使用以修改问答，不再重复。

```
->42          // 查看编号为 42 的问答
->42,43       // 查看编号为 42 和 43 的两个问答
->42..44      // 查看编号从 42 到 44 的多个问答
->42 lorem    // 修改编号为 42 的问答的问题
->42 ~ ipsum  // 修改编号为 42 的问答的回答
->42 -r       // 删除编号为 42 的问答
->42 -x       // 将编号为 42 的问答的问题修改为正则问题
->42 -X       // 将编号为 42 的问答的问题修改为普通问题
```

### 搜索问答

```
->>                 // 查看问答数据
->> lorem           // 搜索问题为 lorem 的问答
->> ~ ipsum         // 搜索答案为 ipsum 的问答
->> lorem -x        // 搜索问题为 lorem 的正则问答
->>> lorem          // 搜索问题为 lorem 的所有问答
->> lorem | -p 0.1  // |: 管道语法
                    // 修改所有问题为 lorem 的问答的概率为 0.1
                    // 也可用于 -P, -x, -X
->> lorem -R        // 搜索问题为 lorem 的问答，但不展开重定向
->> lorem / 2       // 搜索问题为 lorem 的问答，并查看第 2 页结果
```