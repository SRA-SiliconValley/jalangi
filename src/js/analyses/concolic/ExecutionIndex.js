/*
 * Copyright 2014 Samsung Information Systems America, Inc.
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

//-------------------------------- Execution indexing --------------------------------
(function(module) {
    function ExecutionIndex() {
        var counters = {};
        var countersStack = [counters];

        function executionIndexCall() {
            counters = {};
            countersStack.push(counters);
        }

        function executionIndexReturn() {
            countersStack.pop();
            counters = countersStack[countersStack.length - 1];
        }

        function executionIndexInc(iid) {
            var c = counters[iid];
            if (c === undefined) {
                c = 1;
            } else {
                c++;
            }
            counters[iid] = c;
            counters.iid = iid;
            counters.count = c;
        }

        function executionIndexGetIndex() {
            var i, ret = [];
            var iid;
            for (i = countersStack.length - 1; i >= 0; i--) {
                iid = countersStack[i].iid;
                if (iid !== undefined) {
                    ret.push(iid);
                    ret.push(countersStack[i].count);
                }
            }
            return (ret + "").replace(/,/g, "_");
        }

        if (this instanceof ExecutionIndex) {
            this.executionIndexCall = executionIndexCall;
            this.executionIndexReturn = executionIndexReturn;
            this.executionIndexInc = executionIndexInc;
            this.executionIndexGetIndex = executionIndexGetIndex;
        } else {
            return new ExecutionIndex();
        }
    }

    module.exports = ExecutionIndex;
}(module));
//-------------------------------- End Execution indexing --------------------------------

