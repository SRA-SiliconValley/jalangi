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

/*jslint node: true */
/*global process */
/*global J$ */

var analysis = require('./../analysis');
analysis.init("record");
require('./../InputManager');
require('./../instrument/esnstrument');
require(process.cwd() + '/inputs.js');
var DEFAULT_TRACE_FILE_NAME = 'jalangi_trace';
var script = process.argv[2];
var traceFileName = process.argv[3] ? process.argv[3] : DEFAULT_TRACE_FILE_NAME;
J$.setTraceFileName(traceFileName);
var path = require('path');
require(path.resolve(script));