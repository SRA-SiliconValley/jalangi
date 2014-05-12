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

// Author: Manu Sridharan

/*jslint node: true */
/*global J$ */

var argparse = require('argparse');
var parser = new argparse.ArgumentParser({
    addHelp: true,
    description: "Command-line utility to perform Jalangi's pure symbolic execution"
});
parser.addArgument(['analysis'], {
    help: "absolute path to symbolic execution code"
});
parser.addArgument(['script_and_args'], {
    help: "script to run symbolically and its arguments",
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


global.JALANGI_MODE="symbolic";
global.USE_SMEMORY=args.smemory;
global.ANALYSIS_SCRIPT=args.analysis;

var path = require('path');
require('./../InputManager2');
var Headers = require('./../Headers');
Headers.headerSources.forEach(function(src){
    require('./../../../'+src);
});

try {
    require(process.cwd()+'/inputs');
} catch(e) {}


// hack process.argv for the child script
script = path.resolve(script);
var newArgs = [process.argv[0], script];
newArgs = newArgs.concat(args.script_and_args);
process.argv = newArgs;
require(script);
