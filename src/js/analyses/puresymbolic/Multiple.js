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
    var single = require('./Single');
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
        if (!ret) {
            ret = new PredValues(pred, value);
        } else {
            ret.addValue(pred, value);
        }
        return ret;
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
                pred = and(left.values[i].pred, right.values[i].pred);
                pred = and(pc.getPC(), pred);

                if (solver.generateInputs(pred)) {
                    pc.pushPC(pred);
                    if (op !== undefined) {
                        value = single.B(iid, op, left.values[i].value, right.values[i].value);
                    } else {
                        value = single.G(iid, left.values[i].value, right.values[i].value);
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
                    pc.pushPC(pred);
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

        var i, j, leni = base.values.length, lenj = f.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(base.values[i].pred, f.values[i].pred);
                pred = and(pc.getPC(), pred);

                if (solver.generateInputs(pred)) {
                    pc.pushPC(pred);
                    value = single.invokeFun(iid, base.values[i].value, f.values[i].value, args, isConstructor);
                    ret = addValue(ret, pc.getPC(), value);
                    pc.popPC();
                }
            }
        }
        return ret;
    };




}(module.exports));

