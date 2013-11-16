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

    function UndefinedNullTrackingEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');
        var getIIDInfo = require('./../../utils/IIDInfo');

        if (!(this instanceof UndefinedNullTrackingEngine)) {
            return new UndefinedNullTrackingEngine(executionIndex);
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        this.literal = function (iid, val) {
            var type;
            if (((type = typeof val) === "object" || type === "function") && val !== null) {
                return new ConcolicValue(val, type + " initialized at " + getIIDInfo(iid));
            }
            return annotateNullOrUndef(val, iid);
        }

        function checkNullOrUndef(val) {
            var c = getConcrete(val);
            if (c === null || c === undefined) {
                console.log(getSymbolic(val));
            }
        }

        function annotateNullOrUndef(val, iid, str) {
            if (val === null || val === undefined) {
                return new ConcolicValue(val, (str ? str : "") + val + " initialized at " + getIIDInfo(iid));
            }
            return val;
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            checkNullOrUndef(f);
        }

        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            return annotateNullOrUndef(val, iid);
        }

        this.getFieldPre = function (iid, base, offset) {
            checkNullOrUndef(base);
        }

        this.getField = function (iid, base, offset, val) {
            var s = getSymbolic(base);
            if (s) {
                var str = s + " has field '" + offset + "' = ";
            }
            return annotateNullOrUndef(val, iid, str);
        }

        this.putFieldPre = function (iid, base, offset, val) {
            checkNullOrUndef(base);
            return val;
        }

        this.read = function (iid, name, val, isGlobal) {
            return annotateNullOrUndef(val, iid);
        }
    }

    module.exports = UndefinedNullTrackingEngine;
}(module));
