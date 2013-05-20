#!/bin/bash

echo $PATH
export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

scripts/relanalysis analyses/likelytype/LikelyTypeInferEngine tests/sunspider1/3d-cube

sleep 1
dot -Tpng jalangi_types.dot -o jalangi/out/jalangi_types.png
echo "<img src=\"jalangi_types.png\"></img>" > jalangi/out/out.html
