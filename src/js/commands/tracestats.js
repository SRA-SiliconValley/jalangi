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

// Author: Koushik Sen

var F_TYPE = 0,
    F_VALUE = 1,
    F_IID = 2,
    F_FUNNAME = 4,
    F_SEQ = 3;


var  N_LOG_FUN_CALL = 1,
    N_LOG_METHOD_CALL = 2,
    N_LOG_FUNCTION_ENTER = 4,
    N_LOG_FUNCTION_RETURN = 5,
    N_LOG_SCRIPT_ENTER = 6,
    N_LOG_SCRIPT_EXIT = 7,
    N_LOG_GETFIELD = 8,
//N_LOG_GLOBAL = 9,
    N_LOG_ARRAY_LIT = 10,
    N_LOG_OBJECT_LIT = 11,
    N_LOG_FUNCTION_LIT = 12,
    N_LOG_RETURN = 13,
    N_LOG_REGEXP_LIT = 14,
//N_LOG_LOCAL = 15,
    N_LOG_OBJECT_NEW = 16,
    N_LOG_READ = 17,
    N_LOG_FUNCTION_ENTER_NORMAL = 18,
    N_LOG_HASH = 19,
    N_LOG_SPECIAL = 20,
    N_LOG_STRING_LIT = 21,
    N_LOG_NUMBER_LIT = 22,
    N_LOG_BOOLEAN_LIT = 23,
    N_LOG_UNDEFINED_LIT = 24,
    N_LOG_NULL_LIT = 25;


function processTrace() {
    var histogram = {};
    var FileLineReader = require('./../utils/FileLineReader');
    var traceFh = new FileLineReader(process.argv[2]);
    while (traceFh.hasNextLine()) {
        var record = JSON.parse(traceFh.nextLine());
        if (record[F_FUNNAME]===N_LOG_GETFIELD) {
            var iid = record[F_IID];
            if (histogram.hasOwnProperty(iid)) {
                histogram[iid] ++;
            } else {
                histogram[iid] = 1;
            }
        }
    }
    traceFh.close();
    return histogram
}

var histogram = processTrace();
for (var e in histogram) {
    if (histogram.hasOwnProperty(e)) {
        console.log(e+":"+histogram[e]);
    }
}
