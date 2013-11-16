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

(function (module) {

    function LikelyTypeInferEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');
        var getIIDInfo = require('./../../utils/IIDInfo');
        var P_VALUE = 5.0;

        if (!(this instanceof LikelyTypeInferEngine)) {
            return new LikelyTypeInferEngine(executionIndex);
        }

        // iid or type could be object(iid) | array(iid) | function(iid) | object(null) | object | function | number | string | undefined | boolean
        var iidToFieldTypes = {}; // type -> (field -> type -> iid -> true)
        var iidToSignature = {};  // type -> ({"this", "return", "arg1", ...} -> type -> iid -> true)
        var typeNames = {};
        var functionNames = {};

        function HOP(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };

        function isArr(val) {
            return Object.prototype.toString.call(val) === '[object Array]';
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;


        function getSetFields(map, key, obj) {
            if (!HOP(map, key)) {
                if (obj) {
                    if (key.indexOf("function") === 0) {
                        functionNames[key] = obj.name ? obj.name : "";
                    } else {
                        typeNames[key] = obj.constructor ? obj.constructor.name : "";
                    }
                }
                return map[key] = {};
            }
            return map[key];
        }

        function updateType(base, offset, value, updateLocation, creationLocationOptional) {
            var iid , tval, type, s;
            if (!creationLocationOptional) {
                iid = getSymbolic(base);
            } else {
                iid = creationLocationOptional;
            }
            if (iid) {
                tval = getSetFields(iidToFieldTypes, iid, getConcrete(base));
                type = typeof value;
                s = getSymbolic(value);
                if (s) {
                    type = s;
                } else if (value === null) {
                    type = "object(null)";
                }
                if (iid.indexOf("array") === 0) {
                    if (offset > 10) {
                        offset = 100000;
                    }
                }

                var tmap = getSetFields(tval, offset);
                var tmp = getSetFields(tmap, type);
                tmp[updateLocation] = true;

            }
        }

        function annotateObject(creationLocation, obj) {
            var type, ret = obj, i, s;
            if (!getSymbolic(obj)) {
                type = typeof obj;
                if ((type === "object" || type === "function") && obj !== null && obj.name !== "eval") {
                    if (isArr(obj)) {
                        type = "array";
                    }
                    s = type + "(" + creationLocation + ")";
                    ret = new ConcolicValue(obj, s);
                    getSetFields(iidToFieldTypes, s, obj);
                    for (i in obj) {
                        if (HOP(obj, i) && i !== "*J$*" && i !== "*J$I*" && i !== "*J$C*") {
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
            var tmap = getSetFields(tval, offset);
            var tmp = getSetFields(tmap, type);
            tmp[callLocation] = true;

        }

        function updateSignature(f, base, args, value, callLocation) {
            var iid , tval;
            iid = getSymbolic(f);
            if (iid) {
                tval = getSetFields(iidToSignature, iid, getConcrete(f));
                setTypeInFunSignature(value, tval, "return", callLocation);
                setTypeInFunSignature(base, tval, "this", callLocation);
                var len = args.length;
                for (var i = 0; i < len; ++i) {
                    setTypeInFunSignature(args[i], tval, "arg" + (i + 1), callLocation);
                }
            }
        }

        this.literal = function (iid, val) {
            return annotateObject(iid, val);
        }

        this.putFieldPre = function (iid, base, offset, val) {
            updateType(base, offset, val, iid);
            return val;
        }

        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            var ret;
            if (isConstructor) {
                ret = annotateObject(iid, val);
            } else {
                ret = val;
            }
            updateSignature(f, base, args, ret, iid);
            return ret;
        }

        this.getField = function (iid, base, offset, val, isGlobal) {
            //var ret = annotateObject(iid, val);
            if (getConcrete(val) !== undefined) {
                updateType(base, offset, val, iid);
            }
            //getConcrete(base)[getConcrete(offset)] = ret;
            return val;
        }

//        this.read = function(iid, name, val) {
//            return annotateObject(iid, val);
//        }


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
                    return "null";
                } else {
                    return type1 + " originated at " + getIIDInfo(iid);
                }
            } else {
                return type;
            }
        }


        function infoWithLocation(type) {
            if (type.indexOf("(") > 0) {
                var type1 = type.substring(0, type.indexOf("("));
                var iid = type.substring(type.indexOf("(") + 1, type.indexOf(")"));
                if (iid === "null") {
                    return " null";
                } else {
                    return "originated at " + getIIDInfo(iid);
                }
            } else {
                return type;
            }
        }

        function getLocationsInfo(map) {
            var str = "";
            for (var loc in map) {
                if (HOP(map, loc)) {
                    str += "        found at " + getIIDInfo(loc) + ",\n";
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

        function analyze(map, table) {
            var done = {};
            for (var oloc in map) {
                if (HOP(map, oloc)) {
                    oloc = getRoot(table, oloc);
                    if (!HOP(done, oloc)) {
                        done[oloc] = true;
                        var fieldMap = map[oloc];
                        for (var field in fieldMap) {
                            if (HOP(fieldMap, field)) {
                                if (field == "undefined") {
                                    console.log("Potential Bug: undefined field found in " + typeInfoWithLocation(oloc) +
                                        ":\n" + getTypeInfo(typeMap));
                                }
                            }
                        }
                        for (var field in fieldMap) {
                            if (HOP(fieldMap, field)) {
                                var typeMap = fieldMap[field];
                                if (sizeOfMap(typeMap) > 1) {
                                    lbl1: for (var type1 in typeMap) {
                                        if (HOP(typeMap, type1)) {
                                            for (var type2 in typeMap) {
                                                if (HOP(typeMap, type2)) {
                                                    if (type1 < type2 && getRoot(table, type1) !== getRoot(table, type2)) {
                                                        console.log("Warning: " + field + " of " + typeInfoWithLocation(oloc) +
                                                            " has multiple types:");
                                                        for (var type3 in typeMap) {
                                                            console.log("    " + typeInfoWithLocation(type3) + "\n" + getLocationsInfo(typeMap[type3]));
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

        }

        function isGoodType(map, table, oloc) {
            var done = {};
            oloc = getRoot(table, oloc);
            if (!HOP(done, oloc)) {
                done[oloc] = true;
                var fieldMap = map[oloc];
                for (var field in fieldMap) {
                    if (HOP(fieldMap, field)) {
                        if (field == "undefined") {
                            return false;
                        }
                    }
                }
                for (var field in fieldMap) {
                    if (HOP(fieldMap, field)) {
                        var typeMap = fieldMap[field];
                        if (sizeOfMap(typeMap) > 1) {
                            lbl1: for (var type1 in typeMap) {
                                if (HOP(typeMap, type1)) {
                                    for (var type2 in typeMap) {
                                        if (HOP(typeMap, type2)) {
                                            if (type1 < type2 && getRoot(table, type1) !== getRoot(table, type2)) {
                                                return false;
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
            return true;
        }


        function getRoot(table, oloc) {
            var ret = table[oloc];

            while (ret !== oloc) {
                oloc = ret;
                ret = table[oloc];
            }
            return ret;
        }

        function equiv(map) {
            var table = {};
            var roots = {}
            for (var oloc in map) {
                if (HOP(map, oloc)) {
                    table[oloc] = oloc;
                    roots[oloc] = true;
                }
            }
            table['number'] = 'number';
            table['boolean'] = 'boolean';
            table['string'] = 'string';
            table['undefined'] = 'undefined';
            table['object(null)'] = 'object(null)';


            var changed = true, root1, root2;
            while (changed) {
                changed = false;
                for (var oloc in roots) {
                    if (HOP(roots, oloc)) {

                        loop2: for (var oloc2 in roots) {
                            if (HOP(roots, oloc2) &&
                                oloc < oloc2 &&
                                (root1 = getRoot(table, oloc)) !== (root2 = getRoot(table, oloc2)) &&
                                oloc.indexOf("function") !== 0 &&
                                oloc2.indexOf("function") !== 0) {
                                var fieldMap1 = map[oloc];
                                var fieldMap2 = map[oloc2];
                                if (sizeOfMap(fieldMap1) !== sizeOfMap(fieldMap2)) {
                                    continue loop2;
                                }
                                for (var field1 in fieldMap1) {
                                    if (HOP(fieldMap1, field1) && !HOP(fieldMap2, field1)) {
                                        continue loop2;
                                    }
                                    var typeMap1 = fieldMap1[field1];
                                    var typeMap2 = fieldMap2[field1];
                                    for (var type1 in typeMap1) {
                                        if (HOP(typeMap1, type1)) {
                                            var found = false;
                                            for (var type2 in typeMap2) {
                                                if (HOP(typeMap2, type2)) {
                                                    if (type1 === type2) {
                                                        found = true;
                                                    } else if (getRoot(table, type1) === getRoot(table, type2)) {
                                                        found = true;
                                                    }
                                                }
                                            }
                                            if (!found) {
                                                continue loop2;
                                            }
                                        }
                                    }

                                }
                                if (root1 < root2) {
                                    table[root2] = root1;
                                    delete roots[root2];
                                } else {
                                    table[root1] = root2;
                                    delete roots[root1];
                                }
                                changed = true;
                            }
                        }
                    }
                }
            }
            return [table, roots];
        }

        function visitFieldsForDOT(table, types, node, nodeStr, edges) {
            var fieldMap = types[node], tmp;
            for (var field in fieldMap) {
                if (HOP(fieldMap, field)) {
                    tmp = escapeNode(field);
                    nodeStr = nodeStr + "|<" + tmp + ">" + tmp;
                }
                var typeMap = fieldMap[field];
                for (var type in typeMap) {
                    if (HOP(typeMap, type)) {
                        type = getRoot(table, type);
                        var tmp2 = escapeNode(type);
                        var edgeStr = "    " + escapeNode(node) + ":" + tmp + " -> " + tmp2 + ":" + tmp2;
                        edges[edgeStr] = true;
                    }
                }
            }
            return nodeStr;
        }

        function createLocationNodes(table, edges, srcNodes) {
            var locs = {};

            for (var node in table) {
                if (HOP(table, node) && node.indexOf("(") > 0 && node !== "object(null)") {
                    var loc, root = table[node];
                    loc = locs[root];
                    if (loc === undefined) {
                        loc = locs[root] = {};
                    }
                    loc[infoWithLocation(node)] = true;
                }
            }


            for (loc in locs) {
                if (HOP(locs, loc)) {
                    var lines = locs[loc];
                    var tmp = escapeNode(loc);
                    var nodeStr = "    " + tmp + "_loc [label = \"";
                    var first = true;
                    for (var line in lines) {
                        var tmp2 = escapeNode(line);
                        if (first) {
                            first = false;
                            nodeStr = nodeStr + tmp2;
                        } else {
                            nodeStr = nodeStr + "|" + tmp2;
                        }
                    }
                    nodeStr = nodeStr + "\"]";
                    srcNodes.push(nodeStr);
                    var edgeStr = "    " + tmp + ":" + tmp + " -> " + tmp + "_loc";
                    edges[edgeStr] = true;

                }
            }

        }

        function escapeNode(node) {
            return node.replace(/([\(\)\$])/g, "_").replace(/[Ee]dge/g, "Eedge").replace(/[Nn]ode/g, "Nnode");
        }

        function writeDOTFile(nodes, edges, srcNodes, badNodes) {
            var dot = 'digraph LikelyTypes {\n    rankdir = "LR"\n    node [fontname=Sans]\n\n'


            var i, len;

            dot += '    subgraph cluster_notes {\n';
            dot += '        node [shape = record, fillcolor=yellow, style=filled];\n';
            len = srcNodes.length;
            for (i = 0; i < len; i++) {
                dot = dot + "    " + srcNodes[i] + ';\n';
            }
            dot += '    }\n';


            dot += '    node [shape = Mrecord, fillcolor=lightpink, style=filled];\n';
            len = badNodes.length
            for (i = 0; i < len; i++) {
                dot = dot + badNodes[i] + ';\n';
            }

            dot += '    node [shape = Mrecord, fillcolor=lightskyblue, style=filled];\n';
            len = nodes.length
            for (i = 0; i < len; i++) {
                dot = dot + nodes[i] + ';\n';
            }

            for (i in edges) {
                if (HOP(edges, i)) {
                    dot = dot + i + ";\n";
                }
            }

            dot = dot + "}\n";
            require('fs').writeFileSync("jalangi_types.dot", dot);
            console.log("Generated " + process.cwd() + "/jalangi_types.dot.  Install graphviz and run \"dot -Tpng jalangi_types.dot -o jalangi_types.png; open jalangi_types.png\" to visualize the inferred types.");
            return dot;
        }

        function getName(key) {
            if (HOP(functionNames, key)) {
                return functionNames[key];
            } else if (HOP(typeNames, key)) {
                return typeNames[key];
            } else {
                return "";
            }
        }

        function generateDOT(table, roots, types, functions) {
            var nodes = [];
            var badNodes = [];
            var srcNodes = [];
            var edges = {};

            nodes.push("    number [label = \"<number>number\"]");
            nodes.push("    boolean [label = \"<boolean>boolean\"]");
            nodes.push("    string [label = \"<string>string\"]");
            nodes.push("    undefined [label = \"<undefined>undefined\"]");
            nodes.push("    " + escapeNode("object(null)") + " [label = \"<" + escapeNode("object(null)") + ">null\"]");
            for (var node in roots) {
                if (HOP(roots, node)) {
                    var tmp = escapeNode(node);
                    var nodeStr = "    " + tmp + " [label = \"<" + tmp + ">" + node.substring(0, node.indexOf("(")) + "\\ " + getName(node);

                    nodeStr = visitFieldsForDOT(table, functions, node, nodeStr, edges);
                    nodeStr = visitFieldsForDOT(table, types, node, nodeStr, edges);

                    nodeStr = nodeStr + "\"]";
                    if (isGoodType(types, table, node) && isGoodType(functions, table, node)) {
                        nodes.push(nodeStr);
                    } else {
                        badNodes.push(nodeStr);
                    }
                }
            }

            createLocationNodes(table, edges, srcNodes);
            return writeDOTFile(nodes, edges, srcNodes, badNodes);

        }

        this.endExecution = function () {
            var tableAndRoots = equiv(iidToFieldTypes);
            //console.log(
            generateDOT(tableAndRoots[0], tableAndRoots[1], iidToFieldTypes, iidToSignature)
            //);
            analyze(iidToFieldTypes, tableAndRoots[0]);
            analyze(iidToSignature, tableAndRoots[0]);
            //console.log(JSON.stringify(iidToFieldTypes, null, '\t'));
        }


    }

    module.exports = LikelyTypeInferEngine;

}(module));
