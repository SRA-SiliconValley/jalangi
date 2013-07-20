Jalangi
=======
### Introduction

Jalangi is a framework for writing heavy-weight dynamic analyses for JavaScript.  Jalangi incorporates two key techniques:
1) selective record-replay, a technique which enables to record and to faithfully replay a user-selected part of the program, and
2) shadow values and shadow execution, which enables easy implementation of heavy-weight dynamic analyses.  In the distribution
you will find several analyses:

  * concolic testing,
  * an analysis to track origins of nulls and undefined,
  * an analysis to infer likely types of objects fields and functions,
  * an analysis to profile object allocation and usage,
  * a simple form of taint analysis,
  * an experimental pure symbolic execution engine (currently undocumented)

An evaluation of Jalangi on the SunSpider benchmark suite and on five web applications shows that
Jalangi has an average slowdown of 26X during recording and 30X slowdown during replay and analysis. The slowdowns are comparable with slowdowns reported for similar
tools, such as PIN and Valgrind for x86 binaries.

A demo of Jalangi integrated with the Tizen IDE is available at http://srl.cs.berkeley.edu/~ksen/jalangi.html.  Note that the IDE plugin is not open-source.
Slides are available at http://srl.cs.berkeley.edu/~ksen/slides/jalangi-jstools13.pdf and
our paper on Jalangi is available at http://srl.cs.berkeley.edu/~ksen/papers/jalangi.pdf.

### Requirements

We tested Jalangi on Mac OS X 10.8.  Jalangi should work on Mac OS 10.7 and higher and Ubuntu 11.0 and higher.

  * Latest version of Node.js available at http://nodejs.org/.  We have tested Jalangi with Node v0.8.22 and v0.10.3.
  * Sun's JDK 1.6 or higher.  We have tested Jalangi with Java 1.6.0_43.
  * Command-line git.
  * libgmp (http://gmplib.org/) is required by cvc3.  Concolic testing uses cvc3 and automaton.jar for constraint solving. The installation script checks if cvc3 and automaton.jar are installed properly.
  * Chrome browser if you need to test web apps.

### Installation

    ./scripts/install

### Run Tests

    ./scripts/testsym

### Other Scripts

Run no analysis and check if record and replay executions produce same output on some unit tests located under tests/unit/.

    ./scripts/testunits

Run no analysis and check if record and replay executions produce same output on the sunspider benchmarks located under tests/sunspider1/.

    ./scripts/testsp

Run likely type inference analysis on the sunspider benchmarks located under tests/sunspider1/.

    ./scripts/testsp_likelytype

Run tracker of origin of null and undefined on the sunspider benchmarks located under tests/sunspider1/.

    ./scripts/testsp_tracknull

Run a simple heap profiler on the sunspider benchmarks located under tests/sunspider1/.

    ./scripts/testsp_heapprofiling

Record an execution of tests/unit/qsort.js and create jalangi_trace.html which when loaded in a browser replays the execution.

    ./scripts/browserReplay tests/unit/qsort; path-to-chrome-browser jalangi_trace1.html


### Concolic testing

To perform concolic testing of some JavaScript code present in a file, say testme.js, insert the following 4 lines at the top of the file.

    if (typeof window === "undefined") {
        require('../../src/js/InputManager');
        require(process.cwd()+'/inputs');
    }

In the code, use J$.readInput(arg) to indicate the inputs to the program.  Then run the following command to perform concolic testing:

    ./scripts/concolic testme 100000

The third argument bounds the total number of test inputs.  The command generates a set of input files in the directory jalangi_tmp.  The input
files start with the prefix jalangi_inputs.  Once the inputs are generated, you can run testme.js on those inputs by giving the following
command:

    ./scripts/rerunall testme

For example, open the file tests/unit/qsort.js and check how inputs are specified.  Then run

    ./scripts/concolic tests/unit/qsort 100
    ./scripts/rerunall tests/unit/qsort


Open the file tests/unit/regex8.js and check how string inputs are specified.  Then run

    ./scripts/concolic tests/unit/regex8 100
    ./scripts/rerunall tests/unit/regex8


### Dynamic analysis

The JavaScript code in src/js/analyses/objectalloc/ObjectAllocationTrackerEngine.js implements a simple analysis that reports the number of objects created during
an execution along with some auxiliary information.  The analysis can be performed on a file testme.js by invoking the following command:

    ./scripts/analysis analyses/objectalloc/ObjectAllocationTrackerEngine testme

For example, try running the analysis on a sunspider benchmark by issuing the following command:

    ./scripts/analysis analyses/objectalloc/ObjectAllocationTrackerEngine tests/sunspider1/crypto-aes

Similarly, you can run a likely type inference analysis on another sunspider benchmark by calling the following command and you will notice some warnings.

    ./scripts/analysis analyses/likelytype/LikelyTypeInferEngine tests/sunspider1/crypto-sha1

Run the following to perform a simple form of taint analysis.

    ./scripts/analysis analyses/simpletaint/SimpleTaintEngine tests/sunspider1/crypto-sha1

You can run origin of null and undefined tracker on a toy example by issuing the following command:

    ./scripts/analysis analyses/trackundefinednull/UndefinedNullTrackingEngine tests/unit/track_undef_null

### Record and replay a web application.

***

First start a HTTP server by running the following command.  The command starts a simple Python based http server.

    ./scripts/server &

Then instrument the JavaScript files that you want to analyze.  You also need to modify index.html so that it loads some library files and the instrumented files.

    node src/js/instrument/esnstrument.js tests/tizen/annex/js/annex.js

Finally launch the jalangi server and the html page by running

    ./scripts/rrserver http://127.0.0.1:8000/tests/tizen/annex/index_jalangi_.html

You can now play the game for sometime.  Try two moves.  This will generate a jalangi_trace1 in the current directory.  You can run a dynamic analysis on the trace file by issuing the following commands.

    export JALANGI_MODE=replay
    export JALANGI_ANALYSIS=analyses/objectalloc/ObjectAllocationTrackerEngine
    node src/js/commands/replay.js jalangi_trace1

***

    node src/js/instrument/esnstrument.js tests/tizen/calculator/js/calc.js
    ./scripts/rrserver http://127.0.0.1:8000/tests/tizen/calculator/index_jalangi_.html

    export JALANGI_MODE=replay
    export JALANGI_ANALYSIS=analyses/likelytype/LikelyTypeInferEngine
    node src/js/commands/replay.js jalangi_trace1

***

    node src/js/instrument/esnstrument.js tests/tizen/go/js/go.js
    ./scripts/rrserver http://127.0.0.1:8000/tests/tizen/go/index.html

    export JALANGI_MODE=replay
    export JALANGI_ANALYSIS=analyses/likelytype/LikelyTypeInferEngine
    node src/js/commands/replay.js jalangi_trace1





