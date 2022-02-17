x = xfun::read_utf8('js/data-chars.js')
x[1] = gsub('^export default ', '', x[1])
x[length(x)] = gsub(';\\s*$', '', x[length(x)])

z = jsonlite::fromJSON(x, FALSE)
write_data('pinyin', lapply(z, names))
