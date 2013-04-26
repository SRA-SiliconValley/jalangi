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

$7 = {};


(function(sandbox) {

    var EVAL_ORG = eval;

    var PREFIX1 = "$7";
    var SPECIAL_PROP2 = "*"+PREFIX1+"I*";
    var  N_LOG_FUNCTION_LIT = 12;

    //-------------------------------- End constants ---------------------------------


    //-------------------------------------- Symbolic functions -----------------------------------------------------------

    function create_concrete_invoke(f) {
        return function() {
            var len = arguments.length;
            for (var i = 0; i<len; i++) {
                arguments[i] = concretize(arguments[i]);
            }
            return f.apply(concretize(this),arguments);
        }
    }

    function create_concrete_invoke_cons(f) {
        return function() {
            var len = arguments.length;
            for (var i = 0; i<len; i++) {
                arguments[i] = concretize(arguments[i]);
            }
            return f.apply(this, arguments);
        }
    }

    function regex_escape (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    function regexp_test (str) {
        // this is a regexp object
        var newSym;

        if (isSymbolic(str) && str.isCompound && str.isCompound()) {
            newSym = sandbox.readInput("",true);
            addAxiom(B(0,"==",newSym,str));
        } else {
            newSym = str;
        }
        return B(0, "regexin", newSym, this);
    }

    var sfuns;

    function getSymbolicFunctionToInvoke (f, isConstructor) {
        if (f === Array ||
            f === Error ||
            f === String ||
            f === Number ||
            f === Boolean ||
            f === RegExp ||
            f === $7.addAxiom ||
            f === $7.readInput) {
            return create_concrete_invoke_cons(f);
        } else if (f === RegExp.prototype.test) {
            return regexp_test;
        } else {
            if (!sfuns) {
                sfuns = require('./analyses/concolic/SymbolicFunctions2_jalangi_')
            }
            if (f === String.prototype.indexOf) {
                return sfuns.string_indexOf;
            } else if (f === String.prototype.charCodeAt) {
                return sfuns.string_charCodeAt;
            } else if (f === String.prototype.charAt) {
                return sfuns.string_charAt;
            } else if (f === String.prototype.lastIndexOf) {
                return sfuns.string_lastIndexOf;
            }  else if (f === String.prototype.substring) {
                return sfuns.string_substring;
            } else if (f === String.prototype.substr) {
                return sfuns.string_substr;
            } else if (f === parseInt) {
                return sfuns.builtin_parseInt;
            } else if (f === String.prototype.replace) {
                return create_concrete_invoke(f);
            }
        }
//         else if (f === Function.prototype.apply ||
//            f === Function.prototype.call ||
//            f === console.log ||
//            f === RegExp.prototype.test ||
//            f === String.prototype.indexOf ||
//            f === String.prototype.lastIndexOf ||
//            f === String.prototype.substring ||
//            f === String.prototype.substr ||
//            f === String.prototype.charCodeAt ||
//            f === String.prototype.charAt ||
//            f === String.prototype.replace ||
//            f === String.fromCharCode ||
//            f === Math.abs ||
//            f === Math.acos ||
//            f === Math.asin ||
//            f === Math.atan ||
//            f === Math.atan2 ||
//            f === Math.ceil ||
//            f === Math.cos ||
//            f === Math.exp ||
//            f === Math.floor ||
//            f === Math.log ||
//            f === Math.max ||
//            f === Math.min ||
//            f === Math.pow ||
//            f === Math.round ||
//            f === Math.sin ||
//            f === Math.sqrt ||
//            f === Math.tan ||
//            f === parseInt) {
//            return  create_concrete_invoke(f);
//        }
        return null;
    }

    var Symbolic = require('./analyses/concolic/Symbolic');
    var SymbolicBool = require('./analyses/concolic/SymbolicBool');
    var SymbolicLinear = require('./analyses/concolic/SymbolicLinear');
    var SymbolicStringExpression = require('./analyses/puresymbolic/SymbolicStringExpression');
    var SymbolicStringPredicate = require('./analyses/puresymbolic/SymbolicStringPredicate');
    var ToStringPredicate = require('./analyses/puresymbolic/ToStringPredicate');
    var SolverEngine = require('./analyses/puresymbolic/SolverEngine');
    var solver = new SolverEngine();
    var pathConstraint = SymbolicBool.true;


    //---------------------------- Utility functions -------------------------------
    function getFullSolution(newInputs) {
        var oldInputs = sandbox.inputs;
        if (newInputs === undefined) {
            newInputs = sandbox.getCurrentSolution();
        }
        if (oldInputs) {
            return combine(oldInputs, newInputs);
        } else {
            return newInputs;
        }
    }


    function combine(oldInputs, newInputs) {
        var tmp = {};
        for (var key in oldInputs) {
            if (HOP(oldInputs, key)) {
                tmp[key] = oldInputs[key];
            }
        }
        for (key in newInputs) {
            if (HOP(newInputs, key)) {
                tmp[key] = newInputs[key];
            }
        }
        return tmp;
    }

    function simplify(val) {
        var solution= getFullSolution(sandbox.getCurrentSolution());
        var concrete = val.substitute(solution);
        if (concrete === SymbolicBool.true) {
            concrete = true;
        } else if (concrete === SymbolicBool.false) {
            concrete = false;
        }
        return concrete;
    }

    function makeConcrete(val, pathConstraint) {
        if (!isSymbolic(val)) {
            return {constraint: SymbolicBool.true, concrete: val};
        }

        var concrete = simplify(val);

        if (isSymbolic(concrete)) {
            var tmpSolution = solver.generateInputs(pathConstraint.substitute(getFullSolution()));
            if (tmpSolution === null) {
                throw new Error("Current path constraint must have a solution");
            } else {
                sandbox.setCurrentSolution(combine(sandbox.getCurrentSolution(), tmpSolution));
                concrete = simplify(val);
            }
        }

        if (isSymbolic(concrete)) {
            throw new Error("Failed to concretize the symbolic value "+val+
                " with path constraint "+pathConstraint);
        }

        if (typeof concrete === 'boolean') {
            return {
                constraint: val,
                concrete: concrete
            };
        } else if (isSymbolicNumber(val)) {
            return {
                constraint: val.subtractLong(concrete).setop("=="),
                concrete: concrete
            }
        } else if (isSymbolicString(val)) {
            return {
                constraint: new SymbolicStringPredicate("==", val, concrete),
                concrete: concrete
            }

        } else {
            throw new Error("Unknown symbolic type "+val+ " with path constraint "+
                pathConstraint + " inputs "+JSON.stringify(sandbox.inputs));
        }
    }

    function isFeasible(val, branch) {
        var pred = makePredicate(val);
        var ret = makeConcrete(branch?pred:pred.not(), pathConstraint);
        if (ret.concrete) {
            return true;
        } else {
            return false;
        }
    }

    function concretize(val) {
        var ret = makeConcrete(val, pathConstraint);
        addAxiom(ret.constraint);
        return ret.concrete;
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
        addAxiom(B(0, ">=", ret.getLength(), 0));
        addAxiom(B(0, "<=", ret.getLength(), MAX_STRING_LENGTH));
        return ret;
    }


    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function slice(a, start) {
        return Array.prototype.slice.call(a, start || 0);
    }

    function isNative(f) {
        return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
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



    //----------------------------------- Begin concolic execution ---------------------------------

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
        return f.call(base,sandbox.instrumentCode(args[0],true));
    }


    function invokeFun(iid, base, f, args, isConstructor) {
        var g, invoke, val;

        var f_m = getSymbolicFunctionToInvoke(f, isConstructor);

        invoke = f_m || f === undefined || HOP(f,SPECIAL_PROP2) || typeof f !== "function";
        g = f_m || f ;

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

    function T(iid, val, type) {
        if (type === N_LOG_FUNCTION_LIT) {
            concretize(val)[SPECIAL_PROP2] = true;
        }
        return val;
    }

    function H(iid, val) {
        return val;
    }


    function R(iid, name, val) {
        return val;
    }

    function W(iid, name, val) {
        return val;
    }

    function N(iid, name, val, isArgumentSync) {
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
        offset = concretize(offset);

        if (offset === SPECIAL_PROP2) {
            return undefined;
        } else if (base instanceof SymbolicStringExpression) {
            if (offset === "length") {
                return base.getLength();
            } else if ("indexOf") {
                return String.prototype.indexOf;
            } else if ("lastIndexOf") {
                return String.prototype.lastIndexOf;
            } else if ("substring") {
                return String.prototype.substring;
            } else if ("substr") {
                return String.prototype.substr;
            } else if ("charCodeAt") {
                return String.prototype.charCodeAt;
            }  else if ("charAt") {
                return String.prototype.charAt;
            } else if ("replace") {
                return String.prototype.replace;
            }

        }

        base = concretize(base);

        return base[offset];
    }

    function P(iid, base, offset, val) {
        offset = concretize(offset);

        if (offset === SPECIAL_PROP2) {
            return undefined;
        }

        base = concretize(base);

        base[offset] = val;
        return val;
    }

    function symbolicIntToString(num) {
        //var c = num.substitute(getFullSolution(sandbox.getCurrentSolution()));
        var newSym = sandbox.readInput("", true);
        addAxiom(new ToStringPredicate(num, newSym));
        return newSym;
    }

    function symbolicStringToInt(str) {
//        var s = str.substitute(getFullSolution(sandbox.getCurrentSolution()));
        var newSym = sandbox.readInput(0, true);
        addAxiom(new ToStringPredicate(newSym, str));
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
                }
            } else if (isSymbolicNumber(left) && typeof right === 'number') {
                if (left.op !== SymbolicLinear.UN)
                    if (right)
                        ret = left;
                    else
                        ret = left.not();
                else
                    ret = left.subtractLong(right);
            } else if (isSymbolicNumber(right) && typeof left === 'number') {
                if (right.op !== SymbolicLinear.UN)
                    if (left)
                        ret = right;
                    else
                        ret = right.not();
                else
                    ret = right.subtractFrom(left);
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
                left = concretize(left);
                ret = right.multiply(left);
            } else if (isSymbolicNumber(left) && typeof right === 'number') {
                ret = left.multiply(right);
            } else if (isSymbolicNumber(right) && typeof left === 'number') {
                ret = right.multiply(left);
            }
        } else if (op === "regexin") {
            if (isSymbolicString(left)) {
                ret = new SymbolicStringPredicate("regexin",left, concretize(right));
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

        if ((result_c = binarys(iid, op, left, right)) !== undefined) {
            return result_c;
        }

        left_c = concretize(left);
        right_c = concretize(right);

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

        if ((result_c = unarys(iid, op, left))) {
            return result_c;
        }

        left_c = concretize(left);

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

    var branchIndex = (function() {
        var index = 0;

        return {
            getNext: function(){
                return sandbox.getCurrentSolutionIndex()[index];
            },

            setNext: function (branch) {
                sandbox.getCurrentSolutionIndex()[index++] = branch;
            },

            getCurrentIndex: function(branch) {
                var ret = [];
                var i;
                for (i=0; i<index; i++) {
                    ret.push(sandbox.getCurrentSolutionIndex()[i]);
                }
                ret.push(branch);
                return ret;
            }
        }
    })();

    function takeBranch(val, branch) {
        if (isSymbolic(val)) {
            var pred = makePredicate(val);
            pred = branch?pred:pred.not();
            addAxiom(pred);
//        pathConstraint = new SymbolicBool("&&", pathConstraint, pred);
            branchIndex.setNext(branch);
        }
    }

    var formulaStack = [];
    formulaStack.count = 0;

    function addAxiom(val) {

        if (val === "begin") {
            formulaStack.push("begin");
            formulaStack.count ++;
        } else if (val === "and" || val === "or") {
            val = (val==='and')?"&&":"||";
            var ret, i, start = -1, len;
            formulaStack.count--;
            len = formulaStack.length;
            for(i = len-1; i>=0; i--) {
                if (formulaStack[i] === "begin") {
                    start = i+1;
                    break;
                }
            }
            if (start === -1) {
                throw new Error("$7.addAxiom('begin') not found");
            }
            if (start === len) {
                return;
            }

            i = start;
            var c1 = formulaStack[i];
            c1 = c1;
            var c2;
            while(i < len-1) {
                i++;
                c2 = formulaStack[i];
                c2 = c2[1];
                c1 = new SymbolicBool(val, c1, c2);
            }
            formulaStack.splice(start-1,len - start+1);
            formulaStack.push(c1);

        } else if (val === 'ignore') {
            formulaStack.pop();
        } else if (isSymbolic(val)) {
            var pred = makePredicate(val);
            if (isSymbolic(pred)) {
                formulaStack.push(pred);
            } else if (formulaStack.count > 0) {
                if (val) {
                    formulaStack.push(SymbolicBool.true);
                } else {
                    formulaStack.push(SymbolicBool.false);
                }
            }
        }

        if (formulaStack.count===0 && formulaStack.length > 0 ) {
            pathConstraint = new SymbolicBool("&&", pathConstraint, formulaStack.pop());
        }
    }


    function generateInput(val, branch) {
        var pred = makePredicate(val);
        var ret = new SymbolicBool("&&", pathConstraint, branch?pred:pred.not());
        var solution = solver.generateInputs(ret);
        if (solution) {
            solver.writeInputs(getFullSolution(solution), branchIndex.getCurrentIndex(branch));
            return solution;
        } else {
            return null;
        }
    }

    function branch(val) {
        var v, ret;
        if ((v = branchIndex.getNext()) !== undefined) {
            takeBranch(val, ret = v);
        } else {
            var I = sandbox.getCurrentSolution();
            if (I) {
                if (isFeasible(val, 0)) {
                    generateInput(val, 1);
                    takeBranch(val, ret = 0);
                } else if (isFeasible(val, 1)) {
                    generateInput(val, 0);
                    takeBranch(val, ret = 1);
                } else {
                    throw new Error("Both branches are not feasible.  This is not possible.")
                }
            } else {
                if (I = generateInput(val, 0)) {
                    sandbox.setCurrentSolution(I);
                    generateInput(val, 1);
                    takeBranch(val, ret = 0);
                } else if (I = generateInput(val, 1)) {
                    sandbox.setCurrentSolution(I);
                    generateInput(val, 0);
                    takeBranch(val, ret = 1);
                } else {
                    throw new Error("Both branches are not feasible.  This is not possible.")
                }
            }
        }
        return ret;
    }

    var lastVal;
    var switchLeft;

    function last() {
        return lastVal;
    }

    function C1(iid, left) {
        switchLeft = left;
        return 1;
    }

    function C2(iid, left) {
        var ret;

        left = B(iid, "===", switchLeft, left);

        if (isSymbolic(left)) {
            return branch(left);
        } else {
            return left;
        }
    }

    function C(iid, left) {
        var ret;

        lastVal = left;
        if (isSymbolic(left)) {
            return branch(left);
        } else {
            return left;
        }
    }

//----------------------------------- End concolic execution ---------------------------------

    function endExecution() {
    }

    sandbox.addAxiom = addAxiom;

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

    sandbox.makeSymbolic = makeSymbolic;
    sandbox.endExecution = endExecution;
}($7));

