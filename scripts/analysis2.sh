
echo "Running $1.js"
node $1.js > out1
node src/js/instrument/esnstrument.js $1.js
node src/js/commands/analysis2.js --analysis src/js/analysis2CallbackTemplate.js $1_jalangi_.js > out2
diff out1 out2
