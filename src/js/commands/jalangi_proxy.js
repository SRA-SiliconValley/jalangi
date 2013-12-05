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

/*jslint node: true plusplus: false */

var proxy = require("../../../../rewriting-proxy/proxy");
var esnstrument = require("../instrument/esnstrument");
var fs = require("fs");
var path = require("path");
var ArgumentParser = require('argparse').ArgumentParser;
var mkdirp = require('mkdirp');
var jalangi_ws = require("./socket.js");
var instUtil = require('./../instrument/instUtil');


// CONFIGURATION VARS


					
/**
 * where should output files be written to disk?
 */
var outputDir = "/tmp/instScripts";

/**
 * should inline scripts be ignored?
 */
var ignoreInline = false;





/**
 * performs Jalangi instrumentation, and writes associated data to disk.  Saves
 * the original script foo.js and the instrumented script foo_jalangi_.js
 */
function rewriter(src, metadata) {
	var url = metadata.url;
	if (ignoreInline && instUtil.isInlineScript(url)) {
		console.log("ignoring inline script " + url);
		return src;
	}
	console.log("instrumenting " + url);
	var basename = instUtil.createFilenameForScript(url);
	var filename = path.join(outputDir, basename);
	// TODO check for file conflicts and handle appropriately
	fs.writeFileSync(filename, src);
	var instrumented = esnstrument.instrumentCode(src, true, basename);
	fs.writeFileSync(filename.replace(".js",esnstrument.fileSuffix+".js"), instrumented);
	return instrumented;
}

/**
 * create a fresh directory in which to dump instrumented scripts
 */
function initOutputDir() {
	var scriptDirToTry = "";
	for (var i = 0; i < 100; i++) {
		scriptDirToTry = outputDir + "/site" + i;
		if (!fs.existsSync(scriptDirToTry)) {
			break;
		}
	}
	// create the directory, including parents
	mkdirp.sync(scriptDirToTry);
	console.log("writing output to " + scriptDirToTry);
	outputDir = scriptDirToTry;
	// write an empty 'inputs.js' file here, to make replay happy
	// TODO make this filename more robust against name collisions
	fs.writeFileSync(path.join(outputDir, "inputs.js"), "");
}
/**
 * start the instrumenting proxy.  This will instrument
 * JS code using esnstrument, and also inject the relevant
 * Jalangi scripts at the top of the file.
 */
function startJalangiProxy() {
	// set up the instrumenter to write the source map file to the output directory
	esnstrument.openIIDMapFile(outputDir);
	proxy.start({ headerCode: instUtil.getHeaderCode(), rewriter: rewriter, port: 8501 });
}

var parser = new ArgumentParser({ addHelp: true, description: "Jalangi instrumenting proxy server"});
parser.addArgument(['-o', '--outputDir'], { help: "output parent directory for instrumented scripts" } );
parser.addArgument(['-i', '--ignoreInline'], { help: "ignore all inline scripts", nargs: "?", defaultValue: false, constant: true});

var args = parser.parseArgs();
if (args.outputDir) {
	outputDir = args.outputDir;	
}
if (args.ignoreInline) {
	ignoreInline = args.ignoreInline;
}
initOutputDir();
startJalangiProxy();

// TODO add command-line option to not launch websocket proxy
jalangi_ws.start({ outputDir: outputDir });

// TODO temporary hack; this is very gross.  we need separate IID map files per script file
var exitFun = function () {
	console.log("closing IID map file...");
	esnstrument.closeIIDMapFile();
	console.log("done");
	process.exit();
};

process.on('exit', exitFun);
process.on('SIGINT', exitFun);
