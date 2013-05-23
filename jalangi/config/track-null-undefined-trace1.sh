#!/bin/bash

export PATH=$PATH:/opt/local/bin:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

echo "Tracking origins of nulls and undefined ..."
export JALANGI_MODE=replay
export JALANGI_ANALYSIS=analyses/trackundefinednull/UndefinedNullTrackingEngine
node src/js/commands/replay.js jalangi_trace1

