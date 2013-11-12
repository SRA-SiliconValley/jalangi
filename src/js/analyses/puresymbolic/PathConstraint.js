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

    var pathConstraint = BDD.one;
    var pathIndex;
    try {
        pathIndex = JSON.parse(fs.readFileSync(PATH_FILE_NAME,"utf8"));
        if (pathIndex.length === 0) {
            process.exit(0);
        }
    } catch (e) {
        pathIndex = [];
    }
    var index = 0;
    var formulaStack = [];
    formulaStack.count = 0;
    var solution = pathIndex.length>0? pathIndex[pathIndex.length-1].solution: null;
    var pathCount = 0;
    var returnValue;
    var aggregatePC;

    var pcStack = [];


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

    function pushPC(pc) {
        pcStack.push({pc:pathConstraint, path:pathIndex, index:index, formulaStack:formulaStack, solution: solution, pathCount:pathCount, returnVal: returnValue, aggrPC: aggregatePC });

        index = 0;
        formulaStack = [];
        formulaStack.count = 0;
        pathIndex = [];
        pathConstraint = pc;
        pathCount = 0;
        returnValue = undefined;
        aggregatePC = undefined;
    }

    function popPC() {
        pathConstraint = pcStack[pcStack.length-1].pc;
        pathIndex = pcStack[pcStack.length-1].path;
        index = pcStack[pcStack.length-1].index;
        formulaStack = pcStack[pcStack.length-1].formulaStack;
//        solution = pcStack[pcStack.length-1].solution;
        pathCount = pcStack[pcStack.length-1].pathCount;
        returnValue = pcStack[pcStack.length-1].returnVal;
        aggregatePC = pcStack[pcStack.length-1].aggrPC;

        return pcStack.pop();
    }

    function resetPC(returnVal, pad) {
        index = 0;
        formulaStack = [];
        formulaStack.count = 0;
        if (pathCount==0) {
            aggregatePC = pathConstraint;
        } else {
            aggregatePC = aggregatePC.or(pathConstraint);
        }
        if (pathIndex.length<=0) {
            pathConstraint = aggregatePC;
            console.log(pad+"Done with all paths.");
        } else {
            solution = pathIndex[pathIndex.length-1].solution;
            pathConstraint = pathIndex[pathIndex.length-1].pc;
        }
        console.log(pad+"Aggregate path constraint "+pathConstraint.toString());
        console.log(pad+getFormulaFromBDD(pathConstraint).toString());
        console.log(pad+"Return value "+returnVal);

        pathCount++;
        returnValue = returnVal;
    }


    function getPathCount() {
        return pathCount;
    }

    function getReturnVal() {
        return returnValue;
    }

    function getPC() {
        return pathConstraint;
    }

    function setPC(c) {
        pathConstraint = c;
    }

    function getNext() {
        var ret = pathIndex[index++];
        if (ret === undefined) {
            index--;
        }
        return ret;
    }

    function isRetracing() {
        return !!pathIndex[index];
    }

    function setNext(elem) {
        pathIndex[index++] = elem;
    }

    function addAxiom(val, branch) {
        if (val === "begin") {
            formulaStack.push("begin");
            formulaStack.count ++;
        } else if (val === "and" || val === "or") {
            val = (val  === "and")?"&&":"||";
            var i, start = -1, len;
            formulaStack.count--;
            len = formulaStack.length;
            for(i = len-1; i>=0; i--) {
                if (formulaStack[i] === "begin") {
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
            var c1 = getFormulaFromBDD(formulaStack[i]);
            var c2;
            while(i < len-1) {
                i++;
                c2 = getFormulaFromBDD(formulaStack[i]);
                c1 = new SymbolicBool(val, c1, c2);
            }
            formulaStack.splice(start-1,len - start+1);
            formulaStack.push(getBDDFromFormula(c1));

        } else if (val === 'ignore') {
            formulaStack.pop();
        } else {
            if (!(val instanceof BDD.Node)) {
                throw new Error(val+" must of type Node");
            }
            if (branch !== undefined) {
                if (!branch){
                    val = val.not();
                }
            }
            formulaStack.push(val);
        }

        if (formulaStack.count===0 && formulaStack.length > 0 ) {
            var tmp = formulaStack.pop();
            pathConstraint = pathConstraint.and(tmp);
        }
    }

    var literalToFormulas = [];
    var formulaCache = {};

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

    function updateSolution() {
        solution = combine(J$.inputs, solution);
        var f = getFormulaFromBDD(pathConstraint);
        var concrete = f.substitute(solution);
        if (concrete === SymbolicBool.false) {
            concrete = f;
        }
        if (concrete === SymbolicBool.true) {
            //console.log("Current solution loc 1 "+JSON.stringify(solution));
            return;
        } else if (isSymbolic(concrete)) {
            var tmp = solver.generateInputs(concrete);
            if (tmp) {
                solution = combine(solution, tmp);
                //console.log("Current solution loc 2 "+JSON.stringify(solution));
            } else {
                throw new Error("Not reachable");
            }
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

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function makeConcrete(pred, branch) {
        updateSolution();
        var c = branch?pred:pred.not();
        if ((c instanceof BDD.Node)) {
            c = getFormulaFromBDD(c);
        }
//        solution = combine(J$.inputs, solution);
        var concrete = c.substitute(solution);
        if (concrete === SymbolicBool.true) {
            return true;
        } else if (concrete === SymbolicBool.false) {
            return false;
        }
        if (isSymbolic(concrete)) {
            throw new Error("Not reachable");
        } else {
            return concrete;
        }
    }

    function getSolution(pred, branch) {
        var c = pathConstraint.and(branch?pred:pred.not());
        c = getFormulaFromBDD(c);
        return solver.generateInputs(c);
    }

    function branch(val) {
        var v, ret, tmp;
        if (!(val instanceof BDD.Node)) {
            throw new Error(val+" must of type Node");
        }
        if ((v = getNext()) !== undefined) {
            addAxiom(val, ret = v.branch);
        } else {
            if (makeConcrete(val, false)) {
                if (tmp = getSolution(val, true)) {
                    setNext({done:false, branch:false, solution: tmp});
                } else {
                    setNext({done:true, branch:false, solution: tmp});
                }
                addAxiom(val, ret = false);
            } else if (makeConcrete(val, true)) {
                if (tmp = getSolution(val, false)) {
                    setNext({done:false, branch:true, solution: tmp});
                    //console.log("Solution (else) "+JSON.stringify(tmp)+" for pc = "+getFormulaFromBDD(val));
                } else {
                    setNext({done:true, branch:true, solution: tmp});
                }
                addAxiom(val, ret = true);
            } else {
                throw new Error("Both branches are not feasible.  This is not possible.")
            }
        }
        return ret;
    }


    function isSatisfiable(pred) {
        updateSolution();
        var f = getFormulaFromBDD(pred);
        var concrete = f.substitute(solution);
        if (concrete === SymbolicBool.false) {
            return false;
        } else if (concrete === SymbolicBool.true) {
            return true;
        } else if (isSymbolic(concrete)) {
            var tmp = solver.generateInputs(concrete);
            if (tmp) {
                solution = combine(solution, tmp);
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error("Should not be reachable "+concrete);
        }
    }

    function branchBoth(iid, falseBranch, trueBranch, lastVal) {
        var v, ret, tmp;
        if ((v = getNext()) !== undefined) {
            ret = v;
            //addAxiom(ret?trueBranch:falseBranch, true);
        } else {
            if (isSatisfiable(falseBranch)) {
                if (tmp = getSolution(trueBranch, true)) {
                    setNext({done:false, branch:false, solution: tmp, pc: trueBranch, lastVal: lastVal, iid: iid});
                    //console.log("At "+getIIDInfo(iid)+" solution (then) "+JSON.stringify(tmp)+" for pc = "+getFormulaFromBDD(trueBranch));
                } else {
                    setNext({done:true, branch:false, solution: null, pc: null, lastVal: lastVal, iid: iid});
                    //console.log("At "+getIIDInfo(iid)+" no solution (then) for pc = "+getFormulaFromBDD(trueBranch));

                }
                ret = false;
                addAxiom(falseBranch, true);
            } else if (isSatisfiable(trueBranch)) {
                if (tmp = getSolution(falseBranch, true)) {
                    setNext({done:false, branch:true, solution: tmp, pc: falseBranch, lastVal: lastVal, iid:iid});
                    //console.log("At "+getIIDInfo(iid)+" solution (else) "+JSON.stringify(tmp)+" for pc = "+getFormulaFromBDD(falseBranch));
                } else {
                    setNext({done:true, branch:true, solution: null, pc: null, lastVal: lastVal, iid:iid});
                    //console.log("At "+getIIDInfo(iid)+" no solution (else) for pc = "+getFormulaFromBDD(falseBranch));
                }
                ret = true;
                addAxiom(trueBranch, true);
            } else {
                throw new Error("Both branches are not feasible.  This is not possible.")
            }
        }
        return ret;
    }

    function concretize(val) {
        if (!isSymbolic(val)) {
            return val;
        }

        //console.log("/");
        //console.log("Warning: concretizing a symbolic value "+val);

        var concrete = makeConcrete(val, true);
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


    function generateInputs(forceWrite) {
        var elem;

        while(pathIndex.length > 0) {
            elem = pathIndex.pop();
            if (!elem.done) {
                pathIndex.push({done: true, branch: !elem.branch, solution: elem.solution, pc: elem.pc, lastVal: elem.lastVal, iid: elem.iid});
                break;
            }
        }
        index = 0;


        fs.writeFileSync(PATH_FILE_NAME,JSON.stringify(pathIndex),"utf8");

        updateSolution();
        var ret = (pathIndex.length > 0);
        if (ret || forceWrite) {
            //console.log("Writing the input "+JSON.stringify(solution));
            solver.writeInputs(solution, []);
            //console.log("-------------");
            //console.log("nLiterals "+literalToFormulas.length+" "+JSON.stringify(literalToFormulas));
        } else {
            //console.log("Not writing the input "+JSON.stringify(solution));
        }

        if (pathCount > MAX_PATH_COUNT) {
            pathIndex = [];
        }
        ret = (pathIndex.length > 0)?"backtrack at "+getIIDInfo(elem.iid):false;
        return ret;
    }

    sandbox.addAxiom = addAxiom;
    sandbox.popPC = popPC;
    sandbox.pushPC = pushPC;
    sandbox.resetPC = resetPC;
    sandbox.getPC = getPC;
    sandbox.setPC = setPC;
    sandbox.getPathCount = getPathCount;
    sandbox.concretize = concretize;
    sandbox.branch = branch;
    sandbox.branchBoth = branchBoth;
    sandbox.generateInputs = generateInputs;
    sandbox.getFormulaFromBDD = getFormulaFromBDD;
    sandbox.getBDDFromFormula = getBDDFromFormula;
    sandbox.getReturnVal = getReturnVal;
    sandbox.isRetracing = isRetracing;

}(module.exports));

