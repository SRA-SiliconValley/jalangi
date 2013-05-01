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

    var SymbolicStringVar = require('./SymbolicStringVar');
    var SymbolicLinear = require('../concolic/SymbolicLinear');

    function SymbolicStringExpression(sym) {
        if (!(this instanceof SymbolicStringExpression)) {
            return new SymbolicStringExpression(sym);
        }
        if (sym instanceof SymbolicStringExpression) {
            this.list = [];
            for(var i=sym.list.length-1; i >=0; i--) {
                this.list[i] = sym.list[i];
            }
        } else {
            this.list = [];
            this.list.push(new SymbolicStringVar(sym));
        }
    }

    SymbolicStringExpression.prototype = {
        constructor: SymbolicStringExpression,

        getLength : function() {
            var ret = null, len = this.list.length, val, constant = 0;
            for(var i=0; i<len; i++) {
                val = this.list[i];
                if (typeof val === 'string') {
                    constant += val.length;
                } else {
                    if (ret) {
                        ret = ret.add(new SymbolicLinear(val.getLength()));
                    } else {
                        ret = new SymbolicLinear(val.getLength());
                    }
                }
            }
            return ret.addLong(constant);
        },

        substitute : function(assignments) {
            var sb = "", len = this.list.length, elem, tmp, ret;
            for(var i=0; i<len; i++) {
                elem = this.list[i];
                if (elem instanceof SymbolicStringVar) {
                    tmp = elem.substitute(assignments);
                    if (tmp instanceof SymbolicStringVar) {
                        if (!ret) {
                            ret = new SymbolicStringExpression(tmp.toString());
                            ret = ret.concatToStr(sb);
                        } else {
                            ret = ret.concatStr(sb).concat(new SymbolicStringExpression(tmp.toString()));
                        }
                        sb = "";
                    } else {
                        sb += tmp;
                    }
                } else {
                    sb += elem;
                }
            }
            if (ret) {
                return ret.concatStr(sb);
            } else {
                return sb;
            }
        },

        concatStr : function(str) {
            if (str === "") {
                return this;
            }
            var ret = new SymbolicStringExpression(this);
            var last = ret.list[ret.list.length-1];
            if (typeof last === 'string') {
                ret.list[ret.list.length-1] = last + str;
            } else {
                ret.list.push(str);
            }
            return ret;
        },

        concat : function(expr) {
            var ret = new SymbolicStringExpression(this);
            var last = ret.list[ret.list.length-1];
            var first = expr.list[0];
            if (typeof last === 'string' && typeof first === 'string') {
                ret.list[ret.list.length-1] = last + first;
            } else {
                ret.list.push(first);
            }

            var len = expr.list.length;
            for (var i=1; i<len; i++) {
                ret.list.push(expr.list[i]);
            }
            return ret;
        },

        concatToStr : function(str) {
            if (str === "") {
                return this;
            }
            var ret = new SymbolicStringExpression(this);
            var first = ret.list[0];
            if (typeof first === 'string') {
                ret.list[0] = str + first;
            } else {
                ret.list.unshift(str);
            }
            return ret;
        },

        isCompound : function() {
            return this.list.length > 1;
        },

        toString : function() {
            var sb = "", len = this.list.length, elem;
            for(var i=0; i<len; i++) {
                if (i !== 0) {
                    sb += "+";
                }
                elem = this.list[i];
                if (elem instanceof SymbolicStringVar) {
                    sb += elem;
                } else {
                    sb += JSON.stringify(elem);
                }
            }
            return sb;
        },

        type: require('../concolic/Symbolic')

    };

    module.exports = SymbolicStringExpression;
}(module));
