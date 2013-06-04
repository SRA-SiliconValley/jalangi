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
    var single = require('./Single2');
    var PredValues = require('./PredValues');
    var BDD = require('./BDD');
    var SymbolicBool = require('./../concolic/SymbolicBool');
    var getIIDInfo = require('./../../utils/IIDInfo');

    var pc = single.getPC();

    function makePredValues(pred, value) {
        if (!(value instanceof PredValues)) {
            value = new PredValues(pred, value);
        }
        return value;
    }

    function addValue(ret, pred, value) {
        var i, len, tPred;

        if (value instanceof PredValues) {
            len = value.values.length;

            for (i=0; i<len; ++i) {
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

    function Se(iid, val) {
//        single.Se(iid, val);
    }

    function Sr(iid) {
//        var ret2, pathIndex, first = pc.isFirst();
//        if (!first) {
//            ret2 = pc.generateInputs();
//        } else {
//            ret2 = pc.generateInputs(true);
//        }
//        pathIndex = pc.getIndex();
//
//        if (ret2) {
//            console.log("backtrack "+iid);
//        }
//
//        console.log("************* after tracing a path at "+getIIDInfo(iid)+" pc = "+pc.getFormulaFromBDD(pc.getPC()));
//
//        pc.popPC();
//        pc.pushPC(null, pathIndex, true, undefined);
//        return ret2;
//        single.Sr(iid);
    }

    function I(val) {
        return val;
    }

    function T(iid, val, type) {
        single.T(iid, val, type);
        return val;
    }

    function H(iid, val) {
        return val;
    }


    function R(iid, name, val) {
        return val;
    }

    function W(iid, name, val, lhs) {
        if (pc.isRetracing()) {
            return lhs;
        }
        return update(lhs, val);
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


    function update(oldValue, newValue) {
        var ret;
        oldValue = makePredValues(BDD.one, oldValue);
        newValue = makePredValues(pc.getPC(), newValue);


        var i, len, pred, notPc = pc.getPC().not();
        len = newValue.values.length;
        for (i=0; i<len; ++i) {
            pred = newValue.values[i].pred.and(pc.getPC());
            if (!pred.isZero()) {
                ret = addValue(ret, pred, newValue.values[i].value);
            }
        }

        len = oldValue.values.length;
        for (i=0; i<len; ++i) {
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

        var i, j, leni = left.values.length, lenj = right.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
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
                    pc.popPC();
                }
            }
        }
        return ret;
    };

    function U(iid, op, left) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);

        var i, leni = left.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            pred = pc.getPC().and(left.values[i].pred);

            if (!pred.isZero()) {
                pc.pushPC(pred);
                value = single.U(iid, op, left.values[i].value);
                ret = addValue(ret, pc.getPC(), value);
                pc.popPC();
            }
        }
        return ret;
    };

    function G(iid, base, offset) {
        return B(iid, undefined, base, offset);
    };

    function P(iid, left, right, val) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);
        right = makePredValues(BDD.one, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = left.values[i].pred.and(right.values[i].pred);
                pred = pc.getPC().and(pred);

                if (!pred.isZero()) {
                    var base = left.values[i].value;
                    var offset = right.values[i].value;
                    pc.pushPC(pred);
                    var oldValue = single.G(iid, base, offset);
                    single.P(iid, base, offset, update(oldValue, val));
                    pc.popPC();
                }
            }
        }
    };


    function invokeFun(iid, base, f, args, isConstructor) {
        if (pc.isRetracing()) {
            return;
        }
        base = makePredValues(BDD.one, base);
        f = makePredValues(BDD.one, f);

        var i, j, leni = base.values.length, lenj = f.values.length, pred, value, ret, pathIndex, ret2;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = base.values[i].pred.and(f.values[i].pred);
                pred = pc.getPC().and(pred);

                if (!pred.isZero()) {
                    pathIndex = [];
                    pc.pushPC(pred);
                    value = single.invokeFun(iid, base.values[i].value, f.values[i].value, args, isConstructor);
                    ret = addValue(ret, pred, value);
                    pc.popPC();
                }
            }
        }
        //console.log("after invokeFun at "+getIIDInfo(iid)+" pc = "+pc.getFormulaFromBDD(pc.getPC()));
        return ret;
    }

    var returnVal;

    function Fe(iid, val, dis) {
        returnVal = undefined;
    }

    function Fr(iid) {
        var ret2, pathIndex, first = pc.isFirst(), aggrRet = pc.getReturnVal();
        if (!first) {
            ret2 = pc.generateInputs();
        } else {
            ret2 = pc.generateInputs(true);
        }
        pathIndex = pc.getIndex();

        if (ret2) {
            console.log("backtrack "+iid);
        }

        console.log("after tracing a path at "+getIIDInfo(iid)+" pc = "+pc.getFormulaFromBDD(pc.getPC()));

        returnVal = addValue(aggrRet, pc.getPC(), returnVal);
        pc.popPC();
        pc.pushPC(null, pathIndex, true, returnVal);
        return ret2;
    }

    function Rt(iid, val) {
        returnVal = val;
        return val;
    }

    function Ra() {
        return returnVal;
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
            return (!!left_s)?SymbolicBool.true:SymbolicBool.false;
        } else if (left_s instanceof SymbolicLinear) {
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




    var lastVal;
    var switchLeft;

    function last() {
        return lastVal;
    }

    function C1(iid, left) {
        switchLeft = left;
        return true;
    }

    function C2(iid, left) {
        if (pc.isRetracing()) {
            return pc.branchBoth(null, null);
        }

        left = B(iid, "===", switchLeft, left);

        var i, leni = left.values.length, pred1 = BDD.zero, pred2 = BDD.zero, ret;
        for (i=0; i<leni; ++i) {
            ret = makePredicate(left.values[i].value);
            ret = pc.getBDDFromFormula(ret);
            pred1 = pred1.or(left.values[i].pred.and( ret));
            pred2 = pred2.or(left.values[i].pred.and(ret.not()));
        }
        return pc.branchBoth(pred2, pred1);
    }

    function C(iid, left) {
        if (pc.isRetracing()) {
            return pc.branchBoth(null, null);
        }

        lastVal = left;
        left = makePredValues(BDD.one, left);
        var i, leni = left.values.length, pred1 = BDD.zero, pred2 = BDD.zero, ret;
        for (i=0; i<leni; ++i) {
            ret = makePredicate(left.values[i].value);
            ret = pc.getBDDFromFormula(ret);
            pred1 = pred1.or(left.values[i].pred.and( ret));
            pred2 = pred2.or(left.values[i].pred.and(ret.not()));
        }
        return pc.branchBoth(pred2, pred1);
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
    sandbox.addAxiom = pc.addAxiom;

}(module.exports));

