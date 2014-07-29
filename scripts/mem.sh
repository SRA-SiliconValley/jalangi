
echo $1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
CWD=`pwd`
echo $CWD

for i in $1/*; 
do
	echo "cd $i"
	cd $i
	node $DIR/../src/js/commands/mem.js enhanced-trace > output	
	result=${PWD##*/}
	cp output $CWD/$result.out
	cp mem_output.json $CWD/$result.json
done

