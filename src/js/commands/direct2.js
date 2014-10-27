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
// Author: Koushik Sen

/*jslint node: true */
/*global process */
/*global J$ */

var argparse = require('argparse');
var parser = new argparse.ArgumentParser({
    addHelp: true,
    description: "Command-line utility to perform Jalangi's analysis2"
});
parser.addArgument(['--analysis'], { help: "absolute path to analysis file to run", action:'append'});
parser.addArgument(['--initParam'], { help: "initialization parameter for analysis, specified as key:value", action:'append'});
parser.addArgument(['script_and_args'], {
    help: "script to record and CLI arguments for that script",
    nargs: argparse.Const.REMAINDER
});
var args = parser.parseArgs();

function runAnalysis(initParam) {
    if (args.script_and_args.length === 0) {
        console.error("must provide script to record");
        process.exit(1);
    }
    // we shift here so we can use the rest of the array later when
    // hacking process.argv; see below
    var script = args.script_and_args.shift();

    var path = require('path');
    var Headers = require('./../Headers2');
    Headers.headerSources.forEach(function(src){
        require('./../../../'+src);
    });

    J$.initParams = initParam || {};
    if (args.analysis) {
        args.analysis.forEach(function (src) {
            require(path.resolve(src));
        });
    }

    function startProgram() {
        // hack process.argv for the child script
        script = path.resolve(script);
        var newArgs = [process.argv[0], script];
        newArgs = newArgs.concat(args.script_and_args);
        process.argv = newArgs;
        try {
            require(script);
        } finally {
            var result = J$.endExecution();
            if (process.send && args.analysis) {
                // we assume send is synchronous
                process.send({result:result});
                // without this call, child process just sits around without exiting
                process.disconnect();
            }
        }
    }

    if (J$.analysis && J$.analysis.onReady) {
        J$.analysis.onReady(startProgram);
    } else {
        startProgram();
    }
}

if (process.send) {
    process.on('message', function (m) {
        runAnalysis(m.initParam);
    });
} else {
    var initParam = null;
    if (args.initParam) {
        initParam = {};
        args.initParam.forEach(function (keyVal) {
            var split = keyVal.split(':');
            if (split.length !== 2) {
                throw new Error("invalid initParam " + keyVal);
            }
            initParam[split[0]] = split[1];
        });
    }
    runAnalysis(initParam);
}

