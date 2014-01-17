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


/*
 To perform analysis in browser without recording, set window.JALANGI_MODE to 'inbrowser' and J$.analysis to a suitable analysis file.
 To redefine all instrumentation functions, set JALANGI_MODE to 'symbolic' and J$.analysis to a suitable library containing redefinitions of W, R, etc.

 */

/*jslint node: true browser: true */
/*global J$ alert */

// wrap in anonymous function to create local namespace when in browser
(function () {
    var MODE_RECORD = 1,
        MODE_REPLAY = 2,
        MODE_NO_RR_IGNORE_UNINSTRUMENTED = 3,
        MODE_NO_RR = 4,
        MODE_DIRECT = 5;

    var isBrowser = !(typeof exports !== 'undefined' && this.exports !== exports);


    function init(mode_name,analysis_script) {

        var mode = (function (str) {
            switch (str) {
                case "record" :
                    return MODE_RECORD;
                case "replay":
                    return MODE_REPLAY;
                case "analysis":
                    return MODE_NO_RR_IGNORE_UNINSTRUMENTED;
                case "inbrowser":
                    return MODE_NO_RR;
                case "symbolic":
                    return MODE_DIRECT;
                default:
                    return MODE_RECORD;
            }
        })(mode_name);

        // create J$ global variable to hold analysis runtime
        if (typeof J$ === 'undefined') J$ = {};
        var sandbox = J$;
        var isBrowserReplay;
        var rrEngine;
        var executionIndex;
        var branchCoverageInfo;
        var LOG_ALL_READS_AND_BRANCHES = false;

        isBrowserReplay = isBrowser && mode === MODE_REPLAY;


        if (mode === MODE_DIRECT) {
            /* JALANGI_ANALYSIS file must define all instrumentation functions such as U, B, C, C1, C2, W, R, G, P */
            if (analysis_script) {
                sandbox.analysis = require('./' + analysis_script);
            }

            sandbox.U = sandbox.analysis.U; // Unary operation
            sandbox.B = sandbox.analysis.B; // Binary operation
            sandbox.C = sandbox.analysis.C; // Condition
            sandbox.C1 = sandbox.analysis.C1; // Switch key
            sandbox.C2 = sandbox.analysis.C2; // case label C1 === C2
            sandbox._ = sandbox.analysis._;  // Last value passed to C

            sandbox.H = sandbox.analysis.H; // hash in for-in
            sandbox.I = sandbox.analysis.I; // Ignore argument
            sandbox.G = sandbox.analysis.G; // getField
            sandbox.P = sandbox.analysis.P; // putField
            sandbox.R = sandbox.analysis.R; // Read
            sandbox.W = sandbox.analysis.W; // Write
            sandbox.N = sandbox.analysis.N; // Init
            sandbox.T = sandbox.analysis.T; // object/function/regexp/array Literal
            sandbox.F = sandbox.analysis.F; // Function call
            sandbox.M = sandbox.analysis.M; // Method call
            sandbox.A = sandbox.analysis.A; // Modify and assign +=, -= ...
            sandbox.Fe = sandbox.analysis.Fe; // Function enter
            sandbox.Fr = sandbox.analysis.Fr; // Function return
            sandbox.Se = sandbox.analysis.Se; // Script enter
            sandbox.Sr = sandbox.analysis.Sr; // Script return
            sandbox.Rt = sandbox.analysis.Rt; // Value return
            sandbox.Ra = sandbox.analysis.Ra;
            sandbox.Ex = sandbox.analysis.Ex;

            sandbox.makeSymbolic = sandbox.analysis.makeSymbolic;
            sandbox.addAxiom = sandbox.analysis.addAxiom;
            sandbox.endExecution = sandbox.analysis.endExecution;

            // TODO get rid of this --MS
            if (analysis_script === "analyses/puresymbolic/Multiple") {
                sandbox.analysis.postLoad();
            }

        } else {

//------------------------------- Stats for the paper -----------------------
            // TODO what paper? --MS
            var skippedReads = 0;
            var skippedGetFields = 0;
            var unoptimizedLogs = 0;
            var optimizedLogs = 0;

//-------------------------------- Constants ---------------------------------

            var EVAL_ORG = eval;
            var HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
            var HAS_OWN_PROPERTY_CALL = Object.prototype.hasOwnProperty.call;


            var PREFIX1 = "J$";
            var SPECIAL_PROP = "*" + PREFIX1 + "*";
            var SPECIAL_PROP2 = "*" + PREFIX1 + "I*";
            var SPECIAL_PROP3 = "*" + PREFIX1 + "C*";
            var DEBUG = false;
            var WARN = false;
            var SERIOUS_WARN = false;
            // make MAX_BUF_SIZE slightly less than 2^16, to allow over low-level overheads
            var MAX_BUF_SIZE = 64000;
            // should we keep the trace in memory in the browser?
            var IN_MEMORY_BROWSER_LOG = isBrowser && (window.__JALANGI_PHANTOM__ || window.__JALANGI_SELENIUM__);

            var T_NULL = 0,
                T_NUMBER = 1,
                T_BOOLEAN = 2,
                T_STRING = 3,
                T_OBJECT = 4,
                T_FUNCTION = 5,
                T_UNDEFINED = 6,
                T_ARRAY = 7;

            var F_TYPE = 0,
                F_VALUE = 1,
                F_IID = 2,
                F_SEQ = 3,
                F_FUNNAME = 4;

            var N_LOG_FUNCTION_ENTER = 4,
                N_LOG_SCRIPT_ENTER = 6,
                N_LOG_GETFIELD = 8,
                N_LOG_ARRAY_LIT = 10,
                N_LOG_OBJECT_LIT = 11,
                N_LOG_FUNCTION_LIT = 12,
                N_LOG_RETURN = 13,
                N_LOG_REGEXP_LIT = 14,
                N_LOG_READ = 17,
                N_LOG_HASH = 19,
                N_LOG_SPECIAL = 20,
                N_LOG_STRING_LIT = 21,
                N_LOG_NUMBER_LIT = 22,
                N_LOG_BOOLEAN_LIT = 23,
                N_LOG_UNDEFINED_LIT = 24,
                N_LOG_NULL_LIT = 25,
            // property read *directly* from an object (not from the prototype chain)
                N_LOG_GETFIELD_OWN = 26,
                N_LOG_OPERATION = 27;

            //-------------------------------- End constants ---------------------------------

            var GET_OWN_PROPERTY_NAMES = Object.getOwnPropertyNames;
            Object.getOwnPropertyNames = function () {
                var val = GET_OWN_PROPERTY_NAMES.apply(Object, arguments);
                var idx = val.indexOf(SPECIAL_PROP);
                if (idx > -1) {
                    val.splice(idx, 1);
                }
                idx = val.indexOf(SPECIAL_PROP2);
                if (idx > -1) {
                    val.splice(idx, 1);
                }
                idx = val.indexOf(SPECIAL_PROP3);
                if (idx > -1) {
                    val.splice(idx, 1);
                }
                return val;
            }


            //-------------------------------------- Symbolic functions -----------------------------------------------------------

            var log = (function () {
                var list;

                return {
                    reset:function () {
                        list = [];
                    },

                    log:function (str) {
                        if (list)
                            list.push(str);
                    },

                    getLog:function () {
                        return list;
                    }
                }
            })();


            function getConcrete(val) {
                if (sandbox.analysis && sandbox.analysis.getConcrete) {
                    return sandbox.analysis.getConcrete(val);
                } else {
                    return val;
                }
            }

            function getSymbolic(val) {
                if (sandbox.analysis && sandbox.analysis.getSymbolic) {
                    return sandbox.analysis.getSymbolic(val);
                } else {
                    return val;
                }
            }

            function create_fun(f) {
                return function () {
                    var len = arguments.length;
                    for (var i = 0; i < len; i++) {
                        arguments[i] = getConcrete(arguments[i]);
                    }
                    return f.apply(getConcrete(this), arguments);
                }
            }

            function getSymbolicFunctionToInvokeAndLog(f, isConstructor) {
                if (f === Array ||
                    f === Error ||
                    f === String ||
                    f === Number ||
                    f === Boolean ||
                    f === RegExp ||
                    f === J$.addAxiom ||
                    f === J$.readInput) {
                    return [f, true];
                } else if (//f === Function.prototype.apply ||
                //f === Function.prototype.call ||
                    f === Object.defineProperty ||
                        f === console.log ||
                        (typeof getConcrete(arguments[0]) === 'string' && f === RegExp.prototype.test) || // fixes bug in minPathDev.js
                        f === String.prototype.indexOf ||
                        f === String.prototype.lastIndexOf ||
                        f === String.prototype.substring ||
                        f === String.prototype.substr ||
                        f === String.prototype.charCodeAt ||
                        f === String.prototype.charAt ||
                        f === String.prototype.replace ||
                        f === String.fromCharCode ||
                        f === Math.abs ||
                        f === Math.acos ||
                        f === Math.asin ||
                        f === Math.atan ||
                        f === Math.atan2 ||
                        f === Math.ceil ||
                        f === Math.cos ||
                        f === Math.exp ||
                        f === Math.floor ||
                        f === Math.log ||
                        f === Math.max ||
                        f === Math.min ||
                        f === Math.pow ||
                        f === Math.round ||
                        f === Math.sin ||
                        f === Math.sqrt ||
                        f === Math.tan ||
                        f === parseInt) {
                    return  [create_fun(f), false];
                }
                return [null, true];
            }

            function isReturnLogNotRequired(f) {
                if (f === console.log ||
                    f === RegExp.prototype.test ||
                    f === String.prototype.indexOf ||
                    f === String.prototype.lastIndexOf ||
                    f === String.prototype.substring ||
                    f === Math.abs ||
                    f === Math.acos ||
                    f === Math.asin ||
                    f === Math.atan ||
                    f === Math.atan2 ||
                    f === Math.ceil ||
                    f === Math.cos ||
                    f === Math.exp ||
                    f === Math.floor ||
                    f === Math.log ||
                    f === Math.max ||
                    f === Math.min ||
                    f === Math.pow ||
                    f === Math.round ||
                    f === Math.sin ||
                    f === Math.sqrt ||
                    f === Math.tan ||
                    f === String.prototype.charCodeAt ||
                    f === parseInt
                    ) {
                    return true;
                }
                return false;
            }

            //---------------------------- Utility functions -------------------------------
            function addAxiom(c) {
                if (sandbox.analysis && sandbox.analysis.installAxiom) {
                    sandbox.analysis.installAxiom(c);
                }
            }

            function HOP(obj, prop) {
                return HAS_OWN_PROPERTY_CALL.apply(HAS_OWN_PROPERTY, [obj, prop]);
            }


            function debugPrint(s) {
                if (DEBUG) {
                    console.log("***" + s);
                }
            }

            function warnPrint(iid, s) {
                if (WARN && iid !== 0) {
                    console.log("        at " + iid + " " + s);
                }
            }

            function seriousWarnPrint(iid, s) {
                if (SERIOUS_WARN && iid !== 0) {
                    console.log("        at " + iid + " Serious " + s);
                }
            }

            function slice(a, start) {
                return Array.prototype.slice.call(a, start || 0);
            }

            function isNative(f) {
                return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
            }


            var loadAndBranchLogs = [];

            function printValueForTesting(loc, iid, val) {
                if (!LOG_ALL_READS_AND_BRANCHES) return;
                var type = typeof val;
                if (type !== 'object' && type !== 'function') {
                    loadAndBranchLogs.push(loc + ":" + iid + ":" + type + ":" + val);
                } else if (val === null) {
                    loadAndBranchLogs.push(loc + ":" + iid + ":" + type + ":" + val);
                } else if (HOP(val, SPECIAL_PROP) && HOP(val[SPECIAL_PROP], SPECIAL_PROP)) {
                    loadAndBranchLogs.push(loc + ":" + iid + ":" + type + ":" + val[SPECIAL_PROP][SPECIAL_PROP]);
                } else {
                    loadAndBranchLogs.push(loc + ":" + iid + ":" + type + ":object");
                }
            }

            //---------------------------- End utility functions -------------------------------


            //-------------------------------- Execution indexing --------------------------------
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

            //-------------------------------- End Execution indexing --------------------------------

            //----------------------------------- Begin Jalangi Library backend ---------------------------------

            var isInstrumentedCaller = false, isConstructorCall = false;
            // stack of return values from instrumented functions.
            // we need to keep a stack since a function may return and then
            // have another function call in a finally block (see test
            // call_in_finally.js)
            var returnVal = [];
            var exceptionVal;
            var scriptCount = 0;
            var lastVal;
            var switchLeft;
            var switchKeyStack = [];


            function callAsNativeConstructorWithEval(Constructor, args) {
                var a = [];
                for (var i = 0; i < args.length; i++)
                    a[i] = 'args[' + i + ']';
                var eval = EVAL_ORG;
                return eval('new Constructor(' + a.join() + ')');
            }

            function callAsNativeConstructor(Constructor, args) {
                if (args.length === 0) {
                    return new Constructor();
                }
                if (args.length === 1) {
                    return new Constructor(args[0]);
                }
                if (args.length === 2) {
                    return new Constructor(args[0], args[1]);
                }
                if (args.length === 3) {
                    return new Constructor(args[0], args[1], args[2]);
                }
                if (args.length === 4) {
                    return new Constructor(args[0], args[1], args[2], args[3]);
                }
                if (args.length === 5) {
                    return new Constructor(args[0], args[1], args[2], args[3], args[4]);
                }
                return callAsNativeConstructorWithEval(Constructor, args);
            }

            function callAsConstructor(Constructor, args) {
                if (isNative(Constructor)) {
                    var ret = callAsNativeConstructor(Constructor, args);
                    return ret;
                } else {
                    var Temp = function () {
                    }, inst, ret;
                    Temp.prototype = getConcrete(Constructor.prototype);
                    inst = new Temp;
                    ret = Constructor.apply(inst, args);
                    return Object(ret) === ret ? ret : inst;
                }
            }


            function invokeEval(base, f, args) {
                if (rrEngine) {
                    rrEngine.RR_evalBegin();
                }
                try {
                    return f(sandbox.instrumentCode(getConcrete(args[0]), {wrapProgram: false}).code);
                } finally {
                    if (rrEngine) {
                        rrEngine.RR_evalEnd();
                    }
                }
            }


            function invokeFun(iid, base, f, args, isConstructor) {
                var g, invoke, val, ic, tmp_rrEngine, tmpIsConstructorCall, tmpIsInstrumentedCaller, idx;

                var f_c = getConcrete(f);

                tmpIsConstructorCall = isConstructorCall;
                isConstructorCall = isConstructor;

                if (sandbox.analysis && sandbox.analysis.invokeFunPre) {
                    tmp_rrEngine = rrEngine;
                    rrEngine = null;
                    sandbox.analysis.invokeFunPre(iid, f, base, args, isConstructor);
                    rrEngine = tmp_rrEngine;
                }

                executionIndex.executionIndexInc(iid);

                var arr = getSymbolicFunctionToInvokeAndLog(f_c, isConstructor);
                tmpIsInstrumentedCaller = isInstrumentedCaller;
                ic = isInstrumentedCaller = f_c === undefined || HOP(f_c, SPECIAL_PROP2) || typeof f_c !== "function";

                if (mode === MODE_RECORD || mode === MODE_NO_RR) {
                    invoke = true;
                    g = f_c;
                } else if (mode === MODE_REPLAY || mode === MODE_NO_RR_IGNORE_UNINSTRUMENTED) {
                    invoke = arr[0] || isInstrumentedCaller;
                    g = arr[0] || f_c;
                }

                pushSwitchKey();
                try {
                    if (g === EVAL_ORG) {
                        val = invokeEval(base, g, args);
                    } else if (invoke) {
                        if (isConstructor) {
                            val = callAsConstructor(g, args);
                        } else {
                            val = g.apply(base, args);
                        }
                    } else {
                        if (rrEngine) {
                            rrEngine.RR_replay();
                        }
                        val = undefined;
                    }
                } finally {
                    popSwitchKey();
                    isInstrumentedCaller = tmpIsInstrumentedCaller;
                    isConstructorCall = tmpIsConstructorCall;
                }

                if (!ic && arr[1]) {
                    if (rrEngine) {
                        val = rrEngine.RR_L(iid, val, N_LOG_RETURN);
                    }
                }
                if (sandbox.analysis && sandbox.analysis.invokeFun) {
                    tmp_rrEngine = rrEngine;
                    rrEngine = null;
                    val = sandbox.analysis.invokeFun(iid, f, base, args, val, isConstructor);
                    rrEngine = tmp_rrEngine;
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(val);
                    }
                }
                printValueForTesting("Ret", iid, val);
                return val;
            }

            //var globalInstrumentationInfo;

            // getField (property read)
            function G(iid, base, offset, norr) {
                if (offset === SPECIAL_PROP || offset === SPECIAL_PROP2 || offset === SPECIAL_PROP3) {
                    return undefined;
                }

                var base_c = getConcrete(base);
                if (sandbox.analysis && sandbox.analysis.getFieldPre) {
                    sandbox.analysis.getFieldPre(iid, base, offset);
                }
                var val = base_c[getConcrete(offset)];


                if (rrEngine && !norr) {
                    val = rrEngine.RR_G(iid, base, offset, val);
                }
                if (sandbox.analysis && sandbox.analysis.getField) {
                    var tmp_rrEngine = rrEngine;
                    rrEngine = null;
                    val = sandbox.analysis.getField(iid, base, offset, val);
                    rrEngine = tmp_rrEngine;
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(val);
                    }
                }
                printValueForTesting("J$.G", iid, val);
                return val;
            }

            // putField (property write)
            function P(iid, base, offset, val) {
                if (offset === SPECIAL_PROP || offset === SPECIAL_PROP2 || offset === SPECIAL_PROP3) {
                    return undefined;
                }

                // window.location.hash = hash calls a function out of nowhere.
                // fix needs a call to RR_replay and setting isInstrumentedCaller to false
                // the following patch is not elegant
                var tmpIsInstrumentedCaller = isInstrumentedCaller;
                isInstrumentedCaller = false;

                var base_c = getConcrete(base);
                if (sandbox.analysis && sandbox.analysis.putFieldPre) {
                    val = sandbox.analysis.putFieldPre(iid, base, offset, val);
                }

                if (typeof base_c === 'function' && getConcrete(offset) === 'prototype') {
                    base_c[getConcrete(offset)] = getConcrete(val);
                } else {
                    base_c[getConcrete(offset)] = val;
                }

                if (rrEngine) {
                    rrEngine.RR_P(iid, base, offset, val);
                }
                if (sandbox.analysis && sandbox.analysis.putField) {
                    val = sandbox.analysis.putField(iid, base, offset, val);
                }

                // the following patch is not elegant
                if (rrEngine && ((offset + "") === "hash")) {
                    rrEngine.RR_replay();
                }

                // the following patch is not elegant
                isInstrumentedCaller = tmpIsInstrumentedCaller;
                return val;
            }

            // Function call (e.g., f())
            function F(iid, f, isConstructor) {
                return function () {
                    var base = this;
                    return invokeFun(iid, base, f, arguments, isConstructor);
                }
            }

            // Method call (e.g., e.f())
            function M(iid, base, offset, isConstructor) {
                return function () {
                    var f = G(iid, base, offset);
                    return invokeFun(iid, base, f, arguments, isConstructor);
                };
            }

            // Function enter
            function Fe(iid, val, dis /* this */) {
                executionIndex.executionIndexCall();
                if (rrEngine) {
                    rrEngine.RR_Fe(iid, val, dis);
                }
                returnVal.push(undefined);
                exceptionVal = undefined;
                if (sandbox.analysis && sandbox.analysis.functionEnter) {
                    sandbox.analysis.functionEnter(iid, val, dis);
                }
            }

            // Function exit
            function Fr(iid) {
                var ret = false, tmp;
                executionIndex.executionIndexReturn();
                if (rrEngine) {
                    rrEngine.RR_Fr(iid);
                }
                if (sandbox.analysis && sandbox.analysis.functionExit) {
                    ret = sandbox.analysis.functionExit(iid);
                }
                // if there was an uncaught exception, throw it
                // here, to preserve exceptional control flow
                if (exceptionVal !== undefined) {
                    tmp = exceptionVal;
                    exceptionVal = undefined;
                    throw tmp;
                }
                return ret;
            }

            // Uncaught exception
            function Ex(iid, e) {
                exceptionVal = e;
            }

            // Return statement
            function Rt(iid, val) {
                returnVal.pop();
                returnVal.push(val);
                return val;
            }

            // Actual return from function, invoked from 'finally' block
            // added around every function by instrumentation.  Reads
            // the return value stored by call to Rt()
            function Ra() {
                var ret = returnVal.pop();
                //returnVal = undefined;
                exceptionVal = undefined;
                if (sandbox.analysis && sandbox.analysis.return_) {
                    ret = sandbox.analysis.return_(ret);
                }
                return ret;
            }

            // Script enter
            function Se(iid, val) {
                scriptCount++;
                if (rrEngine) {
                    rrEngine.RR_Se(iid, val);
                }
                if (sandbox.analysis && sandbox.analysis.scriptEnter) {
                    sandbox.analysis.scriptEnter(iid, val);
                }
            }

            // Script exit
            function Sr(iid) {
                var tmp;
                scriptCount--;
                if (rrEngine) {
                    rrEngine.RR_Sr(iid);
                }
                if (sandbox.analysis && sandbox.analysis.scriptExit) {
                    sandbox.analysis.scriptExit(iid);
                }
                if (mode === MODE_NO_RR_IGNORE_UNINSTRUMENTED && scriptCount === 0) {
                    endExecution();
                }
                if (exceptionVal !== undefined) {
                    tmp = exceptionVal;
                    exceptionVal = undefined;
                    if ((mode === MODE_REPLAY && scriptCount > 0) || isBrowserReplay) {
                        throw tmp;
                    } else {
                        console.error(String(tmp));
                    }
                }
            }

            // Ignore argument (identity).
            // TODO Why do we need this?
            function I(val) {
                return val;
            }

            // object/function/regexp/array Literal
            function T(iid, val, type) {
                if (sandbox.analysis && sandbox.analysis.literalPre) {
                    sandbox.analysis.literalPre(iid, val);
                }
                if (rrEngine) {
                    rrEngine.RR_T(iid, val, type);
                }
                if (type === N_LOG_FUNCTION_LIT) {
                    if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                        Object.defineProperty(val, SPECIAL_PROP2, {
                            enumerable:false,
                            writable:true
                        });
                    }
                    val[SPECIAL_PROP2] = true;
                }

                // inform analysis, which may modify the literal
                if (sandbox.analysis && sandbox.analysis.literal) {
                    val = sandbox.analysis.literal(iid, val);
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(val);
                    }
                }

                return val;
            }

            // hash in for-in
            // E.g., given code 'for (p in x) { ... }',
            // H is invoked with the value of x
            function H(iid, val) {
                if (rrEngine) {
                    val = rrEngine.RR_H(iid, val);
                }
                return val;
            }

            // variable read
            function R(iid, name, val, isGlobal) {
                if (sandbox.analysis && sandbox.analysis.readPre) {
                    sandbox.analysis.readPre(iid, name, val, isGlobal);
                }
                if (rrEngine) {
                    val = rrEngine.RR_R(iid, name, val);
                }
                if (sandbox.analysis && sandbox.analysis.read) {
                    val = sandbox.analysis.read(iid, name, val, isGlobal);
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(val);
                    }
                }
                printValueForTesting("J$.R", iid, val);
                return val;
            }

            // variable write
            function W(iid, name, val, lhs) {
                if (sandbox.analysis && sandbox.analysis.writePre) {
                    sandbox.analysis.writePre(iid, name, val, lhs);
                }
                if (rrEngine) {
                    rrEngine.RR_W(iid, name, val);
                }
                if (sandbox.analysis && sandbox.analysis.write) {
                    val = sandbox.analysis.write(iid, name, val, lhs);
                }
                return val;
            }

            // variable declaration (Init)
            function N(iid, name, val, isArgumentSync) {
                if (rrEngine) {
                    rrEngine.RR_N(iid, name, val, isArgumentSync);
                }
                if (sandbox.analysis && sandbox.analysis.declare) {
                    sandbox.analysis.declare(iid, name, val, isArgumentSync);
                }
                return val;
            }

            // Modify and assign +=, -= ...
            // TODO is this dead or still used?
            function A(iid, base, offset, op) {
                var oprnd1 = G(iid, base, offset);
                return function (oprnd2) {
                    var val = B(iid, op, oprnd1, oprnd2);
                    return P(iid, base, offset, val);
                };
            }

            // Binary operation
            function B(iid, op, left, right) {
                var left_c, right_c, result_c, isArith = false;

                if (sandbox.analysis && sandbox.analysis.binaryPre) {
                    sandbox.analysis.binaryPre(iid, op, left, right);
                }

                left_c = getConcrete(left);
                right_c = getConcrete(right);

                switch (op) {
                    case "+":
                        isArith = true;
                        result_c = left_c + right_c;
                        break;
                    case "-":
                        isArith = true;
                        result_c = left_c - right_c;
                        break;
                    case "*":
                        isArith = true;
                        result_c = left_c * right_c;
                        break;
                    case "/":
                        isArith = true;
                        result_c = left_c / right_c;
                        break;
                    case "%":
                        isArith = true;
                        result_c = left_c % right_c;
                        break;
                    case "<<":
                        isArith = true;
                        result_c = left_c << right_c;
                        break;
                    case ">>":
                        isArith = true;
                        result_c = left_c >> right_c;
                        break;
                    case ">>>":
                        isArith = true;
                        result_c = left_c >>> right_c;
                        break;
                    case "<":
                        isArith = true;
                        result_c = left_c < right_c;
                        break;
                    case ">":
                        isArith = true;
                        result_c = left_c > right_c;
                        break;
                    case "<=":
                        isArith = true;
                        result_c = left_c <= right_c;
                        break;
                    case ">=":
                        isArith = true;
                        result_c = left_c >= right_c;
                        break;
                    case "==":
                        result_c = left_c == right_c;
                        break;
                    case "!=":
                        result_c = left_c != right_c;
                        break;
                    case "===":
                        result_c = left_c === right_c;
                        break;
                    case "!==":
                        result_c = left_c !== right_c;
                        break;
                    case "&":
                        isArith = true;
                        result_c = left_c & right_c;
                        break;
                    case "|":
                        isArith = true;
                        result_c = left_c | right_c;
                        break;
                    case "^":
                        isArith = true;
                        result_c = left_c ^ right_c;
                        break;
                    case "instanceof":
                        result_c = left_c instanceof right_c;
                        break;
                    case "in":
                        result_c = left_c in right_c;
                        if (rrEngine) {
                            result_c = rrEngine.RR_L(iid, result_c, N_LOG_RETURN);
                        }
                        break;
                    case "&&":
                        result_c = left_c && right_c;
                        break;
                    case "||":
                        result_c = left_c || right_c;
                        break;
                    case "regexin":
                        result_c = right_c.test(left_c);
                        break;
                    default:
                        throw new Error(op + " at " + iid + " not found");
                        break;
                }

                if (rrEngine) {
                    var type1 = typeof left_c;
                    var type2 = typeof right_c;
                    var flag1 = (type1 === "object" || type1 === "function")
                        && !(left_c instanceof String)
                        && !(left_c instanceof Number)
                        && !(left_c instanceof Boolean)
                    var flag2 = (type2 === "object" || type2 === "function")
                        && !(right_c instanceof String)
                        && !(right_c instanceof Number)
                        && !(right_c instanceof Boolean)
                    if (isArith && ( flag1 || flag2)) {
                        //console.log(" type1 "+type1+" type2 "+type2+" op "+op+ " iid "+iid);
                        result_c = rrEngine.RR_L(iid, result_c, N_LOG_OPERATION);
                    }
                }
                if (sandbox.analysis && sandbox.analysis.binary) {
                    result_c = sandbox.analysis.binary(iid, op, left, right, result_c);
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(result_c);
                    }
                }
                return result_c;
            }


            // Unary operation
            function U(iid, op, left) {
                var left_c, result_c, isArith = false;

                if (sandbox.analysis && sandbox.analysis.unaryPre) {
                    sandbox.analysis.unaryPre(iid, op, left);
                }

                left_c = getConcrete(left);

                switch (op) {
                    case "+":
                        isArith = true;
                        result_c = +left_c;
                        break;
                    case "-":
                        isArith = true;
                        result_c = -left_c;
                        break;
                    case "~":
                        isArith = true;
                        result_c = ~left_c;
                        break;
                    case "!":
                        result_c = !left_c;
                        break;
                    case "typeof":
                        result_c = typeof left_c;
                        break;
                    default:
                        throw new Error(op + " at " + iid + " not found");
                        break;
                }

                if (rrEngine) {
                    var type1 = typeof left_c;
                    var flag1 = (type1 === "object" || type1 === "function")
                        && !(left_c instanceof String)
                        && !(left_c instanceof Number)
                        && !(left_c instanceof Boolean)
                    if (isArith && flag1) {
                        result_c = rrEngine.RR_L(iid, result_c, N_LOG_OPERATION);
                    }
                }
                if (sandbox.analysis && sandbox.analysis.unary) {
                    result_c = sandbox.analysis.unary(iid, op, left, result_c);
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(result_c);
                    }
                }
                return result_c;
            }

            function pushSwitchKey() {
                switchKeyStack.push(switchLeft);
            }

            function popSwitchKey() {
                switchLeft = switchKeyStack.pop();
            }

            function last() {
                return lastVal;
            };

            // Switch key
            // E.g., for 'switch (x) { ... }',
            // C1 is invoked with value of x
            function C1(iid, left) {
                var left_c;

                left_c = getConcrete(left);
                switchLeft = left;
                return left_c;
            };

            // case label inside switch
            function C2(iid, left) {
                var left_c, ret;
                executionIndex.executionIndexInc(iid);

                left_c = getConcrete(left);
                left = B(iid, "===", switchLeft, left);

                if (sandbox.analysis && sandbox.analysis.conditionalPre) {
                    sandbox.analysis.conditionalPre(iid, left);
                }

                ret = !!getConcrete(left);

                if (sandbox.analysis && sandbox.analysis.conditional) {
                    sandbox.analysis.conditional(iid, left, ret);
                }

                if (branchCoverageInfo) {
                    branchCoverageInfo.updateBranchInfo(iid, ret);
                }
                printValueForTesting("J$.C2", iid, left_c ? 1 : 0);
                log.log("B" + iid + ":" + (left_c ? 1 : 0));
                return left_c;
            };

            // Expression in conditional
            function C(iid, left) {
                var left_c, ret;
                executionIndex.executionIndexInc(iid);
                if (sandbox.analysis && sandbox.analysis.conditionalPre) {
                    sandbox.analysis.conditionalPre(iid, left);
                }

                left_c = getConcrete(left);
                ret = !!left_c;

                if (sandbox.analysis && sandbox.analysis.conditional) {
                    lastVal = sandbox.analysis.conditional(iid, left, ret);
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(lastVal);
                    }
                } else {
                    lastVal = left_c;
                }

                if (branchCoverageInfo) {
                    branchCoverageInfo.updateBranchInfo(iid, ret);
                }

                printValueForTesting("J$.C ", iid, left_c ? 1 : 0);
                log.log("B" + iid + ":" + (left_c ? 1 : 0));
                return left_c;
            }

            function endExecution() {
                if (branchCoverageInfo)
                    branchCoverageInfo.storeBranchInfo();
                var pSkippedReads = 100.0 * skippedReads / (unoptimizedLogs - optimizedLogs);
                var pOptimizedLogs = 100.0 * optimizedLogs / unoptimizedLogs;
                //console.log("Reads Skipped, GetFields Skipped, Total Logs (unoptimized), Total Logs (optimized), % of skips that are local reads, % of reduction in logging = "+
                //    skippedReads+" , "+skippedGetFields+" , "+unoptimizedLogs+" , "+optimizedLogs+ " , "+pSkippedReads+"% , "+pOptimizedLogs+"%");
                if (sandbox.analysis && sandbox.analysis.endExecution) {
                    sandbox.analysis.endExecution();
                }
            }


            //----------------------------------- End Jalangi Library backend ---------------------------------

            //----------------------------------- Record Replay Engine ---------------------------------

            function RecordReplayEngine() {

                if (!(this instanceof RecordReplayEngine)) {
                    return new RecordReplayEngine();
                }

                var traceInfo, traceWriter;
                var seqNo = 0;

                var frame = {};
                var frameStack = [frame];

                var evalFrames = [];

                var literalId = 2;

                var objectId = 1;
                var objectMap = [];

                /*
                 type enumerations are
                 null is 0
                 number is 1
                 boolean is 2
                 string is 3
                 object is 4
                 function is 5
                 undefined is 6
                 array is 7
                 */

                function load(path) {
                    var head, script;
                    head = document.getElementsByTagName('head')[0];
                    script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = path;
                    head.appendChild(script);
                }

                function isSafeToCallGetOrSet(obj, prop, isGetter) {
                    if (typeof Object.getOwnPropertyDescriptor !== 'function') {
                        return false;
                    }
                    while (obj !== null) {
                        if (typeof obj !== 'object' && typeof obj !== 'function') {
                            return true;
                        }
                        var desc = Object.getOwnPropertyDescriptor(obj, prop);
                        if (desc !== undefined) {
                            if (isGetter && typeof desc.get === 'function') {
                                return false;
                            }
                            if (!isGetter && typeof desc.set === 'function') {
                                return false;
                            }
                        } else if (HOP(obj, prop)) {
                            return true;
                        }
                        obj = obj.__proto__;
                    }
                    return true;
                }

                function printableValue(val) {
                    var value, typen = getNumericType(val), ret = [];
                    if (typen === T_NUMBER || typen === T_BOOLEAN || typen === T_STRING) {
                        value = val;
                    } else if (typen === T_UNDEFINED) {
                        value = 0;
                    } else {
                        if (val === null) {
                            value = 0;
                        } else {
                            if (!HOP(val, SPECIAL_PROP)) {
                                if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                                    try {
                                        Object.defineProperty(val, SPECIAL_PROP, {
                                            enumerable:false,
                                            writable:true
                                        });
                                    } catch (e) {
                                        if (isBrowser && window.__JALANGI_PHANTOM__) {
                                            // known issue with older WebKit in PhantomJS
                                            // ignoring seems to not cause anything too harmful
                                        } else {
                                            throw e;
                                        }
                                    }
                                }
                                val[SPECIAL_PROP] = {};
                                val[SPECIAL_PROP][SPECIAL_PROP] = objectId;
//                            console.log("oid:"+objectId);
                                objectId = objectId + 2;
                            }
                            if (HOP(val, SPECIAL_PROP) && typeof val[SPECIAL_PROP][SPECIAL_PROP] === 'number') {
                                value = val[SPECIAL_PROP][SPECIAL_PROP];
                            } else {
                                value = undefined;
                            }
                        }
                    }
                    ret[F_TYPE] = typen;
                    ret[F_VALUE] = value;
                    return ret;
                }

                function getNumericType(val) {
                    var type = typeof val;
                    var typen;
                    switch (type) {
                        case "number":
                            typen = T_NUMBER;
                            break;
                        case "boolean":
                            typen = T_BOOLEAN;
                            break;
                        case "string":
                            typen = T_STRING;
                            break;
                        case "object":
                            if (val === null) {
                                typen = T_NULL;
                            } else if (Array.isArray(val)) {
                                typen = T_ARRAY;
                            } else {
                                typen = T_OBJECT;
                            }
                            break;
                        case "function":
                            typen = T_FUNCTION;
                            break;
                        case "undefined":
                            typen = T_UNDEFINED;
                            break;
                    }
                    return typen;
                }


                function setLiteralId(val) {
                    var id;
                    var oldVal = val;
                    val = getConcrete(oldVal);
                    if (!HOP(val, SPECIAL_PROP)) {
                        if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                            Object.defineProperty(val, SPECIAL_PROP, {
                                enumerable:false,
                                writable:true
                            });
                        }
                        val[SPECIAL_PROP] = {};
                        val[SPECIAL_PROP][SPECIAL_PROP] = id = literalId;
                        literalId = literalId + 2;
                        // changes due to getter or setter method
                        for (var offset in val) {
                            if (offset !== SPECIAL_PROP && offset !== SPECIAL_PROP2 && HOP(val, offset)) {
                                if (isSafeToCallGetOrSet(val, offset, true))
                                    val[SPECIAL_PROP][offset] = val[offset];
                            }
                        }
                    }
                    if (mode === MODE_REPLAY) {
                        objectMap[id] = oldVal;
                    }
                }

                function getActualValue(recordedValue, recordedType) {
                    if (recordedType === T_UNDEFINED) {
                        return undefined;
                    } else if (recordedType === T_NULL) {
                        return null;
                    } else {
                        return recordedValue;
                    }
                }

                function syncValue(recordedArray, replayValue, iid) {
                    var oldReplayValue = replayValue, tmp;
                    ;
                    replayValue = getConcrete(replayValue);
                    var recordedValue = recordedArray[F_VALUE], recordedType = recordedArray[F_TYPE];

                    if (recordedType === T_UNDEFINED ||
                        recordedType === T_NULL ||
                        recordedType === T_NUMBER ||
                        recordedType === T_STRING ||
                        recordedType === T_BOOLEAN) {
                        if ((tmp = getActualValue(recordedValue, recordedType)) !== replayValue) {
                            return tmp;
                        } else {
                            return oldReplayValue;
                        }
                    } else {
                        //var id = objectMapIndex[recordedValue];
                        var obj = objectMap[recordedValue];
                        var type = getNumericType(replayValue);

                        if (obj === undefined) {
                            if (type === recordedType && !HOP(replayValue, SPECIAL_PROP)) {
                                obj = replayValue;
                            } else {
                                if (recordedType === T_OBJECT) {
                                    obj = {};
                                } else if (recordedType === T_ARRAY) {
                                    obj = [];
                                } else {
                                    obj = function () {
                                    };
                                }
                            }
                            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                                Object.defineProperty(obj, SPECIAL_PROP, {
                                    enumerable:false,
                                    writable:true
                                });
                            }
                            obj[SPECIAL_PROP] = {};
                            obj[SPECIAL_PROP][SPECIAL_PROP] = recordedValue;
                            objectMap[recordedValue] = ((obj === replayValue) ? oldReplayValue : obj);
                        }
                        return (obj === replayValue) ? oldReplayValue : obj;
                    }
                }


                function logValue(iid, ret, funName) {
                    ret[F_IID] = iid;
                    ret[F_FUNNAME] = funName;
                    ret[F_SEQ] = seqNo++;
                    var line = JSON.stringify(ret) + "\n";
                    traceWriter.logToFile(line);
                }

                function checkPath(ret, iid, fun) {
                    if (ret === undefined || ret[F_IID] !== iid) {
                        if (fun === N_LOG_RETURN) {
                            throw undefined;  // a native function call has thrown an exception
                        } else {
                            if (LOG_ALL_READS_AND_BRANCHES) {
                                console.log()
                                require('fs').writeFileSync("readAndBranchLogs.replay", JSON.stringify(loadAndBranchLogs, undefined, 4), "utf8");
                            }
                            seriousWarnPrint(iid, "Path deviation at record = [" + ret + "] iid = " + iid + " index = " + traceInfo.getPreviousIndex());
                            throw new Error("Path deviation at record = [" + ret + "] iid = " + iid + " index = " + traceInfo.getPreviousIndex());
                        }
                    }
                }

                function getFrameContainingVar(name) {
                    var tmp = frame;
                    while (tmp && !HOP(tmp, name)) {
                        tmp = tmp[SPECIAL_PROP3];
                    }
                    if (tmp) {
                        return tmp;
                    } else {
                        return frameStack[0]; // return global scope
                    }
                }

                this.record = function (prefix) {
                    var ret = [];
                    ret[F_TYPE] = getNumericType(prefix);
                    ret[F_VALUE] = prefix;
                    logValue(0, ret, N_LOG_SPECIAL);
                };


                this.command = function (rec) {
                    traceWriter.remoteLog(rec);
                };

                this.RR_updateRecordedObject = function (obj) {
                    var val = getConcrete(obj);
                    if (val !== obj && val !== undefined && val !== null && HOP(val, SPECIAL_PROP)) {
                        var id = val[SPECIAL_PROP][SPECIAL_PROP];
                        objectMap[id] = obj;
                    }
                };


                this.RR_evalBegin = function () {
                    evalFrames.push(frame);
                    frame = frameStack[0];
                };

                this.RR_evalEnd = function () {
                    frame = evalFrames.pop();
                };

                /**
                 * getField
                 */
                this.RR_G = function (iid, base, offset, val) {
                    var base_c, type;

                    offset = getConcrete(offset);
                    if (mode === MODE_RECORD) {
                        base_c = getConcrete(base);
                        if ((type = typeof base_c) === 'string' ||
                            type === 'number' ||
                            type === 'boolean') {
                            seqNo++;
                            return val;
                        } else if (!HOP(base_c, SPECIAL_PROP)) {
                            return this.RR_L(iid, val, N_LOG_GETFIELD);
                        } else if (base_c[SPECIAL_PROP][offset] === val ||
                            // TODO what is going on with this condition?
                            (val !== val && base_c[SPECIAL_PROP][offset] !== base_c[SPECIAL_PROP][offset])) {
                            seqNo++;
                            return val;
                        } else {
                            if (HOP(base_c, offset) && isSafeToCallGetOrSet(base_c, offset, false)) {
                                // add the field to the shadow value, so we don't need to log
                                // future reads.  Only do so if the property is defined directly
                                // on the object, to avoid incorrectly adding the property to
                                // the object directly during replay (see test prototype_property.js)
                                base_c[SPECIAL_PROP][offset] = val;
                                return this.RR_L(iid, val, N_LOG_GETFIELD_OWN);
                            }
                            return this.RR_L(iid, val, N_LOG_GETFIELD);
                        }
                    } else if (mode === MODE_REPLAY) {
                        var rec;
                        if ((rec = traceInfo.getCurrent()) === undefined) {
                            traceInfo.next();
                            skippedGetFields++;
                            return val;
                        } else {
                            val = this.RR_L(iid, val, N_LOG_GETFIELD);
                            base_c = getConcrete(base);
                            // only add direct object properties
                            if (rec[F_FUNNAME] === N_LOG_GETFIELD_OWN) {
                                base_c[offset] = val;
                            }
                            return val;
                        }
                    } else {
                        return val;
                    }
                };


                this.RR_P = function (iid, base, offset, val) {
                    if (mode === MODE_RECORD) {
                        var base_c = getConcrete(base);
                        if (HOP(base_c, SPECIAL_PROP)) {
                            base_c[SPECIAL_PROP][getConcrete(offset)] = val;
                        }
                    }
                };

                this.RR_W = function (iid, name, val) {
                    if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                        getFrameContainingVar(name)[name] = val;
                    }
                };

                this.RR_N = function (iid, name, val, isArgumentSync) {
                    if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                        if (isArgumentSync === false || (isArgumentSync === true && isInstrumentedCaller)) {
                            frame[name] = val;
                        } else if (isArgumentSync === true && !isInstrumentedCaller) {
                            frame[name] = undefined;
                        }
                    }
                };

                this.RR_R = function (iid, name, val) {
                    var ret, trackedVal, trackedFrame, tmp;

                    trackedFrame = getFrameContainingVar(name);
                    trackedVal = trackedFrame[name];

                    if (mode === MODE_RECORD) {
                        if (trackedVal === val ||
                            (val !== val && trackedVal !== trackedVal) ||
                            (name === "this" && isInstrumentedCaller && !isConstructorCall)) {
                            seqNo++;
                            ret = val;
                        } else {
                            trackedFrame[name] = val;
                            ret = this.RR_L(iid, val, N_LOG_READ);
                        }
                    } else if (mode === MODE_REPLAY) {
                        if (traceInfo.getCurrent() === undefined) {
                            traceInfo.next();
                            skippedReads++;
                            if (name === "this" && isInstrumentedCaller && !isConstructorCall) {
                                ret = val;
                            } else {
                                ret = trackedVal;
                            }
                        } else {
                            ret = trackedFrame[name] = this.RR_L(iid, val, N_LOG_READ);
                        }
                    } else {
                        ret = val;
                    }
                    return ret;
                };

                this.RR_Fe = function (iid, val, dis) {
                    var ret;
                    if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                        frameStack.push(frame = {});
                        frame[SPECIAL_PROP3] = val[SPECIAL_PROP3];
                        if (!isInstrumentedCaller) {
                            if (mode === MODE_RECORD) {
                                var tmp = printableValue(val);
                                logValue(iid, tmp, N_LOG_FUNCTION_ENTER);
                                tmp = printableValue(dis);
                                logValue(iid, tmp, N_LOG_FUNCTION_ENTER);
                            } else if (mode === MODE_REPLAY) {
                                ret = traceInfo.getAndNext();
                                checkPath(ret, iid);
                                ret = traceInfo.getAndNext();
                                checkPath(ret, iid);
                                debugPrint("Index:" + traceInfo.getPreviousIndex());
                            }
                        }
                    }
                };

                this.RR_Fr = function (iid) {
                    if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                        frameStack.pop();
                        frame = frameStack[frameStack.length - 1];
                        if (mode === MODE_RECORD && frameStack.length <= 1) {
                            traceWriter.flush();
                        }
                    }
                };

                this.RR_Se = function (iid, val) {
                    var ret;
                    if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                        frameStack.push(frame = {});
                        frame[SPECIAL_PROP3] = frameStack[0];
                        if (mode === MODE_RECORD) {
                            var tmp = printableValue(val);
                            logValue(iid, tmp, N_LOG_SCRIPT_ENTER);
                        } else if (mode === MODE_REPLAY) {
                            ret = traceInfo.getAndNext();
                            checkPath(ret, iid);
                            debugPrint("Index:" + traceInfo.getPreviousIndex());
                        }
                    }
                };

                this.RR_Sr = function (iid) {
                    if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                        frameStack.pop();
                        frame = frameStack[frameStack.length - 1];
                        if (mode === MODE_RECORD && frameStack.length <= 1) {
                            traceWriter.flush();
                        }
                    }
                    if (isBrowserReplay) {
                        this.RR_replay();
                    }
                };

                this.RR_H = function (iid, val) {
                    var ret;
                    if (mode === MODE_RECORD) {
                        ret = Object.create(null);
                        for (var i in val) {
                            if (i !== SPECIAL_PROP && i !== SPECIAL_PROP2 && i !== SPECIAL_PROP3) {
                                ret[i] = 1;
                            }
                        }
                        var tmp = [];
                        tmp[F_TYPE] = getNumericType(ret);
                        tmp[F_VALUE] = ret;
                        logValue(iid, tmp, N_LOG_HASH);
                        val = ret;
                    } else if (mode === MODE_REPLAY) {
                        ret = traceInfo.getAndNext();
                        checkPath(ret, iid);
                        debugPrint("Index:" + traceInfo.getPreviousIndex());
                        val = ret[F_VALUE];
                        ret = Object.create(null);
                        for (i in val) {
                            if (HOP(val, i)) {
                                ret[i] = 1;
                            }
                        }
                        val = ret;
                    }
                    return val;
                };


                this.RR_L = function (iid, val, fun) {
                    var ret, tmp;
                    if (mode === MODE_RECORD) {
                        tmp = printableValue(val);
                        logValue(iid, tmp, fun);
                    } else if (mode === MODE_REPLAY) {
                        ret = traceInfo.getCurrent();
                        checkPath(ret, iid, fun);
                        traceInfo.next();
                        debugPrint("Index:" + traceInfo.getPreviousIndex());
                        val = syncValue(ret, val, iid);
                    }
                    return val;
                };

                this.RR_T = function (iid, val, fun) {
                    if ((mode === MODE_RECORD || mode === MODE_REPLAY) &&
                        (fun === N_LOG_ARRAY_LIT || fun === N_LOG_FUNCTION_LIT || fun === N_LOG_OBJECT_LIT || fun === N_LOG_REGEXP_LIT)) {
//                    console.log("iid:"+iid)  // uncomment for divergence
                        setLiteralId(val);
                        if (fun === N_LOG_FUNCTION_LIT) {
                            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                                Object.defineProperty(val, SPECIAL_PROP3, {
                                    enumerable:false,
                                    writable:true
                                });
                            }
                            val[SPECIAL_PROP3] = frame;
                        }
                    }
                };

                this.RR_replay = function (traceFileName) {
                    if (mode === MODE_REPLAY) {
                        if (traceFileName) {
                            traceInfo.setTraceFileName(traceFileName);
                        }

                        while (true) {
                            var ret = traceInfo.getCurrent();
                            if (typeof ret !== 'object') {
                                if (isBrowserReplay) {
                                    endExecution();
                                }
                                return;
                            }
                            var f, prefix;
                            if (ret[F_FUNNAME] === N_LOG_SPECIAL) {
                                prefix = ret[F_VALUE];
                                traceInfo.next();
                                ret = traceInfo.getCurrent();
                                if (sandbox.analysis && sandbox.analysis.beginExecution) {
                                    sandbox.analysis.beginExecution(prefix);
                                }
                            }
                            if (ret[F_FUNNAME] === N_LOG_FUNCTION_ENTER) {
                                f = getConcrete(syncValue(ret, undefined, 0));
                                ret = traceInfo.getNext();
                                var dis = syncValue(ret, undefined, 0);
                                f(dis);
                            } else if (ret[F_FUNNAME] === N_LOG_SCRIPT_ENTER) {
                                var path = getConcrete(syncValue(ret, undefined, 0));
                                if (isBrowserReplay) {
                                    load(path);
                                    return;
                                } else {
                                    var pth = require('path');
                                    var filep = pth.resolve(path);
                                    require(filep);
                                    // a browser can load a script multiple times.  So,
                                    // we need to remove the script from Node's cache,
                                    // in case it gets loaded again
                                    require.uncache(filep);
                                }
                            } else {
                                return;
                            }
                        }
                    }
                };


                function TraceWriter() {
                    var bufferSize = 0;
                    var buffer = [];
                    var traceWfh;
                    var fs = (!isBrowser) ? require('fs') : undefined;
                    var trying = false;
                    var cb;
                    var remoteBuffer = [];
                    var socket, isOpen = false;
                    // if true, in the process of doing final trace dump,
                    // so don't record any more events
                    var tracingDone = false;

                    if (IN_MEMORY_BROWSER_LOG) {
                        // attach the buffer to the sandbox
                        sandbox.trace_output = buffer;
                    }

                    function getFileHanlde() {
                        if (traceWfh === undefined) {
                            traceWfh = fs.openSync(TRACE_FILE_NAME, 'w');
                        }
                        return traceWfh;
                    }

                    /**
                     * @param {string} line
                     */
                    this.logToFile = function (line) {
                        if (tracingDone) {
                            // do nothing
                            return;
                        }
                        var len = line.length;
                        // we need this loop because it's possible that len >= MAX_BUF_SIZE
                        // TODO fast path for case where len < MAX_BUF_SIZE?
                        var start = 0, end = len < MAX_BUF_SIZE ? len : MAX_BUF_SIZE;
                        while (start < len) {
                            var chunk = line.substring(start, end);
                            var curLen = end - start;
                            if (bufferSize + curLen > MAX_BUF_SIZE) {
                                this.flush();
                            }
                            buffer.push(chunk);
                            bufferSize += curLen;
                            start = end;
                            end = (end + MAX_BUF_SIZE < len) ? end + MAX_BUF_SIZE : len;
                        }
                    };

                    this.flush = function () {
                        if (IN_MEMORY_BROWSER_LOG) {
                            // no need to flush anything
                            return;
                        }
                        var msg;
                        if (!isBrowser) {
                            var length = buffer.length;
                            for (var i = 0; i < length; i++) {
                                fs.writeSync(getFileHanlde(), buffer[i]);
                            }
                        } else {
                            msg = buffer.join('');
                            if (msg.length > 1) {
                                this.remoteLog(msg);
                            }
                        }
                        bufferSize = 0;
                        buffer = [];
                    };


                    function openSocketIfNotOpen() {
                        if (!socket) {
                            console.log("Opening connection");
                            socket = new WebSocket('ws://127.0.0.1:8080', 'log-protocol');
                            socket.onopen = tryRemoteLog;
                            socket.onmessage = tryRemoteLog2;
                        }
                    }

                    /**
                     * invoked when we receive a message over the websocket,
                     * indicating that the last trace chunk in the remoteBuffer
                     * has been received
                     */
                    function tryRemoteLog2() {
                        trying = false;
                        remoteBuffer.shift();
                        if (remoteBuffer.length === 0) {
                            if (cb) {
                                cb();
                                cb = undefined;
                            }
                        }
                        tryRemoteLog();
                    }

                    this.onflush = function (callback) {
                        if (remoteBuffer.length === 0) {
                            if (callback) {
                                callback();
                            }
                        } else {
                            cb = callback;
                            tryRemoteLog();
                        }
                    };

                    function tryRemoteLog() {
                        isOpen = true;
                        if (!trying && remoteBuffer.length > 0) {
                            trying = true;
                            socket.send(remoteBuffer[0]);
                        }
                    }

                    this.remoteLog = function (message) {
                        if (message.length > MAX_BUF_SIZE) {
                            throw new Error("message too big!!!");
                        }
                        remoteBuffer.push(message);
                        openSocketIfNotOpen();
                        if (isOpen) {
                            tryRemoteLog();
                        }
                    };

                    /**
                     * stop recording the trace and flush everything
                     */
                    this.stopTracing = function () {
                        tracingDone = true;
                        if (!IN_MEMORY_BROWSER_LOG) {
                            this.flush();
                        }
                    };
                }


                function TraceReader() {

                    var traceFileName = null;
                    var traceArray = [];
                    var traceIndex = 0;
                    var currentIndex = 0;
                    var frontierIndex = 0;
                    var MAX_SIZE = 1024;
                    var traceFh;
                    var done = false;
                    var curRecord = null;



                    function cacheRecords() {
                        var i = 0, flag, record;

                        if (isBrowserReplay) {
                            return;
                        }
                        if (currentIndex >= frontierIndex) {
                            if (!traceFh) {
                                var FileLineReader = require('./utils/FileLineReader');
                                traceFh = new FileLineReader(traceFileName);
                                // change working directory to wherever trace file resides
                                var pth = require('path');
                                var traceFileDir = pth.dirname(pth.resolve(process.cwd(), traceFileName));
                                process.chdir(traceFileDir);
                            }
                            traceArray = [];
                            while (!done && (flag = traceFh.hasNextLine()) && i < MAX_SIZE) {
                                record = JSON.parse(traceFh.nextLine());
                                traceArray.push(record);
                                debugPrint(i + ":" + JSON.stringify(record));
                                frontierIndex++;
                                i++;
                            }
                            if (!flag && !done) {
                                traceFh.close();
                                done = true;
                            }
                        }
                    }

                    this.setTraceFileName = function (tFN) {
                        traceFileName = tFN;
                    }

                    this.addRecord = function (line) {
                        var record = JSON.parse(line);
                        traceArray.push(record);
                        debugPrint(JSON.stringify(record));
                        frontierIndex++;
                    };

                    this.getAndNext = function () {
                        if (curRecord !== null) {
                            var ret = curRecord;
                            curRecord = null;
                            return ret;
                        }
                        cacheRecords();
                        var j = isBrowserReplay ? currentIndex : currentIndex % MAX_SIZE;
                        var record = traceArray[j];
                        if (record && record[F_SEQ] === traceIndex) {
                            currentIndex++;
                            optimizedLogs++;
                        } else {
                            record = undefined;
                        }
                        traceIndex++;
                        unoptimizedLogs++;
                        return record;
                    };

                    this.getNext = function () {
                        if (curRecord !== null) {
                            throw new Error("Cannot do two getNext() in succession");
                        }
                        var tmp = this.getAndNext();
                        var ret = this.getCurrent();
                        curRecord = tmp;
                        return ret;
                    };

                    this.getCurrent = function () {
                        if (curRecord !== null) {
                            return curRecord;
                        }
                        cacheRecords();
                        var j = isBrowserReplay ? currentIndex : currentIndex % MAX_SIZE;
                        var record = traceArray[j];
                        if (!(record && record[F_SEQ] === traceIndex)) {
                            record = undefined;
                        }
                        return record;
                    };

                    this.next = function () {
                        if (curRecord !== null) {
                            curRecord = null;
                            return;
                        }
                        cacheRecords();
                        var j = isBrowserReplay ? currentIndex : currentIndex % MAX_SIZE;
                        var record = traceArray[j];
                        if (record && record[F_SEQ] === traceIndex) {
                            currentIndex++;
                            optimizedLogs++;
                        }
                        traceIndex++;
                        unoptimizedLogs++;
                    };

                    this.getPreviousIndex = function () {
                        if (curRecord !== null) {
                            return traceIndex - 2;
                        }
                        return traceIndex - 1;
                    };

                }


                if (mode === MODE_REPLAY) {
                    traceInfo = new TraceReader();
                    this.addRecord = traceInfo.addRecord;
                } else if (mode === MODE_RECORD) {
                    traceWriter = new TraceWriter();
                    this.onflush = traceWriter.onflush;
                    if (isBrowser) {
                        if (!IN_MEMORY_BROWSER_LOG) {
                            this.command('reset');
                        }
                        // enable keyboard shortcut to stop tracing
                        window.addEventListener('keydown', function (e) {
                            // keyboard shortcut is Alt-Shift-T for now
                            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                                traceWriter.stopTracing();
                                traceWriter.onflush(function () {
                                    if (LOG_ALL_READS_AND_BRANCHES) console.save(loadAndBranchLogs, "readAndBranchLogs.record");
                                    alert("trace flush complete");
                                });
                            }
                        });
                    }
                }
            }

            //----------------------------------- End Record Replay Engine ---------------------------------

            (function (console) {

                console.save = function (data, filename) {

                    if (!data) {
                        console.error('Console.save: No data')
                        return;
                    }

                    if (!filename) filename = 'console.json'

                    if (typeof data === "object") {
                        data = JSON.stringify(data, undefined, 4)
                    }

                    var blob = new Blob([data], {type:'text/json'}),
                        e = document.createEvent('MouseEvents'),
                        a = document.createElement('a')

                    a.download = filename
                    a.href = window.URL.createObjectURL(blob)
                    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
                    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
                    a.dispatchEvent(e)
                }
            })(console);

            // initialize rrEngine, sandbox.analysis, executionIndex, and require.uncache
            executionIndex = new ExecutionIndex();

            if (analysis_script && analysis_script.indexOf('Engine') >= 0 && mode !== MODE_RECORD) {
                var SymbolicEngine = require('./' + analysis_script);
                sandbox.analysis = new SymbolicEngine(executionIndex);
            }
            if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                rrEngine = new RecordReplayEngine();
            }


            if (!isBrowser && typeof require === 'function') {
                /**
                 * remove a loaded module from Node's cache
                 * @param moduleName the name of the module
                 */
                require.uncache = function (moduleName) {
                    require.searchCache(moduleName, function (mod) {
                        delete require.cache[mod.id];
                    });
                };

                /**
                 * apply an operation to a module already loaded and
                 * cached by Node
                 * @param moduleName the name of the module
                 * @param callback the operation to perform
                 */
                require.searchCache = function (moduleName, callback) {
                    var mod = require.resolve(moduleName);

                    if (mod && ((mod = require.cache[mod]) !== undefined)) {
                        (function run(mod) {
                            mod.children.forEach(function (child) {
                                run(child);
                            });
                            callback(mod);
                        })(mod);
                    }
                };
            }


            sandbox.U = U; // Unary operation
            sandbox.B = B; // Binary operation
            sandbox.C = C; // Condition
            sandbox.C1 = C1; // Switch key
            sandbox.C2 = C2; // case label C1 === C2
            sandbox.addAxiom = addAxiom; // Add axiom
            sandbox.getConcrete = getConcrete;  // Get concrete value
            sandbox._ = last;  // Last value passed to C

            sandbox.H = H; // hash in for-in
            sandbox.I = I; // Ignore argument
            sandbox.G = G; // getField
            sandbox.P = P; // putField
            sandbox.R = R; // Read
            sandbox.W = W; // Write
            sandbox.N = N; // Init
            sandbox.T = T; // object/function/regexp/array Literal
            sandbox.F = F; // Function call
            sandbox.M = M; // Method call
            sandbox.A = A; // Modify and assign +=, -= ...
            sandbox.Fe = Fe; // Function enter
            sandbox.Fr = Fr; // Function return
            sandbox.Se = Se; // Script enter
            sandbox.Sr = Sr; // Script return
            sandbox.Rt = Rt; // returned value
            sandbox.Ra = Ra;
            sandbox.Ex = Ex;

            sandbox.replay = rrEngine ? rrEngine.RR_replay : undefined;
            sandbox.onflush = rrEngine ? rrEngine.onflush : function () {
            };
            sandbox.record = rrEngine ? rrEngine.record : function () {
            };
            sandbox.command = rrEngine ? rrEngine.command : function () {
            };
            sandbox.endExecution = endExecution;
            sandbox.addRecord = rrEngine ? rrEngine.addRecord : undefined;

            sandbox.log = log;


        }
    }


    if (isBrowser) {
        init(window.JALANGI_MODE);
    } else { // node.js
        exports.init = init;
    }

})();


//@todo:@assumption arguments.callee is available
//@todo:@assumptions SPECIAL_PROP = "*J$*" is added to every object, but its enumeration is avoided in instrumented code
//@todo:@assumptions ReferenceError when accessing an undeclared uninitialized variable won't be thrown
//@todo:@assumption window.x is not initialized in node.js replay mode when var x = e is done in the global scope, but handled using syncValues
//@todo:@assumption eval is not renamed
//@todo: with needs to be handled
//@todo: new Function and setTimeout
//@todo: @assumption implicit call of toString and valueOf on objects during type conversion
// could lead to inaccurate replay if the object fields are not synchronized
//@todo: @assumption JSON.stringify of any float could be inaccurate, so logging could be inaccurate
//@todo: implicit type conversion from objects/arrays/functions during binary and unary operations could break record/replay



// change line: 1 to line: 8 in node_modules/source-map/lib/source-map/source-node.js
