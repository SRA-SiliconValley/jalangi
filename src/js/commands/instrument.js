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
var temp = require('temp').track();
var ArgumentParser = require('argparse').ArgumentParser;


var EXTRA_SCRIPTS_DIR = "__jalangi_extra";
var JALANGI_RUNTIME_DIR = "jalangiRuntime";

/**
 * computes the Jalangi root directory based on the directory of the script
 */
function getJalangiRoot() {
    return path.join(__dirname, '../../..');
}
/**
 * Instruments all .js files found under dir, and re-writes index.html
 * so that inline scripts are instrumented.  Output is written as a full
 * copy of dir, within outputDir
 */
function instrument(options, cb) {

    if (!cb) {
        throw new Error("must pass in a callback");
    }
    //
    // parse out options
    //

    var instrumentInline = options.instrumentInline;

    var excludePattern = options.exclude;

    var dumpSerializedASTs = options.serialize;

    var jalangiRoot = getJalangiRoot();

    // should we store instrumented app directly in the output directory?
    var directInOutput = options.direct_in_output;

    var selenium = options.selenium;

    var inMemoryTrace = options.in_memory_trace || options.selenium;

    var inbrowser = options.inbrowser;

    var smemory = options.smemory;

    var copyRuntime = options.copy_runtime;

    // directory in which original app sits
    var appDir;

    // directory to which app is being copied
    var copyDir;

    // analysis to run in browser (?)
    var analysis = options.analysis;

    /**
     * extra scripts to inject into the application and instrument
     * @type {Array.<String>}
     */
    var extraAppScripts = [];
    if (options.extra_app_scripts) {
        extraAppScripts = options.extra_app_scripts.split(path.delimiter);
    }


    function createOrigScriptFilename(name) {
        return name.replace(".js", "_orig_.js");
    }

    function rewriteInlineScript(src, metadata) {
        var instname = instUtil.createFilenameForScript(metadata.url);
        var origname = createOrigScriptFilename(instname);
        var options = {
            wrapProgram:true,
            filename:origname,
            instFileName:instname,
            metadata:dumpSerializedASTs,
            dirIIDFile: copyDir,
            initIID: firstEntry
        };
        if (firstEntry) {
            firstEntry = false;
        }

        var instResult = esnstrument.instrumentCodeDeprecated(src, options);
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

    var Transform = stream.Transform;

    function HTMLRewriteStream(options) {
        Transform.call(this, options);
        this.data = "";
    }

    util.inherits(HTMLRewriteStream, Transform);

    HTMLRewriteStream.prototype._transform = accumulateData;

    var seleniumCode = "window.__jalangi_errormsgs__ = []; window.onerror = function(errorMsg) { window.__jalangi_errormsgs__.push(errorMsg); };";

    var inMemoryTraceCode = "window.__JALANGI_IN_MEMORY_TRACE__ = true;";

    var jalangiRuntimeDir = JALANGI_RUNTIME_DIR;

    var analysisCode = "window.JALANGI_MODE = \"inbrowser\"";

    var smemoryOption = "window.USE_SMEMORY = true";

    HTMLRewriteStream.prototype._flush = function (cb) {
        function getContainedRuntimeScriptTags() {
            var result = "";
            var addScript = function (file) {
                var fileName = path.join(jalangiRuntimeDir, path.basename(file));
                result += "<script src=\"" + fileName + "\"></script>";
            };
            instUtil.headerSources.forEach(addScript);
            if (analysis) {
                analysis.forEach(addScript);
            }
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
                var tmp3 = "";
                if (analysis) {
                    analysis.forEach(function (src) {
                        src = path.resolve(src);
                        tmp3 += "<script src=\"" + src + "\"></script>";
                    });
                }

                headerLibs = instUtil.getHeaderCodeAsScriptTags(jalangiRoot);
                headerLibs = headerLibs + tmp3;
            }
            if (selenium) {
                headerLibs = "<script>" + seleniumCode + "</script>" + headerLibs;
            }
            if (inMemoryTrace) {
                headerLibs = "<script>" + inMemoryTraceCode + "</script>" + headerLibs;
            }
            if (inbrowser) {
                headerLibs = "<script>" + analysisCode + "</script>" + headerLibs;
            }
            if (smemory) {
                headerLibs = "<script>" + smemoryOption + "</script>" + headerLibs;
            }
            headerLibs += "<script src=\"jalangi_sourcemap.js\"></script>";

            if (extraAppScripts.length > 0) {
                // we need to inject script tags for the extra app scripts,
                // which have been copied into the app directory
                extraAppScripts.forEach(function (script) {
                    var scriptSrc = path.join(EXTRA_SCRIPTS_DIR, path.basename(script));
                    headerLibs += "<script src=\"" + scriptSrc + "\"></script>";
                });
            }
            var newHTML = this.data.slice(0, headIndex + 6) + headerLibs + this.data.slice(headIndex + 6);
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

    var firstEntry = true;

    InstrumentJSStream.prototype._flush = function (cb) {
        console.log("instrumenting " + this.origScriptName);
        var options = {
            wrapProgram:true,
            filename:this.origScriptName,
            instFileName:this.instScriptName,
            metadata:dumpSerializedASTs,
            dirIIDFile: copyDir,
            initIID: firstEntry
        };
        if (firstEntry) {
            firstEntry = false;
        }

        var instResult;
        try {
            instResult = esnstrument.instrumentCodeDeprecated(this.data, options);
        } catch (e) {
            if (e instanceof SyntaxError) {
                // just output the same file
                this.push(this.data);
            } else {
                throw e;
            }
        }
        if (instResult) {
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
        }
        cb();
    };

    function instrumentJS(readStream, writeStream, fileName) {
        // we need to write the original file in addition to piping the instrumented file
        assert.ok(fileName.indexOf(appDir) === 0, "oops");
        var scriptRelativePath = fileName.substring(appDir.length + 1);
        var origScriptCopyName = createOrigScriptFilename(scriptRelativePath);
        readStream.pipe(new InstrumentJSStream(undefined, origScriptCopyName, scriptRelativePath)).pipe(writeStream);
        readStream.pipe(fs.createWriteStream(path.join(copyDir, origScriptCopyName)));
    }

    function transform(readStream, writeStream, file) {
        var extension = path.extname(file.name);
        if (extension === '.html') {
            if (options.no_html) {
                readStream.pipe(writeStream);
            } else {
                rewriteHtml(readStream, writeStream);
            }
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
     * copy the Jalangi runtime files into the directory with
     * instrumented code, so they can be loaded with relative paths
     */
    var copyJalangiRuntime = function () {
        var outputDir = path.join(copyDir, jalangiRuntimeDir);
        mkdirp.sync(outputDir);
        var copyFile = function (srcFile) {
            if (jalangiRoot) {
                srcFile = path.join(jalangiRoot, srcFile);
            }
            var outputFile = path.join(outputDir, path.basename(srcFile));
            fs.writeFileSync(outputFile, String(fs.readFileSync(srcFile)));
        };
        instUtil.headerSources.forEach(copyFile);
        if (analysis) {
            analysis.forEach(function (f) {
                var outputFile = path.join(outputDir, path.basename(f));
                fs.writeFileSync(outputFile, String(fs.readFileSync(f)));
            });
        }
    };

    var outputDir = options.outputDir;

    function initOutputDir(copyDir) {
        mkdirp.sync(copyDir);
//        esnstrument.openIIDMapFile(copyDir);
        // write an empty 'inputs.js' file here, to make replay happy
        // TODO make this filename more robust against name collisions
        // fs.writeFileSync(path.join(copyDir, "inputs.js"), "");
    }

    // are we instrumenting a directory?
    var instDir = options.inputFiles.length === 1 && fs.lstatSync(options.inputFiles[0]).isDirectory();
    var inputDir;
    if (instDir) {
        inputDir = options.inputFiles[0];
    } else {
        // we're instrumenting a list of JavaScript files.  copy them
        // all to a temporary directory and call that the inputDir
        inputDir = temp.mkdirSync("instFiles");
        options.inputFiles.forEach(function (inputFile) {
            assert(!fs.lstatSync(inputFile).isDirectory(), "can't handle multiple directories and files");
            fs.writeFileSync(path.join(inputDir, path.basename(inputFile)), fs.readFileSync(inputFile));
        });

        // also set directInOutput so we get instrumented files directly in output directory
        directInOutput = true;
    }
    appDir = path.resolve(process.cwd(), inputDir);
    if (directInOutput) {
        copyDir = outputDir;
    } else {
        var basename = path.basename(inputDir);
        copyDir = path.join(outputDir, basename);
    }
    initOutputDir(copyDir);
    if (copyRuntime) {
        copyJalangiRuntime();
    }
    if (extraAppScripts.length > 0) {
        // first check that all extra app scripts exist
        extraAppScripts.forEach(function (script) {
            if (!fs.existsSync(script)) {
                throw new Error("extra script " + script + " does not exist");
            }
        });
        // temporarily copy the scripts to the appDir, so
        // they get instrumented like everything else
        var extraScriptDir = path.join(appDir, EXTRA_SCRIPTS_DIR);
        mkdirp.sync(extraScriptDir);
        extraAppScripts.forEach(function (script) {
            fs.writeFileSync(path.join(extraScriptDir, path.basename(script)), fs.readFileSync(script));
        });
    }

    var callback = function (err) {
//        esnstrument.closeIIDMapFile();
        if (extraAppScripts.length > 0) {
            var extraScriptDir = path.join(appDir, EXTRA_SCRIPTS_DIR);
            extraAppScripts.forEach(function (script) {
                fs.unlinkSync(path.join(extraScriptDir, path.basename(script)));
            });
            fs.rmdirSync(extraScriptDir);
        }
        cb(err);
    };
    ncp(inputDir, copyDir, {transform:transform}, callback);

}

if (require.main === module) { // main script
    var parser = new ArgumentParser({ addHelp:true, description:"Utility to apply Jalangi instrumentation to files or a folder."});
    parser.addArgument(['-s', '--serialize'], { help:"dump serialized ASTs along with code", action:'storeTrue' });
    parser.addArgument(['-x', '--exclude'], { help:"do not instrument any scripts whose filename contains this substring" });
    // TODO add back this option once we've fixed the relevant HTML parsing code
    parser.addArgument(['-i', '--instrumentInline'], { help:"instrument inline scripts", action:'storeTrue'});
    parser.addArgument(['--analysis'], { help:"Analysis script for 'inbrowser'/'record' mode.  Analysis must not use ConcolicValue", action:"append" });
    parser.addArgument(['-d', '--direct_in_output'], { help:"Store instrumented app directly in output directory (by default, creates a sub-directory of output directory)", action:'storeTrue' });
    parser.addArgument(['--selenium'], { help:"Insert code so scripts can detect they are running under Selenium.  Also keeps Jalangi trace in memory", action:'storeTrue' });
    parser.addArgument(['--in_memory_trace'], { help:"Insert code to tell analysis to keep Jalangi trace in memory instead of writing to WebSocket", action:'storeTrue' });
    parser.addArgument(['--inbrowser'], { help:"Insert code to tell Jalangi to run in 'inbrowser' analysis mode", action:'storeTrue' });
    parser.addArgument(['--smemory'], { help:"Add support for shadow memory", action:'storeTrue' });
    parser.addArgument(['-c', '--copy_runtime'], { help:"Copy Jalangi runtime files into instrumented app in jalangi_rt sub-directory", action:'storeTrue'});
    parser.addArgument(['--extra_app_scripts'], { help:"list of extra application scripts to be injected and instrumented, separated by path.delimiter"});
    parser.addArgument(['--no_html'], { help:"don't inject Jalangi runtime into HTML files", action:'storeTrue'});
    parser.addArgument(['--outputDir'], { help:"directory in which to place instrumented files", required:true });
    parser.addArgument(['inputFiles'], { help:"either a list of JavaScript files to instrument, or a single directory under which all JavaScript and HTML files should be instrumented (modulo the --no_html and --exclude flags)", nargs:'+'});

    var args = parser.parseArgs();

    instrument(args, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('done!');
    });

} else {
    exports.instrument = instrument;
    exports.EXTRA_SCRIPTS_DIR = EXTRA_SCRIPTS_DIR;
    exports.JALANGI_RUNTIME_DIR = JALANGI_RUNTIME_DIR;
}

