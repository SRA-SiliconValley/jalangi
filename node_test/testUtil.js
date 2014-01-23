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

var assert = require('assert'),
    child_process = require('child_process'),
    jalangi = require('./../src/js/jalangi'),
    procUtil = require('./../src/js/utils/procUtil'),
    path = require('path');

//var traceFile = "/tmp/jalangi_trace";
var traceFile = "jalangi_trace";

var trackValuesAnalysis = path.resolve("src/js/analyses/trackallvalues/TrackValuesEngine.js");

var testVal = "hello";

/**
 * test record and replay for a script
 * @param script the script to test
 * @param instScriptFile file in which to store the instrumented script
 * @return promise|Q.promise promise that resolves when testing is completed, yielding no value, but will
 * be rejected if any assertion fails
 */
function runTest(script, instScriptFile) {
    // capture normal output
    var normalProcess = child_process.fork(script, [], {silent: true});
    var normOut;
    function checkResult(result) {
        assert.equal(normOut, result.stdout);
        assert.equal("", result.stderr);
        assert.equal(0, result.exitCode);
    }
    return procUtil.runChildAndCaptureOutput(normalProcess).then(function (result) {
        normOut = result.stdout;
        checkResult(result);
        jalangi.instrument(script, instScriptFile);
        return jalangi.record(instScriptFile, traceFile);
    }).then(function (result) {
            checkResult(result);
            return jalangi.replay(traceFile);
        }).then(function (result) {
            checkResult(result);
            return jalangi.replay(traceFile,trackValuesAnalysis, testVal);
        }).then(function (result) {
            checkResult(result);
            assert.equal(testVal, result.result);
        });
}

exports.runTest = runTest;
