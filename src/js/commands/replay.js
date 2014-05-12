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

var argparse = require('argparse');
var DEFAULT_TRACE_FILE_NAME = 'jalangi_trace';
var parser = new argparse.ArgumentParser({
    addHelp: true,
    description: "Command-line utility to perform Jalangi's replay phase"
});
parser.addArgument(['--smemory'], { help: "Use shadow memory", action: 'storeTrue'});
parser.addArgument(['--tracefile'], { help: "Location to store trace file", defaultValue: DEFAULT_TRACE_FILE_NAME });
parser.addArgument(['--analysis'], { help: "absolute path to analysis file to run during replay", action:"append"});
var args = parser.parseArgs();


function runAnalysis(initParam) {
    global.JALANGI_MODE="replay";
    global.USE_SMEMORY=args.smemory;

    var path = require('path');
    var Headers = require('./../Headers');
    Headers.headerSources.forEach(function(src){
        require('./../../../'+src);
    });
    require('./../InputManager');
    try {
        require(process.cwd()+'/inputs');
    } catch(e) {}

    if (args.analysis) {
        args.analysis.forEach(function (src) {
            var Analysis = require(path.resolve(src));
            // The old interface for analyses was to return a Constructor.
            // Continue to support this interface
            if (Analysis && typeof Analysis === 'function') {
                J$.analysis = new Analysis();
            }
        });
    }

    if (J$.analysis && J$.analysis.init) {
        J$.analysis.init(initParam ? initParam : {});
    }

    try {
//    console.log("Starting replay ...")
        J$.setTraceFileName(args.tracefile);
        J$.replay();
    } finally {
        var result = J$.endExecution();
        if (process.send && args.analysis) {
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
