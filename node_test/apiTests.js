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
var jalangi = require('./../src/js/jalangi');
var fs = require('fs');
var assert = require('assert');

describe('instrument tests', function () {
    it('should handle relative paths', function () {
        var testFile = "tests/unit/instrument-test.js";
        var instResult = jalangi.instrument(testFile, {iidMap: true, relative: true});
        var iidMap = String(fs.readFileSync(instResult.iidMapFile));
        assert.equal(iidMap.split('\n')[3], "var fn = \"tests/unit/instrument-test.js\";");
    });
    it('should handle direct analysis', function(done) {
        var testFile = "tests/unit/instrument-test.js";
        var instResult = jalangi.instrument(testFile, {iidMap: true, relative: true});
        jalangi.direct(instResult.outputFile, ['src/js/analyses/logNaN/logNaN.js']).then(function () { done(); }, function (err) {
            console.log(err.stderr);
            done();
        }).done();
    });
    it('should generate metadata', function () {
        var testFile = "tests/unit/instrument-test.js";
        var instResult = jalangi.instrument(testFile, {iidMap: true, relative: true, serialize: true});
    });
});