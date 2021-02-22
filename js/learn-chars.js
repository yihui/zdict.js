(function() {
  // 祝 IE 垃圾早日灭亡
  var s = document.currentScript;
  if (!s) {
    s = document.getElementsByTagName('script');
    s = s[s.length - 1];
  }

  // 安插基本元素，用来存放拼音、汉字等信息
  s.insertAdjacentHTML('afterend', '<div id="learn-chars">' +
    '<div class="pinyin center"></div>' +
    '<div class="center"><div class="char-box kai"><span class="char"></span></div></div>' +
    '<div class="meaning"></div>' +
    '<div class="source kai right"></div>' +
    '</div>');

  function sampleOne(x) {
    return x[Math.floor(Math.random() * x.length)];
  }

  var d = document.getElementById('learn-chars'),
      py = d.querySelector('.pinyin'), zi = d.querySelector('.char');
  var chars = Object.keys(zDict.chars);

 // 随机抽取一字，并显示相关信息
  function renderChar() {
    var char = sampleOne(chars);
    zi.innerText = char;
    var info = zDict.chars[char];
    py.innerText = sampleOne(Object.keys(info));
    var me = '';
    for (var k in info) {
      me += '<p class="py">' + k + '</p><ol><li>' + info[k].join('</li><li>') + '</li></ol>';
    };
    d.querySelector('.meaning').innerHTML = me;
    d.querySelector('.source').innerHTML = '资料来源：汉典（<a href="https://www.zdic.net/hans/' + char + '" target="_blank">查看详情</a>）';
  }

  renderChar();

  // 戳一下换一字
  zi.parentElement.addEventListener('click', function(e) {
    renderChar();
  });
})();
