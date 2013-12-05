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

var Transform = stream.Transform;

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
	this.push(proxy.rewriteHTML(this.data, "http://foo.com", rewriteInlineScript, instUtil.getHeaderCode()));
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
		instrumentJS(readStream, writeStream, file.name);
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


instDir(process.argv[2], process.argv[3]);