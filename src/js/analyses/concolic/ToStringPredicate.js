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


    var SymbolicStringPredicate = require("./SymbolicStringPredicate");
    var SymbolicLinear = require("./SymbolicLinear");
    var SymbolicBool = require("./SymbolicBool");

    function ToStringPredicate(intPart, stringPart) {
        if (!(this instanceof ToStringPredicate)) {
            return new ToStringPredicate(intPart, stringPart);
        }

        if (intPart instanceof ToStringPredicate) {
            this.intPart = intPart.intPart;
            this.stringPart = intPart.stringPart;
        } else {
            this.intPart = intPart;
            this.stringPart = stringPart;
        }
    }

    ToStringPredicate.prototype = {
        constructor: ToStringPredicate,

        not: function() {
            throw new Error("Not of ToStringPredicate is illegal");
        },

        substitute : function(assignments) {
            var tmp = this.intPart.substitute(assignments);
            if (typeof tmp !== 'number') {
                return this;
            }
            var sym = this.stringPart.getField("length").symbolic.toString();
            var int_to_s = tmp+"";
//            var len1 = sym.substitute(assignments);
//            if (typeof len1 === 'number' && int_to_s.length !== len1) {
//                return SymbolicBool.false;
//            }

            assignments[sym] = int_to_s.length;
            return new SymbolicStringPredicate("==", int_to_s, this.stringPart);
        },

        getFormulaString : function(freeVars, mode, assignments) {
            if (mode === 'integer') {
                    if (this.intPart instanceof SymbolicLinear) {
                        this.intPart.getFreeVars(freeVars);
                    }
                return "(TRUE)";
            } else {
                throw new Error("Cannot get formula for ToStringPredicate in string mode");
            }
        },




        toString: function() {
            return this.stringPart + " = toString("+this.intPart+")";
        },

        type: require('./Symbolic')
    };

    module.exports = ToStringPredicate;
}(module));
