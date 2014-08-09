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
 In the inbrowser mode, one has access to the object J$.smemory, which denotes the shadow memory.
 smemory.getShadowObject(obj) returns the shadow object associated with obj if type of obj is "object" or "function".
 smemory.getFrame(varName) returns the activation frame that contains the variable named "varName".
 To redefine all instrumentation functions, set JALANGI_MODE to 'symbolic' and J$.analysis to a suitable library containing redefinitions of W, R, etc.

 */

/*jslint node: true browser: true */
/*global J$ alert */

// wrap in anonymous function to create local namespace when in browser
// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

window = {String:String, Array:Array, Error:Error, Number:Number, Date:Date, Boolean:Boolean, RegExp:RegExp};

(function (sandbox) {
    var Constants = sandbox.Constants;
    var Globals = sandbox.Globals;
    var Config = sandbox.Config;
    var SMemory = sandbox.SMemory;
    var RecordReplayEngine = sandbox.RecordReplayEngine;

//    var Globals = (typeof sandbox.Globals === 'undefined'? require('./Globals.js'): sandbox.Globals);
//    var Config = (typeof sandbox.Config === 'undefined'? require('./Config.js'): sandbox.Config);
//    var RecordReplayEngine = (typeof sandbox.RecordReplayEngine === 'undefined'? require('./RecordReplayEngine.js'): sandbox.RecordReplayEngine);


    function init(mode_name, analysis_script, initSMemory) {

        var MODE_RECORD = Constants.MODE_RECORD,
            MODE_REPLAY = Constants.MODE_REPLAY,
            MODE_NO_RR_IGNORE_UNINSTRUMENTED = Constants.MODE_NO_RR_IGNORE_UNINSTRUMENTED,
            MODE_NO_RR = Constants.MODE_NO_RR,
            MODE_DIRECT = Constants.MODE_DIRECT;
        var getConcrete = Constants.getConcrete;
        var HOP = Constants.HOP;
        var EVAL_ORG = eval;
        var isBrowser = Constants.isBrowser;


        var SPECIAL_PROP = Constants.SPECIAL_PROP;
        var SPECIAL_PROP2 = Constants.SPECIAL_PROP2;
        var SPECIAL_PROP3 = Constants.SPECIAL_PROP3;

        var N_LOG_FUNCTION_LIT = Constants.N_LOG_FUNCTION_LIT,
            N_LOG_RETURN = Constants.N_LOG_RETURN,
            N_LOG_OPERATION = Constants.N_LOG_OPERATION;


        var mode = Globals.mode = (function (str) {
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
        var isBrowserReplay = Globals.isBrowserReplay = Constants.isBrowser && Globals.mode === MODE_REPLAY;
        Globals.isInstrumentedCaller = false;
        Globals.isConstructorCall = false;
        Globals.isMethodCall = false;

        if (Globals.mode === MODE_DIRECT) {
            /* JALANGI_ANALYSIS file must define all instrumentation functions such as U, B, C, C1, C2, W, R, G, P */
            if (analysis_script) {
                require(require('path').resolve(analysis_script))(sandbox);
                if (sandbox.postLoad) {
                    sandbox.postLoad();
                }
            }
        } else {

            var rrEngine;
            var branchCoverageInfo;
            var smemory;


            if (mode === MODE_RECORD || mode === MODE_REPLAY) {
                rrEngine = new RecordReplayEngine();
            }
            if (initSMemory) {
                sandbox.smemory = smemory = new SMemory();
            }


            //-------------------------------------- Symbolic functions -----------------------------------------------------------

            function create_fun(f) {
                return function () {
                    var len = arguments.length;
                    for (var i = 0; i < len; i++) {
                        arguments[i] = getConcrete(arguments[i]);
                    }
                    return f.apply(getConcrete(this), arguments);
                }
            }

            function concretize(obj) {
                for (var key in obj) {
                    if (HOP(obj, key)) {
                        obj[key] = getConcrete(obj[key]);
                    }
                }
            }

            function modelDefineProperty(f) {
                return function () {
                    var len = arguments.length;
                    for (var i = 0; i < len; i++) {
                        arguments[i] = getConcrete(arguments[i]);
                    }
                    if (len === 3) {
                        concretize(arguments[2]);
                    }
                    return f.apply(getConcrete(this), arguments);
                }
            }

            function getSymbolicFunctionToInvokeAndLog(f, isConstructor) {
                if (f === Array ||
                    f === Error ||
                    f === String ||
                    f === Number ||
                    f === Date ||
                    f === Boolean ||
                    f === RegExp ||
                    f === sandbox.addAxiom ||
                    f === sandbox.readInput) {
                    return [f, true];
                } else if (//f === Function.prototype.apply ||
                //f === Function.prototype.call ||
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
                } else if (f === Object.defineProperty) {
                    return [modelDefineProperty(f), false];
                }
                return [null, true];
            }


            //---------------------------- Utility functions -------------------------------
            function addAxiom(c) {
                if (sandbox.analysis && sandbox.analysis.installAxiom) {
                    sandbox.analysis.installAxiom(c);
                }
            }

            var loadAndBranchLogs = Globals.loadAndBranchLogs;

            function printValueForTesting(loc, iid, val) {
                if (!Config.LOG_ALL_READS_AND_BRANCHES) return;
                var type = typeof val, str;
                if (type !== 'object' && type !== 'function') {
                    str = loc + ":" + iid + ":" + type + ":" + val;
                    loadAndBranchLogs.push(str);
                } else if (val === null) {
                    str = loc + ":" + iid + ":" + type + ":" + val;
                    loadAndBranchLogs.push(str);
                } else if (HOP(val, SPECIAL_PROP) && HOP(val[SPECIAL_PROP], SPECIAL_PROP)) {
                    str = loc + ":" + iid + ":" + type + ":" + val[SPECIAL_PROP][SPECIAL_PROP];
                    loadAndBranchLogs.push(str);
                } else {
                    str = loc + ":" + iid + ":" + type + ":object";
                    loadAndBranchLogs.push(str);
                }
            }

            //---------------------------- End utility functions -------------------------------


            //----------------------------------- Begin Jalangi Library backend ---------------------------------

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
            var argIndex;


            /**
             * invoked when the client analysis throws an exception
             * @param e
             */
            function clientAnalysisException(e) {
                console.error("analysis exception!!!");
                console.error(e.stack);
                if (isBrowser) {
                    // we don't really know what will happen to the exception,
                    // but we don't have a way to just terminate, so throw it
                    throw e;
                } else {
                    // under node.js, just die
                    process.exit(1);
                }
            }

            function isNative(f) {
                return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
            }

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
//                if (isNative(Constructor)) {
                if (true) {
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
                if (smemory) {
                    smemory.evalBegin();
                }
                try {
                    return f(sandbox.instrumentCode(getConcrete(args[0]), {wrapProgram:false, isEval:true}).code);
                } finally {
                    if (rrEngine) {
                        rrEngine.RR_evalEnd();
                    }
                    if (smemory) {
                        smemory.evalEnd();
                    }
                }
            }


            function invokeFun(iid, base, f, args, isConstructor, isMethod) {
                var g, invoke, val, ic, tmp_rrEngine, tmpIsConstructorCall, tmpIsInstrumentedCaller, idx, tmpIsMethodCall;

                var f_c = getConcrete(f);

                tmpIsConstructorCall = Globals.isConstructorCall;
                Globals.isConstructorCall = isConstructor;
                tmpIsMethodCall = Globals.isMethodCall;
                Globals.isMethodCall = isMethod;


                if (sandbox.analysis && sandbox.analysis.invokeFunPre) {
                    tmp_rrEngine = rrEngine;
                    rrEngine = null;
                    try {
                        sandbox.analysis.invokeFunPre(iid, f, base, args, isConstructor);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                    rrEngine = tmp_rrEngine;
                }


                var arr = getSymbolicFunctionToInvokeAndLog(f_c, isConstructor);
                tmpIsInstrumentedCaller = Globals.isInstrumentedCaller;
                ic = Globals.isInstrumentedCaller = f_c === undefined || HOP(f_c, SPECIAL_PROP2) || typeof f_c !== "function";

                if (mode === MODE_RECORD || mode === MODE_NO_RR) {
                    invoke = true;
                    g = f_c;
                } else if (mode === MODE_REPLAY || mode === MODE_NO_RR_IGNORE_UNINSTRUMENTED) {
                    invoke = arr[0] || Globals.isInstrumentedCaller;
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
                            val = Function.prototype.apply.call(g, base, args);
                            //val = g.apply(base, args);
                        }
                    } else {
                        if (rrEngine) {
                            rrEngine.RR_replay();
                        }
                        val = undefined;
                    }
                } finally {
                    popSwitchKey();
                    Globals.isInstrumentedCaller = tmpIsInstrumentedCaller;
                    Globals.isConstructorCall = tmpIsConstructorCall;
                    Globals.isMethodCall = tmpIsMethodCall;
                }

                if (!ic && arr[1]) {
                    if (rrEngine) {
                        val = rrEngine.RR_L(iid, val, N_LOG_RETURN);
                    }
                }
                if (sandbox.analysis && sandbox.analysis.invokeFun) {
                    tmp_rrEngine = rrEngine;
                    rrEngine = null;
                    try {
                        val = sandbox.analysis.invokeFun(iid, f, base, args, val, isConstructor);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
//                if (rrEngine) {
//                    base_c = rrEngine.RR_preG(iid, base, offset);
//                }

                if (sandbox.analysis && sandbox.analysis.getFieldPre && getConcrete(offset) !== '__proto__') {
                    try {
                        sandbox.analysis.getFieldPre(iid, base, offset);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                var val = base_c[getConcrete(offset)];


                if (rrEngine && !norr) {
                    val = rrEngine.RR_G(iid, base_c, offset, val);
                }
                if (sandbox.analysis && sandbox.analysis.getField && getConcrete(offset) !== '__proto__') {
                    var tmp_rrEngine = rrEngine;
                    rrEngine = null;
                    try {
                        val = sandbox.analysis.getField(iid, base, offset, val);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                    rrEngine = tmp_rrEngine;
                    if (rrEngine) {
                        rrEngine.RR_updateRecordedObject(val);
                    }
                }

                if (rrEngine) {
                    rrEngine.RR_replay();
                    rrEngine.RR_Load(iid);
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
                var tmpIsInstrumentedCaller = Globals.isInstrumentedCaller;
                Globals.isInstrumentedCaller = false;

                var base_c = getConcrete(base);
                if (sandbox.analysis && sandbox.analysis.putFieldPre) {
                    try {
                        val = sandbox.analysis.putFieldPre(iid, base, offset, val);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                    try {
                        val = sandbox.analysis.putField(iid, base, offset, val);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }

                // the following patch was not elegant
                // but now it is better (got rid of offset+"" === "hash" check)
                if (rrEngine) {//} && ((offset + "") === "hash")) {
                    rrEngine.RR_replay();
                    rrEngine.RR_Load(iid); // add a dummy (no record) in the trace so that RR_Replay does not replay non-setter method
                }

                // the following patch is not elegant
                Globals.isInstrumentedCaller = tmpIsInstrumentedCaller;
                return val;
            }

            // Function call (e.g., f())
            function F(iid, f, isConstructor) {
                return function () {
                    var base = this;
                    return invokeFun(iid, base, f, arguments, isConstructor, false);
                }
            }

            // Method call (e.g., e.f())
            function M(iid, base, offset, isConstructor) {
                return function () {
                    var f = G(iid + 2, base, offset);
                    return invokeFun(iid, base, f, arguments, isConstructor, true);
                };
            }

            // Function enter
            function Fe(iid, val, dis /* this */, args) {
                argIndex = 0;
                if (rrEngine) {
                    rrEngine.RR_Fe(iid, val, dis);
                }
                if (smemory) {
                    smemory.functionEnter(val);
                }
                returnVal.push(undefined);
                exceptionVal = undefined;
                if (sandbox.analysis && sandbox.analysis.functionEnter) {
                    if (rrEngine) {
                        val = rrEngine.RR_getConcolicValue(val);
                    }
                    try {
                        sandbox.analysis.functionEnter(iid, val, dis, args);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                printValueForTesting("Call", iid, val);
            }

            // Function exit
            function Fr(iid) {
                var ret = false, tmp;
                if (rrEngine) {
                    rrEngine.RR_Fr(iid);
                }
                if (smemory) {
                    smemory.functionReturn();
                }
                if (sandbox.analysis && sandbox.analysis.functionExit) {
                    try {
                        ret = sandbox.analysis.functionExit(iid);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                if (sandbox.analysis && sandbox.analysis.return_) {
                    try {
                        val = sandbox.analysis.return_(val);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                return val;
            }

            // Actual return from function, invoked from 'finally' block
            // added around every function by instrumentation.  Reads
            // the return value stored by call to Rt()
            function Ra() {
                var ret = returnVal.pop();
                //returnVal = undefined;
                exceptionVal = undefined;
                return ret;
            }

            // Script enter
            function Se(iid, val) {
                scriptCount++;
                if (rrEngine) {
                    rrEngine.RR_Se(iid, val);
                }
                if (smemory) {
                    smemory.scriptEnter();
                }
                if (sandbox.analysis && sandbox.analysis.scriptEnter) {
                    try {
                        sandbox.analysis.scriptEnter(iid, val);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
            }

            // Script exit
            function Sr(iid) {
                var tmp;
                scriptCount--;
                if (rrEngine) {
                    rrEngine.RR_Sr(iid);
                }
                if (smemory) {
                    smemory.scriptReturn();
                }
                if (sandbox.analysis && sandbox.analysis.scriptExit) {
                    try {
                        sandbox.analysis.scriptExit(iid);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                        console.error(tmp);
                        console.error(tmp.stack);
                    }
                }
            }

            // Ignore argument (identity).
            // TODO Why do we need this?
            function I(val) {
                return val;
            }

            // object/function/regexp/array Literal
            function T(iid, val, type, hasGetterSetter) {
                if (sandbox.analysis && sandbox.analysis.literalPre) {
                    try {
                        sandbox.analysis.literalPre(iid, val, hasGetterSetter);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                if (rrEngine) {
                    rrEngine.RR_T(iid, val, type, hasGetterSetter);
                }
                if (smemory) {
                    smemory.defineFunction(val, type);
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
                    try {
                        val = sandbox.analysis.literal(iid, val, hasGetterSetter);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
            function R(iid, name, val, isGlobal, isPseudoGlobal) {
                if (sandbox.analysis && sandbox.analysis.readPre) {
                    try {
                        sandbox.analysis.readPre(iid, name, val, isGlobal);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                if (rrEngine && (name === 'this' || isGlobal)) {
                    val = rrEngine.RR_R(iid, name, val);
                }
                if (sandbox.analysis && sandbox.analysis.read) {
                    try {
                        val = sandbox.analysis.read(iid, name, val, isGlobal);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                    if (rrEngine) {// && (name==='this' || isGlobal)) {
                        rrEngine.RR_updateRecordedObject(val);
                    }
                }
                printValueForTesting("J$.R", iid, val);
                return val;
            }

            // variable write
            function W(iid, name, val, lhs, isGlobal, isPseudoGlobal) {
                if (sandbox.analysis && sandbox.analysis.writePre) {
                    try {
                        sandbox.analysis.writePre(iid, name, val, lhs);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                if (rrEngine && isGlobal) {
                    rrEngine.RR_W(iid, name, val);
                }
                if (sandbox.analysis && sandbox.analysis.write) {
                    try {
                        val = sandbox.analysis.write(iid, name, val, lhs);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                return val;
            }

            // variable declaration (Init)
            function N(iid, name, val, isArgumentSync, isLocalSync) {
                // isLocalSync is only true when we sync variables inside a for-in loop
                if (isArgumentSync) {
                    argIndex++;
                }
                if (rrEngine) {
                    val = rrEngine.RR_N(iid, name, val, isArgumentSync);
                }
                if (!isLocalSync && smemory) {
                    smemory.initialize(name);
                }
                if (!isLocalSync && sandbox.analysis && sandbox.analysis.declare) {
                    try {
                        if (isArgumentSync && argIndex > 1) {
                            sandbox.analysis.declare(iid, name, val, isArgumentSync, argIndex - 2);
                        } else {
                            sandbox.analysis.declare(iid, name, val, isArgumentSync);
                        }
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
                return val;
            }

            // Modify and assign +=, -= ...
            // TODO is this dead or still used?
            // definitely used --KS
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
                    try {
                        sandbox.analysis.binaryPre(iid, op, left, right);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                        if (rrEngine) {
                            result_c = rrEngine.RR_L(iid, result_c, N_LOG_RETURN);
                        }
                        break;
                    case "delete":
                        result_c = delete left_c[right_c];
                        if (rrEngine) {
                            result_c = rrEngine.RR_L(iid, result_c, N_LOG_RETURN);
                        }
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
                    try {
                        result_c = sandbox.analysis.binary(iid, op, left, right, result_c);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                    try {
                        sandbox.analysis.unaryPre(iid, op, left);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                    try {
                        result_c = sandbox.analysis.unary(iid, op, left, result_c);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
            }

            // Switch key
            // E.g., for 'switch (x) { ... }',
            // C1 is invoked with value of x
            function C1(iid, left) {
                var left_c;

                left_c = getConcrete(left);
                switchLeft = left;
                return left_c;
            }

            // case label inside switch
            function C2(iid, left) {
                var left_c, ret;

                left_c = getConcrete(left);
                left = B(iid, "===", switchLeft, left);

                if (sandbox.analysis && sandbox.analysis.conditionalPre) {
                    try {
                        sandbox.analysis.conditionalPre(iid, left);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }

                ret = !!getConcrete(left);

                if (sandbox.analysis && sandbox.analysis.conditional) {
                    try {
                        sandbox.analysis.conditional(iid, left, ret);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }

                if (branchCoverageInfo) {
                    branchCoverageInfo.updateBranchInfo(iid, ret);
                }
                printValueForTesting("J$.C2", iid, left_c ? 1 : 0);
                return left_c;
            };

            // Expression in conditional
            function C(iid, left) {
                var left_c, ret;
                if (sandbox.analysis && sandbox.analysis.conditionalPre) {
                    try {
                        sandbox.analysis.conditionalPre(iid, left);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }

                left_c = getConcrete(left);
                ret = !!left_c;

                if (sandbox.analysis && sandbox.analysis.conditional) {
                    try {
                        lastVal = sandbox.analysis.conditional(iid, left, left_c);
                    } catch (e) {
                        clientAnalysisException(e);
                    }
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
                return left_c;
            }

            function endExecution() {
                if (branchCoverageInfo)
                    branchCoverageInfo.storeBranchInfo();
                if (Config.LOG_ALL_READS_AND_BRANCHES) {
                    if (mode === MODE_REPLAY) {
                        require('fs').writeFileSync("readAndBranchLogs.replay", JSON.stringify(Globals.loadAndBranchLogs, undefined, 4), "utf8");
                    }
                }

                if (sandbox.analysis && sandbox.analysis.endExecution) {
                    try {
                        return sandbox.analysis.endExecution();
                    } catch (e) {
                        clientAnalysisException(e);
                    }
                }
            }


            //----------------------------------- End Jalangi Library backend ---------------------------------

            // -------------------- Monkey patch some methods ------------------------
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
            };


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
            sandbox.setTraceFileName = rrEngine ? rrEngine.setTraceFileName : undefined;
        }
    }


    if (Constants.isBrowser) {
        init(window.JALANGI_MODE, undefined, window.USE_SMEMORY);
    } else { // node.js
        init(global.JALANGI_MODE, global.ANALYSIS_SCRIPT, global.USE_SMEMORY);
    }

})(J$);


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
