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
    var Symbolic = require('./../concolic/Symbolic');
    var SolverEngine = require('./SolverEngine');
    var solver = new SolverEngine();
    var PATH_FILE_NAME = 'jalangi_path';
    var fs = require('fs');

    var pathConstraint = SymbolicBool.true;
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
    var pcStack = [];
    pcStack.push({pc:pathConstraint, path:pathIndex, index:index, formulaStack:formulaStack});




    function isSymbolic(val) {
        if (val === undefined || val === null) {
            return false;
        }
        return val.type === Symbolic;
    }

    function pushPC(pc) {
        pcStack.push({pc:pathConstraint, path:pathIndex, index:index, formulaStack:formulaStack});
        pathConstraint = pc;
        pathIndex = [];
        index = 0;
        formulaStack = [];
        formulaStack.count = 0;
    }

    function getPC() {
        return pathConstraint;
    }

    function getIndex() {
        return pathIndex;
    }

    function getNext() {
        var ret = pathIndex[index++];
        if (ret === undefined) {
            index--;
        }
        return ret;
    }

    function setNext(elem) {
        pathIndex[index++] = elem;
    }

    function popPC() {
        pcStack.pop();
        pathConstraint = pcStack[pcStack.length-1].pc;
        pathIndex = pcStack[pcStack.length-1].path;
        index = pcStack[pcStack.length-1].index;
        formulaStack = pcStack[pcStack.length-1].formulaStack;
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
                throw new Error("$7.addAxiom('begin') not found");
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
            if (!isSymbolic(val)) {
                if (val) {
                    val = SymbolicBool.true;
                } else {
                    val = SymbolicBool.false;
                }
            }
            if (branch !== undefined && !branch) {
                val = val.not();
            }
            formulaStack.push(val);
        }

        if (formulaStack.count===0 && formulaStack.length > 0 ) {
            pathConstraint = new SymbolicBool("&&", pathConstraint, formulaStack.pop());
        }
    }

    function updateSolution() {
        solution = combine($7.inputs, solution);
        var concrete = pathConstraint.substitute(solution);
        if (concrete === SymbolicBool.false) {
            concrete = pathConstraint;
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
//        solution = combine($7.inputs, solution);
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
        var c = new SymbolicBool("&&", pathConstraint, branch?pred:pred.not());
        return solver.generateInputs(c);
    }

    function generateInputs() {
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
        solver.writeInputs(solution, []);
        return pathIndex.length > 0;
    }

    sandbox.addAxiom = addAxiom;
    sandbox.popPC = popPC;
    sandbox.pushPC = pushPC;
    sandbox.getPC = getPC;
    sandbox.getIndex = getIndex;
    sandbox.getNext = getNext;
    sandbox.setNext = setNext;
    sandbox.getSolution = getSolution;
    sandbox.makeConcrete = makeConcrete;
    sandbox.generateInputs = generateInputs;

}(module.exports));

