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

var assert = require('assert'),
    child_process = require('child_process'),
    jalangi = require('./../src/js/jalangi'),
    Q = require('q'),
    path = require('path');

function runChildAndCaptureOutput(forkedProcess) {
    var child_stdout = "", child_stderr = "", deferred = Q.defer();
    forkedProcess.stdout.on('data', function (data) {
        child_stdout += data;
    });
    forkedProcess.stderr.on('data', function (data) {
        child_stderr += data;
    });
    forkedProcess.on('close', function (code) {
        deferred.resolve({ exitCode: code, stdout: child_stdout, stderr: child_stderr });
    });
    return deferred.promise;

}

// this needs to be inside the tests/unit folder to
// handle require() calls from test scripts
var instScriptFile = "tests/unit/instScript_jalangi_.js";

//var traceFile = "/tmp/jalangi_trace";
var traceFile = "jalangi_trace";

var trackValuesAnalysis = path.resolve("src/js/analyses/trackallvalues/TrackValuesEngine.js");
function runTest(script) {
    // capture normal output
    var normalProcess = child_process.fork(script, [], {silent: true});
    var normOut;
    function checkResult(result) {
        assert.equal(normOut, result.stdout);
        assert.equal("", result.stderr);
        assert.equal(0, result.exitCode);
    }
    return runChildAndCaptureOutput(normalProcess).then(function (result) {
        normOut = result.stdout;
        checkResult(result);
        jalangi.instrument(script, instScriptFile);
        return jalangi.record(instScriptFile, traceFile);
    }).then(function (result) {
        checkResult(result);
        return jalangi.replay(traceFile);
    }).then(function (result) {
        checkResult(result);
        return jalangi.replay(traceFile,trackValuesAnalysis);
    }).then(function (result) {
        checkResult(result);
        assert.equal("done", result.result);
    });
}


var unit_tests = [
    "instrument-test",
    "array_length",
    "assign",
    "async_events",
    "boolean",
    "call_in_finally",
    "call_in_finally_2",
    "call_order1",
    "cond",
    "cons_no_arg",
    "delete",
    "do_while",
    "eval_global",
    "eval_opt",
    "eval_scope",
    "exception",
    "field_inc",
    "field_read",
    "for_and_seq",
    "for_in",
    "fun_call",
    "gettersetter",
    "gettersetter2",
    "getownpropnames",
    "implicit-type",
    "label",
    "local_inc_dec",
    "monkeypatch",
    "method_sub",
    "null_instr",
    "object_lit",
    "object_tracking",
    "op_assign",
    "prototype_property",
    "scope_rr",
    "switch",
    "switch2",
    "string",
    "symbolic",
    "try_catch_finally_2",
    "type_conversion",
    "vars",
    "while"];

describe('unit tests', function () {
    this.timeout(600000);
    unit_tests.forEach(function (test) {
        it('should handle unit test ' + test, function (done) {
            var testFile = "tests/unit/" + test + ".js";
            runTest(testFile).then(function () { done(); }).done();
        });
    });
});


var sunspider = [
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
    "bitops-nsieve-bits",
    "crypto-aes"
];


describe('sunspider', function () {
    this.timeout(600000);
    sunspider.forEach(function (test) {
        it('should handle sunspider test ' + test, function (done) {
            var testFile = "tests/sunspider1/" + test + ".js";
            runTest(testFile).then(function () { done(); }).done();
        });
    });
});

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
    "box2d"
];

describe('octane', function () {
    this.timeout(600000);
    octane.forEach(function (test) {
        it('should handle octane test ' + test, function (done) {
            var testFile = "tests/octane/" + test + ".js";
            runTest(testFile).then(function () { done(); }).done();
        });
    });
});