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

(function (module) {
    function TaintEngine(executionIndex) {
        var PREFIX1 = "J$";
        var SPECIAL_PROP = "*" + PREFIX1 + "*";
        var TRACE_FILE_NAME = "jalangi_trace";
        var TAINT_SUMMARY = "jalangi_taint";
        var ConcolicValue = require('./../../ConcolicValue');
        var writeSet = {};
        var readSet = {};

        if (!(this instanceof TaintEngine)) {
            return new TaintEngine(executionIndex);
        }

        function HOP(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };


        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        function getValueWritten(result_c) {
            var c = getConcrete(result_c);
            var pval = [];
            var type = typeof c;
            pval[0] = type;
            if (!(type === "object" || type === "function")) {
                pval[1] = c;
            }
            return pval;
        }

        this.beginExecution = function (prefix) {
            this.prefix = prefix;

            this.getField = function (iid, base, offset, result_c) {
                if (result_c instanceof ConcolicValue) {
                    return result_c;
                } else {
                    var base_c = this.getConcrete(base);
                    if (base_c[SPECIAL_PROP] === undefined || base_c[SPECIAL_PROP][SPECIAL_PROP] === undefined) {
                        return result_c;
                    }
                    var field = base_c[SPECIAL_PROP][SPECIAL_PROP] + "." + offset;
                    var sym = {};
                    sym[field] = getValueWritten(result_c);
                    return new ConcolicValue(result_c, sym);
                }
            }

            this.putField = function (iid, base, offset, val) {
                var pval = getValueWritten(val);
                var base_c = this.getConcrete(base);
                if (base_c[SPECIAL_PROP] !== undefined && base_c[SPECIAL_PROP][SPECIAL_PROP] !== undefined) {
                    var field = base_c[SPECIAL_PROP][SPECIAL_PROP] + "." + offset;
                    writeSet[field] = pval;
                }
                if (!(val instanceof ConcolicValue)) {
                    base_c[offset] = new ConcolicValue(val, {"nofield":pval});
                }
                return val;
            }

            this.binary = function (iid, op, left, right, result_c) {
                var left_s = getSymbolic(left);
                var right_s = getSymbolic(right);
                var result_s;
                if (left_s && right_s) {
                    result_s = {};
                    for (var e in left_s) {
                        if (HOP(left_s, e)) {
                            result_s[e] = left_s[e];
                        }
                    }
                    for (e in right_s) {
                        if (HOP(right_s, e)) {
                            result_s[e] = right_s[e];
                        }
                    }
                    return new ConcolicValue(result_c, result_s);
                } else if (left_s) {
                    return new ConcolicValue(result_c, left_s);
                } else if (right_s) {
                    return new ConcolicValue(result_c, right_s);
                } else {
                    return result_c;
                }
            }

            this.unary = function (iid, op, left, result_c) {
                var left_s = getSymbolic(left);
                if (left_s) {
                    return new ConcolicValue(result_c, left_s);
                } else {
                    return result_c;
                }
            }

            this.conditional = function (iid, left, result_c) {
                var left_s = getSymbolic(left);
                if (left_s) {
                    for (var e in left_s) {
                        if (HOP(left_s, e)) {
                            readSet[e] = left_s[e];
                        }
                    }
                }
                return left;
            }

            this.endExecution = function () {
                var fileName = process.argv[2] ? process.argv[2] : TRACE_FILE_NAME;
                var suffix = fileName.substring(TRACE_FILE_NAME.length);
                var fs = require('fs');
                delete readSet.nofield;
                fs.writeFileSync(TAINT_SUMMARY + suffix, JSON.stringify([readSet, writeSet, this.prefix]), "utf8");
            }
        }
    }

    module.exports = TaintEngine;
}(module));
