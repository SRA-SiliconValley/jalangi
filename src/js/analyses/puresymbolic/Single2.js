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

(function(sandbox) {

    var PredValues = require('./PredValues');
    var EVAL_ORG = eval;

    var PREFIX1 = "J$";
    var SPECIAL_PROP2 = "*"+PREFIX1+"I*";
    var  N_LOG_FUNCTION_LIT = 12;

    //-------------------------------- End constants ---------------------------------


    //-------------------------------------- Symbolic functions -----------------------------------------------------------

    var Symbolic = require('./../concolic/Symbolic');
    var SymbolicBool = require('./../concolic/SymbolicBool');
    var SymbolicLinear = require('./../concolic/SymbolicLinear');
    var SymbolicStringExpression = require('./SymbolicStringExpression');
    var SymbolicStringPredicate = require('./SymbolicStringPredicate');
    var ToStringPredicate = require('./ToStringPredicate');
    var FromCharCodePredicate = require('./FromCharCodePredicate');
    var SymbolicAnyVar = require('./SymbolicAnyVar');
    var SolverEngine = require('./SolverEngine');
    var solver = new SolverEngine();
    var pc = require('./PathConstraint');


    //---------------------------- Utility functions -------------------------------

    function getPC() {
        return pc;
    }


    function isSymbolic(val) {
        if (val === undefined || val === null) {
            return false;
        }
        return val.type === Symbolic;
    }

    function isSymbolicString(s) {
        return s instanceof SymbolicStringExpression;
    }

    function isSymbolicNumber(s) {
        return s instanceof SymbolicLinear;
    }

    function isSymbolicBool(s) {
        return s instanceof SymbolicBool;
    }

    var MAX_STRING_LENGTH = 30;

    function makeSymbolic(idx, val) {
        var ret, type;
        type = typeof val;

        if (type === 'string') {
            ret = makeSymbolicString(idx);
        } else if (type === 'number' || type === 'boolean'){
            ret = makeSymbolicNumber(idx);
        } else {
            throw new Error("Cannot make "+val+" of type "+(typeof val) + " symbolic");
        }
        return ret;
    }

    function makeSymbolicNumber(idx) {
        return new SymbolicLinear(idx);
    }

    function makeSymbolicString(idx) {
        var ret = new SymbolicStringExpression(idx);
        J$.addAxiom(B(0, ">=", ret.getLength(), 0));
        J$.addAxiom(B(0, "<=", ret.getLength(), MAX_STRING_LENGTH));
        return ret;
    }


    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function slice(a, start) {
        return Array.prototype.slice.call(a, start || 0);
    }

    function printValueForTesting(loc, iid, val) {
        return;
        var type = typeof val;
        if (type !== 'object' && type !== 'function') {
            console.log(loc+":"+iid+":"+type+":"+val);
        }
        if (val===null) {
            console.log(loc+":"+iid+":"+type+":"+val);
        }
    }


    //---------------------------- End utility functions -------------------------------


    // --------------------------- Treat undefined as input ----------------------------
    function wrapUndefined(val, isUndefinedLiteral) {
        if (sandbox.treatUndefinedAsInput && val === undefined) {
            return new SymbolicAnyVar(isUndefinedLiteral);
        }
        return val;
    }

    function initUndefinedFunction(f) {
        if (sandbox.treatUndefinedAsInput && f instanceof SymbolicAnyVar) {
            if (!f.isInitialized) {
                f.initialize(function(){});
            }
            f = f.value;
        }
        return f;
    }

    function initUndefinedForBaseOfG(base, offset) {
        var tmp;
        if (sandbox.treatUndefinedAsInput && base instanceof SymbolicAnyVar) {
            if (!base.isInitialized) {
                if (offset === "indexOf" ||
                    offset === "lastIndexOf" ||
                    offset === "substring" ||
                    offset === "substr" ||
                    offset === "charCodeAt" ||
                    offset === "charAt" ||
                    offset === "replace" ||
                    offset === "toLocaleLowerCase" ||
                    offset === "toLocaleUpperCase" ||
                    offset === "toLowerCase" ||
                    offset === "toUpperCase" ||
                    offset === "match" ||
                    offset === "search" ||
                    offset === "replace" ||
                    offset === "trim" ||
                    offset === "split" ||
                    offset === "localeCompare") {
                    tmp = "";
                } else if (offset === "join" ||
                    offset === "push" ||
                    offset === "pop" ||
                    offset === "shift" ||
                    offset === "unshift" ||
                    offset === "slice" ||
                    offset === "splice" ||
                    offset === "sort" ||
                    offset === "reverse" ||
                    typeof offset === 'number') {
                    tmp = [];
                } else {
                    tmp = {};
                }
                base.initialize(tmp);
            }
            base = base.value;
        }
        return base;
    }

    function initUndefinedOffset(offset) {
        if (sandbox.treatUndefinedAsInput && offset instanceof SymbolicAnyVar) {
            if (!offset.isInitialized) {
                offset.initialize("something");
            }
            offset = offset.value;
        }
        return offset;
    }

    function initUndefinedForBaseOfP(base, offset) {
        var tmp;
        if (sandbox.treatUndefinedAsInput && base instanceof SymbolicAnyVar) {
            if (!base.isInitialized) {
                if (typeof offset === 'number') {
                    tmp = [];
                } else {
                    tmp = {};
                }
                base.initialize(tmp);
            }
            base = base.value;
        }
        return base;
    }

    function initUndefinedForBinary(op, left, right) {
        if (sandbox.treatUndefinedAsInput && left instanceof SymbolicAnyVar) {
            if (!left.isInitialized) {
                if (op === '-' ||
                    op === '*' ||
                    op === '/' ||
                    op === '%' ||
                    op === '<<' ||
                    op === '>>' ||
                    op === '>>>' ||
                    op === '|' ||
                    op === '&' ||
                    op === '^' ||
                    op === '<' ||
                    op === '>' ||
                    op === '<=' ||
                    op === '>='
                    ){
                    left.initialize(0);
                } else if (op === '&&' ||
                    op === '||' ) {
                    left.initialize(false);
                } else if (op === '+' ) {
                    if (typeof right === 'string' || isSymbolicString(right)) {
                        left.initialize("");
                    } else {
                        left.initialize(0);
                    }
                } else if (op === '==' ||
                    op === '!=' ||
                    op === '===' ||
                    op === '!==') {
                    if (typeof right === 'string' || isSymbolicString(right)) {
                        left.initialize("");
                    } else if (typeof right === 'number' || isSymbolicNumber(right)) {
                        left.initialize(0);
                    } else if (typeof right === 'boolean' || isSymbolicBool(right)) {
                        left.initialize(false);
                    } else if (typeof right === SymbolicAnyVar) {
                        if (right.isInitialized) {
                            left.initialize(right.value);
                        } else {
                            left.initialize(function(){});
                        }
                    } else {
                        left.initialize(function(){});
                    }
                } else {
                    left.initialize(function(){});
                }
            }
            left = left.value;
        }
        return left;
    }

    function initUndefinedForUnary(op, left) {
        if (sandbox.treatUndefinedAsInput && left instanceof SymbolicAnyVar) {
            if (!left.isInitialized) {
                if (op === '-' ||
                    op === '+' ||
                    op === '~'
                    ){
                    left.initialize(0);
                } else if (op === '!') {
                    left.initialize(false);
                } else {
                    left.initialize(function(){});
                }
            }
            left = left.value;
        }
        return left;
    }

    function initUndefinedCondition(left) {
        if (sandbox.treatUndefinedAsInput && left instanceof SymbolicAnyVar) {
            if (!left.isInitialized) {
                left.initialize(false);
            }
            left = left.value;
        }
        return left;
    }

    function initUndefinedNumber(left) {
        if (sandbox.treatUndefinedAsInput && left instanceof SymbolicAnyVar) {
            if (!left.isInitialized) {
                left.initialize(0);
            }
            left = left.value;
        }
        return left;
    }

    function initUndefinedString(left) {
        if (sandbox.treatUndefinedAsInput && left instanceof SymbolicAnyVar) {
            if (!left.isInitialized) {
                left.initialize("");
            }
            left = left.value;
        }
        return left;
    }

    // --------------------------- End Treat undefined as input ----------------------------


    //----------------------------------- Begin concolic execution ---------------------------------

    function create_concrete_invoke(f) {
        return function() {
            var len = arguments.length;
            for (var i = 0; i<len; i++) {
                arguments[i] = pc.concretize(initUndefinedNumber(getSingle(arguments[i])));
            }
            return f.apply(pc.concretize(initUndefinedString(getSingle(this))),arguments);
        }
    }

    function create_concrete_invoke_cons(f) {
        return function() {
            var len = arguments.length;
            for (var i = 0; i<len; i++) {
                arguments[i] = pc.concretize(initUndefinedNumber(getSingle(arguments[i])));
            }
            return f.apply(this, arguments);
        }
    }

    function string_fromCharCode () {
        var ints = [];
        var i, len=arguments.length, flag = false;;
        for (i=0; i < len; i++) {
            if (arguments[i] instanceof SymbolicLinear) {
                flag = true;
            }
            ints[i] = arguments[i];

        }
        if (!flag) {
            return String.fromCharCode.apply(this, arguments);
        }
        var newSym = J$.readInput("", true);
        J$.addAxiom(new FromCharCodePredicate(ints, newSym));
        return newSym;
    }

    function regexp_test (str) {
        // this is a regexp object
        var newSym;

//        if (isSymbolic(str) && str.isCompound && str.isCompound()) {
        newSym = J$.readInput("",true);
        J$.addAxiom(J$.B(0,"==",newSym,str));
//        } else {
//            newSym = str;
//        }
        return J$.B(0, "regexin", newSym, this);
    }

    function getSingle(f) {
        if (f instanceof PredValues) {
            return f.values[0].value;
        } else {
            return f;
        }
    }

    var sfuns;

    function getSymbolicFunctionToInvoke (f, isConstructor) {
        if (f === Array ||
            f === Error ||
            f === String ||
            f === Number ||
            f === Boolean ||
            f === RegExp) {
            return create_concrete_invoke_cons(f);
        } else if (f === RegExp.prototype.test) {
            return regexp_test;
        } else if (f === String.fromCharCode) {
            return string_fromCharCode;
        } else if (f === J$.addAxiom ||
            f === J$.readInput) {
            return f;
        } else if (f === Math.abs ||
            f === Math.acos ||
            f === Math.asin ||
            f === Math.atan ||
            f === Math.atan2 ||
            f === Math.ceil ||
            f === Math.cos ||
            f === Math.exp ||
            f === Math.floor ||
            f === Math.log ||
            f === Math.max ||
            f === Math.min ||
            f === Math.pow ||
            f === Math.round ||
            f === Math.sin ||
            f === Math.sqrt ||
            f === Math.tan ) {
            return create_concrete_invoke(f);
        } else {
            if (!sfuns) {
                sfuns = require('./SymbolicFunctions2_jalangi_')
            }
            if (f === String.prototype.indexOf) {
                return getSingle(sfuns.string_indexOf);
            } else if (f === String.prototype.charCodeAt) {
                return getSingle(sfuns.string_charCodeAt);
            } else if (f === String.prototype.charAt) {
                return getSingle(sfuns.string_charAt);
            } else if (f === String.prototype.lastIndexOf) {
                return getSingle(sfuns.string_lastIndexOf);
            }  else if (f === String.prototype.substring) {
                return getSingle(sfuns.string_substring);
            } else if (f === String.prototype.substr) {
                return getSingle(sfuns.string_substr);
            } else if (f === parseInt) {
                return getSingle(sfuns.builtin_parseInt);
            } else if (f === String.prototype.replace) {
                return create_concrete_invoke(f);
            }
        }
        return null;
    }

    function isNative(f) {
        return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
    }


    function callAsNativeConstructorWithEval(Constructor, args) {
        var a = [];
        for (var i = 0; i < args.length; i++)
            a[i] = 'args[' + i + ']';
        var eval = EVAL_ORG;
        return eval('new Constructor(' + a.join() + ')');
    }

    function callAsNativeConstructor (Constructor, args) {
        if (args.length === 0) {
            return new Constructor();
        }
        if (args.length === 1) {
            return new Constructor(args[0]);
        }
        if (args.length === 2) {
            return new Constructor(args[0], args[1]);
        }
        if (args.length === 3) {
            return new Constructor(args[0], args[1], args[2]);
        }
        if (args.length === 4) {
            return new Constructor(args[0], args[1], args[2], args[3]);
        }
        if (args.length === 5) {
            return new Constructor(args[0], args[1], args[2], args[3], args[4]);
        }
        return callAsNativeConstructorWithEval(Constructor, args);
    }

    function callAsConstructor(Constructor, args) {
        if (isNative(Constructor)) {
            return callAsNativeConstructor(Constructor,args);
        } else {
            var Temp = function(){}, inst, ret;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }


    function invokeEval(base, f, args) {
        return f.call(base,J$.instrumentCode(args[0],false));
    }


    function invokeFun(iid, base, f, args, isConstructor) {
        var g, invoke, val;

        f = initUndefinedFunction(f);
        //console.log("    Calling "+ f.name);
        var f_m = getSymbolicFunctionToInvoke(f, isConstructor);

        invoke = f_m || f === undefined || HOP(f,SPECIAL_PROP2) || typeof f !== "function";
        g = f_m || f ;
        pushSwitchKey();
        try {
            if (g === EVAL_ORG){
                val = invokeEval(base, g, args);
            } else if (invoke) {
                if (isConstructor) {
                    val = callAsConstructor(g, args);
                } else {
                    val = g.apply(base, args);
                }
            }  else {
                val = undefined;
            }
        } finally {
            popSwitchKey();
        }
        //console.log("    Returning "+ f.name);

        return val;
    }


    function F(iid, f, isConstructor) {
        return function() {
            var base = this;
            return invokeFun(iid, base, f, arguments, isConstructor);
        }
    }

    function M(iid, base, offset, isConstructor) {
        return function() {
            var f = G(iid, base, offset);
            return invokeFun(iid, base, f, arguments, isConstructor);
        };
    }

    function Fe(iid, val, dis) {
        returnVal = undefined;
    }

    function Fr(iid) {
    }

    var scriptCount = 0;

    function Se(iid,val) {
        scriptCount++;
    }

    function Sr(iid) {
        scriptCount--;
        if (scriptCount === 0) {
            endExecution();
        }
    }

    function I(val) {
        return val;
    }

    var returnVal;

    function Rt(iid, val) {
        return returnVal = val;
    }

    function Ra() {
        var ret = returnVal;
        returnVal = undefined;
        return ret;
    }

    function T(iid, val, type) {
        if (type === N_LOG_FUNCTION_LIT) {
            pc.concretize(val)[SPECIAL_PROP2] = true;
        }

        return wrapUndefined(val, true);
    }

    function H(iid, val) {
        return val;
    }


    function R(iid, name, val, isGlobal) {
        return single.wrapUndefined(val, !isGlobal);
    }

    function W(iid, name, val, lhs) {
        return val;
    }

    function N(iid, name, val, isArgumentSync) {
        if (isArgumentSync)
            return single.wrapUndefined(val, false);
        return val;
    }


    function A(iid,base,offset,op) {
        var oprnd1 = G(iid,base, offset);
        return function(oprnd2) {
            var val = B(iid, op, oprnd1, oprnd2);
            return P(iid, base, offset, val);
        };
    }

    function G(iid, base, offset) {

        if (offset === SPECIAL_PROP2) {
            return undefined;
        }

        offset = initUndefinedOffset(offset);
        base = initUndefinedForBaseOfG(base, offset);

        offset = pc.concretize(offset);

        if (base instanceof SymbolicStringExpression) {
            if (offset === "length") {
                return base.getLength();
            } else if (offset === "indexOf") {
                return String.prototype.indexOf;
            } else if (offset === "lastIndexOf") {
                return String.prototype.lastIndexOf;
            } else if (offset === "substring") {
                return String.prototype.substring;
            } else if (offset === "substr") {
                return String.prototype.substr;
            } else if (offset === "charCodeAt") {
                return String.prototype.charCodeAt;
            }  else if (offset === "charAt") {
                return String.prototype.charAt;
            } else if (offset === "replace") {
                return String.prototype.replace;
            } else if (offset === "toString") {
                return String.prototype.toString;
            }

        }

        base = pc.concretize(base);

        var ret = base[offset];
        var tmp = wrapUndefined(ret, false);
        if (sandbox.treatUndefinedAsInput && ret === undefined) {
            base[offset] = tmp;
        }
        return tmp;
    }

    function P(iid, base, offset, val) {
        offset = pc.concretize(offset);

        if (offset === SPECIAL_PROP2) {
            return undefined;
        }

        offset = initUndefinedOffset(offset);
        base = initUndefinedForBaseOfP(base, offset);

        base = pc.concretize(base);

        base[offset] = val;
        return val;
    }

    function symbolicIntToString(num) {
        //var c = num.substitute(getFullSolution(sandbox.getCurrentSolution()));
        var newSym = J$.readInput("", true);
        J$.addAxiom(new ToStringPredicate(num, newSym));
        return newSym;
    }

    function symbolicStringToInt(str) {
//        var s = str.substitute(getFullSolution(sandbox.getCurrentSolution()));
        var newSym = J$.readInput(0, true);
        J$.addAxiom(new ToStringPredicate(newSym, str));
        return newSym;
    }

    function binarys(iid, op, left, right) {
        var ret, type;

        if (op === "+") {
            if (isSymbolicString(left) || isSymbolicString(right) || typeof left === 'string' || typeof right === 'string') {
                type = 'string';
            } else if (isSymbolicNumber(left) || isSymbolicNumber(right) || typeof left === 'number' || typeof right === 'number') {
                type = 'number';
            }
            if (type==='string') {
                if (isSymbolicNumber(left)) {
                    left = symbolicIntToString(left);
                }
                if (isSymbolicNumber(right)) {
                    right = symbolicIntToString(right);
                }
                if (isSymbolicString(left) && isSymbolicString(right)) {
                    ret = left.concat(right);
                } else if (isSymbolicString(left)) {
                    ret = left.concatStr(right);
                } else if (isSymbolicString(right)) {
                    ret = right.concatToStr(left);
                }
            } else if (type === 'number') {
                if (isSymbolicString(left)) {
                    left = symbolicStringToInt(left);
                }
                if (isSymbolicString(right)) {
                    right = symbolicStringToInt(right);
                }
                if (isSymbolicNumber(left) && isSymbolicNumber(right)) {
                    ret = left.add(right);
                } else if (isSymbolicNumber(left)) {
                    right = right + 0;
                    if (right == right)
                        ret = left.addLong(right);
                } else if (isSymbolicNumber(right)) {
                    left = left + 0;
                    if (left == left)
                        ret = right.addLong(left);
                }
            }
        } else if (op === "-") {
            if (isSymbolicString(left)) {
                left = symbolicStringToInt(left);
            }
            if (isSymbolicString(right)) {
                right = symbolicStringToInt(right);
            }
            if (isSymbolicNumber(left) && isSymbolicNumber(right)) {
                ret = left.subtract(right);
            } else if (isSymbolicNumber(left)) {
                right = right + 0;
                if (right == right)
                    ret = left.subtractLong(right);
            } else if (isSymbolicNumber(right)) {
                left = left + 0;
                if (left == left)
                    ret = right.subtractFrom(left);
            }
        } else if (op === "<" || op === ">" || op === "<=" || op === ">="  || op === "==" || op === "!="  || op === "==="  || op === "!==") {
            if (isSymbolicNumber(left) && isSymbolicNumber(right)) {
                if (left.op !== SymbolicLinear.UN) {
                    if (right)
                        ret = left;
                    else
                        ret = left.not();
                } else if (right.op !== SymbolicLinear.UN) {
                    if (left)
                        ret = right;
                    else
                        ret = right.not();
                } else {
                    ret = left.subtract(right);
                    if (!isSymbolicNumber(ret)) {
                        switch(op) {
                            case "<":
                                ret = ret < 0;
                                break;
                            case ">":
                                ret = ret > 0;
                                break;
                            case "<=":
                                ret = ret <= 0;
                                break;
                            case ">=":
                                ret = ret >= 0;
                                break;
                            case "==":
                            case "===":
                                ret = ret === 0;
                                break;
                            case "!=":
                            case "!==":
                                ret = ret !== 0;
                                break;
                            default:
                                throw new Error("Operator "+op+" unknown");
                        }
                    }
                }
            } else if (isSymbolicNumber(left) && typeof right === 'number') {
                if (left.op !== SymbolicLinear.UN)
                    if (right)
                        ret = left;
                    else
                        ret = left.not();
                else {
                    ret = left.subtractLong(right);
                }
            } else if (isSymbolicNumber(right) && typeof left === 'number') {
                if (right.op !== SymbolicLinear.UN)
                    if (left)
                        ret = right;
                    else
                        ret = right.not();
                else {
                    ret = right.subtractFrom(left);
                }
            } else  if (op === "===" || op === "!==" || op === "==" || op === "!=") {
                if (op === "===" || op === '!==') {
                    op = op.substring(0,2);
                }
                if (isSymbolicString(left) && isSymbolicString(right)) {
                    ret = new SymbolicStringPredicate(op,left,right);
                } else if (isSymbolicString(left) && typeof right === 'string') {
                    ret = new SymbolicStringPredicate(op,left,right);
                } else if (isSymbolicString(right) && typeof left === 'string') {
                    ret = new SymbolicStringPredicate(op,left,right);
                }
            }
            if (isSymbolicNumber(ret)) {
                if (op === "===" || op === '!==') {
                    op = op.substring(0,2);
                }
                ret = ret.setop(op);
            }

        } else if(op === "*") {
            if (isSymbolicString(left)) {
                left = symbolicStringToInt(left);
            }
            if (isSymbolicString(right)) {
                right = symbolicStringToInt(right);
            }
            if (isSymbolicNumber(left) && isSymbolicNumber(right)) {
                left = pc.concretize(left);
                ret = right.multiply(left);
            } else if (isSymbolicNumber(left) && typeof right === 'number') {
                ret = left.multiply(right);
            } else if (isSymbolicNumber(right) && typeof left === 'number') {
                ret = right.multiply(left);
            }
        } else if (op === "regexin") {
            if (isSymbolicString(left)) {
                ret = new SymbolicStringPredicate("regexin",left, pc.concretize(right));
            }
        } else if (op === '|') {
            if (isSymbolicString(left) && typeof right === 'number' && right === 0) {
                ret = symbolicStringToInt(left);
            } else  if (isSymbolicString(right) && typeof left === 'number' && left === 0) {
                ret = symbolicStringToInt(right);
            }
        }
        return ret;
    }


    function B(iid, op, left, right) {

        var result_c, left_c, right_c;

        left = initUndefinedForBinary(op, left, right);
        right = initUndefinedForBinary(op, right, left);

        if ((result_c = binarys(iid, op, left, right)) !== undefined) {
            return result_c;
        }

        left_c = pc.concretize(left);
        right_c = pc.concretize(right);

        switch(op) {
            case "+":
                result_c = left_c + right_c;
                break;
            case "-":
                result_c = left_c - right_c;
                break;
            case "*":
                result_c = left_c * right_c;
                break;
            case "/":
                result_c = left_c / right_c;
                break;
            case "%":
                result_c = left_c % right_c;
                break;
            case "<<":
                result_c = left_c << right_c;
                break;
            case ">>":
                result_c = left_c >> right_c;
                break;
            case ">>>":
                result_c = left_c >>> right_c;
                break;
            case "<":
                result_c = left_c < right_c;
                break;
            case ">":
                result_c = left_c > right_c;
                break;
            case "<=":
                result_c = left_c <= right_c;
                break;
            case ">=":
                result_c = left_c >= right_c;
                break;
            case "==":
                result_c = left_c == right_c;
                break;
            case "!=":
                result_c = left_c != right_c;
                break;
            case "===":
                result_c = left_c === right_c;
                break;
            case "!==":
                result_c = left_c !== right_c;
                break;
            case "&":
                result_c = left_c & right_c;
                break;
            case "|":
                result_c = left_c | right_c;
                break;
            case "^":
                result_c = left_c ^ right_c;
                break;
            case "instanceof":
                result_c = left_c instanceof right_c;
                break;
            case "in":
                result_c = left_c in right_c;
                break;
            case "&&":
                result_c = left_c && right_c;
                break;
            case "||":
                result_c = left_c || right_c;
                break;
            case "regexin":
                result_c = right_c.test(left_c);
                break;
            default:
                throw new Error(op +" at "+iid+" not found");
                break;
        }
        return result_c;
    }

    function makePredicate(left_s) {
        var ret = left_s;
        if (left_s instanceof SymbolicLinear) {
            if (left_s.op === SymbolicLinear.UN) {
                ret = left_s.setop("!=");
            }
            return ret;
        } else if (left_s instanceof SymbolicStringExpression) {
            ret = new SymbolicStringPredicate("!=",left_s,"");
            return ret;
        } else if (left_s instanceof SymbolicStringPredicate  ||
            left_s instanceof ToStringPredicate ||
            left_s instanceof FromCharCodePredicate ||
            left_s instanceof SymbolicBool) {
            return ret;
        }
        throw new Error("Unknown symbolic value "+left_s);
    }


    function unarys(iid, op, left) {
        var ret;

        if (isSymbolic(left)) {
            if (op === "-") {
                if (isSymbolicString(left)) {
                    left = symbolicStringToInt(left);
                }
                ret = left.negate();
            } else if (op === "!") {
                ret = makePredicate(left).not();
            } else if (op === "+") {
                if (isSymbolicString(left)) {
                    left = symbolicStringToInt(left);
                }
                ret = left;
            }
        }
        return ret;
    }


    function U(iid, op, left) {
        var left_c, result_c;

        left = initUndefinedForUnary(op, left);

        if ((result_c = unarys(iid, op, left))) {
            return result_c;
        }

        left_c = pc.concretize(left);

        switch(op) {
            case "+":
                result_c = + left_c;
                break;
            case "-":
                result_c = - left_c;
                break;
            case "~":
                result_c = ~ left_c;
                break;
            case "!":
                result_c = ! left_c;
                break;
            case "typeof":
                result_c = typeof left_c;
                break;
            default:
                throw new Error(op +" at "+iid+" not found");
                break;
        }

        return result_c;
    }


    var lastVal;
    var switchLeft;
    var switchKeyStack = [];

    function pushSwitchKey() {
        switchKeyStack.push(switchLeft);
    }

    function popSwitchKey() {
        switchLeft = switchKeyStack.pop();
    }

    function last() {
        return lastVal;
    }

    function C1(iid, left) {
        switchLeft = left;
        return true;
    }

    function C2(iid, left) {
        left = B(iid, "===", switchLeft, left);

        if (isSymbolic(left)) {
            return pc.branch(pc.getBDDFromFormula(makePredicate(left)));
        } else {
            return left;
        }
    }

    function C(iid, left) {
        left = initUndefinedCondition(left);

        lastVal = left;
        if (isSymbolic(left)) {
            return pc.branch(pc.getBDDFromFormula(makePredicate(left)));
        } else {
            return left;
        }
    }


    function addAxiom(left) {
        if (left === "begin" || left === "and" || left === "or" || left === "ignore") {
            pc.addAxiom(left);
            return;
        }

        if (isSymbolic(left)) {
            left = makePredicate(left);
        } else if (left) {
            left = SymbolicBool.true;
        } else {
            left = SymbolicBool.false;
        }
        var ret = pc.getBDDFromFormula(left);
        pc.addAxiom(ret, true);
    }

    function endExecution() {
        pc.generateInputs();
    }

    sandbox.U = U; // Unary operation
    sandbox.B = B; // Binary operation
    sandbox.C = C; // Condition
    sandbox.C1 = C1; // Switch key
    sandbox.C2 = C2; // case label C1 === C2
    sandbox._ = last;  // Last value passed to C

    sandbox.H = H; // hash in for-in
    sandbox.I = I; // Ignore argument
    sandbox.G = G; // getField
    sandbox.P = P; // putField
    sandbox.R = R; // Read
    sandbox.W = W; // Write
    sandbox.N = N; // Init
    sandbox.T = T; // object/function/regexp/array Literal
    sandbox.F = F; // Function call
    sandbox.M = M; // Method call
    sandbox.A = A; // Modify and assign +=, -= ...
    sandbox.Fe = Fe; // Function enter
    sandbox.Fr = Fr; // Function return
    sandbox.Se = Se; // Script enter
    sandbox.Sr = Sr; // Script return
    sandbox.Rt = Rt; // Value return
    sandbox.Ra = Ra;

    sandbox.invokeFun = invokeFun;
    sandbox.makeSymbolic = makeSymbolic;
    sandbox.addAxiom = addAxiom;
    sandbox.endExecution = endExecution;

    sandbox.getPC = getPC;
    sandbox.treatUndefinedAsInput = true;
    sandbox.wrapUndefined = wrapUndefined;
    sandbox.initUndefinedFunction = initUndefinedFunction;
    sandbox.initUndefinedNumber = initUndefinedNumber;
    sandbox.initUndefinedString = initUndefinedString;

}(module.exports));

