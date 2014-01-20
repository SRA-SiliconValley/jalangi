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

// top level node.js API for Jalangi

var esnstrument = require("./instrument/esnstrument");
var fs = require("fs");

/**
 * Instrument a JavaScript file.
 * TODO support IID maps
 * TODO operate on code strings instead of files
 * @param inputFileName the file to be instrumented
 * @param outputFileName the output file for the instrumented code
 */
function instrument(inputFileName, outputFileName) {
    var inputCode = String(fs.readFileSync(inputFileName));
    var options = {
        wrapProgram: true,
        filename: inputFileName,
        instFileName: outputFileName
    };
    var instCode = esnstrument.instrumentCode(inputCode, options);
    fs.writeFileSync(outputFileName, instCode);
}

/**
 * record execution of an instrumented script
 * TODO support instrumented code reading from process.argv?
 * @param instCodeFile the instrumented code
 * @param traceFile file in which to record trace
 */
function record(instCodeFile, traceFile) {

}
