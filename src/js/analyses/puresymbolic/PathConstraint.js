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

    var pathConstraint = SymbolicBool.true;
    var pcStack = [];
    pcStack.push(pathConstraint);


    var formulaStack = [];
    formulaStack.count = 0;


    function isSymbolic(val) {
        if (val === undefined || val === null) {
            return false;
        }
        return val.type === Symbolic;
    }

    function pushPC(pc) {
        pathConstraint = pc;
        pcStack.push(pc);
        formulaStack = [];
        formulaStack.count = 0;
    }

    function getPC() {
        return pathConstraint;
    }

    function popPC() {
        pcStack.pop();
        pathConstraint = pcStack[pcStack.length-1];
        formulaStack = [];
        formulaStack.count = 0;
    }

    function addAxiom(val) {
        if (val === "begin") {
            formulaStack.push("begin");
            formulaStack.count ++;
        } else if (val === "and" || val === "or") {
            val = (val==='and')?"&&":"||";
            var ret, i, start = -1, len;
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
        } else if (isSymbolic(val)) {
            var pred = val;
            if (isSymbolic(pred)) {
                formulaStack.push(pred);
            } else if (formulaStack.count > 0) {
                if (val) {
                    formulaStack.push(SymbolicBool.true);
                } else {
                    formulaStack.push(SymbolicBool.false);
                }
            }
        } else if (val) {
            formulaStack.push(SymbolicBool.true);
        } else {
            formulaStack.push(SymbolicBool.false);
        }

        if (formulaStack.count===0 && formulaStack.length > 0 ) {
            pathConstraint = new SymbolicBool("&&", pathConstraint, formulaStack.pop());
        }
    }

    sandbox.addAxiom = addAxiom;
    sandbox.popPC = popPC;
    sandbox.pushPC = pushPC;
    sandbox.getPC = getPC;

}(module.exports));

