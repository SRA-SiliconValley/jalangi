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

if (typeof process !== 'undefined' && process.env.JALANGI_MODE === 'symbolic') {
    require('./InputManager2')
} else {


(function(sandbox){

    var PREFIX1 = "J$";
    var SPECIAL_PROP2 = "*"+PREFIX1+"I*";

    var inputs = {};
    var auxInputCount = 0;
    var inputCount = 0;
    var solutionPoint = "";
    function getSolutionPoint() {
        return solutionPoint;
    }

    function setSolutionPoint(index) {
        solutionPoint = index;
    }

    function setInput(key, val, fields, possibleTypes, currentTypeIdx, isFrozen) {
        if (possibleTypes !== undefined) {
            inputs[key]= [val, fields, possibleTypes, currentTypeIdx, isFrozen];
        } else {
            inputs[key]= [val, fields, [typeof val], 0, true];
        }
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
            ret = inputs[idx] = val;
        }
        return ret;
    }

    function readInput(concrete, isAux, symbolOptional) {
        var ret, type, fieldsOrdered, i, len, val;

        var idx;
        if (symbolOptional) {
            idx = symbolOptional;
        } else {
            idx = getNextSymbol(isAux);
        }
        if (concrete === undefined) {
            val = getNextConcreteInput(idx,[concrete, [], [typeof concrete] , 0, false]);
        } else {
            val = getNextConcreteInput(idx,[concrete, [], [typeof concrete] , 0, true]);
        }
        ret = concrete = val[0];
        type = typeof concrete;

        if (sandbox.analysis && sandbox.analysis.makeConcolic) {
            ret = sandbox.analysis.makeConcolic(idx, val, getNextSymbol);
        }

        if (type === "object" && concrete !== null) {
            fieldsOrdered = val[1];
            len = fieldsOrdered.length;
            //incInputDepth();
            for (i=0; i<len; i++) {
                concrete[fieldsOrdered[i]] = readInput(undefined, false, idx+"_"+(fieldsOrdered[i].replace(/_/g,"__")));
            }
            //decInputDepth();
        } else if (type === "function") {
            concrete[SPECIAL_PROP2] = true;
        }

        if (sandbox.analysis && sandbox.analysis.makeConcolicPost) {
            sandbox.analysis.makeConcolicPost();
        }
        inputs[idx] = ret;
        return ret;
    }

    sandbox.inputs = inputs;
    sandbox.setSolutionPoint = setSolutionPoint;
    sandbox.setInput = setInput;
    sandbox.getSolutionPoint = getSolutionPoint;
    sandbox.readInput = readInput;
    if (sandbox.addAxiom === undefined) {
        sandbox.addAxiom = function() {};
    }
}(J$));

}