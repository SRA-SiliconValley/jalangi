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

var proxy = require("../../../../rewriting-proxy/proxy");
var esnstrument = require("../instrument/esnstrument");
var fs = require("fs");
var urlParser = require("url");
var ArgumentParser = require('argparse').ArgumentParser;
var mkdirp = require('mkdirp');


// CONFIGURATION VARS

/**
 * which source files are required for Jalangi to run in the browser?
 */
var headerSources = ["src/js/analysis.js", 
					"src/js/InputManager.js", 
					"node_modules/escodegen/escodegen.browser.js",
					"node_modules/esprima/esprima.js",
					"src/js/instrument/esnstrument.js"];
					
/**
 * where should instrumented scripts be written to disk?
 */
var instScriptDir = "/tmp/instScripts";

/**
 * should inline scripts be ignored?
 */
var ignoreInline = false;

/**
 * concatenates required scripts for Jalangi to run in the browser into a single string
 */
function createHeaderCode() {
	// TODO this assumes we are run from root Jalangi directory.  Allow for parameter / environment variable?
	var result = "";
	headerSources.forEach(function (src) {
		result += fs.readFileSync(src);
	});
	return result;
}

var inlineRegexp = /#(inline|event-handler|js-url)/;
/**
 * generate a filename for a script with the given url
 */
function createFilenameForScript(url) {
	// TODO make this much more robust
	var parsed = urlParser.parse(url);
	if (inlineRegexp.test(url)) {
		return parsed.hash.substring(1) + ".js";
	} else {
		return parsed.pathname.substring(parsed.pathname.lastIndexOf("/")+1);	
	}
}

/**
 * performs Jalangi instrumentation, and writes associated data to disk.
 */
function rewriter(src, metadata) {
	var url = metadata.url;
	if (ignoreInline && inlineRegexp.test(url)) {
		console.log("ignoring inline script " + url);
		return src;
	}
	console.log("instrumenting " + url);
	// create filename for script
	var filename = instScriptDir + "/" + createFilenameForScript(url);
	console.log("filename " + filename);
	var instrumented = esnstrument.instrumentCode(src, true, filename);
	fs.writeFileSync(filename.replace(".js",esnstrument.fileSuffix+".js"), instrumented);
	return instrumented;
}

/**
 * create a fresh directory in which to dump instrumented scripts
 */
function initInstScriptDir() {
	var scriptDirToTry = "";
	for (var i = 0; i < 100; i++) {
		scriptDirToTry = instScriptDir + "/site" + i;
		if (!fs.existsSync(scriptDirToTry)) {
			break;
		}
	}
	// create the directory, including parents
	mkdirp.sync(scriptDirToTry);
	console.log("writing instrumented scripts to " + scriptDirToTry);
	instScriptDir = scriptDirToTry;
}
/**
 * start the instrumenting proxy.  This will instrument
 * JS code using esnstrument, and also inject the relevant
 * Jalangi scripts at the top of the file.
 */
function startJalangiProxy() {
	proxy.start({ headerCode: createHeaderCode(), rewriter: rewriter, port: 8501 });
}

var parser = new ArgumentParser({ addHelp: true, description: "Jalangi instrumenting proxy server"});
parser.addArgument(['-o', '--outputDir'], { help: "output parent directory for instrumented scripts" } );
parser.addArgument(['-i', '--ignoreInline'], { help: "ignore all inline scripts", nargs: "?", defaultValue: false, constant: true});

var args = parser.parseArgs();
if (args.outputDir) {
	instScriptDir = args.outputDir;	
}
if (args.ignoreInline) {
	ignoreInline = args.ignoreInline;
}
initInstScriptDir();
startJalangiProxy();