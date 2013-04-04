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

(function(module){

    function LikelyTypeInferEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');
        var getIIDInfo = require('./../../utils/IIDInfo');
        var P_VALUE = 5.0;

        if (!(this instanceof LikelyTypeInferEngine)) {
            return new LikelyTypeInferEngine(executionIndex);
        }

        var iidToFieldTypes = {};
        var iidToSignature = {};

        function HOP(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };

        function isArr(val) {
            return Object.prototype.toString.call( val ) === '[object Array]';
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        function updateType(base, offset, value, updateLocation, creationLocationOptional) {
            var iid , tval, type, s;
            if (!creationLocationOptional) {
                iid = getSymbolic(base);
            } else {
                iid = creationLocationOptional;
            }
            if (iid) {
                if (!(tval = iidToFieldTypes[iid])) {
                    tval = iidToFieldTypes[iid] = {};
                }
                type = typeof value;
                s = getSymbolic(value);
                if (s) {
                    type = s;
                } else if (value === null) {
                    type = "object(null)";
                }
                if (iid.indexOf("array")===0) {
                    if (offset > 10) {
                        offset = 100000;
                    }
                }

                if (!tval[offset]) {
                    tval[offset] = {};
                }
                if (!tval[offset][type]) {
                    tval[offset][type] = {};
                }
                tval[offset][type][updateLocation] = true;

            }
        }

        function annotateObject(creationLocation, obj) {
            var type, ret = obj, i, s;
            if (!getSymbolic(obj)){
                if (((type = typeof obj)==="object" || type === "function") && obj !== null && obj.name !== "eval") {
                    if (isArr(obj)) {
                        type = "array";
                    }
                    s = type+"("+creationLocation+")";
                    ret = new ConcolicValue(obj, s);
                    for (i in obj) {
                        if (HOP(obj, i) && i !== "*$7*" && i !== "*$7I*" && i !== "*$7C*") {
                            updateType(ret, i, obj[i], creationLocation, s);
                        }
                    }
                }
            }
            return ret;
        }

        function setTypeInFunSignature(value, tval, offset, callLocation) {
            var type, s;
            type = typeof value;
            s = getSymbolic(value);
            if (s) {
                type = s;
            } else if (value === null) {
                type = "object(null)";
            }
            if (!tval[offset]) {
                tval[offset] = {};
            }
            if (!tval[offset][type]) {
                tval[offset][type] = {};
            }
            tval[offset][type][callLocation] = true;

        }

        function updateSignature(f, base, args, value, callLocation) {
            var iid , tval;
            iid = getSymbolic(f);
            if (iid) {
                if (!(tval = iidToSignature[iid])) {
                    tval = iidToSignature[iid] = {};
                }
                setTypeInFunSignature(value, tval, "return", callLocation);
                setTypeInFunSignature(base, tval, "this", callLocation);
                var len = args.length;
                for(var i = 0; i<len; ++i) {
                    setTypeInFunSignature(args[i], tval, "arg"+(i+1), callLocation);
                }
            }
        }

        this.literal = function(iid, val) {
            return annotateObject(iid, val);
        }

        this.putFieldPre = function(iid, base, offset, val) {
            updateType(base, offset, val, iid);
        }

        this.invokeFun = function(iid, f, base, args, val, isConstructor) {
            updateSignature(f, base, args, val, iid);
            return annotateObject(iid, val);
        }

        this.getField = function(iid, base, offset, val) {
            if (getConcrete(val) !== undefined) {
                updateType(base, offset, val, iid);
            }
            return annotateObject(iid, val);
        }

        this.read = function(iid, name, val) {
            return annotateObject(iid, val);
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
            if (type.indexOf("(")>0) {
                var type1 = type.substring(0, type.indexOf("("));
                var iid = type.substring(type.indexOf("(")+1, type.indexOf(")"));
                if (iid === "null") {
                    return "null";
                } else {
                    return type1+" originated at "+getIIDInfo(iid);
                }
            } else {
                return type;
            }
        }

        function areSameType(obj1, obj2) {
            var type1, type2, iid1, iid2, f;
            type1 = obj1.indexOf("(")>0?obj1.substring(0, obj1.indexOf("(")):obj1;
            type2 = obj2.indexOf("(")>0?obj2.substring(0, obj2.indexOf("(")):obj2;
            if (type1 !== type2){
                return false;
            }
            //return true;

            if (type1 === "object") {
                obj1 = iidToFieldTypes[obj1];
                obj2 = iidToFieldTypes[obj2];
                if (sizeOfMap(obj1) !== sizeOfMap(obj2)) {
                    return false;
                }
                for (f in obj1) {
                    if (HOP(obj1, f)) {
                        if (!HOP(obj2, f)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        function getLocationsInfo(map) {
            var str = "";
            for (var loc in map) {
                if (HOP(map, loc)) {
                    str += "        found at "+getIIDInfo(loc)+",\n";
                }
            }
            return str;
        }

        function getTypeInfo(typeMap) {
            var str = "";
            for (var type1 in typeMap) {
                if (HOP(typeMap, type1)) {
                    str += getLocationsInfo(typeMap[type1]);
                }
            }
            return str;
        }

        function analyze(map) {
            for (var oloc in map) {
                if (HOP(map, oloc)) {
                    var fieldMap = map[oloc];
                    for (var field in fieldMap) {
                        if (HOP(fieldMap, field)) {
                            if (field == "undefined") {
                                console.log("Potential Bug: undefined field found in "+typeInfoWithLocation(oloc)+
                                    ":\n"+ getTypeInfo(typeMap));
                            }
                        }
                    }
                    for (var field in fieldMap) {
                        if (HOP(fieldMap, field)) {
                            var typeMap = fieldMap[field];
                            if (sizeOfMap(typeMap)>1) {
                                lbl1: for (var type1 in typeMap) {
                                    if (HOP(typeMap, type1)) {
                                        for (var type2 in typeMap) {
                                            if (HOP(typeMap, type2)) {
                                                if (type1+"" < type2+"" && !areSameType(type1, type2)) {
                                                    console.log("Warning: "+field+" of "+typeInfoWithLocation(oloc)+
                                                        " has multiple types:");
                                                    for (var type3 in typeMap) {
                                                        console.log("    "+typeInfoWithLocation(type3)+"\n"+getLocationsInfo(typeMap[type3]));
                                                    }
                                                    break lbl1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }

        this.endExecution = function() {
            analyze(iidToFieldTypes);
            analyze(iidToSignature);
            //console.log(JSON.stringify(iidToFieldTypes, null, '\t'));
        }


    }

    module.exports = LikelyTypeInferEngine;

}(module));
