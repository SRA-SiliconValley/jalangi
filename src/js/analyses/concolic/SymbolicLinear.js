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

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    var SymbolicBool = require('./SymbolicBool');

    function SymbolicLinear (i, stype) {
        if (!(this instanceof SymbolicLinear)) {
            return new SymbolicLinear(i, stype);
        }

        var key;
        this.linear = {};
        this.op = SymbolicLinear.UN;
        this.constant = 0;

        if (i !== undefined) {
            if (i instanceof SymbolicLinear) {
                for (key in i.linear) {
                    if (HOP(i.linear,key)) {
                        this.linear[key] = i.linear[key];
                    }
                }
                this.constant = i.constant;
                this.op = i.op;
                //this.stype = i.stype;
            } else {
                this.linear[i] = 1;
                this.stype = stype;
            }
        }

    }

    SymbolicLinear.EQ = 0;
    SymbolicLinear.NE = 1;
    SymbolicLinear.GT = 2;
    SymbolicLinear.GE = 3;
    SymbolicLinear.LT = 4;
    SymbolicLinear.LE = 5;
    SymbolicLinear.UN = 6;

    SymbolicLinear.prototype = {
        constructor: SymbolicLinear,

        equals: function (e) {
            var sizeThis = 0, sizee = 0;
            if (this === e)
                return true;
            if ((e === null) || !(e instanceof SymbolicLinear))
                return false;
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    sizeThis++;
                    if (this.linear[key] !== e.linear[key]) {
                        return false;
                    }
                }
            }
            for (var key in e.linear) {
                if (HOP(e.linear,key)) {
                    sizee++;
                }
            }
            if (sizeThis !== sizee) {
                return false;
            }
            return (this.constant === e.constant) && (this.op === e.op);
        },

        isEmpty: function() {
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    return false;
                }
            }
            return true;
        },

        negate: function () {
            var tmp = new SymbolicLinear();
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    tmp.linear[key] = -this.linear[key];
                }
            }
            tmp.constant = -this.constant;
            //tmp.stype = this.stype;
            return tmp;
        },

        addLong: function(l) {
            return this.addSubtractLong(l, true);
        },

        subtractLong: function(l) {
            return this.addSubtractLong(l, false);
        },

        addSubtractLong: function(l, add) {
            var tmp = new SymbolicLinear(this);
            if (add)
                tmp.constant = this.constant + l;
            else
                tmp.constant = this.constant - l;
            return tmp;
        },


        add: function(e) {
            return this.addSubtract(e, true);
        },

        subtract: function(e) {
            return this.addSubtract(e, false);
        },

        addSubtract: function(e, add) {
            var tmp = new SymbolicLinear(this);
            for (var key in e.linear) {
                if (HOP(e.linear,key)) {

                    var coeff = this.linear[key];
                    if (coeff === undefined) coeff = 0;

                    var toadd;
                    if (add) {
                        toadd = coeff + e.linear[key];
                    } else {
                        toadd = coeff - e.linear[key];
                    }
                    if (toadd == 0) {
                        delete tmp.linear[key];
                    } else {
                        tmp.linear[key] = toadd;
                    }
                }
            }
            if (tmp.isEmpty()) {
                if (add)
                    return this.constant + e.constant;
                else
                    return this.constant - e.constant;
            }

            if (add)
                tmp.constant = this.constant + e.constant;
            else
                tmp.constant = this.constant - e.constant;

            return tmp;
        },

        subtractFrom: function(l) {
            var e = this.negate();
            e.constant = l + e.constant;
            return e;
        },

        multiply: function(l) {
            if (l == 0) return 0;
            if (l == 1) return this;
            var tmp = new SymbolicLinear();
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    tmp.linear[key] = l * this.linear[key];
                }
            }
            tmp.constant = l * this.constant;
            //tmp.stype = this.stype;
            return tmp;
        },

        setop: function(op) {
            var ret = new SymbolicLinear(this);
            if (ret.op !== SymbolicLinear.UN) {
                return ret;
//            if (op === "==") { // (x op 0)==0 is same as !(x op 0)
//                ret = ret.not();
//            } else {
//                throw new Error("setop(\""+op+"\") cannot be applied to "+ret);
//            }
            } else {
                switch(op) {
                    case "<":
                        ret.op = SymbolicLinear.LT;
                        break;
                    case ">":
                        ret.op = SymbolicLinear.GT;
                        break;
                    case ">=":
                        ret.op = SymbolicLinear.GE;
                        break;
                    case "<=":
                        ret.op = SymbolicLinear.LE;
                        break;
                    case "==":
                        ret.op = SymbolicLinear.EQ;
                        break;
                    case "!=":
                        ret.op = SymbolicLinear.NE;
                        break;
                    default:
                        throw new Error("setop(\""+op+"\") cannot be applied to "+ret);
                }
            }
            return ret;
        },

        not: function() {
            var ret = new SymbolicLinear(this);
            if (ret.op == SymbolicLinear.EQ) ret.op = SymbolicLinear.NE;
            else if (ret.op == SymbolicLinear.NE) ret.op = SymbolicLinear.EQ;
            else if (ret.op == SymbolicLinear.GT) ret.op = SymbolicLinear.LE;
            else if (ret.op == SymbolicLinear.GE) ret.op = SymbolicLinear.LT;
            else if (ret.op == SymbolicLinear.LT) ret.op = SymbolicLinear.GE;
            else if (ret.op == SymbolicLinear.LE) ret.op = SymbolicLinear.GT;
            return ret;
        },


        substitute: function(assignments) {
            var val = 0;
            var ret;
            var isSymbolic = false;
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    var l = this.linear[key];
                    if (HOP(assignments,key)) {
                        val += assignments[key]*l;
                    } else {
                        isSymbolic = true;
                        if (!ret) {
                            ret = new SymbolicLinear();
                            //ret.stype = this.stype;
                        }
                        ret.linear[key] = l;
                    }
                }
            }
            val += this.constant;
            if (ret) {
                ret.constant = val;
            }
            if (!isSymbolic) {
                if (this.op == SymbolicLinear.EQ) {
                    val = (val === 0)?SymbolicBool.true:SymbolicBool.false;
                } else
                if (this.op == SymbolicLinear.NE) {
                    val = (val !== 0)?SymbolicBool.true:SymbolicBool.false;
                } else
                if (this.op == SymbolicLinear.LE) {
                    val = (val <= 0)?SymbolicBool.true:SymbolicBool.false;
                } else
                if (this.op == SymbolicLinear.LT) {
                    val = (val < 0)?SymbolicBool.true:SymbolicBool.false;
                } else
                if (this.op == SymbolicLinear.GE) {
                    val = (val >= 0)?SymbolicBool.true:SymbolicBool.false;
                } else
                if (this.op == SymbolicLinear.GT) {
                    val = (val > 0)?SymbolicBool.true:SymbolicBool.false;
                }
                return val;
            } else {
                ret.op = this.op;
                return ret;
            }
        },


        toString: function() {
            var sb = "";
            var first = true;
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    var l = this.linear[key];
                    if (first) {
                        first = false;
                    } else {
                        sb += '+';
                    }
                    if (l < 0) {
                        sb += '(';
                        sb += l;
                        sb += ")*";
                        sb += key;
                    } else if (l == 1) {
                        sb += key;
                    } else if (l > 0) {
                        sb += l;
                        sb += "*";
                        sb += key;
                    }
                }
            }
            if (this.constant != 0) {
                if (this.constant > 0)
                    sb += '+';
                sb += this.constant;
            }
            if (this.op == SymbolicLinear.EQ) {
                sb += "==";
                sb += '0';
            } else
            if (this.op == SymbolicLinear.NE) {
                sb += "!=";
                sb += '0';
            } else
            if (this.op == SymbolicLinear.LE) {
                sb += "<=";
                sb += '0';
            } else
            if (this.op == SymbolicLinear.LT) {
                sb += "<";
                sb += '0';
            } else
            if (this.op == SymbolicLinear.GE) {
                sb += ">=";
                sb += '0';
            } else
            if (this.op == SymbolicLinear.GT) {
                sb += ">";
                sb += '0';
            }
            return sb;
        },

        getFreeVars: function(freeVars) {
            for (var key in this.linear) {
                if (HOP(this.linear,key)) {
                    freeVars[key] = 1;
                }
            }
        },

        getFormulaString: function(freeVars, mode, assignments) {
//        if (mode==="integer") {
            var c = this;
            var first2 = true;
            var sb = "";

            for (var key in c.linear) {
                if (HOP(c.linear,key)) {
                    freeVars[key] = 1;
                    var l = c.linear[key];

                    if (first2) {
                        first2 = false;
                    } else {
                        sb += " + ";
                    }
                    sb += key;
                    sb += "*(";
                    sb += l;
                    sb += ")";

                }
            }
            if (c.constant != 0) {
                sb += "+(";
                sb += c.constant;
                sb += ")";
            }
            if (c.op ==  SymbolicLinear.EQ) {
                sb += " = ";
            } else if (c.op ==  SymbolicLinear.NE) {
                sb += " /= ";
            } else if (c.op ==  SymbolicLinear.LE) {
                sb += " <= ";
            } else if (c.op ==  SymbolicLinear.LT) {
                sb += " < ";
            } else if (c.op ==  SymbolicLinear.GE) {
                sb += " >= ";
            } else if (c.op ==  SymbolicLinear.GT) {
                sb += " > ";
            }
            sb += "0";
            return sb;
//        } else if (mode === "string") {
//            return this.substitute(assignments);
//        }
        },

        print: function(formulaFh) {
            var c = this;
            var first2 = true;
            var fs = require('fs');

            for (var key in c.linear) {
                if (HOP(c.linear,key)) {
                    var l = c.linear[key];

                    if (first2) {
                        first2 = false;
                    } else {
                        fs.writeSync(formulaFh," + ");
                    }
                    fs.writeSync(formulaFh,key);
                    fs.writeSync(formulaFh,"*(");
                    fs.writeSync(formulaFh,l);
                    fs.writeSync(formulaFh,')');

                }
            }
            if (c.constant != 0) {
                fs.writeSync(formulaFh,"+(");
                fs.writeSync(formulaFh,c.constant);
                fs.writeSync(formulaFh,')');
            }
            if (c.op ==  SymbolicLinear.EQ) {
                fs.writeSync(formulaFh," = ");
            } else if (c.op ==  SymbolicLinear.NE) {
                fs.writeSync(formulaFh," /= ");
            } else if (c.op ==  SymbolicLinear.LE) {
                fs.writeSync(formulaFh," <= ");
            } else if (c.op ==  SymbolicLinear.LT) {
                fs.writeSync(formulaFh," < ");
            } else if (c.op ==  SymbolicLinear.GE) {
                fs.writeSync(formulaFh," >= ");
            } else if (c.op ==  SymbolicLinear.GT) {
                fs.writeSync(formulaFh," > ");
            }
            fs.writeSync(formulaFh,"0");
        },

        type: require('./Symbolic')
    }


    module.exports = SymbolicLinear;
}(module));
