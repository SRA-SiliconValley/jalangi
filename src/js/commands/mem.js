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

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {

    require('../iidToLocation');
    var iidToLocation = sandbox.iidToLocation;

    var hash = Object.create(null);
    var frame = Object.create(null);

    var frameStack = [frame];
    var evalFrames = [];
    var smemory = {
        getShadowObject: function(iid) {
            var tmp;
            if(!(tmp = hash[iid])) {
                tmp = Object.create(null);
                hash[iid] = tmp;
            }
            return tmp;
        },

        declare: function(name) {
            frame[name] = undefined;
        },

        getCurrentFrame: function () {
            return frame;
        },

        remove: function(iid) {
            delete hash[iid];
        }
     };

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

        var executionIndex = new ExecutionIndex();
        var sort = Array.prototype.sort;
        var objectCount = 1;

        var info = {};
        var odbase = {};

        function stripBeginEnd(str) {
            return str.substring(1,str.length-1)
        }

        function printInfo(info, tab) {
            for (var iid in info) {
                // TODO need to refactor the following check
                if (info.hasOwnProperty(iid) && iid !== 'count') {
                    console.log(tab + info[iid].count + " object(s) escaped to the function containing line " + stripBeginEnd(iidToLocation(iid))+" and did not escape to its caller");
                    printInfo(info[iid], tab + "    ");
                }
            }
        }

        function addCount(index, i) {
            var tmp = info;
            for (var j = index.length - 1; j >= i; j--) {
                var iid = index[j].iid;
                if (!tmp[iid]) {
                    tmp[iid] = {count:0};
                }
                tmp = tmp[iid];
            }
            tmp.count++;
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

            if (sobjVal && sobjVal.creationIndex) {
                var iid2 = getAllocIID(sobjVal.creationIndex);
                infoObj = odbase[iid2];
                if (sobjBase && sobjBase.creationIndex) {
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
                } else {
                    infoObj.pointedBy = true;
                }
            }
        }


        function addToODBase(iid, objectId, isFrame) {
            var tmp;
                tmp = odbase[iid];
                if (!tmp) {
                    tmp = odbase[iid] = {};
                    tmp.total = 0;
                    tmp.nonEscaping = true;
                    tmp.oneActive = true;
                    tmp.oneActiveUsage = true;
                    tmp.accessedByParentOnly = true;
                    tmp.pointedBy = false;// can also be another iid or true;
                    tmp.isFrame = !!isFrame;
                    tmp.unused = true;
                    tmp.leakCount = 0;
                    tmp.maxActiveCount = 0;
                    tmp.totalActiveCount = 0;
                }
                tmp.total++;
                tmp.lastObjectIdAllocated = objectId;
                tmp.totalActiveCount++;
        }

        function annotateObject(iid, obj, isFrame) {
            var sobj = smemory.getShadowObject(obj);

            if (sobj) {
                executionIndex.executionIndexInc(iid);
                if (sobj.creationIndex === undefined) {
                    sobj.creationIndex = executionIndex.executionIndexGetIndex();
                    sobj.escapeIndex = sobj.creationIndex.length - 1;
                    sobj.objectId = objectCount++;
                    sobj.unused = true;
                    sobj.escapes = false;
                    addCount(sobj.creationIndex, sobj.escapeIndex);
                    addToODBase(getAllocIID(sobj.creationIndex), sobj.objectId, isFrame);
                }
            }
        }

        function getAllocIID(creationIndex) {
            return creationIndex[creationIndex.length - 1].iid;
        }

        function accessObject(obj, unreachable) {
            var sobj = smemory.getShadowObject(obj);
            var infoObj;

            if (sobj && sobj.creationIndex) {
                executionIndex.executionIndexInc(0);
                var accessIndex = executionIndex.executionIndexGetIndex();
                var newi = indexOfDeviation(sobj.creationIndex, accessIndex);
                infoObj = odbase[getAllocIID(sobj.creationIndex)];
                if (newi < sobj.escapeIndex) {
                    if (unreachable) {
                        if (infoObj.notUsedAfterEscape === undefined) {
                            infoObj.notUsedAfterEscape = true;
                        }
                        infoObj.notUsedAfterEscape = infoObj.notUsedAfterEscape && !sobj.escapes;
                    }
                    sobj.escapes = true;
                    infoObj.nonEscaping = false;
                }
                if (infoObj.lastObjectIdAllocated !== sobj.objectId) {
                    if (!unreachable) {
                        infoObj.oneActiveUsage = false;
                    }
                    infoObj.oneActive = false;
                }
                if (newi < sobj.escapeIndex) {
                    subtractCount(sobj.creationIndex, sobj.escapeIndex);
                    addCount(sobj.creationIndex, newi);
                    sobj.escapeIndex = newi;
                }
                if (newi !== sobj.creationIndex.length - 1 && newi !== accessIndex.length - 1) {
                    infoObj.accessedByParentOnly = false;
                }
                if (!unreachable) {
                    sobj.unused = false;
                } else {
                    infoObj.unused = infoObj.unused && sobj.unused;
                }
                if (unreachable) {
                    infoObj.totalActiveCount--;
                }
            }
            if (unreachable) {
                smemory.remove(obj);
            }
        }

        function exitConstructor(obj) {
            var sobj = smemory.getShadowObject(obj);
            if (sobj && sobj.creationIndex) {
                sobj.unused = true;
            }
        }

        var callStackDepth = 0;
        this.functionEnter = function (iid, ciid) {
            callStackDepth++;
            executionIndex.executionIndexInc(ciid);
            executionIndex.executionIndexCall();
        };

        this.functionExit = function () {
            executionIndex.executionIndexReturn();
            callStackDepth--;
            if (callStackDepth === 0) {
                for (var iid in odbase) {
                    if (odbase.hasOwnProperty(iid)) {
                        var tmp = odbase[iid];
                        if (tmp.maxActiveCount < tmp.totalActiveCount) {
                            tmp.leakCount ++;
                            tmp.maxActiveCount = tmp.totalActiveCount;
                        }
                    }
                }

            }
        };

        this.exitConstructor = function(obj) {
            exitConstructor(obj);
        };

        this.createObject = function (iid, val) {
            annotateObject(iid, val, false);
        };

        this.accessObject = function (base, unreachable) {
            accessObject(base, unreachable);
        };

        this.putField = function (base, val) {
            putField(base, val);
        };


        this.endExecution = function (printEscapeTree) {
            var tmp = [];
            var sitesToData = {};
            var objectInfo = {objectInfo:sitesToData};

            for (var iid in odbase) {
                if (odbase.hasOwnProperty(iid)) {
                    tmp.push({iid:iid, count:odbase[iid].total});
                }
            }
            sort.call(tmp, function (a, b) {
                return b.count - a.count;
            });
            for (var x in tmp) {
                if (tmp.hasOwnProperty(x)) {
                    var iid = tmp[x].iid;
                    var data = {}, loc;
                    sitesToData[loc = stripBeginEnd(iidToLocation(iid))] = data;

                    data.countNonEscaping = info[iid].count;
                    data.total = odbase[iid].total;
                    data.isOneActiveAtATime = odbase[iid].oneActive;
                    data.isOneUsedAtATime = odbase[iid].oneActiveUsage;
                    data.isNonEscaping = odbase[iid].nonEscaping;
                    data.isFrame = odbase[iid].isFrame;
                    data.isUnused = odbase[iid].unused;
                    data.notUsedAfterEscape = odbase[iid].notUsedAfterEscape;
                    data.isLeaking = (odbase[iid].leakCount > 2);
                    if (typeof odbase[iid].pointedBy !== 'boolean') {
                        data.consistentlyPointedBy = stripBeginEnd(iidToLocation(odbase[iid].pointedBy));
                    }

                    console.log(data.total + " "+(data.isFrame ? "call frame(s)" : "object(s)/function(s)/array(s)") +
                        " got allocated at " + stripBeginEnd(iidToLocation(iid)) + " (iid="+iid+")"+
                        " of which " + data.countNonEscaping + " object(s) did not escape to its caller" +
                        (data.isOneActiveAtATime ? "\n    at most one active object at a time" : "") +
                        (data.isOneUsedAtATime ? "\n    at most one active object usage at a time" : "") +
                        (data.isNonEscaping ? "\n    does not escape its caller" : "") +
                        (data.isUnused ? "\n    unused throughout its lifetime" : "") +
                        (data.notUsedAfterEscape ? "\n    unused after escape" : "") +
                        (data.isLeaking ? "\n    leaking" : "") +
//                        ((info[iid].oneActive && info[iid].accessedByParentOnly && !info[iid].nonEscaping) ? "\n    and is used by its parents only" : "") +
                        (data.consistentlyPointedBy ? "\n    uniquely pointed by objects allocated at " + data.consistentlyPointedBy : ""));
                    if (printEscapeTree) printInfo(info[iid], "    ");
                }
            }
            require('fs').writeFileSync("mem_output.json",JSON.stringify(objectInfo, null, "    "),"utf8");



//            printInfo(info, "");
//            console.log(JSON.stringify(info));
        };
//
    }

    function getobjIdToNewIID(traceFile) {
        var objIdToNewIID = {}, line, record;
        var traceFh = new FileLineReader(traceFile);
        while (traceFh.hasNextLine()) {
            line = traceFh.nextLine();
            record = JSON.parse(line);
            if (record[0] === 9) {
                objIdToNewIID[record[1]] = record[2];
            }
        }
        traceFh.close();
        return objIdToNewIID;
    }

/*
 private static enum TraceEntry {
 }

*/

    function processTrace(traceFile, objIdToNewIID, printEscapeTree) {
        var oindex = new ObjectIndex();
        var traceFh = new FileLineReader(traceFile);
        var lineno = 0;
        var tmp, line, record;


        while (traceFh.hasNextLine()) {
            lineno++;
            line = traceFh.nextLine();
            record = JSON.parse(line);
            switch (record[0]) {
                case 0:
// DECLARE, // fields: iid, name, obj-id
                    break;
                case 1:
                    if (tmp = objIdToNewIID[record[2]]) {
                        record[1] = tmp;
                    }
                    oindex.createObject(record[1], record[2]);
// CREATE_OBJ, // fields: iid, obj-id
                    break;
                case 2:
                    oindex.createObject(record[1], record[2]);
// CREATE_FUN, // fields: iid, obj-id.  NOTE: proto-obj-id is always obj-id + 1
                    break;
                case 3:
                    oindex.putField(record[2], record[4]);
// PUTFIELD, // fields: iid, base-obj-id, prop-name, val-obj-id
                    break;
                case 4:
                    oindex.putField(0, record[3]);
// WRITE, // fields: iid, name, obj-id
                    break;
                case 5:
                    oindex.accessObject(record[1], false);
// LAST_USE, // fields: obj-id, iid
                    break;
                case 6:
                    oindex.functionEnter(record[1], record[3]);
// FUNCTION_ENTER, // fields: iid, function-object-id, call-site-iid (or -1 if not present)
                    break;
                case 7:
                    oindex.functionExit();
// FUNCTION_EXIT, // fields: iid
                    break;
                case 8:
// TOP_LEVEL_FLUSH, // fields: iid
                    break;
                case 9:
                    oindex.exitConstructor(record[1]);
// UPDATE_IID, // fields: obj-id, new-iid
                    break;
                case 10:
// DEBUG, // fields: call-iid, obj-id
                    break;
                case 11:
// RETURN, // fields: obj-id
                    break;
                case 12:
//  CREATE_DOM_NODE, // fields: iid (or -1 for unknown), obj-id
                    break;
                case 13:
// ADD_DOM_CHILD, // fields: parent-obj-id, child-obj-id
                    break;
                case 14:
// REMOVE_DOM_CHILD, // fields: parent-obj-id, child-obj-id
                    break;
                case 15:
// ADD_TO_CHILD_SET, // fields: iid, parent-obj-id, name, child-obj-id
                    break;
                case 16:
// REMOVE_DOM_CHILD, // fields: parent-obj-id, child-obj-id
                    break;
                case 17:
// DOM_ROOT, // fields: obj-id
                    break;
                case 18:
                    oindex.accessObject(record[2], true);
// UNREACHABLE // fields: iid, obj-id
                    break;
            }
        }
        traceFh.close();
        oindex.endExecution(printEscapeTree);
    }

    var printEscapeTree, objIdToNewIID;
    var FileLineReader = require('../utils/FileLineReader');
    var args = process.argv.slice(2);
    printEscapeTree = args[1];
    objIdToNewIID = getobjIdToNewIID(args[0]);
    processTrace(args[0], objIdToNewIID, printEscapeTree);

}(J$));

// node src/js/commands/mem.js tests/oindex-koushik/oindex1.trace