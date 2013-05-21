#!/bin/bash

export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

scripts/relrerunall tests/unit/qsort



