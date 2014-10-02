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

/*jslint node: true browser: true */
/*global astUtil acorn escodegen J$ */

//var StatCollector = require('../utils/StatCollector');

var acorn, escodegen, astUtil;
(function (sandbox) {
    if (typeof acorn === 'undefined') {
        acorn = require("acorn");
        escodegen = require('escodegen');
        astUtil = require("./../utils/astUtil");
        require("../Config");
    }

    var Config = sandbox.Config;
    var FILESUFFIX1 = "_jalangi_";
    var COVERAGE_FILE_NAME = "jalangi_coverage.json";
    var SMAP_FILE_NAME = "jalangi_sourcemap.js";
    var INITIAL_IID_FILE_NAME = "jalangi_initialIID.json";
    var RP = astUtil.JALANGI_VAR + "_";

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

    var logFunctionEnterFunName = astUtil.JALANGI_VAR + ".Fe";
    var logFunctionReturnFunName = astUtil.JALANGI_VAR + ".Fr";
    var logFunCallFunName = astUtil.JALANGI_VAR + ".F";
    var logMethodCallFunName = astUtil.JALANGI_VAR + ".M";
    var logAssignFunName = astUtil.JALANGI_VAR + ".A";
    var logPutFieldFunName = astUtil.JALANGI_VAR + ".P";
    var logGetFieldFunName = astUtil.JALANGI_VAR + ".G";
    var logScriptEntryFunName = astUtil.JALANGI_VAR + ".Se";
    var logScriptExitFunName = astUtil.JALANGI_VAR + ".Sr";
    var logReadFunName = astUtil.JALANGI_VAR + ".R";
    var logWriteFunName = astUtil.JALANGI_VAR + ".W";
    var logIFunName = astUtil.JALANGI_VAR + ".I";
    var logHashFunName = astUtil.JALANGI_VAR + ".H";
    var logLitFunName = astUtil.JALANGI_VAR + ".T";
    var logInitFunName = astUtil.JALANGI_VAR + ".N";
    var logReturnFunName = astUtil.JALANGI_VAR + ".Rt";
    var logReturnAggrFunName = astUtil.JALANGI_VAR + ".Ra";
    var logUncaughtExceptionFunName = astUtil.JALANGI_VAR + ".Ex";

    var logBinaryOpFunName = astUtil.JALANGI_VAR + ".B";
    var logUnaryOpFunName = astUtil.JALANGI_VAR + ".U";
    var logConditionalFunName = astUtil.JALANGI_VAR + ".C";
    var logSwitchLeftFunName = astUtil.JALANGI_VAR + ".C1";
    var logSwitchRightFunName = astUtil.JALANGI_VAR + ".C2";
    var logLastFunName = astUtil.JALANGI_VAR + "._";

    var instrumentCodeFunName = astUtil.JALANGI_VAR + ".instrumentCode";


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
        if (typeof process !== 'undefined' && process.platform === "win32") {
            return path.split("\\").join("\\\\");
        }
        return path;
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    function isArr(val) {
        return Object.prototype.toString.call(val) === '[object Array]';
    }

    function MAP(arr, fun) {
        var len = arr.length;
        if (!isArr(arr)) {
            throw new TypeError();
        }
        if (typeof fun !== "function") {
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

    function regex_escape(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    function saveCode(code, isAppend, noInstrEval) {
        var fs = require('fs');
        var path = require('path');
        var n_code = astUtil.JALANGI_VAR + ".noInstrEval = " + noInstrEval + ";\n" + code + "\n";
        if (isAppend) {
            fs.appendFileSync(instCodeFileName, n_code, "utf8");
        } else {
            fs.writeFileSync(instCodeFileName, n_code, "utf8");

        }
    }


    // name of the file containing the instrumented code
    var instCodeFileName;

    var IID_INC_STEP = 8;
    // current static identifier for each conditional expression
    var condCount;
    var iid;
    var opIid;
    var hasInitializedIIDs = false;

    function initializeIIDCounters(forEval) {
        if (!hasInitializedIIDs) {
            var adj = forEval ? IID_INC_STEP / 2 : 0;
            condCount = IID_INC_STEP + adj + 0;
            iid = IID_INC_STEP + adj + 1;
            opIid = IID_INC_STEP + adj + 2;
            hasInitializedIIDs = true;
        }
    }

    function loadInitialIID(outputDir, initIIDs) {
        var path = require('path');
        var fs = require('fs');
        var iidf = path.join(outputDir ? outputDir : process.cwd(), INITIAL_IID_FILE_NAME);

        if (initIIDs) {
            hasInitializedIIDs = false;
            initializeIIDCounters(false);
        } else {
            try {
                var line;
                var iids = JSON.parse(line = fs.readFileSync(iidf, "utf8"));
                condCount = iids.condCount;
                iid = iids.iid;
                opIid = iids.opIid;
                hasInitializedIIDs = true;
            } catch (e) {
                initializeIIDCounters(false);
            }
        }
    }


    function storeInitialIID(outputDir) {
        var path = require('path');
        var fs = require('fs');
        var line;
        var iidf = path.join(outputDir ? outputDir : process.cwd(), INITIAL_IID_FILE_NAME);
        fs.writeFileSync(iidf, line = JSON.stringify({condCount:condCount, iid:iid, opIid:opIid}));
    }

    function getIid() {
        var tmpIid = iid;
        iid = iid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    function getPrevIidNoInc() {
        return createLiteralAst(iid - IID_INC_STEP);
    }

    function getCondIid() {
        var tmpIid = condCount;
        condCount = condCount + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    function getOpIid() {
        var tmpIid = opIid;
        opIid = opIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    // TODO reset this state in openIIDMapFile or its equivalent?
    var curFileName = null;
    var orig2Inst = {};
    var iidSourceInfo = {};

    function writeLineToIIDMap(fs, traceWfh, fh, str) {
        if (fh) {
            fs.writeSync(fh, str);
        }
        fs.writeSync(traceWfh, str);
    }

    /**
     * if not yet open, open the IID map file and write the header.
     * @param {string} outputDir an optional output directory for the sourcemap file
     */

    function writeIIDMapFile(outputDir, initIIDs, isAppend) {
        var traceWfh, fs = require('fs'), path = require('path');
        var smapFile = path.join(outputDir, SMAP_FILE_NAME);
        if (initIIDs) {
            traceWfh = fs.openSync(smapFile, 'w');
        } else {
            traceWfh = fs.openSync(smapFile, 'a');
        }

        var fh = null;
        if (isAppend) {
            fh = fs.openSync(instCodeFileName, 'w');
        }

        writeLineToIIDMap(fs, traceWfh, fh, "(function (sandbox) {\n if (!sandbox.iids) {sandbox.iids = []; sandbox.orig2Inst = {}; }\n");
        writeLineToIIDMap(fs, traceWfh, fh, "var iids = sandbox.iids; var orig2Inst = sandbox.orig2Inst;\n");
        writeLineToIIDMap(fs, traceWfh, fh, "var fn = \"" + curFileName + "\";\n");
        // write all the data
        Object.keys(iidSourceInfo).forEach(function (iid) {
            var sourceInfo = iidSourceInfo[iid];
            writeLineToIIDMap(fs, traceWfh, fh, "iids[" + iid + "] = [fn," + sourceInfo[1] + "," + sourceInfo[2] + "," + sourceInfo[3] + "," + sourceInfo[4] + "];\n");
        });
        Object.keys(orig2Inst).forEach(function (filename) {
            writeLineToIIDMap(fs, traceWfh, fh, "orig2Inst[\"" + filename + "\"] = \"" + orig2Inst[filename] + "\";\n");
        });
        writeLineToIIDMap(fs, traceWfh, fh, "}(typeof " + astUtil.JALANGI_VAR + " === 'undefined'? " + astUtil.JALANGI_VAR + " = {}:" + astUtil.JALANGI_VAR + "));\n");
        fs.closeSync(traceWfh);
        if (isAppend) {
            fs.closeSync(fh);
        }
        // also write output as JSON, to make consumption easier
        var jsonFile = smapFile.replace(/.js$/, '.json');
        var outputObj = [iidSourceInfo, orig2Inst];
        if (!initIIDs && fs.existsSync(jsonFile)) {
            var oldInfo = JSON.parse(fs.readFileSync(jsonFile));
            var oldIIDInfo = oldInfo[0];
            var oldOrig2Inst = oldInfo[1];
            Object.keys(iidSourceInfo).forEach(function (iid) {
                oldIIDInfo[iid] = iidSourceInfo[iid];
            })
            Object.keys(orig2Inst).forEach(function (filename) {
                oldOrig2Inst[filename] = orig2Inst[filename];
            });
            outputObj = [oldIIDInfo, oldOrig2Inst];
        }
        fs.writeFileSync(jsonFile, JSON.stringify(outputObj));
        fs.writeFileSync(path.join(outputDir, COVERAGE_FILE_NAME), JSON.stringify({"covered":0, "branches":condCount / IID_INC_STEP * 2, "coverage":[]}), "utf8");
    }


    function printLineInfoAux(i, ast) {
        if (ast && ast.loc) {
            iidSourceInfo[i] = [curFileName, ast.loc.start.line, ast.loc.start.column + 1, ast.loc.end.line, ast.loc.end.column + 1];
            //writeLineToIIDMap('iids[' + i + '] = [filename,' + (ast.loc.start.line) + "," + (ast.loc.start.column + 1) + "];\n");
        }
//        else {
//            console.log(i+":undefined:undefined");
//        }
    }

    // iid+2 is usually unallocated
    // we are using iid+2 for the sub-getField operation of a method call
    // see analysis.M
    function printSpecialIidToLoc(ast0) {
        printLineInfoAux(iid + 2, ast0);
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
        };
//        StatCollector.resumeTimer("internalParse");
        var ast = acorn.parse(code);
//        StatCollector.suspendTimer("internalParse");
//        StatCollector.resumeTimer("replace");
        var newAst = astUtil.transformAst(ast, visitorReplaceInExpr, undefined, undefined, true);
        //console.log(newAst);
//        StatCollector.suspendTimer("replace");
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

    function wrapPutField(node, base, offset, rvalue) {
        if (!Config.INSTR_PUTFIELD || Config.INSTR_PUTFIELD(node.computed ? null : offset.value, node)) {
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
        } else {
            return node;
        }
    }

    function wrapModAssign(node, base, offset, op, rvalue) {
        if (!Config.INSTR_PROPERTY_BINARY_ASSIGNMENT || Config.INSTR_PROPERTY_BINARY_ASSIGNMENT(op, node.computed ? null : offset.value, node)) {
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
        } else {
            return node;
        }
    }

    function wrapMethodCall(node, base, offset, isCtor) {
        printIidToLoc(node);
        printSpecialIidToLoc(node.callee);
        var ret = replaceInExpr(
            logMethodCallFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + (isCtor ? "true" : "false") + ")",
            getIid(),
            base,
            offset
        );
        transferLoc(ret, node.callee);
        return ret;
    }

    function wrapFunCall(node, ast, isCtor) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logFunCallFunName + "(" + RP + "1, " + RP + "2, " + (isCtor ? "true" : "false") + ")",
            getIid(),
            ast
        );
        transferLoc(ret, node.callee);
        return ret;
    }

    function wrapGetField(node, base, offset) {
        if (!Config.INSTR_GETFIELD || Config.INSTR_GETFIELD(node.computed ? null : offset.value, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                    logGetFieldFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
                getIid(),
                base,
                offset
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapRead(node, name, val, isReUseIid, isGlobal, isPseudoGlobal) {
        if (!Config.INSTR_READ || Config.INSTR_READ(name, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                    logReadFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + (isGlobal ? "true" : "false") + "," + (isPseudoGlobal ? "true" : "false") + ")",
                isReUseIid ? getPrevIidNoInc() : getIid(),
                name,
                val
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
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
        var ret;

        if (name !== 'location') {
            ret = replaceInExpr(
                "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + name + "=" + RP + "2) : (" + name + "=" + RP + "3)))",
                createIdentifierAst(name),
                wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true, true),
                wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true, true)
            );
        } else {
            ret = replaceInExpr(
                "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + RP + "2) : (" + RP + "3)))",
                createIdentifierAst(name),
                wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true, true),
                wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true, true)
            );
        }
        transferLoc(ret, node);
        return ret;
    }

    function wrapWrite(node, name, val, lhs, isGlobal, isPseudoGlobal) {
        if (!Config.INSTR_WRITE || Config.INSTR_WRITE(name, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                    logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (isGlobal ? "true" : "false") + "," + (isPseudoGlobal ? "true" : "false") + ")",
                getIid(),
                name,
                val,
                lhs
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapWriteWithUndefinedCheck(node, name, val, lhs) {
        if (!Config.INSTR_WRITE || Config.INSTR_WRITE(name, node)) {
            printIidToLoc(node);
//        var ret2 = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
            var ret = replaceInExpr(
                    logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + logIFunName + "(typeof(" + lhs.name + ")==='undefined'?undefined:" + lhs.name + "), true, true)",
                getIid(),
                name,
                val
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapRHSOfModStore(node, left, right, op) {
        var ret = replaceInExpr(RP + "1 " + op + " " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function makeNumber(node, left) {
        var ret = replaceInExpr(" + " + RP + "1 ", left);
        transferLoc(ret, node);
        return ret;
    }

    function wrapLHSOfModStore(node, left, right) {
        var ret = replaceInExpr(RP + "1 = " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function ifObjectExpressionHasGetterSetter(node) {
        if (node.type === "ObjectExpression") {
            var kind, len = node.properties.length;
            for (var i = 0; i < len; i++) {
                if ((kind = node.properties[i].kind) === 'get' || kind === 'set') {
                    return true;
                }
            }
        }
        return false;
    }

    var dummyFun = function () {
    };
    var dummyObject = {};
    var dummyArray = [];

    function getLiteralValue(funId, node) {
        if (node.name === "undefined") {
            return undefined;
        } else if (node.name === "NaN") {
            return NaN;
        } else if (node.name === "Infinity") {
            return Infinity;
        }
        switch (funId) {
            case N_LOG_NUMBER_LIT:
            case N_LOG_STRING_LIT:
            case N_LOG_NULL_LIT:
            case N_LOG_REGEXP_LIT:
            case N_LOG_BOOLEAN_LIT:
                return node.value;
            case N_LOG_ARRAY_LIT:
                return dummyArray;
            case N_LOG_FUNCTION_LIT:
                return dummyFun;
            case N_LOG_OBJECT_LIT:
                return dummyObject;
        }
        throw new Error(funId + " not known");
    }

    function wrapLiteral(node, ast, funId) {
        if (!Config.INSTR_LITERAL || Config.INSTR_LITERAL(getLiteralValue(funId, node), node)) {
            printIidToLoc(node);
            var hasGetterSetter = ifObjectExpressionHasGetterSetter(node);
            var ret = replaceInExpr(
                    logLitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + hasGetterSetter + ")",
                getIid(),
                ast,
                createLiteralAst(funId)
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
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
        printIidToLoc(ast);
        var ret = replaceInExpr(
            instrumentCodeFunName + "(" + astUtil.JALANGI_VAR + ".getConcrete(" + RP + "1), {wrapProgram: false, isEval: true}," + RP + "2).code",
            ast,
            getIid()
        );
        transferLoc(ret, ast);
        return ret;
    }

    function wrapUnaryOp(node, argument, operator) {
        if (!Config.INSTR_UNARY || Config.INSTR_UNARY(operator, node)) {
            printOpIidToLoc(node);
            var ret = replaceInExpr(
                    logUnaryOpFunName + "(" + RP + "1," + RP + "2," + RP + "3)",
                getOpIid(),
                createLiteralAst(operator),
                argument
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapBinaryOp(node, left, right, operator) {
        if (!Config.INSTR_BINARY || Config.INSTR_BINARY(operator, operator)) {
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
        } else {
            return node;
        }
    }

    function wrapLogicalAnd(node, left, right) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("&&", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                    logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + RP + "3:" + logLastFunName + "()",
                getCondIid(),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapLogicalOr(node, left, right) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("||", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                    logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + logLastFunName + "():" + RP + "3",
                getCondIid(),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapSwitchDiscriminant(node, discriminant) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("switch", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                    logSwitchLeftFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                discriminant
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapSwitchTest(node, test) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("switch", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                    logSwitchRightFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                test
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapConditional(node, test) {
        if (node === null) {
            return node;
        } // to handle for(;;) ;

        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("other", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                    logConditionalFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                test
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }

    }

//    function createCallWriteAsStatement(node, name, val) {
//        printIidToLoc(node);
//        var ret = replaceInStatement(
//            logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
//            getIid(),
//            name,
//            val
//        );
//        transferLoc(ret[0].expression, node);
//        return ret;
//    }

    function createCallInitAsStatement(node, name, val, isArgumentSync, lhs) {
        printIidToLoc(node);
        var ret;

        if (isArgumentSync)
            ret = replaceInStatement(
                RP + "1 = " + logInitFunName + "(" + RP + "2, " + RP + "3, " + RP + "4, " + isArgumentSync + ", false)",
                lhs,
                getIid(),
                name,
                val
            );
        else
            ret = replaceInStatement(
                logInitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + isArgumentSync + ", false)",
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
            logFunctionEnterFunName + "(" + RP + "1,arguments.callee, this, arguments)",
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

    function wrapForInBody(node, body, name) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            "function n() { " + logInitFunName + "(" + RP + "1, '" + name + "'," + name + ",false, true);\n {" + RP + "2}}", getIid(), [body]);

        ret = ret[0].body;
        transferLoc(ret, node);
        return ret;
    }

    function wrapScriptBodyWithTryCatch(node, body) {
        printIidToLoc(node);
        var iid1 = getIid();
        printIidToLoc(node);
        var l = labelCounter++;
        var ret = replaceInStatement(
            "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + astUtil.JALANGI_VAR +
                "e) { //console.log(" + astUtil.JALANGI_VAR + "e); console.log(" +
                astUtil.JALANGI_VAR + "e.stack);\n  " + logUncaughtExceptionFunName + "(" + RP + "2," + astUtil.JALANGI_VAR +
                "e); } finally { if (" + logScriptExitFunName + "(" +
                RP + "3)) continue jalangiLabel" + l + ";\n else \n  break jalangiLabel" + l + ";\n }\n }}", body,
            iid1,
            getIid()
        );
        //console.log(JSON.stringify(ret));

        ret = ret[0].body.body;
        transferLoc(ret[0], node);
        return ret;
    }

    function wrapFunBodyWithTryCatch(node, body) {
        printIidToLoc(node);
        var iid1 = getIid();
        printIidToLoc(node);
        var l = labelCounter++;
        var ret = replaceInStatement(
            "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + astUtil.JALANGI_VAR +
                "e) { //console.log(" + astUtil.JALANGI_VAR + "e); console.log(" +
                astUtil.JALANGI_VAR + "e.stack);\n " + logUncaughtExceptionFunName + "(" + RP + "2," + astUtil.JALANGI_VAR +
                "e); } finally { if (" + logFunctionReturnFunName + "(" +
                RP + "3)) continue jalangiLabel" + l + ";\n else \n  return " + logReturnAggrFunName + "();\n }\n }}", body,
            iid1,
            getIid()
        );
        //console.log(JSON.stringify(ret));

        ret = ret[0].body.body;
        transferLoc(ret[0], node);
        return ret;
    }

    function syncDefuns(node, scope, isScript) {
        var ret = [], ident;
        if (!isScript) {
            ident = createIdentifierAst("arguments");
            ret = ret.concat(createCallInitAsStatement(node,
                createLiteralAst("arguments"),
                ident,
                true,
                ident));
        }
        if (scope) {
            for (var name in scope.vars) {
                if (HOP(scope.vars, name)) {
                    if (scope.vars[name] === "defun") {
                        ident = createIdentifierAst(name);
                        ident.loc = scope.funLocs[name];
                        ret = ret.concat(createCallInitAsStatement(node,
                            createLiteralAst(name),
                            wrapLiteral(ident, ident, N_LOG_FUNCTION_LIT),
                            true,
                            ident));
                    }
                    if (scope.vars[name] === "arg") {
                        ident = createIdentifierAst(name);
                        ret = ret.concat(createCallInitAsStatement(node,
                            createLiteralAst(name),
                            ident,
                            true,
                            ident));
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


    var scope;


    function instrumentFunctionEntryExit(node, ast) {
        var body = createCallAsFunEnterStatement(node).
            concat(syncDefuns(node, scope, false)).concat(ast);
        return body;
    }

//    function instrumentFunctionEntryExit(node, ast) {
//        return wrapFunBodyWithTryCatch(node, ast);
//    }

    /**
     * instruments entry of a script.  Adds the script entry (J$.Se) callback,
     * and the J$.N init callbacks for locals.
     *
     */
    function instrumentScriptEntryExit(node, body0) {
        var modFile = (typeof instCodeFileName === "string") ?
            instCodeFileName :
            "internal";
        var body = createCallAsScriptEnterStatement(node, modFile).
            concat(syncDefuns(node, scope, true)).
            concat(body0);
        return body;
    }


    function getPropertyAsAst(ast) {
        return ast.computed ? ast.property : createLiteralAst(ast.property.name);
    }

    function instrumentCall(callAst, isCtor) {
        var ast = callAst.callee;
        var ret;
        if (ast.type === 'MemberExpression') {
            ret = wrapMethodCall(callAst, ast.object,
                getPropertyAsAst(ast),
                isCtor);
            return ret;
        } else if (ast.type === 'Identifier' && ast.name === "eval") {
            return ast;
        } else {
            ret = wrapFunCall(callAst, ast, isCtor);
            return ret;
        }
    }

    function instrumentStore(node) {
        var ret;
        if (node.left.type === 'Identifier') {
            if (scope.hasVar(node.left.name)) {
                ret = wrapWrite(node.right, createLiteralAst(node.left.name), node.right, node.left, false, scope.isGlobal(node.left.name));
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
            if (ast.name === astUtil.JALANGI_VAR ||
                ast.name === "eval") {
                return ast;
            } else if (scope.hasVar(ast.name)) {
                ret = wrapRead(ast, createLiteralAst(ast.name), ast, false, false, scope.isGlobal(ast.name));
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

    function instrumentLoadModStore(node, isNumber) {
        if (node.left.type === 'Identifier') {
            var tmp0 = instrumentLoad(node.left);
            if (isNumber) {
                tmp0 = makeNumber(node, instrumentLoad(tmp0));
            }
            var tmp1 = wrapRHSOfModStore(node.right, tmp0, node.right, node.operator.substring(0, node.operator.length - 1));

            var tmp2;
            if (scope.hasVar(node.left.name)) {
                tmp2 = wrapWrite(node.right, createLiteralAst(node.left.name), tmp1, node.left, false, scope.isGlobal(node.left.name));
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
        return instrumentLoadModStore(ret, true);
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


    // Should 'Program' nodes in the AST be wrapped with prefix code to load libraries,
    // code to indicate script entry and exit, etc.?
    // we need this flag since when we're instrumenting eval'd code, the code is parsed
    // as a top-level 'Program', but the wrapping code may not be syntactically valid in 
    // the surrounding context, e.g.:
    //    var y = eval("x + 1");
    var wrapProgramNode = true;

    function setScope(node) {
        scope = node.scope;
    }

    var visitorRRPre = {
        'Program':setScope,
        'FunctionDeclaration':setScope,
        'FunctionExpression':setScope
    };

    var visitorRRPost = {
        'Literal':function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {

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
            if (wrapProgramNode) {
                var ret = instrumentScriptEntryExit(node, node.body);
                node.body = ret;

            }
            scope = scope.parent;
            return node;
        },
        "VariableDeclaration":function (node) {
            var declarations = MAP(node.declarations, function (def) {
                if (def.init !== null) {
                    var init = wrapWrite(def.init, createLiteralAst(def.id.name), def.init, def.id, false, scope.isGlobal(def.id.name));
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
                callee:instrumentCall(node, true),
                'arguments':node.arguments
            };
            transferLoc(ret, node);
            return ret;
//            var ret1 = wrapLiteral(node, ret, N_LOG_OBJECT_LIT);
//            return ret1;
        },
        "CallExpression":function (node) {
            var isEval = node.callee.type === 'Identifier' && node.callee.name === "eval";
            var callee = instrumentCall(node, false);
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
            if (context === astUtil.CONTEXT.GETTER || context === astUtil.CONTEXT.SETTER) {
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
            if (context === astUtil.CONTEXT.RHS) {
                var ret = instrumentLoad(node);
                return ret;
            } else {
                return node;
            }
        },
        'MemberExpression':function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {
                var ret = instrumentLoad(node);
                return ret;
            } else {
                return node;
            }
        },
        "ForInStatement":function (node) {
            var ret = wrapHash(node.right, node.right);
            node.right = ret;
            var name;
            if (node.left.type === 'VariableDeclaration') {
                name = node.left.declarations[0].id.name;
            } else {
                name = node.left.name;
            }
            node.body = wrapForInBody(node, node.body, name);
            return node;
        },
        "ReturnStatement":function (node) {
            var ret = wrapReturn(node, node.argument);
            node.argument = ret;
            return node;
        }
    };

    function funCond(node) {
        var ret = wrapConditional(node.test, node.test);
        node.test = ret;
        return node;
    }


    var visitorOps = {
        "Program":function (node) {
            if (wrapProgramNode) {
                var body = wrapScriptBodyWithTryCatch(node, node.body);
//                var ret = prependScriptBody(node, body);
                node.body = body;

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
            if (node.operator === "void") {
                return node;
            } else if (node.operator === "delete") {
                if (node.argument.object) {
                    ret = wrapBinaryOp(node, node.argument.object, getPropertyAsAst(node.argument), node.operator);
                } else {
                    return node;
                }
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

        Scope.prototype.hasOwnVar = function (name) {
            var s = this;
            if (s && HOP(s.vars, name))
                return s.vars[name];
            return null;
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

        Scope.prototype.isGlobal = function (name) {
            var s = this;
            while (s !== null) {
                if (HOP(s.vars, name) && s.parent !== null) {
                    return false;
                }
                s = s.parent;
            }
            return true;
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

        // rename arguments to J$_arguments
        var fromName = 'arguments';
        var toName = astUtil.JALANGI_VAR + "_arguments";

        function handleFun(node) {
            var oldScope = currentScope;
            currentScope = new Scope(currentScope);
            node.scope = currentScope;
            if (node.type === 'FunctionDeclaration') {
                oldScope.addVar(node.id.name, "defun", node.loc);
                MAP(node.params, function (param) {
                    if (param.name === fromName) {         // rename arguments to J$_arguments
                        param.name = toName;
                    }
                    currentScope.addVar(param.name, "arg");
                });
            } else if (node.type === 'FunctionExpression') {
                if (node.id !== null) {
                    currentScope.addVar(node.id.name, "lambda");
                }
                MAP(node.params, function (param) {
                    if (param.name === fromName) {         // rename arguments to J$_arguments
                        param.name = toName;
                    }
                    currentScope.addVar(param.name, "arg");
                });
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
        };

        var visitorPost = {
            'Program':popScope,
            'FunctionDeclaration':popScope,
            'FunctionExpression':popScope,
            'Identifier':function (node, context) {         // rename arguments to J$_arguments
                if (context === astUtil.CONTEXT.RHS && node.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.name = toName;
                }
                return node;
            },
            "UpdateExpression":function (node) {         // rename arguments to J$_arguments
                if (node.argument.type === 'Identifier' && node.argument.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.argument.name = toName;
                }
                return node;
            },
            "AssignmentExpression":function (node) {         // rename arguments to J$_arguments
                if (node.left.type === 'Identifier' && node.left.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.left.name = toName;
                }
                return node;
            }

        };
        astUtil.transformAst(ast, visitorPost, visitorPre);
    }


    // START of Liang Gong's AST post-processor
    function hoistFunctionDeclaration(ast, hoisteredFunctions) {
        var key, child, startIndex = 0;
        if (ast.body) {
            var newBody = [];
            if (ast.body.length > 0) { // do not hoister function declaration before J$.Fe or J$.Se
                if (ast.body[0].type === 'ExpressionStatement') {
                    if (ast.body[0].expression.type === 'CallExpression') {
                        if (ast.body[0].expression.callee.object &&
                            ast.body[0].expression.callee.object.name === 'J$'
                            && ast.body[0].expression.callee.property
                            &&
                            (ast.body[0].expression.callee.property.name === 'Se' || ast.body[0].
                                expression.callee.property.name === 'Fe')) {

                            newBody.push(ast.body[0]);
                            startIndex = 1;
                        }
                    }
                }
            }
            for (var i = startIndex; i < ast.body.length; i++) {

                if (ast.body[i].type === 'FunctionDeclaration') {
                    newBody.push(ast.body[i]);
                    if (newBody.length !== i + 1) {
                        hoisteredFunctions.push(ast.body[i].id.name);
                    }
                }
            }
            for (var i = startIndex; i < ast.body.length; i++) {
                if (ast.body[i].type !== 'FunctionDeclaration') {
                    newBody.push(ast.body[i]);
                }
            }
            while (ast.body.length > 0) {
                ast.body.pop();
            }
            for (var i = 0; i < newBody.length; i++) {
                ast.body.push(newBody[i]);
            }
        } else {
            //console.log(typeof ast.body);
        }
        for (key in ast) {
            if (ast.hasOwnProperty(key)) {
                child = ast[key];
                if (typeof child === 'object' && child !== null && key !==
                    "scope") {
                    hoistFunctionDeclaration(child, hoisteredFunctions);
                }

            }
        }

        return ast;
    }

    // END of Liang Gong's AST post-processor

    function transformString(code, visitorsPost, visitorsPre) {
//         StatCollector.resumeTimer("parse");
//        console.time("parse")
//        var newAst = esprima.parse(code, {loc:true, range:true});
        var newAst = acorn.parse(code, { locations:true });
//        console.timeEnd("parse")
//        StatCollector.suspendTimer("parse");
//        StatCollector.resumeTimer("transform");
//        console.time("transform")
        addScopes(newAst);
        var len = visitorsPost.length;
        for (var i = 0; i < len; i++) {
            newAst = astUtil.transformAst(newAst, visitorsPost[i], visitorsPre[i], astUtil.CONTEXT.RHS);
        }
//        console.timeEnd("transform")
//        StatCollector.suspendTimer("transform");
//        console.log(JSON.stringify(newAst,null,"  "));
        return newAst;
    }

    // if this string is discovered inside code passed to instrumentCode(),
    // the code will not be instrumented
    var noInstr = "// JALANGI DO NOT INSTRUMENT";

    function makeInstCodeFileName(name) {
        return name.replace(/.js$/, FILESUFFIX1 + ".js");
    }

    /**
     * Instruments the provided code.
     *
     * @param {string} code The code to instrument
     * @param {{wrapProgram: boolean, isEval: boolean }} options
     *    Options for code generation:
     *      'wrapProgram': Should the instrumented code be wrapped with prefix code to load libraries,
     * code to indicate script entry and exit, etc.? should be false for code being eval'd
     *      'isEval': is the code being instrumented for an eval?
     * @return {{code:string, instAST: object}} an object whose 'code' property is the instrumented code string,
     * and whose 'instAST' property is the AST for the instrumented code
     *
     */
    function instrumentCode(code, options, iid) {
        var tryCatchAtTop = options.wrapProgram,
            isEval = options.isEval,
            instCodeCallback = isEval && sandbox.analysis && sandbox.analysis.instrumentCode;
        if (typeof  code === "string") {
            if (iid && sandbox.analysis && sandbox.analysis.instrumentCodePre) {
                code = sandbox.analysis.instrumentCodePre(iid, code);
            }
            if (code.indexOf(noInstr) < 0 && !(isEval && sandbox.noInstrEval)) {
                // this is a call in eval
                initializeIIDCounters(isEval);
                wrapProgramNode = tryCatchAtTop;
                var newAst = transformString(code, [visitorRRPost, visitorOps], [visitorRRPre, undefined]);
                // post-process AST to hoist function declarations (required for Firefox)
                var hoistedFcts = [];
                newAst = hoistFunctionDeclaration(newAst, hoistedFcts);
//                StatCollector.resumeTimer("generate");
//                console.time("generate")
                var newCode = escodegen.generate(newAst);
//                console.timeEnd("generate")
//                StatCollector.suspendTimer("generate");


                var ret = newCode + "\n" + noInstr + "\n";
                if (instCodeCallback) {
                    sandbox.analysis.instrumentCode(iid || -1, newAst);
                }
                return { code: ret, instAST: newAst, iidSourceInfo: iidSourceInfo };
            } else {
                return {code:code };
            }
        } else {
            return {code:code};
        }
    }

    function instrumentAux(code, args) {
        orig2Inst = {};
        iidSourceInfo = {};
        if (!args.dirIIDFile) {
            throw new Error("must provide dirIIDFile");
        }
        curFileName = args.filename;
        instCodeFileName = args.instFileName;
        if (curFileName && instCodeFileName) {
            orig2Inst[curFileName] = instCodeFileName;
        }

        loadInitialIID(args.dirIIDFile, args.initIID);

        var wrapProgram = HOP(args, 'wrapProgram') ? args.wrapProgram : true;
        var codeAndMData = instrumentCode(code, {wrapProgram:wrapProgram, isEval:false });

        storeInitialIID(args.dirIIDFile);
        writeIIDMapFile(args.dirIIDFile, args.initIID, args.inlineIID);
        return codeAndMData;
    }

    function instrumentFile() {
        var argparse = require('argparse');
        var parser = new argparse.ArgumentParser({
            addHelp:true,
            description:"Command-line utility to perform instrumentation"
        });
        parser.addArgument(['--initIID'], { help:"Initialize IIDs to 0", action:'storeTrue'});
        parser.addArgument(['--noInstrEval'], { help:"Do not instrument strings passed to evals", action:'storeTrue'});
        parser.addArgument(['--inlineIID'], { help:"Inline IIDs in the instrumented file", action:'storeTrue'});
        parser.addArgument(['--dirIIDFile'], { help:"Directory containing " + SMAP_FILE_NAME + " and " + INITIAL_IID_FILE_NAME, defaultValue:process.cwd() });
        parser.addArgument(['--out'], { help:"Instrumented file name (with path).  The default is to append _jalangi_ to the original JS file name", defaultValue:undefined });
        parser.addArgument(['file'], {
            help:"file to instrument",
            nargs:1
        });
        var args = parser.parseArgs();

        if (args.file.length === 0) {
            console.error("must provide file to instrument");
            process.exit(1);
        }

        var fname = args.file[0];
        args.filename = sanitizePath(require('path').resolve(process.cwd(), fname));
        args.instFileName = args.out ? args.out : makeInstCodeFileName(fname);

        var codeAndMData = instrumentAux(getCode(fname), args);
//        console.time("save")
        saveCode(codeAndMData.code, args.inlineIID, args.noInstrEval);
//        StatCollector.printStats();
//        console.timeEnd("save")
    }


    if (typeof exports !== 'undefined' && this.exports !== exports) {
        exports.instrumentCodeDeprecated = instrumentAux;
    }

    if (typeof window === 'undefined' && (typeof require !== "undefined") && require.main === module) {
        instrumentFile();
    } else {
        sandbox.instrumentCode = instrumentCode;
    }
}((typeof J$ === 'undefined') ? J$ = {} : J$));




