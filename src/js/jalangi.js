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
var temp = require('temp');
temp.track();

function getInstOutputFile(filePath) {
    if (filePath) {
        return path.resolve(filePath);
    } else {
        return temp.path({suffix: '.js'});
    }
}
/**
 * Instrument a JavaScript file.
 *
 * Note that the API does yet support instrumenting multiple files that must execute together; for that, use
 * esnstrument.js or instrumentDir.js.
 *
 * @param {string} inputFile the file to be instrumented
 * @param {{ outputFile: string, iidMap: boolean, serialize: boolean }} [options] options for instrumentation, including:
 *     'outputFileName': the desired output file for instrumented code.  If not provided, a temp file is used
 *     'iidMap': should an IID map file be generated with source locations?  defaults to false
 *     'serialize': should ASTs be serialized? defaults to false
 * @return {{ outputFile: string, iidMapFile: string, astJSONFile: string }} output file locations, as appropriate
 *          based on the options
 */
function instrument(inputFileName, options) {
    // make all paths absolute, for simplicity
    // TODO make absolute paths optional?
    inputFileName = path.resolve(inputFileName);
    if (!options) {
        options = {};
    }
    var outputFileName = getInstOutputFile(options.outputFile);
    var iidMapFile, astJSONFile;
    var inputCode = String(fs.readFileSync(inputFileName));
    if (options.iidMap) {
        esnstrument.openIIDMapFile(temp.dir);
        iidMapFile = path.join(temp.dir, "jalangi_sourcemap.js");
    }
    var instCodeOptions = {
        wrapProgram: true,
        filename: inputFileName,
        instFileName: outputFileName,
        serialize: options.serialize
    };
    var instResult = esnstrument.instrumentCode(inputCode, instCodeOptions);
    var instCode = instResult.code;
    fs.writeFileSync(outputFileName, instCode);
    if (options.iidMap) {
        esnstrument.closeIIDMapFile();
    }
    if (options.serialize) {
        astJSONFile = outputFileName + ".ast.json";
        fs.writeFileSync(astJSONFile, JSON.stringify(instResult.serializedAST, undefined, 2), "utf8");
    }
    return {
        outputFile: outputFileName,
        iidMapFile: iidMapFile,
        astJSONFile: astJSONFile
    };
}



/**
 * record execution of an instrumented script
 * @param {string} instCodeFile the instrumented code
 * @param {string} [traceFile] path to trace file
 * @return promise|Q.promise promise that gets resolved at the end of recording.  The promise
 * is resolved with an object with properties:
 *     'stdout': the stdout of the record process
 *     'stderr': the stderr of the record process
 *     'traceFile': the location of the trace file
 */
function record(instCodeFile, traceFile) {
    var cliArgs = [instCodeFile];
    if (!traceFile) {
        traceFile = temp.path();
    }
    cliArgs.push(traceFile);
    return procUtil.runChildAndCaptureOutput(fork(path.resolve(__dirname, "./commands/record.js"),
        cliArgs, { silent: true }), { traceFile: traceFile });
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