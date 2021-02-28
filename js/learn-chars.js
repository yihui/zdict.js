(function() {
  // 祝 IE 垃圾早日灭亡
  var s = document.currentScript;
  if (!s) return alert('抱歉，本程序不支持您的古董浏览器，请尝试使用 Chrome/Firefox/Edge 等现代浏览器');

  // 学习字库、总字库、挑战字库
  var chars = [], freqs = zDict.freqs.split(''), cChars = freqs.slice();

  // 安插基本元素，用来存放拼音、汉字等信息
  s.insertAdjacentHTML('afterend', '<div id="learn-chars">' +
    '<div id="learn-toolbar"></div>' +
    '<div class="char-block">' +
    '<div class="pinyin" contenteditable></div>' +
    '<div class="char-box kai">' +
    '<span class="char"></span><span class="num"></span></div>' +
    '</div>' +
    '<div class="meaning"></div>' +
    '<p class="source kai right"></p>' +
    '<div id="learn-settings"><p class="seal-line seal-top">密封线内不要答题</p>' +
    '<textarea id="learn-candidates"></textarea>' +
    '<p><span><span>设定字符范围：从第</span> <input type="number" value="1" min="1"> ' +
    '<span>字开始向后选取</span> <input type="number" value="20" min="0" step="10"> <span>字</span></span> ' +
    '<button type="button" id="learn-set">确定</button></p>' +
    '<p class="seal-line seal-bottom">密封线内不要答题</p>' +
    '</div>');

  function sampleOne(x) {
    return x[Math.floor(Math.random() * x.length)];
  }

  function noAccent(x) {
    return x.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  // 比较原始拼音是否相同，如果不同，去掉音调之后再比较
  function checkPinyin(x1, x2) {
    x1 = x1.toLowerCase();
    return x2.split(' - ').indexOf(x1) > -1 || noAccent(x2).split(' - ').indexOf(x1) > -1;
  }

  var d = document.getElementById('learn-chars'),
      tb = d.querySelector('#learn-toolbar'), cb = d.querySelector('.char-block'),
      py = cb.querySelector('.pinyin'), zi = cb.querySelector('.char'),
      mn = d.querySelector('.meaning'), sc = d.querySelector('.source'),
      ls = d.querySelector('#learn-settings'), lc = ls.querySelector('#learn-candidates');

  // 几种使用模式的单选框
  ['学习', '复习', '测验', '挑战'].forEach(function(el, i) {
    tb.innerHTML += '<input name="mode" type="radio" id="mode-'+ i +
    '" ' + (i === 0 ? 'checked' : '') +
    '/><label for="mode-' + i + '" class="label">' + el + '</label> ';
  });
  var mode = 0;

  // 浏览器的本地存储
  var S = {
    "get": function(k) { return localStorage.getItem(k); },
    "set": function(k, d) { try { localStorage.setItem(k, d); } catch (e) {} },
    "remove": function(k) { localStorage.removeItem(k); }
  };

  // 加载字库；如果以前有保存过字库，就用以前存的，否则用汉字频度表
  var key1 = 'candidate-chars';
  lc.value = S.get(key1);
  if (!lc.value) lc.value = zDict.freqs;

  // 保存学过的字，供复习用
  var key2 = 'learned-chars', p = [-1, 0, -1];
  function saveChar(x, key) {
    var data = S.get(key);
    if (!data) { data = ''; } else if (data.match(x)) return;
    data += x;
    S.set(key, data);
  }
  function learnedChars(key) {
    var x = S.get(key);
    return x ? x.split('') : [];
  }

  function setChars() {
    p = [-1, 0, -1];
    chars = lc.value.split('');
    if (lc.value !== '' && lc.value !== zDict.freqs) {
      var v = [];
      chars.forEach(function(x) {
        v.indexOf(x) === -1 && zDict.freqs.indexOf(x) >= 0 && v.push(x);
      });
      chars = [];
      freqs.forEach(function(x) {
        v.indexOf(x) >= 0 && chars.push(x);
      });
      lc.value = chars.join('');
      S.set(key1, lc.value);
    } else {
      S.remove(key1);
    }
    if (chars.length === 0) chars = freqs;
    var n = [], ns = ls.querySelectorAll('input[type="number"]'), n0 = ns[0], n1 = ns[1];
    n[0] = +n0.value; n[1] = +n1.value;
    if (n[0] < 1 || n[0] > chars.length) n0.value = n[0] = 1;
    if (n[1] < 0) n1.value = n[1] = 0;
    // 特例：如果设定总共使用 0 个字符，那么选择所有字符
    if (n[1] > 0) chars = chars.slice(n[0] - 1, n[0] - 1 + n[1]);
    S.remove(key2);
    d.querySelectorAll('.review').forEach(removeEl); // 重新生成复习字块
    mode === 1 && renderReview();
  }
  setChars();

 // 按顺序显示一字及其相关信息
  function renderChar(char) {
    py.innerText = zi.innerText = mn.innerText = zi.nextElementSibling.innerText = '';
    if (mode != 3) sc.innerText = '';
    py.setAttribute('contenteditable', true);
    cb.classList.remove('correct', 'wrong');
    var num;  // 挑战模式下的字符编号
    if (!char) {
      switch (mode) {
        case 0:
          // 学习模式：顺序显示一字
          if (p[0] >= chars.length - 1) p[0] = -1;
          char = chars[++p[0]];
          saveChar(char, key2);
          break;

        case 1:
          // 复习模式：显示学习过的字
          var lChars = learnedChars(key2);
          if (lChars.length === 0) {
            py.innerHTML = '<p style="font-size: .5em;">学习记录都没得，复习个锤子哦</p>';
            return;
          }
          // 从全集中寻找下一个历史记录中的字
          while (lChars.indexOf(char) === -1) {
            if (p[1] >= chars.length - 1) p[1] = -1;
            char = chars[++p[1]];
          }
          break;

        case 2:
          // 测验模式：依次测试全集拼音
          if (p[2] >= chars.length - 1) {
            p[2] = -1;
            return alert('测验结束！');
          }
          char = chars[++p[2]];
          break;

        case 3:
          // 挑战模式：随机抽取一字测验
          char = sampleOne(cChars);
          cChars.splice(cChars.indexOf(char), 1);
          break;
      }
    }
    if (mode === 1) highlightReview();
    var info = renderPinyin(char, zi, py, ' - ');
    if (!info) return;
    var me = '';
    for (var k in info) {
      me += '<p class="py">' + k + '</p><ol><li>' + info[k].join('</li><li>') + '</li></ol>';
    };
    mn.innerHTML = me;
    sc.innerHTML = '资料来源：汉典（<a href="https://www.zdic.net/hans/' + char + '" target="_blank">查看详情</a>）';
  }
  function renderPinyin(char, zi, py, sep) {
    zi.innerText = char;
    zi.nextElementSibling.innerText = freqs.indexOf(char) + 1;
    var info = zDict.chars[char], pys = Object.keys(info);
    if (mode >= 2) {
      py.dataset.pinyin = pys.join(' - '); // 将正确拼音保存在数据中
      py.focus();
      return;
    }
    py.innerText = pys.join(sep);
    return info;
  }

 // 初始随机显示一个字
  renderChar(sampleOne(freqs));

  // 戳一下换一字
  zi.parentElement.addEventListener('click', function(e) {
    renderChar();
  });

  function removeEl(el) { el && el.remove(); }

  // 高亮学习过的字
  function highlightReview() {
    var el = d.querySelector('.current'); el && el.classList.remove('current');
    d.querySelectorAll('.review')[p[1]].querySelector('.char-box').classList.add('current');
  }

  // 更换模式
  function modeChange(e) {
    mode = +this.id.replace('mode-', '');
    d.classList[mode === 1 ? 'add' : 'remove']('review-pane');
    d.classList.remove('review-all');
    renderChar();
  }
  // 复习模式下把字集中的每个字都渲染出来，但默认是隐藏的
  function renderReview() {
    var rs = d.querySelectorAll('.review'), lChars = learnedChars(key2);
    rs.forEach(function(el, i) {
      i < lChars.length && el.classList.add('review-show');
    });
    if (rs.length >= chars.length) return;
    var all = d.classList.contains('review-all');
    chars.forEach(function(char, i) {
      // 已经生成的字就表再生成了；若不显示所有的字，那么只生成学过的字
      if (i < rs.length || (!all && i >= lChars.length)) return;
      var nb = cb.cloneNode(true), zi = nb.querySelector('.char');
      renderPinyin(char, zi, nb.querySelector('.pinyin'), '\n');
      zi.parentElement.addEventListener('click', function(e) {
        p[1] = i;
        renderChar(char);
      });
      nb.classList.add('review', all ? 'review' : 'review-show');
      d.insertBefore(nb, cb);
    });
  }
  d.querySelectorAll('input[name="mode"]').forEach(function(el, i) {
    el.addEventListener('change', modeChange);
    i === 1 && el.addEventListener('click', function(e) {
      // 点击复习单选框，显示或隐藏还没学过的字
      mode === i && d.classList.toggle('review-all');
      renderReview();
    });
    i >= 2 && el.addEventListener('keyup', function(e) {
      e.key === 'Enter' && renderChar();
    });
  });

  // 测验
  var nw = 0;  // 挑战模式下的错字个数
  py.addEventListener('blur', function(e) {
    // 非测试模式、或者已经结束测验的情况下提前退出
    if (mode < 2 || (mode === 2 && p[2] === -1)) return;
    var v = this.innerText, ans = this.dataset.pinyin;
    if (checkPinyin(v.trim(), ans)) {
      cb.classList.add('correct');
      this.innerText = ans;
    } else {
      if (mode !== 2 || !/^\s+$/.test(v)) cb.classList.add('wrong');
      if (mode === 3) nw++;
      v = v.trim();
      this.innerText = v === '' ? ans : v + ' -> ' + ans;
      py.removeAttribute('contenteditable');
    };

    d.querySelector('input[id="mode-' + mode + '"]').focus();
    if (mode === 3) {
      var N = freqs.length, nc = N - cChars.length;  // 已挑战样本量
      if (nc >= 2) {
        var m = 1 - nw/nc, s = 1.96 * Math.sqrt(N * (N - nc) / (nc - 1) * m * (1 - m));
        var M = N * m, M1 = M - s, M2 = M + s;
        if (M1 < 0) M1 = 0;
        if (M2 > N) M2 = N;
        M = Math.round(M); M1 = Math.round(M1); M2 = Math.round(M2);
        sc.innerHTML = '已挑战 ' + nc + ' 字（错 ' + nw + ' 字）<br/>您的识字量估计为 '
          + M + '，其 95% 近似置信区间为【' + M1 + '，' + M2 + '】';
      }
    }
  });
  // 除了离开输入框，也可以用回车键提交答案
  ['keypress', 'keyup'].map(function(evt) {
    py.addEventListener(evt, function(e) {
      e.key === 'Enter' && (e.preventDefault(), evt === 'keyup' && this.blur());
    });
  });

  // 重设字库
  ls.querySelector('#learn-set').addEventListener('click', function(e) {
    S.remove(key2);
    setChars();
  });
})();
