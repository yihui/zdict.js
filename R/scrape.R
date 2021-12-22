# 抓取 7000 个通用汉字；这些字分布在多页上，须一页一页读取
x = xfun::read_utf8('https://www.zdic.net/zd/zb/ty/')
p = xfun::grep_sub('.*<a class="pck" title="([0-9]+)">.*', '\\1', x)
res = lapply(p, function(i) {
  message(i, '/', length(p))
  Sys.sleep(runif(1))
  x = xfun::read_utf8(paste0('https://www.zdic.net/zd/zb/ty/bh/?bh=', i))
  r = ".*<a href='/hans/(.)' title='([^']+)'>.*"
  x = unlist(regmatches(x, regexec(r, x)))
  x = matrix(x, ncol = 3, byrow = TRUE)
  x[, 2:3]
})
res = do.call(rbind, res)
if (any(i <- duplicated(res[, 1]))) {
  stop('抓取的汉字中有重复字符：', paste(res[i, 1], collapse = '、'))
}
n = NROW(res)
for (i in seq_len(n)) {
  message(i, '/', n)
  char = res[i, 1]
  xfun::download_file(paste0('https://www.zdic.net/hans/', char), file.path('html', paste0(char, '.html')))
  # Sys.sleep(runif(1, 0, .1))
}
