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

(function (sandbox) {

    function ObjectAllocationTrackerEngine() {
        var smemory = sandbox.smemory;
        var iidToLocation = sandbox.iidToLocation;
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var Config = sandbox.Config;

        // iid or type could be object(iid) | array(iid) | function(iid)
        var iidToObjectInfo = {}; // type -> (field -> type -> iid -> true)

        var getSymbolic = this.getSymbolic = function (obj) {
            var sobj = smemory.getShadowObject(obj);
            if (sobj) {
                return sobj.shadow;
            } else {
                return undefined;
            }
        };


        function getSetFields(map, key) {
            if (!HOP(map, key)) {
                return map[key] = {nObjects:0, maxLastAccessTime:0, averageLastAccessTime:0, isWritten:false};
            }
            var ret = map[key];
            return ret;
        }

        function updateObjectInfo(base, offset, value, updateLocation, isWritten) {
            var sym, iid;
            sym = getSymbolic(base);
            if (sym) {
                iid = sym.loc;
                var oldLastAccessTime = sym.lastAccessTime;
                sym.lastAccessTime = instrCounter;
                var objectInfo = getSetFields(iidToObjectInfo, iid);
                objectInfo.averageLastAccessTime = objectInfo.averageLastAccessTime + instrCounter - oldLastAccessTime;
                var max = sym.lastAccessTime - sym.originTime;
                if (max > objectInfo.maxLastAccessTime) {
                    objectInfo.maxLastAccessTime = max;
                }
                if (isWritten) {
                    objectInfo.isWritten = true;
                }
            }
        }

        function annotateObject(creationLocation, obj) {
            var type, s;
            var sobj = smemory.getShadowObject(obj);

            if (sobj) {
                if (sobj.shadow === undefined) {
                    type = typeof obj;
                    if ((type === "object" || type === "function") && obj !== null && obj.name !== "eval") {
                        if (Array.isArray(obj)) {
                            type = "array";
                        }
                        s = type + "(" + creationLocation + ")";
                        sobj.shadow = {loc:s, originTime:instrCounter, lastAccessTime:instrCounter};
                        var objectInfo = getSetFields(iidToObjectInfo, s);
                        objectInfo.nObjects++;

                    }
                }
            }
            return obj;
        }

        var instrCounter = 0;

        this.literalPre = function (iid, val) {
            instrCounter++;
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            instrCounter++;
        }

        this.getFieldPre = function (iid, base, offset) {
            instrCounter++;
        }

        this.readPre = function (iid, name, val) {
            instrCounter++;
        }

        this.writePre = function (iid, name, val) {
            instrCounter++;
        }

        this.binaryPre = function (iid, op, left, right) {
            instrCounter++;
        }

        this.unaryPre = function (iid, op, left) {
            instrCounter++;
        }

        this.conditionalPre = function (iid, left) {
            instrCounter++;
        }


        this.literal = function (iid, val) {
            return annotateObject(iid, val);
        }

        this.putFieldPre = function (iid, base, offset, val) {
            instrCounter++;
            updateObjectInfo(base, offset, val, iid, true);
            return val;
        }

        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            var ret;
            if (isConstructor) {
                ret = annotateObject(iid, val);
            } else {
                ret = val;
            }
            return ret;
        }

        this.getField = function (iid, base, offset, val) {
            if (val !== undefined) {
                updateObjectInfo(base, offset, val, iid, false);
            }
            return val;
        }

        function sizeOfMap(obj) {
            var count = 0;
            for (var i in obj) {
                if (HOP(obj, i)) {
                    count++;
                }
            }
            return count;
        }

        function typeInfoWithLocation(type) {
            if (type.indexOf("(") > 0) {
                var type1 = type.substring(0, type.indexOf("("));
                var iid = type.substring(type.indexOf("(") + 1, type.indexOf(")"));
                if (iid === "null") {
                    throw new Error("Not expecting null");
                } else {
                    return "Location " + iidToLocation(iid) + " has created " + type1;
                }
            } else {
                throw new Error("Expecting '(' in object location");
            }
        }

        function printObjectInfo() {
            var stats = [];
            for (var iid in iidToObjectInfo) {
                if (HOP(iidToObjectInfo, iid)) {
                    var objectInfo = iidToObjectInfo[iid];
                    objectInfo.iid = iid;
                    stats.push(objectInfo);
                }
            }
            stats.sort(function (a, b) {
                return b.nObjects - a.nObjects;
            });

            var len = stats.length;
            for (var i = 0; i < len; i++) {
                objectInfo = stats[i];
                iid = objectInfo.iid;
                var str = typeInfoWithLocation(iid);
                str = str + " " + objectInfo.nObjects +
                    " times\n      with max last access time since creation = " + objectInfo.maxLastAccessTime + " instructions " +
                    "\n      and average last access time since creation = " + (objectInfo.averageLastAccessTime / objectInfo.nObjects) + " instructions " +
                    (objectInfo.isWritten ? "" : "\n      and seems to be Read Only");
                console.log(str);
            }

        }


        this.endExecution = function () {
            printObjectInfo();
        }

    }


    sandbox.analysis = new ObjectAllocationTrackerEngine();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }

}(J$));
