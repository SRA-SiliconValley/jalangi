# usage: python scripts/histogram.py jalangi_tmp/jalangi_trace
# generates a map from an iid to # of records generated from the iid

import sys
import json
import operator

print sys.argv[1]
ins = open( sys.argv[1], "r" )
array = {}
count = 0
iids = {}
for line in ins:
	record = json.loads(line)
	key = str(record[2])+":"+str(record[4])
	if key in iids:
		iids[key] = iids[key] + 1
	else: 
		iids[key] = 1
	count = count + 1
ins.close()
stats = sorted(iids.iteritems(), key=operator.itemgetter(1), reverse=True)
for pair in stats:
	print "iid "+str(pair[0])+ " is logged "+str(pair[1]) + " times"
print count


