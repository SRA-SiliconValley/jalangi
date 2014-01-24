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

var octane = [
    "richards",
    "deltablue",
    "crypto",
    "raytrace",
    "earley-boyer",
    "regexp",
    "splay",
    "navier-stokes",
    "code-load",
    "gbemu",
    "box2d",
    "pdfjs"
];

describe('octane', function () {
    this.timeout(600000);
    octane.forEach(function (test) {
        it('should handle octane test ' + test, function (done) {
            var testFile = "tests/octane/" + test + ".js";
            testUtil.runTest(testFile).then(function () { done(); }).done();
        });
    });
});