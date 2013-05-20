#!/bin/bash

echo $PATH
export PATH=$PATH:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR

node src/js/commands/replay.js jalangi_trace1
