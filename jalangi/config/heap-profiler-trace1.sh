#!/bin/bash

export PATH=$PATH:/opt/local/bin:/usr/local/bin
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
cd $DIR
echo "" > jalangi/out/out.html

echo "Tracking object creation and last access time since creation ..."
export JALANGI_MODE=replay
export JALANGI_ANALYSIS=analyses/objectalloc/ObjectAllocationTrackerEngine
node src/js/commands/replay.js jalangi_trace1
echo "Done"

