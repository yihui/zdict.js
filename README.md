# zdict.js

汉字、拼音、释义等数据。

目前包含：

-   从汉典网站抓取的[七千通用汉字](https://www.zdic.net/zd/zb/ty/)及其拼音、基本释义，存放在
    [js/data-chars.js](js/data-chars.js)
    文件中。抓这些数据的初衷是为了[辅助小朋友识字](https://yihui.org/cn/kids/2021/02/chars/)。
-   汉字频度表
    [js/data-freqs.js](js/data-freqs.js)（[数据来源](https://github.com/rbind/yihui/files/8104908/default.pdf)）
-   拼音数据 [js/data-pinyin.js](js/data-pinyin.js)

## 中文识字应用

HTML 页面上创建一个 `id` 为 `leanr-chars` 的 `<div>` 容器，再加载 JS 脚本和
CSS，即可生成一个中文识字应用界面。若页面内不存在这个容器，那么界面将在 JS
脚本之后创建。参见这里的[示例页面](https://yihui.org/cn/kids/2021/02/chars/)。

``` html
<div id="learn-chars"></div>

<link href="https://cdn.jsdelivr.net/npm/@xiee/zdict/css/learn-chars.min.css" rel="stylesheet"></link>
<script src="https://cdn.jsdelivr.net/npm/@xiee/zdict/js/learn-chars.min.js" defer></script>
```

## 汉字数据

若想单独加载数据模块，可以在 JS 中 `import` 导入或者在 Node 中 `require()` 加载
`zdict.js`，其包含两个成员：`chars` 是七千通用汉字数据，`freqs`
是按频度排序的七千汉字。

``` javascript
// JavaScript 模块
import zDict from "./zdict.js";
zDict.chars['一'];
zDict.freqs;
```

``` javascript
// Node
const zDict = require('@xiee/zdict');
zDict.chars['一'];
zDict.freqs;
```

若在浏览器中加载 `jsdelivr` 中的 `zdict.min.js` 那么会得到一个全局对象 `zDict`。

``` javascript
<script src="https://cdn.jsdelivr.net/npm/@xiee/zdict/js/zdict.min.js" defer></script>
<script>
zDict.chars['一'];
zDict.freqs;
</script>
```

## 韵母分组字表

HTML 页面上创建一个 `id` 为 `pinyin-finals` 的容器，然后即可结合 JS 和 CSS
生成一个按韵母分组的字表。参见这里的[示例页面](https://yihui.org/cn/kids/2022/02/finals/)。

``` html
<div id="pinyin-finals"></div>

<link href="https://cdn.jsdelivr.net/npm/@xiee/zdict/css/pinyin-finals.min.css" rel="stylesheet"></link>
<script src="https://cdn.jsdelivr.net/npm/@xiee/zdict/js/pinyin-finals.min.js" defer></script>
```

注意本库中的 JS 源代码是以 JS 模块的方式写的，在发布到 NPM 之前上经过了
[`rollup` 打包](.github/workflows/npm-publish.yml)，以便它们能同时在浏览器和
Node 中使用。
