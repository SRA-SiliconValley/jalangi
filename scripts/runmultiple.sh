# set MERGE_ENABLED in PredValues.js to false to activate DSE.
# time python scripts/jalangi.py symbolic -a src/js/analyses/puresymbolic/Multiple -i 1 tests/compos/parser
# cd jalangi_tmp; node ../src/js/utils/StatCollector.js; cd ..

# back up the preivous results
rm result.bak.txt;
mv result.txt result.bak.txt;

# f arg1 arg2
# arg1 -> name of dataset
# arg2 -> location
runexp() {
    echo '[*]'"$1" >> result.txt
	echo '[*]single2' >> result.txt

	echo '[*]multiple' >> result.txt
	# run multiex on dataset
	python scripts/jalangi.py symbolic -a src/js/analyses/puresymbolic/Multiple -i 1 "$2"
	# get collected statistics
	cd jalangi_tmp; node ../src/js/utils/StatCollector.js >> ../result.txt; cd ..
}



: <<'END'
END

# max element
runexp "Find Max" "tests/compos/findMax"

# rbTree
runexp "Red Black" "tests/compos/rbTree"

# calc parser
runexp "Calc Parser" "tests/compos/parser"

# PL/0 parser
runexp "PL/0 Parser" "tests/compos/parser2"

# binary seearch tree
runexp "BST" "tests/compos/bst"

# symbolic array index
runexp "Array Index" "tests/compos/symbolicArrayIndex"

# priority queue
runexp "Priority Queue" "tests/multiex/datastructures/PriorityQueue" # throw exception during the experiment

# queue
runexp "Queue" "tests/multiex/datastructures/Queue"

# stack
runexp "Stack" "tests/multiex/datastructures/stack"

# double linked list
runexp "Linked List" "tests/multiex/datastructures/DoubleLinkedList"

# heap sort
runexp "Heap Sort" "tests/multiex/algorithms/heapSort"

# Kadane max sub array algorithm
runexp "Kadane Subarray" "tests/multiex/algorithms/maxsubarray"

# BDD
runexp "BDD" "tests/compos/BDD"

# quick sort
runexp "Quick Sort" "tests/compos/qsort"

# symbolic arithmetic
runexp "Symbolic Arithmetic" "tests/compos/SymbolicArithmetic"

echo '[*]exp-done' >> result.txt

cat result.txt
