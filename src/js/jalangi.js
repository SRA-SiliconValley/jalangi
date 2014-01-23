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

// top level node.js API for Jalangi

/*global __dirname */

var esnstrument = require('./instrument/esnstrument');
var procUtil = require('./utils/procUtil');
var fs = require('fs');
var path = require('path');
var fork = require('child_process').fork;

/**
 * Instrument a JavaScript file.
 * TODO support IID maps
 * TODO operate on code strings instead of files
 * @param inputFileName the file to be instrumented
 * @param outputFileName the output file for the instrumented code
 */
function instrument(inputFileName, outputFileName) {
    // make all paths absolute, for simplicity
    // TODO make this optional
    inputFileName = path.resolve(inputFileName);
    outputFileName = path.resolve(outputFileName);
    var inputCode = String(fs.readFileSync(inputFileName));
    var options = {
        wrapProgram: true,
        filename: inputFileName,
        instFileName: outputFileName
    };
    var instCode = esnstrument.instrumentCode(inputCode, options).code;
    fs.writeFileSync(outputFileName, instCode);
}



/**
 * record execution of an instrumented script
 * @param {string} instCodeFile the instrumented code
 * @param {string} [traceFile=jalangi_trace] path to trace file
 * @return promise|Q.promise promise that gets resolved at the end of recording.  The promise
 * is resolved with an object with properties:
 *     'exitCode': the exit code from the process doing recording
 *     'stdout': the stdout of the record process
 *     'stderr': the stderr of the record process
 */
function record(instCodeFile, traceFile) {
    var cliArgs = [instCodeFile];
    if (traceFile) {
        cliArgs.push(traceFile);
    }
    return procUtil.runChildAndCaptureOutput(fork(path.resolve(__dirname, "./commands/record.js"),
        cliArgs, { silent: true }));
}

/**
 * replay an execution
 * @param {string} [traceFile=jalangi_trace] the trace to replay
 * @param {string} [clientAnalysis] the analysis to run during replay
 * @param {object} [initParam] parameter to pass to client init() function
 * @return promise|Q.promise promise that gets resolved at the end of recording.  The promise
 * is resolved with an object with properties:
 *     'exitCode': the exit code from the process doing replay
 *     'stdout': the stdout of the replay process
 *     'stderr': the stderr of the replay process
 *     'result': the result returned by the analysis run during replay, if any
 */
function replay(traceFile, clientAnalysis, initParam) {
    var cliArgs = [];
    if (traceFile) {
        cliArgs.push(traceFile);
        if (clientAnalysis) {
            cliArgs.push(clientAnalysis);
        }
    }
    var forkedProcess = fork(path.resolve(__dirname, "./commands/replay.js"),
        cliArgs, { silent: true });
    forkedProcess.send({initParam: initParam});
    return procUtil.runChildAndCaptureOutput(forkedProcess);
}

exports.instrument = instrument;
exports.record = record;
exports.replay = replay;