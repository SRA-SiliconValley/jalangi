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

    var SymbolicBool = require('../concolic/SymbolicBool');
    var SolverEngine = require('./SolverEngine');
    var solver = new SolverEngine();

    function PredValues(pred, value) {
        if (!(this instanceof pred)) {
            return new PredValues(pred, value)
        }

        if (pred instanceof PredValues) {
            this.values = [];
            var i, len = pred.values.length;
            for (i=0; i<len; ++i) {
                this.values[i] = pred.values[i];
            }
        } else {
            this.values = [];
            this.values[0] = {pred: pred, value: value};
        }
    }

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

    PredValues.update = function(pc, oldValue, newValue) {
        var ret;
        oldValue = makePredValues(SymbolicBool.true, oldValue);
        newValue = makePredValues(pc, newValue);


        var i, len, pred, notPc = pc.not();
        len = newValue.values.length;
        for (i=0; i<len; ++i) {
            pred = and(newValue.values[i].pred, pc);
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


    PredValues.binary = function (pc, fun, iid, op, left, right) {
        left = makePredValues(SymbolicBool.true, left);
        right = makePredValues(SymbolicBool.true, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(left.values[i].pred, right.values[i].pred);
                pred = and(pc, pred);

                if (solver.generateInputs(pred)) {
                    if (op !== undefined) {
                        value = fun(iid, op, left.values[i].value, right.values[i].value);
                    } else {
                        value = fun(iid, left.values[i].value, right.values[i].value);
                    }
                    ret = addValue(ret, pred, value);
                }
            }
        }
        return ret;
    };

    PredValues.unary = function (pc, fun, iid, op, left) {
        left = makePredValues(SymbolicBool.true, left);

        var i, leni = left.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            pred = and(pc, left.values[i].pred);

            if (solver.generateInputs(pred)) {
                value = fun(iid, op, left.values[i].value);
                ret = addValue(ret, pred, value);
            }
        }
        return ret;
    };

    PredValues.getField = function(pc, fun, iid, base, offset) {
        return PredValues.binary(pc, func, iid, undefined, base, offset);
    };

    PredValues.putField = function (pc, fung, funp, iid, left, right, val) {
        left = makePredValues(SymbolicBool.true, left);
        right = makePredValues(SymbolicBool.true, right);

        var i, j, leni = left.values.length, lenj = right.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(left.values[i].pred, right.values[i].pred);
                pred = and(pc, pred);

                if (solver.generateInputs(pred)) {
                    var base = left.values[i].value;
                    var offset = right.values[i].value;
                    var oldValue = fung(iid, base, offset);
                    funp(iid, base, offset, PredValues.update(pred, oldValue, val));
                }
            }
        }
        return ret;
    };


    PredValues.invokeFun = function(pc, fun, iid, base, f, args, isConstructor) {
        base = makePredValues(SymbolicBool.true, base);
        f = makePredValues(SymbolicBool.true, f);

        var i, j, leni = base.values.length, lenj = f.values.length, pred, value, ret;
        for (i=0; i<leni; ++i) {
            for (j=0; j<lenj; ++j) {
                pred = and(base.values[i].pred, f.values[i].pred);
                pred = and(pc, pred);

                if (solver.generateInputs(pred)) {
                    value = fun(iid, base.values[i].value, f.values[i].value, args, isConstructor);
                    ret = addValue(ret, pred, value);
                }
            }
        }
        return ret;
    };


    PredValues.prototype = {
        constructor: PredValues,

        addValue: function(pred, value) {
          this.values.push({pred: pred, value: value});
        },

        toString: function() {
            var i, len = this.values.length, sb = "[";

            for (i=0; i<len; ++i) {
                   sb = sb + "{ pred: "+this.values[i].pred.toString()+"\n, value: "+ this.values[i].value+"},\n";
            }
            sb = sb +"]\n";
        }
    }

    module.exports = PredValues;
}(module));


