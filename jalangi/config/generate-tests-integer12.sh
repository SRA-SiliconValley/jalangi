#!/bin/bash

export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

scripts/relconcolic tests/unit/integer12 5
rm jalangi/out/out.html
touch jalangi/out/out.html


