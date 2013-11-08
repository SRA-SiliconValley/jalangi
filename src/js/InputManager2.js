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

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function(sandbox){
    var inputs = {};
    var auxInputCount = 0;
    var inputCount = 0;
    var currentSolutionIndex = [], currentSolution;
    var PredValues = require('./analyses/puresymbolic/PredValues');


    function setInput(key, val) {
        inputs[key]= val;
    }

    function setCurrentSolutionIndex(idx) {
        currentSolutionIndex = idx;
    }

    function setCurrentSolution(soln) {
        currentSolution = soln;
    }

    function getCurrentSolutionIndex() {
        return currentSolutionIndex;
    }

    function getCurrentSolution() {
        return currentSolution;
    }

    function getNextSymbol(isAux) {
        var idx;
        if (isAux) {
            auxInputCount++;
            idx = "y"+auxInputCount;

        } else {
            inputCount++;
            idx = "x"+inputCount;
        }
        return idx;
    }

    function getNextConcreteInput(idx, val) {
        var ret;
        if ((ret = inputs[idx]) === undefined) {
            if (idx.indexOf('x')===0) {
                ret = inputs[idx] = val;
            } else {
                ret = val;
            }
        }
        if (typeof ret === 'string' && idx.indexOf('x')===0 ) {
            inputs[idx+"__length"] = ret.length;
        }
        return ret;
    }

    function readInput(concrete, isAux, symbolOptional) {
        var ret, val;

        if (concrete instanceof PredValues) {
            concrete = concrete.values[0].value;
        }

        var idx;
        if (symbolOptional) {
            idx = symbolOptional;
        } else {
            idx = getNextSymbol(isAux);
        }
        ret = getNextConcreteInput(idx, concrete);

        if (sandbox.makeSymbolic) {
            ret = sandbox.makeSymbolic(idx, ret);
        }
        return ret;
    }

    sandbox.getNextSymbol = getNextSymbol;
    sandbox.inputs = inputs;
    sandbox.setInput = setInput;
    sandbox.readInput = readInput;
    sandbox.getCurrentSolution = getCurrentSolution;
    sandbox.getCurrentSolutionIndex = getCurrentSolutionIndex;
    sandbox.setCurrentSolution = setCurrentSolution;
    sandbox.setCurrentSolutionIndex = setCurrentSolutionIndex;
    sandbox.addAxiom = sandbox.addAxiom?sandbox.addAxiom:function(c) {};
}(J$));