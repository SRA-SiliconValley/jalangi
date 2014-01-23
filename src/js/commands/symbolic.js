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
var clientAnalysis, script;
if (process.argv.length < 4) {
    throw "not enough arguments";
}
clientAnalysis = process.argv[2];
script = process.argv[3];
// load InputManager2 *before* analysis,
// as symbolic analysis may load instrumented
// files that rely on InputManager2 symbols
require('./../InputManager2');
var analysis = require('./../analysis');
analysis.init("symbolic", clientAnalysis);
require('./../instrument/esnstrument');
require(process.cwd() + '/inputs.js');
var path = require('path');
require(path.resolve(script));