(function() {
  // 祝 IE 垃圾早日灭亡
  var s = document.currentScript;
  if (!s) {
    s = document.getElementsByTagName('script');
    s = s[s.length - 1];
  }

  // 安插基本元素，用来存放拼音、汉字等信息
  s.insertAdjacentHTML('afterend', '<div id="learn-chars">' +
    '<div class="center" id="learn-toolbar"></div>' +
    '<div class="char-block">' +
    '<div class="pinyin center" contenteditable></div>' +
    '<div class="center"><div class="char-box kai"><span class="char"></span></div></div>' +
    '</div>' +
    '<div class="meaning"></div>' +
    '<div class="source kai right"></div>' +
    '</div>');

  function sampleOne(x) {
    return x[Math.floor(Math.random() * x.length)];
  }

  var d = document.getElementById('learn-chars'),
      tb = d.querySelector('#learn-toolbar'), cb = d.querySelector('.char-block'),
      py = d.querySelector('.pinyin'), zi = d.querySelector('.char'),
      mn = d.querySelector('.meaning'), sc = d.querySelector('.source');

  // 三种模式的单选框
  ['学习', '复习', '测试'].forEach(function(el, i) {
    tb.innerHTML += '<input name="mode" type="radio" id="mode-'+ i +
    '" ' + (i === 0 ? 'checked' : '') +
    '/><label for="mode-' + i + '" class="label">' + el + '</label>';
  });
  function modeValue() {
    return document.querySelector('input[name="mode"]:checked').id.replace('mode-', '');
  }

  var ckey = 'learned-chars';
  function saveChar(x) {
    var data = localStorage.getItem(ckey);
    if (!data) { data = ''; } else if (data.match(x)) return;
    data += x;
    try { localStorage.setItem(ckey, data); } catch (e) {}
  }
  function learnedChars() {
    var x = localStorage.getItem(ckey);
    return x ? x.split('') : [];
  }

  var chars = Object.keys(zDict.chars), pos = 0;

 // 随机抽取一字，并显示相关信息
  function renderChar(char) {
    var mode = modeValue();
    if (!char) {
      if (mode === '0') {
        char = sampleOne(chars);
        saveChar(char);
      } else {
        var lChars = learnedChars();
        if (lChars.length === 0) {
          mn.innerText = '学习记录都没得，复习个锤子哦';
          return;
        }
        if (pos >= lChars.length) pos = 0;
        char = lChars[pos];
        pos++;
      }
    }
    if (mode === '1') highlightReview();
    var info = renderPinyin(char, zi, py, mode);
    if (!info) return;
    var me = '';
    for (var k in info) {
      me += '<p class="py">' + k + '</p><ol><li>' + info[k].join('</li><li>') + '</li></ol>';
    };
    mn.innerHTML = me;
    sc.innerHTML = '资料来源：汉典（<a href="https://www.zdic.net/hans/' + char + '" target="_blank">查看详情</a>）';
  }
  function renderPinyin(char, zi, py, mode) {
    zi.innerText = char;
    if (mode === '2') {
      py.focus();
      return;
    }
    var info = zDict.chars[char];
    py.innerText = sampleOne(Object.keys(info));
    return info;
  }

  renderChar();

  // 戳一下换一字
  zi.parentElement.addEventListener('click', function(e) {
    renderChar();
  });

  function removeEl(el) {
    if (!el) return;
    el.remove ? el.remove() : el.parentNode.removeChild(el);
  }

  function highlightReview() {
    var c = d.querySelector('.current');
    if (c) c.classList.remove('current');
    var rs = d.querySelectorAll('.review');
    if (pos === 0) pos = rs.length;
    if (pos <= rs.length) {
      rs[pos - 1].querySelector('.char-box').classList.add('current');
    }
  }
  // 更换模式
  function modeChange(e) {
    var v = this.id.replace('mode-', '');
    if (v === '0') {
      renderChar();
    }
    if (v === '1') {
      learnedChars().forEach(function(char, i) {
        var nb = cb.cloneNode(true), zi = nb.querySelector('.char');
        renderPinyin(char, zi, nb.querySelector('.pinyin'));
        zi.parentElement.addEventListener('click', function(e) {
          pos = i + 1;
          renderChar(char);
        });
        nb.classList.add('review');
        d.insertBefore(nb, null);
        pos = i + 1;
      });
      highlightReview();
    } else {
      d.querySelectorAll('.review').forEach(removeEl);
    }
    if (v === '2') {
      py.innerHTML = mn.innerHTML = sc.innerHTML = '';
      py.focus();
    } else if (py.innerText === '') {
      renderChar(zi.innerText);
    }
  }
  d.querySelectorAll('input[name="mode"]').forEach(function(el) {
    el.addEventListener('change', modeChange);
  });
})();
