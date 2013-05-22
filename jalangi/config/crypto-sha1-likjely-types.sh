#!/bin/bash


export PATH=$PATH:/opt/local/bin:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

scripts/relanalysis analyses/likelytype/LikelyTypeInferEngine tests/sunspider1/crypto-sha1

sleep 1
#export DYLD_LIBRARY_PATH=/opt/local/lib
dot -Tpng jalangi_tmp/jalangi_types.dot -o jalangi/out/jalangi_types.png
echo "<img src=\"jalangi_types.png\"></img>" > jalangi/out/out.html
