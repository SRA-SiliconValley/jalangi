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
var path = require("path");
var urlParser = require("url");
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var stream = require("stream");
var util = require("util");

var Transform = stream.Transform;

// directory to which app is being copied
var copyDir;

function HTMLRewriteStream(options) {
	Transform.call(this, options);
	this.data = "";
}
util.inherits(HTMLRewriteStream, Transform);

HTMLRewriteStream.prototype._transform = function (chunk, enc, cb) {
	this.data += chunk;	
	cb();
};

function rewriteInlineScript(src, metadata) {
	var basename = instUtil.createFilenameForScript(metadata.url);
	var filename = path.join(copyDir, basename);
	var instrumented = esnstrument.instrumentCode(src, true);
	
}

HTMLRewriteStream.prototype._flush = function (cb) {
	proxy.rewriteHTML(this.data, "http://foo.com", rewriteInlineScript, instUtil.getHeaderCode());
};

function rewriteHtml(readStream, writeStream) {
	
}

function instrumentJS(readStream, writeStream, fileName) {
	
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
	var basename = path.basename(dir);
	copyDir = outputDir + "/" + basename;
	mkdirp.sync(copyDir);
	var callback = function (err) {
	 if (err) {
	   return console.error(err);
	 }
	 console.log('done!');
	};
	ncp(dir,copyDir, {transform: transform}, callback);
}


instDir(process.argv[2], process.argv[3]);