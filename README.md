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

Currently we have tested jalangi on Mac OS X 10.8

Node.js 0.8.22 available at http://nodejs.org/dist/v0.8.22/

    $ node --version
    v0.8.22

Java 1.6 or higher

    $ java -version
    java version "1.6.0_43"

### Installation

    ./scripts/install

### Run Tests

    ./scripts/testsym

### Other Scripts

    ./scripts/testunits
    ./scripts/funtest tests/unit/demo1 4
    ./scripts/funtest tests/unit/demo2 10
    ./scripts/browserReplay tests/unit/qsort; open jalangi_trace.html






