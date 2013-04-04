jalangi
=======

Requirements
============

Currently we have tested jalangi on Mac OS X 10.8

Node.js 0.8.22 available at http://nodejs.org/dist/v0.8.22/

$ node --version
v0.8.22

Java 1.6 or higher

$ java -version
java version "1.6.0_43"

Installation
============

./scripts/install

Run Tests
=========

./scripts/testsym

Other Scripts
=============

./scripts/testunits
./scripts/testsp
./scripts/testsp_likelytype
./scripts/testsp_tracknull
./scripts/funtest tests/unit/demo1 4
./scripts/funtest tests/unit/demo2 10
./scripts/browserReplay tests/unit/qsort; open jalangi_trace.html






