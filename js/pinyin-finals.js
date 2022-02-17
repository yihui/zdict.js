import chars from "./data-pinyin.js";
import freqs from "./data-freqs.js";

let d = document.getElementById('pinyin-finals');

if (!d) {
  const s = document.currentScript;
  if (!s) throw '抱歉，本程序不支持您的古董浏览器，请尝试使用 Chrome/Firefox/Edge 等现代浏览器';
  d = document.createElement('div');
  d.id = "pinyin-chars";
  s.after(d);
}

function noAccent(x) {
  let x1 = x.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let x2 = x.replace(/[ǖǘǚǜ]/g, 'ü')
  return x2.match('ü') ? x1.replace('u', 'ü') : x1;
}

let k1, k2, x = {}, r = /^([zcs]h|[bpmfdtlngkhjqxzcsryw])/;
[
  'a', 'ia', 'ua', 'o', 'uo', 'e', 'i', 'u', 'ü',
  'an', 'ian', 'uan', 'üan', 'en', 'in', 'un', 'ün',
  'ai', 'uai', 'ao', 'iao', 'ei', 'ui', 'ou', 'iu', 'er', 'ie',
  'ang', 'iang', 'uang', 'eng', 'ing', 'ong', 'iong', 'üe'
].forEach(i => {
  x[i] = [];
});

// 只取前六千字，最后一千实在太生僻
freqs.split('').slice(0, 6000).forEach(i => {
  chars[i].forEach(j => {
    k1 = j.replace(r, '');  // 带声调的韵母
    k2 = noAccent(k1);  // 去除声调的韵母
    // 忽略一些边边角角的韵母
    if (['n', 'ng', 'hng'].indexOf(k2) > -1) return;
    if (/^u(n|an|e)?$/.test(k2) && /^[jqxy]/.test(j)) k2 = k2.replace('u', 'ü');
    if (/^(e|an)$/.test(k2) && /^y/.test(j)) k2 = 'i' + k2;
    if (k2 === 'an' && /^y/.test(j)) k2 = 'ian';
    if (k2 === 'i') {
      if (/^[zcs]/.test(j)) k2 = 'z';
      if (/^(r|[zcs]h)/.test(j)) k2 = 'r';
    }
    if (!x[k2]) x[k2] = [];
    let a = 0;
    if (/[āōēīūǖ]/.test(j)) a = 1;
    if (/[áóéíúǘ]/.test(j)) a = 2;
    if (/[ǎǒěǐǔǚ]/.test(j)) a = 3;
    if (/[àòèìùǜ]/.test(j)) a = 4;
    x[k2].push([j, i, a]);
  });
});

let h = '<nav id="TableOfContents">';

Object.keys(x).forEach(el => {
  h += '<a href="#' + el + '" class="toc-finals">' + el + '</a>';
});

h += '</nav><div style="text-align: center; margin-top: 1em;">';

'aāáǎà'.split('').forEach(function(a, i) {
  h += '<div class="char-block accent-legend char-accent-' + i + '">' + a + '</div>';
});

h += '</div><div class="char-section">';

for (let i in x) {
  h += '<h2 id="' + i + '">' + i + '</h2>';
  let w = 1;
  x[i].forEach(el => {
    w = Math.max(w, el[0].length);
  });

  x[i].forEach(el => {
    h += '<div class="char-block char-width-' + w + ' char-accent-' + el[2] + '">' +
    '<div class="pinyin">' + el[0] +
    '</div><div class="char-box"><a href="https://www.zdic.net/hans/' + el[1] +
    '" target="_blank">' + el[1] + '</a></div></div>';
  });
}

h += '</div>'

d.innerHTML = h;

const d2 = d.querySelector('.char-section');

document.querySelectorAll('.accent-legend').forEach(function(el, i) {
  el.onclick = function(e) {
    this.classList.toggle('accent-clicked');
    d2.classList.toggle('accent-show-' + i);
  };
});
