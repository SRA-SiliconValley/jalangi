#!/bin/bash

echo $PATH
export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR

scripts/relconcolic tests/unit/integer11 6


