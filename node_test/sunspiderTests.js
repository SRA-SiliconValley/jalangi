/*
 * Copyright 2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Manu Sridharan

/*global describe */
/*global it */

var testUtil = require('./testUtil');

var sunspider = [
    "crypto-aes",
    "3d-cube",
    "3d-morph",
    "3d-raytrace",
    "access-binary-trees",
    "access-fannkuch",
    "access-nbody",
    "access-nsieve",
    "bitops-3bit-bits-in-byte",
    "bitops-bitwise-and",
    "controlflow-recursive",
    "crypto-md5",
    "crypto-sha1",
    "date-format-tofte",
    "date-format-xparb",
    "math-cordic",
    "math-partial-sums",
    "math-spectral-norm",
    "regexp-dna",
    "string-fasta",
    "string-tagcloud",
    "string-unpack-code",
    "bitops-nsieve-bits"
];


describe('sunspider', function () {
    this.timeout(600000);
    sunspider.forEach(function (test) {
        it('should handle sunspider test ' + test, function (done) {
            var testFile = "tests/sunspider1/" + test + ".js";
            testUtil.runTest(testFile).then(function () { done(); }).done();
        });
    });
});
