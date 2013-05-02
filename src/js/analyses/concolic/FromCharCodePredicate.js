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

    function FromCharCodePredicate(intParts, stringPart) {
        if (!(this instanceof FromCharCodePredicate)) {
            return new FromCharCodePredicate(intParts, stringPart);
        }

        if (intParts instanceof FromCharCodePredicate) {
            this.intParts = intParts.intParts;
            this.stringPart = intParts.stringPart;
        } else {
            this.intParts = intParts;
            this.stringPart = stringPart;
        }
    }

    FromCharCodePredicate.prototype = {
        constructor: FromCharCodePredicate,

        not: function() {
            throw new Error("Not of FromCharCodePredicate is illegal");
        },

        substitute : function(assignments) {
            var s = "";
            var i, len = this.intParts.length;
            for (i=0; i<len; i++) {
                var tmp = (this.intParts[i] instanceof SymbolicLinear)?this.intParts[i].substitute(assignments):(+this.intParts[i]);
                if (typeof tmp !== 'number') {
                    return this;
                }
                s += String.fromCharCode(tmp);
            }
            var sym = this.stringPart.getField("length").symbolic.toString();
            assignments[sym] = s.length;
//            var len1 = sym.substitute(assignments);
//            if (typeof len1 === 'number' && s.length !== len1) {
//                return SymbolicBool.false;
//            }

            return new SymbolicStringPredicate("==", s, this.stringPart);
        },

        getFormulaString : function(freeVars, mode, assignments) {
            if (mode === 'integer') {
                var i, len = this.intParts.length;
                for (i=0; i<len; i++) {
                    if (this.intParts[i] instanceof SymbolicLinear) {
                        this.intParts[i].getFreeVars(freeVars);
                    }
                }
                return "(TRUE)";
            } else {
                throw new Error("Cannot get formula for FromCharCodePredicate in string mode");
            }
        },




        toString: function() {
            return "("+this.stringPart + ") = String.fromCharCode("+this.intParts+")";
        },

        type: require('./Symbolic')
    };

    module.exports = FromCharCodePredicate;
}(module));
