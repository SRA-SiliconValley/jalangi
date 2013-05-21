#!/bin/bash

export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

node src/js/commands/createReplay.js jalangi_trace1
/usr/bin/open -a "/Applications/Google Chrome.app" jalangi_trace1.html

