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
    var SymbolicLinear = require("../concolic/SymbolicLinear");
    var SymbolicBool = require('../concolic/SymbolicBool');

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
            return new SymbolicBool("!", this);
        },

        substitute : function(assignments) {
            var tmp = typeof this.intPart === 'number'?this.intPart:this.intPart.substitute(assignments);
            var tmp2 = typeof this.stringPart === 'string'?this.stringPart:this.stringPart.substitute(assignments);
            if (typeof tmp === 'number') {
                if (typeof tmp2 === 'string') {
                    if ((tmp+"") === tmp2) {
                        return SymbolicBool.true; // this predicate is an axiom which must return true on substitution
                    } else {
                        return SymbolicBool.false;
                    }
                } else {
                    var sym = this.stringPart.getLength();
                    var int_to_s = tmp+"";
                    var len1 = sym.substitute(assignments);
                    if (typeof len1 === 'number' && int_to_s.length !== len1) {
                        return SymbolicBool.false;
                    }
//                    assignments[sym] = int_to_s.length;
                    return new SymbolicStringPredicate("==", int_to_s, this.stringPart);
                }
            } else {
                return new ToStringPredicate(tmp, tmp2);
            }
        },

        getFormulaString : function(freeVars, mode, assignments) {
            if (mode === 'integer') {
                if (this.intPart instanceof SymbolicLinear) {
                    //this.intPart.getFreeVars(freeVars);
                    var i1 = this.intPart.setop(">=");
                    var i2 = this.intPart.setop("<=");

                    return (new SymbolicBool("||", i1, i2)).getFormulaString(freeVars, mode, assignments);
                } else {
                    return this.stringPart.getLength().subtractLong(this.intPart).setop("==").getFormulaString(freeVars, mode, assignments);
                }
            } else {
                throw new Error("Cannot get formula for ToStringPredicate in string mode");
            }
        },




        toString: function() {
            return this.stringPart + " = toString("+this.intPart+")";
        },

        type: require('../concolic/Symbolic')
    };

    module.exports = ToStringPredicate;
}(module));
