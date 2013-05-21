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
    var BDD = require('./BDD');
    var solver = new SolverEngine();
    var PATH_FILE_NAME = 'jalangi_path';
    var fs = require('fs');

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
    var solution = pathIndex.length>0? pathIndex[pathIndex.length-1].solution: null;

    var index = 0;
    var formulaStack = [];
    formulaStack.count = 0;
    var first = true;
    var returnValue;

    var pcStack = [];
//    pcStack.push({pc:pathConstraint, path:pathIndex, index:index, formulaStack:formulaStack});


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

    function pushPC(pc, pi, isNotFirst, returnVal) {
        pcStack.push({pc:pathConstraint, path:pathIndex, index:index, formulaStack:formulaStack, solution: solution, first:first, returnVal: returnValue });
        pathConstraint = pc;
        pathIndex = pi;
        index = 0;
        formulaStack = [];
        formulaStack.count = 0;
        solution = pathIndex.length>0? pathIndex[pathIndex.length-1].solution: null;
        first = !isNotFirst;
        returnValue = returnVal;
    }

    function popPC() {
        pathConstraint = pcStack[pcStack.length-1].pc;
        pathIndex = pcStack[pcStack.length-1].path;
        index = pcStack[pcStack.length-1].index;
        formulaStack = pcStack[pcStack.length-1].formulaStack;
        solution = pcStack[pcStack.length-1].solution;
        first = pcStack[pcStack.length-1].first;
        returnValue = pcStack[pcStack.length-1].returnVal;

        return pcStack.pop();
    }

    function isFirst() {
        return first;
    }

    function getReturnVal() {
        return returnValue;
    }

    function getPC() {
        return pathConstraint;
    }

    function getIndex() {
        return pathIndex;
    }

    function setIndex(idx) {
        pathIndex = idx;
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
            val = (val==='and')?"&&":"||";
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
            var c1 = formulaStack[i];
            var c2;
            while(i < len-1) {
                i++;
                c2 = formulaStack[i];
                c1 = new SymbolicBool(val, c1, c2);
            }
            formulaStack.splice(start-1,len - start+1);
            formulaStack.push(c1);

        } else if (val === 'ignore') {
            formulaStack.pop();
        } else {
            if (branch !== undefined) {
                if (!(val instanceof BDD.Node)) {
                    throw new Error(val+" must of type Node");
                }
                if (!branch){
                    val = val.not();
                }
            } else if (!isSymbolic(val)) {
                if (val) {
                    val = SymbolicBool.true;
                } else {
                    val = SymbolicBool.false;
                }
            }
            formulaStack.push(val);
        }

        if (formulaStack.count===0 && formulaStack.length > 0 ) {
            var tmp = formulaStack.pop();
            if (!(tmp instanceof BDD.Node)) {
                tmp = getBDDFromFormula(tmp);
            }
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
            return;
        } else if (isSymbolic(concrete)) {
            var tmp = solver.generateInputs(concrete);
            if (tmp) {
                solution = combine(solution, tmp);
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
            val = getBDDFromFormula(val);
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


    function branchBoth(falseBranch, trueBranch) {
        var v, ret, tmp;
        if ((v = getNext()) !== undefined) {
            ret = v.branch;
            //addAxiom(ret?trueBranch:falseBranch, true);
        } else {
            if (makeConcrete(falseBranch, true)) {
                if (tmp = getSolution(trueBranch, true)) {
                    setNext({done:false, branch:false, solution: tmp, pc: trueBranch});
                    console.log("Solution "+JSON.stringify(tmp));
                } else {
                    setNext({done:true, branch:false, solution: null, pc: null});
                }
                ret = false;
                addAxiom(falseBranch, true);
            } else if (makeConcrete(trueBranch, true)) {
                if (tmp = getSolution(falseBranch, true)) {
                    setNext({done:false, branch:true, solution: tmp, pc: trueBranch});
                    console.log("Solution "+JSON.stringify(tmp));
                } else {
                    setNext({done:true, branch:true, solution: null, pc: null});
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

        console.log("Warning: concretizing a symbolic value "+val);

        var concrete = makeConcrete(val, true);
        if (typeof concrete === 'boolean') {
            addAxiom(val);
        } else if (isSymbolicNumber(val)) {
            addAxiom(val.subtractLong(concrete).setop("=="));
        } else if (isSymbolicString(val)) {
            addAxiom(new SymbolicStringPredicate("==", val, concrete));
        } else {
            throw new Error("Unknown symbolic type "+val+ " with path constraint "+ getPC());
        }
        return concrete;
    }


    function generateInputs(noWrite) {
        var elem;

        while(pathIndex.length > 0) {
            elem = pathIndex.pop();
            if (!elem.done) {
                pathIndex.push({done: true, branch: !elem.branch, solution: elem.solution});
                break;
            }
        }
        index = 0;


        fs.writeFileSync(PATH_FILE_NAME,JSON.stringify(pathIndex),"utf8");

        if (!solution) {
            updateSolution();
        }
        if (!noWrite) {
            solver.writeInputs(solution, []);
            console.log("-------------");
            //console.log("nLiterals "+literalToFormulas.length+" "+JSON.stringify(literalToFormulas));
        }
        return pathIndex.length > 0;
    }

    sandbox.addAxiom = addAxiom;
    sandbox.popPC = popPC;
    sandbox.pushPC = pushPC;
    sandbox.getPC = getPC;
    sandbox.isFirst = isFirst;
    sandbox.getIndex = getIndex;
    sandbox.setIndex = setIndex;
    sandbox.concretize = concretize;
    sandbox.branch = branch;
    sandbox.branchBoth = branchBoth;
    sandbox.generateInputs = generateInputs;
    sandbox.getFormulaFromBDD = getFormulaFromBDD;
    sandbox.getBDDFromFormula = getBDDFromFormula;
    sandbox.getReturnVal = getReturnVal;
    sandbox.isRetracing = isRetracing;

}(module.exports));

