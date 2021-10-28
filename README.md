# zdict.js

汉字、拼音、释义等数据。

目前包含：

-   从汉典网站抓取的[七千通用汉字](https://www.zdic.net/zd/zb/ty/)及其拼音、基本释义，存放在
    [js/data-chars.js](js/data-chars.js)
    文件中。抓这些数据的初衷是为了[辅助小朋友识字](https://yihui.org/cn/kids/2021/02/chars/)。
-   汉字频度表
    [js/data-freqs.js](js/data-freqs.js)（[数据来源](https://web.archive.org/web/20120711003705/http://onlinechinese2u.com/blog/wp-content/uploads/2012/04/LEGOO-MANDARIN-%E6%B1%89%E5%AD%97%E9%A2%91%E5%BA%A6%E8%A1%A8%E7%BB%9F%E8%AE%A1.pdf)）

## 中文识字应用

HTML 页面上创建一个 `id` 为 `leanr-chars` 的 `<div>` 容器，再加载 JS 脚本和
CSS，即可生成一个中文识字应用界面。若页面内不存在这个容器，那么界面将在 JS
脚本之后创建。参见这里的[示例页面](https://yihui.org/cn/kids/2021/02/chars/)。

``` html
<div id="learn-chars"></div>

<link href="https://cdn.jsdelivr.net/npm/@xiee/zdict/css/learn-chars.min.css" rel="stylesheet"></link>
<script src="https://cdn.jsdelivr.net/npm/@xiee/zdict/js/zdict.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@xiee/zdict/js/learn-chars.min.js" defer></script>
```

## 汉字数据

若想单独加载数据模块，可以在 JS 中 `import` 导入或者在 Node 中 `require()` 加载
`zdict.js`，其包含两个成员：`chars` 是七千通用汉字数据，`freqs`
是按频度排序的七千汉字。

``` javascript
const zDict = require('@xiee/zdict');
zDict.chars['一'];
zDict.freqs;
```

若在浏览器中加载上述 `jsdelivr` 中的 `zdict.min.js` 那么会得到一个全局对象
`zDict`。
