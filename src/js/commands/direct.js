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

var clientAnalysis;
if (!process.argv[2]) {
    console.log("Usage: node src/js/commands/direct.js scriptName [pathToAnalysisFile]");
}

if (process.argv[3]) {
    clientAnalysis = process.argv[3];
}

var analysis = require('./../analysis');
analysis.init("inbrowser", clientAnalysis, true);
require('./../InputManager');
require('./../instrument/esnstrument');
require(process.cwd() + '/inputs.js');
var script = process.argv[2];
var path = require('path');
require(path.resolve(script));
J$.endExecution();

