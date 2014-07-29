/*
 * Copyright 2013-2014 Samsung Information Systems America, Inc.
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
            for (i = 0; i < countersStack.length; i++) {
                iid = countersStack[i].iid;
                if (iid !== undefined) {
                    ret.push({iid:iid, count:countersStack[i].count});
                }
            }
            return ret;
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


    function ObjectIndex() {

        var smemory = sandbox.smemory;
        var iidToLocation = sandbox.iidToLocation;
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var executionIndex = new ExecutionIndex();
        var sort = Array.prototype.sort;
        var objectCount = 1;

        var info = {};

        function printInfo(info, tab) {
            for (var iid in info) {
                // TODO need to refactor the following check
                if (HOP(info, iid) && iid !== 'count' && iid !== 'total' && iid !== 'isFrame' && iid !== 'lastObjectIdAllocated' &&
                    iid !== 'nonEscaping' && iid !== 'oneActive' && iid !== 'accessedByParentOnly' && iid !== 'pointedBy' && iid !== 'isFrame') {
                    console.log(tab + "accessed " + info[iid].count + " time(s) in function containing line " + iidToLocation(iid));
                    printInfo(info[iid], tab + "    ");
                }
            }
        }

        function addCount(index, i, isInit, isFrame, objectId) {
            var tmp = info;
            for (var j = index.length - 1; j >= i; j--) {
                var iid = index[j].iid;
                if (!tmp[iid]) {
                    tmp[iid] = {count:0, total:0};
                }
                tmp = tmp[iid];
            }
            tmp.count++;
            if (isInit) {
                tmp.total++;
                tmp.lastObjectIdAllocated = objectId;
                tmp.nonEscaping = true;
                tmp.oneActive = true;
                tmp.accessedByParentOnly = true;
                tmp.pointedBy = false;// can also be another iid or true;
                tmp.isFrame = !!isFrame;
            }
        }

        function subtractCount(index, i) {
            var tmp = info;
            for (var j = index.length - 1; j >= i; j--) {
                var iid = index[j].iid;
                if (!tmp[iid]) {
                    tmp[iid] = {count:0};
                }
                tmp = tmp[iid];
            }
            tmp.count--;
        }

        function indexOfDeviation(creationIndex, accessIndex) {
            var i, len = creationIndex.length;
            for (i = 0; i < len; i++) {
                if (creationIndex[i].iid !== accessIndex[i].iid || creationIndex[i].count !== accessIndex[i].count) {
                    return i;
                }
            }
            return i;
        }

        function hasSameContext(index1, index2) {
            var i, len1 = index1.length, len2 = index2.length;
            if (len1 !== len2) {
                return false;
            }
            for (i = 0; i < len1; i++) {
                if (index1[i].count !== index2[i].count || index1[i].iid !== index2[i].iid) {
                    if (len1 - 1 === i && index1[i].count === index2[i].count) {
                        return true;
                    }
                    return false;
                }
            }
            return true;
        }


        function putField(base, val) {
            var sobjBase = smemory.getShadowObject(base);
            var sobjVal = smemory.getShadowObject(val);
            var infoObj;

            if (sobjBase && sobjBase.creationIndex && sobjVal && sobjVal.creationIndex) {
                infoObj = info[getAllocIID(sobjVal.creationIndex)];
                var baseIID = getAllocIID(sobjBase.creationIndex);
                if (hasSameContext(sobjBase.creationIndex, sobjVal.creationIndex)) {
                    if (infoObj.pointedBy === false) {
                        infoObj.pointedBy = baseIID;
                    } else if (infoObj.pointedBy !== true && infoObj.pointedBy !== baseIID) {
                        infoObj.pointedBy = true;
                    }
                } else {
                    infoObj.pointedBy = true;
                }
            }
        }

        function simulatePutField(val) {
            if (typeof val === 'object') {
                for (var offset in val) {
                    if (HOP(val, offset)) {
                        putField(val, val[offset]);
                    }
                }
            }
        }

        function annotateObject(iid, obj, isFrame) {
            var sobj = smemory.getShadowObject(obj);

            if (sobj) {
                executionIndex.executionIndexInc(iid);
                if (sobj.creationIndex === undefined) {
                    sobj.creationIndex = executionIndex.executionIndexGetIndex();
                    sobj.i = sobj.creationIndex.length - 1;
                    sobj.objectId = objectCount++;
                    addCount(sobj.creationIndex, sobj.i, true, isFrame, sobj.objectId);
                }
            }
        }

        function getAllocIID(creationIndex) {
            return creationIndex[creationIndex.length - 1].iid;
        }

        function accessObject(obj) {
            var sobj = smemory.getShadowObject(obj);
            var infoObj;

            if (sobj && sobj.creationIndex) {
                executionIndex.executionIndexInc(0);
                var accessIndex = executionIndex.executionIndexGetIndex();
                var newi = indexOfDeviation(sobj.creationIndex, accessIndex);
                infoObj = info[getAllocIID(sobj.creationIndex)];
                if (newi < sobj.i) {
                    infoObj.nonEscaping = false;
                }
                if (infoObj.lastObjectIdAllocated !== sobj.objectId) {
                    infoObj.oneActive = false;
                }
                if (newi < sobj.i) {
                    subtractCount(sobj.creationIndex, sobj.i);
                    addCount(sobj.creationIndex, newi);
                    sobj.i = newi;
                }
                if (newi !== sobj.creationIndex.length - 1 && newi !== accessIndex.length - 1) {
                    infoObj.accessedByParentOnly = false;
                }
            }
        }


//        this.installAxiom = function (c) {};
//
//        this.makeConcolic = function (idx, val, getNextSymbol) {
//            return val;
//        };
//
//        this.makeConcolicPost = function () {};
//
//        this.declare = function (iid, name, val, isArgument) {};
//
//        this.literalPre = function (iid, val) {};
//
        this.literal = function (iid, val) {
            annotateObject(iid, val, false);
            simulatePutField(val);
            return val;
        };
//
        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            executionIndex.executionIndexInc(iid);
        };
//
        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            if (isConstructor) {
                annotateObject(iid, val, false);
                simulatePutField(val);
            }
            accessObject(f);
            return val;
        };
//
//        this.getFieldPre = function (iid, base, offset) {};
//
        this.getField = function (iid, base, offset, val) {
            accessObject(base);
            return val;
        };
//
//        this.putFieldPre = function (iid, base, offset, val) {
//            return val;
//        };
//
        this.putField = function (iid, base, offset, val) {
            accessObject(base);
            putField(base, val);
            return val;
        };
//
//        this.readPre = function (iid, name, val, isGlobal) {};
//
        this.read = function (iid, name, val, isGlobal) {
            var tmp;
            accessObject(tmp = smemory.getFrame(name));
            putField(tmp, val);
            return val;
        };
//
//        this.writePre = function (iid, name, val, oldValue) {};
//
        this.write = function (iid, name, val, oldValue) {
            accessObject(smemory.getFrame(name));
            return val;
        };
//
//        this.binaryPre = function (iid, op, left, right) {};
//
//        this.binary = function (iid, op, left, right, result_c) {
//            return result_c;
//        };
//
//        this.unaryPre = function (iid, op, left) {};
//
//        this.unary = function (iid, op, left, result_c) {
//            return result_c;
//        };
//
//        this.conditionalPre = function (iid, left) {};
//
//        this.conditional = function (iid, left, result_c) {
//            return left;
//        };
//
//        this.beginExecution = function (data) {};
//
        this.endExecution = function () {
            var tmp = [];
            for (var iid in info) {
                if (HOP(info, iid)) {
                    tmp.push({iid:iid, count:info[iid].total});
                }
            }
            sort.call(tmp, function (a, b) {
                return b.count - a.count;
            });
            for (var x in tmp) {
                if (HOP(tmp, x)) {
                    var iid = tmp[x].iid;
                    console.log((info[iid].isFrame ? "call frame" : "object/function/array") + " allocated at " + iidToLocation(iid) +
                        " " + info[iid].total + " time(s) is accessed " + info[iid].count + " time(s) locally" +
                        (info[iid].oneActive ? "\n    and has one at most one active object at a time" : "") +
                        ((info[iid].oneActive && info[iid].nonEscaping) ? "\n    and does not escape its scope" : "") +
                        ((info[iid].oneActive && info[iid].accessedByParentOnly && !info[iid].nonEscaping) ? "\n    and is used by its parents only" : "") +
                        ((typeof info[iid].pointedBy !== 'boolean') ? "\n    and is uniquely pointed by objects allocated at " + iidToLocation(info[iid].pointedBy) : ""));
                    printInfo(info[iid], "    ");
                }
            }

//            printInfo(info, "");
//            console.log(JSON.stringify(info));
        };
//
        this.functionEnter = function (iid, fun, dis /* this */, args) {
            executionIndex.executionIndexCall();
            annotateObject(iid, smemory.getCurrentFrame(), true);
        };
//
        this.functionExit = function (iid) {
            executionIndex.executionIndexReturn();
            return false;
            /* a return of false means that do not backtrack inside the function */
        };
//
//        this.return_ = function (val) {
//            return val;
//        };
//
        this.scriptEnter = function (iid, fileName) {
            executionIndex.executionIndexCall();
        };
//
        this.scriptExit = function (iid) {
            executionIndex.executionIndexReturn();
        };
//
//        this.instrumentCode = function(iid, code) {
//            return code;
//        };
    }

    sandbox.analysis = new ObjectIndex();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }

}(J$));

// test with python scripts/jalangi.py direct --analysis src/js/analyses/objectindex/ObjectIndex.js tests/unit/oindex1