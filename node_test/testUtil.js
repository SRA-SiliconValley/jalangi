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
    path = require('path'), execSync = require('execSync');

var trackValuesAnalysis = path.resolve("src/js/analyses/trackallvalues/TrackValuesEngine.js");

var testVal = "hello";

/**
 * test record and replay for a script
 * @param {string} script the script to test
 * @param {string} [instScriptFile] file in which to store the instrumented script
 * @param {Array.<string>} [script_args] additional CLI arguments to pass to script
 * @return promise|Q.promise promise that resolves when testing is completed, yielding no value, but will
 * be rejected if any assertion fails.  Caller *must* handle reject or failure will be swallowed.
 */
function runTest(script, instScriptFile, script_args) {
    // capture normal output
    if (!script_args) {
        script_args = [];
    }
    var normalProcess = child_process.fork(script, script_args, {silent:true});
    var normOut, traceFile;

    function checkResult(result) {
        assert.equal(normOut, result.stdout);
        assert.equal("", result.stderr);
    }

    return procUtil.runChildAndCaptureOutput(normalProcess).then(function (result) {
        normOut = result.stdout;
        checkResult(result);
        var instResult = jalangi.instrument(script, { outputFile:instScriptFile });
        return jalangi.record(instResult.outputFile, undefined, script_args);
    }).then(function (result) {
            checkResult(result);
            traceFile = result.traceFile;
            execSync.run("wc -l " + traceFile);
            return jalangi.replay(traceFile);
        }).then(function (result) {
            checkResult(result);
            return jalangi.replay(traceFile, trackValuesAnalysis, testVal);
        }).then(function (result) {
            checkResult(result);
            assert.equal(testVal, result.result);
        });
}

exports.runTest = runTest;
