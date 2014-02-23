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

var proxy = require("rewriting-proxy");
var esnstrument = require("../instrument/esnstrument");
var instUtil = require("../instrument/instUtil");
var fs = require('fs');
var path = require("path");
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var stream = require("stream");
var util = require("util");
var assert = require('assert');
var ArgumentParser = require('argparse').ArgumentParser;


var Transform = stream.Transform;

var instrumentInline = false;

var excludePattern = null;

var dumpSerializedASTs = false;

// Jalangi root directory; current working directory by default
var jalangiRoot;

// should we use relative paths in <script> tags for runtime libs?

var relative = false;
// should we store instrumented app directly in the output directory?
var directInOutput = false;

var selenium = false;

var inMemoryTrace = false;

var copyRuntime = false;

var first_iid = 0;

// directory in which original app sits
var appDir;

// directory to which app is being copied
var copyDir;

var analysis;

function createOrigScriptFilename(name) {
	return name.replace(".js", "_orig_.js");
}

function rewriteInlineScript(src, metadata) {
	var instname = instUtil.createFilenameForScript(metadata.url);
	var origname = createOrigScriptFilename(instname);
    var options = {
        wrapProgram: true,
        filename: origname,
        instFileName: instname,
        serialize: dumpSerializedASTs
    };
	var instResult = esnstrument.instrumentCode(src, options);
	var instrumentedCode = instResult.code;
	// TODO make this async?
	fs.writeFileSync(path.join(copyDir, origname), src);
	fs.writeFileSync(path.join(copyDir, instname), instrumentedCode);
	if (dumpSerializedASTs) {
        fs.writeFileSync(path.join(copyDir, instname + ".ast.json"), JSON.stringify(instResult.serializedAST, undefined, 2), "utf8");	 
	}
	return instrumentedCode;
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

var seleniumCode = "window.__jalangi_errormsgs__ = []; window.onerror = function(errorMsg) { window.__jalangi_errormsgs__.push(errorMsg); };";

var inMemoryTraceCode = "window.__JALANGI_IN_MEMORY_TRACE__ = true;";

var jalangiRuntimeDir = "jalangiRuntime";

var analysisCode = "window.JALANGI_MODE = \"inbrowser\"";


HTMLRewriteStream.prototype._flush = function (cb) {
    function getContainedRuntimeScriptTags() {
        var result = "";
        instUtil.headerSources.forEach(function (file) {
           var fileName = path.join(jalangiRuntimeDir, path.basename(file));
           result += "<script src=\"" + fileName + "\"></script>";
        });
        return result;
    }

    if (instrumentInline) {
		this.push(proxy.rewriteHTML(this.data, "http://foo.com", rewriteInlineScript, instUtil.getHeaderCode(jalangiRoot)));	
	} else {
		// just inject our header code
		var headIndex = this.data.indexOf("<head>");
		assert.ok(headIndex !== -1, "couldn't find head element");
        var headerLibs;
        if (copyRuntime) {
            headerLibs = getContainedRuntimeScriptTags();
        } else {
            headerLibs = instUtil.getHeaderCodeAsScriptTags(jalangiRoot,relative,analysis);
        }
		if (selenium) {
            headerLibs = "<script>" + seleniumCode + "</script>" + headerLibs;
		}
        if (inMemoryTrace) {
            headerLibs = "<script>" + inMemoryTraceCode + "</script>" + headerLibs;
        }
        if (analysis) {
            headerLibs = "<script>" + analysisCode + "</script>" + headerLibs;
        }
        headerLibs += "<script src=\"jalangi_sourcemap.js\"></script>";

        var newHTML = this.data.slice(0, headIndex+6) + headerLibs + this.data.slice(headIndex+6);
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
    var options = {
        wrapProgram: true,
        filename: this.origScriptName,
        instFileName: this.instScriptName,
        metadata: dumpSerializedASTs
    };
	var instResult = esnstrument.instrumentCode(this.data, options);
	if (dumpSerializedASTs) {
        var metadata = instResult.iidMetadata;
        fs.writeFileSync(path.join(copyDir, this.instScriptName + ".ast.json"), JSON.stringify(metadata, undefined, 2), "utf8");
	}
    if (typeof instResult === 'string') {
        // this can occur if it's a script we're not supposed to instrument
        this.push(instResult);
    } else {
        this.push(instResult.code);
    }
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

var copyJalangiRuntime = function () {
    var outputDir = path.join(copyDir,jalangiRuntimeDir);
    mkdirp.sync(outputDir);
    instUtil.headerSources.forEach(function (srcFile) {
        if (jalangiRoot) {
            srcFile = path.join(jalangiRoot, srcFile);
        }
        var outputFile = path.join(outputDir,path.basename(srcFile));
        fs.writeFileSync(outputFile,String(fs.readFileSync(srcFile)));
    });
};

/**
 * Instruments all .js files found under dir, and re-writes index.html
 * so that inline scripts are instrumented.  Output is written as a full
 * copy of dir, within outputDir
 */
function instDir(dir, outputDir) {
	// first, copy everything
	appDir = path.resolve(process.cwd(), dir);
    if (directInOutput) {
        copyDir = outputDir;
    } else {
        var basename = path.basename(dir);
        copyDir = path.join(outputDir, basename);
	}
	mkdirp.sync(copyDir);
	esnstrument.openIIDMapFile(copyDir, first_iid);
	// write an empty 'inputs.js' file here, to make replay happy
	// TODO make this filename more robust against name collisions
	fs.writeFileSync(path.join(copyDir, "inputs.js"), "");
    if (copyRuntime) {
        copyJalangiRuntime();
    }
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
parser.addArgument(['-s', '--serialize'], { help: "dump serialized ASTs along with code", action:'storeTrue' } );
parser.addArgument(['-x', '--exclude'], { help: "do not instrument any scripts whose filename contains this substring" } );
// TODO add back this option once we've fixed the relevant HTML parsing code
parser.addArgument(['-i', '--instrumentInline'], { help: "instrument inline scripts", action:'storeTrue'});
parser.addArgument(['--jalangi_root'], { help: "Jalangi root directory, if not working directory" } );
parser.addArgument(['--analysis'], { help: "Analysis script for 'inbrowser' mode" } );
parser.addArgument(['-d', '--direct_in_output'], { help: "Store instrumented app directly in output directory (by default, creates a sub-directory of output directory)", action:'storeTrue' } );
parser.addArgument(['--selenium'], { help: "Insert code so scripts can detect they are running under Selenium.  Also keeps Jalangi trace in memory", action:'storeTrue' } );
parser.addArgument(['--in_memory_trace'], { help: "Insert code to tell analysis to keep Jalangi trace in memory instead of writing to WebSocket", action:'storeTrue' } );
parser.addArgument(['--relative'], { help: "Use paths relative to working directory in injected <script> tags", action:'storeTrue' } );
parser.addArgument(['-c', '--copy_runtime'], { help: "Copy Jalangi runtime files into instrumented app in jalangi_rt sub-directory", action:'storeTrue'});
parser.addArgument(['--first_iid'], { help: "initial IID to use during instrumentation"});
parser.addArgument(['inputDir'], { help: "directory containing files to instrument"});
parser.addArgument(['outputDir'], { help: "directory in which to create instrumented copy"});

var args = parser.parseArgs();
if (args.serialize) {
    dumpSerializedASTs = args.serialize;
}
if (args.exclude) {
    excludePattern = args.exclude;
}
if (args.jalangi_root) {
    jalangiRoot = args.jalangi_root;
}
if (args.direct_in_output) {
    directInOutput = args.direct_in_output;
}
if (args.selenium) {
    inMemoryTrace = selenium = args.selenium;
}

if (args.in_memory_trace) {
    inMemoryTrace = args.in_memory_trace;
}

if (args.relative) {
    relative = args.relative;
}
if (args.instrumentInline) {
	instrumentInline = args.instrumentInline;
}

if (args.analysis) {
    analysis = args.analysis;
}

if (args.copy_runtime) {
    copyRuntime = args.copy_runtime;
}

if (args.first_iid) {
    first_iid = parseInt(args.first_iid);
}


instDir(args.inputDir, args.outputDir);