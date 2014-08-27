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


// wrap in anonymous function to create local namespace when in browser
// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    //----------------------------------- Begin Jalangi Library backend ---------------------------------

    // stack of return values from instrumented functions.
    // we need to keep a stack since a function may return and then
    // have another function call in a finally block (see test
    // call_in_finally.js)

    var returnStack = [];
    var exceptionVal;
    var lastVal;
    var switchLeft;
    var switchKeyStack = [];
    var argIndex;
    var EVAL_ORG = eval;


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
        var ret;
        if (true) {
            ret = callAsNativeConstructor(Constructor, args);
            return ret;
        } else {
            var Temp = function () {}, inst;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }

    function invokeEval(base, f, args) {
        return f(sandbox.instrumentCode(args[0], {wrapProgram:false, isEval:true}).code);
    }

    function callFun(f, base, args, isConstructor) {
        var result;
        pushSwitchKey();
        try {
            if (f === EVAL_ORG) {
                result = invokeEval(base, f, args);
            } else if (isConstructor) {
                result = callAsConstructor(f, args);
            } else {
                result = Function.prototype.apply.call(f, base, args);
            }
            return result;
        } finally {
            popSwitchKey();
        }
    }

    function invokeFun(iid, base, f, args, isConstructor, isMethod) {
        var aret, skip = false, result;

        if (sandbox.analysis && sandbox.analysis.invokeFunPre) {
            aret = sandbox.analysis.invokeFunPre(iid, f, base, args, isConstructor, isMethod);
            if (aret) {
                f = aret.f;
                base = aret.base;
                args = aret.args;
                skip = aret.skip;
            }
        }
        if (!skip) {
            result = callFun(f, base, args, isConstructor);
        }
        if (sandbox.analysis && sandbox.analysis.invokeFun) {
            aret = sandbox.analysis.invokeFun(iid, f, base, args, result, isConstructor, isMethod);
            if (aret) {
                result = aret.result;
            }
        }
        return result;
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

    // Ignore argument (identity).
    function I(val) {
        return val;
    }

    // object/function/regexp/array Literal
    function T(iid, val, type, hasGetterSetter) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.literal) {
            aret = sandbox.analysis.literal(iid, val, hasGetterSetter);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    function H(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.hash) {
            aret = sandbox.analysis.forinObject(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // variable read
    // variable declaration (Init)
    function N(iid, name, val, isArgument, isLocalSync) {
        // isLocalSync is only true when we sync variables inside a for-in loop
        var aret;

        if (isArgument) {
            argIndex++;
        }
        if (!isLocalSync && sandbox.analysis && sandbox.analysis.declare) {
            if (isArgument && argIndex > 1) {
                sandbox.analysis.declare(iid, name, val, isArgument, argIndex - 2);
            } else {
                sandbox.analysis.declare(iid, name, val, isArgument, -1);
            }
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // getField (property read)
    function G(iid, base, offset) {
        var aret, skip = false, val;

        if (sandbox.analysis && sandbox.analysis.getFieldPre) {
            aret = sandbox.analysis.getFieldPre(iid, base, offset);
            if (aret) {
                base = aret.base;
                offset = aret.offset;
                skip = aret.skip;
            }
        }

        if (!skip) {
            val = base[offset];
        }
        if (sandbox.analysis && sandbox.analysis.getField) {
            aret = sandbox.analysis.getField(iid, base, offset, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // putField (property write)
    function P(iid, base, offset, val) {
        var aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.putFieldPre) {
            aret = sandbox.analysis.putFieldPre(iid, base, offset, val);
            if (aret) {
                base = aret.base;
                offset = aret.offset;
                val = aret.val;
                skip = aret.skip;
            }
        }

        if (!skip) {
            base[offset] = val;
        }
        if (sandbox.analysis && sandbox.analysis.putField) {
            aret = sandbox.analysis.putField(iid, base, offset, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // variable write
    // isGlobal means that the variable is global and not declared as var
    // isPseudoGlobal means that the variable is global and is declared as var
    function R(iid, name, val, isGlobal, isPseudoGlobal) {
        var aret;

        if (sandbox.analysis && sandbox.analysis.read) {
            aret = sandbox.analysis.read(iid, name, val, isGlobal, isPseudoGlobal);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // variable write
    function W(iid, name, val, lhs, isGlobal, isPseudoGlobal) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.write) {
            aret = sandbox.analysis.write(iid, name, val, lhs, isGlobal, isPseudoGlobal);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // Uncaught exception
    function Ex(iid, e) {
        exceptionVal = e;
    }

    // Return statement
    function Rt(iid, val) {
        returnStack.pop();
        returnStack.push(val);
        return val;
    }

    // Actual return from function, invoked from 'finally' block
    // added around every function by instrumentation.  Reads
    // the return value stored by call to Rt()
    function Ra() {
        var returnVal = returnStack.pop();
        exceptionVal = undefined;
        return returnVal;
    }

    // Function enter
    function Fe(iid, f, dis /* this */, args) {
        argIndex = 0;
        returnStack.push(undefined);
        exceptionVal = undefined;
        if (sandbox.analysis && sandbox.analysis.functionEnter) {
            sandbox.analysis.functionEnter(iid, f, dis, args);
        }
    }

    // Function exit
    function Fr(iid) {
        var isBacktrack = false, tmp, aret, returnVal;

        returnVal = returnStack.pop();
        if (sandbox.analysis && sandbox.analysis.functionExit) {
            aret = sandbox.analysis.functionExit(iid, returnVal, exceptionVal);
            if (aret) {
                returnVal = aret.returnVal;
                exceptionVal = aret.exceptionVal;
                isBacktrack = aret.isBacktrack;
            }
        }
        if (!isBacktrack) {
            returnStack.push(returnVal);
        }
        // if there was an uncaught exception, throw it
        // here, to preserve exceptional control flow
        if (exceptionVal !== undefined) {
            tmp = exceptionVal;
            exceptionVal = undefined;
            throw tmp;
        }
        return isBacktrack;
    }

    // Script enter
    function Se(iid, val) {
        if (sandbox.analysis && sandbox.analysis.scriptEnter) {
            sandbox.analysis.scriptEnter(iid, val);
        }
    }

    // Script exit
    function Sr(iid) {
        var tmp, aret, isBacktrack;
        if (sandbox.analysis && sandbox.analysis.scriptExit) {
            aret = sandbox.analysis.scriptExit(iid, exceptionVal);
            if (aret) {
                exceptionVal = aret.exceptionVal;
                isBacktrack = aret.isBacktrack;
            }
        }
        if (exceptionVal !== undefined) {
            tmp = exceptionVal;
            exceptionVal = undefined;
            throw tmp;
        }
        return isBacktrack;
    }


    // Modify and assign +=, -= ...
    function A(iid, base, offset, op) {
        var oprnd1 = G(iid, base, offset);
        return function (oprnd2) {
            var val = B(iid, op, oprnd1, oprnd2);
            return P(iid, base, offset, val);
        };
    }

    // Binary operation
    function B(iid, op, left, right) {
        var result, aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.binaryPre) {
            aret = sandbox.analysis.binaryPre(iid, op, left, right);
            if (aret) {
                op = aret.op;
                left = aret.left;
                right = aret.right;
                skip = aret.skip;
            }
        }


        if (!skip) {
            switch (op) {
                case "+":
                    result = left + right;
                    break;
                case "-":
                    result = left - right;
                    break;
                case "*":
                    result = left * right;
                    break;
                case "/":
                    result = left / right;
                    break;
                case "%":
                    result = left % right;
                    break;
                case "<<":
                    result = left << right;
                    break;
                case ">>":
                    result = left >> right;
                    break;
                case ">>>":
                    result = left >>> right;
                    break;
                case "<":
                    result = left < right;
                    break;
                case ">":
                    result = left > right;
                    break;
                case "<=":
                    result = left <= right;
                    break;
                case ">=":
                    result = left >= right;
                    break;
                case "==":
                    result = left == right;
                    break;
                case "!=":
                    result = left != right;
                    break;
                case "===":
                    result = left === right;
                    break;
                case "!==":
                    result = left !== right;
                    break;
                case "&":
                    result = left & right;
                    break;
                case "|":
                    result = left | right;
                    break;
                case "^":
                    result = left ^ right;
                    break;
                case "delete":
                    result = delete left[right];
                    break;
                case "instanceof":
                    result = left instanceof right;
                    break;
                case "in":
                    result = left in right;
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }
        }

        if (sandbox.analysis && sandbox.analysis.binary) {
            aret = sandbox.analysis.binary(iid, op, left, right, result);
            if (aret) {
                result = aret.result;
            }
        }
        return result;
    }


    // Unary operation
    function U(iid, op, left) {
        var result, aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.unaryPre) {
            aret = sandbox.analysis.unaryPre(iid, op, left);
            if (aret) {
                op = aret.op;
                left = aret.left;
                skip = aret.skip
            }
        }

        if (!skip) {
            switch (op) {
                case "+":
                    result = +left;
                    break;
                case "-":
                    result = -left;
                    break;
                case "~":
                    result = ~left;
                    break;
                case "!":
                    result = !left;
                    break;
                case "typeof":
                    result = typeof left;
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }
        }

        if (sandbox.analysis && sandbox.analysis.unary) {
            aret = sandbox.analysis.unary(iid, op, left, result);
            if (aret) {
                result = aret.result;
            }
        }
        return result;
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
        switchLeft = left;
        return left;
    }

    // case label inside switch
    function C2(iid, left) {
        var aret, result;

        result = B(iid, "===", switchLeft, left);

        if (sandbox.analysis && sandbox.analysis.conditional) {
            aret = sandbox.analysis.conditional(iid, result);
            if (aret) {
                if (result && !aret.result) {
                    left = !left;
                }
            }
        }
        return left;
    }

    // Expression in conditional
    function C(iid, left) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.conditional) {
            aret = sandbox.analysis.conditional(iid, left);
            if (aret) {
                left = aret.result;
            }
        }

        lastVal = left;
        return left;
    }

    function endExecution() {
        if (sandbox.analysis && sandbox.analysis.endExecution) {
            return sandbox.analysis.endExecution();
        }
    }


    //----------------------------------- End Jalangi Library backend ---------------------------------

    sandbox.U = U; // Unary operation
    sandbox.B = B; // Binary operation
    sandbox.C = C; // Condition
    sandbox.C1 = C1; // Switch key
    sandbox.C2 = C2; // case label C1 === C2
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
    sandbox.endExecution = endExecution;

    sandbox.getConcrete = function(v){return v;};
    // TODO why is this exposed here? --MS
    sandbox.callFunction = callFun;
    sandbox.EVAL_ORG = EVAL_ORG;
})(J$);

