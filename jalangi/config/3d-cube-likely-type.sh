#!/bin/bash

echo $PATH
export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR

scripts/relanalysis analyses/likelytype/LikelyTypeInferEngine tests/sunspider1/3d-cube

