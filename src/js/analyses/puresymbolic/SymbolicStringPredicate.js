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

    function execSync(cmd) {
        var FFI = require("node-ffi");
        var libc = new FFI.Library(null, {
            "system": ["int32", ["string"]]
        });

        var run = libc.system;
        run(cmd);
    }

    var stdoutCache = {};
    var SymbolicStringExpression = require('./SymbolicStringExpression');
    var SymbolicLinear = require('../concolic/SymbolicLinear');

    function stdout(cmd) {
        var ret;
        if ((ret = stdoutCache[cmd]) !== undefined) {
            return ret;
        }
        //console.log(cmd);
        execSync(cmd+" > jalangi_javaout");
        var FileLineReader = require('./../../utils/FileLineReader');
        var fd = new FileLineReader("jalangi_javaout");
        var line = "";

        if (fd.hasNextLine()) {
            line = fd.nextLine();
        }
        fd.close();
        line = line.replace(/(\r\n|\n|\r)/gm,"")
        //console.log("Java output:"+line);
        stdoutCache[cmd] = line;
        return line;
    }


    function regex_escape (text) {
        return text.substring(1,text.length-1);
//    return text.replace(/[\\]/g, "\\\\$&");
    }

    function exprAt(sExpr, i, freeVars, assignments) {
        var j, len, s, idx, tmp, length;
        if (typeof sExpr === 'string') {
            return sExpr.charCodeAt(i);
        } else {
            len = sExpr.list.length;
            for (j=0; j<len; j++) {
                s = sExpr.list[j];
                if (typeof s === 'string') {
                    if (i < s.length) {
                        return s.charCodeAt(i);
                    } else {
                        i = i - s.length;
                    }
                } else {
                    idx = s+"";
                    length = s.getLength().substitute(assignments);
                    if (i < length) {
                        tmp = idx+"__"+i;
                        freeVars[tmp] = true;
                        return tmp;
                    } else {
                        i = i - length;
                    }
                }
            }
        }
    }

    function getStringEqualityFormula(left, right, length, freeVars, assignments) {
        var i, sb = "(";

        if (length <= 0) {
            return "TRUE";
        }
        for(i=0; i<length; i++) {
            if (i!==0) {
                sb += " AND ";
            }
            sb += "("+exprAt(left,i,freeVars,assignments)+" = " + exprAt(right,i,freeVars,assignments)+")";
        }
        sb += ")";

        return sb;
    }

    function SymbolicStringPredicate(op, left, right) {
        if (!(this instanceof SymbolicStringPredicate)) {
            return new SymbolicStringPredicate(op, left, right);
        }

        if (op instanceof SymbolicStringPredicate) {
            this.left = op.left;
            this.right = op.right;
            this.op = op.op;
        } else {
            if (!(left instanceof SymbolicStringExpression ||
                typeof left === 'string'))
                left = ""+left;
            this.left = left;
            if (!(right instanceof SymbolicStringExpression ||
                right instanceof RegExp ||
                typeof right === 'string'))
                right = ""+right;
            this.right = right;
            switch(op) {
                case "==":
                    this.op = SymbolicStringPredicate.EQ;
                    break;
                case "!=":
                    this.op = SymbolicStringPredicate.NE;
                    break;
                case "regexin":
                    this.op = SymbolicStringPredicate.IN;
                    break;
                case "regexnotin":
                    this.op = SymbolicStringPredicate.NOTIN;
                    break;

            }
        }
    }

    SymbolicStringPredicate.EQ = 0;
    SymbolicStringPredicate.NE = 1;
    SymbolicStringPredicate.IN = 2;
    SymbolicStringPredicate.NOTIN = 3;

    SymbolicStringPredicate.prototype = {
        constructor: SymbolicStringPredicate,

        not: function() {
            var ret = new SymbolicStringPredicate(this);
            switch(this.op) {
                case SymbolicStringPredicate.EQ:
                    ret.op = SymbolicStringPredicate.NE;
                    break;
                case SymbolicStringPredicate.NE:
                    ret.op = SymbolicStringPredicate.EQ;
                    break;
                case SymbolicStringPredicate.IN:
                    ret.op = SymbolicStringPredicate.NOTIN;
                    break;
                case SymbolicStringPredicate.NOTIN:
                    ret.op = SymbolicStringPredicate.IN;
                    break;
            }
            return ret;
        },

        substitute : function(assignments) {
            return this;
        },

        getFormulaString : function(freeVars, mode, assignments) {
            var sb = "", s1, s2, formula, cmd, length1 = 0, length2 = 0, j;
            var classpath = __dirname+"/../../../../jout/production/jalangijava/:"+__dirname+"/../../../../thirdparty/javalib/automaton.jar ";
            s1 = (this.left instanceof SymbolicStringExpression)?this.left.getLength():this.left.length;
            s2 = (this.right instanceof SymbolicStringExpression)?this.right.getLength():this.right.length;

            if (mode === "integer") {
                switch(this.op) {
                    case SymbolicStringPredicate.EQ:
                        if (s1 instanceof SymbolicLinear && s2 instanceof SymbolicLinear) {
                            return s1.subtract(s2).setop("==").getFormulaString(freeVars, mode, assignments);
                        } else if (s1 instanceof SymbolicLinear) {
                            return s1.subtractLong(s2).setop("==").getFormulaString(freeVars, mode, assignments);
                        } else if (s2 instanceof SymbolicLinear) {
                            return s2.subtractLong(s1).setop("==").getFormulaString(freeVars, mode, assignments);
                        } else {
                            throw new Error("Both strings are non symbolic "+this.toString());
                        }
                    case SymbolicStringPredicate.NE:
                        return "TRUE";
                    case SymbolicStringPredicate.IN:
                        cmd = "java -cp " +
                            classpath +
                            "RegexpEncoder " +
                            "length \""+
                            regex_escape(this.right+"")+
                            "\" "+s1+" true";
                        freeVars[s1+""] = true;
                        sb = stdout(cmd);
                        break;
                    case SymbolicStringPredicate.NOTIN:
                        cmd = "java -cp " +
                            classpath +
                            "RegexpEncoder " +
                            "length \""+
                            regex_escape(this.right+"")+
                            "\" "+s1+" false";
                        freeVars[s1+""] = true;
                        sb = stdout(cmd);
                        break;
                }
            } else if (mode === "string") {
                switch(this.op) {
                    case SymbolicStringPredicate.EQ:
                        if (s1 instanceof SymbolicLinear) {
                            length1 = s1.substitute(assignments);
                        } else {
                            length1 = s1;
                        }
                        if (s2 instanceof SymbolicLinear) {
                            length2 = s2.substitute(assignments);
                        } else {
                            length2 = s2;
                        }
                        if (length1 !== length2) {
                            return "FALSE";
                        } else {
                            return getStringEqualityFormula(this.left, this.right, length1, freeVars, assignments);
                        }
                    case SymbolicStringPredicate.NE:
                        if (s1 instanceof SymbolicLinear) {
                            length1 = s1.substitute(assignments);
                        } else {
                            length1 = s1;
                        }
                        if (s2 instanceof SymbolicLinear) {
                            length2 = s2.substitute(assignments);
                        } else {
                            length2 = s2;
                        }
                        if (length1 !== length2) {
                            return "TRUE";
                        } else {
                            return "(NOT "+getStringEqualityFormula(this.left, this.right, length1, freeVars, assignments)+")";
                        }
                    case SymbolicStringPredicate.IN:
                        length1 = s1.symbolic.substitute(assignments);
                        cmd = "java -cp " +
                            classpath +
                            "RegexpEncoder content \""+
                            regex_escape(this.right+"")+
                            "\" "+
                            this.left+
                            "__ "+length1;
                        for(j=0; j<length1; j++) {
                            freeVars[this.left+"__"+j] = true;
                        }
                        sb = stdout(cmd);
                        break;
                    case SymbolicStringPredicate.NOTIN:
                        length1 = s1.symbolic.substitute(assignments);
                        cmd = "java -cp " +
                            classpath +
                            "RegexpEncoder content \""+
                            "~("+regex_escape(this.right+"")+
                            ")\" "+
                            this.left+
                            "__ "+length1;
                        for(j=0; j<length1; j++) {
                            freeVars[this.left+"__"+j] = true;
                        }
                        sb = stdout(cmd);
                        break;
                }

            }

            return sb;
        },




        toString: function() {
            switch(this.op) {
                case SymbolicStringPredicate.EQ:
                    return this.left+" == " + this.right;
                case SymbolicStringPredicate.NE:
                    return this.left+" != " + this.right;
                case SymbolicStringPredicate.IN:
                    return this.left+" regexin " + this.right;
                case SymbolicStringPredicate.NOTIN:
                    return this.left+" regexnotin " + this.right;
            }
        },

        type: require('../concolic/Symbolic')
    };

    module.exports = SymbolicStringPredicate;
}(module));
