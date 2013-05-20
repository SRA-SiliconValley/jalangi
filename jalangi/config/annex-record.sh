#!/bin/bash

echo $PATH
export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR

node src/js/instrument/esnstrument.js tests/tizen/annex/js/annex.js
scripts/rrserver http://127.0.0.1:8000/tests/tizen/annex/index_jalangi_.html
