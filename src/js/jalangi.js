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

/*jslint node: true */
/*global process */
// top level node.js API for Jalangi

var esnstrument = require('./instrument/esnstrument');
var fs = require('fs');
var path = require('path');
var fork = require('child_process').fork;
var Q = require("q");

/**
 * Instrument a JavaScript file.
 * TODO support IID maps
 * TODO operate on code strings instead of files
 * @param inputFileName the file to be instrumented
 * @param outputFileName the output file for the instrumented code
 */
function instrument(inputFileName, outputFileName) {
    var inputCode = String(fs.readFileSync(inputFileName));
    var options = {
        wrapProgram: true,
        filename: inputFileName,
        instFileName: outputFileName
    };
    var instCode = esnstrument.instrumentCode(inputCode, options).code;
    fs.writeFileSync(outputFileName, instCode);
}

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

/**
 * record execution of an instrumented script
 * @param instCodeFile the instrumented code
 * @return a promise that gets resolved at the end of recording.  The promise
 * is resolved with an object with properties:
 *     'exitCode': the exit code from the process doing recording
 *     'stdout': the stdout of the record process
 *     'stderr': the stderr of the record process
 */
function record(instCodeFile) {
    return runChildAndCaptureOutput(fork(path.resolve(__dirname, "./commands/record.js"),
        [instCodeFile], { silent: true }));
}

/**
 * replay an execution
 * @param traceFile the trace to replay
 */
function replay(traceFile) {
    return runChildAndCaptureOutput(fork(path.resolve(__dirname, "./commands/replay.js"),
        [traceFile], { silent: true }));
}

exports.instrument = instrument;
exports.record = record;
exports.replay = replay;