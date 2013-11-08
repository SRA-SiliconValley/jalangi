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

(function (sandbox) {
    var single = require('./Single2');
    var PredValues = require('./PredValues');
    var BDD = require('./BDD');
    var SymbolicBool = require('./../concolic/SymbolicBool');
    var SymbolicAnyVar = require('./SymbolicAnyVar');
    var getIIDInfo = require('./../../utils/IIDInfo');
    var PREFIX1 = "J$";
    var SPECIAL_PROP2 = "*" + PREFIX1 + "I*";
    var EVAL_ORG = eval;

    var pc = single.getPC();

    function makePredValues(pred, value) {
        if (!(value instanceof PredValues)) {
            value = new PredValues(pred, value);
        }
        return value;
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    function addValue(ret, pred, value) {
        var i, len, tPred;

        if (value instanceof PredValues) {
            len = value.values.length;

            for (i = 0; i < len; ++i) {
                tPred = pred.and(value.values[i].pred);
                if (!tPred.isZero()) {
                    if (!ret) {
                        ret = new PredValues(tPred, value.values[i].value);
                    } else {
                        ret.addValue(tPred, value.values[i].value);
                    }
                }
            }
        } else {
            if (!ret) {
                ret = new PredValues(pred, value);
            } else {
                ret.addValue(pred, value);
            }
        }
        return ret;
    }

    function makeSymbolic(idx, val) {
        return single.makeSymbolic(idx, val);
    }

    //----------------------------------------------- Symbolic funs ----------------------------------------------------

    function nextIndices(indices, maxIndices) {
        var len = indices.length, i;
        indices[len - 1] = indices[len - 1] + 1;
        for (i = len - 1; i >= 0; --i) {
            if (indices[i] === maxIndices[i]) {
                if (i === 0) {
                    return false;
                } else {
                    indices[i] = 0;
                    indices[i - 1] = indices[i - 1] + 1;
                }
            } else {
                break;
            }
        }
        return true;
    }

    function create_concrete_invoke(f, noConcretizeThis, noConcretizeArgs) {
        return function () {
            var len = arguments.length, ret, pred, newPC, value;
            var indices = [], args = [], maxIndices = [], cArgs = [];
            for (var i = 0; i < len; i++) {
                args[i] = makePredValues(BDD.one, arguments[i]);
                indices[i] = 0;
                maxIndices[i] = args[i].values.length;
            }
            newPC = BDD.zero;
            ret = undefined;

            do {
                pred = pc.getPC();
                for (i = 0; i < len; ++i) {
                    pred = pred.and(args[i].values[indices[i]].pred);
                }
                if (!pred.isZero()) {
                    pc.pushPC(pred);
                    for (i = 0; i < len; ++i) {
                        if (noConcretizeArgs) {
                            cArgs[i] = single.initUndefinedNumber(args[i].values[indices[i]].value);
                        } else {
                            cArgs[i] = pc.concretize(single.initUndefinedNumber(args[i].values[indices[i]].value));
                        }
                    }
                    if (noConcretizeThis) {
                        value = f.apply(single.initUndefinedNumber(getSingle(this)), cArgs);
                    } else {
                        value = f.apply(pc.concretize(single.initUndefinedNumber(getSingle(this))), cArgs);
                    }
                    ret = addValue(ret, pc.getPC(), value);
                    newPC = newPC.or(pc.getPC());
                    pc.popPC();
                }
            } while (nextIndices(indices, maxIndices));

            pc.setPC(pc.getPC().and(newPC));
            return ret;
        }
    }


//    function create_concrete_invoke(f) {
//        return function() {
//            var len = arguments.length;
//            for (var i = 0; i<len; i++) {
//                arguments[i] = pc.concretize(getSingle(arguments[i]));
//            }
//            return f.apply(pc.concretize(getSingle(this)),arguments);
//        }
//    }
//
//    function create_concrete_invoke_cons(f) {
//        return function() {
//            var len = arguments.length;
//            for (var i = 0; i<len; i++) {
//                arguments[i] = pc.concretize(getSingle(arguments[i]));
//            }
//            return f.apply(this, arguments);
//        }
//    }

    function string_fromCharCode() {
        var ints = [];
        var i, len = arguments.length, flag = false;
        ;
        for (i = 0; i < len; i++) {
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

    function regexp_test(str) {
        // this is a regexp object
        var newSym;

        newSym = J$.readInput("", true);
        J$.addAxiom(J$.B(0, "==", newSym, str));
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

    function getSymbolicFunctionToInvoke(f, isConstructor) {
        if (f === Array ||
            f === Error ||
            f === String ||
            f === Number ||
            f === Boolean ||
            f === RegExp) {
            return create_concrete_invoke(f, true);
        } else if (f === RegExp.prototype.test) {
            return regexp_test;
        } else if (f === String.fromCharCode) {
            return create_concrete_invoke(string_fromCharCode, true, true);
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
                sfuns = require('./SymbolicFunctions3_jalangi_')
            }
            if (f === String.prototype.indexOf) {
                return getSingle(sfuns.string_indexOf);
            } else if (f === String.prototype.charCodeAt) {
                return getSingle(sfuns.string_charCodeAt);
            } else if (f === String.prototype.charAt) {
                return getSingle(sfuns.string_charAt);
            } else if (f === String.prototype.lastIndexOf) {
                return getSingle(sfuns.string_lastIndexOf);
            } else if (f === String.prototype.substring) {
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

    function callAsNativeConstructor(Constructor, args) {
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
            return callAsNativeConstructor(Constructor, args);
        } else {
            var Temp = function () {
            }, inst, ret;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }


    function invokeEval(base, f, args) {
        return f.call(base, J$.instrumentCode(args[0], false));
    }


    var pad = "| ";

    function singleInvokeFun(iid, base, f, args, isConstructor) {
        var g, invoke, val;

        console.log(pad + "Calling " + f.name + " " + getIIDInfo(iid));

        f = single.initUndefinedFunction(f);

        var f_m = getSymbolicFunctionToInvoke(f, isConstructor);

        invoke = f_m || f === undefined || HOP(f, SPECIAL_PROP2) || typeof f !== "function";
        g = f_m || f;
        pushSwitchKey();
        pad = pad + "| ";
        try {
            if (g === EVAL_ORG) {
                val = invokeEval(base, g, args);
            } else if (invoke) {
                if (isConstructor) {
                    val = callAsConstructor(g, args);
                } else {
                    val = g.apply(base, args);
                }
            } else {
                console.log(pad + "skip body");
                val = single.wrapUndefined(undefined, false);
            }
        } finally {
            pad = pad.substring(2);
            popSwitchKey();
        }
        console.log(pad + "Returning " + f.name);

        return val;
    }

    //--------------------------- End Symbolic Funs --------------------------------------------------------------------


    function F(iid, f, isConstructor) {
        return function () {
            var base = this;
            return invokeFun(iid, base, f, arguments, isConstructor);
        }
    }

    function M(iid, base, offset, isConstructor) {
        return function () {
            var f = G(iid, base, offset);
            return invokeFun(iid, base, f, arguments, isConstructor);
        };
    }

    var scriptCount = 0;

    function Se(iid, val) {
        scriptCount++;
    }

    function Sr(iid) {
        scriptCount--;
        var ret2, pathCount = pc.getPathCount();
        if (scriptCount === 0) {
            ret2 = pc.generateInputs(true);
        } else {
            ret2 = pc.generateInputs();
//            ret2 = pc.generateInputs(true);
        }

        if (ret2) {
            console.log(pad+ret2);
        }
        pc.resetPC(undefined, pad);
        return ret2;
    }

    function I(val) {
        return val;
    }

    function T(iid, val, type) {
        return single.T(iid, val, type);
    }

    function H(iid, val) {
        return val;
    }


    function R(iid, name, val, isGlobal) {
        return single.wrapUndefined(val, !isGlobal);
    }

    function W(iid, name, val, lhs) {
        if (pc.isRetracing()) {
            return lhs;
        }
        return update(lhs, val);
    }

    function N(iid, name, val, isArgumentSync) {
        if (isArgumentSync)
            return single.wrapUndefined(val, false);
        return val;
    }


    function A(iid, base, offset, op) {
        var oprnd1 = G(iid, base, offset);
        return function (oprnd2) {
            var val = B(iid, op, oprnd1, oprnd2);
            return P(iid, base, offset, val);
        };
    }


    function update(oldValue, newValue) {
        var ret;
        oldValue = makePredValues(BDD.one, oldValue);
        newValue = makePredValues(pc.getPC(), newValue);


        var i, len, pred, notPc = pc.getPC().not();
        len = newValue.values.length;
        for (i = 0; i < len; ++i) {
            pred = newValue.values[i].pred.and(pc.getPC());
            if (!pred.isZero()) {
                ret = addValue(ret, pred, newValue.values[i].value);
            }
        }

        len = oldValue.values.length;
        for (i = 0; i < len; ++i) {
            pred = notPc.and(oldValue.values[i].pred);
            if (!pred.isZero()) {
                ret = addValue(ret, pred, oldValue.values[i].value);
            }
        }
        return ret;
    };


    function B(iid, op, left, right) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);
        right = makePredValues(BDD.one, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred, value, ret, newPC = BDD.zero;
        for (i = 0; i < leni; ++i) {
            for (j = 0; j < lenj; ++j) {
                pred = left.values[i].pred.and(right.values[j].pred);
                pred = pc.getPC().and(pred);

                if (!pred.isZero()) {
                    pc.pushPC(pred);
                    if (op !== undefined) {
                        value = single.B(iid, op, left.values[i].value, right.values[j].value);
                    } else {
                        value = single.G(iid, left.values[i].value, right.values[j].value);
                    }
                    ret = addValue(ret, pc.getPC(), value);
                    newPC = newPC.or(pc.getPC());
                    pc.popPC();
                }
            }
        }
        pc.setPC(pc.getPC().and(newPC));
        return ret;
    }

    function U(iid, op, left) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);

        var i, leni = left.values.length, pred, value, ret, newPC = BDD.zero;
        for (i = 0; i < leni; ++i) {
            pred = pc.getPC().and(left.values[i].pred);

            if (!pred.isZero()) {
                pc.pushPC(pred);
                value = single.U(iid, op, left.values[i].value);
                ret = addValue(ret, pc.getPC(), value);
                newPC = newPC.or(pc.getPC());
                pc.popPC();
            }
        }
        pc.setPC(pc.getPC().and(newPC));
        return ret;
    }

    function G(iid, base, offset) {
        return B(iid, undefined, base, offset);
    };

    function P(iid, left, right, val) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);
        right = makePredValues(BDD.one, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred, newPC = BDD.zero;
        for (i = 0; i < leni; ++i) {
            for (j = 0; j < lenj; ++j) {
                pred = left.values[i].pred.and(right.values[j].pred);
                pred = pc.getPC().and(pred);

                if (!pred.isZero()) {
                    var base = left.values[i].value;
                    var offset = right.values[j].value;
                    pc.pushPC(pred);
                    var oldValue = single.G(iid, base, offset);
                    single.P(iid, base, offset, update(oldValue, val));
                    newPC = newPC.or(pc.getPC());
                    pc.popPC();
                }
            }
        }
        pc.setPC(pc.getPC().and(newPC));
    }


    function invokeFun(iid, base, f, args, isConstructor) {
        if (pc.isRetracing()) {
            return;
        }
        base = makePredValues(BDD.one, base);
        f = makePredValues(BDD.one, f);

        var i, j, leni = base.values.length, lenj = f.values.length, pred, value, ret, tmp, f2, newPC = BDD.zero;
        pushSwitchKey();
        try {
            for (i = 0; i < leni; ++i) {
                for (j = 0; j < lenj; ++j) {
                    pred = base.values[i].pred.and(f.values[j].pred);
                    pred = pc.getPC().and(pred);

                    if (!pred.isZero()) {
                        f2 = f.values[j].value;
                        if (f2 === J$.addAxiom) {
                            value = singleInvokeFun(iid, base.values[i].value, f2, args, isConstructor);
                            ret = addValue(ret, pred, value);
                            newPC = newPC.or(pc.getPC());
                        } else {
                            pc.pushPC(pred);
                            value = singleInvokeFun(iid, base.values[i].value, f2, args, isConstructor);
                            ret = addValue(ret, pc.getPC(), value);
                            newPC = newPC.or(pc.getPC());
                            pc.popPC();
                        }
                    }
                }
            }
            pc.setPC(pc.getPC().and(newPC));
        } finally {
            popSwitchKey();
        }
        //console.log("after invokeFun at "+getIIDInfo(iid)+" pc = "+pc.getFormulaFromBDD(pc.getPC()));
        return ret;
    }

    var returnVal;

    function Fe(iid, val, dis) {
        returnVal = undefined;
    }

    function Fr(iid) {
        var ret2, aggrRet = pc.getReturnVal();
        ret2 = pc.generateInputs();
        if (ret2) {
            console.log(pad+ret2);
        }

        returnVal = addValue(aggrRet, pc.getPC(), returnVal);
        pc.resetPC(returnVal, pad);
        return ret2;
    }

    function Rt(iid, val) {
        returnVal = val;
        return val;
    }

    function Ra() {
        var ret = returnVal;
        returnVal = undefined;

        // special case to handle return of undefined from a constructor
        // if undefined is returned from a constructor, do not wrap the return value
        if (ret instanceof PredValues && ret.values.length === 1 &&
            ret.values[0].value === undefined) {
            return undefined;
        }
        return ret;
    }

    var Symbolic = require('./../concolic/Symbolic');
    var SymbolicLinear = require('./../concolic/SymbolicLinear');
    var SymbolicStringExpression = require('./SymbolicStringExpression');
    var SymbolicStringPredicate = require('./SymbolicStringPredicate');
    var ToStringPredicate = require('./ToStringPredicate');
    var FromCharCodePredicate = require('./FromCharCodePredicate');

    function isSymbolic(val) {
        if (val === undefined || val === null) {
            return false;
        }
        return val.type === Symbolic;
    }

    function makePredicate(left_s) {
        var ret = left_s;
        if (!isSymbolic(left_s)) {
            return (!!left_s) ? SymbolicBool.true : SymbolicBool.false;
        } else if (left_s instanceof SymbolicLinear) {
            if (left_s.op === SymbolicLinear.UN) {
                ret = left_s.setop("!=");
            }
            return ret;
        } else if (left_s instanceof SymbolicStringExpression) {
            ret = new SymbolicStringPredicate("!=", left_s, "");
            return ret;
        } else if (left_s instanceof SymbolicStringPredicate ||
            left_s instanceof ToStringPredicate ||
            left_s instanceof FromCharCodePredicate ||
            left_s instanceof SymbolicBool) {
            return ret;
        }
        throw new Error("Unknown symbolic value " + left_s);
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
        if (pc.isRetracing()) {
            var ret = pc.branchBoth(iid, null, null);
            switchLeft = ret.lastVal;
            return ret.branch;
        }

        left = B(iid, "===", switchLeft, left);

        var i, leni = left.values.length, pred1 = BDD.zero, pred2 = BDD.zero, ret;
        for (i = 0; i < leni; ++i) {
            ret = makePredicate(left.values[i].value);
            ret = pc.getBDDFromFormula(ret);
            pred1 = pred1.or(left.values[i].pred.and(ret));
            pred2 = pred2.or(left.values[i].pred.and(ret.not()));
        }
        return pc.branchBoth(iid, pc.getPC().and(pred2), pc.getPC().and(pred1), switchLeft);
    }

    function C(iid, left) {
        if (pc.isRetracing()) {
            var ret = pc.branchBoth(iid, null, null);
            lastVal = ret.lastVal;
            return ret.branch;
        }

        lastVal = left;
        left = makePredValues(BDD.one, left);
        var i, leni = left.values.length, pred1 = BDD.zero, pred2 = BDD.zero, ret;
        for (i = 0; i < leni; ++i) {
            ret = makePredicate(left.values[i].value);
            ret = pc.getBDDFromFormula(ret);
            pred1 = pred1.or(left.values[i].pred.and(ret));
            pred2 = pred2.or(left.values[i].pred.and(ret.not()));
        }
        return pc.branchBoth(iid, pc.getPC().and(pred2), pc.getPC().and(pred1), lastVal);
    }

    function addAxiom(left) {
        if (pc.isRetracing()) {
            return;
        }

        if (left === "begin" || left === "and" || left === "or" || left === "ignore") {
            pc.addAxiom(left);
            return;
        }

        left = makePredValues(BDD.one, left);
        var i, leni = left.values.length, pred1 = BDD.zero, ret;
        for (i = 0; i < leni; ++i) {
            ret = makePredicate(left.values[i].value);
            ret = pc.getBDDFromFormula(ret);
            pred1 = pred1.or(left.values[i].pred.and(ret));
        }
        pc.addAxiom(pc.getPC().and(pred1), true);
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
    sandbox.Rt = Rt;
    sandbox.Ra = Ra;

    sandbox.makeSymbolic = makeSymbolic;
    sandbox.addAxiom = addAxiom;

}(module.exports));

