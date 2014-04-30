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
var fs = require('fs');
var assert = require('assert');
// this needs to be inside the tests/unit folder to
// handle require() calls from test scripts
var instScriptFile = "tests/unit/instScript_jalangi_.js";



var unit_tests = String(fs.readFileSync("tests/unit/unitTests.txt")).split('\n');

describe('unit tests', function () {
    this.timeout(600000);
    unit_tests.forEach(function (test) {
        it('should handle unit test ' + test, function (done) {
            var testAndArgs = test.split(' ');
            var script = testAndArgs.shift();
            var testFile = "tests/unit/" + script + ".js";
            testUtil.runTest(testFile, instScriptFile, testAndArgs).then(function () {
                    done();
                },
                function (err) {
                    console.error(err.stack);
                    console.error(err.stdout);
                    console.error(err.stderr);
                    assert(false);
                    done();
                }).done();
        });
    });
});



