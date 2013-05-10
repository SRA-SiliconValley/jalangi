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
    var SymbolicBool = require('./../concolic/SymbolicBool');
    var single = require('./Single2');
    var PredValues = require('./PredValues');
    var SolverEngine = require('./SolverEngine');
    var solver = new SolverEngine();
    var pc = single.getPC();

    function makePredValues(pred, value) {
        if (!(value instanceof PredValues)) {
            value = new PredValues(pred, value);
        }
        return value;
    }

    function and(f1, f2) {
        if (SymbolicBool.simpleImplies(f1, f2)) {
            return f1;
        } else if (SymbolicBool.simpleImplies(f2, f1)) {
            return f2;
        } else {
            return new SymbolicBool("&&", f1, f2);
        }
    }

    function addValue(ret, pred, value) {
        var i, len, tPred;

        if (value instanceof PredValues) {
            len = value.values.length;

            for (i=0; i<len; ++i) {
                tPred = and(pred, value.values[i].pred);
                if (solver.generateInputs(tPred)) {
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

    function Fe(iid, val, dis) {
    }

    function Fr(iid) {
    }

    function Se(iid, val) {
        single.Se(iid, val);
    }

    function Sr(iid) {
        single.Sr(iid);
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
        oldValue = makePredValues(SymbolicBool.true, oldValue);
        newValue = makePredValues(pc.getPC(), newValue);


        var i, len, pred, notPc = pc.getPC().not();
        len = newValue.values.length;
        for (i=0; i<len; ++i) {
            pred = and(newValue.values[i].pred, pc.getPC());
            if (solver.generateInputs(pred)) {
                ret = addValue(ret, pred, newValue.values[i].value);
            }
        }

        len = oldValue.values.length;
        for (i=0; i<len; ++i) {
            pred = and(notPc, oldValue.values[i].pred);
            if (solver.generateInputs(pred)) {
                ret = addValue(ret, pred, oldValue.values[i].value);
            }
        }
        return ret;
    };


    function B(iid, op, left, right) {
        left = makePredValues(SymbolicBool.true, left);
        right = makePredValues(SymbolicBool.true, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(left.values[i].pred, right.values[j].pred);
                pred = and(pc.getPC(), pred);

                if (solver.generateInputs(pred)) {
                    pc.pushPC(pred, []);
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
        left = makePredValues(SymbolicBool.true, left);

        var i, leni = left.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            pred = and(pc.getPC(), left.values[i].pred);

            if (solver.generateInputs(pred)) {
                pc.pushPC(pred, []);
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
        left = makePredValues(SymbolicBool.true, left);
        right = makePredValues(SymbolicBool.true, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(left.values[i].pred, right.values[i].pred);
                pred = and(pc.getPC(), pred);

                if (solver.generateInputs(pred)) {
                    var base = left.values[i].value;
                    var offset = right.values[i].value;
                    pc.pushPC(pred, []);
                    var oldValue = single.G(iid, base, offset);
                    single.P(iid, base, offset, update(oldValue, val));
                    pc.popPC();
                }
            }
        }
    };


    function invokeFun(iid, base, f, args, isConstructor) {
        base = makePredValues(SymbolicBool.true, base);
        f = makePredValues(SymbolicBool.true, f);

        var i, j, leni = base.values.length, lenj = f.values.length, pred, value, ret, pathIndex, ret2;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(base.values[i].pred, f.values[i].pred);
                pred = and(pc.getPC(), pred);

                if (solver.generateInputs(pred)) {
                    pathIndex = [];
                    var first = true;
                    do {
                        pc.pushPC(pred, pathIndex);
                        console.log("Calling "+ f.values[i].value.name);
                        value = single.invokeFun(iid, base.values[i].value, f.values[i].value, args, isConstructor);
                        console.log("return");
                        ret = addValue(ret, pc.getPC(), value);
                        if (!first) {
                            ret2 = pc.generateInputs();
                        } else {
                            first = false;
                            ret2 = pc.generateInputs(true);

                        }
                        pathIndex = pc.getIndex();
                        pc.popPC();
                    } while(ret2);
                }
            }
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
        left = B(iid, "===", switchLeft, left);

        var i, leni = left.values.length, pred1 = SymbolicBool.false, pred2 = SymbolicBool.false,value, ret;
        for (i=0; i<leni; ++i) {
            pred1 = new SymbolicBool("||",pred1, and(left.values[i].pred, makePredicate(left.values[i].value)));
            pred2 = new SymbolicBool("||",pred2, and(left.values[i].pred, makePredicate(left.values[i].value).not()));
        }
        return pc.branchBoth(pred2, pred1);
    }

    function C(iid, left) {
        var ret;

        lastVal = left;
        left = makePredValues(SymbolicBool.true, left);
        var i, leni = left.values.length, pred1 = SymbolicBool.false, pred2 = SymbolicBool.false,value, ret;
        for (i=0; i<leni; ++i) {
            pred1 = new SymbolicBool("||",pred1, and(left.values[i].pred, makePredicate(left.values[i].value)));
            pred2 = new SymbolicBool("||",pred2, and(left.values[i].pred, makePredicate(left.values[i].value).not()));
        }
        return pc.branchBoth(pred2, pred1);
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

    sandbox.makeSymbolic = makeSymbolic;
    sandbox.addAxiom = pc.addAxiom;
    sandbox.endExecution = endExecution;


}(module.exports));

