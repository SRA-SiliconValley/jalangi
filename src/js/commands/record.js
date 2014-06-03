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
var DEFAULT_TRACE_FILE_NAME = 'jalangi_trace';
var parser = new argparse.ArgumentParser({
    addHelp: true,
    description: "Command-line utility to perform Jalangi's record phase"
});
parser.addArgument(['--smemory'], { help: "Use shadow memory", action: 'storeTrue'});
parser.addArgument(['--tracefile'], { help: "Location to store trace file", defaultValue: DEFAULT_TRACE_FILE_NAME });
parser.addArgument(['--analysis'], { help: "absolute path to analysis file to run during record", action:"append"});
parser.addArgument(['script_and_args'], {
    help: "script to record and CLI arguments for that script",
    nargs: argparse.Const.REMAINDER
});
var args = parser.parseArgs();
if (args.script_and_args.length === 0) {
    console.error("must provide script to record");
    process.exit(1);
}
// we shift here so we can use the rest of the array later when
// hacking process.argv; see below
var script = args.script_and_args.shift();

global.JALANGI_MODE="record";
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
        require(path.resolve(src));
    });
}

J$.setTraceFileName(args.tracefile);


// hack process.argv for the child script
script = path.resolve(script);
var newArgs = [process.argv[0], script];
newArgs = newArgs.concat(args.script_and_args);
process.argv = newArgs;
require(script);
