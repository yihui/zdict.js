#!/bin/sh

npm install --global rollup
mkdir dist
cd js
rollup zdict.js --format umd --name zDict --file ../dist/zdict.js
rollup learn-chars.js --format iife --file ../dist/learn-chars.js
# rollup data-chars.js --format cjs --file ../dist/data-chars.js
# rollup data-freqs.js --format cjs --file ../dist/data-freqs.js
cd ..
rm -r js/ R/ data/ *.Rproj
mv dist js
