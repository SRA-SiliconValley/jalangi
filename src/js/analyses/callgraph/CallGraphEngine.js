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

(function (module) {

    function CallGraphEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');
        var getIIDInfo = require('./../../utils/IIDInfo');

        if (!(this instanceof CallGraphEngine)) {
            return new CallGraphEngine(executionIndex);
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        var HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
        var HAS_OWN_PROPERTY_CALL = Object.prototype.hasOwnProperty.call;
        function HOP(obj, prop) {
            return HAS_OWN_PROPERTY_CALL.apply(HAS_OWN_PROPERTY, [obj, prop]);
        }

        this.endExecution = function () {
            for (var callerIId in callerIidToCalleeIidsMap) {
                if (HOP(callerIidToCalleeIidsMap,callerIId)) {
                    console.log("Function "+iidToFunName[callerIId]+" defined at "+getIIDInfo(callerIId)+" called:");
                    var callees = callerIidToCalleeIidsMap[callerIId];
                    for (var calleeIid in callees) {
                        if (HOP(callees,calleeIid)) {
                            var callSites = callees[calleeIid];
                            for (var callSite in callSites) {
                                if (HOP(callSites, callSite)){
                                    console.log("    at "+getIIDInfo(callSite)+" function "+ iidToFunName[calleeIid]+" defined at "+getIIDInfo(calleeIid));
                                }
                            }
                        }
                    }
                }
            }
            console.log("Generating CallGraph.json ...");
            // store the call graph by serializing  callerIidToCalleeIidsMap and iidToFunName
            require('fs').writeFileSync("CallGraph.json", JSON.stringify([iidToFunName, callerIidToCalleeIidsMap], undefined, 4), "utf8");
        }

        var callerIidToCalleeIidsMap = {}; // caller iid => callee iid => iid of call site => true
        var iidToFunName = {};

        var callStack = [];
        var invokedAtIid;

        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            invokedAtIid = iid;
        }

        this.functionEnter = function (iid, fun, dis /* this */) {
            var callerIid = callStack[callStack.length-1];
            if (!HOP(callerIidToCalleeIidsMap,callerIid)) {
                callerIidToCalleeIidsMap[callerIid] = {};
            }
            var callees = callerIidToCalleeIidsMap[callerIid];
            if (!HOP(callees,iid)) {
                callees[iid] = {};
            }
            callees[iid][invokedAtIid] = true;
            iidToFunName[iid] = fun.name;
            callStack.push(iid);
        }

        this.functionExit = function (iid) {
            callStack.pop();
            return false;
            /* a return of false means that do not backtrack inside the function */
        }

    }

    module.exports = CallGraphEngine;
}(module));