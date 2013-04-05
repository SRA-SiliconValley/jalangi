Jalangi
=======
### Introduction

Jalangi is a framework for writing heavy-weight dynamic analyses for JavaScript.  Jalangi incorporates two key techniques:
1) selective record-replay, a technique which enables to record and to faithfully replay a user-selected part of the program, and
2) shadow values and shadow execution, which enables easy implementation of heavy-weight dynamic analyses.  In the distribution
you will find several analyses:

  * concolic testing,
  * an analysis to track origins of nulls and undefined,
  * an analysis to infer likely types of objects fields and functions.

An evaluation of Jalangi on the SunSpider benchmark suite and on five web applications shows that
Jalangi has an average slowdown of 26X during recording and 30X slowdown during replay and analysis. The slowdowns are comparable with slowdowns reported for similar
tools, such as PIN and Valgrind for x86 binaries.


### Requirements

We tested Jalangi on Mac OS X 10.8

  * Latest version of Node.js available at http://nodejs.org/.  We have tested Jalangi with Node v0.8.22 and v0.10.3.
  * Java 1.6 or higher.  We have tested Jalangi with Java 1.6.0_43.
  * Apache ant (http://ant.apache.org/) and curl (http://curl.haxx.se/) are required for commandline installation.
  * Concolic testing uses cvc3 and automaton.jar for constraint solving.  After installation run
      ./thirdparty/cvc3/bin/cvc3
  to make sure that cvc3 runs properly on you machine.  You should not see any exception or error when cvc3 is invoked.

### Installation

    ./scripts/install

### Run Tests

    ./scripts/testsym

### Other Scripts

    ./scripts/testunits
    ./script/testsp
    ./script/testsp_likelytype
    ./script/testsp_tracknull
    ./scripts/funtest tests/unit/demo1 4
    ./scripts/funtest tests/unit/demo2 10
    ./scripts/browserReplay tests/unit/qsort; open jalangi_trace.html






