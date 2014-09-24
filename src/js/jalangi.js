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
var instDir = require('./commands/instrument');
var procUtil = require('./utils/procUtil');
var astUtil = require('./utils/astUtil');
require('./Config');
var fs = require('fs');
var path = require('path');
var fork = require('child_process').fork;
var temp = require('temp');
var Q = require("q");
temp.track();

function getInstOutputFile(filePath) {
    if (filePath) {
        return path.resolve(filePath);
    } else {
        return temp.path({suffix: '.js'});
    }
}

function genMetadata(instAST) {
    var topLevelExprs = astUtil.computeTopLevelExpressions(instAST);
    var serialized = astUtil.serialize(instAST);
    if (topLevelExprs) {
        // update serialized AST table to include top-level expr info
        topLevelExprs.forEach(function (iid) {
            var entry = serialized[iid];
            if (!entry) {
                entry = {};
                serialized[iid] = entry;
            }
            entry.topLevelExpr = true;
        });
    }
    return serialized;
}
/**
 * write IID metadata to file.  We write the output line by line,
 * as calling JSON.stringify on the entire metadata object can
 * cause a memory explosion for large inputs.
 *
 * @param metadata {Object} the metadata
 * @param filename {string} output filename
 */
function writeMetadataToFile(instAST, filename) {
    var metadata = genMetadata(instAST);
    var fd = fs.openSync(filename, 'w');
    fs.writeSync(fd, "{\n");
    var iids = Object.keys(metadata);
    for (var i = 0; i < iids.length; i++) {
        var iid = iids[i];
        fs.writeSync(fd, "  \"" + iid + "\": ");
        var curMetadata = metadata[iid];
        fs.writeSync(fd, JSON.stringify(curMetadata));
        if (i < iids.length - 1) {
            fs.writeSync(fd, ",");
        }
        fs.writeSync(fd,"\n");
    }
    fs.writeSync(fd, "}\n");
    fs.closeSync(fd);
}
/**
 * Instrument a JavaScript file.
 *
 * Note that the API does yet support instrumenting multiple files that must execute together; for that, use
 * esnstrument.js or instrumentDir.js.
 *
 * @param {string} inputFileName the file to be instrumented
 * @param {{ outputFile: string, iidMap: boolean, serialize: boolean, relative: boolean }} [options] options for instrumentation, including:
 *     'outputFileName': the desired output file for instrumented code.  If not provided, a temp file is used
 *     'iidMap': should an IID map file be generated with source locations?  defaults to false
 *     'serialize': should ASTs be serialized? defaults to false
 *     'relative': should we use relative path references to the input file?
 *     'dirIIDFile': where should the IID file be written?
 * @return {{ outputFile: string, iidMapFile: string, iidMetadataFile: string }} output file locations, as appropriate
 *          based on the options
 */
function instrument(inputFileName, options) {
    if (!options) {
        options = {};
    }
    if (!options.relative) {
        inputFileName = path.resolve(inputFileName);
    }
    var outputFileName = getInstOutputFile(options.outputFile);
    var iidMapFile, iidMetadataFile;
    var inputCode = String(fs.readFileSync(inputFileName));
    var dirIIDFile = options.dirIIDFile ? options.dirIIDFile : temp.dir;
    var instCodeOptions = {
        wrapProgram: true,
        filename: inputFileName,
        instFileName: outputFileName,
        metadata: options.serialize,
        initIID: true,
        dirIIDFile: dirIIDFile
    };
    var instResult = esnstrument.instrumentCodeDeprecated(inputCode, instCodeOptions);
    var instCode = instResult.code;
    fs.writeFileSync(outputFileName, instCode);
    if (options.serialize) {
        // TODO choose a better file name here
        iidMetadataFile = outputFileName + ".ast.json";
        writeMetadataToFile(instResult.instAST, iidMetadataFile);
    }
    return {
        outputFile: outputFileName,
        iidMapFile: path.join(instCodeOptions.dirIIDFile,"jalangi_sourcemap.js"),
        iidMetadataFile: iidMetadataFile
    };
}

/**
 * setup the global Config object based on the given instrumentation handler object
 * @param instHandler
 */
function setupConfig(instHandler) {
    var conf = J$.Config;
    conf.INSTR_READ = instHandler.instrRead;
    conf.INSTR_WRITE = instHandler.instrWrite;
    conf.INSTR_GETFIELD = instHandler.instrGetfield;
    conf.INSTR_PUTFIELD = instHandler.instrPutfield;
    conf.INSTR_BINARY = instHandler.instrBinary;
    conf.INSTR_PROPERTY_BINARY_ASSIGNMENT = instHandler.instrPropBinaryAssignment;
    conf.INSTR_UNARY = instHandler.instrUnary;
    conf.INSTR_LITERAL = instHandler.instrLiteral;
    conf.INSTR_CONDITIONAL = instHandler.instrConditional;
}

/**
 * clear any configured instrumentation control functions from the global Config object
 */
function clearConfig() {
    var conf = J$.Config;
    conf.INSTR_READ = null;
    conf.INSTR_WRITE = null;
    conf.INSTR_GETFIELD = null;
    conf.INSTR_PUTFIELD = null;
    conf.INSTR_BINARY = null;
    conf.INSTR_PROPERTY_BINARY_ASSIGNMENT = null;
    conf.INSTR_UNARY = null;
    conf.INSTR_LITERAL = null;
    conf.INSTR_CONDITIONAL = null;
}

/**
 * instruments a code string, returning an object with the following fields:
 * - code: the instrumented code string
 * - instAST: AST for the instrumented code
 * - iidSourceInfo: map from IIDs to source information (filename, start line, start column array tuples)
 * An inputFileName can be passed in the options object.  This name will be associated
 * with the original code in the source map.
 *
 * An instrumentation handler object can be passed in options.instHandler, for controlling which
 * constructs get instrumented.  Possible properties are instrRead, isntrWrite, instrGetfield,
 * instrPutfield, isntrBinary, instrPropBinaryAssignment, instrUnary, instrLiteral, and instrConditional,
 * corresponding to the similarly-named properties documented in Config.js.
 *
 * @param code
 * @param {dirIIDFile?: string, outputFile?: string, inputFileName?:string} options
 */
function instrumentString(code, options) {
    var dirIIDFile = options.dirIIDFile ? options.dirIIDFile : temp.dir;
    var outputFileName = getInstOutputFile(options.outputFile);
    var instCodeOptions = {
        wrapProgram: true,
        filename: options.inputFileName,
        instFileName: outputFileName,
        initIID: options.initIID,
        dirIIDFile: dirIIDFile
    };
    if (options.instHandler) {
        setupConfig(options.instHandler);
    }
    var result = esnstrument.instrumentCodeDeprecated(code,instCodeOptions);
    clearConfig();
    return result;
}

/**
 * instruments a directory.  see src/js/commands/instrument.js for details.
 * creates a temporary output directory if none specified.
 * @param options instrument options.  see src/js/commands/instrument.js
 * @return promise|Q.promise promise that gets resolved at the end of instrumentation
 */
function instrumentDir(options) {
    if (!options.outputDir) {
        options.outputDir = temp.mkdirSync();
    }
    if (options.instHandler) {
        setupConfig(options.instHandler);
    }
    var deferred = Q.defer();
    instDir.instrument(options, function (err) {
        clearConfig();
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve({ outputDir: options.outputDir});
        }
    });
    return deferred.promise;
}

/**
 * record execution of an instrumented script
 * @param {string} instCodeFile the instrumented code
 * @param {string} [traceFile] path to trace file
 * @param {Array.<string>} [script_args] additional CLI arguments for the script to be recorded
 * @return promise|Q.promise promise that gets resolved at the end of recording.  The promise
 * is resolved with an object with properties:
 *     'stdout': the stdout of the record process
 *     'stderr': the stderr of the record process
 *     'traceFile': the location of the trace file
 */
function record(instCodeFile, traceFile, script_args) {
    if (!traceFile) {
        traceFile = temp.path({suffix: '.trace'});
    }
    var cliArgs = ['--tracefile', traceFile, instCodeFile];
    if (script_args) {
        cliArgs = cliArgs.concat(script_args);
    }
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
        cliArgs.push('--tracefile');
        cliArgs.push(traceFile);
    }
    if (clientAnalysis) {
        cliArgs.push('--analysis');
        cliArgs.push(clientAnalysis);
    }
    var forkedProcess = fork(path.resolve(__dirname, "./commands/replay.js"),
        cliArgs, { silent: true });
    forkedProcess.send({initParam: initParam});
    return procUtil.runChildAndCaptureOutput(forkedProcess);
}

/**
 * direct analysis of an instrumented file
 * @param {string} script the instrumented script to analyze
 * @param {string[]} clientAnalyses the analyses to run
 * @param {object} [initParam] parameter to pass to client init() function
 * @return promise|Q.promise promise that gets resolved at the end of analysis.  The promise
 * is resolved with an object with properties:
 *     'exitCode': the exit code from the process doing replay
 *     'stdout': the stdout of the replay process
 *     'stderr': the stderr of the replay process
 *     'result': the result returned by the analysis, if any
 */
function direct(script, clientAnalyses, initParam) {
    var cliArgs = [];
    if (!script) {
        throw new Error("must provide a script to analyze");
    }
    if (!clientAnalyses) {
        throw new Error("must provide an analysis to run");
    }
    clientAnalyses.forEach(function (analysis) {
        cliArgs.push('--analysis');
        cliArgs.push(analysis);
    });
    cliArgs.push(script);
    var forkedProcess = fork(path.resolve(__dirname, "./commands/direct.js"),
        cliArgs, { silent: true });
    forkedProcess.send({initParam: initParam});
    return procUtil.runChildAndCaptureOutput(forkedProcess);
}

/**
 * direct analysis of an instrumented file using analysis2 engine
 * @param {string} script the instrumented script to analyze
 * @param {string[]} clientAnalyses the analyses to run
 * @param {object} [initParam] parameter to pass to client init() function
 * @return promise|Q.promise promise that gets resolved at the end of analysis.  The promise
 * is resolved with an object with properties:
 *     'exitCode': the exit code from the process doing replay
 *     'stdout': the stdout of the replay process
 *     'stderr': the stderr of the replay process
 *     'result': the result returned by the analysis, if any
 */
function direct2(script, clientAnalyses, initParam) {
    var cliArgs = [];
    if (!script) {
        throw new Error("must provide a script to analyze");
    }
    if (!clientAnalyses) {
        throw new Error("must provide an analysis to run");
    }
    clientAnalyses.forEach(function (analysis) {
        cliArgs.push('--analysis');
        cliArgs.push(analysis);
    });
    cliArgs.push(script);
    var forkedProcess = fork(path.resolve(__dirname, "./commands/direct2.js"),
        cliArgs, { silent: true });
    forkedProcess.send({initParam: initParam});
    return procUtil.runChildAndCaptureOutput(forkedProcess);
}

exports.instrument = instrument;
exports.instrumentDir = instrumentDir;
exports.instrumentString = instrumentString;
exports.record = record;
exports.replay = replay;
exports.direct = direct;
exports.direct2 = direct2;