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
                    tmp.maxAliveCount = 0;
                    tmp.currentAliveCount = 0;
                    tmp.cumulativeAliveCount = 0;

                    tmp.currentNonStaleCount = 0;
                    tmp.cumulativeNonStaleCount = 0;

                    tmp.isIncreasing = undefined;
                    tmp.emptyStackCount = 0;
                    tmp.xsquaresum = 0;
                    tmp.ysum = 0;
                    tmp.xysum = 0;

                }
                tmp.total++;
                tmp.lastObjectIdAllocated = objectId;
                tmp.currentAliveCount++;
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
            var infoObj, iid3;

            if (sobj && sobj.creationIndex) {
                executionIndex.executionIndexInc(0);
                var accessIndex = executionIndex.executionIndexGetIndex();
                var newi = indexOfDeviation(sobj.creationIndex, accessIndex);
                infoObj = odbase[iid3=getAllocIID(sobj.creationIndex)];
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
                    infoObj.currentAliveCount--;
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
        this.functionEnter = function (ciid) {
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
//                        if (iid == 15801) {
//                            console.log(tmp.currentAliveCount);
//                        }
//
                        var average = (tmp.cumulativeAliveCount/tmp.emptyStackCount);
                        if (tmp.isIncreasing === undefined  && tmp.emptyStackCount > 0) {
                            if (tmp.currentAliveCount > average) {
                                tmp.isIncreasing = 1;
                            } else if (tmp.currentAliveCount < average) {
                                tmp.isIncreasing = 0;
                            }
                        } else if (tmp.isIncreasing > 0) {
                            if (tmp.currentAliveCount < average) {
                                tmp.isIncreasing = 0;
                            } else if (tmp.currentAliveCount > average) {
                                tmp.isIncreasing++;
                            }
                        }
                        tmp.cumulativeAliveCount += tmp.currentAliveCount;
                        tmp.emptyStackCount++;
                        tmp.ysum += tmp.emptyStackCount;
                        tmp.xysum += (tmp.emptyStackCount*tmp.currentAliveCount);
                        tmp.xsquaresum += (tmp.currentAliveCount * tmp.cumulativeAliveCount);

                        if (tmp.maxAliveCount < tmp.currentAliveCount) {
                            tmp.leakCount ++;
                            tmp.maxAliveCount = tmp.currentAliveCount;
                        }
                    }
                }

            }
        };

//        this.scriptEnter = function () {
//            callStackDepth++;
//        };
//
//        this.scriptExit = function () {
//            callStackDepth--;
//            if (callStackDepth === 0) {
//                for (var iid in odbase) {
//                    if (odbase.hasOwnProperty(iid)) {
//                        var tmp = odbase[iid];
//                        if (tmp.maxAliveCount < tmp.currentAliveCount) {
//                            tmp.leakCount ++;
//                            tmp.maxAliveCount = tmp.currentAliveCount;
//                        }
//                    }
//                }
//
//            }
//        };

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
                    var odbasei = odbase[iid];
                    data.total = odbasei.total;
                    data.countEscaping = data.total - info[iid].count;
                    data.isOneAliveAtATime = odbasei.oneActive;
                    data.isOneUsedAtATime = odbasei.oneActiveUsage;
                    data.isNonEscaping = odbasei.nonEscaping;
                    data.isFrame = odbasei.isFrame;
                    data.isUnused = odbasei.unused;
                    data.notUsedAfterEscape = odbasei.notUsedAfterEscape;
                    data.maxAliveCount = odbasei.maxAliveCount;

//                    console.log(odbasei.xysum+" "+odbasei.xsquaresum+" "+odbasei.ysum+" "+odbasei.cumulativeAliveCount+" "+odbasei.emptyStackCount);

                    data.gradient = (odbasei.xysum -(odbasei.cumulativeAliveCount*odbasei.ysum/odbasei.emptyStackCount))/(odbasei.xsquaresum-(odbasei.cumulativeAliveCount*odbasei.cumulativeAliveCount)/odbasei.emptyStackCount);
                    if (isNaN(data.gradient)) {
                        data.gradient = 0;
                    }
                    data.isLeaking = data.gradient > 0;
                    if (typeof odbase[iid].pointedBy !== 'boolean') {
                        data.consistentlyPointedBy = stripBeginEnd(iidToLocation(odbase[iid].pointedBy));
                    }

                    console.log(data.total + " "+(data.isFrame ? "call frame(s)" : "object(s)/function(s)/array(s)") +
                        " got allocated at " + stripBeginEnd(iidToLocation(iid)) + " (iid="+iid+")"+
                        " of which " + data.countEscaping + " object(s) escape to its caller" +
                        (data.isOneAliveAtATime ? "\n    at most one alive object at a time" : "") +
                        (data.isOneUsedAtATime ? "\n    at most one used object at a time" : "") +
                        (data.isNonEscaping ? "\n    does not escape its caller" : "") +
                        (data.isUnused ? "\n    unused throughout its lifetime" : "") +
                        (data.notUsedAfterEscape ? "\n    unused after escape" : "") +
                        (data.isLeaking ? ("\n    leaking ("+data.isLeaking+")") : "") +
                        (data.maxAliveCount > 0 ? ("\n    max alive count when call stack is empty "+data.maxAliveCount) : "") +
                        "\n    gradient is ("+data.gradient+")" +
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

    /*
     private static enum TraceEntry {
     }

     */
    var enumid = 0;

    var EVENT_IDS = {
        DECLARE: enumid++, // fields: iid, name, obj-id
        CREATE_OBJ: enumid++, // fields: iid, obj-id
        CREATE_FUN: enumid++, // fields: iid, function-enter-iid, obj-id.  NOTE: proto-obj-id is always obj-id + 1
        PUTFIELD: enumid++, // fields: iid, base-obj-id, prop-name, val-obj-id
        WRITE: enumid++, // fields: iid, name, obj-id
        LAST_USE: enumid++, // fields: obj-id, timestamp, iid
        FUNCTION_ENTER: enumid++, // fields: iid, function-object-id, call-site-iid.
        FUNCTION_EXIT: enumid++, // fields: iid
        TOP_LEVEL_FLUSH: enumid++, // fields: iid
        UPDATE_IID: enumid++, // fields: obj-id, new-iid
        DEBUG: enumid++, // fields: call-iid, obj-id
        RETURN: enumid++, // fields: obj-id
        CREATE_DOM_NODE: enumid++, // fields: iid, obj-id
        ADD_DOM_CHILD: enumid++, // fields: parent-obj-id, child-obj-id
        REMOVE_DOM_CHILD: enumid++, // fields: parent-obj-id, child-obj-id
        ADD_TO_CHILD_SET: enumid++, // fields: iid, parent-obj-id, name, child-obj-id
        REMOVE_FROM_CHILD_SET: enumid++, // fields: iid, parent-obj-id, name, child-obj-id
        DOM_ROOT: enumid++, // fields: obj-id
        CALL: enumid++, // fields: iid, function-obj-id, function-enter-iid.
        SCRIPT_ENTER: enumid++, // fields: iid, filename
        SCRIPT_EXIT: enumid++, // fields: iid
        FREE_VARS: enumid++, // fields: iid, array-of-names or ANY
        SOURCE_MAPPING: enumid++, // fields: iid, filename, startLine, startColumn
        UNREACHABLE: enumid++ // fields: iid, obj-id, timestamp
    };


    var timestamp = 0;
    var last_use = {};
    var unreachable = {};

    function getobjIdToNewIID(traceFile) {
        var objIdToNewIID = {}, line, record;
        var traceFh = new FileLineReader(traceFile);
        while (traceFh.hasNextLine()) {
            line = traceFh.nextLine();
            record = JSON.parse(line);
            if (record[0] === EVENT_IDS.UPDATE_IID) {
                objIdToNewIID[record[1]] = record[2];
            }
            if (record[0] === EVENT_IDS.LAST_USE) {
                if (!last_use[record[2]]) {
                    last_use[record[2]] = [];
                }
                last_use[record[2]].push(record);
            }
            if (record[0] === EVENT_IDS.UNREACHABLE) {
                if (!unreachable[record[3]]) {
                    unreachable[record[3]] = [];
                }
                unreachable[record[3]].push(record);
            }
        }
        //console.log(JSON.stringify(last_use));
        //console.log(JSON.stringify(unreachable));
        traceFh.close();
        return objIdToNewIID;
    }


    function processTrace(traceFile, objIdToNewIID, printEscapeTree) {
        var oindex = new ObjectIndex();
        var traceFh = new FileLineReader(traceFile);
        var lineno = 0;
        var tmp, line, record;


        timestamp = 0;
        while (traceFh.hasNextLine()) {
            lineno++;
            line = traceFh.nextLine();
            record = JSON.parse(line);
            switch (record[0]) {
                case EVENT_IDS.DECLARE:
// DECLARE, // fields: iid, name, obj-id
                    break;
                case EVENT_IDS.CREATE_OBJ:
                    if (tmp = objIdToNewIID[record[2]]) {
                        record[1] = tmp;
                    }
                    oindex.createObject(record[1], record[2]);
// CREATE_OBJ, // fields: iid, obj-id
                    break;
                case EVENT_IDS.CREATE_FUN:
                    oindex.createObject(record[1], record[3]);
// CREATE_FUN, // fields: iid, function-enter-iid, obj-id.  NOTE: proto-obj-id is always obj-id + 1
                    break;
                case EVENT_IDS.PUTFIELD:
                    oindex.putField(record[2], record[4]);
// PUTFIELD, // fields: iid, base-obj-id, prop-name, val-obj-id
                    break;
                case EVENT_IDS.WRITE:
                    oindex.putField(0, record[3]);
// WRITE, // fields: iid, name, obj-id
                    break;
//                case EVENT_IDS.LAST_USE:
//                    oindex.accessObject(record[1], false);
//// LAST_USE, // fields: obj-id, timestamp, iid
//                    break;
                case EVENT_IDS.FUNCTION_ENTER:
                    oindex.functionEnter(record[3]);
// FUNCTION_ENTER, // fields: iid, function-object-id, call-site-iid (or -1 if not present)
                    break;
                case EVENT_IDS.FUNCTION_EXIT:
                    oindex.functionExit();
// FUNCTION_EXIT, // fields: iid
                    break;
                case EVENT_IDS.TOP_LEVEL_FLUSH:
// TOP_LEVEL_FLUSH, // fields: iid
                    break;
                case EVENT_IDS.UPDATE_IID:
                    oindex.exitConstructor(record[1]);
// UPDATE_IID, // fields: obj-id, new-iid
                    break;
                case EVENT_IDS.DEBUG:
// DEBUG, // fields: call-iid, obj-id
                    break;
                case EVENT_IDS.RETURN:
// RETURN, // fields: obj-id
                    break;
                case EVENT_IDS.CREATE_DOM_NODE:
                    if (tmp = objIdToNewIID[record[2]]) {
                        record[1] = tmp;
                    }
                    oindex.createObject(record[1], record[2]);
                    break;
// CREATE_DOM_NODE, // fields: iid, obj-id
                case EVENT_IDS.ADD_DOM_CHILD:
// ADD_DOM_CHILD, // fields: parent-obj-id, child-obj-id
                    break;
                case EVENT_IDS.REMOVE_DOM_CHILD:
// REMOVE_DOM_CHILD, // fields: parent-obj-id, child-obj-id
                    break;
                case EVENT_IDS.ADD_TO_CHILD_SET:
                    break;
// ADD_TO_CHILD_SET, // fields: iid, parent-obj-id, name, child-obj-id
                case EVENT_IDS.REMOVE_FROM_CHILD_SET:
                    break;
// REMOVE_FROM_CHILD_SET, // fields: iid, parent-obj-id, name, child-obj-id
                case EVENT_IDS.DOM_ROOT:
// DOM_ROOT, // fields: obj-id
                    break;
                case EVENT_IDS.CALL:
                    break;
// CALL, // fields: iid, function-obj-id, function-enter-iid.
                case EVENT_IDS.SCRIPT_ENTER:
                    oindex.functionEnter(record[1]);
// SCRIPT_ENTER // fields: iid, filename
                    break;
                case EVENT_IDS.SCRIPT_EXIT:
                    oindex.functionExit();
// SCRIPT_EXIT // fields: iid
                    break;
                case EVENT_IDS.FREE_VARS:
// FREE_VARS, // fields: iid, array-of-names or ANY
                    break;
                case EVENT_IDS.SOURCE_MAPPING:
                    break;
// SOURCE_MAPPING, // fields: iid, filename, startLine, startColumn
//                case EVENT_IDS.UNREACHABLE:
//                    oindex.accessObject(record[2], true);
//// UNREACHABLE // fields: iid, obj-id, timestamp
//                    break;
            }
            var tmp2, i;
            if (tmp2 = last_use[timestamp]) {
                for (i = 0; i < tmp2.length; i++) {
                    oindex.accessObject(tmp2[i][1], false);
                }
            }
            if (tmp2 = unreachable[timestamp]) {
                for (i = 0; i < tmp2.length; i++) {
                    oindex.accessObject(tmp2[i][2], true);
                }
            }
            if (record[0] !== EVENT_IDS.UNREACHABLE) {
                timestamp = timestamp + 1;
            }
        }
        traceFh.close();
        oindex.endExecution(printEscapeTree);
    }

    var printEscapeTree, objIdToNewIID;
    var FileLineReader = require('../utils/FileLineReader');
    var args = process.argv.slice(2);
    printEscapeTree = args[1];
    var path = require('path');
    var dirname = path.dirname(args[0]);
    var filename = path.basename(args[0]);
    process.chdir(dirname);
    objIdToNewIID = getobjIdToNewIID(filename);
    processTrace(filename, objIdToNewIID, printEscapeTree);

}(J$));

// node src/js/commands/mem.js tests/oindex-koushik/oindex1.trace