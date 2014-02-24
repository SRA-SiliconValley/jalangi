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

    function TrackValuesEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');
        var getIIDInfo = require('./../../utils/IIDInfo');

        if (!(this instanceof TrackValuesEngine)) {
            return new TrackValuesEngine(executionIndex);
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        function annotateValue(val, iid, str) {
            var val_s = getSymbolic(val);
            if (val_s){
                return val;
            } else {
                if (typeof val !== 'function') {
                    return new ConcolicValue(val, (str?str:"")+" initialized at "+getIIDInfo(iid));
                } else {
                    return val;
                }
            }
        }

        // a dummy result to return, set by init().
        // just used for testing purposes
        var resultToReturn;

        this.init = function(val) {
            resultToReturn = val;
        };

        this.literal = function(iid, val) {
                return annotateValue(val, iid);
        };

        this.invokeFun = function(iid, f, base, args, val, isConstructor) {
            return annotateValue(val, iid);
        };

        this.getField = function(iid, base, offset, val) {
            return annotateValue(val, iid);
        };

        this.read = function(iid, name, val, isGlobal) {
            if (isGlobal && val !== undefined) {
                return val;
            }
            return annotateValue(val, iid);
        };

        this.write = function(iid, name, val) {
            if (name === "eval") {
                return getConcrete(val);
            } else {
                return val;
            }
        };

        this.endExecution = function () {
            return resultToReturn ? resultToReturn : "done";
        };
    }
    module.exports = TrackValuesEngine;
}(module));
