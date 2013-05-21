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

(function(module){
    function CoverageEngine(executionIndex) {
        var PREFIX1 = "J$";
        var TRACE_FILE_NAME = "jalangi_trace";
        var TAINT_SUMMARY = "jalangi_taint";
        var ConcolicValue = require('./../../ConcolicValue');
        var coverageSet = {};

        if (!(this instanceof CoverageEngine)) {
            return new CoverageEngine(executionIndex);
        }

        function HOP(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        this.beginExecution = function(prefix) {
            this.prefix = prefix;


            this.conditional = function (iid, left, result_c) {
                var ret = getConcrete(result_c);
                var tmp = coverageSet[iid];
                if (tmp === undefined) {
                    tmp = 0;
                }
                if (ret) {
                    tmp |= 2;
                } else {
                    tmp |= 1;
                }
                coverageSet[iid] = tmp;
                return left;
            }

            this.endExecution = function() {
                var fileName = process.argv[2]?process.argv[2]:TRACE_FILE_NAME;
                var suffix = fileName.substring(TRACE_FILE_NAME.length);
                var fs = require('fs');
                fs.writeFileSync(TAINT_SUMMARY+suffix, JSON.stringify([coverageSet, this.prefix]),"utf8");
            }
        }

    }

    module.exports = CoverageEngine;
}(module));
