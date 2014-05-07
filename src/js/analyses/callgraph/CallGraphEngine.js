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

(function (sandbox) {

    function CallGraphEngine() {
        var getIIDInfo = sandbox.iidToLocation;
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;

        this.endExecution = function () {
            var sortingArr = [];

            for (var iid in iidToInvocationCount) {
                if (HOP(iidToInvocationCount, iid)) {
                    sortingArr.push([iid, iidToInvocationCount[iid]]);
                }
            }
            sortingArr.sort(function (a, b) {
                return b[1] - a[1];
            });

            var i, len = sortingArr.length;
            for (i = 0; i < len; i++) {
                var callerIId = sortingArr[i][0];
                console.log("Function " + iidToFunName[callerIId] + " defined at " + getIIDInfo(callerIId) + " was invoked " + iidToInvocationCount[callerIId] + " time(s) and it called:");
                if (HOP(callerIidToCalleeIidsMap, callerIId)) {
                    var callees = callerIidToCalleeIidsMap[callerIId];
                    for (var calleeIid in callees) {
                        if (HOP(callees, calleeIid)) {
                            var callSites = callees[calleeIid];
                            for (var callSite in callSites) {
                                if (HOP(callSites, callSite)) {
                                    console.log("    function " + iidToFunName[calleeIid] + " defined at " + getIIDInfo(calleeIid) + " " + callSites[callSite] + " time(s) at call site " + getIIDInfo(callSite));
                                }
                            }
                        }
                    }
                } else {
                    console.log("    none")
                }
            }
            console.log("Generating CallGraph.json ...");
            // store the call graph by serializing  callerIidToCalleeIidsMap and iidToFunName
            require('fs').writeFileSync("CallGraph.json", JSON.stringify([iidToFunName, iidToInvocationCount, callerIidToCalleeIidsMap], undefined, 4), "utf8");
        }

        var callerIidToCalleeIidsMap = {}; // caller iid => callee iid => iid of call site => count
        var iidToFunName = {0:"Program"}; // function iid => function name
        var iidToInvocationCount = {0:1}; // function iid => number of times the function is invoked

        var callStack = [0];
        var invokedAtIid;

        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            invokedAtIid = iid;
        }

        this.functionEnter = function (iid, fun, dis /* this */, args) {
            var callerIid = callStack[callStack.length - 1];
            if (!HOP(callerIidToCalleeIidsMap, callerIid)) {
                callerIidToCalleeIidsMap[callerIid] = {};
            }
            var callees = callerIidToCalleeIidsMap[callerIid];
            if (!HOP(callees, iid)) {
                callees[iid] = {};
            }
            var callee = callees[iid]
            if (!HOP(callee, invokedAtIid)) {
                callee[invokedAtIid] = 0;
            }
            callee[invokedAtIid] = callee[invokedAtIid] + 1;
            iidToFunName[iid] = fun.name;
            if (!HOP(iidToInvocationCount, iid)) {
                iidToInvocationCount[iid] = 1;
            } else {
                iidToInvocationCount[iid] = iidToInvocationCount[iid] + 1;
            }

            callStack.push(iid);
        }

        this.functionExit = function (iid) {
            callStack.pop();
            return false;
            /* a return of false means that do not backtrack inside the function */
        }

    }

    sandbox.analysis = new CallGraphEngine();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }
}(J$));