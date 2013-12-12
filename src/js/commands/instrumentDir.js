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
var instUtil = require("../instrument/instUtil");
var fs = require('fs');
var path = require("path");
var urlParser = require("url");
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var stream = require("stream");
var util = require("util");
var assert = require('assert');
var ArgumentParser = require('argparse').ArgumentParser;


var Transform = stream.Transform;

var instrumentInline = false;

var excludePattern = null;

// directory in which original app sits
var appDir;

// directory to which app is being copied
var copyDir;

function createOrigScriptFilename(name) {
	return name.replace(".js", "_orig_.js");
}

function rewriteInlineScript(src, metadata) {
	var instname = instUtil.createFilenameForScript(metadata.url);
	var origname = createOrigScriptFilename(instname);
	var instrumented = esnstrument.instrumentCode(src, true, origname, instname);
	// TODO make this async?
	fs.writeFileSync(path.join(copyDir, origname), src);
	fs.writeFileSync(path.join(copyDir, instname), instrumented);
	return instrumented;
}

/**
 * shared between HTMLRewriteStream and InstrumentJSStream
 */
function accumulateData(chunk, enc, cb) {
	this.data += chunk;	
	cb();	
}

function HTMLRewriteStream(options) {
	Transform.call(this, options);
	this.data = "";
}
util.inherits(HTMLRewriteStream, Transform);

HTMLRewriteStream.prototype._transform = accumulateData;

HTMLRewriteStream.prototype._flush = function (cb) {
	if (instrumentInline) {
		this.push(proxy.rewriteHTML(this.data, "http://foo.com", rewriteInlineScript, instUtil.getHeaderCode()));	
	} else {
		// just inject our header code
		var headIndex = this.data.indexOf("<head>");
		assert.ok(headIndex !== -1, "couldn't find head element");
		var newHTML = this.data.slice(0, headIndex+6) + "<script>" + instUtil.getHeaderCode() + "</script>" + this.data.slice(headIndex+6);
		this.push(newHTML);
	}
	cb();
};

function rewriteHtml(readStream, writeStream) {
	readStream.pipe(new HTMLRewriteStream()).pipe(writeStream);
}

function InstrumentJSStream(options, origScriptName, instScriptName) {
	Transform.call(this, options);
	this.origScriptName = origScriptName;
	this.instScriptName = instScriptName;
	this.data = "";
}

util.inherits(InstrumentJSStream, Transform);

InstrumentJSStream.prototype._transform = accumulateData;

InstrumentJSStream.prototype._flush = function (cb) {
	console.log("instrumenting " + this.origScriptName);
	this.push(esnstrument.instrumentCode(this.data, true, this.origScriptName, this.instScriptName));
	cb();
};

function instrumentJS(readStream, writeStream, fileName) {
	// we need to write the original file in addition to piping the instrumented file
	assert.ok(fileName.indexOf(appDir) === 0, "oops");
	var scriptRelativePath = fileName.substring(appDir.length+1);
	var origScriptCopyName = createOrigScriptFilename(scriptRelativePath);
	readStream.pipe(new InstrumentJSStream(undefined, origScriptCopyName, scriptRelativePath)).pipe(writeStream);
	readStream.pipe(fs.createWriteStream(path.join(copyDir, origScriptCopyName)));
}

function transform(readStream, writeStream, file) {
	var extension = path.extname(file.name);
	if (extension === '.html') {
		rewriteHtml(readStream, writeStream);
	} else if (extension === '.js') {
	    if ((!excludePattern || file.name.indexOf(excludePattern) === -1)) {
    		instrumentJS(readStream, writeStream, file.name);	        
	    } else {
	        console.log("excluding " + file.name);
	        readStream.pipe(writeStream);
	    }
	} else {
		readStream.pipe(writeStream);
	}
}

/**
 * Instruments all .js files found under dir, and re-writes index.html
 * so that inline scripts are instrumented.  Output is written as a full
 * copy of dir, within outputDir
 */
function instDir(dir, outputDir) {
	// first, copy everything
	appDir = path.resolve(process.cwd(), dir);
	var basename = path.basename(dir);
	copyDir = outputDir + "/" + basename;
	mkdirp.sync(copyDir);
	esnstrument.openIIDMapFile(copyDir);
	// write an empty 'inputs.js' file here, to make replay happy
	// TODO make this filename more robust against name collisions
	fs.writeFileSync(path.join(copyDir, "inputs.js"), "");	
	var callback = function (err) {
	 if (err) {
	   return console.error(err);
	 }
	 esnstrument.closeIIDMapFile();
	 console.log('done!');
	};
	ncp(dir,copyDir, {transform: transform}, callback);
}


var parser = new ArgumentParser({ addHelp: true, description: "Utility to apply Jalangi instrumentation to all files in a directory"});
parser.addArgument(['-x', '--exclude'], { help: "do not instrument any scripts whose filename contains this substring" } );
// TODO add back this option once we've fixed the relevant HTML parsing code
//parser.addArgument(['-i', '--ignoreInline'], { help: "ignore all inline scripts", nargs: "?", defaultValue: false, constant: true});
parser.addArgument(['inputDir'], { help: "directory containing files to instrument"});
parser.addArgument(['outputDir'], { help: "directory in which to create instrumented copy"});

var args = parser.parseArgs();
if (args.exclude) {
    excludePattern = args.exclude;
}
//if (args.ignoreInline) {
//	instrumentInline = !args.ignoreInline;
//}


instDir(args.inputDir, args.outputDir);