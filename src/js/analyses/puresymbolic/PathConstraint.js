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
    var getIIDInfo = require('./../../utils/IIDInfo');
    var BDD = require('./BDD');
    var solver = new SolverEngine();
    var PATH_FILE_NAME = 'jalangi_path';
    var fs = require('fs');
    var MAX_PATH_COUNT = 10;
    var MAX_CALL_DEPTH = 10;

//    var pathConstraint = BDD.one;
//    var pathIndex;
//    try {
//        pathIndex = JSON.parse(fs.readFileSync(PATH_FILE_NAME,"utf8"));
//        if (pathIndex.length === 0) {
//            process.exit(0);
//        }
//    } catch (e) {
//        pathIndex = [];
//    }
//    var index = 0;
//    var formulaStack = [];
//    formulaStack.count = 0;
//    var solution = pathIndex.length>0? pathIndex[pathIndex.length-1].solution: null;
//    var pathCount = 0;
//    var returnValue;
//    var aggregatePC;

    var literalToFormulas = [];
    var formulaCache = {};
    var startCountingOps = false;

    function getBDDFromFormula(formula) {
        if (formula === SymbolicBool.true) {
            return BDD.one;
        }
        if (formula === SymbolicBool.false) {
            return BDD.zero;
        }
        var str = formula.toString();
        var nstr = formula.not().toString();
        var ret;
        if ((ret = formulaCache[str])!== undefined) {
            return ret;
        } else if ((ret = formulaCache[nstr])!== undefined) {
            return ret.not();
        } else {
            literalToFormulas.push(formula);
            ret = BDD.build(literalToFormulas.length);
            formulaCache[str] = ret;
            return ret;
        }
    }

    function getFormulaFromBDD(bdd) {
        return BDD.getFormula(bdd, literalToFormulas);
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

    function Frame (pc, solution) {
        this.pathConstraint = pc;
        this.pathIndex = [];
        this.pathCount = 0;
        this.formulaStack = [];
        this.formulaCount = 0;
        this.returnValue = undefined;
        this.index = 0;
        this.aggregatePC = BDD.zero;
        this.solution = solution;
    }

    Frame.prototype.init = function() {
        this.pathConstraint = BDD.one;
        try {
            this.pathIndex = JSON.parse(fs.readFileSync(PATH_FILE_NAME,"utf8"));
            if (this.pathIndex.length === 0) {
                process.exit(0);
            }
        } catch (e) {
            this.pathIndex = [];
            startCountingOps = true;
        }
        this.solution = this.pathIndex.length>0? this.pathIndex[this.pathIndex.length-1].solution: null;

    };

    Frame.prototype.prepareForNextPath = function(other) {
        this.aggregatePC = other.aggregatePC.or(other.pathConstraint);
        var pathIndex = other.pathIndex;
        if (pathIndex.length<=0) {
            this.solution = other.solution;
            this.pathConstraint = this.aggregatePC;
        } else {
            this.solution = pathIndex[pathIndex.length-1].solution;
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
            if (!(val instanceof BDD.Node)) {
                throw new Error(val+" must of type Node");
            }
            if (branch !== undefined) {
                if (!branch){
                    val = val.not();
                }
            }
            this.formulaStack.push(val);
        }

        if (this.formulaCount===0 && this.formulaStack.length > 0 ) {
            var tmp = this.formulaStack.pop();
            this.pathConstraint = this.pathConstraint.and(tmp);
            if (this.pathConstraint.isZero()) {
                throw new Error("Throwing exception to prune infeasible path.");
            }
        }
    };

    Frame.prototype.updateSolution = function() {
        this.solution = combine(J$.inputs, this.solution);
        var f = getFormulaFromBDD(this.pathConstraint);
        var concrete = f.substitute(this.solution);
        if (concrete === SymbolicBool.false) {
            concrete = f;
        }
        if (concrete !== SymbolicBool.true) {
            if (isSymbolic(concrete)) {
                var tmp = solver.generateInputs(concrete);
                if (tmp) {
                    this.solution = combine(this.solution, tmp);
                } else {
                    this.solution = undefined;
                }
            }
        }
    };

    Frame.prototype.updateSolutionIfSatisfiable = function(pred) {
        this.updateSolution();
        var f = getFormulaFromBDD(pred);
        var concrete = f.substitute(this.solution);
        if (concrete === SymbolicBool.false) {
            return false;
        } else if (concrete === SymbolicBool.true) {
            return true;
        } else if (isSymbolic(concrete)) {
            var tmp = solver.generateInputs(concrete);
            if (tmp) {
                this.solution = combine(this.solution, tmp);
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error("This is bad.  Should not be reachable "+concrete);
        }
    };


    Frame.prototype.generateInputs = function(forceWrite, forSingle) {
        var elem;

        while(this.pathIndex.length > 0) {
            elem = this.pathIndex.pop();
            if (!elem.done && (!forSingle || (this.pathIndex[elem.counterIndex].count <= MAX_PATH_COUNT))) {
                this.pathIndex.push({done: true, branch: !elem.branch, solution: elem.solution,
                    pc: elem.pc, lastVal: elem.lastVal, iid: elem.iid,
                    counterIndex: elem.counterIndex, count: elem.count});
                if (forSingle) {
                    this.pathIndex[elem.counterIndex].count++;
                }
                break;
            }
        }
        this.index = 0;


        this.updateSolution();
        var ret = (this.pathIndex.length > 0);
        if (this.solution && (ret || forceWrite)) {
            solver.writeInputs(this.solution, []);
        }

        if (this.pathCount > MAX_PATH_COUNT) {
            this.pathIndex = [];
        }
        fs.writeFileSync(PATH_FILE_NAME,JSON.stringify(this.pathIndex),"utf8");
        return this.solution;
    };

    Frame.prototype.makeConcrete = function(pred, branch) {
        this.updateSolution();
        var c = branch?pred:pred.not();
        if ((c instanceof BDD.Node)) {
            c = getFormulaFromBDD(c);
        }
        var concrete = c.substitute(this.solution);
        if (concrete === SymbolicBool.true) {
            return true;
        } else if (concrete === SymbolicBool.false) {
            return false;
        }
        if (isSymbolic(concrete)) {
            throw new Error("Throwing exception to prune infeasible path.");
        } else {
            return concrete;
        }
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
        var solution = frame.solution;
        frameStack.push(frame);

        frame = new Frame(pc, solution);
    }

    function popFrame() {
        var solution = frame.solution;
        frame = frameStack.pop();
        frame.solution = solution;
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


    function getSolution(pred, branch) {
        var c = frame.pathConstraint.and(branch?pred:pred.not());
        c = getFormulaFromBDD(c);
        return solver.generateInputs(c);
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

    function branch(val) {
        var v, ret, tmp;
        if (!(val instanceof BDD.Node)) {
            throw new Error(val+" must of type Node");
        }
        if ((v = frame.getNextPathIndexElement()) !== undefined) {
            frame.addAxiom(val, ret = v.branch);
        } else {
            startCountingOps = true;
            if (frame.makeConcrete(val, false)) {
                if (tmp = getSolution(val, true)) {
                    frame.setNextPathIndexElement({done:false, branch:false, solution: tmp, counterIndex: getCounterIndex()});
                } else {
                    frame.setNextPathIndexElement({done:true, branch:false, solution: tmp, counterIndex: getCounterIndex()});
                }
                frame.addAxiom(val, ret = false);
            } else if (frame.makeConcrete(val, true)) {
                if (tmp = getSolution(val, false)) {
                    frame.setNextPathIndexElement({done:false, branch:true, solution: tmp, counterIndex: getCounterIndex()});
                    //console.log("Solution (else) "+JSON.stringify(tmp)+" for pc = "+getFormulaFromBDD(val));
                } else {
                    frame.setNextPathIndexElement({done:true, branch:true, solution: tmp, counterIndex: getCounterIndex()});
                }
                frame.addAxiom(val, ret = true);
            } else {
                frame.pathConstraint = BDD.zero;
                throw new Error("Throwing exception to prune infeasible path.");
            }
        }
        return ret;
    }


    function branchBoth(iid, falseBranch, trueBranch, lastVal) {
        var v, ret, tmp;
        if ((v = frame.getNextPathIndexElement()) !== undefined) {
            ret = v;
        } else {
            if (frame.updateSolutionIfSatisfiable(falseBranch)) {
                if (tmp = getSolution(trueBranch, true)) {
                    frame.setNextPathIndexElement({done:false, branch:false, solution: tmp, pc: trueBranch, lastVal: lastVal, iid: iid});
                } else {
                    frame.setNextPathIndexElement({done:true, branch:false, solution: null, pc: null, lastVal: lastVal, iid: iid});

                }
                ret = false;
                frame.addAxiom(falseBranch, true);
            } else if (frame.updateSolutionIfSatisfiable(trueBranch)) {
                if (tmp = getSolution(falseBranch, true)) {
                    frame.setNextPathIndexElement({done:false, branch:true, solution: tmp, pc: falseBranch, lastVal: lastVal, iid:iid});
                } else {
                    frame.setNextPathIndexElement({done:true, branch:true, solution: null, pc: null, lastVal: lastVal, iid:iid});
                }
                ret = true;
                frame.addAxiom(trueBranch, true);
            } else {
                frame.pathConstraint = BDD.zero;
                throw new Error("Throwing exception to prune infeasible path.");
            }
        }
        return ret;
    }

    function concretize(val) {
        if (!isSymbolic(val)) {
            return val;
        }

        var concrete = frame.makeConcrete(val, true);
        if (typeof concrete === 'boolean') {
            J$.addAxiom(val);
        } else if (isSymbolicNumber(val)) {
            J$.addAxiom(val.subtractLong(concrete).setop("=="));
        } else if (isSymbolicString(val)) {
            J$.addAxiom(new SymbolicStringPredicate("==", val, concrete));
        } else {
            throw new Error("Unknown symbolic type "+val+ " with path constraint "+ getPC());
        }
        return concrete;
    }


    function generateInputs(forceWrite, forSingle) {
        return frame.generateInputs(forceWrite, forSingle);
    }

    function isStartCountingOps() {
        return startCountingOps;
    }

    function getMAX_CALL_DEPTH() {
        return MAX_CALL_DEPTH;
    }

    sandbox.addAxiom = addAxiom;
    sandbox.branch = branch;
    sandbox.concretize = concretize;
    sandbox.getBDDFromFormula = getBDDFromFormula;
    sandbox.generateInputs = generateInputs;
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

