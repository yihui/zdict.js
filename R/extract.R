# 将形如 &xxx; 的 HTML 代码转化为字符实体 https://stackoverflow.com/a/35187962/559676
db = character()  # 缓存
html_entities = function(x) {
  x2 = setdiff(x, names(db))
  if (length(x2) == 0) return(db[x])
  x3 = xml2::xml_text(xml2::read_html(paste0(c("<i>", x2, "</i>"), collapse = '')))
  x3 = strsplit(x3, '')[[1]]
  if (length(x3) != length(x2)) stop('有一些字符没有转换成功：', paste(x2, collapse = ' '))
  db[x2] <<- x3
  db[x]
}
unescape_entities = function(x) {
  m = gregexpr('&([[:alpha:]]+|#x?[0-9]+);', x)
  regmatches(x, m) = lapply(regmatches(x, m), function(x) {
    html_entities(x)
  })
  x
}

# 用 export 输出数据
write_data = function(name, x, ...) {
  res = paste0(
    'export default ',
    trimws(jsonlite::toJSON(x, pretty = 0, ...)), ';'
  )
  xfun::write_utf8(res, sprintf('js/data-%s.js', name))
}

files = list.files('html', '.[.]html$', full.names = TRUE)
res = lapply(files, function(f) {
  x = xfun::file_string(f)
  r = '.*<div class="content definitions jnr">(.+?)<div class="div copyright">.*'
  x = xfun::grep_sub(r, '\\1', x)
  x = lapply(strsplit(x, '><span class="dicpy">')[[1]][-1], function(z) {
    py = xfun::grep_sub('^([^<]+)<.*', '\\1', z)  # 获取拼音
    py = unescape_entities(py)
    py = gsub('^\\s*([^[:space:]]+).*', '\\1', py)  # 去掉空格
    # 有少数条目没有 </li> 闭合标签（如媪、啻），而是继续 <li> 直到 </ol> 结束
    li = regmatches(z, gregexpr('<li>\\s*(.+?)\\s*(?=<(/li|li|/ol)>)', z, perl = TRUE))
    li = gsub('^<li>|</(li|ol)>$', '', unlist(li))
    # 只有一项释义的时候，没有 <li> 标签，以 ◎ 开头
    if (length(li) == 0) {
      li = xfun::grep_sub('.*◎(.+?)</p>.*', '\\1', z)
      li = bookdown:::strip_html(li)
    }
    if (length(li) == 0) stop('这个文件中没有找到字的释义：', f)
    li = trimws(bookdown:::strip_html(li))
    li = unescape_entities(li)
    if (any(grepl('&', li))) message(f, ' 里面似乎仍然有转义符：', li)
    setNames(list(li), py)
  })
  unlist(x, recursive = FALSE)
})
res = setNames(res, gsub('.*(.)[.]html', '\\1', files))

write_data('chars', res)

local({
  x = trimws(xfun::read_utf8('data/freq-chars.txt'))
  m = gregexpr(r <- '([0-9]+)\\s+(.)(\\s*.\\s*[^[:space:]]+|$)', x)
  x = unlist(regmatches(x, m))
  if (any(i <- format(seq_along(x), trim = TRUE) != gsub(r, '\\1', x))) stop(
    '这些字符可能有问题：\n', paste(x[i], collapse = '\n')
  )
  x = gsub(r, '\\2', x)
  x = intersect(x, names(res))
  x = c(x, setdiff(names(res), x))
  write_data('freqs', paste(x, collapse = ''), auto_unbox = TRUE)
})
