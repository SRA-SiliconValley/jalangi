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

$7 = {};


(function(sandbox) {

    var EVAL_ORG = eval;

    var PREFIX1 = "$7";
    var SPECIAL_PROP2 = "*"+PREFIX1+"I*";
    var DEBUG = false;
    var WARN = false;
    var SERIOUS_WARN = false;
    var  N_LOG_FUNCTION_LIT = 12;

    //-------------------------------- End constants ---------------------------------


    //-------------------------------------- Symbolic functions -----------------------------------------------------------

    function create_fun(f) {
        return function() {
            var len = arguments.length;
            for (var i = 0; i<len; i++) {
                arguments[i] = $7.getConcrete(arguments[i]);
            }
            return f.apply($7.getConcrete(this),arguments);
        }
    }

    function getSymbolicFunctionToInvokeAndLog (f, isConstructor) {
        if (f === Array ||
            f === Error ||
            f === String ||
            f === Number ||
            f === Boolean ||
            f === RegExp ||
            f === $7.addAxiom ||
            f === $7.readInput) {
            return [f, true];
        } else if (f === Function.prototype.apply ||
            f === Function.prototype.call ||
            f === console.log ||
            f === RegExp.prototype.test ||
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
    function getConcrete(val) {
        if (sEngine && sEngine.getConcrete) {
            return sEngine.getConcrete(val);
        } else {
            return val;
        }
    }

    function getSymbolic(val) {
        if (sEngine && sEngine.getSymbolic) {
            return sEngine.getSymbolic(val);
        } else {
            return val;
        }
    }

    function addAxiom(c) {
        if (sEngine && sEngine.installAxiom) {
            sEngine.installAxiom(c);
        }
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };



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


    function printValueForTesting(loc, iid, val) {
        return;
        var type = typeof val;
        if (type !== 'object' && type !== 'function') {
            console.log(loc+":"+iid+":"+type+":"+val);
        }
        if (val===null) {
            console.log(loc+":"+iid+":"+type+":"+val);
        }
    }
    //---------------------------- End utility functions -------------------------------



    //----------------------------------- Begin concolic execution ---------------------------------

    function callAsNativeConstructorWithEval(Constructor, args) {
        var a = [];
        for (var i = 0; i < args.length; i++)
            a[i] = 'args[' + i + ']';
        var eval = EVAL_ORG;
        return eval('new Constructor(' + a.join() + ')');
    }

    function callAsNativeConstructor (Constructor, args) {
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
            return callAsNativeConstructor(Constructor,args);
        } else {
            var Temp = function(){}, inst, ret;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }


    function invokeEval(base, f, args) {
        return f.call(base,sandbox.instrumentCode(args[0],true));
    }

    var isInstrumentedCaller = false;

    function invokeFun(iid, base, f, args, isConstructor) {
        var g, invoke, val, ic;

        var f_c = getConcrete(f);

        var arr = getSymbolicFunctionToInvokeAndLog(f_c, isConstructor);
        ic = isInstrumentedCaller = f_c === undefined || HOP(f_c,SPECIAL_PROP2) || typeof f_c !== "function";

        invoke = arr[0] || isInstrumentedCaller;
        g = arr[0] || f_c ;

        try {
            if (g === EVAL_ORG){
                val = invokeEval(base, g, args);
            } else if (invoke) {
                if (isConstructor) {
                    val = callAsConstructor(g, args);
                } else {
                    val = g.apply(base, args);
                }
            }  else {
                val = undefined;
            }
        } finally {
            isInstrumentedCaller = false;
        }

        return val;
    }


    function F(iid, f, isConstructor) {
        return function() {
            var base = this;
            return invokeFun(iid, base, f, arguments, isConstructor);
        }
    }

    function M(iid, base, offset, isConstructor) {
        return function() {
            var f = G(iid, base, offset);
            return invokeFun(iid, base, f, arguments, isConstructor);
        };
    }

    function Fe(iid, val, dis) {
    }

    function Fr(iid) {
    }

    var scriptCount = 0;

    function Se(iid,val) {
        scriptCount++;
    }

    function Sr(iid) {
        scriptCount--;
        if (scriptCount === 0) {
            endExecution();
        }
    }

    function I(val) {
        return val;
    }

    function T(iid, val, type) {
        if (type === N_LOG_FUNCTION_LIT) {
            val[SPECIAL_PROP2] = true;
        }
        return val;
    }

    function H(iid, val) {
        return val;
    }


    function R(iid, name, val) {
        return val;
    }

    function W(iid, name, val) {
        return val;
    }

    function N(iid, name, val, isArgumentSync) {
        return val;
    }


    function A(iid,base,offset,op) {
        var oprnd1 = G(iid,base, offset);
        return function(oprnd2) {
            var val = B(iid, op, oprnd1, oprnd2);
            return P(iid, base, offset, val);
        };
    }

    function G(iid, base, offset, norr) {
        if (offset === SPECIAL_PROP2) {
            return undefined;
        }

        var base_c = getConcrete(base);
        var val = base_c[getConcrete(offset)];
        return val;
    }

    function P(iid, base, offset, val) {
        if (offset === SPECIAL_PROP2) {
            return undefined;
        }

        var base_c = getConcrete(base);
        base_c[getConcrete(offset)] = val;
        return val;
    }

    function B(iid, op, left, right) {
        var left_c, right_c, result_c;

        left_c = getConcrete(left);
        right_c = getConcrete(right);

        switch(op) {
            case "+":
                result_c = left_c + right_c;
                break;
            case "-":
                result_c = left_c - right_c;
                break;
            case "*":
                result_c = left_c * right_c;
                break;
            case "/":
                result_c = left_c / right_c;
                break;
            case "%":
                result_c = left_c % right_c;
                break;
            case "<<":
                result_c = left_c << right_c;
                break;
            case ">>":
                result_c = left_c >> right_c;
                break;
            case ">>>":
                result_c = left_c >>> right_c;
                break;
            case "<":
                result_c = left_c < right_c;
                break;
            case ">":
                result_c = left_c > right_c;
                break;
            case "<=":
                result_c = left_c <= right_c;
                break;
            case ">=":
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
                result_c = left_c & right_c;
                break;
            case "|":
                result_c = left_c | right_c;
                break;
            case "^":
                result_c = left_c ^ right_c;
                break;
            case "instanceof":
                result_c = left_c instanceof right_c;
                break;
            case "in":
                result_c = left_c in right_c;
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
                throw new Error(op +" at "+iid+" not found");
                break;
        }

        return result_c;
    }


    function U(iid, op, left) {
        var left_c, result_c;

        left_c = getConcrete(left);

        switch(op) {
            case "+":
                result_c = + left_c;
                break;
            case "-":
                result_c = - left_c;
                break;
            case "~":
                result_c = ~ left_c;
                break;
            case "!":
                result_c = ! left_c;
                break;
            case "typeof":
                result_c = typeof left_c;
                break;
            default:
                throw new Error(op +" at "+iid+" not found");
                break;
        }

        return result_c;
    }

    var lastVal;
    var switchLeft;

    function last() {
        return lastVal;
    };

    function C1(iid, left) {
        var left_c;

        left_c = getConcrete(left);
        switchLeft = left;
        return left_c;
    };

    function C2(iid, left) {
        var left_c, ret;
        left_c = getConcrete(left);
        left = B(iid, "===", switchLeft, left);

        ret = !!getConcrete(left);
        return left_c;
    };

    function C(iid, left) {
        var left_c, ret;
        left_c = getConcrete(left);
        ret = !!left_c;

        lastVal = left_c;

        return left_c;
    }

//----------------------------------- End concolic execution ---------------------------------

    function endExecution() {
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

    sandbox.endExecution = endExecution;
}($7));

