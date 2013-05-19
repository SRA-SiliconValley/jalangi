#!/bin/bash
echo "Jalangi Analysis 3"

# this is working
#echo "[src/SampleHandler.java:9]: (style) The scope of the variable 'i' can be reduced (SampleHandler.java:9)"

for i
do

let "lineno = $(($RANDOM%10)) + 5"
echo "[/javascripttestproj/$i:$lineno]: (style) Analysis 3 found unused variable (/javascripttestproj/$i:$lineno)"

done

echo "Done with Analysis 3"

