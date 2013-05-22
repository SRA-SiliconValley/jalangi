#!/bin/bash

export PATH=$PATH:/opt/local/bin:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

echo "Inferring likely types ..."
export JALANGI_MODE=replay
export JALANGI_ANALYSIS=analyses/likelytype/LikelyTypeInferEngine
node src/js/commands/replay.js jalangi_trace1

sleep 1
#export DYLD_LIBRARY_PATH=/opt/local/lib
dot -Tpng jalangi_types.dot -o jalangi/out/jalangi_types.png
echo "<img src=\"jalangi_types.png\"></img>" > jalangi/out/out.html
