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
    var SymbolicLinear = require('./../concolic/SymbolicLinear');
    var SymbolicStringExpression = require('./SymbolicStringExpression');
    var SymbolicStringPredicate = require('./SymbolicStringPredicate');
    var SymbolicBool = require('./../concolic/SymbolicBool');
    var Symbolic = require('./../concolic/Symbolic');
    var SolverEngine = require('./SolverEngine');
    var PredValues = require('./PredValues');
    var getIIDInfo = require('./../../utils/IIDInfo');
    var BDD = require('./BDD');
    var solver = new SolverEngine();
    var PATH_FILE_NAME = 'jalangi_path';
    var fs = require('fs');
    var MAX_PATH_COUNT = 10000;
    var MAX_CALL_DEPTH = 10000;
    var stats = require('../../utils/StatCollector');
    var STAT_FLAG = stats.STAT_FLAG;


    var literalToFormulas = [];
    var formulaCache = {};
    var startCountingOps = false;

    function getBDDFromFormula(formula) {
        if (STAT_FLAG) stats.resumeTimer("bdd");

        if (formula === SymbolicBool.true) {
            if (STAT_FLAG) stats.suspendTimer("bdd");
            return BDD.one;
        }
        if (formula === SymbolicBool.false) {
            if (STAT_FLAG) stats.suspendTimer("bdd");
            return BDD.zero;
        }
        var str = formula.toString();
        var nstr = formula.not().toString();
        var ret;
        if ((ret = formulaCache[str])!== undefined) {
        } else if ((ret = formulaCache[nstr])!== undefined) {
            if (STAT_FLAG) stats.suspendTimer("bdd");
            ret = ret.not();
            if (STAT_FLAG) stats.resumeTimer("bdd");
        } else {
            literalToFormulas.push(formula);
            ret = BDD.build(literalToFormulas.length);
            formulaCache[str] = ret;
        }
        if (STAT_FLAG) stats.suspendTimer("bdd");
        return ret;
    }

    function getFormulaFromBDD(bdd) {
        if (STAT_FLAG) stats.resumeTimer("bdd");
        var ret = BDD.getFormula(bdd, literalToFormulas);
        if (STAT_FLAG) stats.suspendTimer("bdd");
        return ret;
    }



    function isSymbolicString(s) {
        return s instanceof SymbolicStringExpression;
    }

    function isSymbolicNumber(s) {
        return s instanceof SymbolicLinear;
    }


    function isSymbolic(val) {
        if (val === undefined || val === null) {
            return false;
        }
        return val.type === Symbolic;
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
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

    function Frame (pc) {
        this.pathConstraint = pc;
        this.pathIndex = [];
        this.pathCount = 0;
        this.formulaStack = [];
        this.formulaCount = 0;
        this.returnValue = undefined;
        this.index = 0;
        this.aggregatePC = new PredValues();
    }

    Frame.prototype.init = function() {
        this.pathConstraint = new PredValues(BDD.one, true);
        try {
            this.pathIndex = JSON.parse(fs.readFileSync(PATH_FILE_NAME,"utf8"));
            if (this.pathIndex.length === 0) {
                process.exit(0);
            }
        } catch (e) {
            this.pathIndex = [];
            startCountingOps = true;
        }

    };

    Frame.prototype.prepareForNextPath = function(other) {
        this.aggregatePC = other.aggregatePC.or(other.pathConstraint);
        var pathIndex = other.pathIndex;
        if (pathIndex.length<=0) {
            this.pathConstraint = this.aggregatePC;
        } else {
            this.pathConstraint = pathIndex[pathIndex.length-1].pc;
        }
        this.pathCount = other.pathCount + 1;
    };


    Frame.prototype.addAxiom =  function (val, branch) {
        if (val === "begin") {
            this.formulaStack.push("begin");
            this.formulaCount ++;
        } else if (val === "and" || val === "or") {
            val = (val  === "and")?"&&":"||";
            var i, start = -1, len;
            this.formulaCount--;
            len = this.formulaStack.length;
            for(i = len-1; i>=0; i--) {
                if (this.formulaStack[i] === "begin") {
                    start = i+1;
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
            var c1 = getFormulaFromBDD(this.formulaStack[i]);
            var c2;
            while(i < len-1) {
                i++;
                c2 = getFormulaFromBDD(this.formulaStack[i]);
                c1 = new SymbolicBool(val, c1, c2);
            }
            this.formulaStack.splice(start-1,len - start+1);
            this.formulaStack.push(getBDDFromFormula(c1));

        } else if (val === 'ignore') {
            this.formulaStack.pop();
        } else {
//            if (!(val instanceof BDD.Node)) {
//                throw new Error(val+" must of type Node");
//            }
            if (branch !== undefined) {
                if (!branch){
                    val = val.not();
                }
            }
            this.formulaStack.push(val);
        }

        if (this.formulaCount===0 && this.formulaStack.length > 0 ) {
            var tmp = this.formulaStack.pop();
            this.pathConstraint = tmp;
            if (this.pathConstraint.isZero()) {
                throw new Error("Throwing exception to prune infeasible path.");
            }
        }
    };




    Frame.prototype.backtrack = function() {
        var elem;

        while(this.pathIndex.length > 0) {
            elem = this.pathIndex.pop();
            if (!elem.done) {
                this.pathIndex.push({done: true, branch: !elem.branch,
                    pc: elem.pc, lastVal: elem.lastVal, iid: elem.iid,
                    counterIndex: elem.counterIndex, count: elem.count});
                break;
            }
        }
        this.index = 0;
        if (this.pathCount > MAX_PATH_COUNT) {
            this.pathIndex = [];
        }
        var ret = (this.pathIndex.length > 0);
        return ret;
    };

    Frame.prototype.setNextPathIndexElement = function (elem) {
        this.pathIndex[this.index++] = elem;
    };


    Frame.prototype.getNextPathIndexElement = function() {
        var ret = this.pathIndex[this.index++];
        if (ret === undefined) {
            this.index--;
        }
        return ret;
    };






    var frame = new Frame();
    frame.init();
    var frameStack = [];

    function pushFrame(pc) {
        frameStack.push(frame);

        frame = new Frame(pc);
    }

    function popFrame() {
        frame = frameStack.pop();
        return frame;
    }

    function resetFrame(returnVal, ignore) {
        var tmpFrame = new Frame();
        tmpFrame.pathIndex = frame.pathIndex;
        tmpFrame.prepareForNextPath(frame);

        if (ignore) {
            tmpFrame.aggregatePC = frame.aggregatePC;
            tmpFrame.pathCount = frame.pathCount;
            tmpFrame.returnValue = frame.returnValue;
        } else {
            tmpFrame.returnValue = returnVal;
        }

        var ret = (frame.pathIndex.length>0);
        frame = tmpFrame;
        return ret;
    }


    function getPathCount() {
        return frame.pathCount;
    }

    function getReturnVal() {
        return frame.returnValue;
    }

    function getAggregatePC() {
        return frame.aggregatePC;
    }

    function getPC() {
        return frame.pathConstraint;
    }

    function setPC(c) {
        frame.pathConstraint = c;
    }

    function isRetracing() {
        return !!frame.pathIndex[frame.index];
    }

    function addAxiom(val, branch) {
        frame.addAxiom(val, branch);
    }



    var pathPerFunctionCounter = [];

    function functionEnter() {
        var v;
        if ((v=frame.getNextPathIndexElement()) === undefined) {
            frame.setNextPathIndexElement(v = {count: 0, done:true})
        }
        pathPerFunctionCounter.push(frame.index-1);
    }

    function getCounterIndex() {
        return pathPerFunctionCounter[pathPerFunctionCounter.length-1];
    }

    function functionExit() {
        pathPerFunctionCounter.pop();
    }


    function getSolutionAll(pred) {
        var i, len = pred.values.length, ret = new PredValues(), soln, tmp;

        for (i=0; i<len; i++) {
            var c = pred.values[i].pred;
            c = getFormulaFromBDD(c);
            tmp = solver.generateInputs(c);
            if (tmp) {
                if (STAT_FLAG) stats.addToCounter("sat");

//                if (STAT_FLAG) stats.addToCounter("inputs");
                ret.addValue(pred.values[i].pred, pred.values[i].value);
                soln = tmp;
            } else {
                if (STAT_FLAG) stats.addToCounter("unsat");
            }
        }
        return {pc:ret, solution:soln};
    }

    function createBothConstraints(pc, val, makePredicate) {
        var i, leni = val.values.length, c, pred1 = new PredValues(), pred2 = new PredValues(), tmp, soln1, soln2;
        for (i = 0; i < leni; ++i) {
            c = makePredicate(val.values[i].value);
            c = getBDDFromFormula(c);
            if (c.isOne()) {
                pred1 = pred1.or(pc.and(val.values[i].pred));
            } else if (c.isZero()) {
                pred2 = pred2.or(pc.and(val.values[i].pred));
            } else {
                tmp = getSolutionAll(pc.and(val.values[i].pred.and(c)));
                if (!tmp.pc.isZero()) {
                    soln1 = tmp.solution;
                    pred1 = pred1.or(tmp.pc);
                }
                tmp = getSolutionAll(pc.and(val.values[i].pred.and(c.not())));
                if (!tmp.pc.isZero()) {
                    soln2 = tmp.solution;
                    pred2 = pred2.or(tmp.pc);
                }
            }
        }
        return {truePc: pred1, falsePc: pred2, trueSolution: soln1, falseSolution:soln2};
    }


    function branchBoth(iid, pc, val, lastVal, makePredicate) {
        var v, ret, tmp, trueBranch, falseBranch;
        if ((v = frame.getNextPathIndexElement()) !== undefined) {
            ret = v;
        } else {
            tmp = createBothConstraints(pc, val, makePredicate);
            trueBranch = tmp.truePc;
            falseBranch = tmp.falsePc;
            if (!falseBranch.isZero()) {
                if (!trueBranch.isZero()) {
                    frame.setNextPathIndexElement({done:false, branch:false, pc: tmp.truePc, lastVal: lastVal, iid: iid});
                } else {
                    frame.setNextPathIndexElement({done:true, branch:false, pc: null, lastVal: lastVal, iid: iid});

                }
                ret = false;
                frame.addAxiom(falseBranch, true);
            } else if (!trueBranch.isZero()) {
                if (!falseBranch.isZero()) {
                    frame.setNextPathIndexElement({done:false, branch:true, pc: tmp.falsePc, lastVal: lastVal, iid:iid});
                } else {
                    frame.setNextPathIndexElement({done:true, branch:true, pc: null, lastVal: lastVal, iid:iid});
                }
                ret = true;
                frame.addAxiom(trueBranch, true);
            } else {
                frame.pathConstraint = new PredValues();
                throw new Error("Throwing exception to prune infeasible path.");
            }
        }
        return ret;
    }

    function concretize(val) {
        if (!isSymbolic(val)) {
            return val;
        } else {
            return val.substitute(J$.inputs);
        }

//        throw new Error("Concretization of symbolic value is not supported");
    }


    function backtrack() {
        return frame.backtrack();
    }

    function isStartCountingOps() {
        return startCountingOps;
    }

    function getMAX_CALL_DEPTH() {
        return MAX_CALL_DEPTH;
    }

    sandbox.addAxiom = addAxiom;
    sandbox.concretize = concretize;
    sandbox.getBDDFromFormula = getBDDFromFormula;
    sandbox.backtrack = backtrack;
    sandbox.functionEnter = functionEnter;
    sandbox.functionExit = functionExit;
    sandbox.getMAX_CALL_DEPTH = getMAX_CALL_DEPTH;


    sandbox.popFrame = popFrame;
    sandbox.pushFrame = pushFrame;
    sandbox.resetFrame = resetFrame;
    sandbox.getPC = getPC;
    sandbox.setPC = setPC;
    sandbox.branchBoth = branchBoth;
    sandbox.getFormulaFromBDD = getFormulaFromBDD;
    sandbox.getReturnVal = getReturnVal;
    sandbox.isRetracing = isRetracing;
    sandbox.getAggregatePC = getAggregatePC;
    sandbox.startCountingOps = isStartCountingOps;

}(module.exports));

