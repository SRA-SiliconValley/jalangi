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

    function SymbolicEngine(executionIndex) {

        if (!(this instanceof SymbolicEngine)) {
            return new SymbolicEngine();
        }

        var MAX_STRING_LENGTH = 30;
        var ConcolicValue = require('./../../ConcolicValue');
        var FileLineReader = require('./../../utils/FileLineReader');
        var SymbolicBool = require('./SymbolicBool');
        var SymbolicLinear = require('./SymbolicLinear');
        var SymbolicStringExpression = require('./SymbolicStringExpression');
        var SymbolicStringPredicate = require('./SymbolicStringPredicate');
        var ToStringPredicate = require('./ToStringPredicate');
        var FromCharCodePredicate = require('./FromCharCodePredicate');
        var SymbolicType = require('./SymbolicType');
        var SymbolicObject = require('./SymbolicObject');
        var SymbolicUndefined = require('./SymbolicUndefined');
        var SolverEngine = require('./SolverEngine');
        var Symbolic = require('./Symbolic');
        var solver = new SolverEngine();


        var pathConstraint = [];
        pathConstraint.count = 0;
        var fs = require('fs');

        function makePredicate(left_s) {
            var ret = left_s;
            if (left_s instanceof SymbolicLinear) {
                if (left_s.op === SymbolicLinear.UN) {
                    ret = left_s.setop("!=");
                }
                return ret;
            } else if (left_s instanceof SymbolicStringExpression) {
                ret = new SymbolicStringPredicate("!=", left_s, "");
                return ret;
            } else if (left_s instanceof SymbolicStringPredicate ||
                left_s instanceof SymbolicBool ||
                left_s instanceof SymbolicType ||
                left_s instanceof FromCharCodePredicate ||
                left_s instanceof ToStringPredicate) {
                return ret;
            }
            return undefined;
        }

        this.makeConcolic = function (idx, val, getNextSymbol) {
            var ret, concrete, type, stype, fieldsOrdered, len, i, slength;
            concrete = val[0];
            type = typeof concrete;

            executionIndex.executionIndexCall();
            stype = makeConcolicType(getNextSymbol(true), typeof val[0], val[2], val[3], val[4]);
            if (type === 'string') {
                slength = makeConcolicNumber(getNextSymbol(true), concrete.length);
                ret = makeConcolicString(idx, concrete, slength, stype);
            } else if (type === 'number' || type === 'boolean') {
                ret = makeConcolicNumber(idx, concrete, stype);
            } else if (type === 'object' || type === 'function') {
                ret = makeConcolicObject(idx, concrete, stype);
                fieldsOrdered = val[1];
                len = fieldsOrdered.length;
                for (i = 0; i < len; i++) {
                    ret.symbolic.addField(fieldsOrdered[i]);
                }
            } else if (type === "undefined") {
                ret = makeConcolicUndefined(idx, concrete, stype);
            }
            ret.pathConstraintSize = pathConstraint.length;
            installConstraint(ret.symbolic.stype, true, true);
            return ret;
        }

        this.makeConcolicPost = function () {
            executionIndex.executionIndexReturn();
        }


        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        function makeConcolicNumber(idx, val, stype) {
            return new ConcolicValue(val, new SymbolicLinear(idx, stype));
        }

        function makeConcolicObject(idx, val, stype) {
            return new ConcolicValue(val, new SymbolicObject(idx, stype));
        }

        function makeConcolicUndefined(idx, val, stype) {
            return new ConcolicValue(val, new SymbolicUndefined(idx, stype));
        }

        function makeConcolicType(idx, val, possibleTypes, currentTypeIdx, isFrozen) {
            return new ConcolicValue(val, new SymbolicType(idx, possibleTypes, currentTypeIdx, isFrozen));
        }

        function makeConcolicString(idx, val, slength, stype) {
            installAxiom(J$.B(0, ">=", slength, 0));
            if (idx.indexOf("x") === 0) {
                installAxiom(J$.B(0, "<=", slength, MAX_STRING_LENGTH));  // add this axiom only for input symbolic values
            }
            return new ConcolicValue(val, new SymbolicStringExpression(idx, slength, stype));
        }

        this.getFieldPre = function (iid, base, offset) {
            var base_s = getSymbolic(base);
            if (base_s) {
                addType(base_s, "object");
            }
        }

        this.getField = function (iid, base, offset, result_c) {
            var ret, base_s = this.getSymbolic(base), base_c = this.getConcrete(base);
            if (base_s && base_s.getField) {
                ret = base_s.getField(offset);
            }
            if (base_s instanceof SymbolicObject && !(offset in base_c)) {
                base_s.addField(offset);
                ret = J$.readInput(undefined, false, base_s.getSymbolForField(offset));
                base_c[offset] = ret;
                return ret;
            } else if (getSymbolic(offset)) {
                if (!sfuns) {
                    sfuns = require('./SymbolicFunctions_jalangi_');
                }
                ret = sfuns.object_getField.apply(undefined, [result_c, base, offset]);
            }
            if (ret !== undefined) {
                return new ConcolicValue(result_c, ret.symbolic);
            } else {
                return result_c;
            }
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            var f_s = this.getSymbolic(f);
            if (f_s) {
                addType(f_s, "function");
            }
        }

        function regex_escape(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }

        function regexp_test(str) {
            // this is a regexp object
            var concrete = J$.getConcrete(str);
            var newSym;

            if (str !== concrete && str.symbolic && str.symbolic.isCompound && str.symbolic.isCompound()) {
                newSym = J$.readInput(concrete, true);
                J$.addAxiom(J$.B(0, "==", newSym, str));  // installing an axiom
            } else {
                newSym = str;
            }
            return J$.B(0, "regexin", newSym, this);
        }

        function string_fromCharCode(result) {
            var ints = [];
            var i, len = arguments.length, flag = false;
            ;
            for (i = 1; i < len; i++) {
                if (getSymbolic(arguments[i]) instanceof SymbolicLinear) {
                    flag = true;
                    ints[i - 1] = getSymbolic(arguments[i]);
                } else {
                    ints[i - 1] = getConcrete(arguments[i]);
                }
            }
            if (!flag) {
                return result;
            }
            var newSym = J$.readInput(getConcrete(result), true);
            J$.addAxiom(new ConcolicValue(true, new FromCharCodePredicate(ints, getSymbolic(newSym))));
            return newSym;
        }


//        function number_parseInt(result, str) {
//            var concrete = J$.getConcrete(str);
//            var newSym;
//
//            if (str !== concrete) {
//                newSym = J$.readInput(result, true);
//                installAxiom(new ConcolicValue(true,new ToStringPredicate(getSymbolic(newSym), getSymbolic(str))));
//                return newSym;
//            } else {
//                return result;
//            }
//        }

        function string_indexOf(result, str) {
            var first, tmp1, tmp2;
            str = J$.getConcrete(str);
            first = J$.getConcrete(this);

            if (this !== first) {
                var reg = new RegExp(".*" + regex_escape(str) + ".*");
                var ret = J$.readInput(result, true);

                var S1 = J$.readInput("", true);
                var S2 = J$.readInput("", true);
                tmp1 = J$.B(0, "+", S1, str);
                tmp1 = J$.B(0, "+", tmp1, S2);
                tmp1 = J$.B(0, "==", this, tmp1);
                tmp2 = J$.B(0, "==", ret, J$.G(0, S1, "length", true));
                tmp1 = J$.B(0, "&&", tmp2, tmp1);
                tmp2 = regexp_test.call(reg, S1);
                tmp2 = J$.U(0, "!", tmp2);
                var trueF = J$.B(0, "&&", tmp1, tmp2);
                tmp1 = J$.B(0, "==", ret, -1);
                tmp2 = regexp_test.call(reg, this);
                tmp2 = J$.U(0, "!", tmp2);
                var falseF = J$.B(0, "&&", tmp1, tmp2);
                tmp1 = J$.B(0, "||", trueF, falseF);
                J$.addAxiom(tmp1);
                return ret;
            }
            return result;
        }

        function string_substring(result, start, end) {
            var first, tmp1, tmp2;
            first = J$.getConcrete(this);

            // assuming start >= 0 and end >= start and end === undefined or end <= this.length

            if (this !== first) {
                if (end === undefined) {
                    end = J$.G(0, this, "length", true);
                }
                var ret = J$.readInput(result, true);
                var S1 = J$.readInput("", true);
                var S2 = J$.readInput("", true);

                tmp2 = J$.B(0, "<=", start, end);
                tmp1 = J$.B(0, "+", S1, ret);
                tmp1 = J$.B(0, "+", tmp1, S2);
                tmp1 = J$.B(0, "===", this, tmp1); // this === S1 + ret + S2
                tmp1 = J$.B(0, "&&", tmp2, tmp1);

                tmp2 = J$.B(0, "===", start, J$.G(0, S1, "length", true)); // start === S1.length
                tmp1 = J$.B(0, "&&", tmp2, tmp1);

                tmp2 = J$.B(0, "-", end, start);
                tmp2 = J$.B(0, "===", tmp2, J$.G(0, ret, "length", true));

                tmp1 = J$.B(0, "&&", tmp1, tmp2);
                J$.addAxiom(tmp1);
                return ret;
            }
            return result;
        }


        function string_lastIndexOf(result, str) {
            var first, tmp1, tmp2;
            str = J$.getConcrete(str);
            first = J$.getConcrete(this);

            if (this !== first) {
                var reg = new RegExp(".*" + regex_escape(str) + ".*");
                var ret = J$.readInput(result, true);

                var S1 = J$.readInput("", true);
                var S2 = J$.readInput("", true);
                tmp1 = J$.B(0, "+", S1, str);
                tmp1 = J$.B(0, "+", tmp1, S2);
                tmp1 = J$.B(0, "==", this, tmp1);
                tmp2 = J$.B(0, "==", ret, J$.G(0, S1, "length", true));
                tmp1 = J$.B(0, "&&", tmp2, tmp1);
                tmp2 = regexp_test.call(reg, S2);
                tmp2 = J$.U(0, "!", tmp2);
                var trueF = J$.B(0, "&&", tmp1, tmp2);
                tmp1 = J$.B(0, "==", ret, -1);
                tmp2 = regexp_test.call(reg, this);
                tmp2 = J$.U(0, "!", tmp2);
                var falseF = J$.B(0, "&&", tmp1, tmp2);
                tmp1 = J$.B(0, "||", trueF, falseF);
                J$.addAxiom(tmp1);
                return ret;
            }
            return result;
        }

        function concat(val, a) {
            return [val].concat(Array.prototype.slice.call(a, 0));
        };


        var sfuns;
        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            f = getConcrete(f);
            if (!sfuns) {
                sfuns = require('./SymbolicFunctions_jalangi_');
            }
            var isSymbolic = false;
            if (getSymbolic(base)) {
                isSymbolic = true;
            }
            var i, len = args.length;
            for (i = 0; i < len; ++i) {
                if (getSymbolic(args[i])) {
                    isSymbolic = true;
                    break;
                }
            }
            if (!isSymbolic) {
                return val;
            }
            if (f === RegExp.prototype.test) {
                return regexp_test.apply(base, args);
            } else if (f === String.fromCharCode) {
                return string_fromCharCode.apply(base, concat(val, args));
            } else if (f === String.prototype.indexOf) {
                return sfuns.string_indexOf.apply(base, concat(val, args));
//                return string_indexOf.apply(base, concat(val, args));
            } else if (f === String.prototype.charCodeAt) {
                return sfuns.string_charCodeAt.apply(base, concat(val, args));
//                return string_indexOf.apply(base, concat(val, args));
            } else if (f === String.prototype.charAt) {
                return sfuns.string_charAt.apply(base, concat(val, args));
//                return string_indexOf.apply(base, concat(val, args));
            } else if (f === String.prototype.lastIndexOf) {
                return sfuns.string_lastIndexOf.apply(base, concat(val, args));
//                return string_lastIndexOf.apply(base, concat(val, args));
            } else if (f === String.prototype.substring) {
                return sfuns.string_substring.apply(base, concat(val, args));
//                return string_substring.apply(base, concat(val, args));
            } else if (f === String.prototype.substr) {
                return sfuns.string_substr.apply(base, concat(val, args));
            } else if (f === parseInt) {
                return sfuns.builtin_parseInt.apply(base, concat(val, args));
            }
            return val;
        }

        this.putFieldPre = function (iid, base, offset, val) {
            var base_s = getSymbolic(base);
            if (base_s) {
                addType(base_s, "object");
            }
            return val;
        }

        this.putField = function (iid, base, offset, val) {
            var base_s = this.getSymbolic(base);
            if (base_s && base_s.putField) {
                base_s.putField(offset, val);
            }
            return val;
        }

        function addType(_s, type) {
            if (_s && _s.stype) {
                _s.stype.symbolic.addType(type);
            }
        }

        function isSymbolicString(s) {
            return s && s instanceof SymbolicStringExpression;
        }

        function isSymbolicNumber(s) {
            return s && s instanceof SymbolicLinear;
        }

        function isSymbolicObject(s) {
            return s && s instanceof SymbolicObject;
        }

        function isSymbolicType(s) {
            return s && s instanceof SymbolicType;
        }

        function isSymbolicUndefined(s) {
            return s && s instanceof SymbolicUndefined;
        }

        function symbolicIntToString(num) {
            var concrete = getConcrete(num);
            var newSym = J$.readInput("" + concrete, true);
            installAxiom(new ConcolicValue(true, new ToStringPredicate(getSymbolic(num), getSymbolic(newSym))));
            return newSym;
        }

        function symbolicStringToInt(str) {
            var concrete = getConcrete(str);
            var newSym = J$.readInput(+concrete, true);
            installAxiom(new ConcolicValue(true, new ToStringPredicate(getSymbolic(newSym), getSymbolic(str))));
            return newSym;
        }


        this.binary = function (iid, op, left, right, result_c) {
            // needs to be changed based on analysis
            var ret;
            var left_c = this.getConcrete(left),
                left_s = this.getSymbolic(left),
                right_c = this.getConcrete(right),
                right_s = this.getSymbolic(right);

            var type = typeof result_c;

            switch (op) {
                case "+":
                case "<":
                case ">":
                case "<=":
                case ">=":
                    if (typeof right_c === "number" || typeof right_c === "string") {
                        addType(left_s, typeof right_c);
                    } else {
                        addType(left_s, "number");
                        addType(left_s, "string");
                    }
                    if (typeof left_c === "number" || typeof left_c === "string") {
                        addType(right_s, typeof left_c);
                    } else {
                        addType(right_s, "number");
                        addType(right_s, "string");
                    }
                    break;
                case "-":
                case "*":
                case "/":
                case "%":
                case "<<":
                case ">>":
                case ">>>":
                case "&":
                case "|":
                case "^":
                    addType(left_s, "number");
                    addType(right_s, "number");
                    break;
                case "==":
                case "!=":
                case "===":
                case "!==":
                    if (right_c === null) {
                        addType(left_s, "null");
                        addType(left_s, "object");
                    } else {
                        addType(left_s, typeof right_c);
                    }
                    if (left_c === null) {
                        addType(left_s, "null");
                        addType(left_s, "object");
                    } else {
                        addType(right_s, typeof left_c);
                    }
                    break;
                case "||":
                case "&&":
                    addType(left_s, "boolean");
                    addType(right_s, "boolean");
                    break;
                case "instanceof":
                    addType(left_s, right_c);
                    break;
                case "in":
                    addType(right_s, "object");
                    break;
                case "regexin":
                    addType(left_s, "string");
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }


            if (op === "+") {
                if (type === 'string') {
                    if (isSymbolicNumber(left_s)) {
                        left = symbolicIntToString(left);
                        left_s = getSymbolic(left);
                        left_c = getConcrete(left);
                    }
                    if (isSymbolicNumber(right_s)) {
                        right = symbolicIntToString(right);
                        right_s = getSymbolic(right);
                        right_c = getConcrete(right);
                    }
                    if (isSymbolicString(left_s) && isSymbolicString(right_s)) {
                        ret = left_s.concat(right_s);
                    } else if (isSymbolicString(left_s)) {
                        ret = left_s.concatStr(right_c);
                    } else if (isSymbolicString(right_s)) {
                        ret = right_s.concatToStr(left_c);
                    }
                } else if (type === 'number') {
                    if (isSymbolicString(left_s)) {
                        left = symbolicStringToInt(left);
                        left_s = getSymbolic(left);
                        left_c = getConcrete(left);
                    }
                    if (isSymbolicString(right_s)) {
                        right = symbolicStringToInt(right);
                        right_s = getSymbolic(right);
                        right_c = getConcrete(right);
                    }
                    if (isSymbolicNumber(left_s) && isSymbolicNumber(right_s)) {
                        ret = left_s.add(right_s);
                    } else if (isSymbolicNumber(left_s)) {
                        right_c = right_c + 0;
                        if (right_c == right_c)
                            ret = left_s.addLong(right_c);
                    } else if (isSymbolicNumber(right_s)) {
                        left_c = left_c + 0;
                        if (left_c == left_c)
                            ret = right_s.addLong(left_c);
                    }
                }
            } else if (op === "-") {
                if (type === 'number') {
                    if (isSymbolicString(left_s)) {
                        left = symbolicStringToInt(left);
                        left_s = getSymbolic(left);
                        left_c = getConcrete(left);
                    }
                    if (isSymbolicString(right_s)) {
                        right = symbolicStringToInt(right);
                        right_s = getSymbolic(right);
                        right_c = getConcrete(right);
                    }
                    if (isSymbolicNumber(left_s) && isSymbolicNumber(right_s)) {
                        ret = left_s.subtract(right_s);
                    } else if (isSymbolicNumber(left_s)) {
                        right_c = right_c + 0;
                        if (right_c == right_c)
                            ret = left_s.subtractLong(right_c);
                    } else if (isSymbolicNumber(right_s)) {
                        left_c = left_c + 0;
                        if (left_c == left_c)
                            ret = right_s.subtractFrom(left_c);
                    }
                }
            } else if (op === "<" || op === ">" || op === "<=" || op === ">=" || op === "==" || op === "!=" || op === "===" || op === "!==") {
                if (op === "===" || op === "!==") {
                    op = op.substring(0, 2);
                }
                if (op === "==" || op === "!=") {
                    if (isSymbolicString(left_s) && isSymbolicString(right_s)) {
                        ret = new SymbolicStringPredicate(op, left_s, right_s);
                    } else if (isSymbolicString(left_s)) {
                        ret = new SymbolicStringPredicate(op, left_s, right_c + "");
                    } else if (isSymbolicString(right_s)) {
                        ret = new SymbolicStringPredicate(op, left_c + "", right_s);
                    }
                    if (isSymbolicType(left_s)) {
                        left_s.addType(right_c + "");
                    }
                    if (isSymbolicType(right_s)) {
                        left_s.addType(left_c + "");
                    }
                }
                if (isSymbolicNumber(left_s) && isSymbolicNumber(right_s)) {
                    if (left_s.op !== SymbolicLinear.UN) {
                        if (right_c)
                            ret = left_s;
                        else
                            ret = left_s.not();
                    } else if (right_s.op !== SymbolicLinear.UN) {
                        if (left_c)
                            ret = right_s;
                        else
                            ret = right_s.not();
                    } else {
                        ret = left_s.subtract(right_s);
                    }
                } else if (isSymbolicNumber(left_s) && typeof right_c === 'number') {
                    if (left_s.op !== SymbolicLinear.UN)
                        if (right_c)
                            ret = left_s;
                        else
                            ret = left_s.not();
                    else
                        ret = left_s.subtractLong(right_c);
                } else if (isSymbolicNumber(right_s) && typeof left_c === 'number') {
                    if (right_s.op !== SymbolicLinear.UN)
                        if (left_c)
                            ret = right_s;
                        else
                            ret = right_s.not();
                    else
                        ret = right_s.subtractFrom(left_c);
                }
                if (isSymbolicNumber(ret)) {
                    ret = ret.setop(op);
                }

            } else if (op === "*" && type === 'number') {
                if (isSymbolicString(left_s)) {
                    left = symbolicStringToInt(left);
                    left_s = getSymbolic(left);
                    left_c = getConcrete(left);
                }
                if (isSymbolicString(right_s)) {
                    right = symbolicStringToInt(right);
                    right_s = getSymbolic(right);
                    right_c = getConcrete(right);
                }
                if (isSymbolicNumber(left_s) && isSymbolicNumber(right_s)) {
                    ret = right_s.multiply(left_c);
                } else if (isSymbolicNumber(left_s) && typeof right_c === 'number') {
                    ret = left_s.multiply(right_c);
                } else if (isSymbolicNumber(right_s) && typeof left_c === 'number') {
                    ret = right_s.multiply(left_c);
                }
            } else if (op === "&&" || op === "||") {
                if (left_s && right_s) {
                    ret = new SymbolicBool(op, makePredicate(left_s), makePredicate(right_s));
                } else if (left_s) {
                    if (op === "&&" && right_c) {
                        ret = left_s;
                    }
                    if (op === "||" && !right_c) {
                        ret = left_s;
                    }
                } else if (right_s) {
                    if (op === "&&" && left_c) {
                        ret = right_s;
                    }
                    if (op === "||" && !left_c) {
                        ret = right_s;
                    }
                }
            } else if (op === "regexin") {
                if (isSymbolicString(left_s)) {
                    ret = new SymbolicStringPredicate("regexin", left_s, right_c);
                }
            } else if (op === '|') {
                if (isSymbolicString(left_s)) {
                    left = symbolicStringToInt(left);
                    left_s = getSymbolic(left);
                    left_c = getConcrete(left);
                }
                if (isSymbolicString(right_s)) {
                    right = symbolicStringToInt(right);
                    right_s = getSymbolic(right);
                    right_c = getConcrete(right);
                }
                if (isSymbolicNumber(left_s) && typeof right_c === 'number' && right_c === 0) {
                    ret = left_s;
                } else if (isSymbolicNumber(right_s) && typeof left_c === 'number' && left_c === 0) {
                    ret = right_s;
                }
            }
            //var ret = (left_s?left_s:left_c) + " " + op + " " + (right_s?right_s:right_c);
            if (ret && ret.type === Symbolic) {
                return new ConcolicValue(result_c, ret);
            } else {
                return result_c;
            }
        }

        this.unary = function (iid, op, left, result_c) {
            // needs to be changed based on analysis
            var ret,
                left_c = this.getConcrete(left),
                left_s = this.getSymbolic(left);

            if (left_s) {
                switch (op) {
                    case "+":
                    case "-":
                    case "~":
                        addType(left_s, "number");
                        break;
                    case "!":
                        addType(left_s, "boolean");
                        break;
                    case "typeof":
                        // @todo generate type constraint
                        break;
                    default:
                        throw new Error(op + " at " + iid + " not found");
                        break;
                }


                if (op === "-") {
                    if (isSymbolicString(left_s)) {
                        left = symbolicStringToInt(left);
                        left_s = getSymbolic(left);
                        left_c = getConcrete(left);
                    }
                    ret = left_s.negate();
                } else if (op === "!") {
                    ret = makePredicate(left_s).not();
                } else if (op === "+") {
                    if (isSymbolicString(left_s)) {
                        left = symbolicStringToInt(left);
                        left_s = getSymbolic(left);
                        left_c = getConcrete(left);
                    }
                    ret = left_s;
                } else if (op === "typeof") {
                    if (left_s && left_s.stype) {
                        ret = left_s.stype.symbolic;
                    }
                }
            }
            if (ret && ret.type === Symbolic) {
                return new ConcolicValue(result_c, ret);
            } else {
                return result_c;
            }
//        var ret = " " + op + " " + (left_s?left_s:left_c);
//        return ret;
        }

        this.conditional = function (iid, left, result) {
            // needs to be changed based on analysis
            var left_s = this.getSymbolic(left);
            if (left_s) {
                addType(left_s, "boolean");
            }
            installConstraint(left, result);
            return left;
//        var left_s = this.getSymbolic(left);
//        var ret;
//
//        if (left_s) {
//            ret = makePredicate(left_s);
//            pathConstraint.push([executionIndex.executionIndexGetIndex(), result?ret:ret.not()]);
//        }
//        //console.log("------------------ constraint: "+left_s+" is "+(!!left_c));
//        return left;
        }

        function installAxiom(c) {
            if (c === "begin") {
                pathConstraint.push("begin");
                pathConstraint.count++;
            } else if (c === "and" || c === "or") {
                c = (c === 'and') ? "&&" : "||";
                var ret, i, start = -1, len;
                pathConstraint.count--;
                len = pathConstraint.length;
                for (i = len - 1; i >= 0; i--) {
                    if (pathConstraint[i] === "begin") {
                        start = i + 1;
                        break;
                    }
                }
                if (start === -1) {
                    throw new Error("J$.addAxiom('begin') not found");
                }
                if (start === len) {
                    return;
                }

                i = start;
                var c1 = pathConstraint[i];
                c1 = c1[1];
                var c2;
                while (i < len - 1) {
                    i++;
                    c2 = pathConstraint[i];
                    c2 = c2[1];
                    c1 = new SymbolicBool(c, c1, c2);
                }
                pathConstraint.splice(start - 1, len - start + 1);
                pathConstraint.push([null, c1]);
            } else if (c === 'ignore') {
                pathConstraint.pop();
            } else {
                var s = getSymbolic(c);
                if (s) {
                    s = makePredicate(s);
                }

                if (s) {
                    pathConstraint.push([null, s]);
                } else if (pathConstraint.count > 0) {
                    if (getConcrete(c)) {
                        pathConstraint.push([null, SymbolicBool.true]);
                    } else {
                        pathConstraint.push([null, SymbolicBool.false]);
                    }
                }
            }
        }

        this.installAxiom = installAxiom;

        function installConstraint(c, result, doAdd) {
            if (pathConstraint.count > 0 && !doAdd)
                return;
            var s = getSymbolic(c);
            if (s) {
                s = makePredicate(s);
            }
            if (s) {
                pathConstraint.push([executionIndex.executionIndexGetIndex(), result ? s : s.not()]);
            }
        }

        this.endExecution = function () {
            solver.generateInputs(pathConstraint);
        }

    }

//----------------------------------------- End symbolic execution and constraint generation -------------------

    module.exports = SymbolicEngine;
}(module));
