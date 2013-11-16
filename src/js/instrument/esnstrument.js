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
    if (typeof esprima === 'undefined') {
        esprima = require("esprima");
        escodegen = require('escodegen');
    }

    var FILESUFFIX1 = "_jalangi_";
    var COVERAGE_FILE_NAME = "jalangi_coverage";
    var SMAP_FILE_NAME = "jalangi_sourcemap.js";
    var PREFIX1 = "J$";
    var RP = PREFIX1 + "_";

//    var N_LOG_LOAD = 0,
//    var N_LOG_FUN_CALL = 1,
//        N_LOG_METHOD_CALL = 2,
    var N_LOG_FUNCTION_ENTER = 4,
//        N_LOG_FUNCTION_RETURN = 5,
        N_LOG_SCRIPT_ENTER = 6,
//        N_LOG_SCRIPT_EXIT = 7,
        N_LOG_GETFIELD = 8,
//        N_LOG_GLOBAL = 9,
        N_LOG_ARRAY_LIT = 10,
        N_LOG_OBJECT_LIT = 11,
        N_LOG_FUNCTION_LIT = 12,
        N_LOG_RETURN = 13,
        N_LOG_REGEXP_LIT = 14,
//        N_LOG_LOCAL = 15,
//        N_LOG_OBJECT_NEW = 16,
        N_LOG_READ = 17,
//        N_LOG_FUNCTION_ENTER_NORMAL = 18,
        N_LOG_HASH = 19,
        N_LOG_SPECIAL = 20,
        N_LOG_STRING_LIT = 21,
        N_LOG_NUMBER_LIT = 22,
        N_LOG_BOOLEAN_LIT = 23,
        N_LOG_UNDEFINED_LIT = 24,
        N_LOG_NULL_LIT = 25;

    var logFunctionEnterFunName = PREFIX1 + ".Fe";
    var logFunctionReturnFunName = PREFIX1 + ".Fr";
    var logFunCallFunName = PREFIX1 + ".F";
    var logMethodCallFunName = PREFIX1 + ".M";
    var logAssignFunName = PREFIX1 + ".A";
    var logPutFieldFunName = PREFIX1 + ".P";
    var logGetFieldFunName = PREFIX1 + ".G";
    var logScriptEntryFunName = PREFIX1 + ".Se";
    var logScriptExitFunName = PREFIX1 + ".Sr";
    var logReadFunName = PREFIX1 + ".R";
    var logWriteFunName = PREFIX1 + ".W";
    var logIFunName = PREFIX1 + ".I";
    var logHashFunName = PREFIX1 + ".H";
    var logLitFunName = PREFIX1 + ".T";
    var logInitFunName = PREFIX1 + ".N";
    var logReturnFunName = PREFIX1 + ".Rt";
    var logReturnAggrFunName = PREFIX1 + ".Ra";

    var logBinaryOpFunName = PREFIX1 + ".B";
    var logUnaryOpFunName = PREFIX1 + ".U";
    var logConditionalFunName = PREFIX1 + ".C";
    var logSwitchLeftFunName = PREFIX1 + ".C1";
    var logSwitchRightFunName = PREFIX1 + ".C2";
    var logLastFunName = PREFIX1 + "._";

    var instrumentCodeFunName = PREFIX1 + ".instrumentCode";


    var Syntax = {
        AssignmentExpression:'AssignmentExpression',
        ArrayExpression:'ArrayExpression',
        BlockStatement:'BlockStatement',
        BinaryExpression:'BinaryExpression',
        BreakStatement:'BreakStatement',
        CallExpression:'CallExpression',
        CatchClause:'CatchClause',
        ConditionalExpression:'ConditionalExpression',
        ContinueStatement:'ContinueStatement',
        DoWhileStatement:'DoWhileStatement',
        DebuggerStatement:'DebuggerStatement',
        EmptyStatement:'EmptyStatement',
        ExpressionStatement:'ExpressionStatement',
        ForStatement:'ForStatement',
        ForInStatement:'ForInStatement',
        FunctionDeclaration:'FunctionDeclaration',
        FunctionExpression:'FunctionExpression',
        Identifier:'Identifier',
        IfStatement:'IfStatement',
        Literal:'Literal',
        LabeledStatement:'LabeledStatement',
        LogicalExpression:'LogicalExpression',
        MemberExpression:'MemberExpression',
        NewExpression:'NewExpression',
        ObjectExpression:'ObjectExpression',
        Program:'Program',
        Property:'Property',
        ReturnStatement:'ReturnStatement',
        SequenceExpression:'SequenceExpression',
        SwitchStatement:'SwitchStatement',
        SwitchCase:'SwitchCase',
        ThisExpression:'ThisExpression',
        ThrowStatement:'ThrowStatement',
        TryStatement:'TryStatement',
        UnaryExpression:'UnaryExpression',
        UpdateExpression:'UpdateExpression',
        VariableDeclaration:'VariableDeclaration',
        VariableDeclarator:'VariableDeclarator',
        WhileStatement:'WhileStatement',
        WithStatement:'WithStatement'
    };


    function sanitizePath(path) {
        if (typeof process !== 'undefined' && process.platform == "win32") {
            return path.split("\\").join("\\\\")
        }
        return path
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };


    function isArr(val) {
        return Object.prototype.toString.call(val) === '[object Array]';
    }

    function MAP(arr, fun) {
        var len = arr.length;
        if (!isArr(arr)) {
            throw new TypeError();
        }
        if (typeof fun != "function") {
            throw new TypeError();
        }

        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            if (i in arr) {
                res[i] = fun(arr[i]);
            }
        }
        return res;
    }

    function getCode(filename) {
        var fs = require('fs');
        return fs.readFileSync(filename, "utf8");
    }

    var CONTEXT = {
        RHS:1,
        IGNORE:2,
        OEXP:3,
        PARAMS:4,
        OEXP2:5,
        GETTER:6,
        SETTER:7
    };

    function ignoreSubAst(node) {
        return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' && node.callee.object.name === PREFIX1 &&
            node.callee.property.type === 'Identifier' && node.callee.property.name === 'I'
    }

    function transformAst(object, visitorPost, visitorPre, context, noIgnore) {
        var key, child, type, ret, newContext;

        type = object.type;
        if (visitorPre && HOP(visitorPre, type))
            visitorPre[type](object, context);

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null && key !== "scope" && (noIgnore || !ignoreSubAst(object))) {
                    if ((type === 'AssignmentExpression' && key === 'left') ||
                        (type === 'UpdateExpression' && key === 'argument') ||
                        (type === 'UnaryExpression' && key === 'argument' && object.operator === 'delete') ||
                        (type === 'ForInStatement' && key === 'left') ||
                        ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'id') ||
                        (type === 'LabeledStatement' && key === 'label') ||
                        (type === 'BreakStatement' && key === 'label') ||
                        (type === 'CatchClause' && key === 'param') ||
                        (type === 'ContinueStatement' && key === 'label') ||
                        ((type === 'CallExpression' || type === 'NewExpression') &&
                            key === 'callee' &&
                            (object.callee.type === 'MemberExpression' ||
                                (object.callee.type === 'Identifier' && object.callee.name === 'eval'))) ||
                        (type === 'VariableDeclarator' && key === 'id') ||
                        (type === 'MemberExpression' && !object.computed && key === 'property')) {
                        newContext = CONTEXT.IGNORE;
                    } else if (type === 'ObjectExpression' && key === 'properties') {
                        newContext = CONTEXT.OEXP;
                    } else if ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'params') {
                        newContext = CONTEXT.PARAMS;
                    } else if (context === CONTEXT.OEXP) {
                        newContext = CONTEXT.OEXP2;
                    } else if (context === CONTEXT.OEXP2 && key === 'key') {
                        newContext = CONTEXT.IGNORE;
                    } else if (context === CONTEXT.PARAMS) {
                        newContext = CONTEXT.IGNORE;
                    } else if (type === 'Property' && key === 'value' && object.kind === 'get') {
                        newContext = CONTEXT.GETTER;
                    } else if (type === 'Property' && key === 'value' && object.kind === 'set') {
                        newContext = CONTEXT.SETTER;
                    } else {
                        newContext = CONTEXT.RHS;
                    }
                    object[key] = transformAst(child, visitorPost, visitorPre, newContext, noIgnore);

                }
            }
        }

        if (visitorPost && HOP(visitorPost, type))
            ret = visitorPost[type](object, context);
        else
            ret = object;
        return ret;

    }

    var filename;

// J$_i in expression context will replace it by an AST
// {J$_i} will replace the body of the block statement with an array of statements passed as argument

    function replaceInStatement(code) {
        var asts = arguments;
        var visitorReplaceInExpr = {
            'Identifier':function (node) {
                if (node.name.indexOf(RP) === 0) {
                    var i = parseInt(node.name.substring(RP.length));
                    return asts[i];
                } else {
                    return node;
                }
            },
            'BlockStatement':function (node) {
                if (node.body[0].type === 'ExpressionStatement' && isArr(node.body[0].expression)) {
                    node.body = node.body[0].expression;
                }
                return node;
            }
        }
        var ast = esprima.parse(code);
        var newAst = transformAst(ast, visitorReplaceInExpr, undefined, undefined, true);
        //console.log(newAst);
        return newAst.body;
    }

    function replaceInExpr(code) {
        var ret = replaceInStatement.apply(this, arguments);
        return ret[0].expression;
    }

    function createLiteralAst(name) {
        return {type:Syntax.Literal, value:name};
    }

    function createIdentifierAst(name) {
        return {type:Syntax.Identifier, name:name};
    }

    function transferLoc(newNode, oldNode) {
        if (oldNode.loc)
            newNode.loc = oldNode.loc;
        if (oldNode.raw)
            newNode.raw = oldNode.loc;
    }

    var inc = 4;
    var condCount = 0 + inc;
    var iid = 1 + inc;
    var opIid = 2 + inc;

    function getIid() {
        var tmpIid = iid;
        iid = iid + inc;
        return createLiteralAst(tmpIid);
    }

    function getPrevIidNoInc() {
        return createLiteralAst(iid - inc);
    }

    function getCondIid() {
        var tmpIid = condCount;
        condCount = condCount + inc;
        return createLiteralAst(tmpIid);
    }

    function getOpIid() {
        var tmpIid = opIid;
        opIid = opIid + inc;
        return createLiteralAst(tmpIid);
    }


    function printLineInfoAux(i, ast) {
        if (ast && ast.loc) {
            writeLine('iids[' + i + '] = [filename,' + (ast.loc.start.line) + "," + (ast.loc.start.column + 1) + "];\n");
        }
//        else {
//            console.log(i+":undefined:undefined");
//        }
    }

    function printIidToLoc(ast0) {
        printLineInfoAux(iid, ast0);
    }

    function printOpIidToLoc(ast0) {
        printLineInfoAux(opIid, ast0);
    }

    function printCondIidToLoc(ast0) {
        printLineInfoAux(condCount, ast0);
    }

    var traceWfh;
    var fs;

    function openFile() {
        if (traceWfh === undefined) {
            fs = require('fs');
            traceWfh = fs.openSync(SMAP_FILE_NAME, 'w');
        }
    }

    function writeLine(str) {
        if (traceWfh) {
            fs.writeSync(traceWfh, str);
        }
    }


    function closeFile() {
        if (traceWfh) {
            fs.closeSync(traceWfh);
        }
    }


    function wrapPutField(node, base, offset, rvalue) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logPutFieldFunName +
                "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4)",
            getIid(),
            base,
            offset,
            rvalue
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapModAssign(node, base, offset, op, rvalue) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logAssignFunName + "(" + RP + "1," + RP + "2," + RP + "3," + RP + "4)(" + RP + "5)",
            getIid(),
            base,
            offset,
            createLiteralAst(op),
            rvalue
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapMethodCall(node, base, offset, isCtor) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logMethodCallFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + (isCtor ? "true" : "false") + ")",
            getIid(),
            base,
            offset
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapFunCall(node, ast, isCtor) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logFunCallFunName + "(" + RP + "1, " + RP + "2, " + (isCtor ? "true" : "false") + ")",
            getIid(),
            ast
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapGetField(node, base, offset) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logGetFieldFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
            getIid(),
            base,
            offset
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapRead(node, name, val, isReUseIid, isGlobal) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logReadFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + (isGlobal ? "true" : "false") + ")",
            isReUseIid ? getPrevIidNoInc() : getIid(),
            name,
            val
        );
        transferLoc(ret, node);
        return ret;
    }

//    function wrapReadWithUndefinedCheck(node, name) {
//        var ret = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
//        transferLoc(ret, node);
//        return ret;
//    }

    function wrapReadWithUndefinedCheck(node, name) {
        var ret = replaceInExpr(
            "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + name + "=" + RP + "2) : (" + name + "=" + RP + "3)))",
            createIdentifierAst(name),
            wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true),
            wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true)
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapWrite(node, name, val, lhs) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4)",
            getIid(),
            name,
            val,
            lhs
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapWriteWithUndefinedCheck(node, name, val, lhs) {
        printIidToLoc(node);
//        var ret2 = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
        var ret = replaceInExpr(
            logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + logIFunName + "(typeof(" + lhs.name + ")==='undefined'?undefined:" + lhs.name + "))",
            getIid(),
            name,
            val
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapRHSOfModStore(node, left, right, op) {
        var ret = replaceInExpr(RP + "1 " + op + " " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function wrapLHSOfModStore(node, left, right) {
        var ret = replaceInExpr(RP + "1 = " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function wrapLiteral(node, ast, funId) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logLitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
            getIid(),
            ast,
            createLiteralAst(funId)
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapReturn(node, expr) {
        var lid = (expr === null) ? node : expr;
        printIidToLoc(lid);
        if (expr === null) {
            expr = createIdentifierAst("undefined");
        }
        var ret = replaceInExpr(
            logReturnFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            expr
        );
        transferLoc(ret, lid);
        return ret;
    }

    function wrapHash(node, ast) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logHashFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            ast
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapEvalArg(ast) {
        var ret = replaceInExpr(
            instrumentCodeFunName + "(" + PREFIX1 + ".getConcrete(" + RP + "1), true)",
            ast
        );
        transferLoc(ret, ast);
        return ret;
    }

    function wrapUnaryOp(node, argument, operator) {
        printOpIidToLoc(node);
        var ret = replaceInExpr(
            logUnaryOpFunName + "(" + RP + "1," + RP + "2," + RP + "3)",
            getOpIid(),
            createLiteralAst(operator),
            argument
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapBinaryOp(node, left, right, operator) {
        printOpIidToLoc(node);
        var ret = replaceInExpr(
            logBinaryOpFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4)",
            getOpIid(),
            createLiteralAst(operator),
            left,
            right
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapLogicalAnd(node, left, right) {
        printCondIidToLoc(node);
        var ret = replaceInExpr(
            logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + RP + "3:" + logLastFunName + "()",
            getCondIid(),
            left,
            right
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapLogicalOr(node, left, right) {
        printCondIidToLoc(node);
        var ret = replaceInExpr(
            logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + logLastFunName + "():" + RP + "3",
            getCondIid(),
            left,
            right
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapSwitchDiscriminant(node, discriminant) {
        printCondIidToLoc(node);
        var ret = replaceInExpr(
            logSwitchLeftFunName + "(" + RP + "1, " + RP + "2)",
            getCondIid(),
            discriminant
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapSwitchTest(node, test) {
        printCondIidToLoc(node);
        var ret = replaceInExpr(
            logSwitchRightFunName + "(" + RP + "1, " + RP + "2)",
            getCondIid(),
            test
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapConditional(node, test) {
        if (node === null) {
            return node;
        } // to handle for(;;) ;

        printCondIidToLoc(node);
        var ret = replaceInExpr(
            logConditionalFunName + "(" + RP + "1, " + RP + "2)",
            getCondIid(),
            test
        );
        transferLoc(ret, node);
        return ret;
    }

    function createCallWriteAsStatement(node, name, val) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
            getIid(),
            name,
            val
        );
        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallInitAsStatement(node, name, val, isArgumentSync) {
        printIidToLoc(node);
        var ret;

        if (isArgumentSync)
            ret = replaceInStatement(
                RP + "1 = " + logInitFunName + "(" + RP + "2, " + RP + "3, " + RP + "4, " + isArgumentSync + ")",
                val,
                getIid(),
                name,
                val
            );
        else
            ret = replaceInStatement(
                logInitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + isArgumentSync + ")",
                getIid(),
                name,
                val
            );

        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallAsFunEnterStatement(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            logFunctionEnterFunName + "(" + RP + "1,arguments.callee, this)",
            getIid()
        );
        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallAsScriptEnterStatement(node, instrumentedFileName) {
        printIidToLoc(node);
        var ret = replaceInStatement(logScriptEntryFunName + "(" + RP + "1," + RP + "2)",
            getIid(),
            createLiteralAst(instrumentedFileName));
        transferLoc(ret[0].expression, node);
        return ret;
    }

    var labelCounter = 0;

    function wrapScriptBodyWithTryCatch(node, body) {
        printIidToLoc(node);
        var l = labelCounter++;
        var ret = replaceInStatement(
            "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + PREFIX1 +
                "e) { console.log(" + PREFIX1 + "e); console.log(" +
                PREFIX1 + "e.stack); throw " + PREFIX1 +
                "e; } finally { if (" + logScriptExitFunName + "(" +
                RP + "2)) continue jalangiLabel" + l + ";\n else \n  break jalangiLabel" + l + ";\n }\n }}", body,
            getIid()
        );
        //console.log(JSON.stringify(ret));

        ret = ret[0].body.body;
        transferLoc(ret[0], node);
        return ret;
    }

    function wrapFunBodyWithTryCatch(node, body) {
        printIidToLoc(node);
        var l = labelCounter++;
        var ret = replaceInStatement(
            "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + PREFIX1 +
                "e) { console.log(" + PREFIX1 + "e); console.log(" +
                PREFIX1 + "e.stack); throw " + PREFIX1 +
                "e; } finally { if (" + logFunctionReturnFunName + "(" +
                RP + "2)) continue jalangiLabel" + l + ";\n else \n  return " + logReturnAggrFunName + "();\n }\n }}", body,
            getIid()
        );
        //console.log(JSON.stringify(ret));

        ret = ret[0].body.body;
        transferLoc(ret[0], node);
        return ret;
    }

//    function wrapScriptBodyWithTryCatch(node, body) {
//        printIidToLoc(node);
//        var ret = replaceInStatement("try {"+RP+"1} catch("+PREFIX1+
//                "e) { console.log("+PREFIX1+"e); console.log("+
//                PREFIX1+"e.stack); throw "+PREFIX1+
//                "e; } finally { "+logScriptExitFunName+"("+
//                RP+"2); }",
//            body,
//            getIid()
//        );
//        transferLoc(ret[0], node);
//        return ret;
//    }

    function prependScriptBody(node, body) {
        var path = require('path');
        var preFile = path.resolve(__dirname, '../analysis.js');
        var inputManagerFile = path.resolve(__dirname, '../InputManager.js');
        var thisFile = path.resolve(__filename);
//        var inputFile = path.resolve(process.cwd()+"/inputs.js");

        var n_code = 'if (typeof window ==="undefined") {\n' +
            '    require("' + sanitizePath(preFile) + '");\n' +
            '    require("' + sanitizePath(inputManagerFile) + '");\n' +
            '    require("' + sanitizePath(thisFile) + '");\n' +
            '    require(process.cwd()+"/inputs.js");\n' +
            '}\n';
        var ret = replaceInStatement(n_code +
            "\n{" + RP + "1}\n",
            body
        );
        transferLoc(ret[0], node);
        return ret;
    }

    function instrumentFunctionEntryExit(node, ast) {
        var body = createCallAsFunEnterStatement(node).
            concat(syncDefuns(node, scope, false)).concat(ast);
        return body;
    }

//    function instrumentFunctionEntryExit(node, ast) {
//        return wrapFunBodyWithTryCatch(node, ast);
//    }

    function instrumentScriptEntryExit(node, body0) {
        var modFile = (typeof filename === "string") ?
            filename.replace(".js", FILESUFFIX1 + ".js") :
            "internal";
        var body = createCallAsScriptEnterStatement(node, modFile).
            concat(syncDefuns(node, scope, true)).
            concat(body0);
        return body;
    }


    function syncDefuns(node, scope, isScript) {
        var ret = [];
        if (!isScript) {
            ret = ret.concat(createCallInitAsStatement(node,
                createLiteralAst("arguments"),
                createIdentifierAst("arguments"),
                true));
        }
        if (scope) {
            for (var name in scope.vars) {
                if (HOP(scope.vars, name)) {
                    if (scope.vars[name] === "defun") {
                        var ident = createIdentifierAst(name);
                        ident.loc = scope.funLocs[name];
                        ret = ret.concat(createCallInitAsStatement(node,
                            createLiteralAst(name),
                            wrapLiteral(ident, ident, N_LOG_FUNCTION_LIT),
                            false));
                    }
                    if (scope.vars[name] === "arg") {
                        ret = ret.concat(createCallInitAsStatement(node,
                            createLiteralAst(name),
                            createIdentifierAst(name),
                            true));
                    }
                    if (scope.vars[name] === "var") {
                        ret = ret.concat(createCallInitAsStatement(node,
                            createLiteralAst(name),
                            createIdentifierAst(name),
                            false));
                    }
                }
            }
        }
        return ret;
    }

    function getPropertyAsAst(ast) {
        return ast.computed ? ast.property : createLiteralAst(ast.property.name);
    }

    function instrumentCall(ast, isCtor) {
        var ret;
        if (ast.type === 'MemberExpression') {
            ret = wrapMethodCall(ast, ast.object,
                getPropertyAsAst(ast),
                isCtor);
            return ret;
        } else if (ast.type === 'Identifier' && ast.name === "eval") {
            return ast;
        } else {
            ret = wrapFunCall(ast, ast, isCtor);
            return ret;
        }
    }

    function instrumentStore(node) {
        var ret;
        if (node.left.type === 'Identifier') {
            if (scope.hasVar(node.left.name)) {
                ret = wrapWrite(node.right, createLiteralAst(node.left.name), node.right, node.left);
            } else {
                ret = wrapWriteWithUndefinedCheck(node.right, createLiteralAst(node.left.name), node.right, node.left);

            }
            node.right = ret;
            return node;
        } else {
            ret = wrapPutField(node, node.left.object, getPropertyAsAst(node.left), node.right);
            return ret;
        }
    }

    function instrumentLoadModStore(node) {
        if (node.left.type === 'Identifier') {
            var ret = instrumentLoad(node.left);
            var tmp1 = wrapRHSOfModStore(node.right, ret, node.right, node.operator.substring(0, node.operator.length - 1));

            var tmp2;
            if (scope.hasVar(node.left.name)) {
                tmp2 = wrapWrite(node.right, createLiteralAst(node.left.name), tmp1, node.left);
            } else {
                tmp2 = wrapWriteWithUndefinedCheck(node.right, createLiteralAst(node.left.name), tmp1, node.left);

            }
            tmp2 = wrapLHSOfModStore(node, node.left, tmp2);
            return tmp2;
        } else {
            var ret = wrapModAssign(node, node.left.object,
                getPropertyAsAst(node.left),
                node.operator.substring(0, node.operator.length - 1),
                node.right);
            return ret;
        }
    }

    function instrumentPreIncDec(node) {
        var right = createLiteralAst(1);
        var ret = wrapRHSOfModStore(node, node.argument, right, node.operator.substring(0, 1) + "=");
        return instrumentLoadModStore(ret);
    }

    function adjustIncDec(op, ast) {
        if (op === '++') {
            op = '-';
        } else {
            op = '+';
        }
        var right = createLiteralAst(1);
        var ret = wrapRHSOfModStore(ast, ast, right, op);
        return ret;
    }

    function instrumentLoad(ast) {
        var ret;
        if (ast.type === 'Identifier') {
            if (ast.name === "undefined") {
                ret = wrapLiteral(ast, ast, N_LOG_UNDEFINED_LIT);
                return ret;
            } else if (ast.name === "NaN" || ast.name === "Infinity") {
                ret = wrapLiteral(ast, ast, N_LOG_NUMBER_LIT);
                return ret;
            }
            if (ast.name === PREFIX1 ||
                ast.name === "eval") {
                return ast;
            } else if (scope.hasVar(ast.name)) {
                ret = wrapRead(ast, createLiteralAst(ast.name), ast);
                return ret;
            } else {
                ret = wrapReadWithUndefinedCheck(ast, ast.name);
                return ret;
            }
        } else if (ast.type === 'MemberExpression') {
            return wrapGetField(ast, ast.object, getPropertyAsAst(ast));
        } else {
            return ast;
        }
    }


    var tryCatch = false;

    var scope;

    function setScope(node) {
        scope = node.scope;
    }

    var visitorRRPre = {
        'Program':setScope,
        'FunctionDeclaration':setScope,
        'FunctionExpression':setScope
    }

    var visitorRRPost = {
        'Literal':function (node, context) {
            if (context === CONTEXT.RHS) {

                var litType;
                switch (typeof node.value) {
                    case 'number':
                        litType = N_LOG_NUMBER_LIT;
                        break;
                    case 'string':
                        litType = N_LOG_STRING_LIT;
                        break;
                    case 'object': // for null
                        if (node.value === null)
                            litType = N_LOG_NULL_LIT;
                        else
                            litType = N_LOG_REGEXP_LIT;
                        break;
                    case 'boolean':
                        litType = N_LOG_BOOLEAN_LIT;
                        break;
                }
                var ret1 = wrapLiteral(node, node, litType);
                return ret1;
            } else {
                return node;
            }
        },
        "Program":function (node) {
            if (!tryCatch) {
                var ret = instrumentScriptEntryExit(node, node.body);
                node.body = ret;

            }
            scope = scope.parent;
            return node;
        },
        "VariableDeclaration":function (node) {
            var declarations = MAP(node.declarations, function (def) {
                if (def.init !== null) {
                    var init = wrapWrite(def.init, createLiteralAst(def.id.name), def.init, def.id);
                    def.init = init;
                }
                return def;
            });
            node.declarations = declarations;
            return node;
        },
        "NewExpression":function (node) {
            var ret = {
                type:'CallExpression',
                callee:instrumentCall(node.callee, true),
                'arguments':node.arguments
            };
            transferLoc(ret, node);
            var ret1 = wrapLiteral(node, ret, N_LOG_OBJECT_LIT);
            return ret1;
        },
        "CallExpression":function (node) {
            var isEval = node.callee.type === 'Identifier' && node.callee.name === "eval";
            var callee = instrumentCall(node.callee, false);
            node.callee = callee;
            if (isEval) {
                node.arguments = MAP(node.arguments, wrapEvalArg);
            }
            return node;
        },
        "AssignmentExpression":function (node) {
            var ret1;
            if (node.operator === "=") {
                ret1 = instrumentStore(node);
            } else {
                ret1 = instrumentLoadModStore(node);
            }
            return ret1;
        },
        "UpdateExpression":function (node) {
            var ret1;
            ret1 = instrumentPreIncDec(node);
            if (!node.prefix) {
                ret1 = adjustIncDec(node.operator, ret1);
            }
            return ret1;
        },
        "FunctionExpression":function (node, context) {
            node.body.body = instrumentFunctionEntryExit(node, node.body.body);
            var ret1;
            if (context === CONTEXT.GETTER || context === CONTEXT.SETTER) {
                ret1 = node;
            } else {
                ret1 = wrapLiteral(node, node, N_LOG_FUNCTION_LIT);
            }
            scope = scope.parent;
            return ret1;
        },
        "FunctionDeclaration":function (node) {
            //console.log(node.body.body);
            node.body.body = instrumentFunctionEntryExit(node, node.body.body);
            scope = scope.parent;
            return node;
        },
        "ObjectExpression":function (node) {
            var ret1 = wrapLiteral(node, node, N_LOG_OBJECT_LIT);
            return ret1;
        },
        "ArrayExpression":function (node) {
            var ret1 = wrapLiteral(node, node, N_LOG_ARRAY_LIT);
            return ret1;
        },
        'ThisExpression':function (node) {
            var ret = wrapRead(node, createLiteralAst('this'), node);
            return ret;
        },
        'Identifier':function (node, context) {
            if (context === CONTEXT.RHS) {
                var ret = instrumentLoad(node);
                return ret;
            } else {
                return node;
            }
        },
        'MemberExpression':function (node, context) {
            if (context === CONTEXT.RHS) {
                var ret = instrumentLoad(node);
                return ret;
            } else {
                return node;
            }
        },
        "ForInStatement":function (node) {
            var ret = wrapHash(node.right, node.right);
            node.right = ret;
            return node;
        },
        "ReturnStatement":function (node) {
            var ret = wrapReturn(node, node.argument);
            node.argument = ret;
            return node;
        }
    }

    function funCond(node) {
        var ret = wrapConditional(node.test, node.test);
        node.test = ret;
        return node;
    }


    var visitorOps = {
        "Program":function (node) {
            var body = wrapScriptBodyWithTryCatch(node, node.body)
            if (!tryCatch) {
                var ret = prependScriptBody(node, body);
                node.body = ret;

            }
            return node;
        },
        'BinaryExpression':function (node) {
            var ret = wrapBinaryOp(node, node.left, node.right, node.operator);
            return ret;
        },
        'LogicalExpression':function (node) {
            var ret;
            if (node.operator === "&&") {
                ret = wrapLogicalAnd(node, node.left, node.right);
            } else if (node.operator === "||") {
                ret = wrapLogicalOr(node, node.left, node.right);
            }
            return ret;
        },
        'UnaryExpression':function (node) {
            var ret;
            if (node.operator === "delete" || node.operator === "void") {
                return node;
            } else {
                ret = wrapUnaryOp(node, node.argument, node.operator);
            }
            return ret;
        },
        "SwitchStatement":function (node) {
            var dis = wrapSwitchDiscriminant(node.discriminant, node.discriminant);
            var cases = MAP(node.cases, function (acase) {
                var test;
                if (acase.test) {
                    test = wrapSwitchTest(acase.test, acase.test);
                    acase.test = test;
                }
                return acase;
            });
            node.discriminant = dis;
            node.cases = cases;
            return node;
        },
        "FunctionExpression":function (node) {
            node.body.body = wrapFunBodyWithTryCatch(node, node.body.body);
            return node;
        },
        "FunctionDeclaration":function (node) {
            node.body.body = wrapFunBodyWithTryCatch(node, node.body.body);
            return node;
        },
        "ConditionalExpression":funCond,
        "IfStatement":funCond,
        "WhileStatement":funCond,
        "DoWhileStatement":funCond,
        "ForStatement":funCond
    };

    function addScopes(ast) {

        function Scope(parent) {
            this.vars = {};
            this.funLocs = {};
            this.hasEval = false;
            this.hasArguments = false;
            this.parent = parent;
        }

        Scope.prototype.addVar = function (name, type, loc) {
            this.vars[name] = type;
            if (type === 'defun') {
                this.funLocs[name] = loc;
            }
        };

        Scope.prototype.hasVar = function (name) {
            var s = this;
            while (s !== null) {
                if (HOP(s.vars, name))
                    return s.vars[name];
                s = s.parent;
            }
            return null;
        };

        Scope.prototype.addEval = function () {
            var s = this;
            while (s !== null) {
                s.hasEval = true;
                s = s.parent;
            }
        };

        Scope.prototype.addArguments = function () {
            var s = this;
            while (s !== null) {
                s.hasArguments = true;
                s = s.parent;
            }
        };

        Scope.prototype.usesEval = function () {
            return this.hasEval;
        };

        Scope.prototype.usesArguments = function () {
            return this.hasArguments;
        };


        var currentScope = null;

        function handleFun(node) {
            var oldScope = currentScope;
            currentScope = new Scope(currentScope);
            node.scope = currentScope;
            if (node.type === 'FunctionDeclaration') {
                oldScope.addVar(node.id.name, "defun", node.loc);
                MAP(node.params, function (param) {
                    currentScope.addVar(param.name, "arg");
                })
            } else if (node.type === 'FunctionExpression') {
                if (node.id !== null) {
                    currentScope.addVar(node.id.name, "lambda");
                }
                MAP(node.params, function (param) {
                    currentScope.addVar(param.name, "arg");
                })
            }
        }

        function handleVar(node) {
            currentScope.addVar(node.id.name, "var");
        }

        function handleCatch(node) {
            currentScope.addVar(node.param.name, "catch");
        }

        function popScope(node) {
            currentScope = currentScope.parent;
            return node;
        }

        var visitorPre = {
            'Program':handleFun,
            'FunctionDeclaration':handleFun,
            'FunctionExpression':handleFun,
            'VariableDeclarator':handleVar,
            'CatchClause':handleCatch
        }

        var visitorPost = {
            'Program':popScope,
            'FunctionDeclaration':popScope,
            'FunctionExpression':popScope
        }

        transformAst(ast, visitorPost, visitorPre);
    }

    function serialize(root) {
        var parentFunOrScript = root;
        var parentReplacement;
        var iidToAstTable = {};

        function handleFun(node) {
            parentFunOrScript = node;
            parentReplacement = {type:"SymbolicReference", value:null};
            return parentReplacement;
        }

        var visitorPre = {
            'Program':handleFun,
            'FunctionDeclaration':handleFun,
            'FunctionExpression':handleFun
        }

        var visitorPost = {
            'CallExpression':function (node) {
                try {
                    if (node.callee.object && node.callee.object.name === 'J$' && (node.callee.property.name === 'Se' || node.callee.property.name === 'Fe')) {
                        iidToAstTable[node.arguments[0].value] = parentFunOrScript;
                        parentReplacement.value = node.arguments[0].value;
                        return node;
                    } else if (node.callee.object && node.callee.object.name === 'J$' && node.arguments[0]) {
                        iidToAstTable[node.arguments[0].value] = node;
                        return {type:"SymbolicReference", value:node.arguments[0].value};
                    }
                    return node;
                } catch (e) {
                    console.log(JSON.stringify(node));
                    throw e;
                }
            }
        }

        transformAst(root, visitorPost, visitorPre);
        return iidToAstTable;
    }


    function transformString(code, visitorsPost, visitorsPre) {
//        console.time("parse")
        var newAst = esprima.parse(code, {loc:true, range:true});
//        console.timeEnd("parse")
//        console.time("transform")
        addScopes(newAst);
        var len = visitorsPost.length;
        for (var i = 0; i < len; i++) {
            newAst = transformAst(newAst, visitorsPost[i], visitorsPre[i], CONTEXT.RHS);
        }
//        console.timeEnd("transform")
        return newAst;
    }

    var noInstr = "// JALANGI DO NOT INSTRUMENT";

    function instrumentCode(code, noTryCatchAtTop) {
        var oldCondCount;

        if (typeof  code === "string" && !(code.indexOf(noInstr) >= 0)) {
            if (noTryCatchAtTop) {
                oldCondCount = condCount;
                condCount = 3;
            }
            tryCatch = noTryCatchAtTop;
            var newAst = transformString(code, [visitorRRPost, visitorOps], [visitorRRPre, undefined]);
            var newCode = escodegen.generate(newAst);

            if (noTryCatchAtTop) {
                condCount = oldCondCount;
            }
            var ret = newCode + "\n" + noInstr + "\n";
            return ret;
        } else {
            return code;
        }
    }

    function instrumentFile() {
        var args = process.argv, i;
        var fs = require('fs');
        var path = require('path');

        function regex_escape(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }

        var saveCode = function (code, filename, fileOnly, serializedAst) {
//            var preFile = path.resolve(__dirname,'analysis.js');
//            var inputManagerFile = path.resolve(__dirname,'InputManager.js');
//            var thisFile = path.resolve(__filename);
//            var inputFile = path.resolve(process.cwd()+"/inputs.js");

//            var n_code = 'if (typeof window ==="undefined") {\n' +
//                '    require("'+preFile+'");\n' +
//                '    require("'+inputManagerFile+'");\n' +
//                '    require("'+thisFile+'");\n' +
//                '    require("'+inputFile+'");\n' +
//                '}\n'+
            var n_code = code + "\n" + noInstr + "\n";
            n_code += '\n//@ sourceMappingURL=' + fileOnly + '.map';
            fs.writeFileSync(filename, n_code, "utf8");
            fs.writeFileSync(COVERAGE_FILE_NAME, JSON.stringify({"covered":0, "branches":condCount / inc * 2, "coverage":[]}), "utf8");
            fs.writeFileSync(filename + ".ast.json", JSON.stringify(serializedAst, undefined, 2), "utf8");
        }


        openFile();
        writeLine("(function (sandbox) { var iids = sandbox.iids = []; var filename;\n")
        for (i = 2; i < args.length; i++) {
            filename = args[i];
            writeLine("filename = \"" + sanitizePath(require('path').resolve(process.cwd(), filename)) + "\";\n");
            console.log("Instrumenting " + filename + " ...");
//            console.time("load")
            var code = getCode(filename);
//            console.timeEnd("load")
            tryCatch = false;
            var newAst = transformString(code, [visitorRRPost, visitorOps], [visitorRRPre, undefined]);
            //console.log(JSON.stringify(newAst, null, '\t'));

            var newFileName = filename.replace(".js", FILESUFFIX1 + ".js");
            var fileOnly = path.basename(filename);
            var newFileOnly = path.basename(newFileName);
            //var smap = escodegen.generate(newAst, {sourceMap: fileOnly});
            //smap = smap.replace(fileOnly, newFileOnly);
            //fs.writeFileSync(newFileName+".map", smap,"utf8");

//            console.time("generate")
            var n_code = escodegen.generate(newAst);
            var serializedAst = serialize(newAst);
            saveCode(n_code, newFileName, newFileOnly, serializedAst);
        }
        writeLine("}(typeof " + PREFIX1 + " === 'undefined'? " + PREFIX1 + " = {}:" + PREFIX1 + "));\n")
        closeFile();
    }


    if (typeof window === 'undefined' && (typeof require !== "undefined") && require.main === module) {
        instrumentFile();
        //console.log(instrumentCode('({"f1":"hello", "f2":"world"})', true));
    } else {
        sandbox.instrumentCode = instrumentCode;
        sandbox.instrumentFile = instrumentFile;
    }
}((typeof J$ === 'undefined') ? undefined : J$));


//console.log(transformString("var x = 3 * 4;", visitor1));
//console.log(transformFile("tests/unit/instrument-test.js", [visitorRRPost, visitorOps], [visitorRRPre, undefined]));

