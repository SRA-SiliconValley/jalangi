/*
 * Copyright 2013 Samsung Information Systems America, Inc.
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

// Author: Koushik Sen

/*jslint node: true */
/*global J$ */
var DEFAULT_TRACE_FILE_NAME = 'jalangi_trace';
var traceFileName = DEFAULT_TRACE_FILE_NAME, clientAnalysis;
var initSMemory = false;
var idx = 2;
if (process.argv[2]) {
    if (process.argv[2] === '--smemory') {
        initSMemory = true;
        idx = 3;
    }
    traceFileName = process.argv[idx];
    if (process.argv[idx + 1]) {
        clientAnalysis = process.argv[idx + 1];
    }
} else {
    console.log("Usage: node src/js/commands/replay.js [--smemory] traceFileName pathToAnalysisFile");
}
function runAnalysis(initParam) {
    var analysis = require('./../analysis');
    analysis.init("replay", clientAnalysis, initSMemory);
    if (J$.analysis && J$.analysis.init) {
        J$.analysis.init(initParam ? initParam : {});
    }
    require('./../InputManager');
    require('./../instrument/esnstrument');
    require(process.cwd() + '/inputs.js');
    try {
//    console.log("Starting replay ...")
        J$.setTraceFileName(traceFileName);
        J$.replay();
    } finally {
        var result = J$.endExecution();
        if (process.send && clientAnalysis) {
            // we assume send is synchronous
            process.send({result:result});
        }
    }
    process.exit();
}
if (process.send) {
    process.on('message', function (m) {
        runAnalysis(m.initParam);
    });
} else {
    runAnalysis(null);
}
